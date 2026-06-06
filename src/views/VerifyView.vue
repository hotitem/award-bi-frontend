<template>
  <section class="py-16 bg-bg-0 min-h-screen">
    <div class="container max-w-3xl">

      <!-- 헤더 -->
      <div class="text-center mb-10">
        <div class="section-tag">🔍 VERIFICATION</div>
        <h1 class="section-title">{{ t('verify.title') }}</h1>
        <p class="text-sm text-txt-4 mt-2">VC ID, 자산 해시, 브랜드명, 제품명으로 검색할 수 있습니다</p>
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
        <div class="text-4xl mb-3">{{ error.includes('심사') ? '⏳' : '🔍' }}</div>
        <div :class="error.includes('심사') ? 'text-gold' : 'text-red-400'"
             class="text-sm font-semibold whitespace-pre-line">{{ error }}</div>
        <p v-if="error.includes('심사')" class="text-xs text-txt-4 mt-3">
          아뜰리에 담당자가 검토 후 승인하면 Bitcoin 각인 후 이 페이지에서 검증됩니다.
        </p>
      </div>

      <!-- 텍스트 검색 결과 (목록) -->
      <div v-if="searchResults.length" class="space-y-3">
        <p class="text-xs text-txt-4 mb-4">검색 결과 <strong class="text-txt-2">{{ searchResults.length }}건</strong> — 자산을 선택하면 상세 인증 추적을 볼 수 있습니다</p>
        <div v-for="item in searchResults" :key="item.vc_id"
             @click="selectResult(item.vc_id)"
             class="card p-4 cursor-pointer hover:border-primary/40 transition-all flex items-center gap-4 group">
          <img v-if="item.source_url" :src="item.source_url" class="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10" />
          <div v-else class="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-2xl border border-white/5">📄</div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-txt-1 truncate text-base">{{ item.asset_metadata?.title || item.asset_metadata?.name || item.asset_class }}</div>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <span v-if="item.brand_name" class="text-xs text-txt-4">🏷 {{ item.brand_name }}</span>
              <span class="badge badge-purple text-[10px]">{{ item.token_type }}</span>
              <!-- BTC 각인 상태 -->
              <span v-if="item.ots_status === 'confirmed'" class="badge badge-green text-[10px]">⛓ BTC 각인 완료</span>
              <span v-else-if="item.ots_status === 'submitted'" class="badge badge-gold text-[10px]">⏳ 각인 진행 중</span>
              <span v-else-if="item.batch_id" class="text-[10px] text-txt-4">배치 등록됨</span>
            </div>
            <div class="text-[10px] text-txt-4 mt-1 font-mono truncate">{{ item.vc_hash?.slice(0, 24) }}...</div>
          </div>
          <span class="text-primary text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0">추적 →</span>
        </div>
      </div>

      <!-- 단일 VC 결과 -->
      <div v-if="result" class="space-y-4">

        <!-- ── 상태 배너 ── -->
        <div class="card p-4 flex items-center gap-3"
             :class="result.verification.status === 'valid' ? 'border-success/30 bg-success/5' : 'border-red-500/30 bg-red-500/5'">
          <span class="text-2xl">{{ result.verification.status === 'valid' ? '✅' : '❌' }}</span>
          <div class="flex-1">
            <div class="font-bold" :class="result.verification.status === 'valid' ? 'text-success-light' : 'text-red-400'">
              {{ result.verification.status === 'valid' ? '유효한 인증서입니다' : '폐기된 인증서입니다' }}
            </div>
            <div class="text-xs text-txt-4 mt-0.5">
              {{ btcStatusSummary }}
            </div>
          </div>
          <div class="flex gap-2 shrink-0">
            <span class="badge" :class="result.verification.status === 'valid' ? 'badge-green' : 'badge-gray'">
              {{ result.verification.status === 'valid' ? '✓ 유효' : '✕ 폐기' }}
            </span>
            <span class="badge" :class="btcBadgeClass">{{ btcBadgeLabel }}</span>
          </div>
        </div>

        <!-- ── 자산 기본 정보 ── -->
        <div class="card p-5 flex gap-5 items-start">
          <img v-if="result.asset?.source_url" :src="result.asset.source_url"
               class="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/10" />
          <div v-else class="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-3xl">📄</div>
          <div class="flex-1 min-w-0">
            <h2 class="font-black text-txt-1 text-lg truncate">
              {{ result.asset?.asset_metadata?.title || result.asset?.asset_class || 'Asset' }}
            </h2>
            <div class="flex flex-wrap gap-2 mt-2">
              <span class="badge badge-purple">{{ result.vc.token_type }}</span>
              <span v-if="result.asset?.brand" class="text-xs text-txt-4">
                <a :href="result.asset.brand.award_url" target="_blank" class="hover:text-primary">
                  {{ result.asset.brand.name }} ↗
                </a>
              </span>
            </div>
            <p class="text-xs text-txt-4 mt-2">발행일: {{ formatDate(result.vc.issued_at) }}</p>
          </div>
        </div>

        <!-- ════════════════════════════════════════
             Bitcoin 인증 추적 타임라인
             ════════════════════════════════════════ -->
        <div class="card p-6">
          <h3 class="font-bold text-txt-1 mb-1 flex items-center gap-2">
            <span>⛓</span> Bitcoin 각인 추적
          </h3>
          <p class="text-xs text-txt-4 mb-6">
            우편 배송 추적처럼 이 자산이 Bitcoin 블록체인에 기록되기까지의 전 과정을 단계별로 확인하세요.
          </p>

          <div class="space-y-0">

            <!-- STEP 1 — 자산 등록 & VC 발행 -->
            <div class="btc-step done">
              <div class="step-icon">✅</div>
              <div class="step-line"></div>
              <div class="step-body">
                <div class="step-title">STEP 1 — 자산 등록 &amp; W3C 인증서 발급</div>
                <div class="step-desc">
                  이 자산의 <strong>고유 디지털 지문(SHA-256 해시)</strong>이 생성되었고,
                  국제 표준 <strong>W3C Verifiable Credential</strong> 인증서가 발급되었습니다.
                  발급자 서명(Ed25519)으로 위·변조가 불가능합니다.
                </div>
                <div class="step-details">
                  <div class="detail-row">
                    <span class="detail-label">VC ID</span>
                    <span class="detail-val font-mono">{{ result.vc.vc_id }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">자산 해시</span>
                    <span class="detail-val font-mono truncate">{{ result.vc.vc_hash }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">발급자</span>
                    <span class="detail-val">{{ result.vc.issuer_did }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">서명 방식</span>
                    <span class="detail-val">Ed25519Signature2020 (비대칭 암호서명)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 2 — 머클 트리 배치 등록 -->
            <div :class="['btc-step', result.bitcoin ? 'done' : 'pending']">
              <div class="step-icon">{{ result.bitcoin ? '✅' : '⏳' }}</div>
              <div class="step-line"></div>
              <div class="step-body">
                <div class="step-title">STEP 2 — 배치 묶음 등록 (머클 트리)</div>
                <div class="step-desc">
                  <template v-if="result.bitcoin">
                    같은 날 발행된 <strong>{{ result.bitcoin.batch_vc_count }}개 자산</strong>과 함께
                    하나의 배치 묶음에 포함되었습니다.
                    수학적 트리 구조(머클 트리)로 묶어 단 하나의 대표 해시(머클 루트)를 만듭니다.
                    이 자산은 묶음 내 <strong>#{{ (result.bitcoin.leaf_index ?? 0) + 1 }}번째</strong> 자산입니다.
                  </template>
                  <template v-else>
                    아직 배치 묶음에 등록되지 않았습니다. 잠시 후 자동으로 처리됩니다.
                  </template>
                </div>
                <div v-if="result.bitcoin" class="step-details">
                  <div class="detail-row">
                    <span class="detail-label">배치 날짜</span>
                    <span class="detail-val">{{ result.bitcoin.batch_date }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">내 순서</span>
                    <span class="detail-val">#{{ (result.bitcoin.leaf_index ?? 0) + 1 }} / {{ result.bitcoin.batch_vc_count }}개 자산</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">머클 경로</span>
                    <span class="detail-val">{{ (result.bitcoin.merkle_path ?? []).length }}단계 증명 경로</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 3 — OTS 캘린더 제출 -->
            <div :class="['btc-step', otsStep]">
              <div class="step-icon">{{ otsStep === 'done' ? '✅' : otsStep === 'active' ? '📡' : '⏳' }}</div>
              <div class="step-line"></div>
              <div class="step-body">
                <div class="step-title">STEP 3 — Bitcoin 타임스탬프 서버 제출</div>
                <div class="step-desc">
                  <template v-if="result.bitcoin?.ots_status">
                    배치 묶음 전체를 대표하는 <strong>머클 루트 해시</strong>가
                    Bitcoin 공인 타임스탬프 서버(OpenTimestamps 캘린더)에 제출되었습니다.
                    캘린더 서버는 이 해시를 실제 Bitcoin 트랜잭션에 포함시킵니다.
                  </template>
                  <template v-else>
                    배치 묶음이 등록되면 Bitcoin 타임스탬프 서버에 자동으로 제출됩니다.
                  </template>
                </div>
                <div v-if="result.bitcoin?.ots_status" class="step-details">
                  <div class="detail-row">
                    <span class="detail-label">캘린더 서버</span>
                    <span class="detail-val text-primary">{{ result.bitcoin.ots_status !== 'failed' ? 'alice.btc.calendar.opentimestamps.org' : '제출 실패' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">머클 루트</span>
                    <span class="detail-val font-mono truncate">{{ result.bitcoin.merkle_root }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">제출 상태</span>
                    <span :class="['detail-val font-bold', result.bitcoin.ots_status === 'confirmed' || result.bitcoin.ots_status === 'submitted' ? 'text-success' : 'text-gold']">
                      {{ otsStatusLabel }}
                    </span>
                  </div>
                  <!-- OTS 파일 다운로드 -->
                  <div class="mt-3 flex flex-wrap gap-2">
                    <a :href="`https://api.award.bi/batch/${result.bitcoin.batch_id}/proof.ots`"
                       target="_blank"
                       class="btn btn-outline btn-sm text-xs">
                      📥 OTS 증명 파일 다운로드
                    </a>
                    <a href="https://opentimestamps.org" target="_blank"
                       class="btn btn-outline btn-sm text-xs">
                      🔗 opentimestamps.org 에서 직접 검증 ↗
                    </a>
                  </div>
                  <p class="text-[10px] text-txt-4 mt-2">
                    💡 OTS 파일을 opentimestamps.org 에 업로드하면 Bitcoin 블록체인 포함 여부를 누구나 독립적으로 검증할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            <!-- STEP 4 — Bitcoin 블록 확정 -->
            <div :class="['btc-step', btcConfirmedStep, 'last']">
              <div class="step-icon">
                {{ btcConfirmedStep === 'done' ? '⛓' : btcConfirmedStep === 'active' ? '🔄' : '⏳' }}
              </div>
              <div class="step-body">
                <div class="step-title">STEP 4 — Bitcoin 블록체인 영구 기록</div>
                <div class="step-desc">
                  <template v-if="result.bitcoin?.ots_status === 'confirmed'">
                    전 세계 <strong>15,000개 이상의 Bitcoin 노드</strong>가 검증한
                    블록에 이 자산의 증거가 영구히 기록되었습니다.
                    어떤 기관도 이 기록을 삭제하거나 변조할 수 없습니다.
                  </template>
                  <template v-else-if="result.bitcoin?.ots_status === 'submitted'">
                    Bitcoin 타임스탬프 서버가 이 자산의 해시를 수신했습니다.
                    <strong>Bitcoin 블록 생성(약 10분~2시간)</strong>을 기다리고 있습니다.
                    블록이 생성되면 이 단계가 자동으로 완료됩니다.
                  </template>
                  <template v-else>
                    이전 단계가 완료되면 Bitcoin 블록체인에 기록됩니다.
                  </template>
                </div>
                <div v-if="result.bitcoin?.ots_status === 'confirmed'" class="step-details">
                  <div class="detail-row">
                    <span class="detail-label">Bitcoin 블록</span>
                    <span class="detail-val font-bold text-gold">#{{ Number(result.bitcoin.btc_block_height).toLocaleString() }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">확정 시각</span>
                    <span class="detail-val">{{ formatDate(result.bitcoin.confirmed_at) }}</span>
                  </div>
                  <!-- 외부 블록 탐색기 링크 -->
                  <div class="mt-3 flex flex-wrap gap-2">
                    <a :href="`https://mempool.space/block-height/${result.bitcoin.btc_block_height}`"
                       target="_blank" class="btn btn-gold btn-sm text-xs font-bold">
                      ⛓ mempool.space 블록 조회 ↗
                    </a>
                    <a :href="`https://blockstream.info/block-height/${result.bitcoin.btc_block_height}`"
                       target="_blank" class="btn btn-outline btn-sm text-xs">
                      Blockstream ↗
                    </a>
                  </div>
                  <p class="text-[10px] text-txt-4 mt-2">
                    💡 블록 탐색기에서 블록 높이 #{{ result.bitcoin.btc_block_height }}을 열면
                    이 자산이 포함된 배치의 타임스탬프가 포함된 Bitcoin 트랜잭션을 확인할 수 있습니다.
                  </p>
                </div>
                <div v-else-if="result.bitcoin?.ots_status === 'submitted'" class="mt-3 p-3 bg-gold/10 border border-gold/20 rounded-lg">
                  <div class="flex items-center gap-2 text-gold text-xs font-semibold">
                    <span class="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
                    Bitcoin 블록 확정 대기 중 — 보통 10분~2시간 소요됩니다
                  </div>
                </div>
              </div>
            </div>

          </div><!-- end timeline -->
        </div><!-- end BTC card -->

        <!-- ── 검증 방법 안내 (접힘) ── -->
        <details class="card p-5 group cursor-pointer">
          <summary class="font-bold text-txt-1 text-sm list-none flex justify-between items-center">
            <span>❓ 이 인증서를 직접 검증하려면?</span>
            <span class="text-txt-4 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div class="mt-4 space-y-4 text-sm text-txt-3">
            <div class="p-3 bg-white/5 rounded-lg">
              <p class="font-semibold text-txt-2 mb-1">🔑 방법 1 — DID 서명 검증</p>
              <p>발급자의 공개키가 <code class="text-primary text-xs">https://kei.bio/.well-known/did.json</code>에 공개되어 있습니다.
              이 공개키로 이 VC의 Ed25519 서명을 직접 수학적으로 검증할 수 있습니다.</p>
            </div>
            <div class="p-3 bg-white/5 rounded-lg">
              <p class="font-semibold text-txt-2 mb-1">⛓ 방법 2 — Bitcoin OTS 검증</p>
              <p>위의 <strong>OTS 증명 파일</strong>을 다운로드한 후,
              <a href="https://opentimestamps.org" target="_blank" class="text-primary hover:underline">opentimestamps.org</a>에
              업로드하면 이 자산이 실제로 Bitcoin 블록체인에 기록된 시각을 독립적으로 검증할 수 있습니다.
              award.bi를 신뢰하지 않아도 됩니다.</p>
            </div>
            <div class="p-3 bg-white/5 rounded-lg">
              <p class="font-semibold text-txt-2 mb-1">🌲 방법 3 — 머클 경로 직접 검증</p>
              <p>자산 해시(<code class="text-xs font-mono text-primary">{{ result.vc.vc_hash?.slice(0,16) }}...</code>)부터
              머클 루트까지의 경로를 SHA-256 해시 연산으로 직접 추적할 수 있습니다.
              누구나 이 수학적 연산을 직접 실행하여 포함 여부를 확인할 수 있습니다.</p>
            </div>
          </div>
        </details>

      </div><!-- end result -->

    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { verifySearch, verifyById } from '@/api/award'

const { t } = useI18n()
const route        = useRoute()
const query        = ref('')
const loading      = ref(false)
const error        = ref('')
const result       = ref<Record<string, any> | null>(null)
const searchResults = ref<any[]>([])

const INVALID_IDS = new Set(['null', 'undefined', '', '0'])

const formatDate = (d: string) => d ? new Date(d).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }) : '-'

// BTC 상태별 computed
const otsStep = computed(() => {
  const s = result.value?.bitcoin?.ots_status
  if (!result.value?.bitcoin) return 'pending'
  if (s === 'confirmed' || s === 'submitted') return 'done'
  if (s === 'failed') return 'error'
  return 'pending'
})

const btcConfirmedStep = computed(() => {
  const s = result.value?.bitcoin?.ots_status
  if (s === 'confirmed') return 'done'
  if (s === 'submitted') return 'active'
  return 'pending'
})

const btcBadgeClass = computed(() => {
  const s = result.value?.bitcoin?.ots_status
  if (s === 'confirmed') return 'badge-green'
  if (s === 'submitted') return 'badge-gold'
  return 'badge-gray'
})

const btcBadgeLabel = computed(() => {
  const s = result.value?.bitcoin?.ots_status
  if (s === 'confirmed') return '⛓ Bitcoin 각인 완료'
  if (s === 'submitted') return '⏳ 블록 확정 대기'
  if (result.value?.bitcoin) return '📋 배치 등록됨'
  return '📋 각인 대기'
})

const btcStatusSummary = computed(() => {
  const s = result.value?.bitcoin?.ots_status
  const height = result.value?.bitcoin?.btc_block_height
  if (s === 'confirmed') return `Bitcoin 블록 #${Number(height).toLocaleString()}에 영구 기록됨`
  if (s === 'submitted') return 'Bitcoin 타임스탬프 서버에 제출됨 — 블록 확정 대기 중'
  if (result.value?.bitcoin) return 'Bitcoin 각인 배치에 포함됨'
  return 'Bitcoin 각인 준비 중'
})

const otsStatusLabel = computed(() => {
  const s = result.value?.bitcoin?.ots_status
  if (s === 'confirmed') return '✅ 블록 확정 완료'
  if (s === 'submitted') return '📡 제출 완료 — 블록 대기 중'
  if (s === 'failed')    return '❌ 제출 실패 (재시도 예정)'
  return '⏳ 준비 중'
})

async function doVerify() {
  const q = query.value.trim()
  error.value = ''
  result.value = null
  searchResults.value = []

  if (!q || q.length < 2 || INVALID_IDS.has(q)) {
    error.value = '⏳ 아직 심사 중이거나 유효하지 않은 인증서입니다.\n아뜰리에 승인 후 VC가 발행되면 검증 가능합니다.'
    query.value = ''
    return
  }

  loading.value = true
  try {
    const { data } = await verifySearch(q)
    if (data.ok && data.results) {
      searchResults.value = data.results
    } else if (data.ok) {
      result.value = data
    } else {
      throw new Error(data.message || t('verify.not_found'))
    }
  } catch (e: any) {
    const status = e.response?.status
    error.value = status === 404
      ? '인증서를 찾을 수 없습니다. 아직 심사 중이거나 발행되지 않은 자산일 수 있습니다.'
      : e.message
  } finally {
    loading.value = false
  }
}

async function selectResult(vcId: string) {
  searchResults.value = []
  query.value = vcId
  loading.value = true
  try {
    const { data } = await verifyById(vcId)
    if (data.ok) result.value = data
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const id = route.query.id as string
  if (id && !INVALID_IDS.has(id)) {
    query.value = id
    doVerify()
  } else if (id && INVALID_IDS.has(id)) {
    error.value = '⏳ 아직 심사 중인 자산입니다.\n아뜰리에 승인 후 VC가 발행되면 여기서 검증할 수 있습니다.'
  }
})
</script>

<style scoped>
/* ── BTC 타임라인 스타일 ── */
.btc-step {
  display: flex;
  gap: 16px;
  padding-bottom: 0;
  position: relative;
}

.step-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  position: relative;
  z-index: 1;
}

.btc-step.done .step-icon {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.3);
}
.btc-step.active .step-icon {
  background: rgba(234, 179, 8, 0.12);
  border-color: rgba(234, 179, 8, 0.3);
}
.btc-step.pending .step-icon {
  opacity: 0.4;
}

.step-line {
  position: absolute;
  left: 17px;
  top: 36px;
  width: 2px;
  height: calc(100% - 8px);
  background: rgba(255,255,255,0.06);
  z-index: 0;
}
.btc-step.done .step-line {
  background: rgba(34, 197, 94, 0.25);
}

.step-body {
  flex: 1;
  min-width: 0;
  padding-bottom: 28px;
}
.btc-step.last .step-body {
  padding-bottom: 0;
}

.step-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--txt-1);
  margin-bottom: 6px;
  padding-top: 6px;
}
.btc-step.pending .step-title {
  opacity: 0.4;
}

.step-desc {
  font-size: 12px;
  color: var(--txt-3, #94a3b8);
  line-height: 1.7;
  margin-bottom: 10px;
}
.btc-step.pending .step-desc {
  opacity: 0.4;
}

.step-details {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 11px;
}

.detail-row {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  align-items: flex-start;
}
.detail-row:last-child { border-bottom: none; }

.detail-label {
  color: var(--txt-4, #64748b);
  flex-shrink: 0;
  width: 80px;
  padding-top: 1px;
}
.detail-val {
  color: var(--txt-2, #cbd5e1);
  word-break: break-all;
  flex: 1;
}
</style>
