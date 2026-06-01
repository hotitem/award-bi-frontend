<template>
  <section class="py-16 bg-bg-0 min-h-screen">
    <div class="container max-w-4xl">
      <!-- 로딩 -->
      <div v-if="loading" class="flex justify-center py-24">
        <div class="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- 브랜드 정보 -->
      <template v-else-if="brand">
        <!-- 헤더 -->
        <div class="flex items-start gap-6 mb-10">
          <div class="w-20 h-20 rounded-xl bg-grad-card border border-white/10 flex items-center justify-center text-4xl shrink-0">
            {{ brand.brand_name?.[0] ?? '🏷' }}
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 flex-wrap mb-2">
              <h1 class="text-3xl font-black text-txt-1">{{ brand.brand_name }}</h1>
              <span class="badge badge-green">✓ {{ t('brand.verified') }}</span>
            </div>
            <p class="text-txt-3 text-sm mb-3">{{ brand.kei_bio_brand_slug }}</p>
            <div class="flex gap-3 flex-wrap">
              <span class="badge badge-purple">{{ brand.sbt_count ?? 0 }} {{ t('brand.sbt') }}</span>
              <span class="badge badge-gold">{{ brand.nft_count ?? 0 }} {{ t('brand.nft') }}</span>

              <!-- 단축 URL + QR -->
              <button @click="copyShortUrl" class="btn btn-outline btn-sm">🔗 {{ t('brand.short_url') }}</button>
              <button @click="showQr = !showQr" class="btn btn-outline btn-sm">📱 QR</button>
            </div>

            <!-- QR 코드 -->
            <div v-if="showQr" class="mt-4 p-4 card inline-block">
              <canvas ref="qrCanvas" />
              <div class="text-xs text-txt-3 text-center mt-2">{{ shortUrl }}</div>
              <button @click="downloadQr" class="btn btn-outline btn-sm w-full mt-2">⬇️ {{ t('brand.qr_download') }}</button>
            </div>
          </div>
        </div>

        <!-- 자산 그리드 -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div
            v-for="asset in assets" :key="asset.declaration_id"
            class="card-hover p-4 cursor-pointer"
            @click="router.push(`/verify?id=${asset.vc_id}`)"
          >
            <div class="aspect-square rounded-md bg-bg-0 border border-white/5 overflow-hidden mb-3 flex items-center justify-center">
              <img v-if="asset.source_url" :src="asset.source_url" :alt="asset.asset_metadata?.name ?? ''" class="w-full h-full object-cover" />
              <span v-else class="text-4xl opacity-30">🖼</span>
            </div>
            <div class="text-sm font-semibold text-txt-1 mb-1 truncate">
              {{ asset.asset_metadata?.title ?? asset.asset_metadata?.name ?? asset.asset_class }}
            </div>
            <div class="flex items-center gap-2">
              <span class="badge badge-purple text-[10px]">{{ asset.token_category }}</span>
              <span v-if="asset.vc_id" class="badge badge-green text-[10px]">✓ VC</span>
            </div>
          </div>
        </div>

        <p v-if="!assets.length" class="text-center text-txt-3 py-12">{{ t('mypage.no_certs') }}</p>
      </template>

      <!-- 404 -->
      <div v-else class="text-center py-24 text-txt-3">브랜드를 찾을 수 없습니다</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'
import { getBrand, getBrandAssets, createShortUrl } from '@/api/award'

const { t } = useI18n()
const route  = useRoute()
const router = useRouter()

const brand    = ref<Record<string,unknown> | null>(null)
const assets   = ref<Record<string,unknown>[]>([])
const loading  = ref(true)
const showQr   = ref(false)
const shortUrl = ref('')
const qrCanvas = ref<HTMLCanvasElement | null>(null)

async function load(slug: string) {
  loading.value = true
  try {
    const [bRes, aRes] = await Promise.all([getBrand(slug), getBrandAssets(slug, 24)])
    brand.value  = bRes.data.brand ?? bRes.data
    assets.value = aRes.data.assets ?? []
    // 단축 URL 생성
    const target = `https://award.bi/brand/${slug}`
    const sRes   = await createShortUrl(target).catch(() => null)
    shortUrl.value = sRes?.data?.short_url ?? target
  } catch {
    brand.value = null
  } finally {
    loading.value = false
  }
}

watch(() => route.params.slug as string, s => { if (s) load(s) }, { immediate: true })

watch(showQr, async (v) => {
  if (v && qrCanvas.value) {
    await nextTick()
    QRCode.toCanvas(qrCanvas.value, shortUrl.value || window.location.href, { width: 200, margin: 1 })
  }
})

async function copyShortUrl() {
  await navigator.clipboard.writeText(shortUrl.value || window.location.href)
  alert('✅ 단축 URL이 복사되었습니다')
}

function downloadQr() {
  if (!qrCanvas.value) return
  const a = document.createElement('a')
  a.href = qrCanvas.value.toDataURL('image/png')
  a.download = `award-bi-${route.params.slug}.png`
  a.click()
}
</script>
