/**
 * 쿠키 관리 유틸리티
 *
 * 왜 필요한가?
 * - SSR 인증을 위해 서버에서 접근 가능한 쿠키 사용
 * - localStorage는 클라이언트 전용, middleware에서 접근 불가
 * - 쿠키는 서버/클라이언트 모두에서 접근 가능
 *
 * 보안 고려사항:
 * - HttpOnly: JavaScript 접근 차단 (XSS 방어)
 * - Secure: HTTPS에서만 전송
 * - SameSite: CSRF 공격 방어
 */

/**
 * 쿠키 옵션 인터페이스
 */
export interface CookieOptions {
  /** 만료 시간 (일 단위) */
  expires?: number;
  /** 쿠키 경로 */
  path?: string;
  /** 도메인 */
  domain?: string;
  /** HTTPS에서만 전송 */
  secure?: boolean;
  /** JavaScript 접근 차단 (서버 전용) */
  httpOnly?: boolean;
  /** CSRF 방어 */
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * 쿠키 설정 함수
 */
export const setCookie = (name: string, value: string, options: CookieOptions = {}): void => {
  // SSR 환경 체크
  if (typeof window === 'undefined') {
    console.warn('[Cookie] setCookie called on server side');
    return;
  }

  const {
    expires = 7, // 기본 7일
    path = '/',
    domain,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'lax',
  } = options;

  // 쿠키 문자열 생성
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  // 만료일 설정
  if (expires) {
    const date = new Date();
    date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${date.toUTCString()}`;
  }

  // 경로 설정
  cookieString += `; path=${path}`;

  // 도메인 설정
  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  // Secure 플래그
  if (secure) {
    cookieString += '; secure';
  }

  // SameSite 설정
  cookieString += `; samesite=${sameSite}`;

  // 쿠키 설정
  document.cookie = cookieString;

  console.log('[Cookie] Set:', { name, expires, path, secure, sameSite });
};

/**
 * 쿠키 조회 함수
 */
export const getCookie = (name: string): string | null => {
  // SSR 환경 체크
  if (typeof window === 'undefined') {
    return null;
  }

  // 쿠키 이름 인코딩
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  // 쿠키 찾기
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];

    // 앞 공백 제거
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }

    // 쿠키 이름 매칭
    if (cookie.indexOf(nameEQ) === 0) {
      const value = cookie.substring(nameEQ.length);
      return decodeURIComponent(value);
    }
  }

  return null;
};

/**
 * 쿠키 삭제 함수
 */
export const removeCookie = (name: string, options: CookieOptions = {}): void => {
  // SSR 환경 체크
  if (typeof window === 'undefined') {
    console.warn('[Cookie] removeCookie called on server side');
    return;
  }

  // expires를 -1로 설정하여 삭제
  setCookie(name, '', { ...options, expires: -1 });

  console.log('[Cookie] Removed:', name);
};

/**
 * 모든 쿠키 조회 함수
 */
export const getAllCookies = (): Record<string, string> => {
  // SSR 환경 체크
  if (typeof window === 'undefined') {
    return {};
  }

  const cookies: Record<string, string> = {};
  const cookieStrings = document.cookie.split(';');

  cookieStrings.forEach((cookie) => {
    const [name, ...valueParts] = cookie.split('=');
    if (name && valueParts.length > 0) {
      const trimmedName = name.trim();
      const value = valueParts.join('=').trim();
      cookies[decodeURIComponent(trimmedName)] = decodeURIComponent(value);
    }
  });

  return cookies;
};

/**
 * 쿠키 존재 여부 확인
 */
export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};
