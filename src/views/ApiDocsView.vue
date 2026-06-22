<template>
  <section class="py-16 bg-bg-0 min-h-screen">
    <div class="container max-w-4xl">
      <div class="section-tag">🔌 OPEN API</div>
      <h1 class="section-title">Open API <span>Gateway</span></h1>
      <p class="text-txt-3 mb-12">파트너 채널이 SBT / NFT를 자동 발행하는 공개 인터페이스입니다. kei.bio 계정을 통해 API 키를 발급받아 사용하세요.</p>

      <!-- Base URL -->
      <div class="card p-5 mb-6 flex items-center gap-3">
        <span class="text-xs text-txt-4 uppercase tracking-wider shrink-0">Base URL</span>
        <code class="font-mono text-sm text-primary-light">https://api.award.bi</code>
      </div>

      <!-- 인증 -->
      <div class="card p-6 mb-8">
        <h2 class="font-bold text-txt-1 text-lg mb-4">🔐 인증</h2>
        <p class="text-sm text-txt-3 mb-3">모든 요청에 <code class="text-primary-light">X-Service-Token</code> 헤더로 API 키를 포함하세요.</p>
        <pre class="bg-bg-0 rounded-lg p-4 font-mono text-xs text-txt-2 overflow-x-auto">POST https://api.award.bi/cert/request
