<template>
  <section class="py-12 bg-bg-0 min-h-screen">
    <div class="container">
      <div class="flex gap-6">
        <!-- 사이드바 -->
        <aside class="w-56 shrink-0 hidden md:block">
          <div class="card p-5 mb-4">
            <div class="text-xs font-mono text-txt-4 mb-1 truncate">{{ auth.user?.w3c_did }}</div>
            <div class="text-sm text-txt-2 truncate mb-3">{{ auth.user?.email }}</div>
            <div class="text-2xl font-black text-gold">{{ auth.user?.ssum_points?.toLocaleString() ?? 0 }}</div>
            <div class="text-xs text-txt-3">{{ t('mypage.points') }}</div>
          </div>
          <nav class="space-y-1">
            <button v-for="tab in tabs" :key="tab.key"
              @click="activeTab = tab.key"
              class="w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors"
              :class="activeTab === tab.key ? 'bg-primary/20 text-primary-light font-semibold' : 'text-txt-3 hover:text-txt-1 hover:bg-white/5'">
              {{ tab.icon }} {{ tab.label }}
            </button>
          </nav>
        </aside>

        <!-- 메인 -->
        <main class="flex-1 min-w-0">
          <component :is="currentTabComponent" />
        </main>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const auth = useAuthStore()
const activeTab = ref('certs')

const tabs = computed(() => [
  { key: 'certs',   icon: '📜', label: t('mypage.my_certs') },
  { key: 'issue',   icon: '➕', label: t('mypage.issue') },
  { key: 'market',  icon: '🛒', label: t('mypage.market') },
  { key: 'history', icon: '📋', label: t('mypage.history') },
])

const currentTabComponent = computed(() => {
  const map: Record<string, unknown> = {
    certs:   defineAsyncComponent(() => import('./IssueView.vue')),
    issue:   defineAsyncComponent(() => import('./IssueView.vue')),
    market:  defineAsyncComponent(() => import('./MarketView.vue')),
    history: { template: '<div class="card p-8 text-center text-txt-3">준비 중</div>' },
  }
  return map[activeTab.value]
})
</script>
