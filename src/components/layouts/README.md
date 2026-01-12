# Header 컴포넌트

## 개요

Header는 애플리케이션의 최상단에 위치하는 네비게이션 컴포넌트입니다. 로고, 메뉴, 사용자 액션 버튼을 포함하며, 반응형 디자인을 지원합니다.

## 왜 이렇게 구현했는가?

### SCSS Module 사용 이유
- **스코프 격리**: 클래스명 충돌 방지, 컴포넌트별 독립적인 스타일 관리
- **변수/믹스인 재사용**: `_variables.scss`에서 정의한 색상, 간격, 믹스인 활용
- **중첩 구조**: SCSS의 중첩 기능으로 구조를 명확하게 표현
- **유지보수성**: Tailwind 유틸리티 클래스보다 복잡한 스타일을 더 쉽게 관리

### 별도 변수 파일 분리 이유
- **CSS Module 호환성**: `globals.scss`는 Tailwind CSS를 포함하여 전역 스타일이 있음
- **빌드 오류 방지**: CSS Module은 전역 선택자를 허용하지 않음
- **재사용성**: 변수와 믹스인만 분리하여 다른 SCSS Module에서도 사용 가능

## 주요 기능

### 1. 좌측: 로고 영역
- 그라데이션 아이콘 + 텍스트
- 클릭 시 설정된 경로로 이동
- 반응형: 모바일에서 크기 축소

### 2. 중앙: 메뉴 영역
- 파이프(`|`) 구분자로 메뉴 구분
- 드롭다운 지원 (서브 메뉴가 있는 경우)
- 단일 메뉴는 드롭다운 아이콘 미표시
- 활성 메뉴 하이라이트 (현재 경로 기반)
- 반응형: 태블릿/모바일에서 햄버거 메뉴로 대체

### 3. 우측: 액션 버튼 영역
- **알림**: 뱃지로 미읽음 개수 표시
- **공유**: 공유 기능 (구현 필요)
- **도움말**: 도움말 모달 (구현 필요)
- **즐겨찾기**: 즐겨찾기 토글 (구현 필요)
- **설정**: 설정 페이지로 이동 (구현 필요)
- **프로필**: 사용자 정보 드롭다운
  - 프로필 정보 (이름, 이메일)
  - 내 프로필, 계정 설정, 테마 설정, 도움말
  - 로그아웃

### 4. 모바일 메뉴
- 햄버거 아이콘 클릭 시 사이드 드로어 오픈
- 오버레이 배경 (클릭 시 닫힘)
- 좌측에서 슬라이드 인 애니메이션
- 메뉴 + 서브메뉴 계층 구조 유지

## 사용법

### 기본 사용

```tsx
import { Header } from '@/components/layouts/header';

export default function Layout() {
  return (
    <div>
      <Header
        logoText="My App"
        logoHref="/"
        menuItems={[
          { label: '홈', href: '/' },
          { label: '대시보드', href: '/dashboard' },
        ]}
        userName="홍길동"
        userEmail="hong@example.com"
        notificationCount={3}
        onLogout={() => console.log('로그아웃')}
      />
      {/* 페이지 컨텐츠 */}
    </div>
  );
}
```

### 드롭다운 메뉴 사용

```tsx
import { Header, type MenuItem } from '@/components/layouts/header';

const menuItems: MenuItem[] = [
  { label: '홈', href: '/' },
  {
    label: '프로젝트',
    children: [
      { label: '전체 프로젝트', href: '/projects' },
      { label: '내 프로젝트', href: '/projects/my' },
      { label: '즐겨찾기', href: '/projects/favorites' },
    ],
  },
  {
    label: '리소스',
    children: [
      { label: '문서', href: '/docs' },
      { label: 'API', href: '/api-docs' },
    ],
  },
  { label: '설정', href: '/settings' },
];

<Header
  logoText="Next Starter"
  logoHref="/"
  menuItems={menuItems}
  userName="홍길동"
  userEmail="hong@example.com"
  notificationCount={5}
  onLogout={handleLogout}
/>
```

### 외부 링크 메뉴

```tsx
const menuItems: MenuItem[] = [
  { label: '홈', href: '/' },
  {
    label: 'GitHub',
    href: 'https://github.com',
    external: true, // 새 탭에서 열림
  },
];
```

## Props

