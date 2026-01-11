/**
 * PostCSS 설정
 *
 * 왜 필요한가?
 * - Tailwind CSS를 처리하기 위한 CSS 후처리기
 * - autoprefixer로 브라우저 호환성 자동 처리
 *
 * Tailwind CSS v4 변경사항:
 * - @tailwindcss/postcss 플러그인 사용 (v3와 다름)
 * - 더 빠른 빌드 성능
 * - 향상된 개발 경험
 *
 * 플러그인:
 * - @tailwindcss/postcss: Tailwind CSS v4 처리
 * - autoprefixer: 벤더 프리픽스 자동 추가 (-webkit-, -moz- 등)
 */

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

export default config;
