<template>
  <!-- SEO meta -->
  <teleport to="head">
    <title>award.bi — K-Beauty 자산 인증 플랫폼</title>
    <meta name="description" content="K-Beauty 브랜드 자산을 W3C VC로 인증하고 Bitcoin에 영구 각인합니다. SBT · NFT · 디지털 아뜰리에">
    <meta property="og:title" content="award.bi — K-Beauty Digital Asset Inscription">
    <meta property="og:description" content="W3C VC · SBT · NFT · Bitcoin OpenTimestamps">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "award.bi",
      "url": "https://award.bi",
      "description": "K-Beauty 브랜드 자산 W3C VC 인증 및 Bitcoin 각인 플랫폼",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://award.bi/verify?id={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
    </script>
  </teleport>

  <!-- ── Hero ─────────────────────────────────────────── -->
  <section class="relative min-h-[90vh] flex items-center overflow-hidden bg-bg-0">
    <div class="orb orb-purple w-[700px] h-[700px] -top-60 -left-40 opacity-15" />
    <div class="orb orb-gold   w-[400px] h-[400px] top-1/2 right-0  opacity-10" />

    <div class="container relative z-10 py-20">
      <div class="max-w-2xl">
        <div class="section-tag">⭐ K-BEAUTY DIGITAL INSCRIPTION PLATFORM</div>
        <h1 class="text-5xl md:text-7xl font-black leading-[1.05] mb-6">
          <span class="text-gradient">BEAUTY</span><br>
          <span class="text-gradient">IDENTITY</span><br>
          <span class="text-txt-2 text-4xl md:text-5xl">AWARD</span>
        </h1>
        <p class="text-lg text-txt-3 mb-8 leading-relaxed">
          {{ t('hero.sub') }}
        </p>
        <div class="flex flex-wrap gap-3">
          <RouterLink to="/my/issue" class="btn btn-primary text-base px-7 py-3.5">
            {{ t('hero.cta_primary') }}
          </RouterLink>
          <RouterLink to="/verify" class="btn btn-outline text-base px-7 py-3.5">
            {{ t('hero.cta_secondary') }}
          </RouterLink>
        </div>
      </div>

      <!-- 통계 카드 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
        <div v-for="s in stats" :key="s.label" class="card p-5 text-center">
          <div class="text-3xl font-black mb-1" :class="s.color">{{ s.value }}</div>
          <div class="text-xs text-txt-3">{{ s.label }}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── ESCO Featured Brand ────────────────────────────── -->
  <section class="py-20 bg-bg-1">
    <div class="container">
      <div class="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <div class="section-tag">🏆 FEATURED BRAND</div>
          <h2 class="section-title">ESCO Cosmetics <span>자산 각인 현황</span></h2>
          <p class="text-sm text-txt-3 mt-1">kei.bio 인증 요청 → award.bi VC 발행 → Bitcoin 각인 실시간 추적</p>
        </div>
        <RouterLink to="/brand/esco" class="btn btn-outline btn-sm shrink-0">전체 보기 →</RouterLink>
      </div>

      <!-- ESCO 요약 배너 -->
      <div v-if="escoStats" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div class="card p-4 text-center border-primary/20">
          <div class="text-2xl font-black text-primary-light">{{ escoStats.total }}</div>
          <div class="text-xs text-txt-3">전체 자산</div>
        </div>
        <div class="card p-4 text-center border-success/20">
          <div class="text-2xl font-black text-success-light">{{ escoStats.vc_issued }}</div>
          <div class="text-xs text-txt-3">VC 발행 완료</div>
        </div>
        <div class="card p-4 text-center border-gold/20">
          <div class="text-2xl font-black text-gold">{{ escoStats.submitted }}</div>
          <div class="text-xs text-txt-3">Bitcoin 제출 중</div>
        </div>
        <div class="card p-4 text-center border-success/20">
          <div class="text-2xl font-black text-success">{{ escoStats.confirmed }}</div>
          <div class="text-xs text-txt-3">각인 완료</div>
        </div>
      </div>

      <!-- OTS 배치 진행 상태 -->
      <div v-if="escoBatch" class="card p-5 mb-6 flex items-center gap-4 flex-wrap">
        <div class="flex items-center gap-2.5 flex-1 min-w-0">
          <div class="w-3 h-3 rounded-full bg-gold animate-pulse shrink-0" />
          <div>
            <div class="text-sm font-semibold text-txt-1">Bitcoin 배치 {{ escoBatch.batch_date }}</div>
            <div class="text-xs font-mono text-txt-3 truncate">Merkle Root: {{ escoBatch.merkle_root?.slice(0,32) }}...</div>
          </div>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span class="badge badge-gold">📡 OTS 캘린더 제출 완료</span>
          <span class="text-xs text-txt-3">{{ escoBatch.vc_count }}개 VC 묶음</span>
        </div>
      </div>

      <!-- 자산 목록 (6개 표시) -->
      <div v-if="escoAssets.length" class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="asset in escoAssets.slice(0, 6)" :key="asset.declaration_id"
          class="card-hover p-4 cursor-pointer"
          @click="router.push(`/verify?id=${asset.vc_id}`)"
        >
          <!-- 자산 아이콘 -->
          <div class="w-full aspect-[4/3] rounded-md bg-bg-0 border border-white/5 flex items-center justify-center mb-3 overflow-hidden">
            <img v-if="asset.source_url" :src="asset.source_url" class="w-full h-full object-cover" :alt="asset.asset_metadata?.name" />
            <div v-else class="text-center">
              <div class="text-3xl mb-1">{{ assetIcon(asset.asset_class) }}</div>
              <div class="text-[10px] text-txt-4 uppercase tracking-wider">{{ asset.asset_class }}</div>
            </div>
          </div>

          <!-- 자산 정보 -->
          <div class="text-sm font-semibold text-txt-1 mb-1.5 truncate">
            {{ asset.asset_metadata?.title || asset.asset_metadata?.name || asset.asset_class }}
          </div>

          <!-- 배지 -->
          <div class="flex flex-wrap gap-1.5 mb-2">
            <span class="badge badge-purple text-[10px]">{{ asset.token_category }}</span>
            <span v-if="asset.vc_id" class="badge badge-green text-[10px]">✓ VC</span>
          </div>

          <!-- Bitcoin 상태 -->
          <div class="flex items-center gap-1.5 text-[10px]">
            <div class="w-1.5 h-1.5 rounded-full"
                 :class="asset.ots_status === 'confirmed' ? 'bg-success' : asset.ots_status === 'submitted' ? 'bg-gold animate-pulse' : 'bg-txt-4'" />
            <span class="text-txt-3">
              {{ asset.ots_status === 'confirmed' ? '⚓ 각인 완료' : asset.ots_status === 'submitted' ? '📡 BTC 제출 중' : '⏳ 대기' }}
            </span>
          </div>

          <!-- VC ID (truncated) -->
          <div class="mt-2 font-mono text-[9px] text-txt-4 truncate">{{ asset.vc_id }}</div>
        </div>
      </div>

      <!-- 스켈레톤 로딩 -->
      <div v-else-if="escoLoading" class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="card p-4 animate-pulse">
          <div class="w-full aspect-[4/3] rounded-md bg-white/5 mb-3" />
          <div class="h-4 bg-white/5 rounded mb-2 w-3/4" />
          <div class="h-3 bg-white/5 rounded w-1/2" />
        </div>
      </div>
    </div>
  </section>

  <!-- ── Bitcoin 각인 섹션 ──────────────────────────────── -->
  <section class="py-20 bg-bg-0">
    <div class="container">
      <div class="text-center mb-12">
        <div class="section-tag">⚓ BITCOIN INSCRIPTION</div>
        <h2 class="section-title">{{ t('btc.title') }}</h2>
        <p class="text-txt-3 max-w-xl mx-auto">{{ t('btc.subtitle') }}</p>
      </div>

      <!-- 카운트다운 + 5단계 플로우 -->
      <div class="grid md:grid-cols-2 gap-8 mb-12 max-w-3xl mx-auto">
        <div class="card p-6 text-center">
          <div class="text-xs text-txt-3 mb-2">{{ t('btc.next_batch') }}</div>
          <div class="text-5xl font-black font-mono text-gold mb-3">{{ countdown }}</div>
          <div class="text-xs text-txt-4">매일 자정 KST (15:00 UTC)</div>
        </div>
        <div class="card p-6">
          <div class="text-xs font-semibold text-txt-3 mb-3 uppercase tracking-wider">일일 배치 플로우</div>
          <div class="space-y-2">
            <div v-for="(step, i) in batchFlow" :key="i" class="flex items-center gap-3 text-sm">
              <div class="w-6 h-6 rounded-full bg-primary/20 text-primary-light flex items-center justify-center text-xs font-bold shrink-0">{{ i+1 }}</div>
              <span class="text-txt-2">{{ step }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 최근 배치 목록 -->
      <div class="space-y-2 max-w-2xl mx-auto">
        <div v-for="batch in btc.latestBatches.slice(0,5)" :key="batch.batch_id"
             class="card p-4 flex items-center gap-4">
          <div class="w-2.5 h-2.5 rounded-full shrink-0"
               :class="batch.ots_status === 'confirmed' ? 'bg-success' : batch.ots_status === 'submitted' ? 'bg-gold animate-pulse' : 'bg-txt-4'" />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-txt-1">{{ batch.batch_date }}</div>
            <div class="text-[10px] text-txt-4 font-mono truncate">{{ batch.batch_id }}</div>
          </div>
          <div class="text-right shrink-0">
            <div class="badge text-[10px]" :class="statusBadge(batch.ots_status)">
              {{ t(`btc.status.${batch.ots_status}`) }}
            </div>
            <div class="text-[10px] text-txt-4 mt-1">{{ batch.vc_count }} VCs</div>
          </div>
        </div>
        <p v-if="!btc.latestBatches.length && !btcLoading" class="text-center text-txt-4 py-4 text-sm">배치 데이터 없음</p>
      </div>
    </div>
  </section>

  <!-- ── 인증 여정 5단계 ────────────────────────────────── -->
  <section class="py-20 bg-bg-1">
    <div class="container">
      <div class="text-center mb-12">
        <div class="section-tag">📜 JOURNEY</div>
        <h2 class="section-title">인증 여정 <span>5단계</span></h2>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div v-for="(step, i) in journey" :key="i" class="card p-5 text-center">
          <div class="text-3xl mb-3">{{ step.icon }}</div>
          <div class="text-[10px] font-bold text-primary-light mb-1 uppercase tracking-wider">STEP {{ i + 1 }}</div>
          <div class="text-sm font-semibold text-txt-1 mb-1">{{ step.title }}</div>
          <div class="text-[11px] text-txt-3">{{ step.desc }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useBtcStore } from '@/stores/btc'
import { getBrandAssets, getStats, verifyBtcLatest } from '@/api/award'
import axios from 'axios'

const { t }  = useI18n()
const btc    = useBtcStore()
const router = useRouter()

// ── ESCO 데이터 ──────────────────────────────────────────
const escoAssets  = ref<Record<string, unknown>[]>([])
const escoLoading = ref(true)
const escoBatch   = ref<Record<string, unknown> | null>(null)
const escoStats   = ref({ total: 0, vc_issued: 0, submitted: 0, confirmed: 0 })
const btcLoading  = ref(false)

async function loadEsco() {
  try {
    const { data } = await getBrandAssets('esco', 20)
    const assets = data.assets ?? []
    escoAssets.value = assets

    // 통계 집계
    escoStats.value = {
      total:     assets.length,
      vc_issued: assets.filter((a: Record<string, unknown>) => a.vc_id).length,
      submitted: assets.filter((a: Record<string, unknown>) => a.ots_status === 'submitted').length,
      confirmed: assets.filter((a: Record<string, unknown>) => a.ots_status === 'confirmed').length,
    }

    // 배치 정보 (첫 번째 제출된 배치)
    const withBatch = assets.find((a: Record<string, unknown>) => a.ots_status === 'submitted' || a.ots_status === 'confirmed')
    if (withBatch) {
      // batch 상세 조회
      const bRes = await verifyBtcLatest()
      const batches = bRes.data?.recent_batches ?? []
      escoBatch.value = batches.find((b: Record<string, unknown>) =>
        b.ots_status === 'submitted' || b.ots_status === 'confirmed'
      ) ?? null
    }
  } catch (e) {
    console.warn('ESCO 데이터 로드 실패:', e)
  } finally {
    escoLoading.value = false
  }
}

// ── 전체 통계 ────────────────────────────────────────────
const stats = computed(() => [
  { label: t('hero.stats.vcs'),       value: btc.totalVcs ? btc.totalVcs.toLocaleString() : '—',        color: 'text-primary-light' },
  { label: t('hero.stats.inscribed'), value: btc.totalInscribed ? btc.totalInscribed.toLocaleString() : '—', color: 'text-gold' },
  { label: t('hero.stats.brands'),    value: btc.totalBrands ? btc.totalBrands.toLocaleString() : '—',   color: 'text-success-light' },
  { label: t('hero.stats.block'),     value: btc.blockHeight ? `#${btc.blockHeight.toLocaleString()}` : '—', color: 'text-txt-2' },
])

// ── 카운트다운 ────────────────────────────────────────────
const countdown = computed(() => {
  const ms = btc.nextBatchMs
  if (!ms) return '--:--:--'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
})
const timer = setInterval(() => { btc.nextBatchMs = Math.max(0, btc.nextBatchMs - 1000) }, 1000)
onUnmounted(() => clearInterval(timer))

function statusBadge(status: string) {
  return status === 'confirmed' ? 'badge-green' : status === 'submitted' ? 'badge-gold' : 'badge-gray'
}

function assetIcon(cls: string) {
  const icons: Record<string, string> = {
    product_design: '🧴', brand_logo: '🏷', brand_video: '🎬', model_portrait: '👤',
    packaging: '📦', export_certificate: '🌍',
  }
  return icons[cls] ?? '📁'
}

const batchFlow = [
  'kei.bio 인증 신청 수신',
  'asset_declarations 생성 (pending)',
  '아뜰리에 승인 → W3C VC 발행',
  'Merkle Tree 구성 → OTS 캘린더 제출',
  'Bitcoin 블록 확정 → 영구 각인',
]

const journey = [
  { icon: '👤', title: '회원가입',      desc: 'ssum.app OTP 로그인' },
  { icon: '📁', title: '자산 등록',     desc: 'SBT/NFT 파일 업로드' },
  { icon: '🔍', title: '아뜰리에 검토', desc: '전문가 승인 프로세스' },
  { icon: '📜', title: 'W3C VC 발행',  desc: 'Ed25519 서명 인증서' },
  { icon: '⚓', title: 'Bitcoin 각인', desc: 'Merkle Root 영구 기록' },
]

onMounted(() => { loadEsco() })
</script>
