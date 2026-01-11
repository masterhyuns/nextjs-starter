# Next Clean Starter - 구현 완료 문서

## 📋 프로젝트 개요

**Next.js Clean Architecture Starter**는 SOLID 원칙과 Clean Architecture를 준수하여 구현된 프로덕션 레디 스타터 템플릿입니다.

### ✅ 모든 요구사항 구현 완료

- [x] Next.js 16.1.1 기반 스타터
- [x] TypeScript 엄격 모드 준수
- [x] SOLID 원칙 적용
- [x] Clean Architecture 구조
- [x] 웹 애플리케이션 전체 예시 및 소스
- [x] **Private/Public 페이지 SSR 인증** (번쩍거림 없음)
- [x] **Form 및 디자인 컴포넌트** 전체 구현
- [x] **Zustand 탭 기능** (단일 페이지)
- [x] **모달 시스템** (Zustand 통합)
- [x] 직관적인 코드 구조
- [x] **상세한 주석** (왜 + 어떻게)
- [x] **Tailwind CSS v4** 설정 완료

---

## 🏗️ Clean Architecture 구조

```
src/
├── domain/                  # 도메인 레이어 (비즈니스 로직)
│   ├── entities/           # 엔티티 + 도메인 로직
│   │   └── user.entity.ts  # 사용자 엔티티 + 검증 로직
│   ├── repositories/       # Repository 인터페이스 (DIP)
│   │   └── auth.repository.interface.ts
│   └── use-cases/          # Use Cases (비즈니스 규칙)
│       └── auth/
│           ├── login.use-case.ts
│           └── signup.use-case.ts
│
├── application/            # 애플리케이션 레이어 (상태 관리)
│   └── stores/            # Zustand stores
│       ├── auth.store.ts   # 인증 상태
│       ├── tab.store.ts    # 탭 상태
│       └── modal.store.ts  # 모달 상태
│
├── infrastructure/         # 인프라 레이어 (외부 연동)
│   ├── api/
│   │   └── api-client.ts   # API 클라이언트 (싱글톤)
│   ├── storage/
│   │   ├── local-storage.ts  # localStorage 래퍼
│   │   └── cookie.ts         # Cookie 유틸리티
│   └── repositories/
│       └── auth.repository.ts  # Repository 구현체
│
├── presentation/          # 프레젠테이션 레이어 (UI)
│   ├── components/
│   │   ├── ui/           # 재사용 UI 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── select.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio.tsx
│   │   │   └── textarea.tsx
│   │   └── providers/
│   │       └── modal-provider.tsx
│
├── shared/                # 공유 레이어
│   ├── types/            # 공통 타입 정의
│   ├── utils/            # 유틸리티 함수
│   └── constants/        # 상수
│
├── app/                  # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   └── dashboard/
│
└── middleware.ts         # SSR 인증 가드
```

---

## 🎯 핵심 기능

### 1. SSR 기반 인증 시스템 (번쩍거림 없음)

**파일:** `src/middleware.ts`

**구현 내용:**
- Next.js Middleware로 서버 사이드 인증 체크
- 쿠키 기반 토큰 검증 (SSR 호환)
- Public/Auth/Private 라우트 구분
- 자동 리다이렉트 (로그인 후 원래 페이지 복귀)

**왜 이 방식인가?**
- 서버에서 처리하여 **클라이언트 번쩍거림 없음**
- 페이지 렌더링 전 인증 체크
- SEO 친화적
- 불필요한 리소스 로드 방지

**예시:**
```typescript
// 비로그인 상태로 /dashboard 접근
// → 서버에서 /login으로 리다이렉트 (번쩍거림 없음)

// 로그인 상태로 /login 접근
// → 서버에서 /dashboard로 리다이렉트
```

---

### 2. 완전한 Form 컴포넌트 시스템

**구현된 컴포넌트:**

| 컴포넌트 | 파일 | 주요 기능 |
|---------|------|----------|
| **Button** | `button.tsx` | variant (primary/secondary/danger/outline), size, loading state, icon |
| **Input** | `input.tsx` | label, error, helper text, type 지원 |
| **Select** | `select.tsx` | 드롭다운, 옵션 배열, placeholder |
| **Checkbox** | `checkbox.tsx` | label 위치, 그룹 패턴 |
| **Radio** | `radio.tsx` | Radio + RadioGroup, 수평/수직 레이아웃 |
| **Textarea** | `textarea.tsx` | 자동 높이 조절, 글자 수 표시 |
| **Modal** | `modal.tsx` | Portal, 애니메이션, ESC 키, 크기 옵션 |

