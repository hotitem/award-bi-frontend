<template>
  <section class="py-12 bg-bg-0 min-h-screen">
    <div class="container">
      <h1 class="text-3xl font-black text-txt-1 mb-8">{{ t('market.title') }}</h1>
      <div v-if="loading" class="flex justify-center py-24">
        <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="item in listings" :key="item.listing_id" class="card-hover p-4">
          <div class="aspect-square rounded-md bg-bg-0 border border-white/5 flex items-center justify-center mb-3">
            <img v-if="item.source_url" :src="item.source_url" class="w-full h-full object-cover rounded-md" />
            <span v-else class="text-3xl opacity-30">🖼</span>
          </div>
          <div class="text-sm font-semibold text-txt-1 mb-1 truncate">{{ item.asset_metadata?.name ?? item.asset_class }}</div>
          <div class="flex items-center justify-between">
            <span class="text-gold font-bold text-sm">{{ Number(item.price_points).toLocaleString() }} pt</span>
            <button @click="buy(item.listing_id)" class="btn btn-gold btn-sm">{{ t('market.buy_btn') }}</button>
          </div>
        </div>
      </div>
      <p v-if="!loading && !listings.length" class="text-center text-txt-3 py-16">{{ t('mypage.no_certs') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getMarket, buyAsset } from '@/api/award'

const { t } = useI18n()
const listings = ref<Record<string,unknown>[]>([])
const loading  = ref(true)

async function load() {
  try {
    const { data } = await getMarket()
    listings.value = data.listings ?? []
  } finally { loading.value = false }
}

async function buy(id: string) {
  if (!confirm('구매하시겠습니까?')) return
  try {
    await buyAsset(id)
    alert('✅ 구매 완료!')
    load()
  } catch (e: unknown) { alert((e as Error).message) }
}

onMounted(load)
</script>
