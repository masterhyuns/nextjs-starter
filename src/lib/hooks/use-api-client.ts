/**
 * useApiClient 커스텀 훅
 *
 * 왜 필요한가?
 * - API 호출마다 useState로 loading, data, error 상태 관리하는 보일러플레이트 제거
 * - 컴포넌트 내에서 편리하게 API 호출 및 상태 관리
 * - 자동 로딩 상태, 에러 처리
 * - 타입 안전성 확보
 *
 * 사용 시나리오:
 * - 컴포넌트 내: useApiClient 사용 (상태 관리 필요)
 * - 컴포넌트 외: apiClient 직접 사용 (상태 관리 불필요)
 */

'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '../api-client';
import type { ApiResponse } from '../types';
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
  /** GET 요청 */
  get: (url: string, data?: unknown, options?: RequestOptions) => Promise<ApiResponse<T>>;
  /** POST 요청 */
  post: (url: string, data?: unknown, options?: RequestOptions) => Promise<ApiResponse<T>>;
  /** PUT 요청 */
  put: (url: string, data?: unknown, options?: RequestOptions) => Promise<ApiResponse<T>>;
  /** DELETE 요청 */
  del: (url: string, data?: unknown, options?: RequestOptions) => Promise<ApiResponse<T>>;
  /** PATCH 요청 */
  patch: (url: string, data?: unknown, options?: RequestOptions) => Promise<ApiResponse<T>>;
  /** 상태 초기화 */
  reset: () => void;
  /** 데이터 수동 설정 */
  setData: (data: T | null) => void;
}

/**
 * useApiClient 훅
 *
 * @example
 * // 기본 사용
 * const { data, loading, error, get } = useApiClient<User[]>();
 *
 * useEffect(() => {
 *   get('/users', { page: 1, limit: 10 });
 * }, []);
 *
 * if (loading) return <div>로딩 중...</div>;
 * if (error) return <div>에러: {error}</div>;
 * if (!data) return null;
 *
 * return <UserList users={data} />;
 *
 * @example
 * // POST 요청 (회원가입)
 * const { loading, error, post } = useApiClient();
 *
 * const handleSignup = async () => {
 *   const response = await post('/auth/signup', {
 *     email: 'test@example.com',
 *     password: 'password123'
 *   });
 *
 *   if (response.success) {
 *     console.log('회원가입 성공');
 *   }
 * };
 */
export const useApiClient = <T = unknown>(): UseApiClientReturn<T> => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    statusCode: null,
  });

  /**
   * API 요청 래퍼
   *
   * 왜 별도 함수로 분리했는가?
   * - 모든 HTTP 메서드에서 공통 로직 재사용
   * - loading, error 상태 자동 관리
   * - 중복 코드 제거
   */
  const request = useCallback(
    async <TData = T>(
      method: 'get' | 'post' | 'put' | 'delete' | 'patch',
      url: string,
      data?: unknown,
      options?: RequestOptions
    ): Promise<ApiResponse<TData>> => {
      // 1. 로딩 시작
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        // 2. API 호출
        const response = await apiClient[method]<TData>(url, data, options);

        // 3. 성공 시 상태 업데이트
        if (response.success) {
          setState({
            data: response.data as unknown as T,
            loading: false,
            error: null,
            statusCode: response.statusCode,
          });
        } else {
          // 4. 실패 시 에러 상태 업데이트
          setState({
            data: null,
            loading: false,
            error: response.error || '알 수 없는 오류',
            statusCode: response.statusCode,
          });
        }

        return response;
      } catch (err) {
        // 5. 예외 처리
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
        setState({
          data: null,
          loading: false,
          error: errorMessage,
          statusCode: null,
        });

        return {
          success: false,
          error: errorMessage,
          statusCode: 0,
          timestamp: new Date().toISOString(),
        };
      }
    },
    []
  );

  /**
   * GET 요청
   */
  const get = useCallback(
    (url: string, data?: unknown, options?: RequestOptions) => {
      return request<T>('get', url, data, options);
    },
    [request]
  );

  /**
   * POST 요청
   */
  const post = useCallback(
    (url: string, data?: unknown, options?: RequestOptions) => {
      return request<T>('post', url, data, options);
    },
    [request]
  );

  /**
   * PUT 요청
   */
  const put = useCallback(
    (url: string, data?: unknown, options?: RequestOptions) => {
      return request<T>('put', url, data, options);
    },
    [request]
  );

  /**
   * DELETE 요청
   *
   * 왜 'del'인가?
   * - 'delete'는 JavaScript 예약어
   * - TypeScript에서는 사용 가능하지만 혼란 방지를 위해 'del' 사용
   */
  const del = useCallback(
    (url: string, data?: unknown, options?: RequestOptions) => {
      return request<T>('delete', url, data, options);
    },
    [request]
  );

  /**
   * PATCH 요청
   */
  const patch = useCallback(
    (url: string, data?: unknown, options?: RequestOptions) => {
      return request<T>('patch', url, data, options);
    },
    [request]
  );

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

  return {
    ...state,
    get,
    post,
    put,
    del,
    patch,
    reset,
    setData,
  };
};

/**
 * ==================== 타입 내보내기 ====================
 */
export type { ApiState, UseApiClientReturn };
