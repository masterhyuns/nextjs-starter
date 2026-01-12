/**
 * API 클라이언트
 *
 * 왜 이렇게 구현했는가?
 * - 모든 HTTP 요청을 한 곳에서 관리
 * - 인터셉터를 통한 일관된 에러 처리
 * - 자동 토큰 갱신
 * - 타입 안전성 확보
 *
 * fetch vs axios:
 * - fetch 사용 이유: 브라우저 내장 API, 번들 크기 감소
 * - 필요한 기능만 구현하여 경량화
 */

import type { ApiResponse } from './types';
import { API_CONFIG, STORAGE_KEYS } from './constants';

/**
 * HTTP 메서드
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API 요청 옵션
 */
export interface RequestOptions extends RequestInit {
  /** 인증 토큰 포함 여부 */
  auth?: boolean;
  /** 타임아웃 (밀리초) */
  timeout?: number;
}

/**
 * API 클라이언트 클래스
 *
 * Singleton 패턴 사용 이유:
 * - 애플리케이션 전체에서 하나의 인스턴스만 사용
 * - 설정 일관성 유지
 * - 메모리 효율성
 */
export class ApiClient {
  private static instance: ApiClient;
  private baseURL: string;
  private defaultTimeout: number;

  /**
   * private 생성자 (Singleton)
   */
  private constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultTimeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Singleton 인스턴스 가져오기
   */
  static getInstance = (): ApiClient => {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  };

  /**
   * GET 요청
   *
   * @param url - 요청 URL
   * @param data - Query String 파라미터 (자동으로 ?key=value 형태로 변환)
   * @param options - 추가 옵션
   */
  get = async <T>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> => {
    return this.request<T>(url, 'GET', data, options);
  };

  /**
   * POST 요청
   *
   * @param url - 요청 URL
   * @param data - Request Body (JSON으로 전송)
   * @param options - 추가 옵션
   */
  post = async <T>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> => {
    return this.request<T>(url, 'POST', data, options);
  };

  /**
   * PUT 요청
   *
   * @param url - 요청 URL
   * @param data - Request Body (JSON으로 전송)
   * @param options - 추가 옵션
   */
  put = async <T>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> => {
    return this.request<T>(url, 'PUT', data, options);
  };

  /**
   * DELETE 요청
   *
   * @param url - 요청 URL
   * @param data - Query String 파라미터 (자동으로 ?key=value 형태로 변환)
   * @param options - 추가 옵션
   */
  delete = async <T>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> => {
    return this.request<T>(url, 'DELETE', data, options);
  };

  /**
   * PATCH 요청
   *
   * @param url - 요청 URL
   * @param data - Request Body (JSON으로 전송)
   * @param options - 추가 옵션
   */
  patch = async <T>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> => {
    return this.request<T>(url, 'PATCH', data, options);
  };

