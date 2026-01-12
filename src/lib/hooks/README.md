# useApiClient 커스텀 훅

## 개요

`useApiClient`는 API 호출과 상태 관리를 자동화하는 React 커스텀 훅입니다. 매번 `useState`로 loading, data, error 상태를 관리하는 보일러플레이트 코드를 제거합니다.

## 왜 만들었는가?

### 문제: 보일러플레이트 코드의 반복
```typescript
// 기존 방식 ❌ (매번 반복해야 하는 코드)
const [data, setData] = useState<User[]>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchUsers = async () => {
  setLoading(true);
  setError(null);

  const response = await apiClient.get('/users');

  if (response.success) {
    setData(response.data);
  } else {
    setError(response.error);
  }

  setLoading(false);
};
```

### 해결: useApiClient 사용
```typescript
// 개선된 방식 ✅ (한 줄로 해결)
const { data, loading, error, get } = useApiClient<User[]>();

useEffect(() => {
  get('/users');
}, [get]);
```

## 언제 사용하는가?

### ✅ 사용해야 할 때
- **컴포넌트 내부**에서 API 호출 + 상태 관리 필요
- 로딩 상태, 에러 처리를 UI에 반영해야 할 때
- 사용자 인터랙션에 따른 API 호출 (버튼 클릭, 폼 제출 등)

### ❌ 사용하지 말아야 할 때
- **컴포넌트 외부**에서 API 호출 (유틸 함수, 서비스 레이어 등)
- 상태 관리가 필요 없는 경우 (일회성 API 호출)
- React Query, SWR 등 다른 라이브러리 사용 중

**올바른 사용 패턴:**
```typescript
// 컴포넌트 내 ✅
const UserList = () => {
  const { data, loading, get } = useApiClient<User[]>();
  // ...
};

// 컴포넌트 외 ✅
export const fetchUsers = async () => {
  return await apiClient.get('/users'); // useApiClient 아님!
};
```

## 기본 사용법

