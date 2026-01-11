/**
 * 회원가입 Use Case
 *
 * 책임:
 * 1. 회원가입 입력값 유효성 검증
 * 2. 비밀번호 강도 검증
 * 3. 이메일 중복 체크
 * 4. 사용자 생성
 */

import type { IAuthRepository } from '@/domain/repositories/auth.repository.interface';
import type { CreateUserParams, UserEntity } from '@/domain/entities/user.entity';
import { UserDomain } from '@/domain/entities/user.entity';
import type { ApiResponse, AppError } from '@/shared/types';

/**
 * 회원가입 Use Case 파라미터
 */
export interface SignupUseCaseParams extends CreateUserParams {
  /** 비밀번호 확인 */
  passwordConfirm: string;
}

/**
 * 회원가입 Use Case
 */
export class SignupUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * Use Case 실행
   *
   * 비즈니스 플로우:
   * 1. 입력값 유효성 검증
   * 2. 이메일 형식 검증
   * 3. 비밀번호 강도 검증
   * 4. 비밀번호 일치 확인
   * 5. Repository를 통한 회원가입 시도
   * 6. 성공 시 사용자 정보 반환
   *
   * @param params - 회원가입 파라미터
   * @returns 생성된 사용자 정보
   */
  execute = async (params: SignupUseCaseParams): Promise<ApiResponse<UserEntity>> => {
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
      // 2. Repository를 통한 회원가입 시도
      const result = await this.authRepository.signup({
        email: params.email.toLowerCase().trim(),
        password: params.password,
        name: params.name.trim(),
        role: params.role,
      });

      // 3. 성공 시 추가 처리
      if (result.success && result.data) {
        this.onSignupSuccess(result.data);
      }

      return result;
    } catch (error) {
      return this.handleError(error);
    }
  };

  /**
   * 입력값 유효성 검증
   *
   * @param params - 회원가입 파라미터
   * @returns 에러 객체 또는 null
   */
  private validate = (params: SignupUseCaseParams): AppError | null => {
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

    // 이름 필수 체크
    if (!params.name || params.name.trim() === '') {
      return {
        type: 'VALIDATION_ERROR',
        message: '이름을 입력해주세요',
        statusCode: 400,
        timestamp: new Date().toISOString(),
      };
    }

    // 이름 유효성 검증
    if (!UserDomain.isValidName(params.name)) {
      return {
        type: 'VALIDATION_ERROR',
        message: '이름은 2자 이상 50자 이하로 입력해주세요',
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

    // 비밀번호 강도 검증
    if (!UserDomain.isValidPassword(params.password)) {
      return {
        type: 'VALIDATION_ERROR',
        message: '비밀번호는 8자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다',
        statusCode: 400,
        timestamp: new Date().toISOString(),
      };
    }

    // 비밀번호 확인 체크
    if (params.password !== params.passwordConfirm) {
      return {
        type: 'VALIDATION_ERROR',
        message: '비밀번호가 일치하지 않습니다',
        statusCode: 400,
        timestamp: new Date().toISOString(),
      };
    }

    return null;
  };

  /**
   * 회원가입 성공 시 추가 처리
   *
   * @param user - 생성된 사용자
   */
  private onSignupSuccess = (user: UserEntity): void => {
    console.log(`[SignupUseCase] User created: ${user.email}`);

    // TODO: 추가 비즈니스 로직
    // - 웰컴 이메일 발송
    // - 분석 이벤트 전송
    // - 초기 설정 데이터 생성
  };

  /**
   * 에러 처리
   *
   * @param error - 발생한 에러
   * @returns API 응답 형식의 에러
   */
  private handleError = (error: unknown): ApiResponse<UserEntity> => {
    console.error('[SignupUseCase] Error:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : '회원가입에 실패했습니다',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    };
  };
}
