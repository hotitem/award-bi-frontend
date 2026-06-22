<template>
  <section class="py-12 bg-bg-0 min-h-screen">
    <div class="container max-w-5xl">
      <!-- 권한 체크 -->
      <div v-if="!auth.isAtelier" class="max-w-sm mx-auto mt-20 text-center">
        <div class="card p-10">
          <div class="text-5xl mb-6">🎨</div>
          <h2 class="text-xl font-bold text-txt-1 mb-2">아뜰리에 관리자 전용</h2>
          <p class="text-sm text-txt-3 mb-8">권한이 있는 계정으로 로그인해 주세요.</p>
          <button @click="auth.openLogin()" class="btn btn-primary w-full py-3">로그인</button>
        </div>
      </div>

      <div v-else>
        <!-- 헤더 -->
        <header class="sticky top-0 z-20 bg-bg-0 flex flex-col md:flex-row md:items-center justify-between py-4 mb-6 gap-4 border-b border-white/5">
          <div>
            <h1 class="text-2xl font-black text-txt-1 mb-1">🎨 아뜰리에 작업대</h1>
            <p class="text-sm text-txt-3">승인 대기 중인 자산을 검토하고 Bitcoin 각인을 관리합니다.</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right hidden sm:block">
              <div class="text-xs text-txt-3">{{ auth.user?.email }}</div>
              <div class="badge badge-purple text-[10px] uppercase">{{ auth.user?.role }}</div>
            </div>
            <button @click="load" class="btn btn-outline btn-sm px-3" :disabled="loading">
              <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': loading }" />
            </button>
            <button @click="runBitcoinBatch" class="btn btn-gold btn-sm" :disabled="batchRunning">
              <BoltIcon class="w-4 h-4" />
              미배치 각인 실행
            </button>
          </div>
        </header>

        <!-- 상단 지표 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div v-for="metric in metrics" :key="metric.label" class="card p-4">
            <div class="flex items-center gap-2 text-xs text-txt-3 mb-1">
              <component :is="metric.icon" class="w-3.5 h-3.5" :class="metric.iconClass" />
              {{ metric.label }}
            </div>
            <div class="text-2xl font-black text-txt-1">{{ metric.value }}</div>
          </div>
        </div>

        <!-- 카테고리 필터 칩 -->
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            v-for="(cat, key) in CATEGORIES"
            :key="key"
            @click="selectCategory(key)"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border',
              currentCategory === key
                ? `${cat.activeBg} ${cat.activeText} border-transparent`
                : 'bg-white/5 text-txt-3 border-white/10 hover:border-white/20'
            ]"
          >
            <span>{{ cat.icon }}</span>
            <span>{{ cat.label }}</span>
            <span v-if="categoryCountFor(key) > 0"
              :class="['ml-0.5 rounded-full px-1.5 py-0.5 text-[10px]', currentCategory === key ? 'bg-black/20' : 'bg-white/10']">
              {{ categoryCountFor(key) }}
            </span>
          </button>
        </div>

        <!-- 상태 탭 -->
        <div class="flex gap-2 mb-6 border-b border-white/5 overflow-x-auto">
          <button
            v-for="tab in STATUS_TABS"
            :key="tab"
            @click="currentTab = tab; load()"
            :class="[
              'px-5 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap',
              currentTab === tab ? 'border-primary text-primary' : 'border-transparent text-txt-3 hover:text-txt-1'
            ]"
          >
            {{ tabLabel(tab) }}
            <span :class="['ml-1 text-xs rounded-full px-1.5 py-0.5', tabCount(tab) > 0 ? 'bg-primary/20 text-primary' : 'opacity-40']">
              {{ tabCount(tab) }}
            </span>
          </button>
        </div>

        <!-- 목록 로딩 -->
        <div v-if="loading && items.length === 0" class="flex justify-center py-20">
          <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- 데이터 목록 -->
        <div v-else class="space-y-4">
          <div v-for="item in items" :key="item.declaration_id"
               class="card p-6 group hover:border-white/20 transition-all">
            <div class="flex flex-col md:flex-row gap-6">

              <!-- 썸네일 -->
              <div class="w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center relative"
                   :class="getCategoryInfo(item.asset_class).thumbBg">
                <img v-if="item.asset_metadata?.image_url || item.source_url"
                     :src="item.asset_metadata?.image_url || item.source_url"
                     class="w-full h-full object-cover" />
                <span v-else class="text-3xl">{{ getCategoryInfo(item.asset_class).icon }}</span>
                <!-- 토큰 타입 뱃지 -->
                <span :class="['absolute bottom-1 right-1 text-[9px] font-black px-1 rounded',
                               item.token_category === 'NFT' ? 'bg-gold/90 text-black' : 'bg-purple-600/90 text-white']">
                  {{ item.token_category || 'SBT' }}
                </span>
              </div>

              <div class="flex-1 min-w-0">
                <!-- 제목 + 카테고리 뱃지 + 상태 -->
                <div class="flex items-start justify-between mb-3">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap mb-1">
                      <!-- 카테고리 뱃지 -->
                      <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full', getCategoryInfo(item.asset_class).badgeCls]">
                        {{ getCategoryInfo(item.asset_class).icon }} {{ getCategoryInfo(item.asset_class).label }}
                      </span>
                      <!-- asset_class -->
                      <span class="text-[10px] text-txt-4 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                        {{ item.asset_class }}
                      </span>
                    </div>
                    <h3 class="font-bold text-txt-1 text-base truncate">
                      {{ item.asset_metadata?.title || item.asset_class }}
                    </h3>
                    <div class="flex gap-2 mt-0.5">
                      <span class="text-xs text-txt-4">{{ item.brand_name || item.kei_bio_brand_slug }}</span>
                      <span v-if="item.owner_email" class="text-xs text-txt-4 opacity-60">· {{ item.owner_email }}</span>
                    </div>
                  </div>
                  <div :class="['badge py-1.5 px-4 font-bold shrink-0 ml-2', getItemStatusClass(item)]">
                    {{ getItemStatusLabel(item) }}
                  </div>
                </div>

                <!-- 카테고리별 메타데이터 -->
                <div v-if="getCategoryMeta(item).length" class="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                  <div v-for="m in getCategoryMeta(item)" :key="m.label" class="text-[11px]">
                    <span class="text-txt-4">{{ m.label }}: </span>
                    <span class="text-txt-2 font-medium">{{ m.value }}</span>
                  </div>
                </div>

                <!-- 프로세스 타임라인 -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg border border-white/5">
                  <div class="text-[11px]">
                    <div class="text-txt-4 mb-1">STEP 1. 신청 접수</div>
                    <div class="text-txt-2 font-mono">{{ item.declaration_id.slice(0, 13) }}...</div>
                    <div class="text-txt-4 mt-1">{{ formatDate(item.declared_at) }}</div>
                  </div>

                  <div class="text-[11px] border-l border-white/10 pl-4">
                    <div class="text-txt-4 mb-1">STEP 2. W3C VC 발행</div>
                    <div v-if="item.vc_id" class="text-success truncate">
                      <router-link :to="`/verify?id=${item.vc_id}`" class="hover:underline">
                        ✓ {{ item.vc_id.slice(0, 8) }}...
                      </router-link>
                    </div>
                    <div v-else class="text-txt-4 italic">대기 중</div>
                  </div>

                  <div class="text-[11px] border-l border-white/10 pl-4">
                    <div class="text-txt-4 mb-1">STEP 3. BTC 각인</div>
                    <div v-if="item.ots_status === 'confirmed'" class="flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-success"></span>
                      <span class="text-success font-bold">CONFIRMED</span>
                      <span v-if="item.btc_block_height" class="text-txt-4">#{{ item.btc_block_height }}</span>
                      <a v-if="item.ots_btc_txid" :href="`https://mempool.space/tx/${item.ots_btc_txid}`"
                         target="_blank" class="ml-1 opacity-50 hover:opacity-100 text-primary">↗ TX</a>
                    </div>
                    <div v-else-if="item.ots_status === 'submitted'" class="flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
                      <span class="text-gold">SUBMITTED</span>
                      <span class="text-txt-4 italic">(블록 확인 대기)</span>
                    </div>
                    <div v-else-if="item.batch_id" class="text-txt-4 italic">배치 등록됨</div>
                    <div v-else class="flex items-center gap-2">
                      <span class="text-txt-4 italic">배치 대기</span>
                      <button @click="runBitcoinBatch" :disabled="batchRunning"
                              class="text-[10px] px-2 py-0.5 rounded bg-gold/20 text-gold hover:bg-gold/30 transition-colors font-bold">
                        {{ batchRunning ? '처리중...' : '⚡ 즉시 실행' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 작업 버튼 -->
              <div class="flex md:flex-col gap-2 justify-center shrink-0">
                <!-- 카테고리 편집 -->
                <div class="relative">
                  <button @click="editingCat = editingCat === item.declaration_id ? null : item.declaration_id"
                          class="btn btn-outline btn-sm text-xs px-3 w-full">
                    ✏️ 카테고리
                  </button>
                  <div v-if="editingCat === item.declaration_id"
                       class="absolute right-0 top-full mt-1 z-30 bg-bg-card border border-white/10 rounded-xl shadow-xl min-w-[180px] py-1 overflow-hidden">
                    <div class="px-3 py-1.5 text-[10px] text-txt-4 uppercase tracking-wider border-b border-white/5">카테고리 선택</div>
                    <button
                      v-for="cls in ALL_CLASSES" :key="cls.value"
                      @click="changeCategory(item.declaration_id, cls.value)"
                      :class="['w-full text-left px-3 py-2 text-xs hover:bg-white/5 transition-colors',
                               item.asset_class === cls.value ? 'text-primary font-bold' : 'text-txt-2']"
                    >
                      {{ cls.label }}
                    </button>
                  </div>
                </div>
                <!-- 승인/거절 (pending만) -->
                <template v-if="item.status === 'pending'">
                  <button @click="approve(item.declaration_id)" :disabled="processing[item.declaration_id]"
                          class="btn btn-primary btn-sm px-6">
                    {{ processing[item.declaration_id] === 'approve' ? '처리 중' : '승인' }}
                  </button>
                  <button @click="reject(item.declaration_id)" :disabled="processing[item.declaration_id]"
                          class="btn btn-outline btn-sm text-red-400">
                    거절
                  </button>
                </template>
              </div>
            </div>
          </div>

          <div v-if="items.length === 0 && !loading" class="py-20 text-center text-txt-4">
            표시할 항목이 없습니다.
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getDeclarations, approveDecl, rejectDecl, runBatch, patchDeclCategory } from '@/api/award'
import { ArrowPathIcon, BoltIcon, ClockIcon, DocumentCheckIcon, ShieldCheckIcon, NoSymbolIcon } from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const loading    = ref(false)
const batchRunning = ref(false)
const currentTab = ref('all')
const currentCategory = ref('all')
const items  = ref<any[]>([])
const counts = ref<Record<string, number>>({})
const catCounts = ref<Record<string, number>>({})
const processing   = ref<Record<string, string>>({})
const editingCat   = ref<string | null>(null)   // declaration_id being edited