### 1. GET 요청
```typescript
import { useApiClient } from '@/lib/hooks';

const UserList = () => {
  const { data, loading, error, get } = useApiClient<User[]>();

  useEffect(() => {
    get('/users', { page: 1, limit: 10 });
  }, [get]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!data) return null;

  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

### 2. POST 요청 (폼 제출)
```typescript
const CreateUser = () => {
  const { data, loading, error, post } = useApiClient<User>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const response = await post('/users', {
      name: formData.get('name'),
      email: formData.get('email'),
    });

    if (response.success) {
      console.log('생성 성공:', response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit" disabled={loading}>
        {loading ? '생성 중...' : '생성'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

### 3. PUT/PATCH 요청 (수정)
```typescript
const EditUser = ({ userId }: { userId: number }) => {
  const { data, loading, get, put } = useApiClient<User>();

  useEffect(() => {
    get(`/users/${userId}`);
  }, [userId, get]);

  const handleUpdate = async (updates: Partial<User>) => {
    const response = await put(`/users/${userId}`, updates);

    if (response.success) {
      console.log('수정 완료');
    }
  };

  return (
    // 수정 폼 UI
  );
};
```

### 4. DELETE 요청
```typescript
const DeleteButton = ({ userId }: { userId: number }) => {
  const { loading, error, del } = useApiClient();

  const handleDelete = async () => {
    if (!confirm('삭제하시겠습니까?')) return;

    const response = await del(`/users/${userId}`);

    if (response.success) {
      console.log('삭제 완료');
    }
  };

  return (
    <>
      <button onClick={handleDelete} disabled={loading}>
        {loading ? '삭제 중...' : '삭제'}
      </button>
      {error && <div className="error">{error}</div>}
    </>
  );
};
```

## API

### 반환 값

| 속성 | 타입 | 설명 |
|------|------|------|
| `data` | `T \| null` | API 응답 데이터 |
| `loading` | `boolean` | 로딩 중 여부 |
| `error` | `string \| null` | 에러 메시지 |
| `statusCode` | `number \| null` | HTTP 상태 코드 |
| `get` | `function` | GET 요청 함수 |
| `post` | `function` | POST 요청 함수 |
| `put` | `function` | PUT 요청 함수 |
| `del` | `function` | DELETE 요청 함수 (delete는 예약어) |
| `patch` | `function` | PATCH 요청 함수 |
| `reset` | `function` | 상태 초기화 함수 |
| `setData` | `function` | 데이터 수동 설정 함수 |

### 메서드 시그니처

```typescript
get(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>>
post(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>>
put(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>>
del(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>>
patch(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>>
reset(): void
setData(data: T | null): void
```

## 고급 사용 패턴

### 1. 여러 API 동시 관리
```typescript
const Dashboard = () => {
  const users = useApiClient<User[]>();
  const posts = useApiClient<Post[]>();

  useEffect(() => {
    users.get('/users');
    posts.get('/posts');
  }, [users.get, posts.get]);

  return (
    <div>
      <div>
        <h2>사용자</h2>
        {users.loading && <div>로딩 중...</div>}
        {users.data?.map(user => <div key={user.id}>{user.name}</div>)}
      </div>

      <div>
        <h2>게시글</h2>
        {posts.loading && <div>로딩 중...</div>}
        {posts.data?.map(post => <div key={post.id}>{post.title}</div>)}
      </div>
    </div>
  );
};
```

### 2. 낙관적 업데이트 (Optimistic Update)
```typescript
const LikeButton = ({ postId, initialLikes }: Props) => {
  const { data, put, setData } = useApiClient<{ likes: number }>();

  const handleLike = async () => {
    if (!data) return;

    // 1. 즉시 UI 업데이트 (낙관적)
    setData({ likes: data.likes + 1 });

    // 2. 실제 API 호출
    const response = await put(`/posts/${postId}/like`);

    // 3. 실패 시 롤백
    if (!response.success) {
      setData({ likes: data.likes }); // 원래대로 복구
    }
  };

  return (
    <button onClick={handleLike}>
      좋아요 {data?.likes ?? initialLikes}
    </button>
  );
};
```

### 3. 검색 및 필터링
```typescript
const SearchUsers = () => {
  const { data, loading, get } = useApiClient<User[]>();
  const [searchTerm, setSearchTerm] = useState('');

  // 디바운스 적용
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        get('/users', { search: searchTerm });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, get]);

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="검색..."
      />
      {loading && <div>검색 중...</div>}
      {data?.map(user => <div key={user.id}>{user.name}</div>)}
    </div>
  );
};
```

### 4. 페이지네이션
```typescript
const PaginatedList = () => {
  const { data, loading, get } = useApiClient<{
    users: User[];
    page: number;
    totalPages: number;
  }>();
  const [page, setPage] = useState(1);

  useEffect(() => {
    get('/users', { page, limit: 10 });
  }, [page, get]);

  return (
    <div>
      {loading && <div>로딩 중...</div>}

      {data?.users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}

      <div>
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 1 || loading}
        >
          이전
        </button>
        <span>{page} / {data?.totalPages}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page === data?.totalPages || loading}
        >
          다음
        </button>
      </div>
    </div>
  );
};
```

### 5. 조건부 요청
```typescript
const ConditionalFetch = ({ userId }: { userId?: number }) => {
  const { data, loading, get } = useApiClient<User>();

  useEffect(() => {
    if (userId) {
      get(`/users/${userId}`);
    }
  }, [userId, get]);

  if (!userId) {
    return <div>사용자를 선택하세요</div>;
  }

  if (loading) return <div>로딩 중...</div>;

  return <div>{data?.name}</div>;
};
```

### 6. 에러 후 재시도
```typescript
const RetryExample = () => {
  const { data, loading, error, get } = useApiClient<User[]>();

  const handleRetry = () => {
    get('/users');
  };

  if (loading) return <div>로딩 중...</div>;

  if (error) {
    return (
      <div>
        <div className="error">에러: {error}</div>
        <button onClick={handleRetry}>재시도</button>
      </div>
    );
  }

  return <div>{/* 데이터 표시 */}</div>;
};
```

## 비교: React Query vs useApiClient

### React Query를 사용해야 할 때
- 복잡한 캐싱 전략 필요
- 자동 리페칭, 백그라운드 업데이트
- 무한 스크롤, 커서 기반 페이지네이션
- Optimistic Updates의 복잡한 시나리오

### useApiClient를 사용해야 할 때
- 간단한 프로젝트 (외부 라이브러리 추가 불필요)
- 캐싱이 필요 없는 경우
- 빠른 프로토타이핑
- 학습 곡선 최소화

## 베스트 프랙티스

### 1. 타입 명시
```typescript
// ✅ 좋은 예
const { data } = useApiClient<User[]>();

// ❌ 나쁜 예
const { data } = useApiClient(); // any 타입
```

### 2. useEffect 의존성 배열
```typescript
// ✅ 좋은 예
useEffect(() => {
  get('/users');
}, [get]); // get 함수는 안정적 (useCallback)

// ❌ 나쁜 예
useEffect(() => {
  get('/users');
}, []); // ESLint 경고 발생
```

### 3. 로딩 중 중복 요청 방지
```typescript
const { loading, get } = useApiClient();

const handleRefresh = () => {
  if (loading) return; // 로딩 중이면 중단
  get('/users');
};
```

### 4. 에러 처리
```typescript
const { error, post } = useApiClient();

const handleSubmit = async (data: FormData) => {
  const response = await post('/users', data);

  // response를 확인하여 추가 처리
  if (response.success) {
    console.log('성공:', response.data);
  } else {
    console.error('실패:', response.error);
    // error 상태도 자동으로 업데이트됨
  }
};
```

## 주의사항

1. **컴포넌트 외부에서 사용 불가**: React Hook 규칙 준수
2. **상태 공유 안 됨**: 각 훅 인스턴스는 독립적인 상태
3. **자동 재시도 없음**: 실패 시 수동으로 재시도 필요
4. **캐싱 없음**: 매 요청마다 API 호출 발생

## 확장 가이드

### 커스텀 훅으로 래핑
```typescript
// hooks/useUsers.ts
export const useUsers = () => {
  const { data, loading, error, get } = useApiClient<User[]>();

  useEffect(() => {
    get('/users');
  }, [get]);

  return { users: data, loading, error };
};

// 컴포넌트에서 사용
const UserList = () => {
  const { users, loading } = useUsers();
  // ...
};
```

### 자동 재시도 로직 추가
```typescript
export const useApiWithRetry = <T>() => {
  const api = useApiClient<T>();
  const [retryCount, setRetryCount] = useState(0);

  const getWithRetry = async (url: string, maxRetries = 3) => {
    const response = await api.get(url);

    if (!response.success && retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setTimeout(() => getWithRetry(url, maxRetries), 1000 * retryCount);
    }

    return response;
  };

  return { ...api, getWithRetry };
};
```

## 문제 해결

### Q: useEffect 무한 루프 발생
```typescript
// ❌ 잘못된 방법
useEffect(() => {
  get('/users');
}); // 의존성 배열 없음

// ✅ 올바른 방법
useEffect(() => {
  get('/users');
}, [get]);
```

### Q: 데이터가 업데이트되지 않음
```typescript
// ❌ 잘못된 방법
const handleUpdate = () => {
  put('/users/1', { name: 'New Name' });
  // data는 자동으로 업데이트되지만 다시 get을 호출하지 않으면 서버 데이터와 동기화 안됨
};

// ✅ 올바른 방법
const handleUpdate = async () => {
  const response = await put('/users/1', { name: 'New Name' });
  if (response.success) {
    // 서버 데이터 다시 가져오기
    get('/users/1');
  }
};
```

## 참고 자료

- [API Client 문서](../api-client.ts)
- [사용 예시](./use-api-client.example.tsx)
- [React Hooks 공식 문서](https://react.dev/reference/react)
