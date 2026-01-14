# SCSS 사용 가이드

> Tailwind CSS 제거 후 순수 SCSS 기반 스타일링 시스템

## 📁 디렉토리 구조

```
src/assets/scss/
├── _variables.scss    # SCSS 변수 (색상, 간격, 폰트 등)
├── _mixins.scss       # SCSS 믹스인 (재사용 가능한 스타일 패턴)
├── _base.scss         # 전역 기본 스타일 + CSS 변수 정의
├── _animations.scss   # 키프레임 애니메이션
└── styles.scss        # 메인 export (모든 것을 통합)
```

## 🎯 왜 이렇게 구성했는가?

### 1. **전역 스타일 vs 컴포넌트 스타일 분리**
- **전역 스타일**: `src/assets/scss/styles.scss`에서 통합 관리
- **컴포넌트 스타일**: SCSS Module (`*.module.scss`)로 스코프 격리

### 2. **SCSS 변수 vs CSS 변수**

| 구분 | SCSS 변수 (`$variable`) | CSS 변수 (`--variable`) |
|------|------------------------|------------------------|
| **컴파일** | 컴파일 타임에 고정 | 런타임에 동적 변경 가능 |
| **사용처** | 믹스인, 함수, 계산에 활용 | JavaScript로 제어 가능 |
| **용도** | 디자인 토큰, 재사용 패턴 | 다크모드, 테마 전환 |
| **브라우저** | 컴파일 후 사라짐 | 브라우저에 남아있음 |

---

## 🚀 사용 방법

### 1. 전역 스타일 적용 (layout.tsx)

```typescript
// src/app/layout.tsx
import "@/assets/scss/styles.scss";  // ✅ 한 번만 import
```

**주의**: `globals.scss`는 더 이상 사용하지 않습니다 (Tailwind 제거됨).

---

### 2. SCSS Module에서 변수/믹스인 사용

#### ✅ 올바른 사용법

```scss
// component.module.scss
@use '@/assets/scss/variables' as *;
@use '@/assets/scss/mixins' as *;

.container {
  // SCSS 변수 사용
  color: $color-primary;
  padding: $spacing-md;

  // SCSS 믹스인 사용
  @include flex-center;
  @include shadow('md');

  // 반응형
  @include tablet {
    padding: $spacing-sm;
  }
}
```

#### ❌ 잘못된 사용법

```scss
// ❌ styles.scss를 import하면 전역 스타일이 중복됨
@use '@/assets/scss/styles' as *;  // 절대 금지!

// ❌ 변수만 필요한데 mixins도 함께 import
@use '@/assets/scss/mixins' as *;  // 필요한 것만 import
```

---

### 3. CSS 변수 사용 (모든 곳에서)

#### SCSS Module에서

```scss
// component.module.scss
.button {
  // CSS 변수 사용 (runtime)
  background-color: var(--color-primary);
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
}
```

#### Tailwind 클래스처럼 사용 (inline style)

```tsx
// Component.tsx
<div style={{
  color: 'var(--color-primary)',
  padding: 'var(--spacing-4)'
}}>
  Content
</div>
```

#### JavaScript에서 동적 변경

```typescript
// 다크모드 전환 예시
document.documentElement.style.setProperty('--color-background', '#0a0a0a');
document.documentElement.style.setProperty('--color-text', '#ededed');
```

---

## 📚 주요 변수 및 믹스인

### SCSS 변수 (`_variables.scss`)

#### 색상
```scss
$color-primary: #3b82f6;
$color-secondary: #8b5cf6;
$color-success: #10b981;
$color-danger: #ef4444;

$color-gray-100 ~ $color-gray-900  // 그레이 스케일
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

---

### SCSS 믹스인 (`_mixins.scss`)

#### 1. 반응형

```scss
// Desktop First (min-width)
@include respond-to('md') {
  font-size: 18px;
}

// Mobile First (max-width)
@include mobile {
  display: block;
}

@include tablet {
  padding: 16px;
}

@include desktop {
  max-width: 1280px;
}
```

#### 2. Flexbox

```scss
.centered {
  @include flex-center;  // 가로+세로 중앙
}

.header {
  @include flex-between;  // space-between + align-items: center
}
```

#### 3. 텍스트

```scss
.title {
  @include text-ellipsis(2);  // 2줄 말줄임
}

.description {
  @include font($font-size-sm, $font-weight-medium);
}
```

#### 4. 그림자

```scss
.card {
  @include shadow('md');  // sm | base | md | lg | xl | 2xl
}
```

#### 5. 스크롤바

```scss
.scrollable {
  @include custom-scrollbar(
    $width: 8px,
    $track-color: $color-gray-100,
    $thumb-color: $color-gray-400
  );
}
```

#### 6. 유틸리티

```scss
.sr-only-text {
  @include sr-only;  // 스크린 리더 전용
}

.no-select {
  @include no-select;  // 사용자 선택 방지
}
```

---

## 🎨 실전 예제

### 예제 1: 카드 컴포넌트

```scss
// Card.module.scss
@use '@/assets/scss/variables' as *;
@use '@/assets/scss/mixins' as *;

