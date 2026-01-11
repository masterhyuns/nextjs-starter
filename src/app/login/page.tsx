/**
 * 로그인 페이지
 *
 * 왜 이렇게 구현했는가?
 * - react-hook-form으로 폼 관리
 * - zod로 유효성 검증
 * - Zustand 스토어로 상태 관리
 * - Clean Architecture 원칙 준수 (Use Case 호출)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/application/stores/auth.store';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import Link from 'next/link';

/**
 * 로그인 폼 스키마 (Zod)
 *
 * 왜 Zod를 사용하는가?
 * - TypeScript 타입과 런타임 유효성 검증 통합
 * - react-hook-form과 완벽한 통합
 * - 명확한 에러 메시지
 */
const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, status, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  /**
   * react-hook-form 초기화
   *
   * 왜 react-hook-form을 사용하는가?
   * - 비제어 컴포넌트로 성능 최적화
   * - 리렌더링 최소화
   * - 유효성 검증 내장
   * - TypeScript 지원 우수
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'test@example.com',
      password: 'Password123!',
      rememberMe: false,
    },
  });

  /**
   * 로그인 제출 핸들러
   */
  const onSubmit = async (data: LoginFormData) => {
    const success = await login(data);

    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* 헤더 */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Clean Architecture 기반 Next.js 스타터
          </p>
        </div>

        {/* 로그인 폼 */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            {/* 이메일 입력 */}
            <Input
              label="이메일"
              type="email"
              placeholder="test@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            {/* 비밀번호 입력 */}
            <Input
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password123!"
              error={errors.password?.message}
              {...register('password')}
            />

            {/* 로그인 상태 유지 */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                {...register('rememberMe')}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                로그인 상태 유지
              </label>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* 데모 안내 */}
          <div className="rounded-md bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>데모 계정:</strong><br />
              이메일: test@example.com<br />
              비밀번호: Password123!
            </p>
          </div>

          {/* 제출 버튼 */}
          <Button
            type="submit"
            fullWidth
            isLoading={status === 'loading'}
            loadingText="로그인 중..."
          >
            로그인
          </Button>

          {/* 추가 링크 */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
            <div className="text-sm">
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                회원가입
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
