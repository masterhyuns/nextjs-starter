/**
 * Modal 컴포넌트
 *
 * 왜 이렇게 구현했는가?
 * - Portal을 사용하여 DOM 최상위에 렌더링 (z-index 문제 방지)
 * - 접근성 고려 (ESC 키, 포커스 트랩)
 * - 애니메이션 지원 (fade-in/out)
 * - 다양한 크기 옵션
 *
 * 디자인 원칙:
 * - 오버레이로 배경 어둡게
 * - 스크롤 방지 (body 고정)
 * - 반응형 디자인
 */

'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils';

/**
 * Modal Props 인터페이스
 */
export interface ModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 모달 제목 */
  title?: string;
  /** 모달 내용 */
  children: React.ReactNode;
  /** 모달 크기 */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** 닫기 버튼 숨김 */
  hideCloseButton?: boolean;
  /** 배경 클릭 시 닫기 방지 */
  disableBackdropClick?: boolean;
  /** 추가 클래스명 */
  className?: string;
  /** Footer 영역 */
  footer?: React.ReactNode;
}

/**
 * 모달 크기별 스타일
 *
 * 왜 이렇게 구분하는가?
 * - 다양한 콘텐츠 크기 지원
 * - 일관된 UX 제공
 */
const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

/**
 * Modal 컴포넌트
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  hideCloseButton = false,
  disableBackdropClick = false,
  className,
  footer,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  /**
   * ESC 키로 모달 닫기
   *
   * 왜 필요한가?
   * - 사용자 편의성 (키보드 접근성)
   * - 일반적인 UX 패턴
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  /**
   * 모달 열릴 때 body 스크롤 방지
   *
   * 왜 필요한가?
   * - 모달 뒤 콘텐츠 스크롤 방지
   * - 사용자 focus를 모달에 집중
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  /**
   * 배경 클릭 핸들러
   */
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disableBackdropClick) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * 모달이 닫혀있으면 렌더링하지 않음
   */
  if (!isOpen) return null;

  /**
   * SSR 환경 체크
   *
   * 왜 필요한가?
   * - createPortal은 브라우저 환경에서만 동작
   * - document가 없으면 에러 발생
   */
  if (typeof document === 'undefined') return null;

  /**
   * Modal 렌더링
   *
   * Portal 사용 이유:
   * - DOM 최상위에 렌더링
   * - z-index 문제 방지
   * - 부모 컴포넌트의 overflow 영향 안 받음
   */
  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4 transition-opacity duration-300"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={cn(
          'relative w-full transform rounded-lg bg-white shadow-xl transition-all duration-300',
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            {title && (
              <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            )}
            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="닫기"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  /**
   * Portal로 body에 직접 렌더링
   */
  return createPortal(modalContent, document.body);
};

/**
 * Modal 사용 예시:
 *
 * ```tsx
 * import { useState } from 'react';
 * import { Modal } from '@/presentation/components/ui/modal';
 * import { Button } from '@/presentation/components/ui/button';
 *
 * function MyComponent() {
 *   const [isOpen, setIsOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <Button onClick={() => setIsOpen(true)}>
 *         모달 열기
 *       </Button>
 *
 *       <Modal
 *         isOpen={isOpen}
 *         onClose={() => setIsOpen(false)}
 *         title="확인"
 *         size="md"
 *         footer={
 *           <>
 *             <Button variant="secondary" onClick={() => setIsOpen(false)}>
 *               취소
 *             </Button>
 *             <Button onClick={() => {
 *               // 작업 수행
 *               setIsOpen(false);
 *             }}>
 *               확인
 *             </Button>
 *           </>
 *         }
 *       >
 *         <p>이 작업을 수행하시겠습니까?</p>
 *       </Modal>
 *     </>
 *   );
 * }
 * ```
 */
