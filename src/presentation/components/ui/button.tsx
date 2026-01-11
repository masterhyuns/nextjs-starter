/**
 * Button 컴포넌트
 *
 * 왜 class-variance-authority를 사용하는가?
 * - Variant 기반 스타일링 (primary, secondary 등)
 * - Tailwind CSS와 완벽 호환
 * - 타입 안전성
 * - 조건부 스타일 간편 관리
 */

'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils';

/**
 * Button variant 정의
 *
 * CVA (Class Variance Authority) 사용 이유:
 * - variant별 스타일을 명확하게 정의
 * - 타입 안전성 확보
 * - 조합 가능한 스타일 시스템
 */
const buttonVariants = cva(
  // 기본 스타일 (모든 버튼에 공통 적용)
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      // variant: 버튼 종류
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-500',
        ghost: 'hover:bg-gray-100 focus-visible:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
        success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600',
      },
      // size: 버튼 크기
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
      // fullWidth: 전체 너비
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    // 기본값
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

/**
 * Button Props 인터페이스
 *
 * React.ComponentPropsWithoutRef<'button'>를 확장하는 이유:
 * - 네이티브 button의 모든 속성 지원 (onClick, disabled 등)
 * - 타입 안전성
 * - VariantProps로 CVA variant 타입 자동 추론
 */
export interface ButtonProps
  extends React.ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof buttonVariants> {
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 로딩 텍스트 */
  loadingText?: string;
  /** 왼쪽 아이콘 */
  leftIcon?: React.ReactNode;
  /** 오른쪽 아이콘 */
  rightIcon?: React.ReactNode;
}

/**
 * Button 컴포넌트
 *
 * 왜 React.forwardRef를 사용하는가?
 * - 부모 컴포넌트에서 ref로 DOM 엘리먼트 접근 가능
 * - 폼 라이브러리와 통합 시 필수
 * - React 권장 패턴
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* 로딩 상태 */}
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* 왼쪽 아이콘 */}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}

        {/* 버튼 텍스트 */}
        {isLoading && loadingText ? loadingText : children}

        {/* 오른쪽 아이콘 */}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

/**
 * 사용 예시:
 *
 * ```tsx
 * // 기본 사용
 * <Button onClick={handleClick}>클릭</Button>
 *
 * // Variant 적용
 * <Button variant="secondary">보조 버튼</Button>
 * <Button variant="danger">삭제</Button>
 *
 * // 크기 조절
 * <Button size="sm">작은 버튼</Button>
 * <Button size="lg">큰 버튼</Button>
 *
 * // 전체 너비
 * <Button fullWidth>전체 너비 버튼</Button>
 *
 * // 로딩 상태
 * <Button isLoading loadingText="로딩중...">
 *   제출
 * </Button>
 *
 * // 아이콘 포함
 * <Button leftIcon={<Icon />}>저장</Button>
 * <Button rightIcon={<Icon />}>다음</Button>
 * ```
 */
