/**
 * 환경 설정 Context
 *
 * 왜 필요한가?
 * - 정적 배포 환경에서 런타임에 환경변수를 로드하기 위함
 * - public/config.js에서 설정을 읽어서 전역으로 제공
 * - apiClient의 baseURL을 런타임에 설정
 *
 * 설계 원칙:
 * - 앱 최상위에서 한 번만 초기화
 * - apiClient 싱글톤의 baseURL을 주입
 * - 하위 컴포넌트에서 useEnv()로 접근 가능
 */

'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiClient } from '../api-client';

/**
 * 환경 변수 타입
 */
export interface EnvConfig {
  /** API 기본 URL */
  API_BASE_URL: string;
  /** SSO 로그인 페이지 URL */
  SSO_LOGIN_URL: string;
  /** 환경 이름 */
  ENV: string;
}

/**
 * Window 객체에 __ENV__ 추가
 */
declare global {
  interface Window {
    __ENV__?: EnvConfig;
  }
}

/**
 * EnvContext 기본값
 */
const defaultEnv: EnvConfig = {
  API_BASE_URL: 'http://localhost:3001',
  SSO_LOGIN_URL: 'https://sso.cowexa.com/login',
  ENV: 'development',
};

/**
 * EnvContext
 */
const EnvContext = createContext<EnvConfig>(defaultEnv);

/**
 * EnvProvider Props
 */
interface EnvProviderProps {
  children: ReactNode;
}

/**
 * EnvProvider
 *
 * 왜 이렇게 구현했는가?
 * 1. public/config.js를 동적으로 로드 (script 태그 삽입)
 * 2. window.__ENV__에서 설정을 읽음
 * 3. apiClient의 baseURL을 설정
 * 4. Context로 하위 컴포넌트에 제공
 *
 * 주의사항:
 * - 클라이언트 사이드에서만 실행됨 (use client)
 * - 로딩 완료 전까지 기본값 사용
 * - apiClient는 한 번만 초기화됨 (싱글톤)
 *
 * @example
 * // app/layout.tsx
 * <EnvProvider>
 *   <AuthProvider>
 *     {children}
 *   </AuthProvider>
 * </EnvProvider>
 */
export const EnvProvider = ({ children }: EnvProviderProps) => {
  const [env, setEnv] = useState<EnvConfig>(defaultEnv);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    /**
     * public/config.js 로드
     *
     * 왜 동적 로드인가?
     * - Next.js의 정적 빌드에서 public 폴더의 JS를 자동으로 로드하지 않음
     * - 배포 시점에 config.js를 교체할 수 있어야 함
     * - window.__ENV__가 설정되면 즉시 사용
     */
    const loadConfig = () => {
      // 이미 window.__ENV__가 있으면 사용 (script 태그로 먼저 로드된 경우)
      if (window.__ENV__) {
        const loadedEnv = window.__ENV__;
        setEnv(loadedEnv);

        // apiClient의 baseURL 설정
        apiClient.setBaseURL(loadedEnv.API_BASE_URL);

        setIsLoaded(true);
        console.log('[EnvProvider] Config loaded from window.__ENV__:', loadedEnv);
        return;
      }

      // window.__ENV__가 없으면 script 태그로 로드
      const script = document.createElement('script');
      script.src = '/config.js';
      script.async = true;

      script.onload = () => {
        if (window.__ENV__) {
          const loadedEnv = window.__ENV__;
          setEnv(loadedEnv);

          // apiClient의 baseURL 설정
          apiClient.setBaseURL(loadedEnv.API_BASE_URL);

          setIsLoaded(true);
          console.log('[EnvProvider] Config loaded from /config.js:', loadedEnv);
        } else {
          console.warn('[EnvProvider] /config.js loaded but window.__ENV__ is undefined. Using default config.');
          // 기본값으로 apiClient 설정
          apiClient.setBaseURL(defaultEnv.API_BASE_URL);
          setIsLoaded(true);
        }
      };

      script.onerror = () => {
        console.error('[EnvProvider] Failed to load /config.js. Using default config.');
        // 기본값으로 apiClient 설정
        apiClient.setBaseURL(defaultEnv.API_BASE_URL);
        setIsLoaded(true);
      };

      document.head.appendChild(script);

      // cleanup
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    };

    loadConfig();
  }, []);

  // 로딩 중에는 기본값으로 렌더링 (또는 로딩 스피너 표시 가능)
  // apiClient는 이미 기본 BASE_URL로 초기화되어 있으므로 문제없음
  if (!isLoaded) {
    return (
      <EnvContext.Provider value={env}>
        {children}
      </EnvContext.Provider>
    );
  }

  return (
    <EnvContext.Provider value={env}>
      {children}
    </EnvContext.Provider>
  );
};

/**
 * useEnv 훅
 *
 * 왜 필요한가?
 * - 컴포넌트에서 환경 설정에 접근할 때 사용
 * - Context를 직접 사용하는 것보다 타입 안전
 * - Provider 외부에서 사용 시 에러 방지
 *
 * @example
 * const { API_BASE_URL, SSO_LOGIN_URL } = useEnv();
 */
export const useEnv = (): EnvConfig => {
  const context = useContext(EnvContext);

  if (!context) {
    console.warn('[useEnv] Used outside of EnvProvider. Returning default config.');
    return defaultEnv;
  }

  return context;
};
