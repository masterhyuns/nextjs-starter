/**
 * 공통 타입 정의
 *
 * 왜 이렇게 구현했는가?
 * - 애플리케이션 전역에서 사용되는 타입을 중앙 집중식으로 관리
 * - 타입 재사용성 증대 및 일관성 유지
 * - 순환 참조(circular dependency) 방지
 */

/**
 * API 응답 기본 구조
 *
 * 왜 제네릭을 사용하는가?
 * - 다양한 API 응답 데이터 타입을 재사용 가능하게 만들기 위함
 * - 타입 안정성을 유지하면서 유연한 API 응답 처리 가능
 *
 * @template T - 실제 응답 데이터의 타입
 */
export type ApiResponse<T> = {
  /** 요청 성공 여부 */
  success: boolean;
  /** 응답 데이터 (성공 시에만 존재) */
  data?: T;
  /** 에러 메시지 (실패 시에만 존재) */
  error?: string;
  /** HTTP 상태 코드 */
  statusCode: number;
  /** 서버 응답 시간 (디버깅용) */
  timestamp: string;
};

/**
 * 페이지네이션 파라미터
 */
export type PaginationParams = {
  /** 현재 페이지 번호 (1부터 시작) */
  page: number;
  /** 페이지당 아이템 개수 */
  limit: number;
  /** 정렬 기준 필드명 (선택) */
  sortBy?: string;
  /** 정렬 방향 */
  sortOrder?: 'asc' | 'desc';
};

/**
 * 페이지네이션 응답 메타데이터
 */
export type PaginationMeta = {
  /** 현재 페이지 */
  currentPage: number;
  /** 페이지당 아이템 수 */
  itemsPerPage: number;
  /** 전체 아이템 수 */
  totalItems: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 다음 페이지 존재 여부 */
  hasNextPage: boolean;
  /** 이전 페이지 존재 여부 */
  hasPreviousPage: boolean;
};

/**
 * 페이지네이션이 적용된 API 응답
 */
export type PaginatedResponse<T> = {
  /** 데이터 배열 */
  items: T[];
  /** 페이지네이션 메타 정보 */
  meta: PaginationMeta;
};

/**
 * 에러 타입 정의
 *
 * 왜 enum 대신 union type을 사용하는가?
 * - Tree-shaking에 유리
 * - 타입스크립트에서 더 나은 타입 추론 제공
 * - 런타임 오버헤드 없음
 */
export type ErrorType =
  | 'VALIDATION_ERROR'      // 입력값 유효성 검증 실패
  | 'AUTHENTICATION_ERROR'  // 인증 실패 (로그인 필요)
  | 'AUTHORIZATION_ERROR'   // 권한 부족
  | 'NOT_FOUND_ERROR'       // 리소스를 찾을 수 없음
  | 'NETWORK_ERROR'         // 네트워크 연결 실패
  | 'SERVER_ERROR'          // 서버 내부 오류
  | 'UNKNOWN_ERROR';        // 알 수 없는 오류

/**
 * 애플리케이션 에러 객체
 */
export type AppError = {
  /** 에러 타입 */
  type: ErrorType;
  /** 사용자에게 보여줄 메시지 */
  message: string;
  /** HTTP 상태 코드 */
  statusCode?: number;
  /** 개발자용 상세 정보 */
  details?: unknown;
  /** 에러 발생 시간 */
  timestamp: string;
};

/**
 * 비동기 작업 상태
 *
 * 왜 필요한가?
 * - API 호출 등 비동기 작업의 현재 상태를 UI에 반영하기 위함
 * - 로딩 스피너, 에러 메시지 등을 조건부로 렌더링
 */
export type AsyncState = 'idle' | 'loading' | 'success' | 'error';

/**
 * ID 타입 정의
 *
 * 왜 string과 number를 모두 허용하는가?
 * - UUID, MongoDB ObjectId 등 다양한 ID 형식 지원
 * - API 백엔드 구현 방식에 따라 유연하게 대응
 */
export type ID = string | number;

/**
 * 타임스탬프 필드
 *
 * 왜 별도로 정의하는가?
 * - 모든 엔티티에 공통으로 필요한 필드
 * - DRY(Don't Repeat Yourself) 원칙 준수
 * - 타입 재사용성 향상
 */
export type Timestamps = {
  /** 생성 일시 (ISO 8601 형식) */
  createdAt: string;
  /** 수정 일시 (ISO 8601 형식) */
  updatedAt: string;
};

/**
 * 선택적 타임스탬프 필드
 */
export type OptionalTimestamps = {
  /** 삭제 일시 (Soft Delete) */
  deletedAt?: string;
};

/**
 * 정렬 방향
 */
export type SortOrder = 'asc' | 'desc';

/**
 * 필터 연산자
 */
export type FilterOperator =
  | 'equals'          // 같음
  | 'notEquals'       // 같지 않음
  | 'contains'        // 포함
  | 'startsWith'      // ~로 시작
  | 'endsWith'        // ~로 끝남
  | 'greaterThan'     // 크다
  | 'lessThan'        // 작다
  | 'greaterOrEqual'  // 크거나 같다
  | 'lessOrEqual'     // 작거나 같다
  | 'in'              // 배열에 포함
  | 'notIn';          // 배열에 포함되지 않음

/**
 * 범용 선택 옵션 타입
 */
export type SelectOption<T = string> = {
  /** 화면에 표시될 레이블 */
  label: string;
  /** 실제 값 */
  value: T;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 추가 메타데이터 */
  metadata?: Record<string, unknown>;
};

/**
 * 폼 필드 상태
 */
export type FieldState = {
  /** 필드 값 */
  value: unknown;
  /** 사용자가 필드를 터치했는지 여부 */
  touched: boolean;
  /** 유효성 검증 결과 */
  isValid: boolean;
  /** 에러 메시지 */
  error?: string;
};

/**
 * 환경 변수 타입 정의
 */
export type EnvironmentVariables = {
  /** API 기본 URL */
  NEXT_PUBLIC_API_BASE_URL: string;
  /** 애플리케이션 환경 */
  NODE_ENV: 'development' | 'production' | 'test';
  /** API 타임아웃 (ms) */
  NEXT_PUBLIC_API_TIMEOUT?: string;
};
