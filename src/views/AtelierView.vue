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
        <header class="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
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

        <!-- 탭 네비게이션 -->
        <div class="flex gap-2 mb-6 border-b border-white/5">
          <button 
            v-for="tab in ['pending', 'vc_issued', 'failed', 'all']" 
            :key="tab"
            @click="currentTab = tab; load()"
            :class="[
              'px-6 py-3 text-sm font-bold transition-all border-b-2',
              currentTab === tab ? 'border-primary text-primary' : 'border-transparent text-txt-3 hover:text-txt-1'
            ]"
          >
            {{ tabLabel(tab) }}
            <span class="ml-1 opacity-50 text-xs">{{ (counts && typeof counts[tab] === 'number') ? counts[tab] : 0 }}</span>
          </button>
        </div>

        <!-- 목록 로딩 -->
        <div v-if="loading && items.length === 0" class="flex justify-center py-20">
          <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- 데이터 목록 -->
        <div v-else class="space-y-4">
          <div v-for="item in items" :key="item.declaration_id" class="card p-6 group hover:border-white/20 transition-all">
            <div class="flex flex-col md:flex-row gap-6">
              <!-- 썸네일 -->
              <div class="w-24 h-24 shrink-0 bg-bg-card rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
                <img v-if="item.source_url" :src="item.source_url" class="w-full h-full object-cover" />
                <span v-else class="text-3xl">📄</span>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h3 class="font-bold text-txt-1 text-lg truncate">{{ item.asset_metadata?.title || item.asset_class }}</h3>
                    <div class="flex gap-2 mt-1">
                      <span class="text-xs text-txt-4">{{ item.brand_name }}</span>
                      <span class="text-xs text-txt-4 opacity-50">|</span>
                      <span class="text-xs text-txt-4">{{ item.asset_class }}</span>
                    </div>
                  </div>
                  <div :class="['badge py-1 px-3', getItemStatusClass(item)]">{{ getItemStatusLabel(item) }}</div>
                </div>

                <!-- 프로세스 타임라인 -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg border border-white/5">
                  <div class="text-[11px]">
                    <div class="text-txt-4 mb-1">STEP 1. 신청 접수</div>
                    <div class="text-txt-2 font-mono">{{ item.declaration_id.slice(0,13) }}...</div>
                    <div class="text-txt-4 mt-1">{{ formatDate(item.declared_at) }}</div>
                  </div>
                  
                  <div class="text-[11px] border-l border-white/10 pl-4">
                    <div class="text-txt-4 mb-1">STEP 2. W3C VC 발행</div>
                    <div v-if="item.vc_id" class="text-success truncate">
                      <router-link :to="`/verify?id=${item.vc_id}`" class="hover:underline">✓ {{ item.vc_id.slice(0,8) }}...</router-link>
                    </div>
                    <div v-else class="text-txt-4 italic">대기 중</div>
                  </div>

                  <div class="text-[11px] border-l border-white/10 pl-4">
                    <div class="text-txt-4 mb-1">STEP 3. BTC 각인</div>
                    <div v-if="item.ots_status" class="flex items-center gap-1.5">
                      <span :class="['w-1.5 h-1.5 rounded-full', item.ots_status === 'confirmed' ? 'bg-success' : 'bg-gold animate-pulse']"></span>
                      <span :class="item.ots_status === 'confirmed' ? 'text-success' : 'text-gold'">{{ item.ots_status.toUpperCase() }}</span>
                      <a v-if="item.btc_tx_hash" :href="`https://mempool.space/tx/${item.btc_tx_hash}`" target="_blank" class="ml-1 opacity-50 hover:opacity-100">↗</a>
                    </div>
                    <div v-else class="text-txt-4 italic">배치 대기</div>
                  </div>
                </div>
              </div>

              <!-- 작업 버튼 (승인 대기시에만 노출) -->
              <div v-if="item.status === 'pending'" class="flex md:flex-col gap-2 justify-center shrink-0">
                <button 
                  @click="approve(item.declaration_id)" 
                  :disabled="processing[item.declaration_id]"
                  class="btn btn-primary btn-sm px-6"
                >
                  {{ processing[item.declaration_id] === 'approve' ? '처리 중' : '승인' }}
                </button>
                <button 
                  @click="reject(item.declaration_id)" 
                  :disabled="processing[item.declaration_id]"
                  class="btn btn-outline btn-sm text-red-400"
                >
                  거절
                </button>
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
import { getDeclarations, approveDeclaration, rejectDeclaration, runBatch } from '@/api/award'
import { ArrowPathIcon, BoltIcon, ClockIcon, DocumentCheckIcon, ShieldCheckIcon, NoSymbolIcon } from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const loading = ref(false)
const batchRunning = ref(false)
const currentTab = ref('pending')
const items = ref<any[]>([])
const counts = ref<Record<string, number>>({})
const processing = ref<Record<string, string>>({})

const tabLabel = (t: string) => ({ pending: '승인 대기', vc_issued: 'VC 발행완료', failed: '거절됨', all: '전체' }[t])
const statusLabel = (s: string) => ({ pending: '대기중', vc_issued: '발행완료', failed: '거절됨', approved: '승인됨' }[s])
const statusClass = (s: string) => ({ pending: 'badge-gold', vc_issued: 'badge-purple', failed: 'badge-gray', approved: 'badge-green' }[s])
const formatDate = (d: string) => new Date(d).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })

const getItemStatusLabel = (item: any) => {
  if (item.status === 'vc_issued' && item.ots_status === 'confirmed') return '각인완료'
  if (item.status === 'vc_issued' && item.ots_status === 'submitted') return '각인진행중'
  return statusLabel(item.status)
}
const getItemStatusClass = (item: any) => {
  if (item.status === 'vc_issued' && item.ots_status === 'confirmed') return 'badge-green'
  if (item.status === 'vc_issued' && item.ots_status === 'submitted') return 'badge-gold'
  return statusClass(item.status)
}

const metrics = computed(() => {
  return [
    { label: '승인 대기', value: counts.value.pending || 0, icon: ClockIcon, iconClass: 'text-gold' },
    { label: 'VC 발행 (배치 대기)', value: Math.max(0, (Number(counts.value.vc_issued) || 0) - (Number(counts.value.confirmed) || 0)), icon: DocumentCheckIcon, iconClass: 'text-primary-light' },
    { label: 'BTC 각인 완료', value: Number(counts.value.confirmed) || 0, icon: ShieldCheckIcon, iconClass: 'text-success-light' },
    { label: '거절 건수', value: counts.value.failed || 0, icon: NoSymbolIcon, iconClass: 'text-txt-4' },
  ]
})

async function load() {
  if (!auth.isAtelier) return
  loading.value = true
  try {
    const statusFilter = currentTab.value === 'all' ? undefined : currentTab.value
    const { data } = await getDeclarations(statusFilter)
    items.value = data.declarations || []
    counts.value = data.counts || {}
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
    await approveDeclaration(id)
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
    await rejectDeclaration(id, reason)
    await load()
  } finally {
    delete processing.value[id]
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
