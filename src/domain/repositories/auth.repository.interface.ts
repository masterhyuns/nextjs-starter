/**
 * 인증 Repository 인터페이스
 *
 * 왜 Interface를 정의하는가? (DIP - Dependency Inversion Principle)
 * - 도메인 레이어는 구체적인 구현(API, DB)에 의존하지 않음
 * - 인터페이스에만 의존하여 구현체 교체 가능 (확장성)
 * - 테스트 시 Mock 객체로 쉽게 대체 가능
 * - 비즈니스 로직과 인프라 로직 완전 분리
 *
 * 실제 구현체:
 * - infrastructure/repositories/auth.repository.ts에서 구현
 * - API 호출, Local Storage 등 실제 데이터 소스와 통신
 */

import type { UserEntity, CreateUserParams } from '../entities/user.entity';
import type { ApiResponse } from '@/shared/types';

/**
 * 로그인 요청 파라미터
 */
export interface LoginParams {
  /** 이메일 */
  email: string;
  /** 비밀번호 */
  password: string;
  /** 로그인 상태 유지 */
  rememberMe?: boolean;
}

/**
 * 로그인 응답 데이터
 *
 * 왜 별도로 정의하는가?
 * - 인증 토큰과 사용자 정보를 함께 반환
 * - 타입 안정성 확보
 */
export interface LoginResponse {
  /** 사용자 정보 */
  user: UserEntity;
  /** 액세스 토큰 (JWT) */
  accessToken: string;
  /** 리프레시 토큰 */
  refreshToken: string;
  /** 토큰 만료 시간 (초) */
  expiresIn: number;
}

/**
 * 토큰 갱신 응답
 */
export interface RefreshTokenResponse {
  /** 새로운 액세스 토큰 */
  accessToken: string;
  /** 새로운 리프레시 토큰 */
  refreshToken: string;
  /** 토큰 만료 시간 (초) */
  expiresIn: number;
}

/**
 * 인증 Repository 인터페이스
 *
 * 왜 모든 메서드가 Promise를 반환하는가?
 * - API 호출은 비동기 작업
 * - 일관된 인터페이스 제공
 * - async/await 패턴 사용 가능
 */
export interface IAuthRepository {
  /**
   * 로그인
   *
   * 비즈니스 플로우:
   * 1. 이메일/비밀번호 검증
   * 2. 서버 인증 요청
   * 3. JWT 토큰 발급 및 저장
   * 4. 사용자 정보 반환
   *
   * @param params - 로그인 파라미터
   * @returns 로그인 응답 (사용자 정보 + 토큰)
   * @throws AuthenticationError - 인증 실패 시
   */
  login(params: LoginParams): Promise<ApiResponse<LoginResponse>>;

  /**
   * 회원가입
   *
   * 비즈니스 플로우:
   * 1. 입력값 유효성 검증
   * 2. 이메일 중복 체크
   * 3. 비밀번호 해싱
   * 4. 사용자 생성
   * 5. 이메일 인증 메일 발송
   *
   * @param params - 회원가입 파라미터
   * @returns 생성된 사용자 정보
   * @throws ValidationError - 유효성 검증 실패 시
   */
  signup(params: CreateUserParams): Promise<ApiResponse<UserEntity>>;

  /**
   * 로그아웃
   *
   * 비즈니스 플로우:
   * 1. 서버에 로그아웃 요청 (리프레시 토큰 무효화)
   * 2. 로컬 토큰 삭제
   * 3. 사용자 상태 초기화
   *
   * @returns 성공 여부
   */
  logout(): Promise<ApiResponse<void>>;

  /**
   * 토큰 갱신
   *
   * 왜 필요한가?
   * - 액세스 토큰 만료 시 자동 갱신
   * - 사용자 재로그인 없이 세션 유지
   * - 보안성 향상 (짧은 액세스 토큰 + 긴 리프레시 토큰)
   *
   * @param refreshToken - 리프레시 토큰
   * @returns 새로운 토큰 정보
   * @throws AuthenticationError - 리프레시 토큰 만료/무효 시
   */
  refreshToken(refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>>;

  /**
   * 현재 로그인된 사용자 정보 조회
   *
   * 왜 필요한가?
   * - 페이지 새로고침 시 사용자 정보 복원
   * - 토큰 유효성 검증
   * - 사용자 프로필 업데이트 후 최신 정보 동기화
   *
   * @returns 사용자 정보
   * @throws AuthenticationError - 인증되지 않은 경우
   */
  getCurrentUser(): Promise<ApiResponse<UserEntity>>;

  /**
   * 비밀번호 재설정 요청
   *
   * 비즈니스 플로우:
   * 1. 이메일 검증
   * 2. 재설정 토큰 생성
   * 3. 이메일 발송
   *
   * @param email - 사용자 이메일
   * @returns 성공 여부
   */
  requestPasswordReset(email: string): Promise<ApiResponse<void>>;

  /**
   * 비밀번호 재설정
   *
   * @param token - 재설정 토큰
   * @param newPassword - 새 비밀번호
   * @returns 성공 여부
   */
  resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>>;

  /**
   * 이메일 인증
   *
   * @param token - 인증 토큰
   * @returns 성공 여부
   */
  verifyEmail(token: string): Promise<ApiResponse<void>>;
}
