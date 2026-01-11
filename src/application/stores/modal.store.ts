/**
 * 모달 상태 관리 스토어
 *
 * 왜 필요한가?
 * - 여러 모달을 중앙에서 관리
 * - 모달 스택 관리 (여러 모달을 순서대로 열기)
 * - 프로그래매틱하게 모달 제어
 *
 * React Context vs Zustand:
 * - Context: 컴포넌트 트리에 의존, Provider 필요
 * - Zustand: 어디서든 접근 가능, 더 간단한 API
 */

import { create } from 'zustand';

/**
 * 모달 아이템 인터페이스
 *
 * 왜 id를 사용하는가?
 * - 여러 모달을 동시에 관리
 * - 특정 모달만 닫기 가능
 */
export interface ModalItem {
  /** 모달 고유 ID */
  id: string;
  /** 모달 타이틀 */
  title?: string;
  /** 모달 내용 (React 컴포넌트 또는 텍스트) */
  content: React.ReactNode;
  /** 닫기 버튼 숨김 여부 */
  hideCloseButton?: boolean;
  /** 오버레이 클릭 시 닫기 방지 */
  disableBackdropClick?: boolean;
  /** 모달 크기 */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** 모달 닫힘 콜백 */
  onClose?: () => void;
}

/**
 * 모달 상태 인터페이스
 */
interface ModalState {
  /** 열려있는 모달 스택 */
  modals: ModalItem[];
}

/**
 * 모달 액션 인터페이스
 */
interface ModalActions {
  /**
   * 모달 열기
   *
   * @param modal - 모달 정보
   * @returns 모달 ID
   */
  openModal: (modal: Omit<ModalItem, 'id'>) => string;

  /**
   * 모달 닫기
   *
   * @param id - 닫을 모달 ID (없으면 가장 최근 모달 닫기)
   */
  closeModal: (id?: string) => void;

  /**
   * 모든 모달 닫기
   */
  closeAllModals: () => void;

  /**
   * 특정 모달이 열려있는지 확인
   *
   * @param id - 모달 ID
   * @returns 열림 여부
   */
  isModalOpen: (id: string) => boolean;
}

/**
 * 전체 모달 스토어 타입
 */
type ModalStore = ModalState & ModalActions;

/**
 * 고유 ID 생성 함수
 *
 * 왜 이 방식을 사용하는가?
 * - 간단하고 충분히 유니크함
 * - 타임스탬프 + 랜덤 값으로 충돌 방지
 * - 외부 라이브러리 불필요
 */
const generateId = (): string => {
  return `modal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * 모달 스토어 생성
 */
export const useModalStore = create<ModalStore>()((set, get) => ({
      // ==================== 초기 상태 ====================
      modals: [],

      // ==================== 액션 ====================

      /**
       * 모달 열기
       */
      openModal: (modal) => {
        const id = generateId();

        const newModal: ModalItem = {
          id,
          ...modal,
        };

        // 모달 스택에 추가
        set((state) => ({
          modals: [...state.modals, newModal],
        }));

        return id;
      },

      /**
       * 모달 닫기
       */
      closeModal: (id) => {
        set((state) => {
          // ID가 주어지지 않으면 가장 최근 모달 닫기
          if (!id) {
            const modals = [...state.modals];
            const closedModal = modals.pop();
            closedModal?.onClose?.();
            return { modals };
          }

          // 특정 ID의 모달 닫기
          const closedModal = state.modals.find((m) => m.id === id);
          closedModal?.onClose?.();

          return {
            modals: state.modals.filter((m) => m.id !== id),
          };
        });
      },

      /**
       * 모든 모달 닫기
       */
      closeAllModals: () => {
        const { modals } = get();

        // 모든 모달의 onClose 콜백 호출
        modals.forEach((modal) => modal.onClose?.());

        set({ modals: [] });
      },

      /**
       * 모달 열림 여부 확인
       */
      isModalOpen: (id) => {
        const { modals } = get();
        return modals.some((m) => m.id === id);
      },
    }));

/**
 * 편의 함수: 확인 다이얼로그
 *
 * Note: JSX를 사용하려면 별도의 컴포넌트 파일로 분리하거나
 * React를 import해야 합니다. 여기서는 예시로만 제공합니다.
 *
 * @example
 * const confirmed = await confirmDialog({
 *   title: '삭제 확인',
 *   message: '정말 삭제하시겠습니까?',
 * });
 */
// export const confirmDialog = (options) => { ... };

/**
 * 편의 함수: 알림 다이얼로그
 */
// export const alertDialog = (options) => { ... };

/**
 * 모달 스토어 사용 예시:
 *
 * ```tsx
 * // 1. 기본 사용
 * const { openModal, closeModal } = useModalStore();
 *
 * const handleOpenModal = () => {
 *   const modalId = openModal({
 *     title: '사용자 정보',
 *     content: <UserProfileForm />,
 *     size: 'md',
 *   });
 * };
 *
 * // 2. 확인 다이얼로그
 * const handleDelete = async () => {
 *   const confirmed = await confirmDialog({
 *     title: '삭제 확인',
 *     message: '정말 삭제하시겠습니까?',
 *     confirmText: '삭제',
 *     cancelText: '취소',
 *   });
 *
 *   if (confirmed) {
 *     await deleteItem();
 *   }
 * };
 *
 * // 3. 알림 다이얼로그
 * await alertDialog({
 *   title: '성공',
 *   message: '저장되었습니다',
 * });
 * ```
 */