### HeaderProps

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `logoText` | `string` | `'Next Starter'` | 로고 텍스트 |
| `logoHref` | `string` | `'/'` | 로고 클릭 시 이동 경로 |
| `menuItems` | `MenuItem[]` | `[]` | 메뉴 아이템 배열 |
| `userName` | `string` | `'User'` | 사용자 이름 |
| `userEmail` | `string` | `'user@example.com'` | 사용자 이메일 |
| `profileImage` | `string?` | `undefined` | 프로필 이미지 URL (없으면 이니셜 표시) |
| `notificationCount` | `number` | `0` | 알림 개수 (0이면 뱃지 미표시) |
| `onLogout` | `() => void` | `undefined` | 로그아웃 핸들러 |

### MenuItem

| 속성 | Type | 설명 |
|------|------|------|
| `label` | `string` | 메뉴 라벨 |
| `href` | `string?` | 단일 메뉴 링크 경로 (children과 함께 사용 불가) |
| `children` | `{ label: string; href: string; }[]?` | 드롭다운 서브 메뉴 |
| `external` | `boolean?` | 외부 링크 여부 (새 탭 열기) |

## 스타일 커스터마이징

### SCSS 변수 수정

`src/app/_variables.scss` 파일에서 전역 변수를 수정할 수 있습니다:

```scss
// 색상 변경
$color-primary: #3b82f6; // 원하는 색상으로 변경
$color-primary-light: #dbeafe;
$color-primary-dark: #2563eb;

// 그레이 스케일
$color-gray-700: #374151;

// 그림자
$shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
```

### 개별 스타일 오버라이드

Header의 특정 클래스만 수정하고 싶다면 `header.module.scss`를 직접 수정:

```scss
.header {
  height: 64px; // 높이 변경
  background-color: #ffffff; // 배경색 변경
}

.logo {
  font-size: 20px; // 로고 크기 변경
  color: $color-primary;
}
```

## 반응형 동작

### 데스크톱 (1024px 이상)
- 전체 메뉴 표시
- 프로필 버튼에 사용자 이름 표시
- 모든 액션 버튼 표시

### 태블릿 (640px ~ 1023px)
- 햄버거 메뉴로 전환
- 프로필 버튼에서 사용자 이름 숨김
- 아이콘 크기 유지

### 모바일 (639px 이하)
- 햄버거 메뉴
- 헤더 높이 축소 (56px)
- 로고 크기 축소
- 아이콘 크기 축소

## 디렉토리 구조

```
src/
├── app/
│   ├── _variables.scss          # SCSS 변수 및 믹스인 (CSS Module용)
│   └── globals.scss              # 전역 스타일 + Tailwind CSS
├── components/
│   └── layouts/
│       ├── header.tsx            # Header 컴포넌트 (TypeScript)
│       ├── header.module.scss    # Header 스타일 (SCSS Module)
│       └── README.md             # 이 문서
```

## 주요 기술 스택

- **TypeScript**: 타입 안전성
- **SCSS Module**: 스코프 격리된 스타일
- **Next.js**:
  - `usePathname`: 현재 경로 감지 (활성 메뉴 표시)
  - `Link`: 클라이언트 사이드 라우팅
- **React Hooks**:
  - `useState`: 드롭다운 및 모바일 메뉴 상태 관리
  - `useRef`: 외부 클릭 감지용 ref
  - `useEffect`: 외부 클릭 이벤트 리스너 등록

## 알려진 제약사항

### 1. 아이콘이 이모지로 구현됨
- **이유**: 빠른 프로토타이핑, 외부 의존성 최소화
- **개선 방향**: React Icons, Lucide Icons 등으로 교체 권장

```tsx
import { Bell, Share, HelpCircle, Star, Settings } from 'lucide-react';

// header.tsx에서 교체
<Bell size={18} />
<Share size={18} />
...
```

### 2. 액션 버튼 기능이 구현되지 않음
- 알림, 공유, 도움말, 즐겨찾기, 설정 버튼은 UI만 제공
- 각 기능은 프로젝트 요구사항에 맞게 구현 필요

### 3. 프로필 드롭다운 메뉴 동작 미구현
- "내 프로필", "계정 설정", "테마 설정", "도움말" 메뉴는 라우팅 필요
- `onClick` 핸들러 추가하여 원하는 동작 구현

## 확장 가이드

### 1. 새 액션 버튼 추가

`header.tsx`의 `actionsSection`에 버튼 추가:

