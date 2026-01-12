/**
 * 애플리케이션 전역 상수 정의
 *
 * 왜 이렇게 구현했는가?
 * - 매직 넘버/매직 스트링 제거
 * - 한 곳에서 설정 값 관리
 * - 타입 안전성 확보
 * - 유지보수성 향상
 */

/**
 * API 관련 상수
 */
export const API_CONFIG = {
  /** API 기본 URL */
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  /** API 요청 타임아웃 (밀리초) */
  TIMEOUT: 30000,
  /** 재시도 횟수 */
  RETRY_COUNT: 3,
  /** 재시도 딜레이 (밀리초) */
  RETRY_DELAY: 1000,
} as const;

/**
 * 로컬 스토리지 키
 *
 * 왜 인증 관련 키가 없는가?
 * - 쿠키 기반 인증 사용 (httpOnly 쿠키)
 * - localStorage는 XSS 공격에 취약하므로 토큰 저장 금지
 * - 테마, 언어 등 비보안 설정만 localStorage 사용
 */
export const STORAGE_KEYS = {
  /** 테마 설정 */
  THEME: 'theme',
  /** 언어 설정 */
  LANGUAGE: 'language',
} as const;

/**
 * 쿠키 키
 */
export const COOKIE_KEYS = {
  /** 세션 ID */
  SESSION_ID: 'session_id',
  /** 인증 토큰 */
  AUTH_TOKEN: 'auth_token',
} as const;

/**
 * 라우트 경로
 *
 * 왜 필요한가?
 * - 하드코딩된 경로 제거
 * - 경로 변경 시 한 곳만 수정
 * - IDE 자동완성 지원
 */
export const ROUTES = {
  /** 홈 */
  HOME: '/',
  /** 로그인 */
  LOGIN: '/login',
  /** 회원가입 */
  SIGNUP: '/signup',
  /** 대시보드 */
  DASHBOARD: '/dashboard',
  /** 프로필 */
  PROFILE: '/profile',
  /** 설정 */
  SETTINGS: '/settings',
  /** 404 페이지 */
  NOT_FOUND: '/404',
} as const;

/**
 * 공개 라우트 (인증 불필요)
 */
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
] as const;

/**
 * 인증 필수 라우트
 */
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PROFILE,
  ROUTES.SETTINGS,
] as const;

/**
 * 페이지네이션 기본 설정
 */
export const PAGINATION = {
  /** 기본 페이지 번호 */
  DEFAULT_PAGE: 1,
  /** 기본 페이지 크기 */
  DEFAULT_PAGE_SIZE: 10,
  /** 페이지 크기 옵션 */
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
} as const;

/**
 * 폼 유효성 검증 메시지
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: '필수 입력 항목입니다',
  EMAIL_INVALID: '올바른 이메일 형식이 아닙니다',
  PASSWORD_MIN_LENGTH: '비밀번호는 최소 8자 이상이어야 합니다',
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다',
  PHONE_INVALID: '올바른 전화번호 형식이 아닙니다',
  NUMBER_INVALID: '숫자만 입력 가능합니다',
  URL_INVALID: '올바른 URL 형식이 아닙니다',
} as const;

/**
 * HTTP 상태 코드
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * 애플리케이션 메타데이터
 */
export const APP_METADATA = {
  /** 앱 이름 */
  NAME: 'Next Clean Starter',
  /** 앱 설명 */
  DESCRIPTION: '프론트엔드 전용 아키텍처 Next.js 스타터',
  /** 버전 */
  VERSION: '1.0.0',
} as const;

/**
 * 타임아웃 설정 (밀리초)
 */
export const TIMEOUTS = {
  /** 짧은 딜레이 */
  SHORT: 300,
  /** 중간 딜레이 */
  MEDIUM: 500,
  /** 긴 딜레이 */
  LONG: 1000,
  /** 디바운스 기본값 */
  DEBOUNCE: 300,
  /** 쓰로틀 기본값 */
  THROTTLE: 1000,
} as const;

/**
 * 파일 업로드 설정
 */
export const FILE_UPLOAD = {
  /** 최대 파일 크기 (바이트) - 5MB */
  MAX_SIZE: 5 * 1024 * 1024,
  /** 허용 파일 확장자 */
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'] as const,
  /** 이미지 확장자 */
  IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif'] as const,
} as const;
