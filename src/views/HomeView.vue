<template>
  <!-- SEO meta (동적) -->
  <teleport to="head">
    <title>award.bi — {{ t('hero.tag') }}</title>
    <meta name="description" :content="t('hero.sub').replace(/\n/g,' ')">
    <meta property="og:title" :content="'award.bi — ' + t('hero.tag')">
    <meta property="og:description" :content="t('hero.sub').replace(/\n/g,' ')">
  </teleport>

  <!-- Hero -->
  <section class="relative min-h-[88vh] flex items-center overflow-hidden bg-bg-0">
    <div class="orb orb-purple w-[600px] h-[600px] -top-40 -left-40 opacity-20" />
    <div class="orb orb-gold   w-[400px] h-[400px]  top-1/2 right-0 opacity-10" />

    <div class="container relative z-10 py-20">
      <div class="max-w-2xl">
        <div class="section-tag">⭐ {{ t('hero.tag') }}</div>
        <h1 class="text-5xl md:text-7xl font-black leading-none mb-6 whitespace-pre-line">
          <span class="text-gradient">{{ t('hero.title') }}</span>
        </h1>
        <p class="text-lg text-txt-3 mb-8 whitespace-pre-line leading-relaxed">{{ t('hero.sub') }}</p>
        <div class="flex flex-wrap gap-3">
          <RouterLink to="/my/issue" class="btn btn-primary text-base px-6 py-3">{{ t('hero.cta_primary') }}</RouterLink>
          <RouterLink to="/verify"   class="btn btn-outline text-base px-6 py-3">{{ t('hero.cta_secondary') }}</RouterLink>
        </div>
      </div>

      <!-- 통계 카드 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
        <div v-for="s in stats" :key="s.label" class="card p-4 text-center">
          <div class="text-2xl font-black text-txt-1 mb-1">{{ s.value }}</div>
          <div class="text-xs text-txt-3">{{ s.label }}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Bitcoin 각인 섹션 -->
  <section class="py-20 bg-bg-1">
    <div class="container">
      <div class="text-center mb-12">
        <div class="section-tag">⚓ BITCOIN INSCRIPTION</div>
        <h2 class="section-title">{{ t('btc.title') }}</h2>
        <p class="text-txt-3 max-w-xl mx-auto">{{ t('btc.subtitle') }}</p>
      </div>

      <!-- 다음 배치 카운트다운 -->
      <div class="max-w-sm mx-auto text-center mb-12 card p-6">
        <div class="text-xs text-txt-3 mb-2">{{ t('btc.next_batch') }}</div>
        <div class="text-4xl font-black font-mono text-gold">{{ countdown }}</div>
      </div>

      <!-- 최근 배치 -->
      <div class="space-y-3 max-w-2xl mx-auto">
        <div
          v-for="batch in btc.latestBatches.slice(0,5)" :key="batch.batch_id"
          class="card p-4 flex items-center gap-4"
        >
          <div class="w-2.5 h-2.5 rounded-full flex-shrink-0"
               :class="batch.ots_status === 'confirmed' ? 'bg-success' : batch.ots_status === 'submitted' ? 'bg-gold animate-pulse' : 'bg-txt-4'" />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-txt-1">{{ batch.batch_date }}</div>
            <div class="text-xs text-txt-3 font-mono truncate">{{ batch.batch_id }}</div>
          </div>
          <div class="text-right shrink-0">
            <div class="badge" :class="statusBadge(batch.ots_status)">{{ t(`btc.status.${batch.ots_status}`) }}</div>
            <div class="text-xs text-txt-3 mt-1">{{ batch.vc_count }} VCs</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 5단계 인증 여정 -->
  <section class="py-20 bg-bg-0">
    <div class="container">
      <div class="text-center mb-12">
        <div class="section-tag">📜 JOURNEY</div>
        <h2 class="section-title">인증 여정 <span>5단계</span></h2>
      </div>
      <div class="grid md:grid-cols-5 gap-4">
        <div v-for="(step, i) in journey" :key="i" class="card p-5 text-center">
          <div class="text-3xl mb-3">{{ step.icon }}</div>
          <div class="text-xs font-bold text-primary-light mb-1">STEP {{ i + 1 }}</div>
          <div class="text-sm font-semibold text-txt-1 mb-1">{{ step.title }}</div>
          <div class="text-xs text-txt-3">{{ step.desc }}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- JSON-LD 구조화 데이터 -->
  <teleport to="head">
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
</template>

<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useBtcStore } from '@/stores/btc'

const { t } = useI18n()
const btc   = useBtcStore()

const stats = computed(() => [
  { label: t('hero.stats.vcs'),       value: btc.totalVcs.toLocaleString() || '—' },
  { label: t('hero.stats.inscribed'), value: btc.totalInscribed.toLocaleString() || '—' },
  { label: t('hero.stats.brands'),    value: btc.totalBrands.toLocaleString() || '—' },
  { label: t('hero.stats.block'),     value: btc.blockHeight ? `#${btc.blockHeight.toLocaleString()}` : '—' },
])

const countdown = computed(() => {
  const ms = btc.nextBatchMs
  if (!ms) return '--:--:--'
  const h  = Math.floor(ms / 3600000)
  const m  = Math.floor((ms % 3600000) / 60000)
  const s  = Math.floor((ms % 60000) / 1000)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
})

// 1초마다 카운트다운 갱신
const timer = setInterval(() => { btc.nextBatchMs = Math.max(0, btc.nextBatchMs - 1000) }, 1000)
onUnmounted(() => clearInterval(timer))

function statusBadge(status: string) {
  return status === 'confirmed' ? 'badge-green' : status === 'submitted' ? 'badge-gold' : 'badge-gray'
}

const journey = [
  { icon: '👤', title: '회원가입',     desc: 'ssum.app OTP 로그인' },
  { icon: '📁', title: '자산 등록',    desc: 'SBT/NFT 파일 업로드' },
  { icon: '🔍', title: '아뜰리에 검토', desc: '전문가 승인 프로세스' },
  { icon: '📜', title: 'W3C VC 발행', desc: 'Ed25519 서명 인증서' },
  { icon: '⚓', title: 'Bitcoin 각인', desc: 'Merkle Root 영구 기록' },
]
</script>
