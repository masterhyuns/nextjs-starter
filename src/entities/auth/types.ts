/**
 * Auth 엔티티 타입 정의
 *
 * 왜 여기에 있는가?
 * - 인증 관련 모든 타입을 한 곳에서 관리
 * - User 타입도 인증과 밀접하므로 함께 정의
 * - 백엔드 API 응답 구조와 일치
 */

import type { ID, Timestamps } from '@/lib/types';

// ==================== User 타입 ====================

/**
 * 사용자 역할
 */
export type UserRole = 'admin' | 'user' | 'guest';

/**
 * 사용자 상태
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

/**
 * User 타입
 *
 * 백엔드 API 응답 구조와 일치
 */
export interface User extends Timestamps {
  /** 사용자 고유 ID */
  id: ID;
  /** 이메일 (로그인 ID) */
  email: string;
  /** 사용자 이름 */
  name: string;
  /** 프로필 이미지 URL */
  profileImage?: string;
  /** 역할 */
  role: UserRole;
  /** 계정 상태 */
  status: UserStatus;
  /** 이메일 인증 여부 */
  emailVerified: boolean;
  /** 마지막 로그인 시간 */
  lastLoginAt?: string;
}

/**
 * User 생성 파라미터 (회원가입)
 */
export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

/**
 * User 업데이트 파라미터
 */
export type UpdateUserParams = Partial<
  Pick<User, 'name' | 'profileImage' | 'role' | 'status'>
>;

// ==================== Auth 타입 ====================

/**
 * 로그인 요청 파라미터
 */
export interface LoginParams {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * 로그인 응답
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * 토큰 갱신 응답
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
