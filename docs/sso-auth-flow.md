# SSO 쿠키 기반 인증 플로우 다이어그램

## 1. 전체 인증 플로우

```mermaid
sequenceDiagram
    participant User as 사용자
    participant App as Next.js App
    participant Guard as AuthGuard
    participant Store as AuthStore
    participant API as /api/user/me
    participant SSO as SSO Server
    participant Storage as sessionStorage

    User->>App: 페이지 접속
    App->>Guard: 컴포넌트 렌더링
    Guard->>Store: loadUser() 호출
    Store->>Storage: auth_redirecting 체크

    alt 리다이렉트 플래그 없음
        Store->>API: GET /api/user/me (mes-ticket 쿠키)

        alt 200 OK (인증 성공)
            API-->>Store: 사용자 정보 반환
            Store->>Storage: auth_redirecting 제거
            Store-->>Guard: isAuthenticated: true
            Guard-->>App: children 렌더링
            App-->>User: 페이지 표시
        else 401 Unauthorized (인증 실패)
            API-->>Store: 401 응답
            Store->>Storage: auth_redirecting = 'true' 저장
            Store->>SSO: redirect to SSO<br/>(현재 URL 포함)
            SSO-->>User: 로그인 페이지 표시
            User->>SSO: 로그인 정보 입력
            SSO->>SSO: 인증 처리
            SSO->>App: 원래 URL로 리다이렉트<br/>(mes-ticket 쿠키 설정)
            Note over App,Store: 1번부터 재시작<br/>(이제 유효한 쿠키 보유)
        end
    else 리다이렉트 플래그 있음 (무한 루프 방지)
        Store->>Storage: auth_redirecting 제거
        Store-->>Guard: isAuthenticated: false
        Guard-->>App: 로딩 화면 또는 에러 처리
    end
```

## 2. 라우트 보호 로직

```mermaid
flowchart TD
    Start([페이지 접근]) --> AuthGuard{AuthGuard 체크}
    AuthGuard --> Loading{status === 'loading'?}

    Loading -->|Yes| ShowLoading[로딩 스피너 표시]
    Loading -->|No| CheckRoute{라우트 타입 체크}

    CheckRoute --> IsPublic{PUBLIC_ROUTES?<br/>/404, /403}
    IsPublic -->|Yes| AllowAccess[접근 허용]

    IsPublic -->|No| IsAdmin{ADMIN_ROUTES?<br/>/admin}
    IsAdmin -->|Yes| CheckAuth{isAuthenticated?}

    CheckAuth -->|No| WaitSSO[SSO 리다이렉트 대기]
    CheckAuth -->|Yes| CheckRole{role === 'admin'?}

    CheckRole -->|Yes| AllowAccess
    CheckRole -->|No| Redirect403[/403으로 리다이렉트]

    IsAdmin -->|No| IsPrivate{나머지 모든 페이지<br/>Private Route}
    IsPrivate --> CheckPrivateAuth{isAuthenticated?}

    CheckPrivateAuth -->|Yes| AllowAccess
    CheckPrivateAuth -->|No| WaitSSO

    AllowAccess --> Render[children 렌더링]
```

## 3. loadUser() 내부 로직

```mermaid
flowchart TD
    Start([loadUser 호출]) --> CheckFlag{sessionStorage<br/>auth_redirecting?}

    CheckFlag -->|'true'| RemoveFlag[플래그 제거]
    RemoveFlag --> SetLoading[status: 'loading']

    CheckFlag -->|null or 'false'| SetLoading

    SetLoading --> CallAPI[GET /api/user/me<br/>credentials: 'include']

    CallAPI --> Response{응답 코드}

    Response -->|200 OK| Success[user 정보 저장<br/>isAuthenticated: true<br/>status: 'success']
    Success --> ClearFlag[sessionStorage<br/>플래그 제거]
    ClearFlag --> End1([완료])

    Response -->|401| CheckRedirecting{sessionStorage<br/>auth_redirecting === 'true'?}

    CheckRedirecting -->|Yes| SetIdle[user: null<br/>isAuthenticated: false<br/>status: 'idle']
    SetIdle --> End2([완료 - 무한 루프 방지])

    CheckRedirecting -->|No| SetFlag[sessionStorage<br/>auth_redirecting = 'true']
    SetFlag --> BuildURL[SSO URL 생성<br/>redirect 파라미터 포함]
    BuildURL --> RedirectSSO[window.location.href<br/>= SSO URL]
    RedirectSSO --> End3([SSO로 리다이렉트])

    Response -->|500 등 기타 에러| Error[user: null<br/>isAuthenticated: false<br/>status: 'idle'<br/>error 메시지 설정]
    Error --> End4([완료])
```

## 4. 무한 리다이렉트 방지 메커니즘

```mermaid
stateDiagram-v2
    [*] --> Initial: 페이지 로드

    Initial --> CheckingAuth: loadUser() 호출

    CheckingAuth --> Authenticated: 200 OK
    CheckingAuth --> NeedLogin: 401 + flag 없음
    CheckingAuth --> LoopDetected: 401 + flag 있음

    Authenticated --> [*]: 정상 렌더링<br/>(flag 제거)

    NeedLogin --> RedirectingToSSO: flag 설정<br/>SSO로 이동

    RedirectingToSSO --> AfterSSOLogin: SSO 로그인 완료

    AfterSSOLogin --> CheckingAuth: loadUser() 재호출<br/>(쿠키 보유)

    LoopDetected --> IdleState: flag 제거<br/>idle 상태

    IdleState --> [*]: 에러 처리<br/>(무한 루프 방지)

    note right of NeedLogin
        sessionStorage에
        auth_redirecting = 'true'
        저장
    end note

    note right of LoopDetected
        SSO에서 돌아왔지만
        여전히 401인 경우
        (쿠키 설정 실패 등)
    end note
```

