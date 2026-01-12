/**
 * 403 Forbidden 페이지
 *
 * 왜 필요한가?
 * - 역할 기반 접근 제어(RBAC)에서 권한 없는 사용자 안내
 * - admin 페이지에 일반 user가 접근 시도할 때
 * - 명확한 에러 메시지로 사용자 혼란 방지
 *
 * 사용 시나리오:
 * - user 역할로 /admin 접근 시도
 * - guest 역할로 특정 기능 접근 시도
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        {/* 에러 코드 */}
        <h1 className="text-9xl font-bold text-gray-200">403</h1>

        {/* 에러 메시지 */}
        <div className="mt-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            접근 권한이 없습니다
          </h2>
          <p className="mt-2 text-gray-600">
            이 페이지에 접근할 권한이 없습니다.
            <br />
            관리자에게 문의하거나 대시보드로 돌아가세요.
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            이전 페이지
          </button>

          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            대시보드로 이동
          </Link>
        </div>

        {/* 추가 안내 */}
        <div className="mt-8 text-sm text-gray-500">
          <p>권한이 필요한 경우 관리자에게 문의하세요.</p>
        </div>
      </div>
    </div>
  );
}
