'use client';

import Link from 'next/link';
import { Button } from '@/presentation/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="max-w-3xl text-center">
        <h1 className="mb-6 text-5xl font-bold text-gray-900">
          Next Clean Starter
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          Clean Architecture와 SOLID 원칙을 적용한<br />
          프로덕션 준비 완료 Next.js 스타터 템플릿
        </p>

        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/login">
            <Button size="lg">로그인하기</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              대시보드 보기
            </Button>
          </Link>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">주요 기능</h2>
          <div className="grid gap-4 text-left sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-gray-900">✅ Clean Architecture</h3>
              <p className="text-sm text-gray-600">도메인 중심 설계</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">✅ SOLID 원칙</h3>
              <p className="text-sm text-gray-600">유지보수 가능한 코드</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">✅ TypeScript</h3>
              <p className="text-sm text-gray-600">타입 안전성</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">✅ Zustand</h3>
              <p className="text-sm text-gray-600">상태 관리</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">✅ 인증 시스템</h3>
              <p className="text-sm text-gray-600">Public/Private 라우트</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">✅ 탭 기능</h3>
              <p className="text-sm text-gray-600">단일 페이지 탭 관리</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
