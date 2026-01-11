/**
 * 타입 배럴 파일 (Barrel Export)
 *
 * 왜 이렇게 구현했는가?
 * - 한 곳에서 모든 타입을 import할 수 있어 편리
 * - 파일 구조 변경 시 import 경로 수정 최소화
 * - 일관된 import 패턴 유지
 *
 * 사용 예시:
 * import { ApiResponse, PaginationParams } from '@/shared/types';
 */

export * from './common.types';
