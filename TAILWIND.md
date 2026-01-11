# Tailwind CSS 설정 가이드

## 📦 설치된 패키지

```json
{
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.18",
    "tailwindcss": "^4.1.18",
    "postcss": "^8.5.6",
    "autoprefixer": "^10.4.23"
  }
}
```

## 🎨 Tailwind CSS v4 주요 변경사항

### v3 vs v4 비교

| 항목 | v3 | v4 |
|------|----|----|
| **설정 파일** | `tailwind.config.js` 필요 | CSS 파일에서 직접 설정 |
| **PostCSS 플러그인** | `tailwindcss` | `@tailwindcss/postcss` |
| **Import 방식** | `@tailwind` 디렉티브 | `@import 'tailwindcss'` |
| **커스터마이징** | JS 설정 객체 | `@theme` 디렉티브 |
| **성능** | 빠름 | 더 빠름 (최적화) |

## 📁 설정 파일 구조

```
next-starter/
├── postcss.config.mjs          # PostCSS 설정
├── src/
│   └── app/
│       └── globals.css         # Tailwind 설정 (v4 방식)
└── package.json
```

## ⚙️ 설정 파일 내용

### 1. `postcss.config.mjs`

```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},  // v4 플러그인
    autoprefixer: {},
  },
};

export default config;
```

**왜 `@tailwindcss/postcss`인가?**
- Tailwind CSS v4부터 별도 PostCSS 플러그인으로 분리
- 더 빠른 빌드 성능
- 향상된 개발 경험

### 2. `src/app/globals.css`

```css
/* Tailwind 불러오기 (v4 방식) */
@import 'tailwindcss';

/* 테마 커스터마이징 */
@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;

  --animate-fade-in: fade-in 0.3s ease-in-out;
  --animate-slide-in: slide-in 0.3s ease-in-out;
}

/* 전역 스타일 */
@layer base {
  /* 기본 스타일 */
}

/* 키프레임 */
@keyframes fade-in {
  /* 애니메이션 정의 */
}

/* 커스텀 유틸리티 */
@layer utilities {
  .animate-fade-in {
    animation: fade-in 0.3s ease-in-out;
  }
}
```

## 🎯 주요 기능

### 1. 자동 클래스 감지

Tailwind는 다음 파일에서 클래스를 자동으로 감지합니다:
- `src/app/**/*.{js,ts,jsx,tsx}`
- `src/presentation/**/*.{js,ts,jsx,tsx}`
- `src/components/**/*.{js,ts,jsx,tsx}`

### 2. 다크 모드 지원

```css
@layer base {
  @media (prefers-color-scheme: dark) {
    body {
      background: rgb(17 24 39);
      color: rgb(243 244 246);
    }
  }
}
```

### 3. 커스텀 애니메이션

```css
/* 정의 */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 사용 */
@layer utilities {
  .animate-fade-in {
    animation: fade-in 0.3s ease-in-out;
  }
}
```

**컴포넌트에서 사용:**
```tsx
<div className="animate-fade-in">
  Fade in animation
</div>
```

## 🚀 사용 예시

### 기본 유틸리티 클래스

```tsx
// 레이아웃
<div className="flex items-center justify-center">

// 간격
<div className="p-4 m-2 space-y-4">

// 색상
<div className="bg-blue-500 text-white">

// 반응형
<div className="w-full sm:w-1/2 lg:w-1/3">

// 호버/포커스
<button className="hover:bg-blue-700 focus:ring-2">
```

### 커스텀 컬러 사용

```tsx
// @theme에서 정의한 컬러 사용
<div className="bg-primary text-white">
<button className="bg-secondary">
```

### 다크 모드

```tsx
// 다크 모드 스타일
<div className="bg-white dark:bg-gray-900">
<p className="text-gray-900 dark:text-gray-100">
```

## 🔧 디버깅 팁

### 1. 클래스가 적용 안 될 때

**원인:**
- 파일이 content 경로에 포함되지 않음
- 동적 클래스명 사용 (문자열 결합)

**해결:**
```tsx
// ❌ 잘못된 방법 (동적 생성)
const color = 'blue';
<div className={`bg-${color}-500`}>

// ✅ 올바른 방법 (완전한 클래스명)
<div className="bg-blue-500">
```

### 2. 빌드 에러

**캐시 삭제 후 재빌드:**
```bash
rm -rf .next
pnpm build
```

### 3. 개발 서버 재시작

```bash
# 개발 서버 종료 후
pnpm dev
```

## 📚 추가 리소스

### Tailwind CSS v4 공식 문서
- [Migration Guide](https://tailwindcss.com/docs/v4-migration)
- [Theme Configuration](https://tailwindcss.com/docs/theme)
- [Custom Utilities](https://tailwindcss.com/docs/adding-custom-styles)

### 유용한 플러그인 (선택사항)

```bash
# Forms 스타일링
pnpm add -D @tailwindcss/forms

# Typography
pnpm add -D @tailwindcss/typography

# Aspect Ratio
pnpm add -D @tailwindcss/aspect-ratio
```

**postcss.config.mjs에 추가:**
```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```

## ✅ 체크리스트

- [x] Tailwind CSS v4 설치
- [x] PostCSS 설정 (`@tailwindcss/postcss`)
- [x] globals.css 설정 (`@import 'tailwindcss'`)
- [x] 커스텀 테마 설정 (`@theme`)
- [x] 애니메이션 정의
- [x] 다크 모드 지원
- [x] 빌드 테스트 통과

## 🎉 완료!

Tailwind CSS v4가 성공적으로 설정되었습니다. 이제 모든 컴포넌트에서 Tailwind 유틸리티 클래스를 사용할 수 있습니다.

**테스트 방법:**
```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build
```

---

**질문이나 문제가 있으신가요?**
- [Tailwind CSS Discord](https://tailwindcss.com/discord)
- [GitHub Issues](https://github.com/tailwindlabs/tailwindcss/issues)
