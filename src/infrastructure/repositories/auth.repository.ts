/**
 * 인증 Repository 구현체
 *
 * 왜 이렇게 구현했는가?
 * - 도메인 레이어에서 정의한 IAuthRepository 인터페이스 구현
 * - DIP (Dependency Inversion Principle) 적용
 * - 실제 API 통신 로직 구현
 * - Mock 데이터로 테스트 가능하도록 구현
 *
 * 프로덕션 환경에서는:
 * - API 엔드포인트를 실제 백엔드 URL로 변경
 * - 에러 처리 강화
 * - 재시도 로직 추가
 */

import type {
  IAuthRepository,
  LoginParams,
  LoginResponse,
  RefreshTokenResponse,
} from '@/domain/repositories/auth.repository.interface';
import type { UserEntity, CreateUserParams } from '@/domain/entities/user.entity';
import type { ApiResponse } from '@/shared/types';
import { apiClient } from '../api/api-client';
import { LocalStorage } from '../storage/local-storage';
import { setCookie, removeCookie } from '../storage/cookie';
import { STORAGE_KEYS } from '@/shared/constants';

/**
 * 인증 Repository 구현 클래스
 *
 * implements IAuthRepository:
 * - 인터페이스의 모든 메서드를 구현해야 함
 * - 타입스크립트 컴파일러가 검증
 * - 구현 누락 시 컴파일 에러 발생
 */
