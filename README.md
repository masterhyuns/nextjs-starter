# Next Clean Starter

Clean Architecture와 SOLID 원칙을 적용한 프로덕션 준비 완료 Next.js 스타터 템플릿

## 🎯 주요 특징

- ✅ **Clean Architecture**: 도메인 중심 설계로 비즈니스 로직과 프레임워크 분리
- ✅ **SOLID 원칙**: 유지보수 가능하고 확장 가능한 코드 구조
- ✅ **TypeScript**: 엄격한 타입 검사로 안정성 확보
- ✅ **Zustand**: 경량하고 강력한 상태 관리
- ✅ **React Hook Form + Zod**: 타입 안전한 폼 관리 및 유효성 검증
- ✅ **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크
- ✅ **인증 시스템**: Public/Private 라우트 구분
- ✅ **탭 기능**: Zustand 기반 단일 페이지 탭 관리
- ✅ **모달 시스템**: 중앙 집중식 모달 상태 관리

## 📁 프로젝트 구조

```
src/
├── domain/                   # 도메인 레이어 (비즈니스 로직)
│   ├── entities/            # 엔티티 (User, Product 등)
│   ├── repositories/        # Repository 인터페이스 (DIP)
│   └── use-cases/           # 비즈니스 유스케이스
│
├── application/             # 애플리케이션 레이어
│   ├── stores/              # Zustand 상태 관리
│   └── hooks/               # Custom React Hooks
│
├── infrastructure/          # 인프라 레이어
│   ├── api/                 # API 클라이언트
│   ├── storage/             # 로컬 스토리지
│   └── repositories/        # Repository 구현체
│
├── presentation/            # 프레젠테이션 레이어
│   ├── components/          # React 컴포넌트
│   │   ├── ui/              # 기본 UI (Button, Input 등)
│   │   ├── forms/           # Form 컴포넌트
│   │   ├── layouts/         # 레이아웃 컴포넌트
│   │   └── providers/       # 전역 Provider
│   ├── contexts/            # React Context
│   └── middleware/          # 인증 미들웨어
│
├── shared/                  # 공통 유틸리티
│   ├── types/               # 공통 타입 정의
│   ├── utils/               # 유틸 함수
│   └── constants/           # 상수
│
└── app/                     # Next.js App Router
    ├── globals.scss         # 전역 스타일 (Tailwind + SCSS)
    ├── layout.tsx           # Root Layout
    ├── page.tsx             # 홈 페이지
    ├── login/               # 로그인 페이지
    └── dashboard/           # 대시보드 (인증 필요)
```

### 📂 각 폴더 상세 설명

#### 🎯 `domain/` - 도메인 레이어
**핵심 비즈니스 로직을 담당하는 가장 중요한 레이어**

- **`entities/`** - 비즈니스 엔티티 정의
  - 순수한 비즈니스 객체 (User, Product, Order 등)
  - 프레임워크에 독립적인 타입 정의
  - 예: `user.entity.ts`, `product.entity.ts`
  - **왜?** 비즈니스 규칙은 기술 스택 변경과 무관하게 유지되어야 함

- **`repositories/`** - Repository 인터페이스
  - 데이터 접근을 위한 추상화된 인터페이스 (DIP 적용)
  - 실제 구현은 `infrastructure/repositories/`에 위치
  - 예: `auth.repository.interface.ts`, `user.repository.interface.ts`
  - **왜?** 도메인은 구현체가 아닌 인터페이스에 의존해야 함 (의존성 역전)

- **`use-cases/`** - 비즈니스 유스케이스
  - 애플리케이션의 핵심 비즈니스 로직 구현
  - 단일 책임 원칙(SRP)에 따라 하나의 유스케이스당 하나의 파일
  - 예: `login.use-case.ts`, `get-user-info.use-case.ts`
  - **왜?** 비즈니스 로직을 재사용 가능하고 테스트 가능한 단위로 분리

---

#### 🔄 `application/` - 애플리케이션 레이어
**UI 상태와 애플리케이션 흐름을 관리하는 레이어**

