<template>
  <AppHeader />
  <RouterView />
  <AppFooter />
  <SsumLoginModal />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import SsumLoginModal from '@/components/common/SsumLoginModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useBtcStore } from '@/stores/btc'

const auth = useAuthStore()
const btc  = useBtcStore()

onMounted(async () => {
  await auth.restoreSession()
  btc.startPolling()
})
</script>