.card {
  background: var(--color-background);
  border-radius: $radius-lg;
  padding: $spacing-6;

  @include shadow('md');
  @include transition(all);

  &:hover {
    @include shadow('lg');
    transform: translateY(-2px);
  }

  @include mobile {
    padding: $spacing-4;
  }
}

.title {
  color: var(--color-text);
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  margin-bottom: $spacing-4;

  @include text-ellipsis(1);
}

.description {
  color: var(--color-text-secondary);
  font-size: $font-size-base;
  line-height: 1.6;

  @include text-ellipsis(3);
}
```

### 예제 2: 반응형 그리드

```scss
// Grid.module.scss
@use '@/assets/scss/variables' as *;
@use '@/assets/scss/mixins' as *;

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-6;

  @include respond-to('lg') {
    grid-template-columns: repeat(3, 1fr);
  }

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-4;
  }

  @include mobile {
    grid-template-columns: 1fr;
    gap: $spacing-3;
  }
}
```

### 예제 3: 다크모드 지원

```scss
// Theme.module.scss
.container {
  // CSS 변수 사용 (다크모드 자동 대응)
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

// JavaScript에서 다크모드 전환
// document.documentElement.classList.add('dark');
```

---

## ⚠️ 주의사항

### 1. `styles.scss`를 Module에서 import하지 마세요

```scss
// ❌ 절대 금지!
@use '@/assets/scss/styles' as *;

// ✅ 올바른 방법
@use '@/assets/scss/variables' as *;
@use '@/assets/scss/mixins' as *;
```

**이유**: `styles.scss`는 전역 스타일을 포함하므로, Module에서 import하면 스타일이 중복되어 번들 크기가 커집니다.

### 2. 변수와 믹스인은 필요한 것만 import

```scss
// ❌ 믹스인이 필요 없는데 import
@use '@/assets/scss/mixins' as *;

// ✅ 변수만 필요하면 variables만
@use '@/assets/scss/variables' as *;
```

### 3. CSS 변수 vs SCSS 변수 선택 기준

| 상황 | 사용할 변수 |
|------|------------|
| 믹스인 내부에서 계산 | SCSS 변수 `$color-primary` |
| 다크모드/테마 전환 | CSS 변수 `var(--color-primary)` |
| JavaScript에서 제어 | CSS 변수 |
| 빌드 타임 최적화 | SCSS 변수 |

---

## 📖 참고 자료

- **SCSS 변수**: `src/assets/scss/_variables.scss`
- **SCSS 믹스인**: `src/assets/scss/_mixins.scss`
- **전역 스타일**: `src/assets/scss/_base.scss`
- **애니메이션**: `src/assets/scss/_animations.scss`

---

## 🎓 Best Practices

### 1. 컴포넌트마다 SCSS Module 사용

```
src/components/Card/
├── Card.tsx
├── Card.module.scss  ✅
└── index.ts
```

### 2. 네이밍 컨벤션

```scss
// BEM 스타일 권장
.card { }
.card__header { }
.card__title { }
.card--featured { }
```

### 3. 변수 우선 사용

```scss
// ❌ 하드코딩
.button {
  padding: 12px 24px;
  color: #3b82f6;
}

// ✅ 변수 사용
.button {
  padding: $spacing-3 $spacing-6;
  color: $color-primary;
}
```

### 4. 믹스인으로 중복 제거

```scss
// ❌ 중복 코드
.button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

// ✅ 믹스인 사용
.button {
  @include flex-center;
}

.icon {
  @include flex-center;
}
```

---

## 💡 FAQ

### Q1: Tailwind 완전히 제거됐나요?
**A**: 네, `globals.scss`에서 Tailwind import가 제거되었습니다. 모든 스타일은 SCSS로 작성합니다.

### Q2: CSS 변수는 어디서 확인하나요?
**A**: `src/assets/scss/_base.scss`의 `:root` 섹션을 확인하세요.

### Q3: 다크모드는 어떻게 구현하나요?
**A**: CSS 변수를 사용하면 `_base.scss`의 `@media (prefers-color-scheme: dark)` 블록이 자동으로 적용됩니다.

### Q4: 컴포넌트에서 애니메이션 사용하려면?
**A**: `_animations.scss`에 정의된 클래스를 사용하거나, 직접 `@keyframes`를 정의하세요.

```scss
// 기존 애니메이션 사용
.modal {
  animation: fade-in 0.3s ease-in-out;
}

// 또는
.modal {
  composes: animate-fade-in from global;
}
```

---

## 🎉 요약

1. **전역 스타일**: `layout.tsx`에서 `@/assets/scss/styles.scss` import
2. **컴포넌트 스타일**: `*.module.scss`에서 `@use '@/assets/scss/variables'` import
3. **CSS 변수**: 다크모드, 테마 전환에 사용
4. **SCSS 변수**: 믹스인, 계산, 빌드 타임 최적화에 사용
5. **믹스인**: 반복되는 패턴을 재사용

**Happy Styling! 🎨**