export class AuthRepository implements IAuthRepository {
  /**
   * 로그인
   *
   * 실제 구현 시:
   * - POST /api/auth/login
   * - 백엔드에서 JWT 토큰 발급
   * - 토큰을 localStorage에 저장
   *
   * 현재는 Mock 데이터로 시뮬레이션
   *
   * @param params - 로그인 파라미터
   * @returns 로그인 응답
   */
  login = async (params: LoginParams): Promise<ApiResponse<LoginResponse>> => {
    try {
      // 실제 API 호출 (프로덕션)
      // const response = await apiClient.post<LoginResponse>('/auth/login', params);

      // Mock 응답 (개발 환경)
      const mockResponse = this.mockLogin(params);

      // 성공 시 토큰 저장
      if (mockResponse.success && mockResponse.data) {
        this.saveTokens(mockResponse.data.accessToken, mockResponse.data.refreshToken);
        this.saveUser(mockResponse.data.user);
      }

      return mockResponse;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '로그인에 실패했습니다',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      };
    }
  };

  /**
   * 회원가입
   *
   * @param params - 회원가입 파라미터
   * @returns 생성된 사용자 정보
   */
  signup = async (params: CreateUserParams): Promise<ApiResponse<UserEntity>> => {
    try {
      // 실제 API 호출
      // const response = await apiClient.post<UserEntity>('/auth/signup', params);

      // Mock 응답
      const mockResponse = this.mockSignup(params);

      return mockResponse;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '회원가입에 실패했습니다',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      };
    }
  };

  /**
   * 로그아웃
   *
   * 비즈니스 로직:
   * 1. 서버에 로그아웃 요청 (리프레시 토큰 무효화)
   * 2. 로컬 토큰 삭제
   *
   * @returns 성공 여부
   */
  logout = async (): Promise<ApiResponse<void>> => {
    try {
      // 실제 API 호출
      // await apiClient.post('/auth/logout');

      // 로컬 토큰 삭제
      this.clearTokens();

      return {
        success: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '로그아웃에 실패했습니다',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      };
    }
  };

  /**
   * 토큰 갱신
   *
   * @param refreshToken - 리프레시 토큰
   * @returns 새로운 토큰 정보
   */
  refreshToken = async (refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> => {
    try {
      // 실제 API 호출
      // const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', { refreshToken });

      // Mock 응답
      const mockResponse: ApiResponse<RefreshTokenResponse> = {
        success: true,
        data: {
          accessToken: 'new-access-token-' + Date.now(),
          refreshToken: 'new-refresh-token-' + Date.now(),
          expiresIn: 3600,
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      };

      if (mockResponse.success && mockResponse.data) {
        this.saveTokens(mockResponse.data.accessToken, mockResponse.data.refreshToken);
      }

      return mockResponse;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '토큰 갱신에 실패했습니다',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      };
    }
  };

  /**
   * 현재 사용자 정보 조회
   *
   * @returns 사용자 정보
   */
  getCurrentUser = async (): Promise<ApiResponse<UserEntity>> => {
    try {
      // 실제 API 호출
      // const response = await apiClient.get<UserEntity>('/auth/me');

      // Mock 응답 (로컬 저장소에서 가져오기)
      const user = LocalStorage.getItem<UserEntity>(STORAGE_KEYS.USER_INFO);

      if (!user) {
        return {
          success: false,
          error: '로그인이 필요합니다',
          statusCode: 401,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: user,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '사용자 정보 조회에 실패했습니다',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      };
    }
  };

  /**
   * 비밀번호 재설정 요청
   *
   * @param email - 사용자 이메일
   * @returns 성공 여부
   */
  requestPasswordReset = async (email: string): Promise<ApiResponse<void>> => {
    try {
      // 실제 API 호출
      // await apiClient.post('/auth/password-reset/request', { email });

      return {
        success: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '비밀번호 재설정 요청에 실패했습니다',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      };
    }
  };

  /**
   * 비밀번호 재설정
   *
   * @param token - 재설정 토큰
   * @param newPassword - 새 비밀번호
   * @returns 성공 여부
   */
  resetPassword = async (token: string, newPassword: string): Promise<ApiResponse<void>> => {
    try {
      // 실제 API 호출
      // await apiClient.post('/auth/password-reset/confirm', { token, newPassword });

      return {
        success: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '비밀번호 재설정에 실패했습니다',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      };
    }
  };

  /**
   * 이메일 인증
   *
   * @param token - 인증 토큰
   * @returns 성공 여부
   */
  verifyEmail = async (token: string): Promise<ApiResponse<void>> => {
    try {
      // 실제 API 호출
      // await apiClient.post('/auth/verify-email', { token });

      return {
        success: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '이메일 인증에 실패했습니다',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      };
    }
  };

  // ==================== Private 헬퍼 메서드 ====================

  /**
   * 토큰 저장
   *
   * 왜 localStorage와 쿠키 모두에 저장하는가?
   * - localStorage: 클라이언트 측 상태 관리용 (Zustand persist)
   * - Cookie: 서버 사이드 인증 체크용 (middleware)
   *
   * @param accessToken - 액세스 토큰
   * @param refreshToken - 리프레시 토큰
   */
  private saveTokens = (accessToken: string, refreshToken: string): void => {
    // localStorage에 저장 (클라이언트 전용)
    LocalStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    LocalStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

    // 쿠키에 저장 (SSR 인증용)
    setCookie('auth-token', accessToken, {
      expires: 7, // 7일
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  };

  /**
   * 사용자 정보 저장
   *
   * @param user - 사용자 엔티티
   */
  private saveUser = (user: UserEntity): void => {
    LocalStorage.setItem(STORAGE_KEYS.USER_INFO, user);
  };

  /**
   * 토큰 삭제
   *
   * 로그아웃 시 localStorage와 쿠키 모두 삭제
   */
  private clearTokens = (): void => {
    // localStorage 삭제
    LocalStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    LocalStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    LocalStorage.removeItem(STORAGE_KEYS.USER_INFO);

    // 쿠키 삭제
    removeCookie('auth-token');
  };

  /**
   * Mock 로그인 응답
   *
   * 개발 환경에서 사용
   * 실제 백엔드 없이 테스트 가능
   *
   * @param params - 로그인 파라미터
   * @returns Mock 응답
   */
  private mockLogin = (params: LoginParams): ApiResponse<LoginResponse> => {
    // 간단한 검증 (데모용)
    if (params.email === 'test@example.com' && params.password === 'Password123!') {
      const mockUser: UserEntity = {
        id: '1',
        email: params.email,
        name: '테스트 사용자',
        role: 'user',
        status: 'active',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: {
          user: mockUser,
          accessToken: 'mock-access-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          expiresIn: 3600,
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      error: '이메일 또는 비밀번호가 올바르지 않습니다',
      statusCode: 401,
      timestamp: new Date().toISOString(),
    };
  };

  /**
   * Mock 회원가입 응답
   *
   * @param params - 회원가입 파라미터
   * @returns Mock 응답
   */
  private mockSignup = (params: CreateUserParams): ApiResponse<UserEntity> => {
    const mockUser: UserEntity = {
      id: Date.now().toString(),
      email: params.email,
      name: params.name,
      role: params.role || 'user',
      status: 'pending',
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: mockUser,
      statusCode: 201,
      timestamp: new Date().toISOString(),
    };
  };
}

/**
 * Repository 싱글톤 인스턴스 내보내기
 *
 * 왜 싱글톤을 사용하는가?
 * - 애플리케이션 전체에서 하나의 인스턴스만 사용
 * - 상태 일관성 유지
 * - 메모리 효율성
 */
export const authRepository = new AuthRepository();
