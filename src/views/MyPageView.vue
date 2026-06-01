<template>
  <section class="py-12 bg-bg-0 min-h-screen">
    <div class="container">
      <div class="flex gap-6">

        <!-- ── 사이드바 (지갑) ──────────────────────────── -->
        <aside class="w-64 shrink-0 hidden md:flex flex-col gap-4">
          <!-- 지갑 카드 -->
          <div class="card p-5 bg-grad-purple border-primary/30">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold text-white/70 uppercase tracking-wider">⭐ ssum 지갑</span>
              <span class="badge bg-white/20 text-white border-0 text-[9px]">BETA</span>
            </div>
            <div class="text-3xl font-black text-white mb-1">
              {{ auth.user?.ssum_points?.toLocaleString() ?? '0' }}
            </div>
            <div class="text-xs text-white/60 mb-4">ssum Points</div>
            <div class="grid grid-cols-2 gap-2 text-center">
              <div class="bg-white/10 rounded-md p-2">
                <div class="text-lg font-black text-white">{{ wallet.assets.length }}</div>
                <div class="text-[9px] text-white/60">인증서</div>
              </div>
              <div class="bg-white/10 rounded-md p-2">
                <div class="text-lg font-black text-white">0</div>
                <div class="text-[9px] text-white/60">Award.BI</div>
              </div>
            </div>
          </div>

          <!-- 사용자 정보 -->
          <div class="card p-4">
            <div class="text-[10px] font-mono text-txt-4 mb-1 truncate">{{ auth.user?.w3c_did }}</div>
            <div class="text-sm text-txt-2 truncate mb-2">{{ auth.user?.email }}</div>
            <div class="badge badge-purple text-[10px] w-fit">{{ auth.user?.role ?? 'consumer' }}</div>
          </div>

          <!-- 메뉴 -->
          <nav class="card p-3 space-y-1">
            <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
              class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors"
              :class="activeTab === tab.key
                ? 'bg-primary/20 text-primary-light font-semibold'
                : 'text-txt-3 hover:text-txt-1 hover:bg-white/5'">
              <span>{{ tab.icon }}</span>
              <span>{{ tab.label }}</span>
            </button>
          </nav>

          <!-- 서비스 링크 -->
          <div class="card p-4 space-y-2">
            <div class="text-xs font-bold text-txt-4 uppercase tracking-wider mb-3">파트너 서비스</div>
            <a href="https://kei.bio" target="_blank"
               class="flex items-center gap-2 text-sm text-txt-3 hover:text-primary-light transition-colors">
              <span>🔑</span> kei.bio
            </a>
            <RouterLink to="/api"
               class="flex items-center gap-2 text-sm text-txt-3 hover:text-primary-light transition-colors">
              <span>🔌</span> Open API
            </RouterLink>
          </div>

          <!-- 로그아웃 -->
          <button @click="auth.logout()" class="btn btn-outline w-full text-sm text-txt-3">
            로그아웃
          </button>
        </aside>

        <!-- ── 메인 콘텐츠 ───────────────────────────────── -->
        <main class="flex-1 min-w-0">
          <!-- 내 인증서 -->
          <div v-if="activeTab === 'certs'">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-black text-txt-1">📜 내 인증서</h2>
              <RouterLink to="/my/issue" class="btn btn-primary btn-sm">+ 자산 등록</RouterLink>
            </div>
            <div v-if="wallet.loading" class="flex justify-center py-16">
              <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <div v-else-if="wallet.assets.length" class="grid gap-4">
              <div v-for="asset in wallet.assets" :key="asset.vc_id"
                   class="card p-5 flex items-center gap-4">
                <!-- 미디어 썸네일 -->
                <div class="w-16 h-16 rounded-lg overflow-hidden bg-bg-0 border border-white/5 shrink-0">
                  <video v-if="isVideo(asset.source_url, asset.asset_class)"
                         :src="asset.source_url" class="w-full h-full object-cover"
                         muted preload="metadata" />
                  <img v-else-if="asset.source_url" :src="asset.source_url"
                       class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-2xl">🧴</div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-txt-1 mb-1 truncate">
                    {{ asset.asset_metadata?.title ?? asset.asset_class }}
                  </div>
                  <div class="flex gap-2 flex-wrap mb-1.5">
                    <span class="badge badge-purple text-[9px]">{{ asset.token_type }}</span>
                    <span v-if="asset.bitcoin?.ots_status === 'confirmed'" class="badge badge-green text-[9px]">⚓ 각인 완료</span>
                    <span v-else-if="asset.bitcoin?.ots_status === 'submitted'" class="badge badge-gold text-[9px]">📡 BTC 제출 중</span>
                    <span v-else class="badge badge-gray text-[9px]">⏳ 대기</span>
                  </div>
                  <div class="font-mono text-[10px] text-txt-4 truncate">{{ asset.vc_id }}</div>
                </div>
                <RouterLink :to="`/verify?id=${asset.vc_id}`" class="btn btn-outline btn-sm shrink-0">
                  검증 →
                </RouterLink>
              </div>
            </div>
            <div v-else class="card p-12 text-center text-txt-3">
              <div class="text-5xl mb-4 opacity-30">📜</div>
              <p class="mb-4">아직 발행된 인증서가 없습니다</p>
              <RouterLink to="/my/issue" class="btn btn-primary">SBT/NFT 등록하기</RouterLink>
            </div>
          </div>

          <!-- 자산 등록 -->
          <div v-else-if="activeTab === 'issue'">
            <IssueView />
          </div>

          <!-- NFT 유통 -->
          <div v-else-if="activeTab === 'market'">
            <MarketView />
          </div>

          <!-- 활동 이력 -->
          <div v-else-if="activeTab === 'history'">
            <h2 class="text-xl font-black text-txt-1 mb-6">📋 활동 이력</h2>
            <div class="space-y-3">
              <div v-for="(ev, i) in historyItems" :key="i" class="card p-4 flex items-center gap-4">
                <span class="text-2xl">{{ ev.icon }}</span>
                <div class="flex-1">
                  <div class="text-sm font-semibold text-txt-1">{{ ev.title }}</div>
                  <div class="text-xs text-txt-3">{{ ev.desc }}</div>
                </div>
                <div class="text-xs text-txt-4">{{ ev.time }}</div>
              </div>
              <p v-if="!historyItems.length" class="text-center text-txt-3 py-8">활동 이력이 없습니다</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import IssueView from './IssueView.vue'
