# Next Clean Starter

프론트엔드 전용 아키텍처를 적용한 프로덕션 준비 완료 Next.js 스타터 템플릿

## 🎯 주요 특징

- ✅ **단순하고 명확한 구조**: 엔티티 기반 모듈화 (10개 → 4개 폴더로 단순화)
- ✅ **타입 안전성**: TypeScript 엄격 모드로 런타임 에러 방지
- ✅ **Zustand**: 경량하고 강력한 상태 관리 (Redux 대비 보일러플레이트 최소화)
- ✅ **React Hook Form + Zod**: 타입 안전한 폼 관리 및 유효성 검증
- ✅ **Tailwind CSS + SCSS**: 유틸리티 클래스와 강력한 스타일링의 조합
- ✅ **SSR 인증**: 번쩍거림 없는 서버 사이드 라우트 가드
- ✅ **재사용 가능한 컴포넌트**: forwardRef 기반 UI 라이브러리
- ✅ **탭 & 모달 시스템**: 중앙 집중식 상태 관리

## 📁 프로젝트 구조

```
src/
├── app/                     # Next.js App Router
│   ├── globals.scss         # 전역 스타일 (Tailwind + SCSS)
│   ├── layout.tsx           # Root Layout
│   ├── page.tsx             # 홈 페이지
│   ├── login/               # 로그인 페이지
│   └── dashboard/           # 대시보드 (인증 필요)
│
├── components/              # React 컴포넌트
│   ├── ui/                  # 재사용 가능한 UI 컴포넌트
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── radio.tsx
│   │   ├── textarea.tsx
│   │   └── card.tsx
│   └── providers/           # 전역 Provider
│       ├── modal-provider.tsx
│       └── auth-guard.tsx
│
├── entities/                # 도메인 엔티티별 모듈
│   └── auth/                # 인증 모듈
│       ├── api.ts           # API 함수 (login, signup, logout 등)
│       ├── types.ts         # 타입 정의 (User, LoginParams 등)
│       ├── store.ts         # Zustand 스토어
│       ├── utils.ts         # 유틸리티 (validation 등)
│       └── index.ts         # export 통합
│
├── lib/                     # 공통 헬퍼
│   ├── api-client.ts        # API 클라이언트 (Singleton)
│   ├── storage.ts           # LocalStorage 추상화
│   ├── cookie.ts            # Cookie 관리
│   ├── types.ts             # 공통 타입 (ApiResponse, Pagination 등)
│   ├── constants.ts         # 앱 설정 상수
│   ├── utils.ts             # 공통 유틸 (cn, format 등)
│   ├── modal.store.ts       # 모달 상태 관리
│   └── tab.store.ts         # 탭 상태 관리
│
├── hooks/                   # Custom Hooks (예정)
│
└── middleware.ts            # Next.js SSR 라우트 가드
```

### 📂 각 폴더 상세 설명

#### 🌐 `entities/` - 도메인 엔티티별 모듈
**비즈니스 도메인별로 관련된 모든 코드를 한 곳에 모음**

예시: `entities/auth/`
- **`api.ts`** - 인증 API 함수
  - login, signup, logout, refreshToken, getCurrentUser 등
  - API 응답 처리 및 토큰 저장
  - **왜?** 인증 관련 API 로직을 한 곳에 모아 유지보수 용이

- **`types.ts`** - 인증 관련 타입
  - User, LoginParams, LoginResponse 등
  - 백엔드 API 응답 구조와 일치
  - **왜?** 타입을 도메인별로 관리하여 응집도 향상

- **`store.ts`** - Zustand 상태 관리
  - user, isAuthenticated, status, error
  - login(), logout(), loadUser() 액션
  - **왜?** 상태와 API 호출을 한 곳에서 관리

- **`utils.ts`** - 유틸리티 함수
  - isValidEmail(), isValidPassword(), hasRole() 등
  - 유효성 검증, 권한 체크, 포맷팅
  - **왜?** 도메인 특화 로직을 분리

