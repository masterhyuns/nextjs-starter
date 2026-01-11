/**
 * Checkbox 컴포넌트
 *
 * 왜 필요한가?
 * - 단일/다중 선택 UI
 * - 약관 동의, 옵션 선택 등에 사용
 * - 일관된 디자인 시스템
 *
 * 디자인 원칙:
 * - react-hook-form과 호환
 * - 접근성 고려
 * - 명확한 레이블
 */

'use client';

import * as React from 'react';
import { cn } from '@/shared/utils';

/**
 * Checkbox Props 인터페이스
 */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** 라벨 */
  label?: string;
  /** 에러 메시지 */
  error?: string;
  /** 도움말 텍스트 */
  helperText?: string;
  /** 라벨 위치 */
  labelPosition?: 'left' | 'right';
}

/**
 * Checkbox 컴포넌트
 *
 * forwardRef 사용 이유:
 * - react-hook-form의 register와 호환
 * - ref를 통해 DOM 접근 가능
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      labelPosition = 'right',
      disabled,
      ...props
    },
    ref
  ) => {
    const checkboxElement = (
      <input
        ref={ref}
        type="checkbox"
        disabled={disabled}
        className={cn(
          'h-4 w-4 rounded border transition-colors',
          'focus:ring-2 focus:ring-offset-2',
          error
            ? 'border-red-300 text-red-600 focus:ring-red-500'
            : 'border-gray-300 text-blue-600 focus:ring-blue-500',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        {...props}
      />
    );

    const labelElement = label && (
      <span
        className={cn(
          'text-sm font-medium',
          error ? 'text-red-700' : 'text-gray-700',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {label}
        {props.required && <span className="ml-1 text-red-500">*</span>}
      </span>
    );

    return (
      <div className="w-full">
        {/* Checkbox와 Label */}
        <label
          htmlFor={props.id || props.name}
          className={cn(
            'flex items-center gap-2',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          )}
        >
          {labelPosition === 'left' && labelElement}
          {checkboxElement}
          {labelPosition === 'right' && labelElement}
        </label>

        {/* 도움말 또는 에러 메시지 */}
        {(helperText || error) && (
          <p
            className={cn(
              'mt-1 text-sm',
              labelPosition === 'left' ? 'text-right' : 'ml-6',
              error ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

/**
 * Checkbox 사용 예시:
 *
 * 기본 사용:
 * - label 속성으로 레이블 설정
 * - react-hook-form의 register와 함께 사용
 *
 * 필수 체크박스:
 * - required 속성과 함께 사용
 * - error 속성으로 에러 메시지 표시
 *
 * 라벨 위치 변경:
 * - labelPosition="left" 옵션 사용
 *
 * 비활성화:
 * - disabled 속성 사용
 * - helperText로 설명 추가
 *
 * 체크박스 그룹:
 * - 배열을 map으로 순회하여 여러 개 렌더링
 * - 각 체크박스는 독립적인 상태 관리
 */
