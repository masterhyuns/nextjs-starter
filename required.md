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



## 인증프로세스, auth-guard
[x] 로그인 , 404, 로그아웃 을 제외한 모든 페이지이는 인증이 필요한 (Private페이지)
[x] localStorage 는 사용하지 않는다.
[x] /admin으로 시작하는 패스는 사용자 role 이 ADMIN만 접속 가능하다.
[x] 로그인 여부는 사용자 정보 조회를 했을때 200 이면 정상 로그인 401이면 통합 로그인  페이지로 리다이렉트 한후 통합 로그인 페이지에서 어플리케이션 / 로  리다이렉트 해준다 (이때 쿠키를 생성해준다.)
[x] AuthGuard 에 대한 최적화를 생각해야한다. 불필요한 리랜더링은 호출 되면 안됀다.