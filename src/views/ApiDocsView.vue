<template>
  <section class="py-16 bg-bg-0 min-h-screen">
    <div class="container max-w-3xl">
      <div class="section-tag">🔌 OPEN API</div>
      <h1 class="section-title">Open API <span>Gateway</span></h1>
      <p class="text-txt-3 mb-12">외부 오프라인 상점 · 커머스 · 제휴사가 SBT/NFT를 자동 발행하는 인터페이스</p>

      <!-- 인증 -->
      <div class="card p-6 mb-6">
        <h2 class="font-bold text-txt-1 mb-3">🔐 인증 방식</h2>
        <div class="bg-bg-0 rounded-md p-4 font-mono text-xs text-txt-2 mb-3">
          Authorization: Bearer &lt;API_KEY&gt;
        </div>
        <p class="text-sm text-txt-3">발급된 API 키를 SHA-256으로 해싱하여 서버에서 검증합니다. API 키는 마이페이지에서 발급받을 수 있습니다.</p>
      </div>

      <!-- 엔드포인트 -->
      <div v-for="ep in endpoints" :key="ep.path" class="card p-6 mb-4">
        <div class="flex items-center gap-3 mb-3">
          <span class="badge text-[11px]" :class="ep.method === 'GET' ? 'badge-green' : 'badge-purple'">{{ ep.method }}</span>
          <code class="font-mono text-sm text-txt-1">{{ ep.path }}</code>
        </div>
        <p class="text-sm text-txt-3 mb-3">{{ ep.desc }}</p>
        <div v-if="ep.body" class="bg-bg-0 rounded-md p-3 font-mono text-xs text-txt-2">{{ ep.body }}</div>
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

const auth    = useAuthStore()
const keyLabel= ref('')
const newKey  = ref('')

const endpoints = [
  {
    method: 'POST',
    path: '/api/v1/assets/issue',
    desc: 'SBT/NFT 자동 발행 — 파트너 API 키로 직접 호출',
    body: `{
  "brand_slug": "esco",
  "asset_class": "product_design",
  "token_type": "SBT",
  "subject_email": "user@example.com",
  "asset_metadata": {
    "name": "B5 Barrier Cream",
    "description": "..."
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/assets/:id',
    desc: '발행 상태 및 VC 정보 조회',
    body: '',
  },
  {
    method: 'GET',
    path: '/api/v1/partner/stats',
    desc: '파트너 통계 (발행 건수, VC 수, 포인트 합계)',
    body: '',
  },
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
