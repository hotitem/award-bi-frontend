<template>
  <header
    class="fixed top-0 inset-x-0 z-50 transition-all duration-300"
    :class="scrolled ? 'bg-[#0c1024]/95 backdrop-blur border-b border-white/[0.07]' : 'bg-transparent'"
  >
    <div class="container flex items-center h-16 gap-4">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2 font-extrabold text-lg shrink-0">
        <span class="w-8 h-8 rounded-lg bg-grad-purple flex items-center justify-center text-sm">⭐</span>
        <span class="text-gradient">award.bi</span>
      </RouterLink>

      <!-- Nav -->
      <nav class="hidden lg:flex items-center gap-0.5 ml-4">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to"
          class="px-3 py-1.5 text-sm text-txt-3 rounded-md transition-colors hover:text-txt-1 hover:bg-white/5"
          active-class="text-txt-1">
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="flex items-center gap-2 ml-auto">
        <!-- BTC 블록 높이 -->
        <div v-if="btc.blockHeight" class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-xs font-semibold cursor-default" title="최신 Bitcoin 블록 높이">
          <span class="text-gold">⚓</span>
          <span class="text-gold-light font-mono">#{{ btc.blockHeight.toLocaleString() }}</span>
        </div>

        <!-- 언어 -->
        <div class="relative" ref="langRef">
          <button @click="langOpen = !langOpen"
            class="flex items-center gap-1 px-2 py-1.5 text-xs text-txt-3 rounded-md border border-white/[0.07] hover:border-white/20 transition-colors">
            {{ currentLocale.flag }} <span class="hidden sm:inline">{{ currentLocale.label }}</span> ▾
          </button>
          <Transition name="dd">
            <div v-if="langOpen" class="absolute right-0 top-full mt-1 w-40 card rounded-lg shadow-lg overflow-auto max-h-72 z-50">
              <button v-for="loc in LOCALES" :key="loc.code"
                @click="switchLang(loc.code)"
                class="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                :class="locale === loc.code ? 'text-primary-light' : 'text-txt-2'">
                {{ loc.flag }} {{ loc.label }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- 로그인 상태 -->
        <template v-if="auth.isLoggedIn">
          <RouterLink to="/my" class="btn btn-outline btn-sm hidden sm:flex gap-1.5 items-center">
            <span class="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            {{ displayName }}
          </RouterLink>
        </template>
        <template v-else>
          <button @click="auth.openLogin()" class="btn btn-primary btn-sm">⭐ 로그인</button>
        </template>
      </div>
    </div>
  </header>
  <div class="h-16" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { LOCALES, setLocale } from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import { useBtcStore }  from '@/stores/btc'

const { locale } = useI18n()
const auth = useAuthStore()
const btc  = useBtcStore()

const scrolled = ref(false)
const langOpen = ref(false)
const langRef  = ref<HTMLElement | null>(null)

const navItems = [
  { to: '/#about',   label: '서비스 소개' },
  { to: '/brand/esco', label: '브랜드' },
  { to: '/verify',   label: '인증 검색' },
  { to: '/my/issue', label: 'NFT·SBT' },
  { to: '/#journey', label: '소개' },
  { to: '/api',      label: '파트너' },
]

const currentLocale = computed(() => LOCALES.find(l => l.code === locale.value) ?? LOCALES[0])
const displayName   = computed(() =>
  auth.user?.email?.split('@')[0] ?? auth.user?.w3c_did?.slice(-8) ?? '내 계정'
)

function switchLang(code: string) { setLocale(code); langOpen.value = false }

const onScroll       = () => { scrolled.value = window.scrollY > 20 }
const onClickOutside = (e: MouseEvent) => {
  if (langRef.value && !langRef.value.contains(e.target as Node)) langOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('click', onClickOutside)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.dd-enter-active, .dd-leave-active { transition: opacity .15s, transform .15s; }
.dd-enter-from, .dd-leave-to { opacity:0; transform:translateY(-6px); }
</style>
