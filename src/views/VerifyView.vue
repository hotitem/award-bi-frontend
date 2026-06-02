<template>
  <section class="py-16 bg-bg-0 min-h-screen">
    <div class="container max-w-3xl">
      <div class="text-center mb-10">
        <div class="section-tag">🔍 VERIFICATION</div>
        <h1 class="section-title">{{ t('verify.title') }}</h1>
      </div>

      <!-- 검색창 -->
      <div class="flex gap-2 mb-8">
        <input
          v-model="query"
          type="text"
          :placeholder="t('verify.placeholder')"
          @keydown.enter="doVerify"
          class="flex-1 px-4 py-3 bg-bg-card border border-white/10 rounded-md text-sm text-txt-1 outline-none focus:border-primary/60 transition-colors"
        />
        <button @click="doVerify" :disabled="loading" class="btn btn-primary px-6">
          {{ loading ? t('verify.loading') : t('verify.btn') }}
        </button>
      </div>

      <!-- 오류/안내 -->
      <div v-if="error" class="card p-6 text-center"
           :class="error.includes('심사') ? 'border-gold/30 bg-gold/5' : 'border-red-500/20'">
        <div v-if="error.includes('심사')" class="text-4xl mb-3">⏳</div>
        <div v-else class="text-4xl mb-3">🔍</div>
        <div :class="error.includes('심사') ? 'text-gold' : 'text-red-400'"
             class="text-sm font-semibold whitespace-pre-line">{{ error }}</div>
        <p v-if="error.includes('심사')" class="text-xs text-txt-4 mt-3">
          아뜰리에 담당자가 검토 후 승인하면 Bitcoin 각인 후 이 페이지에서 검증됩니다.
        </p>
      </div>

      <!-- 결과 -->
      <div v-if="result" class="space-y-4">
        <!-- 상태 배너 -->
        <div class="card p-4 flex items-center gap-3"
             :class="result.verification.status === 'valid' ? 'border-success/30 bg-success/5' : 'border-red-500/30 bg-red-500/5'">
          <span class="text-2xl">{{ result.verification.status === 'valid' ? '✅' : '❌' }}</span>
          <div>
            <div class="font-bold" :class="result.verification.status === 'valid' ? 'text-success-light' : 'text-red-400'">
              {{ t(`verify.status.${result.verification.status}`) }}
            </div>
            <div class="text-xs text-txt-3">
              {{ result.verification.inscribed ? t('verify.inscribed') : result.bitcoin?.ots_status === 'submitted' ? t('verify.ots_submitted') : t('verify.pending') }}
            </div>
          </div>
          <div class="ml-auto flex gap-2">
            <span class="badge" :class="result.verification.status === 'valid' ? 'badge-green' : 'badge-gray'">
              {{ result.verification.status === 'valid' ? '✓ 유효' : '✕ 폐기' }}
            </span>
            <span class="badge" :class="result.verification.inscribed ? 'badge-gold' : 'badge-gray'">
              {{ result.verification.inscribed ? '⚓ 각인' : '⏳ 대기' }}
            </span>
          </div>
        </div>

        <!-- VC 정보 -->
        <div class="card p-5">
          <h3 class="font-bold text-txt-1 mb-3">📜 W3C Verifiable Credential</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between py-2 border-b border-white/5">
              <span class="text-txt-3">VC ID</span>
              <span class="font-mono text-xs text-txt-2 max-w-[60%] truncate">{{ result.vc.vc_id }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-white/5">
              <span class="text-txt-3">Token</span>
              <span class="badge badge-purple">{{ result.vc.token_type }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-white/5">
              <span class="text-txt-3">Issuer</span>
              <span class="font-mono text-xs text-txt-2">{{ result.vc.issuer_did }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-txt-3">Issued</span>
              <span class="text-txt-2">{{ new Date(result.vc.issued_at).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>

        <!-- Merkle / BTC -->
        <div v-if="result.bitcoin" class="card p-5">
          <h3 class="font-bold text-txt-1 mb-3">🌲 {{ t('verify.merkle_title') }}</h3>
          <div class="text-sm text-txt-3 mb-3">
            {{ t('verify.batch_date') }}: <strong class="text-txt-1">{{ result.bitcoin.batch_date }}</strong>
            · {{ t('verify.leaf_index') }}: <strong class="text-txt-1">#{{ (result.bitcoin.leaf_index ?? 0) + 1 }} / {{ result.bitcoin.batch_vc_count }}</strong>
          </div>
          <div class="text-xs font-mono text-txt-4 mb-2">{{ t('verify.ots_submitted') === t(`btc.status.${result.bitcoin.ots_status}`) ? '' : t(`btc.status.${result.bitcoin.ots_status}`) }}</div>
          <div class="space-y-1 mb-3">
            <div v-for="(node, i) in (result.bitcoin.merkle_path ?? [])" :key="i" class="merkle-node">
              <div class="direction" :class="node.direction">{{ node.direction }}</div>
              <div class="merkle-hash">{{ node.hash }}</div>
            </div>
          </div>
          <div class="bg-primary/10 border border-primary/20 rounded-md px-3 py-2 font-mono text-xs">
            <span class="text-primary-light font-bold">Merkle Root: </span>
            <span class="text-txt-2">{{ result.bitcoin.merkle_root }}</span>
          </div>
          <div v-if="result.bitcoin.btc_tx_hash" class="mt-3 flex gap-2">
            <a :href="`https://mempool.space/tx/${result.bitcoin.btc_tx_hash}`" target="_blank" class="btn btn-outline btn-sm">mempool ↗</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { verifySearch } from '@/api/award'

const { t } = useI18n()
const route  = useRoute()
const query  = ref('')
const loading= ref(false)
const error  = ref('')
const result = ref<Record<string,unknown> | null>(null)

// 유효하지 않은 ID 패턴 (null, undefined, empty, 짧은 값)
const INVALID_IDS = new Set(['null', 'undefined', '', '0'])

async function doVerify() {
  const q = query.value.trim()
  error.value = ''
  result.value = null

  // null / 빈값 처리
  if (!q || q.length < 2 || INVALID_IDS.has(q)) {
    error.value = '⏳ 아직 심사 중이거나 유효하지 않은 인증서입니다.\n아뜰리에 승인 후 VC가 발행되면 검증 가능합니다.'
    query.value = ''
    return
  }

  loading.value = true
  try {
    const { data } = await verifySearch(q)
    if (data.ok) result.value = data
    else throw new Error(data.message || t('verify.not_found'))
  } catch (e: unknown) {
    const msg = (e as { response?: { status?: number } })?.response?.status === 404
      ? '인증서를 찾을 수 없습니다. 아직 심사 중이거나 발행되지 않은 자산일 수 있습니다.'
      : (e as Error).message
    error.value = msg
  }
  finally { loading.value = false }
}

onMounted(() => {
  const id = route.query.id as string
  if (id && !INVALID_IDS.has(id)) {
    query.value = id
    doVerify()
  } else if (id && INVALID_IDS.has(id)) {
    // null 등 invalid ID로 진입 시 안내만 표시
    error.value = '⏳ 아직 심사 중인 자산입니다.\n아뜰리에 승인 후 VC가 발행되면 여기서 검증할 수 있습니다.'
  }
})
</script>
