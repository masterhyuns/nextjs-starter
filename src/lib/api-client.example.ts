/**
 * API Client 사용 예시
 *
 * 이 파일은 apiClient의 다양한 사용 방법을 보여줍니다.
 * 실제 프로젝트에서는 이 패턴들을 참고하여 구현하세요.
 */

import { apiClient } from './api-client';

/**
 * ==================== GET 요청 예시 ====================
 */

/**
 * 1. 기본 GET 요청
 */
export const getUsers = async () => {
  const response = await apiClient.get('/users');
  if (response.success) {
    console.log('사용자 목록:', response.data);
  } else {
    console.error('에러:', response.error);
  }
  return response;
};

/**
 * 2. Query String 파라미터 사용 (개선된 방식)
 *
 * 왜 이 방법을 사용하는가?
 * - data 파라미터로 통일 (params 옵션 불필요)
 * - GET 요청은 자동으로 query string으로 변환
 * - 자동으로 인코딩됨
 * - undefined, null 값은 자동으로 제외
 * - 타입 안전성 확보
 */
export const getUsersWithPagination = async (page: number, limit: number, search?: string) => {
  const response = await apiClient.get('/users', {
    page,
    limit,
    search, // undefined면 자동으로 제외됨
  });
  // => GET /users?page=1&limit=10&search=john

  return response;
};

/**
 * 3. 복잡한 Query String 사용
 */
export const getUsersWithFilters = async () => {
  const response = await apiClient.get('/users', {
    page: 1,
    limit: 20,
    sort: 'createdAt',
    order: 'desc',
    role: 'admin',
    active: true,
    search: '홍길동', // 자동으로 URL 인코딩됨
  });
  // => GET /users?page=1&limit=20&sort=createdAt&order=desc&role=admin&active=true&search=%ED%99%8D%EA%B8%B8%EB%8F%99

  return response;
};

/**
 * 4. 타입이 지정된 GET 요청
 */
interface User {
  id: number;
  name: string;
  email: string;
}

export const getUserById = async (id: number) => {
  const response = await apiClient.get<User>(`/users/${id}`);

  if (response.success) {
    // response.data는 User 타입으로 추론됨
    console.log('사용자 이름:', response.data.name);
  }

  return response;
};

/**
 * ==================== POST 요청 예시 ====================
 */

/**
 * 5. POST 요청 (회원가입)
 */
interface SignupData {
  email: string;
  password: string;
  name: string;
}

export const signup = async (data: SignupData) => {
  const response = await apiClient.post('/auth/signup', data);

  if (response.success) {
    console.log('회원가입 성공');
  } else {
    console.error('회원가입 실패:', response.error);
  }

  return response;
};

/**
 * 6. POST 요청 (로그인)
 */
interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const login = async (data: LoginData) => {
  const response = await apiClient.post<LoginResponse>('/auth/login', data, {
    auth: false, // 로그인 요청은 인증 불필요
  });

  if (response.success) {
    // 토큰 저장 로직
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
  }

  return response;
};

/**
 * ==================== PUT 요청 예시 ====================
 */

/**
 * 7. PUT 요청 (사용자 정보 수정)
 */
interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
}

export const updateUser = async (id: number, data: UpdateUserData) => {
  const response = await apiClient.put<User>(`/users/${id}`, data);

  if (response.success) {
    console.log('수정된 사용자:', response.data);
  }

  return response;
};

/**
 * ==================== PATCH 요청 예시 ====================
 */

/**
 * 8. PATCH 요청 (부분 수정)
 */
export const updateUserStatus = async (id: number, active: boolean) => {
  const response = await apiClient.patch(`/users/${id}`, { active });

  return response;
};

/**
 * ==================== DELETE 요청 예시 ====================
 */

/**
 * 9. DELETE 요청 (기본)
 */
export const deleteUser = async (id: number) => {
  const response = await apiClient.delete(`/users/${id}`);

  if (response.success) {
    console.log('사용자 삭제 완료');
  }

  return response;
};

/**
 * 10. DELETE 요청 (Query String 사용)
 *
 * 왜 DELETE에 data를 사용하는가?
 * - Soft Delete 플래그 전달
 * - 삭제 이유 전달
 * - 연관 데이터 삭제 옵션 전달
 * - GET과 동일하게 query string으로 자동 변환
 */
export const softDeleteUser = async (id: number, reason?: string) => {
  const response = await apiClient.delete(`/users/${id}`, {
    soft: true,
    reason,
  });
  // => DELETE /users/1?soft=true&reason=spam

  return response;
};

/**
 * ==================== 고급 사용 예시 ====================
 */

