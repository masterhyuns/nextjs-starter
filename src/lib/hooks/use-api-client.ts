/**
 * useApiClient 커스텀 훅
 *
 * 왜 필요한가?
 * - API 호출마다 useState로 loading, data, error 상태 관리하는 보일러플레이트 제거
 * - apiClient를 래핑하여 상태 관리만 추가
 * - 자동 로딩 상태, 에러 처리
 * - 타입 안전성 확보
 *
 * 설계 원칙:
 * - apiClient의 기능은 그대로 활용
 * - 훅에서는 loading, data, error 상태 관리만 추가
 * - 중복 구현 없이 래퍼로만 동작
 *
 * 사용 시나리오:
 * - 컴포넌트 내: useApiClient 사용 (상태 관리 필요)
 * - 컴포넌트 외: apiClient 직접 사용 (상태 관리 불필요)
 */

'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '../api-client';
import type { ApiResponse, ApiSpec } from '../types';
import type { RequestOptions } from '../api-client';

/**
 * API 상태 인터페이스
 */
interface ApiState<T> {
  /** 응답 데이터 */
  data: T | null;
  /** 로딩 중 여부 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** HTTP 상태 코드 */
  statusCode: number | null;
}

/**
 * useApiClient 반환 타입
 */
interface UseApiClientReturn<T> extends ApiState<T> {
  /** API 명세 객체를 받아서 실행 */
  fetch: (apiSpec: ApiSpec) => Promise<ApiResponse<T>>;
  /** 상태 초기화 */
  reset: () => void;
  /** 데이터 수동 설정 */
  setData: (data: T | null) => void;
}

/**
 * useApiClient 훅
 *
 * 왜 이렇게 단순화했는가?
 * - fetch() 메서드만 제공하여 API 호출 방식 통일
 * - entities 폴더의 api.ts에서 정의한 명세 객체 사용
 * - get/post/put/del 등 불필요한 메서드 제거
 * - apiClient.fetch()를 호출하여 상태 관리만 추가
 *
 * @example
 * // 기본 사용
 * import { useApiClient } from '@/lib/hooks/use-api-client';
 * import { authApi } from '@/entities/auth/api';
 *
 * const { data, loading, error, fetch } = useApiClient<LoginResponse>();
 *
 * const handleLogin = async () => {
 *   const response = await fetch(authApi.login({ email, password }));
 *   if (response.success) {
 *     console.log('로그인 성공');
 *   }
 * };
 *
 * @example
 * // 목록 조회
 * const { data, loading, error, fetch } = useApiClient<User[]>();
 *
 * useEffect(() => {
 *   fetch(userApi.getList({ page: 1, limit: 10 }));
 * }, [fetch]);
 *
 * if (loading) return <div>로딩 중...</div>;
 * if (error) return <div>에러: {error}</div>;
 * if (!data) return null;
 *
 * return <UserList users={data} />;
 */
export function useApiClient<T = unknown>(): UseApiClientReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    statusCode: null,
  });

  /**
   * 상태 초기화
   *
   * 언제 사용하는가?
   * - 컴포넌트 언마운트 전 정리
   * - 새로운 요청 전 이전 상태 클리어
   * - 폼 제출 후 초기화
   */
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      statusCode: null,
    });
  }, []);

  /**
   * 데이터 수동 설정
   *
   * 언제 사용하는가?
   * - 낙관적 업데이트 (Optimistic Update)
   * - 로컬 상태만 업데이트
   * - 캐시된 데이터 주입
   */
  const setData = useCallback((data: T | null) => {
    setState((prev) => ({
      ...prev,
      data,
    }));
  }, []);

  /**
   * API 명세 객체를 받아서 실행
   *
   * 왜 이렇게 구현했는가?
   * - apiClient.fetch()를 호출하여 실제 API 요청 수행
   * - 상태 관리(loading, data, error)만 추가
   * - 중복 로직 제거 및 코드 간결화
   *
   * @example
   * // entities/auth/api.ts
   * export const authApi = {
   *   login: (params: LoginParams) => ({
   *     method: 'POST' as const,
   *     url: '/auth/login',
   *     data: params,
   *   }),
   * };
   *
   * // 컴포넌트에서
   * const { fetch, loading } = useApiClient<LoginResponse>();
   * const result = await fetch(authApi.login({ email, password }));
   */
  const fetch = useCallback(
    async (apiSpec: ApiSpec): Promise<ApiResponse<T>> => {
      // 1. 로딩 시작
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        // 2. apiClient.fetch() 호출 (EnvProvider에서 이미 baseURL 설정됨)
        const response = await apiClient.fetch<T>(apiSpec);

        // 3. 성공 상태 업데이트
        if (response.success) {
          setState({
            data: response.data || null,
            loading: false,
            error: null,
            statusCode: response.statusCode,
          });
        } else {
          // 4. 실패 상태 업데이트
          setState({
            data: null,
            loading: false,
            error: response.error || '알 수 없는 오류',
            statusCode: response.statusCode,
          });
        }

        return response;
      } catch (error) {
        // 5. 예외 처리
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        setState({
          data: null,
          loading: false,
          error: errorMessage,
          statusCode: null,
        });

        // 에러를 ApiResponse 형식으로 반환
        return {
          success: false,
          error: errorMessage,
          statusCode: 500,
          timestamp: new Date().toISOString(),
        };
      }
    },
    []
  );

  return {
    ...state,
    fetch,
    reset,
    setData,
  };
}

/**
 * ==================== 타입 내보내기 ====================
 */
export type { ApiState, UseApiClientReturn };
