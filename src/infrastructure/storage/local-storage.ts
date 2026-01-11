/**
 * Local Storage 유틸리티
 *
 * 왜 이렇게 구현했는가?
 * - localStorage 직접 사용 시 발생하는 문제들을 해결
 * - 타입 안전성 확보
 * - SSR 환경 (서버 사이드)에서 에러 방지
 * - JSON 직렬화/역직렬화 자동 처리
 * - 만료 시간 관리
 */

/**
 * Storage 아이템 인터페이스
 *
 * 왜 value만 저장하지 않는가?
 * - 만료 시간 관리 기능 추가
 * - 저장 시간 추적
 * - 버전 관리 가능
 */
interface StorageItem<T> {
  /** 실제 저장할 값 */
  value: T;
  /** 저장 시간 (타임스탬프) */
  createdAt: number;
  /** 만료 시간 (타임스탬프, 선택적) */
  expiresAt?: number;
}

/**
 * Local Storage 클래스
 *
 * 왜 클래스로 구현하는가?
 * - 메서드 체이닝 가능
 * - 상태 캡슐화
 * - 확장 가능한 구조
 */
export class LocalStorage {
  /**
   * 값 저장
   *
   * 왜 제네릭을 사용하는가?
   * - 타입 안전성 확보
   * - IDE 자동완성 지원
   * - 런타임 타입 체크는 불가능하지만 개발 시 오류 방지
   *
   * @param key - 저장할 키
   * @param value - 저장할 값 (객체, 배열, 원시값 모두 가능)
   * @param expiresIn - 만료 시간 (밀리초, 선택적)
   * @returns 성공 여부
   */
  static setItem = <T>(key: string, value: T, expiresIn?: number): boolean => {
    // SSR 환경 체크
    if (typeof window === 'undefined') {
      console.warn('[LocalStorage] Cannot use localStorage in SSR environment');
      return false;
    }

    try {
      const item: StorageItem<T> = {
        value,
        createdAt: Date.now(),
        expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
      };

      // JSON 직렬화 및 저장
      const serialized = JSON.stringify(item);
      localStorage.setItem(key, serialized);

      return true;
    } catch (error) {
      console.error('[LocalStorage] Failed to set item:', error);
      return false;
    }
  };

  /**
   * 값 가져오기
   *
   * @param key - 가져올 키
   * @returns 저장된 값 또는 null
   */
  static getItem = <T>(key: string): T | null => {
    // SSR 환경 체크
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const serialized = localStorage.getItem(key);

      // 값이 없는 경우
      if (!serialized) {
        return null;
      }

      // JSON 파싱
      const item: StorageItem<T> = JSON.parse(serialized);

      // 만료 시간 체크
      if (item.expiresAt && Date.now() > item.expiresAt) {
        // 만료된 아이템 삭제
        this.removeItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('[LocalStorage] Failed to get item:', error);
      return null;
    }
  };

  /**
   * 값 삭제
   *
   * @param key - 삭제할 키
   * @returns 성공 여부
   */
  static removeItem = (key: string): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('[LocalStorage] Failed to remove item:', error);
      return false;
    }
  };

  /**
   * 모든 값 삭제
   *
   * 왜 필요한가?
   * - 로그아웃 시 모든 데이터 정리
   * - 테스트 환경 초기화
   *
   * @returns 성공 여부
   */
  static clear = (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('[LocalStorage] Failed to clear:', error);
      return false;
    }
  };

  /**
   * 키 존재 여부 확인
   *
   * @param key - 확인할 키
   * @returns 존재 여부
   */
  static hasItem = (key: string): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    return localStorage.getItem(key) !== null;
  };

  /**
   * 모든 키 가져오기
   *
   * @returns 저장된 모든 키 배열
   */
  static keys = (): string[] => {
    if (typeof window === 'undefined') {
      return [];
    }

    return Object.keys(localStorage);
  };

  /**
   * 저장된 아이템 수 가져오기
   *
   * @returns 아이템 수
   */
  static getLength = (): number => {
    if (typeof window === 'undefined') {
      return 0;
    }

    return localStorage.length;
  };

  /**
   * 만료된 아이템 모두 정리
   *
   * 왜 필요한가?
   * - localStorage 용량 관리
   * - 주기적으로 실행하여 불필요한 데이터 제거
   *
   * @returns 삭제된 아이템 수
   */
  static cleanExpired = (): number => {
    if (typeof window === 'undefined') {
      return 0;
    }

    let count = 0;
    const keys = this.keys();

    keys.forEach((key) => {
      try {
        const serialized = localStorage.getItem(key);
        if (!serialized) return;

        const item: StorageItem<unknown> = JSON.parse(serialized);

        // 만료된 아이템 삭제
        if (item.expiresAt && Date.now() > item.expiresAt) {
          this.removeItem(key);
          count++;
        }
      } catch {
        // 파싱 실패 시 무시
      }
    });

    return count;
  };
}