- **`stores/`** - Zustand 상태 관리
  - 전역 상태 저장소 (auth, modal, tab 등)
  - Persist 미들웨어로 로컬스토리지 자동 동기화
  - 예: `auth.store.ts`, `modal.store.ts`, `tab.store.ts`
  - **왜?** 컴포넌트 간 상태 공유와 영속성 관리를 중앙화

- **`hooks/`** - Custom React Hooks
  - 재사용 가능한 리액트 로직 캡슐화
  - Store와 Use Case를 연결하는 브릿지 역할
  - 예: `useAuth.ts`, `useModal.ts`, `useTab.ts`
  - **왜?** 컴포넌트에서 비즈니스 로직을 분리하고 재사용성 향상

---

#### 🏗️ `infrastructure/` - 인프라 레이어
**외부 시스템과의 연동을 담당하는 레이어**

- **`api/`** - API 클라이언트
  - HTTP 요청을 위한 Fetch/Axios 래퍼
  - Base URL, 인터셉터, 에러 핸들링 설정
  - 예: `client.ts`, `interceptors.ts`
  - **왜?** API 통신 로직을 중앙 집중화하여 유지보수성 향상

- **`storage/`** - 브라우저 스토리지 관리
  - LocalStorage, SessionStorage, Cookie 추상화
  - 타입 안전한 스토리지 접근 제공
  - 예: `local-storage.ts`, `cookie.ts`
  - **왜?** 브라우저 API를 추상화하여 테스트 가능하고 타입 안전한 코드 작성

- **`repositories/`** - Repository 구현체
  - `domain/repositories/` 인터페이스의 실제 구현
  - API 호출, 데이터 변환, 에러 처리 로직 포함
  - 예: `auth.repository.ts`, `user.repository.ts`
  - **왜?** 인터페이스와 구현을 분리하여 테스트 용이성과 유연성 확보

---

#### 🎨 `presentation/` - 프레젠테이션 레이어
**사용자 인터페이스를 담당하는 레이어**

- **`components/ui/`** - 기본 UI 컴포넌트
  - 재사용 가능한 디자인 시스템 컴포넌트
  - forwardRef로 react-hook-form 호환
  - 예: `button.tsx`, `input.tsx`, `modal.tsx`, `select.tsx`
  - SCSS Module 사용 예시: `card.module.scss`, `card.tsx`
  - **왜?** 일관된 디자인과 재사용성을 위한 컴포넌트 라이브러리 구축

- **`components/forms/`** - Form 컴포넌트
  - React Hook Form + Zod를 활용한 폼 컴포넌트
  - 유효성 검증이 포함된 비즈니스 폼
  - 예: `login-form.tsx`, `signup-form.tsx`
  - **왜?** 폼 로직을 컴포넌트로 캡슐화하여 재사용성 향상

- **`components/layouts/`** - 레이아웃 컴포넌트
  - 페이지 레이아웃 구조 컴포넌트
  - Header, Footer, Sidebar 등
  - 예: `main-layout.tsx`, `auth-layout.tsx`
  - **왜?** 일관된 페이지 구조와 레이아웃 재사용

- **`components/providers/`** - 전역 Provider
  - Context Provider, Portal Provider 등
  - 전역 상태 및 기능 제공
  - 예: `modal-provider.tsx`, `auth-guard.tsx`
  - **왜?** 전역 기능을 컴포넌트 트리에 주입하기 위한 Provider 패턴

- **`contexts/`** - React Context
  - React Context API를 활용한 상태 공유
  - 테마, 언어 설정 등 전역 설정 관리
  - **왜?** Props Drilling을 피하고 전역 상태를 효율적으로 관리

- **`middleware/`** - 인증 미들웨어
  - Next.js 미들웨어 (SSR 기반 라우트 가드)
  - 인증 상태 확인 및 리다이렉트 처리
  - 예: `src/middleware.ts`
  - **왜?** 서버 사이드에서 인증을 처리하여 번쩍거림 없는 UX 제공

---

#### 🔧 `shared/` - 공유 레이어
**모든 레이어에서 사용 가능한 공통 유틸리티**

- **`types/`** - 공통 타입 정의
  - 전역적으로 사용되는 TypeScript 타입/인터페이스
  - API 응답 타입, 공통 유틸리티 타입
  - 예: `api.types.ts`, `common.types.ts`
  - **왜?** 타입을 중앙 집중화하여 일관성과 재사용성 확보