/**
 * 11. 타임아웃 설정
 */
export const getLargeData = async () => {
  const response = await apiClient.get('/large-data', null, {
    timeout: 60000, // 60초
  });

  return response;
};

/**
 * 12. 인증 없이 요청
 */
export const getPublicPosts = async () => {
  const response = await apiClient.get('/public/posts', null, {
    auth: false, // Authorization 헤더 미포함
  });

  return response;
};

/**
 * 13. 파일 업로드 (FormData 사용)
 *
 * 주의: apiClient는 JSON을 기본으로 사용하므로,
 * 파일 업로드 시 별도 처리 필요
 */
export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  // fetch API를 직접 사용하거나 apiClient를 확장해야 함
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    // Content-Type 헤더는 자동으로 설정됨 (multipart/form-data)
  });

  return response.json();
};

/**
 * 14. 에러 처리 패턴
 */
export const getUserWithErrorHandling = async (id: number) => {
  const response = await apiClient.get<User>(`/users/${id}`);

  if (!response.success) {
    // 상태 코드별 처리
    switch (response.statusCode) {
      case 401:
        console.error('인증 실패: 다시 로그인하세요');
        // 로그인 페이지로 리다이렉트
        break;
      case 403:
        console.error('권한 없음');
        break;
      case 404:
        console.error('사용자를 찾을 수 없습니다');
        break;
      case 500:
        console.error('서버 오류');
        break;
      default:
        console.error('알 수 없는 오류:', response.error);
    }

    return null;
  }

  return response.data;
};

/**
 * 15. Promise.all을 사용한 병렬 요청
 */
export const fetchDashboardData = async () => {
  const [usersRes, postsRes, statsRes] = await Promise.all([
    apiClient.get('/users', { params: { limit: 10 } }),
    apiClient.get('/posts', { params: { limit: 5 } }),
    apiClient.get('/stats'),
  ]);

  if (usersRes.success && postsRes.success && statsRes.success) {
    return {
      users: usersRes.data,
      posts: postsRes.data,
      stats: statsRes.data,
    };
  }

  return null;
};

/**
 * 16. Retry 로직 (실패 시 재시도)
 */
export const fetchWithRetry = async <T>(
  url: string,
  maxRetries = 3,
  delay = 1000
): Promise<T | null> => {
  for (let i = 0; i < maxRetries; i++) {
    const response = await apiClient.get<T>(url);

    if (response.success) {
      return response.data;
    }

    // 마지막 시도가 아니면 대기 후 재시도
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
      console.log(`재시도 ${i + 1}/${maxRetries}...`);
    }
  }

  console.error('모든 재시도 실패');
  return null;
};

/**
 * ==================== React Query와 함께 사용 ====================
 */

/**
 * 17. React Query useQuery와 함께 사용
 *
 * @example
 * import { useQuery } from '@tanstack/react-query';
 *
 * const { data, isLoading, error } = useQuery({
 *   queryKey: ['users', page, limit],
 *   queryFn: () => fetchUsers(page, limit),
 * });
 */
export const fetchUsers = async (page: number, limit: number) => {
  const response = await apiClient.get<User[]>('/users', { page, limit });

  if (!response.success) {
    throw new Error(response.error);
  }

  return response.data;
};

/**
 * 18. React Query useMutation과 함께 사용
 *
 * @example
 * import { useMutation } from '@tanstack/react-query';
 *
 * const mutation = useMutation({
 *   mutationFn: createUser,
 *   onSuccess: () => {
 *     queryClient.invalidateQueries({ queryKey: ['users'] });
 *   },
 * });
 */
export const createUser = async (data: Omit<User, 'id'>) => {
  const response = await apiClient.post<User>('/users', data);

  if (!response.success) {
    throw new Error(response.error);
  }

  return response.data;
};

/**
 * ==================== 페이지네이션 헬퍼 ====================
 */

interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 19. 페이지네이션이 포함된 요청
 */
export const fetchPaginatedUsers = async (params: PaginationParams) => {
  const response = await apiClient.get<PaginatedResponse<User>>('/users', params);

  return response;
};

/**
 * ==================== 검색 기능 ====================
 */

interface SearchParams {
  q: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

/**
 * 20. 검색 요청 (여러 필터 조합)
 */
export const searchProducts = async (params: SearchParams) => {
  const response = await apiClient.get('/products/search', {
    q: params.q,
    category: params.category,
    min_price: params.minPrice,
    max_price: params.maxPrice,
    in_stock: params.inStock,
  });
  // => GET /products/search?q=laptop&category=electronics&min_price=500&max_price=2000&in_stock=true

  return response;
};