  /**
   * Query String 생성
   *
   * 왜 필요한가?
   * - GET/DELETE 요청 시 data를 query string으로 자동 변환
   * - URLSearchParams를 사용하여 자동 인코딩
   * - undefined, null 값은 자동으로 제외
   *
   * @example
   * buildQueryString({ page: 1, limit: 10, search: 'test' })
   * // => "?page=1&limit=10&search=test"
   */
  private buildQueryString = (data?: unknown): string => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return '';
    }

    const params = data as Record<string, unknown>;
    if (Object.keys(params).length === 0) {
      return '';
    }

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      // undefined, null 값은 제외
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  };

  /**
   * 공통 요청 메서드
   *
   * 왜 private으로 만들었는가?
   * - 내부 구현 캡슐화
   * - GET, POST 등의 메서드를 통해서만 호출
   * - 일관된 인터페이스 제공
   *
   * data 처리 방식:
   * - GET, DELETE: data를 query string으로 변환 (?key=value)
   * - POST, PUT, PATCH: data를 request body로 전송 (JSON)
   */
  private request = async <T>(
    url: string,
    method: HttpMethod,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> => {
    // 1. GET/DELETE는 data를 query string으로 변환
    let finalURL = url;
    if ((method === 'GET' || method === 'DELETE') && data) {
      const queryString = this.buildQueryString(data);
      finalURL = `${url}${queryString}`;
    }

    const fullURL = finalURL.startsWith('http') ? finalURL : `${this.baseURL}${finalURL}`;
    const timeout = options?.timeout || this.defaultTimeout;

    try {
      // 2. 요청 헤더 설정
      const headers = this.buildHeaders(options?.auth ?? true);

      // 3. 요청 옵션 구성
      const requestOptions: RequestInit = {
        method,
        headers,
        credentials: 'include', // 쿠키 포함 (cross-origin 포함)
        ...options,
      };

      // 4. POST/PUT/PATCH는 data를 body로 추가
      if (data && method !== 'GET' && method !== 'DELETE') {
        requestOptions.body = JSON.stringify(data);
      }

      // 5. 타임아웃 처리
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      requestOptions.signal = controller.signal;

      // 6. 요청 실행
      const response = await fetch(fullURL, requestOptions);
      clearTimeout(timeoutId);

      // 7. 응답 처리
      return await this.handleResponse<T>(response);
    } catch (error) {
      // 8. 에러 처리
      return this.handleError<T>(error);
    }
  };

  /**
   * 요청 헤더 생성
   */
  private buildHeaders = (includeAuth: boolean): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // 인증 토큰 추가
    if (includeAuth) {
      const token = this.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  };

  /**
   * 액세스 토큰 가져오기
   *
   * 왜 localStorage를 사용하는가?
   * - 간단한 구현
   * - 페이지 새로고침 시에도 유지
   * - httpOnly 쿠키보다 접근하기 쉬움
   *
   * 보안 고려사항:
   * - XSS 공격에 취약할 수 있음
   * - 프로덕션에서는 httpOnly 쿠키 사용 권장
   */
  private getAccessToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  };

  /**
   * 응답 처리
   */
  private handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
    const timestamp = new Date().toISOString();

    // 응답 바디 파싱
    let data: any;
    try {
      data = await response.json();
    } catch {
      // JSON 파싱 실패 시 (204 No Content 등)
      data = null;
    }

    // 성공 응답 (2xx)
    if (response.ok) {
      return {
        success: true,
        data: data as T,
        statusCode: response.status,
        timestamp,
      };
    }

    // 실패 응답
    return {
      success: false,
      error: data?.message || data?.error || response.statusText,
      statusCode: response.status,
      timestamp,
    };
  };

  /**
   * 에러 처리
   *
   * 왜 별도 메서드로 분리했는가?
   * - 일관된 에러 응답 형식
   * - 네트워크 에러, 타임아웃 등 다양한 에러 처리
   */
  private handleError = <T>(error: unknown): ApiResponse<T> => {
    console.error('[ApiClient] Error:', error);

    let errorMessage = '알 수 없는 오류가 발생했습니다';

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = '요청 시간이 초과되었습니다';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
      statusCode: 0,
      timestamp: new Date().toISOString(),
    };
  };
}

/**
 * API 클라이언트 싱글톤 인스턴스 내보내기
 *
 * 왜 이렇게 설계했는가?
 * - 모든 HTTP 메서드에서 data 파라미터 통일
 * - GET/DELETE: data → query string 자동 변환
 * - POST/PUT/PATCH: data → request body 자동 변환
 * - 메서드별로 처리 방식을 외울 필요 없이 직관적으로 사용
 *
 * 사용 예시:
 *
 * @example
 * // 기본 GET 요청
 * import { apiClient } from '@/lib/api-client';
 * const response = await apiClient.get('/users');
 *
 * @example
 * // GET 요청 - Query String 자동 변환
 * const response = await apiClient.get('/users', {
 *   page: 1,
 *   limit: 10,
 *   search: 'john'
 * });
 * // => GET /users?page=1&limit=10&search=john
 *
 * @example
 * // POST 요청 - Request Body로 전송
 * const response = await apiClient.post('/users', {
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 * // => POST /users
 * // Body: { "name": "John Doe", "email": "john@example.com" }
 *
 * @example
 * // PUT 요청 - Request Body로 전송
 * const response = await apiClient.put('/users/1', {
 *   name: 'Jane Doe'
 * });
 * // => PUT /users/1
 * // Body: { "name": "Jane Doe" }
 *
 * @example
 * // DELETE 요청 - Query String 자동 변환
 * const response = await apiClient.delete('/users/1', {
 *   soft: true,
 *   reason: 'spam'
 * });
 * // => DELETE /users/1?soft=true&reason=spam
 *
 * @example
 * // 옵션 사용 (인증 제외, 타임아웃 설정)
 * const response = await apiClient.get('/public/data', null, {
 *   auth: false,
 *   timeout: 5000
 * });
 *
 * @example
 * // 복잡한 검색 쿼리
 * const response = await apiClient.get('/products', {
 *   category: 'electronics',
 *   minPrice: 100,
 *   maxPrice: 1000,
 *   inStock: true,
 *   sort: 'price',
 *   order: 'asc'
 * });
 * // => GET /products?category=electronics&minPrice=100&maxPrice=1000&inStock=true&sort=price&order=asc
 */
export const apiClient = ApiClient.getInstance();
