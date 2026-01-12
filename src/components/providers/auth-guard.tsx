/**
 * 클라이언트 사이드 Auth Guard (정적 배포용)
 *
 * 왜 필요한가?
 * - 정적 배포 시 Middleware가 동작하지 않음
 * - 클라이언트에서 인증 체크 필요
 *
 * 단점:
 * - 클라이언트에서 체크하므로 번쩍거림 발생 가능
 * - SEO 불리 (비공개 페이지 크롤링됨)
 * - 보안성 낮음 (클라이언트 우회 가능)
 *
 * 권장:
 * - 가능하면 SSR 배포 사용 (Vercel, Node.js)
 * - 정적 배포는 Public 페이지만 권장
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/entities/auth';

/**
 * 라우트 설정
 */
const PUBLIC_ROUTES = ['/', '/login', '/signup'];
const AUTH_ROUTES = ['/login', '/signup'];
const PRIVATE_ROUTES = ['/dashboard', '/profile', '/settings'];

/**
 * AuthGuard Props
 */
interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard 컴포넌트
 *
 * 사용법:
 * - layout.tsx에서 children을 감싸기
 *
 * @example
 * ```tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AuthGuard>
 *           {children}
 *         </AuthGuard>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loadUser, status } = useAuthStore();

  /**
   * 초기 인증 상태 로드
   */
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /**
   * 라우트 변경 시 인증 체크
   */
  useEffect(() => {
    // 로딩 중이면 대기
    if (status === 'loading') {
      return;
    }

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
    const isPrivateRoute = PRIVATE_ROUTES.some((route) => pathname.startsWith(route));

    console.log('[AuthGuard]', {
      pathname,
      isAuthenticated,
      isPublicRoute,
      isAuthRoute,
      isPrivateRoute,
    });

    // 1. Public 라우트 - 항상 접근 가능
    if (isPublicRoute) {
      return;
    }

    // 2. Auth 라우트 (/login, /signup) - 로그인 시 대시보드로
    if (isAuthRoute && isAuthenticated) {
      console.log('[AuthGuard] Authenticated user on auth route, redirecting to dashboard');
      router.replace('/dashboard');
      return;
    }

    // 3. Private 라우트 - 비로그인 시 로그인으로
    if (isPrivateRoute && !isAuthenticated) {
      console.log('[AuthGuard] Unauthenticated user on private route, redirecting to login');
      const callbackUrl = pathname;
      router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }
  }, [pathname, isAuthenticated, status, router]);

  /**
   * 로딩 중일 때 화면
   *
   * 왜 필요한가?
   * - 인증 상태 확인 중 깜빡임 방지
   * - 사용자 경험 개선
   */
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * 사용 예시:
 *
 * app/layout.tsx:
 * ```tsx
 * import { AuthGuard } from '@/components/providers/auth-guard';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="ko">
 *       <body>
 *         <AuthGuard>
 *           {children}
 *         </AuthGuard>
 *         <ModalProvider />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * 주의사항:
 * - 클라이언트 사이드 체크이므로 번쩍거림 발생 가능
 * - SEO에 불리 (Private 페이지도 크롤링됨)
 * - 보안성 낮음 (클라이언트에서 우회 가능)
 *
 * 권장:
 * - 프로덕션에서는 SSR 배포 (Vercel, Node.js) 사용
 * - Middleware 방식이 더 안전하고 빠름
 */
