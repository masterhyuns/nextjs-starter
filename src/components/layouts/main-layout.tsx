/**
 * MainLayout 컴포넌트
 *
 * 왜 이렇게 구현했는가?
 * - Header와 Body를 포함한 전체 레이아웃
 * - 100vh, 100vw로 화면 전체를 차지
 * - Header는 고정, Body만 스크롤 가능
 * - Flexbox로 Header 높이 자동 계산
 *
 * 사용 방법:
 * - layout.tsx나 page.tsx에서 children을 감싸기
 * - Header props를 통해 메뉴, 사용자 정보 전달
 */

'use client';

import type { ReactNode } from 'react';
import { Header, type HeaderProps } from './header';
import styles from './main-layout.module.scss';

/**
 * MainLayout Props
 */
export interface MainLayoutProps extends HeaderProps {
  /** Body 컨텐츠 */
  children: ReactNode;
  /** Header를 표시할지 여부 (기본값: true) */
  showHeader?: boolean;
}

/**
 * MainLayout 컴포넌트
 *
 * 레이아웃 구조:
 * - 100vh, 100vw 전체 화면 사용
 * - Header: 고정 높이 (자동 계산)
 * - Body: 나머지 공간 차지 + 스크롤 가능
 * - Header는 스크롤과 무관하게 항상 상단 고정
 *
 * @example
 * <MainLayout
 *   logoText="My App"
 *   menuItems={menuItems}
 *   userName="홍길동"
 *   userEmail="hong@example.com"
 *   onLogout={handleLogout}
 * >
 *   <YourPageContent />
 * </MainLayout>
 */
export const MainLayout = ({
  children,
  showHeader = true,
  logoText,
  logoHref,
  menuItems,
  userName,
  userEmail,
  profileImage,
  notificationCount,
  onLogout,
}: MainLayoutProps) => {
  return (
    <div className={styles.layout}>
      {/* Header: 고정 영역 */}
      {showHeader && (
        <Header
          logoText={logoText}
          logoHref={logoHref}
          menuItems={menuItems}
          userName={userName}
          userEmail={userEmail}
          profileImage={profileImage}
          notificationCount={notificationCount}
          onLogout={onLogout}
        />
      )}

      {/* Body: 스크롤 가능한 컨텐츠 영역 */}
      <main className={styles.body}>
        {children}
      </main>
    </div>
  );
};