/* ── 카테고리 정의 ── */
const CATEGORIES: Record<string, {
  label: string; icon: string
  activeBg: string; activeText: string; badgeCls: string; thumbBg: string
}> = {
  all:          { label: '전체',     icon: '🗂',  activeBg: 'bg-white/15',        activeText: 'text-white',      badgeCls: 'bg-white/10 text-txt-2',            thumbBg: 'bg-bg-card' },
  asset:        { label: '에셋',     icon: '🎨',  activeBg: 'bg-blue-600',        activeText: 'text-white',      badgeCls: 'bg-blue-500/20 text-blue-300',      thumbBg: 'bg-blue-900/30' },
  authenticity: { label: '정품인증', icon: '✅',  activeBg: 'bg-emerald-600',     activeText: 'text-white',      badgeCls: 'bg-emerald-500/20 text-emerald-300',thumbBg: 'bg-emerald-900/30' },
  membership:   { label: '멤버십',   icon: '💎',  activeBg: 'bg-purple-600',      activeText: 'text-white',      badgeCls: 'bg-purple-500/20 text-purple-300',  thumbBg: 'bg-purple-900/30' },
  influencer:   { label: '인플루언서',icon: '⭐', activeBg: 'bg-rose-600',        activeText: 'text-white',      badgeCls: 'bg-rose-500/20 text-rose-300',      thumbBg: 'bg-rose-900/30' },
  contract:     { label: '계약',     icon: '📝',  activeBg: 'bg-sky-600',         activeText: 'text-white',      badgeCls: 'bg-sky-500/20 text-sky-300',        thumbBg: 'bg-sky-900/30' },
  campaign:     { label: '캠페인',   icon: '🎯',  activeBg: 'bg-orange-500',      activeText: 'text-white',      badgeCls: 'bg-orange-500/20 text-orange-300',  thumbBg: 'bg-orange-900/30' },
}

