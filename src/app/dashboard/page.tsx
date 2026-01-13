/**
 * 대시보드 페이지 (Header + 탭 기능 포함)
 *
 * 이 페이지는 다음을 보여줍니다:
 * - Header 컴포넌트 사용 예시
 * - Zustand 탭 스토어를 활용한 탭 네비게이션
 * - 모달 기능 데모
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/entities/auth';
import { useTabStore } from '@/lib/tab.store';
import { useModalStore } from '@/lib/modal.store';
import { Button } from '@/components/ui/button';
import { MainLayout, type MenuItem } from '@/components/layouts';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { tabs, activeTab, setTabs, setActiveTab } = useTabStore();
  const { openModal, closeModal } = useModalStore();

  // 인증 체크
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // 탭 초기화
  useEffect(() => {
    setTabs([
      { id: 'overview', label: '개요' },
      { id: 'analytics', label: '분석', badge: 3 },
      { id: 'reports', label: '리포트' },
      { id: 'settings', label: '설정' },
    ], 'overview');
  }, [setTabs]);

  /**
   * 헤더 메뉴 설정
   */
  const menuItems: MenuItem[] = [
    { label: '홈', href: '/' },
    { label: '대시보드', href: '/dashboard' },
    {
      label: '프로젝트',
      children: [
        { label: '전체 프로젝트', href: '/projects' },
        { label: '내 프로젝트', href: '/projects/my' },
        { label: '즐겨찾기', href: '/projects/favorites' },
      ],
    },
    {
      label: '리소스',
      children: [
        { label: '문서', href: '/docs' },
        { label: 'API', href: '/api-docs' },
        { label: '가이드', href: '/guides' },
      ],
    },
    { label: '설정', href: '/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  /**
   * 모달 예시 함수들
   */
  const showAlertModal = () => {
    openModal({
      title: '알림',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">작업이 성공적으로 완료되었습니다!</p>
          <div className="flex justify-end">
            <Button onClick={() => closeModal()}>
              확인
            </Button>
          </div>
        </div>
      ),
      size: 'sm',
    });
  };

  const showConfirmModal = () => {
    openModal({
      title: '삭제 확인',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => closeModal()}>
              취소
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                // 삭제 작업 수행
                console.log('삭제됨');
                closeModal();
                showAlertModal(); // 완료 후 알림 표시
              }}
            >
              삭제
            </Button>
          </div>
        </div>
      ),
      size: 'md',
      disableBackdropClick: true,
    });
  };

  const showFormModal = () => {
    openModal({
      title: '사용자 추가',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="이름을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="email@example.com"
            />
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="secondary" onClick={() => closeModal()}>
              취소
            </Button>
            <Button onClick={() => {
              console.log('저장됨');
              closeModal();
            }}>
              저장
            </Button>
          </div>
        </div>
      ),
      size: 'md',
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout
      logoText="Next Starter"
      logoHref="/"
      menuItems={menuItems}
      userName={user?.name || 'User'}
      userEmail={user?.email || 'user@example.com'}
      notificationCount={5}
      onLogout={handleLogout}
    >
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`
                  relative whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }
                  ${tab.disabled ? 'cursor-not-allowed opacity-50' : ''}
                `}
              >
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <main className="bg-gray-50 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">개요</h2>

            {/* 통계 카드 */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium text-gray-900">총 사용자</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600">1,234</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium text-gray-900">이번 달 수익</h3>
                <p className="mt-2 text-3xl font-bold text-green-600">$12,345</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium text-gray-900">활성 세션</h3>
                <p className="mt-2 text-3xl font-bold text-purple-600">567</p>
              </div>
            </div>

            {/* 모달 기능 데모 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                모달 기능 데모 (Zustand Store 활용)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                아래 버튼들을 클릭하여 다양한 모달 기능을 테스트해보세요.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={showAlertModal}>
                  알림 모달
                </Button>
                <Button variant="danger" onClick={showConfirmModal}>
                  확인 모달
                </Button>
                <Button variant="secondary" onClick={showFormModal}>
                  폼 모달
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">분석</h2>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-gray-600">분석 데이터가 여기에 표시됩니다.</p>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">리포트</h2>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-gray-600">리포트가 여기에 표시됩니다.</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">설정</h2>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-gray-600">설정 옵션이 여기에 표시됩니다.</p>
            </div>
          </div>
        )}
      </main>
    </MainLayout>
  );
}
