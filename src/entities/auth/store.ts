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
 * - 타입 안전성 확보
 * - API 함수를 직접 호출 (프론트엔드 전용 구조)
 */

import { create } from 'zustand';
import type { User, LoginParams, CreateUserParams } from './types';
import * as authAPI from './api';
import type { AsyncState } from '@/lib/types';
import { AUTH_CONFIG } from '@/lib/constants';

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
  user: User | null;
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
   * 2. API 호출
   * 3. 성공 시 user 상태 업데이트
   * 4. 실패 시 error 상태 업데이트
   *
   * @param params - 로그인 파라미터
   * @returns 성공 여부
   */
  login: (params: LoginParams) => Promise<boolean>;

  /**
   * 회원가입
   *
   * @param params - 회원가입 파라미터
   * @returns 성공 여부
   */
  signup: (params: CreateUserParams) => Promise<boolean>;

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
 * 인증 스토어 생성
 *
 * 왜 persist 미들웨어를 사용하지 않는가?
 * - 쿠키 기반 인증 사용 (서버에서 httpOnly 쿠키 관리)
 * - 새로고침 시 loadUser() API 호출로 인증 상태 복원
 * - localStorage에 민감한 정보 저장 금지 (XSS 방어)
 * - 순수 메모리 상태 관리만 수행
 */
export const useAuthStore = create<AuthStore>()((set) => ({
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
          // 2. API 호출
          const result = await authAPI.login(params);

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
          const result = await authAPI.signup(params);

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
          await authAPI.logout();

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
       * - 앱 초기화 시
       * - 페이지 새로고침 후
       *
       * SSO 인증 플로우:
       * 1. GET /api/user/me 호출 (mes-ticket 쿠키 자동 전송)
       * 2. 200 OK → 사용자 정보 저장
       * 3. 401 Unauthorized → SSO 로그인 페이지로 리다이렉트
       * 4. SSO 로그인 완료 → 원래 페이지로 복귀
       *
       * 무한 리다이렉트 방지:
       * - sessionStorage로 리다이렉트 추적
       * - SSO에서 돌아온 직후 재확인 방지
       */
      loadUser: async () => {
        // 무한 리다이렉트 방지: 이미 리다이렉트 중이면 중단
        if (typeof window !== 'undefined') {
          const isRedirecting = sessionStorage.getItem('auth_redirecting');
          if (isRedirecting === 'true') {
            // SSO에서 돌아왔으나 여전히 401이면 리다이렉트 플래그 제거
            sessionStorage.removeItem('auth_redirecting');
          }
        }

        set({ status: 'loading' });

        try {
          const result = await authAPI.getCurrentUser();

          if (result.success && result.data) {
            // 200 OK: 사용자 정보 저장
            set({
              user: result.data,
              isAuthenticated: true,
              status: 'success',
            });

            // 리다이렉트 플래그 제거
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('auth_redirecting');
            }
          } else if (result.statusCode === 401) {
            // 401 Unauthorized: SSO 로그인 페이지로 리다이렉트
            if (typeof window !== 'undefined') {
              const isRedirecting = sessionStorage.getItem('auth_redirecting');

              // 이미 리다이렉트 중이면 무한 루프 방지
              if (isRedirecting !== 'true') {
                sessionStorage.setItem('auth_redirecting', 'true');

                const currentUrl = window.location.href;
                const ssoUrl = `${AUTH_CONFIG.SSO_LOGIN_URL}?redirect=${encodeURIComponent(currentUrl)}`;

                console.log('[AuthStore] 401 Unauthorized, redirecting to SSO:', ssoUrl);
                window.location.href = ssoUrl;
                return; // 리다이렉트 중이므로 상태 업데이트 불필요
              }
            }

            set({
              user: null,
              isAuthenticated: false,
              status: 'idle',
            });
          } else {
            // 기타 에러
            set({
              user: null,
              isAuthenticated: false,
              status: 'idle',
              error: result.error || '사용자 정보 조회에 실패했습니다',
            });
          }
        } catch (error) {
          console.error('[AuthStore] loadUser error:', error);
          set({
            user: null,
            isAuthenticated: false,
            status: 'idle',
            error: error instanceof Error ? error.message : '사용자 정보 조회에 실패했습니다',
          });
        }
      },

      /**
       * 에러 초기화
       */
      clearError: () => {
        set({ error: null });
      },
    })
);
