/**
 * Next.js Middleware - 서버 사이드 라우트 가드
 *
 * 왜 Middleware를 사용하는가?
 * - 서버에서 실행되어 클라이언트 번쩍거림 없음
 * - 페이지 렌더링 전에 인증 체크
 * - 불필요한 리소스 로드 방지
 * - Edge Runtime에서 실행되어 빠른 응답
 *
 * SSR vs CSR 인증:
 * - SSR (이 방식): 서버에서 체크 → 번쩍거림 없음, SEO 좋음
 * - CSR: 클라이언트에서 체크 → 번쩍거림 발생, SEO 불리
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 라우트 설정
 *
 * 왜 배열로 관리하는가?
 * - 유지보수 용이
 * - 한눈에 라우트 구조 파악
 * - 동적 추가/제거 가능
 */
const PUBLIC_ROUTES = ['/', '/login', '/signup'];
const AUTH_ROUTES = ['/login', '/signup']; // 로그인된 사용자는 접근 불가
const PRIVATE_ROUTES = ['/dashboard', '/profile', '/settings'];

/**
 * 토큰 검증 함수
 *
 * 왜 별도 함수로 분리하는가?
 * - 재사용 가능
 * - 테스트 용이
 * - 로직 변경 시 한 곳만 수정
 *
 * @param request - Next.js 요청 객체
 * @returns 토큰 유효성 여부
 */
const isAuthenticated = (request: NextRequest): boolean => {
  // localStorage는 서버에서 접근 불가하므로 쿠키 사용
  const token = request.cookies.get('auth-token')?.value;

  /**
   * 실제 프로덕션 환경에서는:
   * 1. JWT 토큰 검증 (만료일, 서명 확인)
   * 2. Redis 등에서 세션 확인
   * 3. 토큰 블랙리스트 체크
   */
  return !!token;
};

/**
 * Middleware 메인 함수
 *
 * 실행 흐름:
 * 1. 요청된 경로 확인
 * 2. 인증 상태 확인
 * 3. 라우트 타입에 따라 처리
 *    - Public: 모두 접근 가능
 *    - Auth Routes: 비로그인만 접근 (로그인 시 대시보드로)
 *    - Private: 로그인만 접근 (비로그인 시 로그인으로)
 */
export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const authenticated = isAuthenticated(request);

  console.log('[Middleware]', {
    pathname,
    authenticated,
    timestamp: new Date().toISOString(),
  });

  /**
   * 1. Public 라우트 - 모두 접근 가능
   */
  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  /**
   * 2. Auth 라우트 (/login, /signup)
   *
   * 왜 로그인된 사용자를 막는가?
   * - 이미 로그인했는데 로그인 페이지 접근은 의미 없음
   * - UX 개선 (자동으로 대시보드로 이동)
   */
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (authenticated) {
      console.log('[Middleware] Authenticated user accessing auth route, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  /**
   * 3. Private 라우트 (/dashboard, /profile 등)
   *
   * 왜 리다이렉트하는가?
   * - 인증되지 않은 사용자의 접근 차단
   * - 보안 강화
   * - 로그인 후 원래 페이지로 돌아갈 수 있도록 callbackUrl 저장
   */
  if (PRIVATE_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!authenticated) {
      console.log('[Middleware] Unauthenticated user accessing private route, redirecting to login');

      // 로그인 후 돌아올 URL 저장
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);

      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  /**
   * 4. 기타 라우트
   * - 정의되지 않은 라우트는 기본적으로 통과
   */
  return NextResponse.next();
};

/**
 * Middleware 설정
 *
 * matcher:
 * - 어떤 경로에서 middleware를 실행할지 정의
 * - 정규식 사용 가능
 *
 * 왜 일부 경로를 제외하는가?
 * - _next/static: Next.js 정적 파일 (불필요한 처리 방지)
 * - _next/image: 이미지 최적화 API
 * - favicon.ico: 파비콘 요청
 * - public 폴더: 정적 리소스
 */
export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 경로에서 실행:
     * - api (API 라우트는 별도 인증 처리)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico (파비콘)
     * - public 폴더의 파일들
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|images).*)',
  ],
};

/**
 * Middleware 사용 시 주의사항:
 *
 * 1. Edge Runtime에서 실행:
 *    - Node.js API 일부 사용 불가 (fs, crypto 등)
 *    - 가벼운 로직만 추천
 *
 * 2. 성능:
 *    - 모든 요청에서 실행되므로 빠르게 처리해야 함
 *    - 무거운 작업은 피하기
 *
 * 3. 쿠키 vs localStorage:
 *    - Middleware는 서버 사이드이므로 쿠키만 접근 가능
 *    - localStorage는 클라이언트 전용
 *
 * 4. 리다이렉트:
 *    - NextResponse.redirect() 사용
 *    - 절대 URL 필요 (new URL 사용)
 */
