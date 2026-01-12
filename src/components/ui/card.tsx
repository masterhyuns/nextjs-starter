/**
 * Card 컴포넌트 (SCSS Module 사용 예시)
 *
 * 왜 이렇게 구현했는가?
 * - SCSS Module로 스타일 스코프 격리
 * - Tailwind와 SCSS를 함께 사용하는 예시
 * - 재사용 가능한 카드 컴포넌트
 *
 * SCSS Module vs Tailwind:
 * - SCSS Module: 복잡한 스타일, 컴포넌트별 고유 스타일
 * - Tailwind: 간단한 유틸리티, 빠른 프로토타이핑
 * - 함께 사용: 최상의 개발 경험
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import styles from './card.module.scss';

/**
 * Card Props 인터페이스
 */
export interface CardProps {
  /** 카드 제목 */
  title?: string;
  /** 카드 내용 */
  children: React.ReactNode;
  /** 푸터 영역 */
  footer?: React.ReactNode;
  /** 카드 variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  /** 카드 크기 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 로딩 상태 */
  loading?: boolean;
  /** 추가 클래스명 (Tailwind) */
  className?: string;
  /** 클릭 이벤트 */
  onClick?: () => void;
}

/**
 * Card 컴포넌트
 *
 * SCSS Module 사용 예시:
 * - styles.card: SCSS Module 클래스
 * - styles[variant]: 동적 variant 클래스
 * - cn(): Tailwind와 SCSS 클래스 결합
 */
export const Card = ({
  title,
  children,
  footer,
  variant = 'default',
  size = 'md',
  loading = false,
  className,
  onClick,
}: CardProps) => {
  return (
    <div
      className={cn(
        // SCSS Module 클래스
        styles.card,
        variant !== 'default' && styles[variant],
        size && styles[size],
        loading && styles.loading,
        // Tailwind 클래스 (추가 스타일링)
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* 헤더 */}
      {title && (
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
      )}

      {/* 본문 */}
      <div className={styles.body}>{children}</div>

      {/* 푸터 */}
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
};

/**
 * Card 사용 예시:
 *
 * 기본 사용:
 * ```tsx
 * <Card title="카드 제목">
 *   카드 내용입니다.
 * </Card>
 * ```
 *
 * Variant 사용:
 * ```tsx
 * <Card title="성공" variant="success">
 *   작업이 완료되었습니다.
 * </Card>
 * ```
 *
 * Footer 사용:
 * ```tsx
 * <Card
 *   title="확인"
 *   footer={
 *     <>
 *       <Button variant="secondary">취소</Button>
 *       <Button variant="primary">확인</Button>
 *     </>
 *   }
 * >
 *   내용을 확인해주세요.
 * </Card>
 * ```
 *
 * Tailwind와 함께 사용:
 * ```tsx
 * <Card
 *   title="믹스"
 *   className="w-full max-w-md mx-auto" // Tailwind 클래스
 * >
 *   SCSS Module + Tailwind 조합
 * </Card>
 * ```
 *
 * 로딩 상태:
 * ```tsx
 * <Card title="로딩 중" loading>
 *   데이터를 불러오는 중...
 * </Card>
 * ```
 */