/* asset_class → category key */
const CLASS_TO_CAT: Record<string, string> = {
  product_design:   'asset', brand_logo: 'asset', brand_video: 'asset', model_portrait: 'asset',
  authenticity_cert:'authenticity',
  membership_cert:  'membership',
  influencer_cert:  'influencer',
  contract_cert:    'contract',
  campaign_cert:    'campaign', product_voucher: 'campaign',
}

const getCategoryInfo = (assetClass: string) => {
  const cat = CLASS_TO_CAT[assetClass] || 'asset'
  return CATEGORIES[cat] || CATEGORIES.asset
}

/* 카테고리별 카운트 */
const categoryCountFor = (key: string) => {
  if (key === 'all') return counts.value.total ?? 0
  return catCounts.value[key] ?? 0
}

/* 카테고리별 메타데이터 표시 */
const getCategoryMeta = (item: any): { label: string; value: string }[] => {
  const m = item.asset_metadata || {}
  const cat = CLASS_TO_CAT[item.asset_class]
  if (cat === 'authenticity') return [
    m.tracking_no && { label: '송장번호', value: m.tracking_no },
    m.barcode     && { label: '바코드',   value: m.barcode },
    m.verified_at && { label: '인증일',   value: shortDate(m.verified_at) },
  ].filter(Boolean) as any
  if (cat === 'membership') return [
    m.rating      && { label: '평점',   value: '★'.repeat(m.rating || 0) },
    m.review_text && { label: '리뷰',   value: String(m.review_text).slice(0, 40) + (m.review_text?.length > 40 ? '…' : '') },
    m.verified_at && { label: '인증일', value: shortDate(m.verified_at) },
  ].filter(Boolean) as any
  if (cat === 'influencer') return [
    m.platform    && { label: '플랫폼',    value: m.platform },
    m.followers   && { label: '팔로워',    value: Number(m.followers).toLocaleString() },
    m.category    && { label: '카테고리',  value: m.category },
    m.contract_id && { label: '계약 ID',   value: m.contract_id },
  ].filter(Boolean) as any
  if (cat === 'contract') return [
    m.contract_type && { label: '계약 유형', value: m.contract_type },
    m.party_a       && { label: '갑',        value: m.party_a },
    m.party_b       && { label: '을',        value: m.party_b },
    m.effective_date && { label: '효력일',   value: shortDate(m.effective_date) },
  ].filter(Boolean) as any
  if (cat === 'campaign') return [
    m.campaign_id   && { label: '캠페인 ID', value: m.campaign_id },
    m.reward_points && { label: '리워드',    value: `${m.reward_points}P` },
  ].filter(Boolean) as any
  return []
}

