/**
 * 인증 상태 관리 스토어 (Zustand)
 *
 * 왜 Zustand를 사용하는가?
 * - Redux보다 간단한 API
 * - 보일러플레이트 코드 최소화
 * - TypeScript 지원 우수
 * - 작은 번들 크기
 * - React Context API의 불필요한 리렌더링 문제 해결
 *
 * 왜 이렇게 구조화했는가?
 * - 상태(State)와 액션(Actions) 분리
 * - Clean Architecture와 통합 (Use Case 호출)
 * - 타입 안전성 확보
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserEntity } from '@/domain/entities/user.entity';
import { LoginUseCase, SignupUseCase } from '@/domain/use-cases/auth';
import type { LoginUseCaseParams, SignupUseCaseParams } from '@/domain/use-cases/auth';
import { authRepository } from '@/infrastructure/repositories/auth.repository';
import type { AsyncState } from '@/shared/types';

/**
 * 인증 스토어 상태 인터페이스
 *
 * 왜 인터페이스로 분리하는가?
 * - 타입 재사용
 * - 문서화 역할
 * - IDE 자동완성 지원
 */
interface AuthState {
  /** 현재 로그인한 사용자 (null이면 미로그인) */
  user: UserEntity | null;
  /** 로그인 상태 여부 */
  isAuthenticated: boolean;
  /** 비동기 작업 상태 (로딩, 성공, 실패) */
  status: AsyncState;
  /** 에러 메시지 */
  error: string | null;
}

/**
 * 인증 스토어 액션 인터페이스
 *
 * 왜 상태와 액션을 분리하는가?
 * - 관심사의 분리 (SRP)
 * - 읽기 쉬운 코드
 * - 타입 추론 개선
 */
interface AuthActions {
  /**
   * 로그인
   *
   * 비즈니스 플로우:
   * 1. status를 'loading'으로 설정
   * 2. LoginUseCase 실행
   * 3. 성공 시 user 상태 업데이트
   * 4. 실패 시 error 상태 업데이트
   *
   * @param params - 로그인 파라미터
   * @returns 성공 여부
   */
  login: (params: LoginUseCaseParams) => Promise<boolean>;

  /**
   * 회원가입
   *
   * @param params - 회원가입 파라미터
   * @returns 성공 여부
   */
  signup: (params: SignupUseCaseParams) => Promise<boolean>;

  /**
   * 로그아웃
   */
  logout: () => Promise<void>;

  /**
   * 현재 사용자 정보 조회 (페이지 새로고침 시)
   */
  loadUser: () => Promise<void>;

  /**
   * 에러 초기화
   */
  clearError: () => void;
}

/**
 * 전체 스토어 타입
 */
type AuthStore = AuthState & AuthActions;

/**
 * Use Case 인스턴스 생성
 *
 * 왜 여기서 인스턴스화하는가?
 * - 의존성 주입 (DI)
 * - Repository를 Use Case에 주입
 * - 테스트 시 Mock Repository로 교체 가능
 */
const loginUseCase = new LoginUseCase(authRepository);
const signupUseCase = new SignupUseCase(authRepository);

/**
 * 인증 스토어 생성
 *
 * Zustand 미들웨어:
 * - persist: localStorage에 상태 저장 (새로고침 시 유지)
 * - devtools: Redux DevTools 연동 (디버깅)
 */
export const useAuthStore = create<AuthStore>()(
    persist(
      (set, get) => ({
        // ==================== 초기 상태 ====================
        user: null,
        isAuthenticated: false,
        status: 'idle',
        error: null,

        // ==================== 액션 ====================

        /**
         * 로그인 액션
         */
        login: async (params) => {
          // 1. 로딩 상태 시작
          set({ status: 'loading', error: null });

          try {
            // 2. Use Case 실행
            const result = await loginUseCase.execute(params);

            // 3. 성공 처리
            if (result.success && result.data) {
              set({
                user: result.data.user,
                isAuthenticated: true,
                status: 'success',
                error: null,
              });
              return true;
            }

            // 4. 실패 처리
            set({
              status: 'error',
              error: result.error || '로그인에 실패했습니다',
            });
            return false;
          } catch (error) {
            // 5. 예외 처리
            set({
              status: 'error',
              error: error instanceof Error ? error.message : '로그인에 실패했습니다',
            });
            return false;
          }
        },

        /**
         * 회원가입 액션
         */
        signup: async (params) => {
          set({ status: 'loading', error: null });

          try {
            const result = await signupUseCase.execute(params);

            if (result.success) {
              set({
                status: 'success',
                error: null,
              });
              return true;
            }

            set({
              status: 'error',
              error: result.error || '회원가입에 실패했습니다',
            });
            return false;
          } catch (error) {
            set({
              status: 'error',
              error: error instanceof Error ? error.message : '회원가입에 실패했습니다',
            });
            return false;
          }
        },

        /**
         * 로그아웃 액션
         */
        logout: async () => {
          try {
            await authRepository.logout();

            // 상태 초기화
            set({
              user: null,
              isAuthenticated: false,
              status: 'idle',
              error: null,
            });
          } catch (error) {
            console.error('[AuthStore] Logout error:', error);
            // 로그아웃은 에러가 발생해도 클라이언트 상태는 초기화
            set({
              user: null,
              isAuthenticated: false,
              status: 'idle',
              error: null,
            });
          }
        },

        /**
         * 사용자 정보 로드
         *
         * 언제 호출하는가?
         * - 앱 초기화 시 (App.tsx에서)
         * - 페이지 새로고침 후
         */
        loadUser: async () => {
          set({ status: 'loading' });

          try {
            const result = await authRepository.getCurrentUser();

            if (result.success && result.data) {
              set({
                user: result.data,
                isAuthenticated: true,
                status: 'success',
              });
            } else {
              set({
                user: null,
                isAuthenticated: false,
                status: 'idle',
              });
            }
          } catch (error) {
            set({
              user: null,
              isAuthenticated: false,
              status: 'idle',
            });
          }
        },

        /**
         * 에러 초기화
         */
        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'auth-storage', // localStorage 키 이름
        /**
         * 어떤 상태를 persist할 것인가?
         *
         * 왜 일부만 저장하는가?
         * - status, error는 일시적인 상태이므로 저장 불필요
         * - user만 저장하여 새로고침 시 복원
         */
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
);
