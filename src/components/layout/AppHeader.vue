<template>
  <header
    class="fixed top-0 inset-x-0 z-50 transition-all duration-300"
    :class="scrolled ? 'bg-bg-1/95 backdrop-blur-sm border-b border-white/[0.07]' : 'bg-transparent'"
  >
    <div class="container flex items-center h-16 gap-4">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2 text-lg font-extrabold shrink-0">
        <span class="w-8 h-8 rounded-lg bg-grad-purple flex items-center justify-center text-sm">⭐</span>
        <span class="text-gradient">award.bi</span>
      </RouterLink>

      <!-- BTC 실시간 -->
      <div v-if="btc.blockHeight" class="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-xs">
        <span class="text-gold font-bold">₿</span>
        <span class="text-gold-light font-mono font-semibold">
          {{ btc.blockHeight.toLocaleString() }}
        </span>
        <span v-if="btc.btcPriceKrw" class="text-txt-3">
          ₩{{ Math.round(btc.btcPriceKrw / 10000).toLocaleString() }}만
        </span>
      </div>

      <!-- Nav -->
      <nav class="hidden lg:flex items-center gap-1 mx-auto">
        <RouterLink
          v-for="item in navItems" :key="item.to"
          :to="item.to"
          class="px-3 py-1.5 text-sm text-txt-3 rounded-md transition-colors hover:text-txt-1 hover:bg-white/5"
          active-class="text-txt-1 bg-white/[0.07]"
        >
          {{ t(item.i18nKey) }}
        </RouterLink>
      </nav>

      <div class="flex items-center gap-2 ml-auto">
        <!-- 언어 선택 -->
        <div class="relative" ref="langMenuRef">
          <button
            @click="langOpen = !langOpen"
            class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-txt-3 rounded-md border border-white/[0.07] hover:border-white/20 transition-colors"
          >
            <span>{{ currentLocale.flag }}</span>
            <span class="hidden sm:block">{{ currentLocale.label }}</span>
            <span class="text-txt-4">▾</span>
          </button>
          <Transition name="dropdown">
            <div v-if="langOpen" class="absolute right-0 top-full mt-1 w-44 card rounded-lg shadow-lg overflow-hidden z-50">
              <button
                v-for="loc in LOCALES" :key="loc.code"
                @click="switchLocale(loc.code)"
                class="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                :class="locale === loc.code ? 'text-primary-light' : 'text-txt-2'"
              >
                <span>{{ loc.flag }}</span>
                <span>{{ loc.label }}</span>
              </button>
            </div>
          </Transition>
        </div>

        <!-- 로그인 / 사용자 -->
        <template v-if="auth.isLoggedIn">
          <RouterLink to="/my" class="btn btn-outline btn-sm hidden sm:flex">
            ⭐ {{ displayName }}
          </RouterLink>
          <button @click="auth.logout()" class="btn btn-outline btn-sm text-txt-3">{{ t('nav.logout') }}</button>
        </template>
        <template v-else>
          <button @click="auth.openLogin()" class="btn btn-primary btn-sm">
            {{ t('nav.login') }}
          </button>
        </template>
      </div>
    </div>
  </header>
  <!-- spacer -->
  <div class="h-16" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { LOCALES, setLocale } from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import { useBtcStore }  from '@/stores/btc'

const { t, locale } = useI18n()
const auth = useAuthStore()
const btc  = useBtcStore()

const scrolled   = ref(false)
const langOpen   = ref(false)
const langMenuRef= ref<HTMLElement | null>(null)

const navItems = [
  { to: '/',       i18nKey: 'nav.home' },
  { to: '/verify', i18nKey: 'nav.verify' },
  { to: '/api',    i18nKey: 'nav.api' },
]

const currentLocale = computed(() =>
  LOCALES.find(l => l.code === locale.value) ?? LOCALES[0]
)

const displayName = computed(() =>
  auth.user?.email?.split('@')[0] ?? auth.user?.w3c_did?.slice(-8) ?? '내 계정'
)

function switchLocale(code: string) {
  setLocale(code)
  langOpen.value = false
}

function onScroll() { scrolled.value = window.scrollY > 20 }

function onClickOutside(e: MouseEvent) {
  if (langMenuRef.value && !langMenuRef.value.contains(e.target as Node)) {
    langOpen.value = false
  }
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
.dropdown-enter-active, .dropdown-leave-active { transition: opacity .15s, transform .15s; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
