# FullScreenLoading 컴포넌트

위치에 상관없이 전체 화면을 덮는 로딩 컴포넌트입니다.

## 특징

- **Fixed Position**: 스크롤 위치와 무관하게 항상 화면 전체를 덮음
- **최상위 레이어**: z-index: 9999로 모든 요소 위에 표시
- **SCSS Module**: 스타일 스코프 격리, 클래스명 충돌 방지
- **다크모드 지원**: `prefers-color-scheme`에 따라 자동 테마 변경
- **접근성(a11y)**:
  - `role="status"`, `aria-live="polite"`로 스크린 리더 지원
  - `sr-only` 클래스로 시각적 사용자와 스크린 리더 사용자 모두 고려
  - `prefers-reduced-motion` 대응 (애니메이션 감소 선호 사용자)
- **3가지 크기**: small, medium(기본), large

## 사용법

### 기본 사용

```tsx
import { FullScreenLoading } from '@/components/ui/full-screen-loading';

function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <FullScreenLoading />;
  }

  return <div>콘텐츠</div>;
}
```

### 커스텀 텍스트

```tsx
<FullScreenLoading text="데이터를 불러오는 중..." />
```

### 크기 변경

```tsx
// 작은 크기
<FullScreenLoading size="small" text="잠시만 기다려주세요..." />

// 기본 크기 (생략 가능)
<FullScreenLoading size="medium" />

// 큰 크기
<FullScreenLoading size="large" text="처리 중입니다..." />
```

### AuthGuard에서 사용 (실제 예시)

```tsx
// src/components/providers/auth-guard.tsx
if (shouldBlockRender) {
  return <FullScreenLoading text="로딩 중..." />;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `'로딩 중...'` | 로딩 텍스트 (선택사항) |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 스피너 크기 |
| `className` | `string` | `undefined` | 추가 CSS 클래스 |

## 스타일 커스터마이징

CSS 변수를 사용하여 전역으로 스타일을 커스터마이징할 수 있습니다.

### globals.scss에서 변수 변경

```scss
:root {
  // 배경색
  --color-background: #ffffff;

  // 텍스트 색상
  --color-text-secondary: #6b7280;

  // 스피너 색상
  --color-gray-200: #e5e7eb;
  --color-primary: #3b82f6;

  // 간격
  --spacing-4: 1rem;

  // 폰트 크기
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
}

// 다크모드
@media (prefers-color-scheme: dark) {
  :root {
    --color-background-dark: #1a1a1a;
    --color-text-secondary-dark: #9ca3af;
    --color-gray-700: #374151;
    --color-primary-dark: #3b82f6;
  }
}
```

## 구현 세부사항

### 왜 SCSS Module을 사용했는가?

1. **스타일 스코프 격리**: 클래스명 충돌 방지
2. **SCSS 기능 활용**: 변수, 믹스인 등
3. **컴포넌트 단위 관리**: 스타일과 컴포넌트를 함께 관리
4. **타입 안전성**: TypeScript와 완벽 호환

### 왜 Fixed Position인가?

```scss
.container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}
```

- 스크롤 위치와 무관하게 항상 화면 전체를 덮음
- 페이지 어디서든 호출 가능
- 최상위 레이어로 모든 요소 위에 표시

### 접근성 개선

```tsx
<div role="status" aria-live="polite">
  <span className="sr-only">{text}</span>
</div>
```

- `role="status"`: 로딩 상태를 의미론적으로 표현
- `aria-live="polite"`: 스크린 리더가 적절한 시점에 알림
- `sr-only`: 화면에는 안 보이지만 스크린 리더는 읽음

### 애니메이션 감소 대응

```scss
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
    border-top-color: var(--color-primary);
    border-right-color: var(--color-primary);
  }
}
```

- 어지러움을 느끼는 사용자를 위한 배려
- WCAG 2.1 접근성 가이드라인 준수
- 애니메이션 대신 정적인 상태 표시

## 파일 구조

```
src/components/ui/full-screen-loading/
├── index.tsx                          # 컴포넌트 로직
├── full-screen-loading.module.scss    # SCSS Module 스타일
└── README.md                          # 문서
```

## 관련 파일

- `src/app/globals.scss` - CSS 변수 정의
- `src/components/providers/auth-guard.tsx` - 사용 예시

## 왜 이 컴포넌트가 필요한가?

1. **일관된 UX**: 모든 로딩 상태에서 동일한 UI 제공
2. **재사용성**: 한 번 만들면 어디서든 사용 가능
3. **접근성**: 모든 사용자를 고려한 설계
4. **유지보수성**: 스타일 변경 시 한 곳만 수정
5. **성능**: useMemo 등 최적화 적용 가능

## 추후 확장 가능성

- 로딩 프로그레스 바 추가
- 커스텀 스피너 애니메이션
- 로딩 메시지 다국어 지원
- 타임아웃 후 에러 표시