const STATUS_TABS = ['all', 'pending', 'vc_issued', 'btc_confirmed', 'failed'] as const

const tabLabel = (t: string) => ({
  all: '전체', pending: '승인 대기', vc_issued: 'BTC 각인 대기',
  btc_confirmed: 'BTC 각인 완료', failed: '거절됨',
}[t] ?? t)

const tabCount = (t: string) => {
  if (t === 'all') return counts.value.total ?? 0
  return counts.value[t] ?? 0
}

const formatDate  = (d: string) => new Date(d).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
const shortDate   = (d: string) => { try { return new Date(d).toLocaleDateString('ko-KR') } catch { return d } }

const statusLabel = (s: string) => ({ pending: '대기중', vc_issued: '발행완료', failed: '거절됨', approved: '승인됨' }[s] ?? s)
const statusClass = (s: string) => ({ pending: 'badge-gold', vc_issued: 'badge-purple', failed: 'badge-gray', approved: 'badge-green' }[s] ?? 'badge-gray')

const getItemStatusLabel = (item: any) => {
  if (item.status === 'vc_issued') {
    if (item.ots_status === 'confirmed') return '⛓ Bitcoin 각인 완료'
    if (item.ots_status === 'submitted') return '⏳ 각인 진행 중'
    return '✅ VC 발행완료'
  }
  return statusLabel(item.status)
}
const getItemStatusClass = (item: any) => {
  if (item.status === 'vc_issued' && item.ots_status === 'confirmed') return 'badge-green'
  if (item.status === 'vc_issued' && item.ots_status === 'submitted') return 'badge-gold'
  if (item.status === 'vc_issued') return 'badge-purple'
  return statusClass(item.status)
}

