# SCSS 사용 가이드

## 📦 설치 완료

```json
{
  "devDependencies": {
    "sass": "^1.97.2"
  }
}
```

## 🎨 SCSS + Tailwind CSS 전략

### 언제 무엇을 사용할까?

| 상황 | 사용 기술 | 이유 |
|------|---------|-----|
| **간단한 유틸리티** | Tailwind | 빠르고 직관적 |
| **복잡한 애니메이션** | SCSS | 키프레임, 믹스인 활용 |
| **컴포넌트별 고유 스타일** | SCSS Module | 스코프 격리 |
| **반복되는 패턴** | SCSS 변수/믹스인 | 재사용성 |
| **빠른 프로토타이핑** | Tailwind | 클래스만으로 완성 |

---

## 🗂️ 파일 구조

```
src/
├── app/
│   └── globals.scss          # 전역 SCSS (변수, 믹스인, Tailwind)
│
└── presentation/
    └── components/
        └── ui/
            ├── card.module.scss  # SCSS Module (컴포넌트별)
            └── card.tsx
```

---

## 📝 globals.scss (전역 스타일)

### 구조

```scss
// 1. Tailwind import (CSS @import로 처리되도록 url() 사용)
@import url('tailwindcss');

// 2. SCSS 변수 정의
$color-primary: #3b82f6;
$spacing-md: 1rem;

// 3. SCSS 믹스인 정의
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// 4. Tailwind 테마 커스터마이징
@theme {
  --color-primary: #{$color-primary};
}

// 5. 전역 스타일
@layer base {
  body {
    font-family: Arial, sans-serif;
  }
}
```

### 제공되는 SCSS 변수

#### 색상
```scss
$color-primary: #3b82f6;      // 파란색
$color-secondary: #8b5cf6;    // 보라색
$color-success: #10b981;      // 초록색
$color-warning: #f59e0b;      // 주황색
$color-danger: #ef4444;       // 빨간색
```

#### 간격
```scss
$spacing-xs: 0.25rem;  // 4px
$spacing-sm: 0.5rem;   // 8px
$spacing-md: 1rem;     // 16px
$spacing-lg: 1.5rem;   // 24px
$spacing-xl: 2rem;     // 32px
```

#### 브레이크포인트
```scss
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
```

#### 전환 효과
```scss
$transition-fast: 150ms ease-in-out;
$transition-base: 300ms ease-in-out;
$transition-slow: 500ms ease-in-out;
```

### 제공되는 믹스인

#### 1. 반응형 믹스인
```scss
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'sm' {
    @media (min-width: $breakpoint-sm) {
      @content;
    }
  }
  // md, lg, xl...
}
```

**사용 예시:**
```scss
.container {
  padding: 1rem;

  @include respond-to('md') {
    padding: 2rem;
  }

  @include respond-to('lg') {
    padding: 3rem;
  }
}
```

#### 2. Flexbox 센터 정렬
```scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

**사용 예시:**
```scss
.modal {
  @include flex-center;
  min-height: 100vh;
}
```

#### 3. 말줄임 (Ellipsis)
```scss
@mixin text-ellipsis($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
```

**사용 예시:**
```scss
// 한 줄 말줄임
.title {
  @include text-ellipsis(1);
}

// 여러 줄 말줄임
.description {
  @include text-ellipsis(3);
}
```

#### 4. 그림자
```scss
@mixin shadow($level: 'md') {
  @if $level == 'sm' {
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  } @else if $level == 'md' {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  } @else if $level == 'lg' {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  }
}
```

**사용 예시:**
```scss
.card {
  @include shadow('md');

  &:hover {
    @include shadow('lg');
  }
}
```

---

## 🎯 SCSS Module 사용법

### 1. 파일 생성

**파일명:** `*.module.scss` (반드시 `.module.scss` 확장자)

```scss
// button.module.scss
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;

  &:hover {
    opacity: 0.8;
  }
}

.primary {
  background: #3b82f6;
  color: white;
}
```

### 2. TypeScript/React에서 사용

```tsx
import styles from './button.module.scss';

function Button() {
  return (
    <button className={styles.button}>
      Click me
    </button>
  );
}
```

### 3. 여러 클래스 조합

```tsx
import { cn } from '@/shared/utils';
import styles from './button.module.scss';

function Button({ variant }) {
  return (
    <button className={cn(
      styles.button,
      variant === 'primary' && styles.primary
    )}>
      Click me
    </button>
  );
}
```

### 4. Tailwind와 함께 사용

```tsx
<button className={cn(
  styles.button,           // SCSS Module
  'w-full max-w-xs'       // Tailwind
)}>
  Hybrid Button
</button>
```

---

## 💡 실전 예시

### 예시 1: Card 컴포넌트

**card.module.scss:**
```scss
@import '@/app/globals.scss';