- **`utils/`** - 유틸리티 함수
  - 순수 함수 기반의 헬퍼 함수
  - 날짜 포맷, 문자열 처리, 유효성 검사 등
  - 예: `cn.ts` (classnames 유틸), `format.ts`, `validation.ts`
  - **왜?** 반복되는 로직을 순수 함수로 분리하여 테스트 가능성 향상

- **`constants/`** - 상수 정의
  - 매직 넘버/문자열을 상수로 정의
  - API 엔드포인트, 라우트 경로, 설정 값 등
  - 예: `routes.ts`, `api-endpoints.ts`, `config.ts`
  - **왜?** 하드코딩을 피하고 변경 사항을 한 곳에서 관리

---

#### 📱 `app/` - Next.js App Router
**Next.js 프레임워크의 라우팅 및 페이지 레이어**

- **`globals.scss`** - 전역 스타일
  - Tailwind CSS v4 설정 (`@import url('tailwindcss')`)
  - SCSS 변수 (색상, 간격, 브레이크포인트, 전환 효과)
  - SCSS 믹스인 (respond-to, flex-center, text-ellipsis, shadow)
  - Tailwind 테마 커스터마이징 (`@theme`)
  - **왜?** Tailwind의 유틸리티와 SCSS의 강력함을 동시에 활용

- **`layout.tsx`** - Root Layout
  - 전역 레이아웃 및 Provider 설정
  - 폰트, 메타데이터, Modal Provider 등
  - **왜?** 모든 페이지에 공통으로 적용되는 설정을 중앙화

- **`page.tsx`** - 홈 페이지
  - Public 접근 가능한 랜딩 페이지
  - **왜?** 애플리케이션의 진입점

- **`login/`** - 로그인 페이지
  - 인증 라우트 (로그인 후 자동 리다이렉트)
  - **왜?** 사용자 인증 흐름의 시작점

- **`dashboard/`** - 대시보드
  - Private 라우트 (인증 필요)
  - 탭 기능, 모달 예시 포함
  - **왜?** 인증된 사용자만 접근 가능한 주요 기능 영역

---

### 🎯 레이어 간 의존성 규칙

```
presentation → application → domain ← infrastructure
     ↓              ↓           ↑
  shared  ←  ←  ←  ←  ←  ←  ←
```

**의존성 방향:**
- `presentation`은 `application`, `domain`, `shared`에 의존
- `application`은 `domain`, `shared`에 의존
- `infrastructure`는 `domain`, `shared`에 의존 (인터페이스 구현)
- `domain`은 `shared`만 의존 (가장 독립적)
- `shared`는 아무것도 의존하지 않음 (최하위 레이어)

**왜 이렇게 설계했는가?**
- **관심사의 분리**: 각 레이어가 명확한 책임을 가짐
- **테스트 용이성**: 레이어별로 독립적인 테스트 가능
- **유지보수성**: 한 레이어의 변경이 다른 레이어에 최소한의 영향
- **확장성**: 새로운 기능 추가 시 명확한 위치 파악 가능

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

## 📖 주요 개념

### Clean Architecture 레이어

1. **Domain Layer** (도메인 레이어)
   - 비즈니스 로직과 규칙
   - 프레임워크에 독립적

2. **Application Layer** (애플리케이션 레이어)
   - 애플리케이션 흐름 제어
   - UI 상태 관리

3. **Infrastructure Layer** (인프라 레이어)
   - 외부 시스템 연동
   - API, Database, Storage

4. **Presentation Layer** (프레젠테이션 레이어)
   - UI 렌더링
   - React 컴포넌트

### Dependency Inversion Principle (DIP)

```typescript
// 도메인은 인터페이스만 의존
export interface IAuthRepository {
  login(params: LoginParams): Promise<ApiResponse<LoginResponse>>;
}

// 인프라가 구체적인 구현 제공
export class AuthRepository implements IAuthRepository {
  login = async (params) => { /* 실제 구현 */ };
}
```

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

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zustand](https://github.com/pmndrs/zustand)

## 📄 라이선스

MIT License

(demo: admin@example.com / Admin123!)