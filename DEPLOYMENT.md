# 배포 가이드

## 🚀 배포 방식 선택

### Middleware 동작 여부

| 배포 방식 | Middleware | 인증 방식 | 번쩍거림 | SEO | 난이도 |
|---------|-----------|----------|--------|-----|-------|
| **SSR (Vercel)** | ✅ 동작 | Server | 없음 ⭐ | 좋음 | 쉬움 |
| **SSR (Node.js)** | ✅ 동작 | Server | 없음 ⭐ | 좋음 | 중간 |
| **정적 배포** | ❌ 안됨 | Client | 있음 | 나쁨 | 쉬움 |

---

## ✅ **방법 1: SSR 배포 (권장) - Middleware 사용**

### 1-1. Vercel 배포 (가장 쉬움)

**왜 Vercel인가?**
- Next.js 개발사의 공식 플랫폼
- Middleware가 Edge Network에서 자동 실행
- 설정 없이 바로 배포 가능
- 무료 티어 제공

**배포 단계:**

```bash
# 1. GitHub에 코드 푸시
git add .
git commit -m "feat: 프로젝트 완성"
git push origin main

# 2. Vercel에 로그인
npm i -g vercel
vercel login

# 3. 배포
vercel
# 또는 프로덕션 배포
vercel --prod
```

**Vercel 웹사이트에서 배포:**
1. https://vercel.com 접속
2. "Import Project" 클릭
3. GitHub 레포지토리 선택
4. 자동 배포 완료!

**환경 변수 설정:**
```bash
# Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_API_URL=https://api.example.com
```

**결과:**
- ✅ Middleware 자동 동작
- ✅ SSR 인증 (번쩍거림 없음)
- ✅ CDN 캐싱
- ✅ 자동 HTTPS
- ✅ Preview 배포 (PR마다)

---

### 1-2. Node.js 서버 배포

**지원 플랫폼:**
- AWS EC2, Lightsail
- Google Cloud Run
- Azure App Service
- Railway, Render
- DigitalOcean

**배포 단계:**

#### Step 1: 빌드
```bash
# 프로덕션 빌드
pnpm build

# 빌드 결과 확인
ls .next/
```

#### Step 2: 서버 실행
```bash
# 개발 서버
pnpm dev

# 프로덕션 서버
pnpm start
```

#### Step 3: PM2로 프로세스 관리 (선택)
```bash
# PM2 설치
npm install -g pm2

# 서버 실행
pm2 start npm --name "next-app" -- start

# 로그 확인
pm2 logs next-app

# 재시작
pm2 restart next-app

# 부팅 시 자동 시작
pm2 startup
pm2 save
```

**환경 변수:**
```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.example.com
NODE_ENV=production
PORT=3000
```

**Nginx 리버스 프록시:**
```nginx
# /etc/nginx/sites-available/next-app
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### 1-3. Docker 배포

**Dockerfile:**
```dockerfile
# Base image
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm
RUN pnpm build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**next.config.js 수정:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Docker용 최적화
};

module.exports = nextConfig;
```

**빌드 및 실행:**
```bash
# 이미지 빌드
docker build -t next-app .

# 컨테이너 실행
docker run -p 3000:3000 next-app

# Docker Compose (선택)
docker-compose up -d
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  next-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.example.com
    restart: unless-stopped
```

---

## ❌ **방법 2: 정적 배포 (Middleware 사용 불가)**

### 주의사항

**정적 배포는 다음과 같은 제약이 있습니다:**
- ❌ Middleware 동작 안 함
- ❌ API Routes 사용 불가
- ❌ SSR 불가
- ❌ ISR 불가
- ⚠️ 클라이언트 사이드 인증 필요 (번쩍거림 발생)
- ⚠️ SEO 불리
- ⚠️ 보안성 낮음

**권장 사용 케이스:**
- Public 페이지만 있는 사이트 (블로그, 포트폴리오)
- 인증이 필요 없는 사이트

---

### 정적 배포 설정 (참고용)

#### Step 1: next.config.js 수정
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 정적 HTML 생성
  images: {
    unoptimized: true, // 이미지 최적화 비활성화 (필수)
  },
};

module.exports = nextConfig;
```

#### Step 2: Middleware 제거 및 AuthGuard 사용

**src/middleware.ts 삭제 또는 비활성화**

**src/app/layout.tsx 수정:**
```tsx
import { AuthGuard } from '@/presentation/components/providers/auth-guard';
import { ModalProvider } from '@/presentation/components/providers/modal-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {/* 클라이언트 사이드 인증 가드 */}
        <AuthGuard>
          {children}
        </AuthGuard>
        <ModalProvider />
      </body>
    </html>
  );
}
```

#### Step 3: 빌드
```bash
# 정적 빌드
pnpm build

# out/ 폴더 확인
ls out/
# → index.html
# → login/index.html
# → dashboard/index.html
# → _next/static/...
```

#### Step 4: 배포

**GitHub Pages:**
```bash
# out/ 폴더를 gh-pages 브랜치에 푸시
pnpm add -D gh-pages

# package.json에 스크립트 추가
{
  "scripts": {
    "deploy": "gh-pages -d out"
  }
}

# 배포
pnpm deploy
```

**Netlify:**
```bash
# 1. Netlify에 로그인
netlify login

# 2. 배포
netlify deploy --prod --dir=out
```

**Cloudflare Pages:**
- Cloudflare Dashboard에서 프로젝트 생성
- `out/` 폴더 업로드

---

