<template>
  <section class="py-12 bg-bg-0 min-h-screen">
    <div class="container max-w-4xl">
      <h1 class="text-2xl font-black text-txt-1 mb-6">🎨 아뜰리에 대시보드</h1>

      <!-- 탭 -->
      <div class="flex gap-2 mb-6 border-b border-white/[0.07] pb-0">
        <button v-for="tab in ['pending','approved','rejected','all']" :key="tab"
          @click="activeTab = tab; load()"
          class="px-4 py-2 text-sm rounded-t-md transition-colors"
          :class="activeTab === tab ? 'bg-primary text-white font-semibold' : 'text-txt-3 hover:text-txt-1'">
          {{ tabLabel(tab) }}
          <span v-if="tab !== 'all'" class="ml-1.5 badge badge-gray text-[10px]">{{ counts[tab] ?? 0 }}</span>
        </button>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <div v-else class="space-y-3">
        <div v-for="d in decls" :key="d.declaration_id" class="card p-5 flex items-start gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="font-semibold text-txt-1 text-sm">{{ d.asset_metadata?.name ?? d.asset_class }}</span>
              <span class="badge" :class="statusBadge(d.status)">{{ d.status }}</span>
              <span class="badge badge-purple text-[10px]">{{ d.asset_class }}</span>
            </div>
            <div class="text-xs text-txt-3 font-mono mb-2">{{ d.declaration_id }}</div>
            <div class="text-xs text-txt-4">{{ new Date(d.declared_at).toLocaleString() }}</div>
          </div>
          <div v-if="d.status === 'pending'" class="flex gap-2 shrink-0">
            <button @click="approve(d.declaration_id)" class="btn btn-primary btn-sm">✓ 승인</button>
            <button @click="reject(d.declaration_id)" class="btn btn-outline btn-sm text-red-400">✕ 거절</button>
          </div>
        </div>
        <p v-if="!decls.length" class="text-center text-txt-3 py-12">해당 항목이 없습니다</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDeclarations, approveDecl, rejectDecl } from '@/api/award'

const decls     = ref<Record<string,unknown>[]>([])
const loading   = ref(true)
const activeTab = ref('pending')
const counts    = ref<Record<string,number>>({})

function tabLabel(t: string) {
  return { pending:'대기', approved:'승인', rejected:'거절', all:'전체' }[t] ?? t
}
function statusBadge(s: string) {
  return { pending:'badge-gold', approved:'badge-green', rejected:'badge-gray', vc_issued:'badge-purple' }[s] ?? 'badge-gray'
}

async function load() {
  loading.value = true
  try {
    const status = activeTab.value === 'all' ? undefined : activeTab.value
    const { data } = await getDeclarations(status)
    decls.value  = data.declarations ?? []
    counts.value = data.counts ?? {}
  } finally { loading.value = false }
}

async function approve(id: string) {
  if (!confirm('승인하시겠습니까? VC가 발행됩니다.')) return
  await approveDecl(id); load()
}
async function reject(id: string) {
  const reason = prompt('거절 사유를 입력하세요:')
  if (!reason) return
  await rejectDecl(id, reason); load()
}

onMounted(load)
</script>
