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
│   │   └── layouts/         # 레이아웃 컴포넌트
│   ├── contexts/            # React Context
│   └── middleware/          # 인증 미들웨어
│
├── shared/                  # 공통 유틸리티
│   ├── types/               # 공통 타입 정의
│   ├── utils/               # 유틸 함수
│   └── constants/           # 상수
│
└── app/                     # Next.js App Router
    ├── page.tsx             # 홈 페이지
    ├── login/               # 로그인 페이지
    └── dashboard/           # 대시보드 (인증 필요)
```

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