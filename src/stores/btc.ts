import { defineStore } from 'pinia'
import { ref } from 'vue'
import { verifyBtcLatest, getStats } from '@/api/award'

export const useBtcStore = defineStore('btc', () => {
  const blockHeight   = ref<number | null>(null)
  const btcPriceKrw   = ref<number | null>(null)
  const totalVcs      = ref(0)
  const totalInscribed= ref(0)
  const totalBrands   = ref(0)
  const pendingBatches= ref(0)
  const latestBatches = ref<BtcBatch[]>([])
  const nextBatchMs   = ref<number>(0) // 다음 자정 KST까지 ms

  interface BtcBatch {
    batch_id: string
    batch_date: string
    vc_count: number
    ots_status: string
    btc_block_height?: number
    btc_tx_hash?: string
    confirmed_at?: string
  }

  function calcNextBatch() {
    const now = new Date()
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    const midnight = new Date(kst)
    midnight.setUTCHours(0, 0, 0, 0)
    midnight.setUTCDate(midnight.getUTCDate() + 1)
    nextBatchMs.value = midnight.getTime() - now.getTime()
  }

  async function fetchBtcPrice() {
    try {
      const res = await fetch('https://api.coinbase.com/v2/prices/BTC-KRW/spot')
      const json = await res.json()
      btcPriceKrw.value = parseFloat(json.data?.amount ?? '0')
    } catch {}
  }

  async function fetchBlockHeight() {
    try {
      const res = await fetch('https://blockstream.info/api/blocks/tip/height')
      blockHeight.value = parseInt(await res.text())
    } catch {}
  }

  async function fetchStats() {
    try {
      const { data } = await getStats()
      totalVcs.value       = parseInt(data.stats?.vcs?.total_vcs ?? '0')
      totalInscribed.value = parseInt(data.stats?.btc?.total_inscribed ?? '0')
      totalBrands.value    = parseInt(data.stats?.brands?.approved ?? '0')
    } catch {}
  }

  async function fetchBatches() {
    try {
      const { data } = await verifyBtcLatest()
      latestBatches.value  = data.recent_batches ?? []
      pendingBatches.value = parseInt(data.stats?.pending_batches ?? '0')
    } catch {}
  }

  let _timer: ReturnType<typeof setInterval> | null = null

  function startPolling() {
    fetchBtcPrice()
    fetchBlockHeight()
    fetchStats()
    fetchBatches()
    calcNextBatch()

    _timer = setInterval(() => {
      fetchBtcPrice()
      fetchBlockHeight()
      calcNextBatch()
    }, 60_000)
  }

  function stopPolling() {
    if (_timer) clearInterval(_timer)
  }

  return {
    blockHeight, btcPriceKrw, totalVcs, totalInscribed,
    totalBrands, pendingBatches, latestBatches, nextBatchMs,
    startPolling, stopPolling, fetchStats, fetchBatches,
  }
})
