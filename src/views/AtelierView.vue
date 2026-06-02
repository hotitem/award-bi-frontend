<template>
  <section class="py-12 bg-bg-0 min-h-screen">
    <div class="container max-w-4xl">

      <!-- ── 로그인 유도 (미인증 시) ── -->
      <div v-if="!auth.isAtelier" class="max-w-sm mx-auto mt-16">
        <div class="card p-8 text-center">
          <div class="text-5xl mb-4">🎨</div>
          <h1 class="text-xl font-black text-txt-1 mb-2">아뜰리에 대시보드</h1>
          <p class="text-sm text-txt-3 mb-6">
            관리자 이메일로 로그인하면<br>자동으로 이 페이지로 이동합니다.
          </p>
          <button
            @click="auth.openLogin()"
            class="btn btn-primary w-full py-3"
          >
            ✉️ 이메일 인증으로 로그인
          </button>
          <p class="text-xs text-txt-4 mt-4">
            관리자 이메일 입력 → 인증코드 수신 → 로그인 → 아뜰리에 자동 이동
          </p>
        </div>
      </div>

      <!-- ── 아뜰리에 대시보드 (인증 후) ── -->
      <template v-else>
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-black text-txt-1">🎨 아뜰리에 대시보드</h1>
          <div class="flex items-center gap-3">
            <span class="text-xs text-txt-3">{{ auth.user?.email }}</span>
            <span class="badge badge-purple text-[10px]">{{ auth.user?.role }}</span>
            <button @click="auth.logout()" class="btn btn-outline btn-sm text-txt-3 text-xs">로그아웃</button>
          </div>
        </div>

        <!-- 탭 -->
        <div class="flex gap-2 mb-6 border-b border-white/[0.07] pb-0">
          <button v-for="tab in ['pending','vc_issued','failed','all']" :key="tab"
            @click="activeTab = tab; load()"
            class="px-4 py-2 text-sm rounded-t-md transition-colors"
            :class="activeTab === tab ? 'bg-primary text-white font-semibold' : 'text-txt-3 hover:text-txt-1'">
            {{ tabLabel(tab) }}
            <span v-if="tab !== 'all'" class="ml-1.5 badge badge-gray text-[10px]">{{ counts[tab] ?? 0 }}</span>
          </button>
        </div>

        <!-- 로딩 -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>

        <!-- 선언 목록 -->
        <div v-else class="space-y-3">
          <div v-for="d in decls" :key="d.declaration_id" class="card p-5">
            <div class="flex items-start gap-4">
              <!-- 썸네일 -->
              <img
                v-if="d.source_url"
                :src="d.source_url"
                :alt="d.asset_metadata?.title ?? d.asset_class"
                class="w-16 h-16 rounded-lg object-cover shrink-0 bg-bg-card"
                @error="(e) => (e.target as HTMLImageElement).style.display='none'"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="font-semibold text-txt-1 text-sm">
                    {{ d.asset_metadata?.title ?? d.asset_class }}
                  </span>
                  <span class="badge" :class="statusBadge(d.status)">{{ statusLabel(d.status) }}</span>
                  <span class="badge badge-purple text-[10px]">{{ d.asset_class }}</span>
                </div>
                <div class="text-xs text-txt-4 mb-1">브랜드: <span class="text-txt-2">{{ d.brand_name ?? '—' }}</span></div>
                <div class="text-xs text-txt-3 font-mono mb-1">{{ d.declaration_id }}</div>
                <div v-if="d.source_url" class="text-xs text-txt-4 truncate max-w-xs">
                  <a :href="d.source_url" target="_blank" class="text-primary hover:underline">원본 파일 보기 →</a>
                </div>
                <div class="text-xs text-txt-4 mt-1">{{ new Date(d.declared_at).toLocaleString('ko-KR') }}</div>
              </div>
              <!-- 승인/거절 버튼 -->
              <div v-if="d.status === 'pending'" class="flex flex-col gap-2 shrink-0">
                <button @click="approve(d.declaration_id)" :disabled="!!processing[d.declaration_id]"
                  class="btn btn-primary btn-sm min-w-[72px]">
                  <span v-if="processing[d.declaration_id] === 'approve'"
                    class="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"/>
                  ✓ 승인
                </button>
                <button @click="reject(d.declaration_id)" :disabled="!!processing[d.declaration_id]"
                  class="btn btn-outline btn-sm text-red-400 min-w-[72px]">
                  ✕ 거절
                </button>
              </div>
              <!-- VC 발행 완료 표시 -->
              <div v-else-if="d.status === 'vc_issued'" class="shrink-0 text-right">
                <div class="text-xs text-green-400 font-semibold">VC 발행 완료</div>
              </div>
            </div>
          </div>
          <p v-if="!decls.length" class="text-center text-txt-3 py-12">해당 항목이 없습니다</p>
        </div>
      </template>

    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getDeclarations, approveDecl, rejectDecl } from '@/api/award'

const auth = useAuthStore()

// ── 대시보드 ──
const decls      = ref<Record<string, unknown>[]>([])
const loading    = ref(false)
const activeTab  = ref('pending')
const counts     = ref<Record<string, number>>({})
const processing = ref<Record<string, string>>({})

function tabLabel(t: string) {
  return { pending: '대기', vc_issued: 'VC발행', failed: '거절', all: '전체' }[t] ?? t
}
function statusLabel(s: string) {
  return { pending: '대기중', vc_issued: 'VC발행', failed: '거절', approved: '승인' }[s] ?? s
}
function statusBadge(s: string) {
  return {
    pending:   'badge-gold',
    vc_issued: 'badge-purple',
    failed:    'badge-gray',
    approved:  'badge-green',
  }[s] ?? 'badge-gray'
}

async function load() {
  if (!auth.isAtelier) return
  loading.value = true
  try {
    const status = activeTab.value === 'all' ? undefined : activeTab.value
    const { data } = await getDeclarations(status)
    decls.value  = data.declarations ?? []
    counts.value = data.counts ?? {}
  } catch {
    decls.value = []
  } finally {
    loading.value = false }
}

async function approve(id: string) {
  if (!confirm('승인하시겠습니까? VC가 즉시 발행됩니다.')) return
  processing.value[id] = 'approve'
  try {
    await approveDecl(id)
    await load()
  } catch (e: unknown) {
    alert('승인 실패: ' + ((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? '오류'))
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

onMounted(() => {
  if (auth.isAtelier) load()
})
</script>
