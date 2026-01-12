/**
 * useApiClient 사용 예시
 *
 * 이 파일은 useApiClient 훅의 다양한 사용 패턴을 보여줍니다.
 */

'use client';

import { useEffect } from 'react';
import { useApiClient } from './use-api-client';
import { Button } from '@/components/ui/button';

/**
 * ==================== 타입 정의 ====================
 */
interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  userId: number;
}

/**
 * ==================== 예시 1: 기본 GET 요청 ====================
 */
export const UserListExample = () => {
  const { data, loading, error, get } = useApiClient<User[]>();

  useEffect(() => {
    // 컴포넌트 마운트 시 데이터 로드
    get('/users', { page: 1, limit: 10 });
  }, [get]);

  if (loading) {
    return <div className="p-4">로딩 중...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">에러: {error}</div>;
  }

  if (!data) {
    return <div className="p-4">데이터가 없습니다.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">사용자 목록</h2>
      <ul className="space-y-2">
        {data.map((user) => (
          <li key={user.id} className="border p-2 rounded">
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * ==================== 예시 2: POST 요청 (폼 제출) ====================
 */
export const CreateUserFormExample = () => {
  const { data, loading, error, post, reset } = useApiClient<User>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const response = await post('/users', {
      name: formData.get('name'),
      email: formData.get('email'),
    });

    if (response.success) {
      console.log('사용자 생성 성공:', response.data);
      // 폼 초기화
      e.currentTarget.reset();
      // 3초 후 상태 초기화
      setTimeout(reset, 3000);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">사용자 생성</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">이름</label>
          <input
            type="text"
            name="name"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1">이메일</label>
          <input
            type="email"
            name="email"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? '생성 중...' : '생성'}
        </Button>
      </form>

      {error && <div className="mt-4 text-red-600">에러: {error}</div>}
      {data && (
        <div className="mt-4 p-4 bg-green-50 rounded">
          생성 완료: {data.name} ({data.email})
        </div>
      )}
    </div>
  );
};

/**
 * ==================== 예시 3: PUT 요청 (수정) ====================
 */
export const UpdateUserExample = ({ userId }: { userId: number }) => {
  const { data, loading, error, get, put } = useApiClient<User>();

  // 초기 데이터 로드
  useEffect(() => {
    get(`/users/${userId}`);
  }, [userId, get]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const response = await put(`/users/${userId}`, {
      name: formData.get('name'),
      email: formData.get('email'),
    });

    if (response.success) {
      console.log('수정 성공');
    }
  };

  if (loading && !data) {
    return <div className="p-4">로딩 중...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">사용자 수정</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block mb-1">이름</label>
          <input
            type="text"
            name="name"
            defaultValue={data?.name}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1">이메일</label>
          <input
            type="email"
            name="email"
            defaultValue={data?.email}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? '수정 중...' : '수정'}
        </Button>
      </form>

      {error && <div className="mt-4 text-red-600">에러: {error}</div>}
    </div>
  );
};

/**
 * ==================== 예시 4: DELETE 요청 ====================
 */
export const DeleteUserExample = ({ userId }: { userId: number }) => {
  const { loading, error, del } = useApiClient();

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    const response = await del(`/users/${userId}`);

    if (response.success) {
      console.log('삭제 성공');
      // 목록 새로고침 로직 추가
    }
  };

  return (
    <div>
      <Button variant="danger" onClick={handleDelete} disabled={loading}>
        {loading ? '삭제 중...' : '삭제'}
      </Button>
      {error && <div className="mt-2 text-red-600 text-sm">에러: {error}</div>}
    </div>
  );
};

/**
 * ==================== 예시 5: 검색 기능 ====================
 */
export const SearchExample = () => {
  const { data, loading, error, get } = useApiClient<User[]>();

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;

    await get('/users', {
      search,
      page: 1,
      limit: 20,
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">사용자 검색</h2>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          name="search"
          placeholder="검색어 입력..."
          className="flex-1 border rounded px-3 py-2"
        />
        <Button type="submit" disabled={loading}>
          검색
        </Button>
      </form>

      {loading && <div>검색 중...</div>}
      {error && <div className="text-red-600">에러: {error}</div>}

      {data && data.length > 0 && (
        <ul className="space-y-2">
          {data.map((user) => (
            <li key={user.id} className="border p-2 rounded">
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      )}

      {data && data.length === 0 && <div>검색 결과가 없습니다.</div>}
    </div>
  );
};

/**
 * ==================== 예시 6: 낙관적 업데이트 (Optimistic Update) ====================
 */
export const OptimisticUpdateExample = ({ userId }: { userId: number }) => {
  const { data, loading, get, put, setData } = useApiClient<User>();

  useEffect(() => {
    get(`/users/${userId}`);
  }, [userId, get]);

  const handleOptimisticUpdate = async (newName: string) => {
    if (!data) return;

    // 1. 먼저 UI 업데이트 (낙관적)
    setData({ ...data, name: newName });

    // 2. 실제 API 호출
    const response = await put(`/users/${userId}`, {
      name: newName,
    });

    // 3. 실패 시 롤백
    if (!response.success) {
      // 원래 데이터로 복구
      get(`/users/${userId}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">낙관적 업데이트 예시</h2>
      {data && (
        <div>
          <p className="mb-2">현재 이름: {data.name}</p>
          <Button
            onClick={() => handleOptimisticUpdate('새로운 이름')}
            disabled={loading}
          >
            이름 변경 (즉시 반영)
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * ==================== 예시 7: 여러 API 호출 관리 ====================
 */
export const MultipleApiExample = () => {
  const users = useApiClient<User[]>();
  const posts = useApiClient<Post[]>();

  useEffect(() => {
    // 병렬로 여러 API 호출
    users.get('/users', { limit: 5 });
    posts.get('/posts', { limit: 5 });
  }, [users.get, posts.get]);

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">사용자 목록</h2>
        {users.loading && <div>로딩 중...</div>}
        {users.error && <div className="text-red-600">{users.error}</div>}
        {users.data && (
          <ul className="space-y-1">
            {users.data.map((user) => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">게시글 목록</h2>
        {posts.loading && <div>로딩 중...</div>}
        {posts.error && <div className="text-red-600">{posts.error}</div>}
        {posts.data && (
          <ul className="space-y-1">
            {posts.data.map((post) => (
              <li key={post.id}>{post.title}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/**
 * ==================== 예시 8: 조건부 로딩 ====================
 */
export const ConditionalLoadExample = ({ shouldLoad }: { shouldLoad: boolean }) => {
  const { data, loading, error, get } = useApiClient<User[]>();

  useEffect(() => {
    if (shouldLoad) {
      get('/users');
    }
  }, [shouldLoad, get]);

  if (!shouldLoad) {
    return <div className="p-4">데이터를 로드하려면 버튼을 클릭하세요</div>;
  }

  if (loading) {
    return <div className="p-4">로딩 중...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">에러: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">조건부 로딩 결과</h2>
      {data && (
        <ul className="space-y-2">
          {data.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * ==================== 예시 9: 수동 재로드 ====================
 */
export const ManualReloadExample = () => {
  const { data, loading, error, get } = useApiClient<User[]>();

  const loadData = () => {
    get('/users', { page: 1, limit: 10 });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">사용자 목록</h2>
        <Button onClick={loadData} disabled={loading}>
          {loading ? '새로고침 중...' : '새로고침'}
        </Button>
      </div>

      {error && <div className="text-red-600 mb-4">에러: {error}</div>}

      {data ? (
        <ul className="space-y-2">
          {data.map((user) => (
            <li key={user.id} className="border p-2 rounded">
              {user.name}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500">데이터를 로드하려면 새로고침 버튼을 클릭하세요</div>
      )}
    </div>
  );
};

/**
 * ==================== 예시 10: 페이지네이션 ====================
 */
export const PaginationExample = () => {
  const { data, loading, error, get } = useApiClient<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }>();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    get('/users', { page: currentPage, limit: 10 });
  }, [currentPage, get]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (data && currentPage < data.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">페이지네이션 예시</h2>

      {loading && <div>로딩 중...</div>}
      {error && <div className="text-red-600">에러: {error}</div>}

      {data && (
        <>
          <ul className="space-y-2 mb-4">
            {data.users.map((user) => (
              <li key={user.id} className="border p-2 rounded">
                {user.name}
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between">
            <Button onClick={handlePrevious} disabled={currentPage === 1 || loading}>
              이전
            </Button>
            <span>
              {currentPage} / {data.totalPages}
            </span>
            <Button onClick={handleNext} disabled={currentPage === data.totalPages || loading}>
              다음
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * useState import 추가
 */
import { useState } from 'react';