**특징:**
- ✅ react-hook-form과 완벽 호환
- ✅ forwardRef 사용 (ref 전달)
- ✅ 타입 안전성 (TypeScript)
- ✅ 접근성 고려 (aria, label)
- ✅ 에러 상태 표시
- ✅ 일관된 디자인 시스템

**사용 예시:**
```tsx
import { useForm } from 'react-hook-form';
import { Input, Select, Checkbox } from '@/presentation/components/ui';

function MyForm() {
  const { register, formState: { errors } } = useForm();

  return (
    <>
      <Input
        label="이메일"
        error={errors.email?.message}
        {...register('email')}
      />

      <Select
        label="국가"
        options={countryOptions}
        {...register('country')}
      />

      <Checkbox
        label="이용약관 동의"
        {...register('terms')}
      />
    </>
  );
}
```

---

### 3. Zustand 기반 상태 관리

**구현된 스토어:**

#### `auth.store.ts` - 인증 상태
```typescript
interface AuthStore {
  user: UserEntity | null;
  isAuthenticated: boolean;
  status: AsyncState;
  error: string | null;

  login: (params) => Promise<boolean>;
  signup: (params) => Promise<boolean>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}
```

**특징:**
- persist 미들웨어로 localStorage 연동
- Use Case 패턴으로 비즈니스 로직 분리
- 쿠키와 localStorage 동시 관리 (SSR 지원)

#### `tab.store.ts` - 탭 상태
```typescript
interface TabStore {
  activeTab: string | null;
  tabs: TabItem[];

  setTabs: (tabs, defaultTab?) => void;
  setActiveTab: (tabId) => void;
  nextTab: () => void;
  previousTab: () => void;
  setTabDisabled: (tabId, disabled) => void;
}
```

**사용 예시 (dashboard):**
```tsx
const { tabs, activeTab, setTabs, setActiveTab } = useTabStore();

// 탭 초기화
setTabs([
  { id: 'overview', label: '개요' },
  { id: 'analytics', label: '분석', badge: 3 },
]);

// 탭 클릭
<button onClick={() => setActiveTab('overview')}>
```

#### `modal.store.ts` - 모달 상태
```typescript
interface ModalStore {
  modals: ModalItem[];

  openModal: (modal) => string;
  closeModal: (id?) => void;
  closeAllModals: () => void;
}
```

**사용 예시:**
```tsx
const { openModal, closeModal } = useModalStore();

// 알림 모달
openModal({
  title: '알림',
  content: <p>저장되었습니다!</p>,
  size: 'sm',
});

// 확인 모달
openModal({
  title: '삭제 확인',
  content: (
    <div>
      <p>정말 삭제하시겠습니까?</p>
      <Button onClick={() => {
        deleteItem();
        closeModal();
      }}>삭제</Button>
    </div>
  ),
  disableBackdropClick: true,
});
```

---

### 4. Modal 시스템 (Portal + Zustand)

**구현 파일:**
- `modal.tsx` - Modal 컴포넌트
- `modal-provider.tsx` - Provider
- `modal.store.ts` - Zustand 스토어

**특징:**
- ✅ Portal로 DOM 최상위 렌더링
- ✅ 여러 모달 스택 관리
- ✅ ESC 키로 닫기
- ✅ 배경 클릭 차단 옵션
- ✅ Body 스크롤 방지
- ✅ Fade-in/out 애니메이션
- ✅ 다양한 크기 (sm, md, lg, xl, full)

**왜 이 방식인가?**
- Portal: z-index 문제 해결
- Zustand: 전역 모달 관리
- 선언적 API: 간단한 사용법

---

### 5. Tailwind CSS v4 설정

**파일:**
- `postcss.config.mjs` - PostCSS 설정
- `src/app/globals.css` - Tailwind 설정

**v4 특징:**
- ✅ `@import 'tailwindcss'` 방식
- ✅ `@theme` 디렉티브로 커스터마이징
- ✅ 설정 파일 불필요 (CSS에서 직접 설정)
- ✅ 더 빠른 빌드 성능