X-Service-Token: &lt;YOUR_API_KEY&gt;
Content-Type: application/json</pre>
      </div>

      <!-- 자산 유형 -->
      <div class="card p-6 mb-8">
        <h2 class="font-bold text-txt-1 text-lg mb-4">📋 자산 유형 (asset_kind)</h2>
        <p class="text-sm text-txt-3 mb-4">
          <code class="text-primary-light">asset_kind</code> 값에 따라 award.bi 내부 카테고리가 자동 지정됩니다.
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-white/10 text-txt-4">
                <th class="text-left py-2 pr-4 font-medium">asset_kind</th>
                <th class="text-left py-2 pr-4 font-medium">asset_class</th>
                <th class="text-left py-2 pr-4 font-medium">카테고리</th>
                <th class="text-left py-2 pr-4 font-medium">토큰</th>
                <th class="text-left py-2 font-medium">설명</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="k in KIND_TABLE" :key="k.kind"
                  class="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td class="py-2 pr-4"><code class="text-gold">{{ k.kind }}</code></td>
                <td class="py-2 pr-4"><code class="text-txt-3 text-[10px]">{{ k.cls }}</code></td>
                <td class="py-2 pr-4">
                  <span :class="['text-[10px] font-bold px-1.5 py-0.5 rounded-full', k.badgeCls]">
                    {{ k.catIcon }} {{ k.cat }}
                  </span>
                </td>
                <td class="py-2 pr-4">
                  <span :class="['text-[10px] font-bold px-1.5 rounded', k.token === 'NFT' ? 'bg-gold/20 text-gold' : 'bg-purple-500/20 text-purple-300']">
                    {{ k.token }}
                  </span>
                </td>
                <td class="py-2 text-txt-3">{{ k.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 엔드포인트들 -->
      <div v-for="ep in ENDPOINTS" :key="ep.path" class="card p-6 mb-4">
        <div class="flex items-start justify-between mb-3 flex-wrap gap-2">
          <div class="flex items-center gap-3">
            <span :class="['badge text-[11px] font-black', methodClass(ep.method)]">{{ ep.method }}</span>
            <code class="font-mono text-sm text-txt-1">{{ ep.path }}</code>
          </div>
          <span v-if="ep.tag" :class="['text-[10px] font-bold px-2 py-0.5 rounded-full', ep.tagCls ?? 'bg-white/10 text-txt-3']">{{ ep.tag }}</span>
        </div>
        <p class="text-sm text-txt-3 mb-4">{{ ep.desc }}</p>

        <!-- 요청 예시 -->
        <div v-if="ep.body">
          <div class="text-[10px] text-txt-4 uppercase tracking-wider mb-1">Request Body</div>
          <pre class="bg-bg-0 rounded-lg p-4 font-mono text-xs text-txt-2 overflow-x-auto">{{ ep.body }}</pre>
        </div>

        <!-- 응답 예시 -->
        <div v-if="ep.response" class="mt-3">
          <div class="text-[10px] text-txt-4 uppercase tracking-wider mb-1">Response</div>
          <pre class="bg-bg-0 rounded-lg p-4 font-mono text-xs text-success-light overflow-x-auto">{{ ep.response }}</pre>
        </div>

        <!-- 필드 설명 -->
        <div v-if="ep.fields?.length" class="mt-3 space-y-1">
          <div class="text-[10px] text-txt-4 uppercase tracking-wider mb-2">Fields</div>
          <div v-for="f in ep.fields" :key="f.name" class="flex gap-3 text-xs">
            <code class="text-gold w-36 shrink-0">{{ f.name }}</code>
            <span class="text-txt-4 w-16 shrink-0">{{ f.type }}</span>
            <span :class="f.req ? 'text-red-400' : 'text-txt-4'" class="w-12 shrink-0">{{ f.req ? '필수' : '선택' }}</span>
            <span class="text-txt-3">{{ f.desc }}</span>
          </div>
        </div>
      </div>

      <!-- 에러 코드 -->
      <div class="card p-6 mb-8">
        <h2 class="font-bold text-txt-1 text-lg mb-4">⚠️ 에러 코드</h2>
        <div class="space-y-2">
          <div v-for="e in ERRORS" :key="e.code" class="flex gap-4 text-xs border-b border-white/5 pb-2">
            <code class="text-red-400 w-40 shrink-0">{{ e.code }}</code>
            <span class="text-txt-4 w-8 shrink-0">{{ e.status }}</span>
            <span class="text-txt-3">{{ e.desc }}</span>
          </div>
        </div>
      </div>

      <!-- API 키 발급 -->
      <div v-if="auth.isLoggedIn" class="card p-6 mt-8">
        <h2 class="font-bold text-txt-1 mb-4">🗝 API 키 발급</h2>
        <div class="flex gap-2 mb-4">
          <input v-model="keyLabel" placeholder="키 이름 (예: 내 쇼핑몰)" class="flex-1 px-3 py-2 bg-bg-0 border border-white/10 rounded-md text-sm text-txt-1 outline-none focus:border-primary/60" />
          <button @click="createKey" class="btn btn-primary">발급</button>
        </div>
        <div v-if="newKey" class="bg-bg-0 rounded-md p-3 font-mono text-xs text-success-light break-all">{{ newKey }}</div>
        <p v-if="newKey" class="text-xs text-txt-3 mt-2">⚠️ 이 키는 다시 표시되지 않습니다. 안전하게 보관하세요.</p>
      </div>
      <div v-else class="card p-6 mt-8 text-center text-txt-3">
        <p class="mb-3">API 키는 로그인 후 발급할 수 있습니다</p>
        <button @click="auth.openLogin()" class="btn btn-primary">로그인</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { createApiKey } from '@/api/award'

const auth     = useAuthStore()
const keyLabel = ref('')
const newKey   = ref('')

const methodClass = (m: string) => ({
  GET: 'badge-green', POST: 'badge-purple', PATCH: 'badge-gold', DELETE: 'badge-gray',
}[m] ?? 'badge-gray')

const KIND_TABLE = [
  { kind: 'product',                cls: 'product_design',   cat: '에셋',     catIcon: '🎨', token: 'SBT', badgeCls: 'bg-blue-500/20 text-blue-300',     desc: '상품 디자인 / 제품 자산' },
  { kind: 'logo',                   cls: 'brand_logo',       cat: '에셋',     catIcon: '🎨', token: 'SBT', badgeCls: 'bg-blue-500/20 text-blue-300',     desc: '브랜드 로고' },
  { kind: 'mp4 / video',            cls: 'brand_video',      cat: '에셋',     catIcon: '🎨', token: 'SBT', badgeCls: 'bg-blue-500/20 text-blue-300',     desc: '브랜드 영상' },
  { kind: 'model',                  cls: 'model_portrait',   cat: '에셋',     catIcon: '🎨', token: 'SBT', badgeCls: 'bg-blue-500/20 text-blue-300',     desc: '모델 AI 초상권' },
  { kind: 'authenticity',           cls: 'authenticity_cert',cat: '정품인증', catIcon: '✅', token: 'SBT', badgeCls: 'bg-emerald-500/20 text-emerald-300',desc: '제품 정품인증 SBT — 배송 확인 후 발행' },
  { kind: 'membership',             cls: 'membership_cert',  cat: '멤버십',   catIcon: '💎', token: 'SBT', badgeCls: 'bg-purple-500/20 text-purple-300', desc: '브랜드 멤버십 SBT — 구매 후기 작성 시 발행' },
  { kind: 'influencer',             cls: 'influencer_cert',  cat: '인플루언서',catIcon: '⭐', token: 'SBT', badgeCls: 'bg-rose-500/20 text-rose-300',     desc: '인플루언서 파트너십 SBT' },
  { kind: 'contract',               cls: 'contract_cert',    cat: '계약',     catIcon: '📝', token: 'SBT', badgeCls: 'bg-sky-500/20 text-sky-300',       desc: '계약서 해시 영구 각인 SBT' },
  { kind: 'campaign_participation', cls: 'campaign_cert',    cat: '캠페인',   catIcon: '🎯', token: 'SBT', badgeCls: 'bg-orange-500/20 text-orange-300', desc: '캠페인 참여 SBT — 자동 즉시 발행' },
  { kind: 'product_voucher',        cls: 'product_voucher',  cat: '캠페인',   catIcon: '🎯', token: 'NFT', badgeCls: 'bg-orange-500/20 text-orange-300', desc: '상품 교환권 NFT (양도 가능)' },
]

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/cert/request',
    tag: '핵심 API',
    tagCls: 'bg-primary/20 text-primary-light',
    desc: '자산 선언 + SBT/NFT 발행 신청. 브랜드 미등록 시 자동 등록됩니다. 아뜰리에 검토 후 W3C VC 발행 → Bitcoin 각인 순으로 처리됩니다.',
    body: `{
  "brand_slug":     "esco",
  "brand_name":     "ESCO Cosmetics",
  "owner_did":      "did:kei:user-uuid",
  "owner_email":    "user@example.com",
  "kei_asset_id":   "auth_SBT-ESCO-1782070833085",
  "asset_kind":     "authenticity",
  "asset_hash":     "sha256-of-source-or-custom",
  "source_url":     "https://api.kei.bio/badge/esco/auth",
  "asset_metadata": {
    "title":        "정품인증 - ESCO Cosmetics",
    "tracking_no":  "6890145593893",
    "verified_at":  "2026-06-22T03:00:00Z"
  },
  "token_category": "SBT",
  "callback_url":   "https://api.kei.bio/webhooks/award"
}`,
    response: `{
  "ok": true,
  "declaration_id": "uuid-...",
  "status": "pending",
  "brand_id": "uuid-...",
  "brand_status": "approved"
}`,
    fields: [
      { name: 'brand_slug',     type: 'string', req: true,  desc: 'kei.bio 브랜드 핸들 (예: esco)' },
      { name: 'brand_name',     type: 'string', req: false, desc: '브랜드 표시 이름 (신규 등록 시 사용)' },
      { name: 'owner_did',      type: 'string', req: true,  desc: '사용자 DID (예: did:kei:{uuid})' },
      { name: 'owner_email',    type: 'string', req: false, desc: 'VC 발행 완료 알림 이메일' },
      { name: 'kei_asset_id',   type: 'string', req: false, desc: 'kei.bio 자산 고유 ID (콜백 매칭용)' },
      { name: 'asset_kind',     type: 'string', req: true,  desc: '위 표의 asset_kind 값' },
      { name: 'asset_hash',     type: 'string', req: false, desc: 'SHA-256 해시 (미전달 시 source_url 기반 자동 생성)' },
      { name: 'source_url',     type: 'string', req: true,  desc: '자산 이미지/페이지 URL (아뜰리에 썸네일로 표시)' },
      { name: 'asset_metadata', type: 'object', req: false, desc: '카테고리별 추가 메타데이터 (title 필수 권장)' },
      { name: 'token_category', type: 'string', req: false, desc: '"SBT" (기본) 또는 "NFT"' },
      { name: 'callback_url',   type: 'string', req: false, desc: 'VC 발행 / 거절 시 POST 콜백 URL' },
    ],
  },
  {
    method: 'GET',
    path: '/cert/:declaration_id',
    tag: '상태 조회',
    tagCls: 'bg-white/10 text-txt-3',
    desc: '발행 신청 건의 현재 상태를 조회합니다.',
    body: '',
    response: `{
  "ok": true,
  "declaration_id": "uuid-...",
  "status": "vc_issued",
  "vc_id": "uuid-...",
  "ots_status": "confirmed",
  "btc_block_height": 856231
}`,
    fields: [],
  },
  {
    method: 'POST',
    path: '/cert/request  (정품인증 예시)',
    tag: '정품인증',
    tagCls: 'bg-emerald-500/20 text-emerald-300',
    desc: '배송 완료 후 정품인증 SBT 발행. source_url에 배지 이미지 URL을 사용하면 아뜰리에에서 SVG 배지가 썸네일로 표시됩니다.',
    body: `{
  "brand_slug":     "esco",
  "brand_name":     "ESCO Cosmetics",
  "owner_did":      "did:kei:{user-uuid}",
  "owner_email":    "buyer@example.com",
  "kei_asset_id":   "auth_{sbt-token-id}",
  "asset_kind":     "authenticity",
  "source_url":     "https://api.kei.bio/badge/esco/auth",
  "asset_metadata": {
    "title":        "정품인증 - ESCO Cosmetics",
    "tracking_no":  "6890145593893",
    "barcode":      "8809304204099",
    "verified_at":  "2026-06-22T03:00:00Z"
  },
  "token_category": "SBT"
}`,
    fields: [
      { name: 'asset_metadata.title',       type: 'string', req: true,  desc: '"정품인증 - {브랜드명}" 형식 권장' },
      { name: 'asset_metadata.tracking_no', type: 'string', req: false, desc: '배송 송장번호' },
      { name: 'asset_metadata.barcode',     type: 'string', req: false, desc: '제품 바코드' },
      { name: 'asset_metadata.verified_at', type: 'string', req: false, desc: '인증 완료 시각 (ISO 8601)' },
    ],
  },
  {
    method: 'POST',
    path: '/cert/request  (멤버십 예시)',
    tag: '멤버십',
    tagCls: 'bg-purple-500/20 text-purple-300',
    desc: '정품인증 SBT 보유자가 후기 작성 완료 시 멤버십 SBT 발행.',
    body: `{
  "brand_slug":     "esco",
  "brand_name":     "ESCO Cosmetics",
  "owner_did":      "did:kei:{user-uuid}",
  "owner_email":    "buyer@example.com",
  "kei_asset_id":   "membership_{review-uuid}",
  "asset_kind":     "membership",
  "source_url":     "https://api.kei.bio/badge/esco/membership",
  "asset_metadata": {
    "title":        "멤버십 인증 - ESCO Cosmetics",
    "rating":       5,
    "review_text":  "정품 인증 후 멤버십 가입했습니다",
    "auth_sbt_id":  "{prior-sbt-token-id}",
    "verified_at":  "2026-06-22T03:00:00Z"
  },
  "token_category": "SBT"
}`,
    fields: [
      { name: 'asset_metadata.rating',      type: 'number', req: false, desc: '별점 1~5' },
      { name: 'asset_metadata.review_text', type: 'string', req: false, desc: '후기 본문 (최대 500자 권장)' },
      { name: 'asset_metadata.auth_sbt_id', type: 'string', req: false, desc: '선행 정품인증 SBT 토큰 ID' },
    ],
  },
  {
    method: 'POST',
    path: '/cert/request  (인플루언서 예시)',
    tag: '인플루언서',
    tagCls: 'bg-rose-500/20 text-rose-300',
    desc: '브랜드-인플루언서 파트너십 체결 시 SBT 발행. 플랫폼·팔로워·계약 ID 등 파트너십 정보를 메타데이터에 포함합니다.',
    body: `{
  "brand_slug":     "esco",
  "brand_name":     "ESCO Cosmetics",
  "owner_did":      "did:kei:{influencer-uuid}",
  "owner_email":    "influencer@example.com",
  "kei_asset_id":   "influencer_{contract-id}",
  "asset_kind":     "influencer",
  "source_url":     "https://kei.bio/{influencer-handle}",
  "asset_metadata": {
    "title":        "인플루언서 파트너 - ESCO Cosmetics",
    "platform":     "Instagram",
    "followers":    120000,
    "category":     "K-Beauty",
    "contract_id":  "{contract-uuid}",
    "reward_rate":  15
  },
  "token_category": "SBT"
}`,
    fields: [
      { name: 'asset_metadata.platform',    type: 'string', req: false, desc: '활동 플랫폼 (Instagram / YouTube / TikTok 등)' },
      { name: 'asset_metadata.followers',   type: 'number', req: false, desc: '팔로워 수' },
      { name: 'asset_metadata.category',    type: 'string', req: false, desc: '콘텐츠 카테고리' },
      { name: 'asset_metadata.contract_id', type: 'string', req: false, desc: '계약 UUID (계약 SBT와 연결)' },
      { name: 'asset_metadata.reward_rate', type: 'number', req: false, desc: '수익 공유율 (%)' },
    ],
  },
  {
    method: 'POST',
    path: '/cert/request  (계약 예시)',
    tag: '계약',
    tagCls: 'bg-sky-500/20 text-sky-300',
    desc: '계약서 문서 해시를 Bitcoin에 영구 각인. 원본 문서 해시를 asset_hash에 전달하면 위변조 검증에 활용됩니다.',
    body: `{
  "brand_slug":     "esco",
  "brand_name":     "ESCO Cosmetics",
  "owner_did":      "did:kei:{party-uuid}",
  "owner_email":    "legal@esco.com",
  "kei_asset_id":   "contract_{doc-hash-prefix}",
  "asset_kind":     "contract",
  "asset_hash":     "sha256-of-contract-document",
  "source_url":     "https://kei.bio/esco",
  "asset_metadata": {
    "title":          "계약서 - ESCO × Kelly Agency",
    "contract_type":  "인플루언서 전속 계약",
    "party_a":        "ESCO Cosmetics",
    "party_b":        "Kelly Agency",
    "effective_date": "2026-07-01",
    "doc_hash":       "sha256-of-contract-document"
  },
  "token_category": "SBT"
}`,
    fields: [
      { name: 'asset_hash',                    type: 'string', req: true,  desc: '계약서 원본 SHA-256 (위변조 검증 기준)' },
      { name: 'asset_metadata.contract_type',  type: 'string', req: false, desc: '계약 유형' },
      { name: 'asset_metadata.party_a',        type: 'string', req: false, desc: '갑 (계약 당사자 A)' },
      { name: 'asset_metadata.party_b',        type: 'string', req: false, desc: '을 (계약 당사자 B)' },
      { name: 'asset_metadata.effective_date', type: 'string', req: false, desc: '효력 발생일 (YYYY-MM-DD)' },
    ],
  },
  {
    method: 'POST',
    path: '/webhooks  (콜백 수신)',
    tag: '콜백',
    tagCls: 'bg-white/10 text-txt-3',
    desc: 'award.bi가 VC 발행 완료 또는 거절 시 callback_url로 POST 요청을 보냅니다. HMAC-SHA256 서명을 검증하세요.',
    body: '',
    response: `// VC 발행 완료
{
  "event": "vc.issued",
  "declaration_id": "uuid-...",
  "kei_asset_id": "auth_SBT-ESCO-...",
  "vc_id": "uuid-...",
  "verify_url": "https://award.bi/verify/{vc_id}"
}

// 거절
{
  "event": "declaration.rejected",
  "declaration_id": "uuid-...",
  "kei_asset_id": "auth_SBT-ESCO-...",
  "reason": "거절 사유"
}`,
    fields: [],
  },
]

const ERRORS = [
  { code: 'MISSING_PARAMS',    status: 400, desc: 'brand_slug, owner_did, source_url 중 하나 이상 누락' },
  { code: 'BRAND_REJECTED',    status: 403, desc: '해당 브랜드가 아뜰리에 거절 상태' },
  { code: 'BRAND_NOT_APPROVED', status: 403, desc: '브랜드 미승인 상태 (/declarations 구 API)' },
  { code: 'DUPLICATE_HASH',    status: 200, desc: 'asset_hash 중복 — 기존 선언 반환 (ok: true, duplicate: true)' },
  { code: 'UNAUTHORIZED',      status: 401, desc: 'X-Service-Token 누락 또는 유효하지 않음' },
  { code: 'SERVER_ERROR',      status: 500, desc: '서버 내부 오류' },
]

async function createKey() {
  if (!keyLabel.value.trim()) { alert('키 이름을 입력하세요'); return }
  try {
    const { data } = await createApiKey(keyLabel.value.trim())
    newKey.value = data.raw_key ?? data.key ?? ''
    keyLabel.value = ''
  } catch (e: unknown) { alert((e as Error).message) }
}
</script>
