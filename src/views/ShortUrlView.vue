<template>
  <section class="min-h-screen flex items-center justify-center bg-bg-0">
    <div class="text-center">
      <div class="text-5xl mb-4">{{ status === 'loading' ? '⏳' : status === 'error' ? '❌' : '⭐' }}</div>
      <p class="text-txt-3">{{ message }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resolveShortUrl } from '@/api/award'

const route  = useRoute()
const router = useRouter()
const status  = ref<'loading'|'ok'|'error'>('loading')
const message = ref('리다이렉트 중...')

onMounted(async () => {
  try {
    const { data } = await resolveShortUrl(route.params.code as string)
    const target = data.target ?? data.url ?? '/'
    if (target.startsWith('http')) window.location.href = target
    else router.replace(target)
    status.value = 'ok'
  } catch {
    status.value = 'error'
    message.value = '단축 URL을 찾을 수 없습니다'
    setTimeout(() => router.push('/'), 2000)
  }
})
</script>
