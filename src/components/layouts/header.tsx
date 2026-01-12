/**
 * Header 컴포넌트
 *
 * 왜 이렇게 구현했는가?
 * - 로고, 메뉴, 액션 버튼을 포함한 완전한 헤더
 * - 드롭다운 메뉴 지원 (단일 메뉴는 드롭다운 없음)
 * - 반응형 디자인 (모바일에서는 햄버거 메뉴)
 * - SCSS Module로 스타일 격리
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './header.module.scss';

// ==================== 타입 정의 ====================

/**
 * 메뉴 아이템 타입
 */
export interface MenuItem {
  /** 메뉴 라벨 */
  label: string;
  /** 링크 경로 (단일 메뉴인 경우) */
  href?: string;
  /** 서브 메뉴 (드롭다운) */
  children?: {
    label: string;
    href: string;
  }[];
  /** 외부 링크 여부 */
  external?: boolean;
}

/**
 * Header Props
 */
export interface HeaderProps {
  /** 로고 텍스트 */
  logoText?: string;
  /** 로고 링크 */
  logoHref?: string;
  /** 메뉴 아이템 */
  menuItems?: MenuItem[];
  /** 사용자 이름 */
  userName?: string;
  /** 사용자 이메일 */
  userEmail?: string;
  /** 프로필 이미지 URL */
  profileImage?: string;
  /** 알림 개수 */
  notificationCount?: number;
  /** 로그아웃 핸들러 */
  onLogout?: () => void;
}

// ==================== Header 컴포넌트 ====================

export const Header = ({
  logoText = 'Next Starter',
  logoHref = '/',
  menuItems = [],
  userName = 'User',
  userEmail = 'user@example.com',
  profileImage,
  notificationCount = 0,
  onLogout,
}: HeaderProps) => {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지하여 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 메뉴 아이템 활성화 여부 확인
  const isMenuActive = (item: MenuItem): boolean => {
    if (item.href && pathname === item.href) return true;
    if (item.children) {
      return item.children.some((child) => pathname === child.href);
    }
    return false;
  };

  // 드롭다운 토글
  const toggleDropdown = (index: number) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  // 프로필 아이콘 이니셜
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className={styles.header}>
        {/* 좌측: 로고 */}
        <div className={styles.logoSection}>
          <Link href={logoHref} className={styles.logo}>
            <div className={styles.logoIcon}>
              {logoText.charAt(0).toUpperCase()}
            </div>
            <span>{logoText}</span>
          </Link>
        </div>

        {/* 중앙: 메뉴 */}
        <nav className={styles.menuSection}>
          {menuItems.map((item, index) => (
            <div key={index}>
              {index > 0 && <div className={styles.menuDivider} />}

              {/* 단일 메뉴 (드롭다운 없음) */}
              {item.href && !item.children && (
                <Link
                  href={item.href}
                  className={`${styles.menuItem} ${isMenuActive(item) ? styles.active : ''}`}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                >
                  <span className={styles.menuItemText}>{item.label}</span>
                </Link>
              )}

              {/* 드롭다운 메뉴 */}
              {item.children && item.children.length > 0 && (
                <div ref={index === openDropdown ? dropdownRef : null}>
                  <button
                    className={`${styles.menuItem} ${isMenuActive(item) ? styles.active : ''}`}
                    onClick={() => toggleDropdown(index)}
                  >
                    <span className={styles.menuItemText}>{item.label}</span>
                    <span className={`${styles.dropdownIcon} ${openDropdown === index ? styles.open : ''}`}>
                      ▼
                    </span>
                  </button>

                  <div className={`${styles.dropdown} ${openDropdown === index ? styles.open : ''}`}>
                    {item.children.map((child, childIndex) => (
                      <Link
                        key={childIndex}
                        href={child.href}
                        className={`${styles.dropdownItem} ${pathname === child.href ? styles.active : ''}`}
                        onClick={() => setOpenDropdown(null)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* 우측: 액션 버튼 */}
        <div className={styles.actionsSection}>
          {/* 알림 */}
          <button className={styles.actionButton} title="알림">
            <span className={styles.actionIcon}>🔔</span>
            {notificationCount > 0 && (
              <span className={styles.badge}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>

          {/* 공유 */}
          <button className={styles.actionButton} title="공유">
            <span className={styles.actionIcon}>🔗</span>
          </button>

          {/* 도움말 */}
          <button className={styles.actionButton} title="도움말">
            <span className={styles.actionIcon}>❓</span>
          </button>

          {/* 즐겨찾기 */}
          <button className={styles.actionButton} title="즐겨찾기">
            <span className={styles.actionIcon}>⭐</span>
          </button>

          {/* 설정 */}
          <button className={styles.actionButton} title="설정">
            <span className={styles.actionIcon}>⚙️</span>
          </button>

          {/* 프로필 */}
          <div ref={profileRef}>
            <button
              className={styles.profileButton}
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <div className={styles.avatar}>
                {profileImage ? (
                  <img src={profileImage} alt={userName} />
                ) : (
                  getInitials(userName)
                )}
              </div>
              <span className={styles.userName}>{userName}</span>
            </button>

            {/* 프로필 드롭다운 */}
            <div className={`${styles.profileDropdown} ${profileDropdownOpen ? styles.open : ''}`}>
              <div className={styles.profileInfo}>
                <div className={styles.profileName}>{userName}</div>
                <div className={styles.profileEmail}>{userEmail}</div>
              </div>

              <button className={styles.profileMenuItem}>
                <span className={styles.profileMenuIcon}>👤</span>
                내 프로필
              </button>

              <button className={styles.profileMenuItem}>
                <span className={styles.profileMenuIcon}>⚙️</span>
                계정 설정
              </button>

              <button className={styles.profileMenuItem}>
                <span className={styles.profileMenuIcon}>🎨</span>
                테마 설정
              </button>

              <button className={styles.profileMenuItem}>
                <span className={styles.profileMenuIcon}>❓</span>
                도움말
              </button>

              <button
                className={`${styles.profileMenuItem} ${styles.danger}`}
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onLogout?.();
                }}
              >
                <span className={styles.profileMenuIcon}>🚪</span>
                로그아웃
              </button>
            </div>
          </div>

          {/* 모바일 햄버거 메뉴 */}
          <button
            className={styles.mobileMenuButton}
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className={styles.hamburgerIcon}>☰</span>
          </button>
        </div>
      </header>

      {/* 모바일 메뉴 */}
      <div
        className={`${styles.mobileMenuOverlay} ${mobileMenuOpen ? styles.open : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.mobileMenuHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              {logoText.charAt(0).toUpperCase()}
            </div>
            <span>{logoText}</span>
          </div>
          <button className={styles.closeButton} onClick={() => setMobileMenuOpen(false)}>
            ✕
          </button>
        </div>

        {menuItems.map((item, index) => (
          <div key={index}>
            {item.href && !item.children ? (
              <Link
                href={item.href}
                className={`${styles.mobileMenuItem} ${isMenuActive(item) ? styles.active : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <>
                <div className={`${styles.mobileMenuItem} ${isMenuActive(item) ? styles.active : ''}`}>
                  {item.label}
                </div>
                {item.children && (
                  <div className={styles.mobileSubMenu}>
                    {item.children.map((child, childIndex) => (
                      <Link
                        key={childIndex}
                        href={child.href}
                        className={`${styles.mobileSubMenuItem} ${pathname === child.href ? styles.active : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
};
