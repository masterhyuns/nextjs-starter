/**
 * 인증 API 명세
 *
 * 왜 이렇게 구성했는가?
 * - API 엔드포인트를 순수 데이터 객체로 정의
 * - useApiClient.fetch()에서 실행
 * - URL, 메서드, 파라미터를 한 곳에서 관리
 * - 타입 안전성 확보
 *
 * 사용 방식:
 * 1. 컴포넌트: useApiClient().fetch(authApi.login({ email, password }))
 * 2. Store: createApiClient(baseURL).post('/auth/login', params) - 직접 호출
 */

import type { ApiResponse, ApiSpec } from '@/lib/types';
import type { LoginParams, LoginResponse, RefreshTokenResponse } from './types';
import type { User, CreateUserParams } from './types';
import { createApiClient } from '@/lib/api-client';
import { AUTH_CONFIG } from '@/lib/constants';

/**
 * Auth API 명세 객체
 *
 * 왜 객체로 정의하는가?
 * - useApiClient.fetch()에 전달하기 위함
 * - URL, 메서드, 파라미터를 한 곳에서 관리
 * - 순수 데이터 객체 (실행 로직 없음)
 *
 * 사용 예시:
 * ```ts
 * const { fetch, loading } = useApiClient<LoginResponse>();
 * const result = await fetch(authApi.login({ email, password }));
 * ```
 */
export const authApi = {
  /**
   * 로그인 API 명세
   *
   * 쿠키 기반 인증:
   * - 서버에서 httpOnly 쿠키로 토큰 관리
   * - 프론트엔드는 user 정보만 반환받음
   */
  login: (params: LoginParams): ApiSpec => ({
    method: 'POST',
    url: '/auth/login',
    data: params,
  }),

  /**
   * 회원가입 API 명세
   */
  signup: (params: CreateUserParams): ApiSpec => ({
    method: 'POST',
    url: '/auth/signup',
    data: params,
  }),

  /**
   * 로그아웃 API 명세
   *
   * 쿠키 기반 인증:
   * - 서버에서 httpOnly 쿠키 삭제
   * - 프론트엔드는 API 호출만 수행
   */
  logout: {
    method: 'POST',
    url: '/auth/logout',
  } as ApiSpec,

  /**
   * 토큰 갱신 API 명세
   *
   * 쿠키 기반 인증:
   * - 서버에서 자동으로 refresh token 쿠키 확인
   * - 새로운 토큰을 httpOnly 쿠키로 재설정
   */
  refreshToken: (token: string): ApiSpec => ({
    method: 'POST',
    url: '/auth/refresh',
    data: { refreshToken: token },
  }),

  /**
   * 현재 사용자 정보 조회 API 명세
   *
   * 쿠키 기반 인증:
   * - credentials: 'include'로 쿠키 자동 전송
   * - 200 OK: 로그인 상태
   * - 401 Unauthorized: 비로그인 상태 → SSO 로그인 페이지로 리다이렉트
   */
  getCurrentUser: {
    method: 'GET',
    url: AUTH_CONFIG.API_USER_ME,
  } as ApiSpec,
} as const;

// ==================== Store용 직접 호출 함수 (훅 사용 불가능한 경우) ====================

/**
 * 현재 사용자 정보 조회 (Store용)
 *
 * 왜 필요한가?
 * - Store (Zustand)에서는 훅(useApiClient)을 사용할 수 없음
 * - baseURL을 파라미터로 받아서 직접 호출
 *
 * 사용 예시:
 * ```ts
 * // entities/auth/store.ts
 * loadUser: async (baseURL: string) => {
 *   const result = await getCurrentUser(baseURL);
 *   if (result.success) {
 *     set({ user: result.data });
 *   }
 * }
 * ```
 */
export const getCurrentUser = async (baseURL?: string): Promise<ApiResponse<User>> => {
  try {
    const client = baseURL ? createApiClient(baseURL) : createApiClient(AUTH_CONFIG.SSO_LOGIN_URL);

    // TODO: 실제 배포 시에는 Mock 제거하고 실제 API 호출
    // return await client.get<User>(AUTH_CONFIG.API_USER_ME);

    // Mock 응답 (개발용)
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: '테스트 사용자',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: mockUser,
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
 * 로그인 (Store용)
 */
export const login = async (params: LoginParams): Promise<ApiResponse<LoginResponse>> => {
  try {
    // TODO: 실제 API 호출
    // const client = createApiClient(baseURL);
    // return await client.post<LoginResponse>('/auth/login', params);

    // Mock 응답
    return mockLogin(params);
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
 * 회원가입 (Store용)
 */
export const signup = async (params: CreateUserParams): Promise<ApiResponse<User>> => {
  try {
    // TODO: 실제 API 호출
    // const client = createApiClient(baseURL);
    // return await client.post<User>('/auth/signup', params);

    // Mock 응답
    return mockSignup(params);
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
 * 로그아웃 (Store용)
 */
export const logout = async (): Promise<ApiResponse<void>> => {
  try {
    // TODO: 실제 API 호출
    // const client = createApiClient(baseURL);
    // return await client.post<void>('/auth/logout');

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

// ==================== Mock Functions (개발용) ====================

/**
 * Mock 로그인
 */
const mockLogin = (params: LoginParams): ApiResponse<LoginResponse> => {
  if (params.email === 'test@example.com' && params.password === 'Password123!') {
    const mockUser: User = {
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
 * Mock 회원가입
 */
const mockSignup = (params: CreateUserParams): ApiResponse<User> => {
  const mockUser: User = {
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
