/**
 * 포맷팅 유틸리티 함수 모음
 *
 * 왜 이렇게 구현했는가?
 * - 날짜, 숫자, 통화 등 자주 사용되는 포맷팅 로직을 한 곳에서 관리
 * - UI 일관성 유지
 * - 비즈니스 로직과 포맷팅 로직 분리 (SRP - Single Responsibility Principle)
 */

/**
 * 날짜를 읽기 쉬운 형식으로 포맷팅
 *
 * 왜 Intl.DateTimeFormat을 사용하는가?
 * - 브라우저 내장 API로 번들 크기 증가 없음
 * - 국제화(i18n) 지원
 * - 타임존 자동 처리
 *
 * @param date - 포맷팅할 날짜 (Date 객체, ISO 문자열, 타임스탬프)
 * @param locale - 로케일 (기본값: 'ko-KR')
 * @returns 포맷팅된 날짜 문자열 (예: "2024년 1월 11일")
 */
export const formatDate = (
  date: Date | string | number,
  locale: string = 'ko-KR'
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);

  // 유효하지 않은 날짜 체크
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
 *
 * @param date - 포맷팅할 날짜
 * @param locale - 로케일
 * @returns 포맷팅된 날짜시간 문자열 (예: "2024년 1월 11일 오후 3:24")
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
 *
 * 왜 필요한가?
 * - SNS, 댓글 등에서 직관적인 시간 표시
 * - 사용자 경험 개선
 *
 * @param date - 비교할 날짜
 * @param baseDate - 기준 날짜 (기본값: 현재 시간)
 * @returns 상대적 시간 문자열
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

  // 미래 시간인 경우
  if (diffInSeconds < 0) {
    return '방금 전';
  }

  // 1분 미만
  if (diffInSeconds < 60) {
    return '방금 전';
  }

  // 1시간 미만
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}분 전`;
  }

  // 1일 미만
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}시간 전`;
  }

  // 7일 미만
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}일 전`;
  }

  // 그 이상은 절대 날짜 표시
  return formatDate(dateObj);
};

/**
 * 숫자를 천 단위 콤마로 포맷팅
 *
 * @param value - 포맷팅할 숫자
 * @returns 콤마가 추가된 문자열 (예: "1,234,567")
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('ko-KR').format(value);
};

/**
 * 통화 형식으로 포맷팅
 *
 * @param amount - 금액
 * @param currency - 통화 코드 (기본값: 'KRW')
 * @returns 통화 형식 문자열 (예: "₩1,234,567")
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
 *
 * 왜 필요한가?
 * - 파일 업로드/다운로드 UI에서 자주 사용
 * - 바이트 단위를 KB, MB, GB 등으로 자동 변환
 *
 * @param bytes - 바이트 크기
 * @param decimals - 소수점 자릿수 (기본값: 2)
 * @returns 포맷팅된 크기 문자열 (예: "1.23 MB")
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * 전화번호 포맷팅 (한국)
 *
 * @param phoneNumber - 전화번호 (숫자만 또는 하이픈 포함)
 * @returns 포맷팅된 전화번호 (예: "010-1234-5678")
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // 숫자만 추출
  const cleaned = phoneNumber.replace(/\D/g, '');

  // 전화번호 길이에 따라 포맷팅
  if (cleaned.length === 11) {
    // 휴대폰: 010-1234-5678
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 10) {
    // 지역번호: 02-1234-5678 또는 031-123-4567
    if (cleaned.startsWith('02')) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    } else {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
  }

  // 포맷팅 실패 시 원본 반환
  return phoneNumber;
};

/**
 * 백분율 포맷팅
 *
 * @param value - 0~1 사이의 숫자 (예: 0.1234)
 * @param decimals - 소수점 자릿수 (기본값: 2)
 * @returns 백분율 문자열 (예: "12.34%")
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * 문자열 생략 (말줄임표)
 *
 * 왜 필요한가?
 * - 긴 텍스트를 제한된 공간에 표시
 * - CSS ellipsis와 달리 정확한 글자 수 제어 가능
 *
 * @param text - 원본 텍스트
 * @param maxLength - 최대 길이
 * @param ellipsis - 말줄임표 (기본값: '...')
 * @returns 생략된 텍스트
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