- **`index.ts`** - export 통합
  - 모든 기능을 하나의 import로 사용 가능
  - 예: `import { useAuthStore, User, login } from '@/entities/auth'`
  - **왜?** import 경로 단순화

**새 엔티티 추가 방법:**
```bash
# 예: Product 엔티티 추가
mkdir src/entities/product
touch src/entities/product/{api,types,store,utils,index}.ts
```

---

#### 📚 `lib/` - 공통 헬퍼
**전역에서 사용되는 공통 유틸리티**

- **`api-client.ts`** - API 클라이언트 (Singleton 패턴)
  - Fetch 기반 HTTP 클라이언트
  - 인증 토큰 자동 주입, 타임아웃 처리, 에러 핸들링
  - **왜?** 모든 API 요청을 한 곳에서 관리하여 일관성 확보

- **`storage.ts`** - LocalStorage 추상화
  - 타입 안전한 localStorage 래퍼
  - JSON 직렬화/역직렬화 자동 처리
  - **왜?** 브라우저 API를 추상화하여 테스트 가능성 향상

- **`cookie.ts`** - Cookie 관리
  - SSR 인증을 위한 쿠키 설정/삭제
  - **왜?** middleware에서 인증 체크를 위해 쿠키 필요

- **`types.ts`** - 공통 타입
  - ApiResponse<T>: 모든 API 응답의 공통 구조
  - PaginationParams, AsyncState 등
  - **왜?** 타입 재사용과 일관성 확보

- **`constants.ts`** - 앱 설정 상수
  - API_CONFIG, STORAGE_KEYS, ROUTES 등
  - **왜?** 매직 넘버/매직 스트링 제거

- **`utils.ts`** - 공통 유틸리티
  - cn(): classnames 조합
  - formatDate(), formatNumber() 등
  - **왜?** 자주 사용되는 헬퍼 함수 중앙화

- **`modal.store.ts`** / **`tab.store.ts`** - UI 상태 관리
  - 전역 모달/탭 상태
  - **왜?** 엔티티가 아닌 UI 기능이므로 lib에 배치

---

#### 🎨 `components/` - UI 컴포넌트
**재사용 가능한 React 컴포넌트**

- **`ui/`** - 기본 UI 컴포넌트
  - forwardRef로 react-hook-form 호환
  - 타입 안전한 Props 인터페이스
  - Tailwind + SCSS Module 하이브리드 스타일링
  - **왜?** 일관된 디자인 시스템 구축

- **`providers/`** - 전역 Provider
  - `modal-provider.tsx`: React Portal로 모달 렌더링
  - `auth-guard.tsx`: 클라이언트 사이드 인증 가드 (정적 배포용)
  - **왜?** 전역 기능을 컴포넌트 트리에 주입

---

## 🏗️ 적용된 아키텍처 패턴

### 1. **엔티티 기반 모듈화**

```
entities/
├── auth/          # 인증 도메인
│   ├── api.ts
│   ├── types.ts
│   ├── store.ts
│   └── utils.ts
│
├── user/          # 사용자 도메인 (예시)
│   ├── api.ts
│   ├── types.ts
│   ├── store.ts
│   └── utils.ts
│
└── product/       # 상품 도메인 (예시)
    ├── api.ts
    ├── types.ts
    ├── store.ts
    └── utils.ts
```

**왜 이렇게 구성했는가?**
- **높은 응집도**: 관련된 코드가 한 폴더에 모임
- **낮은 결합도**: 엔티티 간 의존성 최소화
- **확장 용이**: 새 기능 추가 시 entities/ 폴더만 추가
- **직관적**: 폴더명이 비즈니스 도메인과 일치

---

### 2. **적용된 디자인 패턴**

#### 🔹 **Singleton 패턴** (`lib/api-client.ts`)
```typescript
export class ApiClient {
  private static instance: ApiClient;

  static getInstance = (): ApiClient => {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  };
}

export const apiClient = ApiClient.getInstance();
```

**왜 사용했는가?**
- API 클라이언트는 애플리케이션 전체에서 하나만 존재해야 함
- 설정(Base URL, Timeout 등)을 공유
- 메모리 효율성

