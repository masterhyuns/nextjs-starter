/**
 * 탭 상태 관리 스토어
 *
 * 왜 필요한가?
 * - 단일 페이지에서 여러 탭 관리
 * - 탭 간 상태 공유
 * - URL 파라미터와 동기화 가능
 *
 * 사용 사례:
 * - 대시보드의 여러 섹션
 * - 설정 페이지의 카테고리
 * - 상품 상세 페이지의 정보 탭
 */

import { create } from 'zustand';

/**
 * 탭 아이템 인터페이스
 *
 * 왜 별도로 정의하는가?
 * - 재사용 가능한 탭 구조
 * - 타입 안전성
 */
export interface TabItem<T = string> {
  /** 탭 고유 ID */
  id: T;
  /** 탭 라벨 (UI에 표시될 텍스트) */
  label: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 아이콘 (선택적) */
  icon?: string;
  /** 배지 (알림 수 등) */
  badge?: number;
}

/**
 * 탭 상태 인터페이스
 *
 * 제네릭을 사용하는 이유:
 * - 다양한 타입의 탭 ID 지원 (string, number, enum 등)
 * - 타입 안전성 향상
 */
interface TabState<T = string> {
  /** 현재 활성화된 탭 ID */
  activeTab: T | null;
  /** 모든 탭 목록 */
  tabs: TabItem<T>[];
}

/**
 * 탭 액션 인터페이스
 */
interface TabActions<T = string> {
  /**
   * 탭 초기화
   *
   * 언제 호출하는가?
   * - 페이지 마운트 시
   * - 탭 구조가 변경될 때
   *
   * @param tabs - 탭 목록
   * @param defaultTab - 기본 활성 탭 (선택적)
   */
  setTabs: (tabs: TabItem<T>[], defaultTab?: T) => void;

  /**
   * 활성 탭 변경
   *
   * @param tabId - 활성화할 탭 ID
   */
  setActiveTab: (tabId: T) => void;

  /**
   * 다음 탭으로 이동
   *
   * 왜 필요한가?
   * - 키보드 네비게이션 지원
   * - 스텝 형식의 UI 구현
   */
  nextTab: () => void;

  /**
   * 이전 탭으로 이동
   */
  previousTab: () => void;

  /**
   * 특정 탭 비활성화/활성화
   *
   * @param tabId - 탭 ID
   * @param disabled - 비활성화 여부
   */
  setTabDisabled: (tabId: T, disabled: boolean) => void;

  /**
   * 탭 배지 업데이트
   *
   * @param tabId - 탭 ID
   * @param badge - 배지 숫자
   */
  setTabBadge: (tabId: T, badge?: number) => void;

  /**
   * 탭 상태 초기화
   */
  resetTabs: () => void;
}

/**
 * 전체 탭 스토어 타입
 */
type TabStore<T = string> = TabState<T> & TabActions<T>;

/**
 * 탭 스토어 생성
 *
 * 제네릭 사용 예시:
 * - const useProductTabs = createTabStore<'info' | 'reviews' | 'related'>();
 * - const useSettingsTabs = createTabStore<number>();
 */
export const useTabStore = create<TabStore>()((set, get) => ({
      // ==================== 초기 상태 ====================
      activeTab: null,
      tabs: [],

      // ==================== 액션 ====================

      /**
       * 탭 초기화
       */
      setTabs: (tabs, defaultTab) => {
        const firstTab = defaultTab || tabs[0]?.id;

        set({
          tabs,
          activeTab: firstTab || null,
        });
      },

      /**
       * 활성 탭 변경
       */
      setActiveTab: (tabId) => {
        const { tabs } = get();
        const tab = tabs.find((t) => t.id === tabId);

        // 비활성화된 탭은 선택 불가
        if (tab && !tab.disabled) {
          set({ activeTab: tabId });
        }
      },

      /**
       * 다음 탭으로 이동
       */
      nextTab: () => {
        const { tabs, activeTab } = get();
        const currentIndex = tabs.findIndex((t) => t.id === activeTab);

        // 마지막 탭이 아니면 다음 탭으로
        if (currentIndex < tabs.length - 1) {
          const nextTab = tabs[currentIndex + 1];
          if (!nextTab.disabled) {
            set({ activeTab: nextTab.id });
          }
        }
      },

      /**
       * 이전 탭으로 이동
       */
      previousTab: () => {
        const { tabs, activeTab } = get();
        const currentIndex = tabs.findIndex((t) => t.id === activeTab);

        // 첫 번째 탭이 아니면 이전 탭으로
        if (currentIndex > 0) {
          const prevTab = tabs[currentIndex - 1];
          if (!prevTab.disabled) {
            set({ activeTab: prevTab.id });
          }
        }
      },

      /**
       * 탭 비활성화 상태 변경
       */
      setTabDisabled: (tabId, disabled) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, disabled } : tab
          ),
        }));
      },

      /**
       * 탭 배지 업데이트
       */
      setTabBadge: (tabId, badge) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, badge } : tab
          ),
        }));
      },

      /**
       * 탭 상태 초기화
       */
      resetTabs: () => {
        set({
          activeTab: null,
          tabs: [],
        });
      },
    }));

/**
 * 탭 스토어 사용 예시:
 *
 * ```tsx
 * const MyTabPage = () => {
 *   const { tabs, activeTab, setTabs, setActiveTab } = useTabStore();
 *
 *   useEffect(() => {
 *     setTabs([
 *       { id: 'profile', label: '프로필' },
 *       { id: 'settings', label: '설정' },
 *       { id: 'history', label: '기록', badge: 5 },
 *     ], 'profile');
 *   }, []);
 *
 *   return (
 *     <div>
 *       {tabs.map((tab) => (
 *         <button
 *           key={tab.id}
 *           onClick={() => setActiveTab(tab.id)}
 *           disabled={tab.disabled}
 *         >
 *           {tab.label}
 *           {tab.badge && <span>{tab.badge}</span>}
 *         </button>
 *       ))}
 *
 *       {activeTab === 'profile' && <ProfileTab />}
 *       {activeTab === 'settings' && <SettingsTab />}
 *       {activeTab === 'history' && <HistoryTab />}
 *     </div>
 *   );
 * };
 * ```
 */
