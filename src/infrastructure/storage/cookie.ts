/**
 * 쿠키 관리 유틸리티
 *
 * 왜 필요한가?
 * - SSR 인증을 위해 서버에서 접근 가능한 쿠키 사용
 * - localStorage는 클라이언트 전용, middleware에서 접근 불가
 * - 쿠키는 서버/클라이언트 모두에서 접근 가능
 *
 * 쿠키 vs localStorage:
 * - 쿠키: 서버 요청 시 자동 전송, SSR 지원, 용량 제한(4KB)
 * - localStorage: 클라이언트 전용, 용량 크고(5-10MB), 서버 미지원
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
 *
 * 왜 클라이언트 사이드만 지원하는가?
 * - 서버 사이드 쿠키 설정은 Response 헤더를 통해 처리
 * - 이 유틸리티는 클라이언트에서 쿠키를 설정할 때 사용
 *
 * @param name - 쿠키 이름
 * @param value - 쿠키 값
 * @param options - 쿠키 옵션
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
    secure = process.env.NODE_ENV === 'production', // 프로덕션에서만 secure
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
 *
 * 왜 정규식을 사용하는가?
 * - document.cookie는 모든 쿠키를 문자열로 반환
 * - 특정 쿠키를 찾기 위해 파싱 필요
 * - 정규식이 가장 효율적인 방법
 *
 * @param name - 쿠키 이름
 * @returns 쿠키 값 (없으면 null)
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
 *
 * 왜 expires=-1인가?
 * - 쿠키 삭제는 과거 시간으로 만료일 설정
 * - 브라우저가 자동으로 삭제
 *
 * @param name - 쿠키 이름
 * @param options - 쿠키 옵션 (path, domain은 설정 시와 동일해야 함)
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
 *
 * 디버깅 용도로 사용
 *
 * @returns 모든 쿠키의 key-value 객체
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
 *
 * @param name - 쿠키 이름
 * @returns 존재 여부
 */
export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};

/**
 * 사용 예시:
 *
 * ```typescript
 * // 1. 쿠키 설정
 * setCookie('auth-token', 'abc123', {
 *   expires: 7,
 *   secure: true,
 *   sameSite: 'strict'
 * });
 *
 * // 2. 쿠키 조회
 * const token = getCookie('auth-token');
 *
 * // 3. 쿠키 삭제
 * removeCookie('auth-token');
 *
 * // 4. 쿠키 존재 확인
 * if (hasCookie('auth-token')) {
 *   console.log('로그인 상태');
 * }
 * ```
 */