**설정 예시:**
```css
@import 'tailwindcss';

@theme {
  --color-primary: #3b82f6;
  --animate-fade-in: fade-in 0.3s ease-in-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## 🎓 SOLID 원칙 적용

### 1. **SRP (Single Responsibility Principle)**
각 클래스/함수는 하나의 책임만 가짐

**예시:**
- `LoginUseCase`: 로그인 비즈니스 로직만 담당
- `AuthRepository`: 인증 데이터 접근만 담당
- `Button`: 버튼 UI 렌더링만 담당

### 2. **OCP (Open/Closed Principle)**
확장에는 열려있고 수정에는 닫혀있음

**예시:**
- Repository 인터페이스로 구현체 교체 가능
- variant props로 Button 스타일 확장

### 3. **LSP (Liskov Substitution Principle)**
하위 타입은 상위 타입을 대체 가능

**예시:**
- `AuthRepository`는 `IAuthRepository` 인터페이스 완전 준수
- Mock Repository로 실제 Repository 대체 가능

### 4. **ISP (Interface Segregation Principle)**
클라이언트는 사용하지 않는 인터페이스에 의존하지 않음

**예시:**
- `IAuthRepository`: 인증 관련 메서드만 포함
- 불필요한 메서드 없음

### 5. **DIP (Dependency Inversion Principle)**
고수준 모듈은 저수준 모듈에 의존하지 않음

**예시:**
```typescript
// Use Case는 추상화(인터페이스)에 의존
class LoginUseCase {
  constructor(
    private readonly authRepository: IAuthRepository
  ) {}
}

// 구체 구현은 외부에서 주입
const loginUseCase = new LoginUseCase(authRepository);
```

---

## 📚 주석 작성 원칙

모든 코드에는 **"왜"** 이렇게 구현했는지 설명하는 주석이 포함되어 있습니다.

**예시 1 - 왜 이 방법을 선택했는가?**
```typescript
/**
 * 왜 Middleware를 사용하는가?
 * - 서버에서 실행되어 클라이언트 번쩍거림 없음
 * - 페이지 렌더링 전에 인증 체크
 * - 불필요한 리소스 로드 방지
 * - Edge Runtime에서 실행되어 빠른 응답
 */
```

**예시 2 - 왜 이 구조로 설계했는가?**
```typescript
/**
 * 왜 localStorage와 쿠키 모두에 저장하는가?
 * - localStorage: 클라이언트 측 상태 관리용 (Zustand persist)
 * - Cookie: 서버 사이드 인증 체크용 (middleware)
 */
```

**예시 3 - 비즈니스 로직 설명**
```typescript
/**
 * 로그인 비즈니스 플로우:
 * 1. status를 'loading'으로 설정
 * 2. LoginUseCase 실행 (검증 + API 호출)
 * 3. 성공 시 user 상태 업데이트 + 쿠키 저장
 * 4. 실패 시 error 상태 업데이트
 */
```

---

## 🚀 시작하기

### 1. 설치
```bash
pnpm install
```

### 2. 개발 서버 실행
```bash
pnpm dev
```

### 3. 빌드
```bash
pnpm build
```

### 4. 로그인 테스트
- URL: `http://localhost:3000/login`
- 데모 계정:
  - 이메일: `test@example.com`
  - 비밀번호: `Password123!`

---

## 📁 주요 파일 설명

### 인증 시스템
| 파일 | 설명 |
|------|------|
| `src/middleware.ts` | SSR 인증 가드 |
| `src/domain/use-cases/auth/login.use-case.ts` | 로그인 비즈니스 로직 |
| `src/infrastructure/repositories/auth.repository.ts` | 인증 데이터 접근 |
| `src/application/stores/auth.store.ts` | 인증 상태 관리 |
| `src/infrastructure/storage/cookie.ts` | 쿠키 유틸리티 |

### UI 컴포넌트
| 파일 | 설명 |
|------|------|
| `src/presentation/components/ui/button.tsx` | 버튼 컴포넌트 |
| `src/presentation/components/ui/input.tsx` | 인풋 컴포넌트 |
| `src/presentation/components/ui/modal.tsx` | 모달 컴포넌트 |
| `src/presentation/components/ui/select.tsx` | 셀렉트 컴포넌트 |
| `src/presentation/components/ui/checkbox.tsx` | 체크박스 컴포넌트 |
| `src/presentation/components/ui/radio.tsx` | 라디오 컴포넌트 |
| `src/presentation/components/ui/textarea.tsx` | 텍스트에리어 컴포넌트 |

