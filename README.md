# award.bi Frontend

K-Beauty 브랜드 자산 각인 플랫폼 — W3C VC · SBT · NFT · Bitcoin Inscription

---

## 🌐 배포 정보

| 항목 | 값 |
|------|-----|
| **라이브 URL** | https://award.bi |
| **Cloudflare Pages** | https://award-bi.pages.dev |
| **GitHub 저장소** | https://github.com/hotitem/award-bi-frontend |
| **배포 방식** | GitHub Push → Cloudflare Pages 자동 배포 |

---

## 📁 파일 구조

```
award-bi-frontend/
├── index.html              — 메인 랜딩 페이지
├── verify.html             — VC 공개 검증 페이지
├── brand/
│   └── esco.html           — ESCO 브랜드 쇼케이스 (더미)
├── assets/
│   ├── css/style.css       — 전체 디자인 시스템
│   └── js/main.js          — BTC 가격, 카운트다운, 카운터
└── _redirects              — Cloudflare Pages URL 라우팅
```

---

## 🚀 로컬 개발 & 배포

```bash
# 저장소 클론
git clone https://github.com/hotitem/award-bi-frontend.git
cd award-bi-frontend

# 로컬 서버 실행 (Python 예시)
python -m http.server 3000
# 또는 VS Code Live Server 사용

# 수정 후 배포
git add -A
git commit -m "커밋 메시지"
git push origin main
# → Cloudflare Pages 자동 빌드 및 배포
```

---

## 🎨 디자인 시스템

다크 프리미엄 K-Beauty 테마 (`assets/css/style.css`)

```css
/* 주요 색상 변수 */
--bg-0: #060a18;           /* 최상단 배경 */
--bg-1: #0c1024;           /* 섹션 배경 */
--bg-card: #141929;        /* 카드 배경 */
--purple: #7c3aed;         /* 메인 보라 */
--gold: #f59e0b;           /* 골드 강조 */
--green: #10b981;          /* 성공/BTC */
--grad-hero: linear-gradient(135deg, #7c3aed, #4f46e5, #0ea5e9);
```

---

## 📄 주요 페이지

### index.html — 메인 랜딩
- Hero: 3-카드 대시보드 + Bitcoin 매일 각인 카운트다운
- Bitcoin 5단계 각인 흐름 (자산활동 → 머클트리 → Bitcoin각인 → 블록확정 → 영구검증)
- Award 카테고리 6종, ESCO 추천 브랜드, 과거 수상작

### verify.html — VC 검증
- VC ID 또는 SHA-256 해시로 검색
- W3C VC JSON 구문 강조 표시
- 머클 증명 경로 시각화 (L/R 방향)
- Bitcoin 블록 외부 링크 (mempool.space, blockstream, blockchain.com)
- URL 파라미터: `https://award.bi/verify?id=vc-esco-001`

### brand/esco — ESCO 브랜드 (SPA route `/brand/:slug`)
- SBT 7종 + NFT 정품인증 1종 (수량 1,000개)
- Bitcoin 각인 이력 테이블
- 맞팔 회원 전용 잠금 카드

---

## 🔗 API 연동

```javascript
// api.award.bi 연결 (main.js)
const API_BASE = 'https://api.award.bi';

// 예시: 통계 조회
const res = await fetch(`${API_BASE}/stats`);
const data = await res.json();
```

---

## ↩️ URL 리디렉트 (`_redirects`)

```
/brand    /brand/esco   302
/esco     /brand/esco   301
/verify   /verify.html       301
/v/:id    /verify.html?id=:id 301
```