---

#### 🔹 **Repository 패턴** (`entities/*/api.ts`)
```typescript
// entities/auth/api.ts
export const login = async (params: LoginParams): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', params);
  // 토큰 저장 등 부가 로직
  return response;
};
```

**왜 사용했는가?**
- 데이터 접근 로직을 캡슐화
- API 엔드포인트 변경 시 한 곳만 수정
- 테스트 시 Mock으로 쉽게 교체 가능

---

#### 🔹 **Facade 패턴** (`entities/*/store.ts`)
```typescript
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      login: async (params) => {
        set({ status: 'loading' });
        const result = await authAPI.login(params);
        if (result.success) {
          set({ user: result.data.user, isAuthenticated: true });
        }
      },
    })
  )
);
```

**왜 사용했는가?**
- 복잡한 API 호출 로직을 간단한 인터페이스로 제공
- 컴포넌트는 `login()` 호출만 하면 됨 (내부 복잡도 숨김)
- 상태 관리와 API 호출을 한 곳에서 처리

---

#### 🔹 **Observer 패턴** (Zustand 내부)
```typescript
const { user, login } = useAuthStore(); // 상태 구독
```

**왜 사용했는가?**
- 상태 변경 시 자동으로 컴포넌트 리렌더링
- React의 리렌더링 메커니즘과 완벽 통합
- Props Drilling 제거

---

#### 🔹 **Strategy 패턴** (`entities/*/utils.ts`)
```typescript
export const isValidPassword = (password: string): boolean => {
  // 다양한 검증 전략 조합
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasUpperCase && hasLowerCase && hasNumber;
};
```

**왜 사용했는가?**
- 유효성 검증 로직을 독립적인 함수로 분리
- 검증 규칙 변경 시 함수만 수정
- 재사용 가능

---

#### 🔹 **Factory 패턴** (React 컴포넌트)
```typescript
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', ...props }, ref) => {
    // variant와 size에 따라 다른 스타일 적용
    return <button ref={ref} className={cn(baseStyles, variantStyles[variant])} {...props} />;
  }
);
```

**왜 사용했는가?**
- Props에 따라 다양한 버튼 생성
- 일관된 인터페이스로 다양한 변형 제공

---

#### 🔹 **Adapter 패턴** (`lib/storage.ts`, `lib/cookie.ts`)
```typescript
export class LocalStorage {
  static setItem = <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  static getItem = <T>(key: string): T | null => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  };
}
```

**왜 사용했는가?**
- 브라우저 API를 타입 안전한 인터페이스로 변환
- localStorage의 문자열 기반 API를 타입 안전하게 사용
- 테스트 시 Mock으로 쉽게 교체

---

#### 🔹 **Portal 패턴** (`components/providers/modal-provider.tsx`)
```typescript
export const Modal = ({ isOpen, children }: ModalProps) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="modal-overlay">{children}</div>,
    document.body
  );
};
```

**왜 사용했는가?**
- 모달을 DOM 트리의 최상위에 렌더링
- z-index 문제 해결
- 부모 컴포넌트의 스타일 영향 차단

---

### 3. **SOLID 원칙 적용**

#### 🔹 **Single Responsibility Principle (SRP)**
- 각 파일/함수는 하나의 책임만 가짐
- 예: `api.ts`는 API 호출만, `utils.ts`는 유틸리티만

#### 🔹 **Open/Closed Principle (OCP)**
- 확장에는 열려있고 수정에는 닫혀있음
- 예: 새로운 엔티티 추가 시 기존 코드 수정 불필요

#### 🔹 **Liskov Substitution Principle (LSP)**
- 타입 시스템을 통해 자동으로 보장됨
- 예: `ApiResponse<T>` 제네릭 타입

#### 🔹 **Interface Segregation Principle (ISP)**
- 필요한 인터페이스만 사용
- 예: 컴포넌트는 필요한 Props만 받음

