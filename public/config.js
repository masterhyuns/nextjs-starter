/**
 * 런타임 설정 파일
 *
 * 왜 필요한가?
 * - 정적 배포 환경에서 빌드 후 환경변수를 변경할 수 없음
 * - 이 파일을 배포 시점에 수정하여 환경별 설정 주입
 * - 브라우저에서 런타임에 설정을 로드
 *
 * 사용 방법:
 * 1. Docker/K8s 배포 시: ConfigMap이나 Volume으로 이 파일을 덮어씀
 * 2. 정적 호스팅: 배포 전 스크립트로 값 치환
 *
 * 예시 (ConfigMap):
 * ```yaml
 * apiVersion: v1
 * kind: ConfigMap
 * metadata:
 *   name: app-config
 * data:
 *   config.js: |
 *     window.__ENV__ = {
 *       API_BASE_URL: 'https://api.production.com',
 *       SSO_LOGIN_URL: 'https://sso.production.com/login'
 *     };
 * ```
 */

// 개발 환경 기본값
// 배포 시 이 값들이 실제 환경 값으로 치환됨
window.__ENV__ = {
  /** API 기본 URL */
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',

  /** SSO 로그인 페이지 URL */
  SSO_LOGIN_URL: process.env.NEXT_PUBLIC_SSO_LOGIN_URL || 'https://sso.cowexa.com/login',

  /** 환경 이름 (development, staging, production) */
  ENV: process.env.NODE_ENV || 'development',
};
