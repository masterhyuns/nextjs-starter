/**
 * Radio 컴포넌트
 *
 * 왜 필요한가?
 * - 단일 선택 UI (여러 옵션 중 하나)
 * - 설문조사, 설정 등에 사용
 * - 일관된 디자인 시스템
 *
 * 디자인 원칙:
 * - react-hook-form과 호환
 * - 접근성 고려
 * - Radio 그룹 지원
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Radio Props 인터페이스
 */
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** 라벨 */
  label?: string;
  /** 라벨 위치 */
  labelPosition?: 'left' | 'right';
}

/**
 * Radio 컴포넌트
 *
 * forwardRef 사용 이유:
 * - react-hook-form의 register와 호환
 * - ref를 통해 DOM 접근 가능
 */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, labelPosition = 'right', disabled, ...props }, ref) => {
    const radioElement = (
      <input
        ref={ref}
        type="radio"
        disabled={disabled}
        className={cn(
          'h-4 w-4 border transition-colors',
          'focus:ring-2 focus:ring-offset-2',
          'border-gray-300 text-blue-600 focus:ring-blue-500',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        {...props}
      />
    );

    const labelElement = label && (
      <span
        className={cn(
          'text-sm font-medium text-gray-700',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {label}
        {props.required && <span className="ml-1 text-red-500">*</span>}
      </span>
    );

    return (
      <label
        htmlFor={props.id}
        className={cn(
          'flex items-center gap-2',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        {labelPosition === 'left' && labelElement}
        {radioElement}
        {labelPosition === 'right' && labelElement}
      </label>
    );
  }
);

Radio.displayName = 'Radio';

/**
 * RadioGroup Props 인터페이스
 */
export interface RadioGroupProps {
  /** 그룹 라벨 */
  label?: string;
  /** 라디오 옵션 목록 */
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  /** 그룹 이름 */
  name: string;
  /** 에러 메시지 */
  error?: string;
  /** 도움말 텍스트 */
  helperText?: string;
  /** 선택된 값 */
  value?: string;
  /** 변경 핸들러 */
  onChange?: (value: string) => void;
  /** 레이아웃 방향 */
  direction?: 'horizontal' | 'vertical';
}

/**
 * RadioGroup 컴포넌트
 *
 * 왜 별도로 만드는가?
 * - 여러 Radio를 그룹으로 관리
 * - 공통 에러 메시지 표시
 * - 레이아웃 옵션 제공
 */
export const RadioGroup = ({
  label,
  options,
  name,
  error,
  helperText,
  value,
  onChange,
  direction = 'vertical',
}: RadioGroupProps) => {
  return (
    <div className="w-full">
      {/* 그룹 라벨 */}
      {label && (
        <p
          className={cn(
            'mb-2 text-sm font-medium',
            error ? 'text-red-700' : 'text-gray-700'
          )}
        >
          {label}
        </p>
      )}

      {/* Radio 옵션들 */}
      <div
        className={cn(
          'flex gap-4',
          direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
        )}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            label={option.label}
            disabled={option.disabled}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
          />
        ))}
      </div>

      {/* 도움말 또는 에러 메시지 */}
      {(helperText || error) && (
        <p className={cn('mt-1 text-sm', error ? 'text-red-600' : 'text-gray-500')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

/**
 * Radio 사용 예시:
 *
 * 방법 1 - 개별 Radio 사용:
 * - 각 Radio 컴포넌트를 직접 렌더링
 * - 같은 name 속성으로 그룹화
 * - react-hook-form의 register 사용
 *
 * 방법 2 - RadioGroup 사용 (권장):
 * - options 배열로 옵션 정의
 * - Controller로 감싸서 사용
 * - 에러 메시지 통합 관리
 * - 수평/수직 레이아웃 선택 가능
 *
 * RadioGroup 레이아웃:
 * - direction="vertical": 세로 배치 (기본값)
 * - direction="horizontal": 가로 배치
 */