#### 🔹 **Dependency Inversion Principle (DIP)**
- 구체적인 구현이 아닌 추상화에 의존
- 예: Store는 API 함수에 의존 (구현 세부사항은 api 레이어에 숨김)

---

### 4. **기타 설계 원칙**

#### 🔹 **DRY (Don't Repeat Yourself)**
- 공통 타입: `lib/types.ts`
- 공통 유틸: `lib/utils.ts`
- 재사용 컴포넌트: `components/ui/`

#### 🔹 **KISS (Keep It Simple, Stupid)**
- 엔티티 기반으로 단순화 (10개 폴더 → 4개 폴더)
- 직관적인 폴더 구조

#### 🔹 **YAGNI (You Aren't Gonna Need It)**
- 현재 필요한 기능만 구현
- 추상화 레이어 최소화

---

### 5. **이전 Clean Architecture와 비교**

#### ✅ **왜 단순화했는가?**

| 이전 구조 | 새 구조 | 이유 |
|---------|--------|------|
| api/ + types/ + stores/ + lib/ (4개 분리) | entities/auth/ (1개 통합) | 관련 코드 응집 |
| 10개 최상위 폴더 | 4개 최상위 폴더 | 탐색 용이 |
| import 경로 복잡 | import 경로 단순 | 개발 속도 향상 |
| 파일 찾기 어려움 | 도메인별로 명확 | 유지보수성 향상 |

#### ✅ **유지된 장점**
- ✅ 타입 안전성
- ✅ 테스트 가능성
- ✅ 관심사 분리
- ✅ 확장 가능성

---

## 🚀 시작하기

### 1. 패키지 설치

```bash
pnpm install
```

### 2. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

### 3. 데모 계정으로 로그인

- 이메일: `test@example.com`
- 비밀번호: `Password123!`

### 4. 백엔드 API 연동

**Mock 데이터 제거 및 실제 API 연동 방법:**

1. `.env.local` 파일 생성:
```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api.com
NEXT_PUBLIC_API_TIMEOUT=30000
```

2. `src/entities/auth/api.ts` 수정:
```typescript
// TODO 주석 제거하고 실제 API 호출 활성화
const response = await apiClient.post<LoginResponse>('/auth/login', params);
```

3. `src/entities/auth/types.ts` 파일을 백엔드 API 스펙에 맞게 수정

---

## 📝 새 엔티티 추가하기

예: Product 엔티티 추가

### 1. 폴더 구조 생성
```bash
mkdir -p src/entities/product
```

### 2. 파일 생성
```bash
touch src/entities/product/{api,types,store,utils,index}.ts
```

### 3. `types.ts` 작성
```typescript
export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface CreateProductParams {
  name: string;
  price: number;
}
```

### 4. `api.ts` 작성
```typescript
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/lib/types';
import type { Product, CreateProductParams } from './types';

export const getProducts = async (): Promise<ApiResponse<Product[]>> => {
  return apiClient.get<Product[]>('/products');
};

export const createProduct = async (params: CreateProductParams): Promise<ApiResponse<Product>> => {
  return apiClient.post<Product>('/products', params);
};
```

### 5. `store.ts` 작성
```typescript
import { create } from 'zustand';
import type { Product } from './types';
import * as productAPI from './api';

interface ProductStore {
  products: Product[];
  fetchProducts: () => Promise<void>;
}

export const useProductStore = create<ProductStore>()((set) => ({
  products: [],
  fetchProducts: async () => {
    const result = await productAPI.getProducts();
    if (result.success) {
      set({ products: result.data || [] });
    }
  },
}));
```

### 6. `index.ts` 작성
```typescript
export * from './api';
export * from './types';
export * from './store';
export * from './utils';
```

### 7. 사용
```typescript
import { useProductStore, Product } from '@/entities/product';

const ProductList = () => {
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
};
```

---

## 🧪 테스트

```bash
# 타입 체크
pnpm tsc --noEmit

# 빌드
pnpm build

# 프로덕션 실행
pnpm start
```

## 📚 참고 자료

- [Next.js Documentation](https://nextjs.org/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

## 📄 라이선스

MIT License
