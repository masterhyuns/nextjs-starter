/**
 * 인증 API
 *
 * 왜 이렇게 구성했는가?
 * - 백엔드 API 엔드포인트별로 함수 분리
 * - 타입 안정성 확보
 * - 재사용 가능한 API 호출 함수
 *
 * 실제 사용 시:
 * - API_BASE_URL을 환경변수로 설정
 * - 각 함수의 엔드포인트를 실제 백엔드 URL로 변경
 */

import type { ApiResponse } from '@/lib/types';
import type { LoginParams, LoginResponse, RefreshTokenResponse } from './types';
import type { User, CreateUserParams } from './types';
import { apiClient } from '@/lib/api-client';
import { LocalStorage } from '@/lib/storage';
import { setCookie, removeCookie } from '@/lib/cookie';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
} as const;

/**
 * 로그인
 *
 * 실제 API 호출 예시:
 * ```ts
 * const response = await apiClient.post<LoginResponse>('/auth/login', params);
 * ```
 */
export const login = async (params: LoginParams): Promise<ApiResponse<LoginResponse>> => {
  try {
    // TODO: 실제 백엔드 API 엔드포인트로 변경
    // const response = await apiClient.post<LoginResponse>('/auth/login', params);

    // Mock 응답 (개발용)
    const mockResponse = mockLogin(params);

    // 성공 시 토큰 저장
    if (mockResponse.success && mockResponse.data) {
      saveTokens(mockResponse.data.accessToken, mockResponse.data.refreshToken);
      saveUser(mockResponse.data.user);
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
 */
export const signup = async (params: CreateUserParams): Promise<ApiResponse<User>> => {
  try {
    // TODO: 실제 API 호출
    // const response = await apiClient.post<User>('/auth/signup', params);

    // Mock 응답
    const mockResponse = mockSignup(params);
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
 */
export const logout = async (): Promise<ApiResponse<void>> => {
  try {
    // TODO: 실제 API 호출
    // await apiClient.post('/auth/logout');

    // 로컬 토큰 삭제
    clearTokens();

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
 */
export const refreshToken = async (token: string): Promise<ApiResponse<RefreshTokenResponse>> => {
  try {
    // TODO: 실제 API 호출
    // const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', { refreshToken: token });

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
      saveTokens(mockResponse.data.accessToken, mockResponse.data.refreshToken);
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
 */
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  try {
    // TODO: 실제 API 호출
    // const response = await apiClient.get<User>('/auth/me');

    // Mock: 로컬 스토리지에서 가져오기
    const user = LocalStorage.getItem<User>(STORAGE_KEYS.USER_INFO);

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

// ==================== Helper Functions ====================

/**
 * 토큰 저장 (localStorage + cookie)
 */
const saveTokens = (accessToken: string, refreshToken: string): void => {
  LocalStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  LocalStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

  setCookie('auth-token', accessToken, {
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};

/**
 * 사용자 정보 저장
 */
const saveUser = (user: User): void => {
  LocalStorage.setItem(STORAGE_KEYS.USER_INFO, user);
};

/**
 * 토큰 삭제
 */
const clearTokens = (): void => {
  LocalStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  LocalStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  LocalStorage.removeItem(STORAGE_KEYS.USER_INFO);
  removeCookie('auth-token');
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
