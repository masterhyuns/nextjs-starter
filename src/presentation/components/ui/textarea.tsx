/**
 * Textarea 컴포넌트
 *
 * 왜 필요한가?
 * - 여러 줄 텍스트 입력 UI
 * - 댓글, 설명, 메모 등에 사용
 * - 일관된 디자인 시스템
 *
 * 디자인 원칙:
 * - react-hook-form과 호환
 * - 접근성 고려
 * - 글자 수 제한 표시
 */

'use client';

import * as React from 'react';
import { cn } from '@/shared/utils';

/**
 * Textarea Props 인터페이스
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** 라벨 */
  label?: string;
  /** 에러 메시지 */
  error?: string;
  /** 도움말 텍스트 */
  helperText?: string;
  /** 글자 수 표시 여부 */
  showCount?: boolean;
  /** 자동 높이 조절 */
  autoResize?: boolean;
}

/**
 * Textarea 컴포넌트
 *
 * forwardRef 사용 이유:
 * - react-hook-form의 register와 호환
 * - ref를 통해 DOM 접근 가능
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      showCount = false,
      autoResize = false,
      maxLength,
      disabled,
      ...props
    },
    ref
  ) => {
    const [count, setCount] = React.useState(0);
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    /**
     * ref 결합
     *
     * 왜 필요한가?
     * - 외부 ref (react-hook-form)
     * - 내부 ref (auto resize, count)
     * - 두 개의 ref를 모두 지원
     */
    const combinedRef = React.useCallback(
      (element: HTMLTextAreaElement) => {
        textareaRef.current = element;
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
      },
      [ref]
    );

    /**
     * 자동 높이 조절
     *
     * 왜 필요한가?
     * - 텍스트 양에 따라 높이 자동 조정
     * - 스크롤 없이 전체 내용 표시
     */
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea && autoResize) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [autoResize]);

    /**
     * 입력 핸들러
     */
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(e.target.value.length);
      adjustHeight();
      props.onChange?.(e);
    };

    /**
     * 초기 높이 조절
     */
    React.useEffect(() => {
      adjustHeight();
    }, [adjustHeight]);

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

        {/* Textarea 요소 */}
        <textarea
          ref={combinedRef}
          disabled={disabled}
          maxLength={maxLength}
          className={cn(
            'block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors',
            'focus:outline-none focus:ring-2',
            'resize-y', // 세로 크기 조절만 허용
            error
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500',
            disabled && 'cursor-not-allowed bg-gray-50 text-gray-500',
            autoResize && 'resize-none', // auto resize 시 수동 조절 막기
            className
          )}
          onChange={handleChange}
          {...props}
        />

        {/* 하단 정보 영역 */}
        <div className="mt-1 flex items-center justify-between">
          {/* 도움말 또는 에러 메시지 */}
          <p className={cn('text-sm', error ? 'text-red-600' : 'text-gray-500')}>
            {error || helperText || ''}
          </p>

          {/* 글자 수 표시 */}
          {showCount && (
            <p className="text-sm text-gray-500">
              {count}
              {maxLength && ` / ${maxLength}`}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * Textarea 사용 예시:
 *
 * 기본 사용:
 * - label, placeholder 속성 설정
 * - react-hook-form의 register와 함께 사용
 *
 * 글자 수 제한:
 * - maxLength 속성으로 최대 글자 수 설정
 * - showCount 속성으로 현재/최대 글자 수 표시
 *
 * 자동 높이 조절:
 * - autoResize 속성 사용
 * - 텍스트 양에 따라 높이 자동 조정
 * - rows로 초기 높이 설정
 *
 * 필수 입력 및 검증:
 * - required 규칙 설정
 * - minLength, maxLength 검증
 * - error 속성으로 에러 메시지 표시
 *
 * 마크다운 에디터 등 고급 사용:
 * - 여러 옵션 조합 가능
 * - helperText로 사용 가이드 제공
 */