### 페이지
| 파일 | 설명 |
|------|------|
| `src/app/page.tsx` | 홈 페이지 (Public) |
| `src/app/login/page.tsx` | 로그인 페이지 (Auth) |
| `src/app/dashboard/page.tsx` | 대시보드 (Private, 탭 + 모달 데모) |

---

## 🔧 확장 가이드

### 새로운 페이지 추가

1. **Public 페이지**
```typescript
// src/app/about/page.tsx
export default function AboutPage() {
  return <div>About Page</div>;
}

// middleware.ts의 PUBLIC_ROUTES에 추가
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/about'];
```

2. **Private 페이지**
```typescript
// src/app/profile/page.tsx
export default function ProfilePage() {
  const { user } = useAuthStore();
  return <div>Profile: {user?.name}</div>;
}

// middleware.ts의 PRIVATE_ROUTES에 추가
const PRIVATE_ROUTES = ['/dashboard', '/profile', '/settings'];
```

### 새로운 Form 컴포넌트 추가

```typescript
// src/presentation/components/ui/date-picker.tsx
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        {label && <label>{label}</label>}
        <input ref={ref} type="date" {...props} />
        {error && <p>{error}</p>}
      </div>
    );
  }
);
```

### 새로운 Use Case 추가

```typescript
// src/domain/use-cases/user/update-profile.use-case.ts
export class UpdateProfileUseCase {
  constructor(
    private readonly userRepository: IUserRepository
  ) {}

  execute = async (params: UpdateProfileParams) => {
    // 비즈니스 로직
  };
}
```

---

## 📖 추가 문서

- **[TAILWIND.md](./TAILWIND.md)** - Tailwind CSS v4 설정 가이드
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 배포 가이드 (SSR vs 정적 배포)
- **[README.md](./README.md)** - 프로젝트 개요 및 시작 가이드

---

## 🌐 배포 방법

### ⚠️ **중요: Middleware는 SSR 배포에서만 동작합니다**

| 배포 방식 | Middleware | 번쩍거림 | 권장도 |
|---------|-----------|---------|-------|
| **SSR (Vercel)** | ✅ 동작 | 없음 | ⭐⭐⭐⭐⭐ |
| **SSR (Node.js)** | ✅ 동작 | 없음 | ⭐⭐⭐⭐ |
| **정적 배포** | ❌ 안됨 | 있음 | ⭐ |

### 추천 배포 방법 (Vercel)

```bash
# 1. GitHub에 푸시
git add .
git commit -m "feat: 프로젝트 완성"
git push origin main

# 2. Vercel 배포
npm i -g vercel
vercel login
vercel --prod
```

**또는 Vercel 웹사이트:**
1. https://vercel.com 접속
2. GitHub 레포지토리 연결
3. 자동 배포 완료!

### 정적 배포가 필요한 경우

정적 배포 시 Middleware가 동작하지 않으므로 클라이언트 사이드 인증을 사용해야 합니다:

1. `AuthGuard` 컴포넌트 사용 (이미 구현됨)
2. `src/middleware.ts` 비활성화
3. `layout.tsx`에 AuthGuard 추가

**단점:**
- ⚠️ 클라이언트 번쩍거림 발생
- ⚠️ SEO 불리
- ⚠️ 보안성 낮음

**자세한 내용은 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.**

---

## ✅ 체크리스트

- [x] Next.js 16.1.1 설치
- [x] TypeScript 엄격 모드 설정
- [x] Clean Architecture 구조 구축
- [x] SOLID 원칙 적용
- [x] SSR 인증 시스템 (middleware)
- [x] Form 컴포넌트 7개 구현
- [x] Zustand 상태 관리 (auth, tab, modal)
- [x] Modal 시스템 구현
- [x] Tailwind CSS v4 설정
- [x] 상세한 주석 작성
- [x] 빌드 테스트 통과
- [x] 데모 페이지 구현

---

## 🎉 완료!

모든 요구사항이 구현되었으며, 프로덕션 환경에서 사용할 수 있는 수준의 코드 품질을 갖추고 있습니다.

**다음 단계:**
1. 실제 백엔드 API와 연동
2. 에러 바운더리 추가
3. 테스트 코드 작성 (Jest, React Testing Library)
4. Storybook으로 컴포넌트 문서화
5. 성능 최적화 (React.memo, useMemo)

---

**궁금한 점이나 개선이 필요한 부분이 있다면 언제든지 문의해주세요!** 🚀
