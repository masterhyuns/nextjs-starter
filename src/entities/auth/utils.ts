/**
 * Auth 유틸리티 함수
 *
 * 왜 여기에 있는가?
 * - 인증 관련 프론트엔드 비즈니스 로직
 * - 폼 유효성 검증, 권한 확인, 표시 이름 생성 등
 * - 순수 함수로 구현하여 테스트 용이
 */

import type { User, UserRole } from './types';

// ==================== 유효성 검증 ====================

/**
 * 이메일 유효성 검증
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 강도 검증
 *
 * 요구사항:
 * - 최소 8자 이상
 * - 최소 1개의 대문자
 * - 최소 1개의 소문자
 * - 최소 1개의 숫자
 * - 최소 1개의 특수문자
 */
export const isValidPassword = (password: string): boolean => {
  if (password.length < 8) return false;

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};

/**
 * 비밀번호 강도 메시지 반환
 */
export const getPasswordStrengthMessage = (password: string): string => {
  if (password.length < 8) return '비밀번호는 최소 8자 이상이어야 합니다';
  if (!/[A-Z]/.test(password)) return '대문자를 최소 1개 포함해야 합니다';
  if (!/[a-z]/.test(password)) return '소문자를 최소 1개 포함해야 합니다';
  if (!/\d/.test(password)) return '숫자를 최소 1개 포함해야 합니다';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return '특수문자를 최소 1개 포함해야 합니다';
  return '';
};

/**
 * 사용자 이름 유효성 검증
 */
export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2 && name.length <= 50;
};

// ==================== 권한 확인 ====================

/**
 * 사용자가 관리자 권한이 있는지 확인
 */
export const isAdmin = (user: User): boolean => {
  return user.role === 'admin';
};

/**
 * 사용자 계정이 활성화되어 있는지 확인
 */
export const isActive = (user: User): boolean => {
  return user.status === 'active' && user.emailVerified;
};

/**
 * 사용자가 특정 권한을 가지고 있는지 확인
 */
export const hasRole = (user: User, requiredRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    user: 2,
    guest: 1,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};

// ==================== 포맷팅 ====================

/**
 * 사용자 표시 이름 생성
 */
export const getDisplayName = (user: User): string => {
  return user.name || user.email.split('@')[0] || '알 수 없는 사용자';
};