.card {
  background: white;
  border-radius: 0.5rem;
  padding: $spacing-lg;
  @include shadow('md');
  transition: all $transition-base;

  &:hover {
    transform: translateY(-2px);
    @include shadow('lg');
  }

  @include respond-to('md') {
    padding: $spacing-xl;
  }
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  @include text-ellipsis(1);
}

.primary {
  background: linear-gradient(135deg, $color-primary, $color-secondary);
  color: white;
}
```

**card.tsx:**
```tsx
import styles from './card.module.scss';

export const Card = ({ title, variant, children }) => {
  return (
    <div className={cn(
      styles.card,
      variant === 'primary' && styles.primary
    )}>
      <h3 className={styles.title}>{title}</h3>
      <div>{children}</div>
    </div>
  );
};
```

### 예시 2: 애니메이션

**animation.module.scss:**
```scss
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

### 예시 3: 중첩 (Nesting)

**nav.module.scss:**
```scss
.nav {
  display: flex;
  gap: 1rem;

  .item {
    padding: 0.5rem 1rem;
    color: gray;
    cursor: pointer;

    &:hover {
      color: black;
    }

    &.active {
      color: blue;
      font-weight: bold;
    }
  }
}
```

---

## 🔧 Best Practices

### 1. globals.scss는 변수/믹스인만

❌ **나쁜 예:**
```scss
// globals.scss
.button {
  padding: 1rem;
}
```

✅ **좋은 예:**
```scss
// globals.scss
$button-padding: 1rem;

// button.module.scss
@import '@/app/globals.scss';

.button {
  padding: $button-padding;
}
```

### 2. SCSS Module은 컴포넌트별로

✅ **좋은 구조:**
```
components/
├── button/
│   ├── button.tsx
│   └── button.module.scss
├── card/
│   ├── card.tsx
│   └── card.module.scss
```

### 3. Tailwind 우선, SCSS는 보조

```tsx
// ✅ 좋은 예: 간단한 건 Tailwind
<div className="flex items-center gap-4">

// ✅ 좋은 예: 복잡한 건 SCSS Module
<div className={styles.complexAnimation}>
```

### 4. 변수는 재사용

```scss
// ❌ 하드코딩
.button {
  padding: 16px;
}

// ✅ 변수 사용
.button {
  padding: $spacing-md;
}
```

---

## 📊 Tailwind vs SCSS 비교

| 기능 | Tailwind | SCSS |
|------|---------|------|
| **유틸리티 클래스** | ⭐⭐⭐⭐⭐ | ⭐ |
| **커스텀 애니메이션** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **변수 관리** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **중첩/믹스인** | ❌ | ⭐⭐⭐⭐⭐ |
| **빠른 프로토타이핑** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **스코프 격리** | ❌ | ⭐⭐⭐⭐⭐ (Module) |
| **번들 사이즈** | 작음 | 중간 |
| **학습 곡선** | 낮음 | 중간 |

---

## 🚀 실전 워크플로우

### 1. 새 컴포넌트 만들기

```bash
# 1. 폴더 생성
mkdir src/presentation/components/ui/my-component

# 2. 파일 생성
touch src/presentation/components/ui/my-component/my-component.tsx
touch src/presentation/components/ui/my-component/my-component.module.scss
```

### 2. SCSS 작성

```scss
// my-component.module.scss
@import '@/app/globals.scss';

.container {
  @include flex-center;
  padding: $spacing-lg;

  @include respond-to('md') {
    padding: $spacing-xl;
  }
}
```

### 3. 컴포넌트 작성

```tsx
// my-component.tsx
import styles from './my-component.module.scss';

export const MyComponent = () => {
  return (
    <div className={cn(
      styles.container,
      'w-full max-w-md' // Tailwind 추가
    )}>
      Content
    </div>
  );
};
```

---

## 🎓 학습 리소스

### SCSS 공식 문서
- [Sass Basics](https://sass-lang.com/guide)
- [Sass Functions](https://sass-lang.com/documentation/modules)

### CSS Modules
- [Next.js CSS Modules](https://nextjs.org/docs/app/building-your-application/styling/css-modules)

---

## ✅ 체크리스트

- [x] Sass 설치 완료
- [x] globals.scss 생성 (변수, 믹스인)
- [x] SCSS Module 예시 (card.module.scss)
- [x] Card 컴포넌트 구현
- [x] Tailwind와 SCSS 통합

---

## 🎉 완료!

이제 **Tailwind + SCSS**의 강력한 조합을 사용할 수 있습니다!

- **Tailwind:** 빠른 유틸리티 클래스
- **SCSS 변수:** 일관된 디자인 토큰
- **SCSS 믹스인:** 재사용 가능한 패턴
- **SCSS Module:** 스코프 격리

**최고의 개발 경험을 즐기세요!** 🚀
