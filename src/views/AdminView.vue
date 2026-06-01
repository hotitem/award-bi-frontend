<template>
  <section class="py-12 bg-bg-0 min-h-screen">
    <div class="container">
      <h1 class="text-2xl font-black text-txt-1 mb-8">🛠 관리자 전체 현황</h1>

      <!-- 통계 카드 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div v-for="s in statsCards" :key="s.label" class="card p-5 text-center">
          <div class="text-3xl font-black text-txt-1 mb-1">{{ s.value }}</div>
          <div class="text-xs text-txt-3">{{ s.label }}</div>
        </div>
      </div>

      <!-- Bitcoin 배치 -->
      <div class="card p-5 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-txt-1">⚓ Bitcoin 배치</h2>
          <button @click="triggerBatch" :disabled="running" class="btn btn-gold btn-sm">
            {{ running ? '실행 중...' : '수동 실행' }}
          </button>
        </div>
        <div class="space-y-2">
          <div v-for="b in batches" :key="b.batch_id" class="flex items-center gap-3 py-2 border-b border-white/5">
            <div class="w-2 h-2 rounded-full" :class="b.ots_status === 'confirmed' ? 'bg-success' : 'bg-gold animate-pulse'" />
            <span class="text-sm text-txt-2">{{ b.batch_date }}</span>
            <span class="text-xs text-txt-3">{{ b.vc_count }} VCs</span>
            <span class="badge ml-auto" :class="b.ots_status === 'confirmed' ? 'badge-green' : 'badge-gold'">{{ b.ots_status }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { adminStats, adminBatches, runBatch } from '@/api/award'
import { useBtcStore } from '@/stores/btc'

const btc    = useBtcStore()
const stats  = ref<Record<string,unknown>>({})
const batches= ref<Record<string,unknown>[]>([])
const running= ref(false)

const statsCards = computed(() => [
  { label: '전체 VC',   value: (stats.value.total_vcs ?? '—').toString() },
  { label: '브랜드',    value: (stats.value.total_brands ?? '—').toString() },
  { label: '회원',      value: (stats.value.total_users ?? '—').toString() },
  { label: '배치',      value: (stats.value.total_batches ?? '—').toString() },
])

async function load() {
  const [sRes, bRes] = await Promise.allSettled([adminStats(), adminBatches()])
  if (sRes.status === 'fulfilled') stats.value = sRes.value.data?.stats ?? {}
  if (bRes.status === 'fulfilled') batches.value = bRes.value.data?.batches ?? []
}

async function triggerBatch() {
  if (!confirm('수동으로 배치를 실행하시겠습니까?')) return
  running.value = true
  try { await runBatch(); alert('✅ 배치 완료'); load() }
  catch (e: unknown) { alert((e as Error).message) }
  finally { running.value = false }
}

onMounted(load)
</script>
