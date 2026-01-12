/**
 * Select 컴포넌트
 *
 * 왜 필요한가?
 * - 드롭다운 선택 UI
 * - 폼 검증과 통합
 * - 일관된 디자인 시스템
 *
 * 디자인 원칙:
 * - react-hook-form과 호환
 * - 접근성 고려 (label, aria)
 * - 에러 상태 표시
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Select Option 타입
 */
export interface SelectOption {
  /** 옵션 값 */
  value: string;
  /** 옵션 레이블 */
  label: string;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * Select Props 인터페이스
 */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** 라벨 */
  label?: string;
  /** 에러 메시지 */
  error?: string;
  /** 도움말 텍스트 */
  helperText?: string;
  /** 옵션 목록 */
  options: SelectOption[];
  /** 플레이스홀더 */
  placeholder?: string;
}

/**
 * Select 컴포넌트
 *
 * forwardRef 사용 이유:
 * - react-hook-form의 register와 호환
 * - ref를 통해 DOM 접근 가능
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder = '선택하세요',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {/* 라벨 */}
        {label && (
          <label
            htmlFor={props.id || props.name}
            className={cn(
              'mb-2 block text-sm font-medium',
              error ? 'text-red-700' : 'text-gray-700'
            )}
          >
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        {/* Select 요소 */}
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            'block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors',
            'focus:outline-none focus:ring-2',
            error
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500',
            disabled && 'cursor-not-allowed bg-gray-50 text-gray-500',
            className
          )}
          {...props}
        >
          {/* 플레이스홀더 옵션 */}
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {/* 옵션 목록 */}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        {/* 도움말 또는 에러 메시지 */}
        {(helperText || error) && (
          <p
            className={cn(
              'mt-1 text-sm',
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

Select.displayName = 'Select';

/**
 * Select 사용 예시:
 *
 * 기본 사용법:
 * - options 배열로 선택 항목 정의
 * - value와 label 속성 필수
 * - react-hook-form의 register와 함께 사용
 *
 * 필수 입력:
 * - required 속성 추가
 * - register의 rules로 검증 규칙 설정
 * - error 속성으로 에러 메시지 표시
 *
 * 비활성화:
 * - disabled 속성을 특정 옵션에 설정 가능
 * - Select 전체도 disabled 가능
 */