```tsx
<div className={styles.actionsSection}>
  {/* 기존 버튼들 */}

  {/* 새 버튼 추가 */}
  <button className={styles.actionButton} title="검색">
    <span className={styles.actionIcon}>🔍</span>
  </button>
</div>
```

### 2. 프로필 드롭다운 메뉴 커스터마이징

```tsx
<div className={styles.profileDropdown}>
  {/* 기존 메뉴 */}

  {/* 새 메뉴 추가 */}
  <button
    className={styles.profileMenuItem}
    onClick={() => router.push('/billing')}
  >
    <span className={styles.profileMenuIcon}>💳</span>
    결제 정보
  </button>
</div>
```

### 3. 다크 모드 지원

SCSS 변수를 CSS 변수로 변환하고 테마별 값 정의:

```scss
// _variables.scss
:root {
  --color-primary: #3b82f6;
  --color-bg: #ffffff;
  --color-text: #374151;
}

[data-theme='dark'] {
  --color-primary: #60a5fa;
  --color-bg: #1f2937;
  --color-text: #f3f4f6;
}

// header.module.scss
.header {
  background-color: var(--color-bg);
  color: var(--color-text);
}
```

## 테스트 시나리오

### 단위 테스트
1. Props가 올바르게 렌더링되는지 확인
2. 드롭다운 토글 동작 확인
3. 외부 클릭 시 드롭다운 닫힘 확인
4. 활성 메뉴 감지 확인

### 통합 테스트
1. 메뉴 클릭 시 올바른 경로로 이동하는지 확인
2. 로그아웃 버튼 클릭 시 `onLogout` 호출 확인
3. 모바일 메뉴 오픈/클로즈 동작 확인

### E2E 테스트
1. 데스크톱 → 모바일 반응형 전환 확인
2. 드롭다운 메뉴 전체 플로우 확인
3. 프로필 드롭다운 → 로그아웃 플로우 확인

## 성능 최적화

### 1. 이미지 최적화
프로필 이미지를 Next.js Image 컴포넌트로 교체:

```tsx
import Image from 'next/image';

<div className={styles.avatar}>
  {profileImage ? (
    <Image
      src={profileImage}
      alt={userName}
      width={32}
      height={32}
      className="rounded-full"
    />
  ) : (
    getInitials(userName)
  )}
</div>
```

### 2. 메모이제이션
큰 메뉴 배열인 경우 `useMemo`로 최적화:

```tsx
const activeMenuIndex = useMemo(
  () => menuItems.findIndex(item => isMenuActive(item)),
  [menuItems, pathname]
);
```

### 3. 이벤트 리스너 정리
`useEffect`의 cleanup 함수로 메모리 누수 방지 (이미 구현됨):

```tsx
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    // ...
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

## 트러블슈팅

### 1. 빌드 에러: "Undefined variable"
**원인**: `globals.scss`를 SCSS Module에서 import하여 Tailwind CSS 전역 스타일이 포함됨

**해결**: `_variables.scss`를 사용하여 변수와 믹스인만 import

```scss
// ❌ 잘못된 방법
@use '@/app/globals.scss' as *;

// ✅ 올바른 방법
@use '@/app/variables' as *;
```

### 2. CSS Module 에러: "Selector is not pure"
**원인**: CSS Module은 전역 선택자(`*`, `body`, `a` 등)를 허용하지 않음

**해결**: 변수/믹스인만 포함된 파일 사용, 전역 스타일은 `globals.scss`에만 유지

### 3. 드롭다운이 열리지 않음
**원인**: `z-index` 충돌 또는 JavaScript 오류

**해결**:
1. 브라우저 콘솔에서 JavaScript 오류 확인
2. `z-index: 1000` 이상으로 설정되어 있는지 확인
3. `position: relative` 부모 요소 확인

## 라이선스

이 컴포넌트는 Next.js 스타터 프로젝트의 일부로, 자유롭게 수정 및 배포할 수 있습니다.

## 기여 가이드

개선 사항이나 버그를 발견하면:
1. Issue 생성
2. PR 제출 (테스트 포함)
3. 코드 리뷰 대기

## 참고 자료

- [Next.js App Router](https://nextjs.org/docs/app)
- [SCSS 공식 문서](https://sass-lang.com/documentation/)
- [CSS Modules](https://github.com/css-modules/css-modules)
- [Tailwind CSS v4](https://tailwindcss.com/)
