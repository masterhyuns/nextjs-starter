[x] nextjs starter 필요함
[x] typescript 를 준수해야함
[x] slid 원칙을 사용해서 구현해야함
[x] clean architecture 를 사용해서 구현해야함
[x] 웹어플리케이션에 필요한 모든 부분에 대한 예시 및 소스가 있어야 함
[x] Private , Public 페이지에 대한 인증 구분이 필요함 (SSR 기반, 번쩍거림 없음)
[x] 프론트 엔드에 필요한 form 및 디자인 컴포넌트들이 구현 되어야함 (Button, Input, Select, Checkbox, Radio, Textarea, Modal)
[x] zustend 를 활용한 단일 페이지에서 텝 페이지 기능이 구현 되어야함
[x] 모달 컨텍스트가 구현되어야함 (Modal + ModalProvider + Zustand 통합)
[x] 실제 사용자가 nextjs 와 react 에 대해서 고급 개발자가 아니기 때문에 직관적인 리팩터링을 해야함
[x] 실제 사용자가 nextjs와 react typescript에 대해서 고급 개발자가 아니기 때문에 사용자 친화 적인 주석이 필요함
[x] 주석은 반드시 왜 이렇게 구현했는지 근거와 로직에 대한 설명을 추가해줘



## 인증프로세스, auth-guar 요구사항
### 1. 인증 방식
- **HttpOnly 쿠키 기반 인증** (`mes-ticket`)
- 쿠키는 SSO 서버가 설정 (JavaScript로 읽을 수 없음)
- 인증 상태는 API 응답으로만 판단

### 2. 인증 플로우
1. `/api/user/me` API 호출
2. **200 OK** → 인증됨, 사용자 정보 사용
3. **401 Unauthorized** → SSO 로그인 페이지로 리다이렉트
4. SSO 로그인 완료 → 원래 페이지로 자동 복귀

### 3. 기술 제약사항
- **정적 배포 (Static Deployment)** - SSR 불가
- React Router v7 사용
- 쿠키는 `httpOnly: true`, `SameSite: None`
- 프론트엔드에서 쿠키 직접 읽기 불가능
#### Auth Guard 기능
- 보호된 페이지 접근 시 자동으로 인증 체크
- 로딩 상태 표시 (스피너)
- 인증 실패 시 SSO로 리다이렉트
- 인증 성공 시 하위 컴포넌트 렌더링
- 사용자 정보 Context로 제공

#### 필요한 구성요소
1. **AuthProvider**: 전역 인증 상태 관리
2. **useAuth Hook**: 인증 상태 및 사용자 정보 접근
3. **ProtectedRoute**: 인증이 필요한 라우트 래퍼
4. **API Client**: `/api/user/me` 호출 함수

### 5. API 정보
- **사용자 정보 조회**: `GET /api/user/me`
    - 성공: `200 OK` + 사용자 정보
    - 실패: `401 Unauthorized`
- **SSO 로그인**: `https://sso.cowexa.com/login?redirect={현재URL}`

7. 주의사항

- 무한 리다이렉트 방지 (SSO → 앱 → SSO 루프)
- 로그인 페이지는 auth-guard 제외
- API 호출 실패 시 에러 처리
- 토큰 만료 시 자동 재로그인

8. 구현 우선순위

1. /api/user/me API 호출 로직
2. 401 응답 시 SSO 리다이렉트
3. 로딩 상태 UI
4. 전역 상태 관리 (Context)
5. useAuth 훅 제공


## API 클라이언트 제안
- api.ts 는 api 명세 용도
```
const getUsers = {
    method: 'GET',
    url : '/users/',
    callback : (data) => {}
}

const getUser = (id: string) => {
    method: 'GET',
    url : '/users/',
    data : {id}
    callback : (data) => {}
}
```
- 사용자 컴포넌트에서는
```
const {fetch} = useApiClient<User[]>()

const init = async () => {
    const user = fetch(getUsers())
}

useEffect(() => {init()} , [])
```
이런식으로 사용하는거지 useApiClient는 크게 바뀔껀 없고 apiClient 할때 useEnv 에서 받은 baseUrl을 같이 넣으면 될꺼 같고