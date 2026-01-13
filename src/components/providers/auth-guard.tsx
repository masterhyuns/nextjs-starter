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

import { useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/entities/auth';
import { FullScreenLoading } from '@/components/ui/full-screen-loading';

/**
 * 라우트 설정
 *
 * SSO 인증 환경:
 * - PUBLIC_ROUTES: 인증 체크 없이 접근 가능
 * - AUTH_ROUTES: 제거 (SSO가 로그인 처리)
 * - ADMIN_ROUTES: admin 역할만 접근 가능 (RBAC)
 * - PRIVATE_ROUTES: 명시 불필요 (public/admin 아니면 자동으로 private)
 *
 * 왜 /login이 없는가?
 * - SSO 서버가 로그인 처리
 * - 401 발생 시 자동으로 SSO로 리다이렉트
 * - 프론트엔드에 별도 로그인 페이지 불필요
 */
const PUBLIC_ROUTES = ['/404', '/403']; // 에러 페이지만 public
const ADMIN_ROUTES = ['/admin']; // admin 역할만 접근 가능

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
  const { user, isAuthenticated, loadUser, status } = useAuthStore();

  /**
   * 초기 인증 상태 로드
   */
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /**
   * 라우트 타입 체크 (useMemo로 최적화)
   *
   * 왜 useMemo를 사용하는가?
   * - pathname이 변경될 때만 재계산
   * - 불필요한 배열 순회 방지
   * - 리렌더링 성능 향상
   */
  const routeType = useMemo(() => {
    const isPublic = PUBLIC_ROUTES.some((route) => pathname === route);
    const isAdmin = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

    return { isPublic, isAdmin };
  }, [pathname]);

  /**
   * 라우트 변경 시 인증 체크
   *
   * SSO 인증 체크 순서:
   * 1. Public 라우트 체크: 항상 접근 허용 (/404, /403)
   * 2. Admin 라우트 체크: admin 역할만 접근 가능 (RBAC)
   *    - 비로그인 → loadUser()가 SSO 리다이렉트 처리
   *    - user 역할 → /403 페이지로
   * 3. Private 라우트 체크: 로그인 필요 (나머지 모든 페이지)
   *    - 비로그인 → loadUser()가 SSO 리다이렉트 처리
   *
   * 왜 로그인 페이지가 없는가?
   * - SSO가 로그인 처리
   * - loadUser()의 401 응답 시 SSO로 자동 리다이렉트
   *
   * 최적화:
   * - useMemo로 라우트 타입 체크 캐싱
   * - 필요한 의존성만 포함하여 불필요한 리렌더링 방지
   */
  useEffect(() => {
    // 로딩 중이면 대기
    if (status === 'loading') {
      return;
    }

    const { isPublic, isAdmin } = routeType;

    console.log('[AuthGuard]', {
      pathname,
      isAuthenticated,
      userRole: user?.role,
      isPublic,
      isAdmin,
    });

    // 1. Public 라우트 (/404, /403) - 항상 접근 가능
    if (isPublic) {
      return;
    }

    // 2. Admin 라우트 (/admin/*) - admin 역할만 접근 가능 (RBAC)
    if (isAdmin) {
      // 2-1. 비로그인 - loadUser()가 SSO 리다이렉트 처리 (여기서는 대기)
      if (!isAuthenticated) {
        console.log('[AuthGuard] Unauthenticated user on admin route, waiting for SSO redirect');
        return;
      }

      // 2-2. 로그인되어 있지만 admin이 아님 - 403 페이지로
      if (user?.role !== 'admin') {
        console.log('[AuthGuard] Non-admin user trying to access admin route, redirecting to 403');
        router.replace('/403');
        return;
      }
    }

    // 3. Private 라우트 (나머지 모든 페이지) - 비로그인 시 loadUser()가 SSO 리다이렉트 처리
    if (!isAuthenticated) {
      console.log('[AuthGuard] Unauthenticated user on private route, waiting for SSO redirect');
      return;
    }
  }, [routeType, isAuthenticated, user?.role, status, router, pathname]);

  /**
   * 렌더링 조건 체크
   *
   * 왜 필요한가?
   * - 권한 없는 페이지가 잠깐 보이는 "번쩍거림" 방지
   * - 로딩 중이거나 권한 체크 중일 때는 children 렌더링 차단
   *
   * 렌더링 차단 조건:
   * 1. 로딩 중 (status === 'loading')
   * 2. Admin 페이지인데 권한 없음 (isAdmin && isAuthenticated && role !== 'admin')
   * 3. Private 페이지인데 비로그인 (!isPublic && !isAuthenticated)
   */
  const shouldBlockRender = useMemo(() => {
    const { isPublic, isAdmin } = routeType;

    // 1. 로딩 중이면 차단
    if (status === 'loading') {
      return true;
    }

    // 2. Public 페이지는 항상 허용
    if (isPublic) {
      return false;
    }

    // 3. Admin 페이지인데 로그인은 되어있지만 admin이 아닌 경우 차단
    if (isAdmin && isAuthenticated && user?.role !== 'admin') {
      return true;
    }

    // 4. Admin 페이지인데 비로그인 상태면 차단 (SSO 리다이렉트 대기)
    if (isAdmin && !isAuthenticated) {
      return true;
    }

    // 5. Private 페이지인데 비로그인 상태면 차단 (SSO 리다이렉트 대기)
    if (!isPublic && !isAuthenticated) {
      return true;
    }

    // 그 외에는 허용
    return false;
  }, [status, routeType, isAuthenticated, user?.role]);

  /**
   * 로딩 또는 권한 체크 중일 때 화면
   *
   * 왜 필요한가?
   * - 인증 상태 확인 중 깜빡임 방지
   * - 권한 없는 페이지 렌더링 방지
   * - 사용자 경험 개선
   *
   * FullScreenLoading 사용:
   * - SCSS Module로 스타일 격리
   * - 다크모드 자동 지원
   * - 접근성(a11y) 준수
   */
  if (shouldBlockRender) {
    return <FullScreenLoading text="로딩 중..." />;
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
