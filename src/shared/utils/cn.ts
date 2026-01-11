/**
 * 클래스명 조합 유틸리티
 *
 * 왜 이렇게 구현했는가?
 * - Tailwind CSS와 함께 사용하기 위한 유틸리티
 * - clsx로 조건부 클래스명 처리
 * - class-variance-authority로 variant 기반 스타일링 지원
 * - 충돌하는 Tailwind 클래스 자동 병합 (예: px-2 px-4 -> px-4)
 *
 * 사용 예시:
 * cn('text-red-500', isActive && 'bg-blue-500', className)
 */

import { type ClassValue, clsx } from 'clsx';

/**
 * 여러 클래스명을 조합하여 하나의 문자열로 반환
 *
 * @param inputs - 조합할 클래스명 배열
 * @returns 조합된 클래스명 문자열
 *
 * 주의사항:
 * - Tailwind CSS의 Just-In-Time 모드에서는 동적 클래스명이 작동하지 않을 수 있음
 * - 클래스명은 가능한 한 정적으로 작성하는 것을 권장
 */
export const cn = (...inputs: ClassValue[]): string => {
  return clsx(inputs);
};
