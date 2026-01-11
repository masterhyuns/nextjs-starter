/**
 * User 엔티티
 *
 * 왜 Entity를 분리하는가?
 * - Clean Architecture의 핵심: 비즈니스 로직과 프레임워크 독립성
 * - 도메인 모델은 외부 의존성(React, Next.js 등)이 없어야 함
 * - 순수 TypeScript로만 구현하여 재사용성과 테스트 용이성 확보
 *
 * Entity vs DTO의 차이:
 * - Entity: 비즈니스 규칙과 도메인 로직을 포함
 * - DTO: 단순 데이터 전송용 객체
 */

import type { ID, Timestamps } from '@/shared/types';

/**
 * 사용자 역할
 *
 * 왜 enum 대신 union type을 사용하는가?
 * - Tree-shaking에 유리
 * - 런타임 코드 생성 없음
 * - 타입스크립트의 타입 추론이 더 정확함
 */
export type UserRole = 'admin' | 'user' | 'guest';

/**
 * 사용자 상태
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

/**
 * User 엔티티 인터페이스
 *
 * 왜 interface를 사용하는가?
 * - 확장 가능성 (extends, implements)
 * - 선언 병합(declaration merging) 가능
 * - 더 나은 IDE 지원
 */
export interface UserEntity extends Timestamps {
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
 * User 생성 파라미터 (비밀번호 포함)
 *
 * 왜 별도로 정의하는가?
 * - 회원가입 시에만 비밀번호가 필요
 * - UserEntity에는 보안상 비밀번호를 포함하지 않음
 * - SRP (Single Responsibility Principle) 준수
 */
export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

/**
 * User 업데이트 파라미터
 *
 * Partial<T>를 사용하여 모든 필드를 선택적으로 만듦
 */
export type UpdateUserParams = Partial<
  Pick<UserEntity, 'name' | 'profileImage' | 'role' | 'status'>
>;

/**
 * User 도메인 서비스 (비즈니스 로직)
 *
 * 왜 클래스로 구현하는가?
 * - 도메인 로직을 한 곳에 캡슐화
 * - OOP의 장점 활용 (상속, 다형성)
 * - 테스트하기 쉬운 구조
 *
 * 왜 static 메서드를 사용하는가?
 * - 상태가 없는 순수 함수
 * - 인스턴스 생성 불필요
 * - 유틸리티 메서드처럼 사용 가능
 */
export class UserDomain {
  /**
   * 이메일 유효성 검증
   *
   * 왜 정규식을 사용하는가?
   * - RFC 5322 표준에 근접한 검증
   * - 대부분의 유효한 이메일 형식 커버
   *
   * @param email - 검증할 이메일
   * @returns 유효성 여부
   */
  static isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * 비밀번호 강도 검증
   *
   * 보안 요구사항:
   * - 최소 8자 이상
   * - 최소 1개의 대문자
   * - 최소 1개의 소문자
   * - 최소 1개의 숫자
   * - 최소 1개의 특수문자
   *
   * @param password - 검증할 비밀번호
   * @returns 유효성 여부
   */
  static isValidPassword = (password: string): boolean => {
    if (password.length < 8) return false;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  /**
   * 사용자가 관리자 권한이 있는지 확인
   *
   * @param user - 사용자 엔티티
   * @returns 관리자 여부
   */
  static isAdmin = (user: UserEntity): boolean => {
    return user.role === 'admin';
  };

  /**
   * 사용자 계정이 활성화되어 있는지 확인
   *
   * @param user - 사용자 엔티티
   * @returns 활성화 여부
   */
  static isActive = (user: UserEntity): boolean => {
    return user.status === 'active' && user.emailVerified;
  };

  /**
   * 사용자가 특정 권한을 가지고 있는지 확인
   *
   * 왜 필요한가?
   * - 권한 기반 접근 제어 (RBAC)
   * - 확장 가능한 권한 체계
   *
   * @param user - 사용자 엔티티
   * @param requiredRole - 필요한 역할
   * @returns 권한 여부
   */
  static hasRole = (user: UserEntity, requiredRole: UserRole): boolean => {
    const roleHierarchy: Record<UserRole, number> = {
      admin: 3,
      user: 2,
      guest: 1,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  /**
   * 사용자 이름 유효성 검증
   *
   * @param name - 검증할 이름
   * @returns 유효성 여부
   */
  static isValidName = (name: string): boolean => {
    // 2~50자, 공백 허용
    return name.trim().length >= 2 && name.length <= 50;
  };

  /**
   * 사용자 표시 이름 생성
   *
   * 왜 필요한가?
   * - UI에서 일관된 사용자 이름 표시
   * - null/undefined 처리
   *
   * @param user - 사용자 엔티티
   * @returns 표시할 이름
   */
  static getDisplayName = (user: UserEntity): string => {
    return user.name || user.email.split('@')[0] || '알 수 없는 사용자';
  };

  /**
   * 사용자 초기화 (기본값 적용)
   *
   * 왜 필요한가?
   * - 데이터 일관성 보장
   * - null/undefined 방지
   *
   * @param params - 사용자 생성 파라미터
   * @returns 초기화된 사용자 엔티티 (비밀번호 제외)
   */
  static create = (params: CreateUserParams): Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'> => {
    const now = new Date().toISOString();

    return {
      email: params.email,
      name: params.name,
      role: params.role || 'user',
      status: 'pending',
      emailVerified: false,
      profileImage: undefined,
      lastLoginAt: undefined,
    };
  };
}