const metrics = computed(() => [
  { label: '승인 대기',          value: counts.value.pending       ?? 0, icon: ClockIcon,         iconClass: 'text-gold' },
  { label: 'VC 발행 (BTC 대기)', value: Math.max(0, (counts.value.vc_issued ?? 0) - (counts.value.btc_confirmed ?? 0)), icon: DocumentCheckIcon, iconClass: 'text-primary-light' },
  { label: 'BTC 각인 완료',      value: counts.value.btc_confirmed ?? 0, icon: ShieldCheckIcon,   iconClass: 'text-success-light' },
  { label: '거절 건수',          value: counts.value.failed        ?? 0, icon: NoSymbolIcon,      iconClass: 'text-txt-4' },
])

function selectCategory(key: string) {
  currentCategory.value = key
  currentTab.value = 'all'
  load()
}

async function load() {
  if (!auth.isAtelier) return
  loading.value = true
  try {
    const statusFilter   = currentTab.value === 'all' ? undefined : currentTab.value
    const categoryFilter = currentCategory.value === 'all' ? undefined : currentCategory.value
    const { data } = await getDeclarations(statusFilter, categoryFilter)
    items.value     = data.declarations || []
    counts.value    = data.counts || {}
    catCounts.value = data.category_counts || {}
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function approve(id: string) {
  if (!confirm('승인하시겠습니까? 즉시 VC가 발행되고 BTC 각인 배치가 시작됩니다.')) return
  processing.value[id] = 'approve'
  try {
    await approveDecl(id)
    await load()
  } catch (e: any) {
    alert('승인 실패: ' + (e.response?.data?.detail || e.message))
  } finally {
    delete processing.value[id]
  }
}

async function reject(id: string) {
  const reason = prompt('거절 사유를 입력하세요:')
  if (!reason) return
  processing.value[id] = 'reject'
  try {
    await rejectDecl(id, reason)
    await load()
  } finally {
    delete processing.value[id]
  }
}

const ALL_CLASSES = [
  { value: 'product_design',  label: '🎨 상품 디자인',    cat: 'asset' },
  { value: 'brand_logo',      label: '🎨 브랜드 로고',    cat: 'asset' },
  { value: 'brand_video',     label: '🎨 브랜드 영상',    cat: 'asset' },
  { value: 'model_portrait',  label: '🎨 모델 포트레이트', cat: 'asset' },
  { value: 'authenticity_cert', label: '✅ 정품인증',     cat: 'authenticity' },
  { value: 'membership_cert',   label: '💎 멤버십',       cat: 'membership' },
  { value: 'influencer_cert',   label: '⭐ 인플루언서',   cat: 'influencer' },
  { value: 'contract_cert',     label: '📝 계약',         cat: 'contract' },
  { value: 'campaign_cert',     label: '🎯 캠페인 SBT',  cat: 'campaign' },
  { value: 'product_voucher',   label: '🎯 상품 바우처 NFT', cat: 'campaign' },
]

async function changeCategory(id: string, asset_class: string) {
  try {
    await patchDeclCategory(id, asset_class)
    editingCat.value = null
    await load()
  } catch (e: any) {
    alert('카테고리 변경 실패: ' + (e.response?.data?.error || e.message))
  }
}

async function runBitcoinBatch() {
  if (!confirm('승인된 모든 미배치 자산을 묶어 비트코인 각인 배치를 시작하시겠습니까?')) return
  batchRunning.value = true
  try {
    const { data } = await runBatch()
    alert(data.message || '배치가 성공적으로 시작되었습니다.')
    await load()
  } catch (e: any) {
    alert('배치 실행 중 오류: ' + (e.response?.data?.detail || e.message))
  } finally {
    batchRunning.value = false
  }
}

onMounted(() => { if (auth.isAtelier) load() })
</script>
