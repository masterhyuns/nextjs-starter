/**
 * 공통 유틸리티 함수 모음
 *
 * 왜 이렇게 구현했는가?
 * - 자주 사용되는 헬퍼 함수들을 한 곳에서 관리
 * - 비즈니스 로직과 유틸리티 로직 분리
 */

import { type ClassValue, clsx } from 'clsx';

// ==================== 클래스명 조합 ====================

/**
 * 여러 클래스명을 조합하여 하나의 문자열로 반환
 *
 * 왜 이렇게 구현했는가?
 * - Tailwind CSS와 함께 사용하기 위한 유틸리티
 * - clsx로 조건부 클래스명 처리
 * - 충돌하는 Tailwind 클래스 자동 병합
 *
 * 사용 예시:
 * cn('text-red-500', isActive && 'bg-blue-500', className)
 */
export const cn = (...inputs: ClassValue[]): string => {
  return clsx(inputs);
};

// ==================== 날짜 포맷팅 ====================

/**
 * 날짜를 읽기 쉬운 형식으로 포맷팅
 */
export const formatDate = (
  date: Date | string | number,
  locale: string = 'ko-KR'
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * 날짜와 시간을 포맷팅
 */
export const formatDateTime = (
  date: Date | string | number,
  locale: string = 'ko-KR'
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * 상대적 시간 표시 (예: "3분 전", "2시간 전")
 */
export const formatRelativeTime = (
  date: Date | string | number,
  baseDate: Date = new Date()
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  const diffInSeconds = Math.floor((baseDate.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 0) return '방금 전';
  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;

  return formatDate(dateObj);
};

// ==================== 숫자 포맷팅 ====================

/**
 * 숫자를 천 단위 콤마로 포맷팅
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('ko-KR').format(value);
};

/**
 * 통화 형식으로 포맷팅
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'KRW'
): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * 파일 크기를 읽기 쉬운 형식으로 포맷팅
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * 백분율 포맷팅
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// ==================== 전화번호 포맷팅 ====================

/**
 * 전화번호 포맷팅 (한국)
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 10) {
    if (cleaned.startsWith('02')) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    } else {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
  }

  return phoneNumber;
};

// ==================== 문자열 처리 ====================

/**
 * 문자열 생략 (말줄임표)
 */
export const truncate = (
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string => {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
};
