/**
 * 전체 화면 로딩 컴포넌트
 *
 * 왜 필요한가?
 * - 위치에 상관없이 화면 전체를 덮는 로딩 표시
 * - 인증 체크, 데이터 로딩 등 전역 로딩 상태에 사용
 * - 일관된 로딩 UX 제공
 *
 * 사용 예시:
 * ```tsx
 * <FullScreenLoading />
 * <FullScreenLoading text="데이터 로딩 중..." />
 * <FullScreenLoading size="large" text="처리 중입니다..." />
 * ```
 */

'use client';

import styles from './full-screen-loading.module.scss';

/**
 * FullScreenLoading Props
 */
export interface FullScreenLoadingProps {
  /** 로딩 텍스트 (선택사항) */
  text?: string;
  /** 스피너 크기 */
  size?: 'small' | 'medium' | 'large';
  /** 커스텀 클래스명 (선택사항) */
  className?: string;
}

/**
 * 전체 화면 로딩 컴포넌트
 *
 * 특징:
 * - fixed position으로 스크롤 위치 무관하게 화면 전체 덮음
 * - z-index: 9999로 최상위 레이어 보장
 * - 다크모드 자동 지원
 * - 접근성: prefers-reduced-motion 대응
 * - 3가지 크기 옵션 (small, medium, large)
 *
 * @param props - FullScreenLoadingProps
 * @returns JSX.Element
 */
export const FullScreenLoading = ({
  text = '로딩 중...',
  size = 'medium',
  className,
}: FullScreenLoadingProps) => {
  /**
   * 크기별 스타일 클래스 매핑
   *
   * 왜 객체로 관리하는가?
   * - 타입 안전성 확보
   * - 크기 옵션 추가 시 한 곳만 수정
   * - IDE 자동완성 지원
   */
  const spinnerSizeClass = {
    small: styles.spinnerSmall,
    medium: styles.spinner,
    large: styles.spinnerLarge,
  }[size];

  const textSizeClass = {
    small: styles.textSmall,
    medium: styles.text,
    large: styles.textLarge,
  }[size];

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.content}>
        {/* 스피너 */}
        <div className={spinnerSizeClass} role="status" aria-live="polite">
          <span className="sr-only">{text}</span>
        </div>

        {/* 로딩 텍스트 */}
        {text && <p className={textSizeClass}>{text}</p>}
      </div>
    </div>
  );
};

/**
 * 왜 role="status"와 aria-live="polite"인가?
 * - 스크린 리더 사용자에게 로딩 상태 알림
 * - polite: 현재 읽고 있는 내용을 방해하지 않고 알림
 * - 접근성(a11y) 개선
 *
 * 왜 sr-only 클래스가 필요한가?
 * - 스피너는 시각적 요소이므로 스크린 리더에 텍스트 제공
 * - sr-only: 화면에는 안 보이지만 스크린 리더는 읽음
 */

/**
 * Export
 */
export default FullScreenLoading;
