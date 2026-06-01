import { defineStore } from 'pinia'
import { ref } from 'vue'
import { myAssets } from '@/api/award'

export interface VcAsset {
  vc_id: string
  declaration_id: string
  asset_class: string
  asset_metadata: Record<string, string>
  source_url?: string
  token_type: string
  issued_at: string
  bitcoin?: {
    ots_status: string
    batch_date?: string
    btc_block_height?: number
    btc_tx_hash?: string
    merkle_root?: string
    leaf_index?: number
    batch_vc_count?: number
  }
}

export const useWalletStore = defineStore('wallet', () => {
  const assets  = ref<VcAsset[]>([])
  const loading = ref(false)

  async function fetchAssets() {
    loading.value = true
    try {
      const { data } = await myAssets()
      assets.value = data.assets ?? []
    } catch {
      assets.value = []
    } finally {
      loading.value = false
    }
  }

  function clear() {
    assets.value = []
  }

  return { assets, loading, fetchAssets, clear }
})
