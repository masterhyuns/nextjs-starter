/**
 * 로그인 Use Case
 *
 * 왜 Use Case를 분리하는가?
 * - 단일 책임 원칙 (SRP): 하나의 Use Case는 하나의 비즈니스 기능만 담당
 * - 재사용성: 다양한 UI (웹, 모바일, CLI)에서 동일한 로직 사용 가능
 * - 테스트 용이성: 비즈니스 로직만 격리하여 테스트
 * - 의존성 주입 (DI): Repository를 주입받아 느슨한 결합 유지
 *
 * Use Case의 책임:
 * 1. 입력 데이터 유효성 검증
 * 2. 비즈니스 규칙 적용
 * 3. Repository 호출
 * 4. 결과 처리 및 반환
 */

import type { IAuthRepository, LoginParams, LoginResponse } from '@/domain/repositories/auth.repository.interface';
import { UserDomain } from '@/domain/entities/user.entity';
import type { ApiResponse, AppError } from '@/shared/types';

/**
 * 로그인 Use Case 파라미터
 *
 * 왜 LoginParams를 그대로 사용하지 않는가?
 * - Use Case와 Repository의 결합도 감소
 * - 향후 요구사항 변경 시 유연하게 대응
 */
export interface LoginUseCaseParams extends LoginParams {}

/**
 * 로그인 Use Case 클래스
 *
 * 왜 클래스를 사용하는가?
 * - 의존성 주입 패턴 적용
 * - 상태를 가지지 않는 순수 함수로 구현
 * - OOP와 FP의 장점 결합
 */
export class LoginUseCase {
  /**
   * 생성자
   *
   * 왜 생성자에서 Repository를 주입받는가?
   * - 의존성 역전 원칙 (DIP) 적용
   * - 테스트 시 Mock Repository로 쉽게 교체 가능
   * - 런타임에 구현체 변경 가능
   *
   * @param authRepository - 인증 Repository 인터페이스
   */
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * Use Case 실행
   *
   * 비즈니스 플로우:
   * 1. 입력값 유효성 검증
   * 2. 이메일 형식 검증
   * 3. Repository를 통한 로그인 시도
   * 4. 성공 시 사용자 정보 및 토큰 반환
   * 5. 실패 시 에러 처리
   *
   * @param params - 로그인 파라미터
   * @returns 로그인 결과 (사용자 정보 + 토큰)
   * @throws AppError - 유효성 검증 실패 또는 인증 실패 시
   */
  execute = async (params: LoginUseCaseParams): Promise<ApiResponse<LoginResponse>> => {
    // 1. 입력값 유효성 검증
    const validationError = this.validate(params);
    if (validationError) {
      return {
        success: false,
        error: validationError.message,
        statusCode: validationError.statusCode || 400,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      // 2. Repository를 통한 로그인 시도
      const result = await this.authRepository.login({
        email: params.email.toLowerCase().trim(), // 이메일 정규화
        password: params.password,
        rememberMe: params.rememberMe,
      });

      // 3. 성공 시 결과 반환
      if (result.success && result.data) {
        // 추가 비즈니스 로직 (예: 로그인 기록, 분석 등)
        this.onLoginSuccess(result.data.user);
      }

      return result;
    } catch (error) {
      // 4. 에러 처리
      return this.handleError(error);
    }
  };

  /**
   * 입력값 유효성 검증
   *
   * 왜 여기서 검증하는가?
   * - 도메인 규칙 적용
   * - API 호출 전 불필요한 네트워크 요청 방지
   * - 일관된 에러 처리
   *
   * @param params - 로그인 파라미터
   * @returns 에러 객체 또는 null
   */
  private validate = (params: LoginUseCaseParams): AppError | null => {
    // 이메일 필수 체크
    if (!params.email || params.email.trim() === '') {
      return {
        type: 'VALIDATION_ERROR',
        message: '이메일을 입력해주세요',
        statusCode: 400,
        timestamp: new Date().toISOString(),
      };
    }

    // 이메일 형식 검증
    if (!UserDomain.isValidEmail(params.email)) {
      return {
        type: 'VALIDATION_ERROR',
        message: '올바른 이메일 형식이 아닙니다',
        statusCode: 400,
        timestamp: new Date().toISOString(),
      };
    }

    // 비밀번호 필수 체크
    if (!params.password || params.password.trim() === '') {
      return {
        type: 'VALIDATION_ERROR',
        message: '비밀번호를 입력해주세요',
        statusCode: 400,
        timestamp: new Date().toISOString(),
      };
    }

    return null;
  };

  /**
   * 로그인 성공 시 추가 처리
   *
   * 왜 필요한가?
   * - 로그인 이력 기록
   * - 분석 이벤트 발송
   * - 알림 전송 등
   *
   * @param user - 로그인한 사용자
   */
  private onLoginSuccess = (user: any): void => {
    // 로그인 성공 로그
    console.log(`[LoginUseCase] User logged in: ${user.email}`);

    // TODO: 추가 비즈니스 로직
    // - 로그인 이력 저장
    // - 분석 이벤트 전송
    // - 웰컴 알림 등
  };

  /**
   * 에러 처리
   *
   * @param error - 발생한 에러
   * @returns API 응답 형식의 에러
   */
  private handleError = (error: unknown): ApiResponse<LoginResponse> => {
    console.error('[LoginUseCase] Error:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : '로그인에 실패했습니다',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    };
  };
}