import MarketView from './MarketView.vue'

const auth   = useAuthStore()
const wallet = useWalletStore()

const activeTab = ref('certs')

const tabs = [
  { key: 'certs',   icon: '📜', label: '내 인증서' },
  { key: 'issue',   icon: '➕', label: '자산 등록' },
  { key: 'market',  icon: '🛒', label: 'NFT 유통' },
  { key: 'history', icon: '📋', label: '활동 이력' },
]

// 영상 감지
const VIDEO_EXTS = ['.mp4', '.mov', '.webm', '.ogg', '.m4v']
function isVideo(url?: string, cls?: string): boolean {
  if (cls === 'brand_video') return true
  if (!url) return false
  return VIDEO_EXTS.some(ext => url.toLowerCase().includes(ext))
}

// 샘플 활동 이력 (추후 실제 API로 교체)
const historyItems = [
  { icon: '📜', title: 'VC 발행', desc: 'W3C Verifiable Credential 발행 완료', time: '2026-06-01' },
  { icon: '⚓', title: 'Bitcoin 제출', desc: 'OTS 캘린더에 Merkle Root 제출', time: '2026-06-01' },
  { icon: '✅', title: '아뜰리에 승인', desc: '자산이 아뜰리에 검토를 통과했습니다', time: '2026-06-01' },
  { icon: '📁', title: '자산 등록', desc: 'kei.bio를 통해 자산 인증 신청', time: '2026-05-28' },
]

onMounted(() => { wallet.fetchAssets() })
</script>
