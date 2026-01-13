import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Custom rules
  {
    rules: {
      /**
       * any 타입 허용
       *
       * 왜 허용하는가?
       * - 외부 라이브러리 타입이 불완전한 경우
       * - 점진적 타입 마이그레이션
       * - 동적 데이터 처리 (API 응답 등)
       *
       * 주의사항:
       * - 가능한 한 구체적인 타입 사용 권장
       * - any 사용 시 주석으로 이유 명시
       */
      "@typescript-eslint/no-explicit-any": "off",

      /**
       * unused variables 경고만 표시
       *
       * 왜 경고로 설정하는가?
       * - 개발 중 임시로 사용하지 않는 변수가 있을 수 있음
       * - 에러보다는 경고로 표시하여 유연성 확보
       */
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_", // _로 시작하는 변수는 무시
          varsIgnorePattern: "^_",
        },
      ],

      /**
       * React Compiler의 manual memoization 보존 룰을 경고로 변경
       *
       * 왜 경고로 설정하는가?
       * - useCallback, useMemo 등 수동 메모이제이션과 React Compiler가 충돌할 수 있음
       * - 개발 중에는 경고로 표시하고 점진적으로 개선
       * - React Compiler가 자동 최적화를 제공하므로 수동 메모이제이션 불필요할 수 있음
       */
      "react-hooks/preserve-manual-memoization": "warn",

      /**
       * img 태그 사용 경고를 off로 설정
       *
       * 왜 허용하는가?
       * - 외부 이미지 URL 사용 시 next/image 설정이 복잡할 수 있음
       * - 특정 상황에서는 img 태그가 더 적합할 수 있음
       *
       * 권장사항:
       * - 가능하면 next/image 사용
       * - 외부 이미지나 특수한 경우에만 img 태그 사용
       */
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;
