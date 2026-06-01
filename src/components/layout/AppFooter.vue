<template>
  <footer class="bg-bg-1 border-t border-white/[0.07] py-10 mt-20">
    <div class="container">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-2 text-base font-extrabold">
          <span class="w-7 h-7 rounded-lg bg-grad-purple flex items-center justify-center text-xs">⭐</span>
          <span class="text-gradient">award.bi</span>
        </div>
        <nav class="flex items-center gap-6 text-sm text-txt-3">
          <RouterLink to="/verify" class="hover:text-txt-1 transition-colors">{{ t('footer.links.verify') }}</RouterLink>
          <RouterLink to="/api"    class="hover:text-txt-1 transition-colors">{{ t('footer.links.api') }}</RouterLink>
          <RouterLink to="/atelier" class="hover:text-txt-1 transition-colors">{{ t('footer.links.atelier') }}</RouterLink>
          <a href="https://kei.bio" target="_blank" class="hover:text-txt-1 transition-colors">kei.bio ↗</a>
        </nav>
        <p class="text-xs text-txt-4 text-center">{{ t('footer.copy') }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