## 📊 배포 방식 비교

### 기능 비교

| 기능 | SSR (Vercel) | SSR (Node.js) | 정적 배포 |
|------|-------------|--------------|---------|
| **Middleware** | ✅ 동작 | ✅ 동작 | ❌ 불가 |
| **SSR 인증** | ✅ 가능 | ✅ 가능 | ❌ 불가 |
| **번쩍거림** | ⭐ 없음 | ⭐ 없음 | ⚠️ 있음 |
| **SEO** | ⭐ 좋음 | ⭐ 좋음 | ⚠️ 나쁨 |
| **보안** | ⭐ 높음 | ⭐ 높음 | ⚠️ 낮음 |
| **API Routes** | ✅ 가능 | ✅ 가능 | ❌ 불가 |
| **비용** | 무료 티어 | 서버 비용 | 무료 |
| **난이도** | ⭐ 쉬움 | 중간 | ⭐ 쉬움 |

### 성능 비교

| 항목 | SSR (Edge) | SSR (Node.js) | 정적 |
|------|-----------|--------------|-----|
| **초기 로딩** | 빠름 | 중간 | 매우 빠름 |
| **인증 체크** | 매우 빠름 (Edge) | 빠름 (Server) | 느림 (Client) |
| **캐싱** | CDN + Edge | CDN | CDN |
| **확장성** | 자동 | 수동 | 무제한 |

---

## 🎯 **권장 배포 방식**

### 1. 이 프로젝트의 경우 (인증 필요)

**✅ SSR 배포 필수:**
- Middleware 사용 중
- SSR 인증 필요
- 번쩍거림 없는 UX 필요

**추천 순서:**
1. **Vercel** (가장 쉽고 빠름)
2. **Railway/Render** (무료 티어)
3. **AWS/GCP** (스케일링 필요 시)
4. **Docker** (컨테이너 환경)

### 2. Public 사이트만 있는 경우

**✅ 정적 배포 가능:**
- 인증 없음
- SEO 중요
- 빠른 로딩 필요

**추천 플랫폼:**
- GitHub Pages
- Netlify
- Cloudflare Pages
- Vercel (정적 모드)

---

## 🔧 배포 전 체크리스트

### 필수 확인 사항

- [ ] 빌드 성공 (`pnpm build`)
- [ ] 환경 변수 설정 완료
- [ ] API URL 프로덕션으로 변경
- [ ] 불필요한 console.log 제거
- [ ] 에러 핸들링 추가
- [ ] HTTPS 설정 (프로덕션)
- [ ] 도메인 연결 (선택)

### 성능 최적화

- [ ] 이미지 최적화 (`next/image`)
- [ ] 폰트 최적화 (`next/font`)
- [ ] 번들 사이즈 확인
- [ ] Lighthouse 점수 확인
- [ ] 캐싱 전략 설정

### 보안

- [ ] 환경 변수 보안 (SECRET 노출 확인)
- [ ] CORS 설정
- [ ] Rate Limiting
- [ ] CSP 헤더 설정

---

## 📖 추가 리소스

### 공식 문서
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Deployment](https://vercel.com/docs)
- [Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)

### 플랫폼별 가이드
- [Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Railway](https://docs.railway.app/guides/nextjs)
- [Render](https://render.com/docs/deploy-nextjs-app)
- [AWS Amplify](https://docs.amplify.aws/nextjs)
- [Google Cloud Run](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service)

---

## ❓ FAQ

### Q1: 정적 배포에서 Middleware를 사용할 수 있나요?
**A:** 아니요. Middleware는 서버 사이드 기능이므로 SSR 배포가 필요합니다.

### Q2: Vercel이 아닌 다른 플랫폼에서도 Middleware가 동작하나요?
**A:** 네! Node.js 서버가 있으면 모든 플랫폼에서 동작합니다.
- ✅ Railway, Render, AWS, GCP, Azure 모두 가능
- ✅ Docker 컨테이너 배포 가능

### Q3: 무료로 배포할 수 있나요?
**A:** 네! 여러 무료 옵션이 있습니다:
- Vercel (Hobby Plan)
- Railway (500시간/월)
- Render (무료 티어)
- GitHub Pages (정적만)
- Netlify (무료 티어)

### Q4: 이 프로젝트는 어떻게 배포하는 게 좋나요?
**A:** **Vercel 배포를 강력히 권장합니다:**
- ✅ Middleware 자동 동작
- ✅ 설정 없이 바로 배포
- ✅ 무료 티어
- ✅ Edge Network 성능

### Q5: 정적 배포를 꼭 해야 한다면?
**A:** `AuthGuard` 컴포넌트를 사용하세요:
1. `src/middleware.ts` 비활성화
2. `layout.tsx`에 `<AuthGuard>` 추가
3. `next.config.js`에 `output: 'export'` 설정
4. 빌드 후 `out/` 폴더 배포

**단점:**
- ⚠️ 클라이언트 번쩍거림 발생
- ⚠️ SEO 불리
- ⚠️ 보안성 낮음

---

## 🎉 결론

**이 프로젝트는 Middleware를 사용하므로 SSR 배포가 필수입니다.**

**추천 배포 방법:**
1. **Vercel** (가장 쉽고 빠름) ⭐
2. Railway/Render (무료 티어)
3. Node.js + Docker (커스텀 필요 시)

**정적 배포는 권장하지 않습니다** (번쩍거림, SEO, 보안 문제)

궁금한 점이 있으시면 언제든지 문의해주세요! 🚀
