/**
 * Modal Provider
 *
 * 왜 필요한가?
 * - Zustand modal store와 UI Modal 컴포넌트 연결
 * - 전역에서 선언적으로 모달 관리
 * - 여러 모달을 스택으로 관리 가능
 *
 * 사용 방법:
 * 1. app/layout.tsx에 ModalProvider 추가
 * 2. 컴포넌트에서 useModalStore 사용
 * 3. openModal()로 모달 열기
 */

'use client';

import { useModalStore } from '@/lib/modal.store';
import { Modal } from '@/components/ui/modal';

/**
 * ModalProvider 컴포넌트
 *
 * 역할:
 * - modal store의 modals 배열을 구독
 * - 각 모달을 Modal 컴포넌트로 렌더링
 * - 모달 스택 관리 (여러 모달 동시 표시)
 */
export const ModalProvider = () => {
  /**
   * Zustand store에서 모달 목록과 닫기 함수 가져오기
   *
   * 왜 closeModal만 가져오는가?
   * - openModal은 이미 다른 컴포넌트에서 호출
   * - Provider는 렌더링과 닫기만 담당
   */
  const { modals, closeModal } = useModalStore();

  return (
    <>
      {/**
       * 모달 배열을 순회하며 렌더링
       *
       * 왜 map을 사용하는가?
       * - 여러 모달을 동시에 표시 가능 (모달 스택)
       * - 각 모달은 독립적으로 관리
       */}
      {modals.map((modal) => (
        <Modal
          key={modal.id}
          isOpen={true}
          onClose={() => {
            // 모달 닫기 전 콜백 실행
            modal.onClose?.();
            // store에서 모달 제거
            closeModal(modal.id);
          }}
          title={modal.title}
          size={modal.size}
          hideCloseButton={modal.hideCloseButton}
          disableBackdropClick={modal.disableBackdropClick}
        >
          {modal.content}
        </Modal>
      ))}
    </>
  );
};

/**
 * ModalProvider 사용 예시:
 *
 * app/layout.tsx:
 * ```tsx
 * import { ModalProvider } from '@/components/providers/modal-provider';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <ModalProvider />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * 컴포넌트에서 사용:
 * ```tsx
 * import { useModalStore } from '@/lib/modal.store';
 * import { Button } from '@/components/ui/button';
 *
 * function MyComponent() {
 *   const { openModal, closeModal } = useModalStore();
 *
 *   const handleOpenModal = () => {
 *     const modalId = openModal({
 *       title: '알림',
 *       content: (
 *         <div>
 *           <p>저장되었습니다!</p>
 *           <Button onClick={() => closeModal(modalId)}>
 *             확인
 *           </Button>
 *         </div>
 *       ),
 *       size: 'sm',
 *     });
 *   };
 *
 *   return (
 *     <Button onClick={handleOpenModal}>
 *       저장
 *     </Button>
 *   );
 * }
 * ```
 *
 * 확인 다이얼로그 예시:
 * ```tsx
 * const handleDelete = () => {
 *   openModal({
 *     title: '삭제 확인',
 *     content: (
 *       <div className="space-y-4">
 *         <p>정말 삭제하시겠습니까?</p>
 *         <div className="flex gap-2 justify-end">
 *           <Button
 *             variant="secondary"
 *             onClick={() => closeModal()}
 *           >
 *             취소
 *           </Button>
 *           <Button
 *             variant="danger"
 *             onClick={async () => {
 *               await deleteItem();
 *               closeModal();
 *             }}
 *           >
 *             삭제
 *           </Button>
 *         </div>
 *       </div>
 *     ),
 *     size: 'sm',
 *     disableBackdropClick: true,
 *   });
 * };
 * ```
 */
