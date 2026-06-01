<template>
  <section class="min-h-screen flex items-center justify-center bg-bg-0">
    <div class="text-center">
      <div class="text-8xl font-black text-gradient mb-4">404</div>
      <p class="text-txt-3 mb-6">페이지를 찾을 수 없습니다</p>
      <RouterLink to="/" class="btn btn-primary">← 홈으로</RouterLink>
    </div>
  </section>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