## 5. 시스템 아키텍처

```mermaid
graph TB
    subgraph "Client Side (정적 배포)"
        Browser[Browser]

        subgraph "Next.js App"
            Layout[app/layout.tsx]
            Pages[Pages]
            AuthGuard[AuthGuard Component]
            AuthStore[AuthStore - Zustand]
            API_Client[apiClient]
        end

        subgraph "Storage"
            SessionStorage[sessionStorage<br/>auth_redirecting flag]
            Cookie[HttpOnly Cookie<br/>mes-ticket]
        end
    end

    subgraph "Server Side"
        API[/api/user/me]
        SSO_Server[SSO Server<br/>sso.cowexa.com]
    end

    Browser --> Layout
    Layout --> AuthGuard
    AuthGuard --> AuthStore
    AuthStore --> API_Client
    API_Client --> API

    AuthStore <-.-> SessionStorage
    API_Client <-.-> Cookie

    API -->|401| AuthStore
    AuthStore -->|Redirect| SSO_Server
    SSO_Server -->|Set Cookie| Cookie
    SSO_Server -->|Redirect Back| Browser

    API -->|200 + User Info| AuthStore
    AuthStore --> AuthGuard
    AuthGuard --> Pages
```

## 6. 데이터 흐름

```mermaid
flowchart LR
    subgraph "인증 상태 저장소"
        Store[AuthStore - Zustand]
        State[State:<br/>user: User | null<br/>isAuthenticated: boolean<br/>status: AsyncState<br/>error: string | null]
    end

    subgraph "API 계층"
        API[auth/api.ts]
        Client[apiClient]
    end

    subgraph "컴포넌트 계층"
        Guard[AuthGuard]
        Hook[useAuthStore hook]
        Pages[Page Components]
    end

    subgraph "설정"
        Constants[constants.ts<br/>AUTH_CONFIG]
    end

    Guard -->|useAuthStore| Store
    Pages -->|useAuthStore| Store

    Store -->|loadUser| API
    API -->|apiClient.get| Client
    Client -->|HTTP GET| Server[/api/user/me]

    Server -->|Response| Client
    Client -->|ApiResponse| API
    API -->|Update State| Store

    Store -.->|Read Config| Constants
    API -.->|Read Config| Constants
```

## 7. 에러 처리 플로우

```mermaid
flowchart TD
    Start([API 호출]) --> Try{try-catch}

    Try --> Success{result.success?}

    Success -->|true & data| CheckStatus{statusCode}

    CheckStatus -->|200| SaveUser[사용자 정보 저장<br/>isAuthenticated: true]
    SaveUser --> End1([성공])

    Success -->|false| CheckCode{statusCode}

    CheckCode -->|401| Handle401[SSO 리다이렉트 처리<br/>무한 루프 체크]
    Handle401 --> End2([리다이렉트 또는 idle])

    CheckCode -->|403| Handle403[권한 없음<br/>/403으로 이동]
    Handle403 --> End3([403 페이지])

    CheckCode -->|기타| HandleError[에러 메시지 설정<br/>status: 'idle']
    HandleError --> End4([에러 상태])

    Try -->|catch| Exception[예외 처리<br/>error 메시지 저장]
    Exception --> End5([예외 처리 완료])
```

## 8. 쿠키 및 보안

```mermaid
graph TB
    subgraph "SSO Server"
        SSO[SSO Authentication]
        SetCookie[Set-Cookie<br/>mes-ticket]
    end

    subgraph "Cookie 속성"
        HttpOnly[HttpOnly: true<br/>JavaScript 접근 불가]
        SameSite[SameSite: None<br/>Cross-site 전송 가능]
        Secure[Secure: true<br/>HTTPS only]
    end

    subgraph "Client"
        Browser[Browser Cookie Store]
        Fetch[fetch with<br/>credentials: 'include']
    end

    subgraph "API Server"
        Validate[Cookie 검증]
        Return[사용자 정보 반환]
    end

    SSO --> SetCookie
    SetCookie --> HttpOnly
    SetCookie --> SameSite
    SetCookie --> Secure

    HttpOnly --> Browser
    SameSite --> Browser
    Secure --> Browser

    Browser --> Fetch
    Fetch -->|자동 쿠키 전송| Validate
    Validate --> Return

    style HttpOnly fill:#f9f9f9
    style SameSite fill:#f9f9f9
    style Secure fill:#f9f9f9
```

## 주요 특징

### 정적 배포 지원
- 런타임 환경변수 대신 `constants.ts` 설정 파일 사용
- 빌드 시점에 모든 설정 고정
- 서버리스 환경에서도 동작

### 보안
- HttpOnly 쿠키로 XSS 공격 방지
- SSO 서버에서 중앙 집중식 인증 관리
- 프론트엔드에서 쿠키 직접 접근 불가

### 사용자 경험
- 무한 리다이렉트 방지 (sessionStorage 플래그)
- 로딩 상태 표시로 깜빡임 최소화
- 원래 페이지로 자동 복귀

### 확장성
- RBAC 지원 (admin 권한 체크)
- 라우트별 접근 제어
- Zustand를 통한 전역 상태 관리
