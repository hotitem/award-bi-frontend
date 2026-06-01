<template>
  <div class="max-w-xl">
    <h2 class="text-2xl font-black text-txt-1 mb-6">{{ t('issue.title') }}</h2>

    <!-- 스텝 표시 -->
    <div class="flex items-center gap-2 mb-8">
      <div v-for="i in 4" :key="i" class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
             :class="step >= i ? 'bg-primary text-white' : 'bg-white/10 text-txt-3'">{{ i }}</div>
        <div v-if="i < 4" class="w-8 h-0.5 rounded" :class="step > i ? 'bg-primary' : 'bg-white/10'" />
      </div>
    </div>

    <!-- Step 1: 자산 유형 -->
    <div v-if="step === 1" class="space-y-4">
      <div v-for="type in assetTypes" :key="type.value"
           @click="form.asset_class = type.value; form.token_type = type.token"
           class="card p-4 cursor-pointer transition-all"
           :class="form.asset_class === type.value ? 'border-primary/60 bg-primary/10' : 'hover:border-white/20'">
        <div class="text-xl mb-2">{{ type.icon }}</div>
        <div class="font-semibold text-txt-1 text-sm">{{ type.label }}</div>
        <div class="text-xs text-txt-3 mt-1">{{ form.asset_class === type.value && type.token === 'NFT' ? t('issue.nft_desc') : t('issue.sbt_desc') }}</div>
      </div>
      <button @click="step = 2" :disabled="!form.asset_class" class="btn btn-primary w-full">다음 →</button>
    </div>

    <!-- Step 2: 파일 업로드 -->
    <div v-else-if="step === 2" class="space-y-4">
      <div class="border-2 border-dashed border-white/10 rounded-lg p-10 text-center cursor-pointer hover:border-primary/40 transition-colors"
           @dragover.prevent @drop.prevent="onDrop" @click="fileInput?.click()">
        <div class="text-4xl mb-3">{{ preview ? '✅' : '📁' }}</div>
        <p class="text-txt-3 text-sm">{{ preview ? fileName : '파일을 드래그하거나 클릭하여 업로드' }}</p>
        <input ref="fileInput" type="file" class="hidden" accept="image/*,video/*" @change="onFileChange" />
      </div>
      <div class="flex gap-2">
        <button @click="step = 1" class="btn btn-outline flex-1">← 이전</button>
        <button @click="step = 3" :disabled="!form.file" class="btn btn-primary flex-1">다음 →</button>
      </div>
    </div>

    <!-- Step 3: 메타데이터 -->
    <div v-else-if="step === 3" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-txt-3 mb-1.5">자산명 *</label>
        <input v-model="form.name" type="text" class="w-full px-3 py-2.5 bg-bg-card border border-white/10 rounded-md text-sm text-txt-1 outline-none focus:border-primary/60" placeholder="예: B5 Barrier Cream" />
      </div>
      <div>
        <label class="block text-xs font-semibold text-txt-3 mb-1.5">설명</label>
        <textarea v-model="form.description" rows="3" class="w-full px-3 py-2.5 bg-bg-card border border-white/10 rounded-md text-sm text-txt-1 outline-none focus:border-primary/60 resize-none" />
      </div>
      <div class="flex gap-2">
        <button @click="step = 2" class="btn btn-outline flex-1">← 이전</button>
        <button @click="step = 4" :disabled="!form.name" class="btn btn-primary flex-1">다음 →</button>
      </div>
    </div>

    <!-- Step 4: 제출 -->
    <div v-else class="space-y-4">
      <div class="card p-5 space-y-3 text-sm">
        <div class="flex justify-between"><span class="text-txt-3">자산 유형</span><span class="badge badge-purple">{{ form.asset_class }}</span></div>
        <div class="flex justify-between"><span class="text-txt-3">토큰</span><span class="badge badge-gold">{{ form.token_type }}</span></div>
        <div class="flex justify-between"><span class="text-txt-3">자산명</span><span class="text-txt-1">{{ form.name }}</span></div>
        <div class="flex justify-between"><span class="text-txt-3">파일</span><span class="text-txt-2 truncate max-w-[60%]">{{ fileName }}</span></div>
      </div>
      <p v-if="submitErr" class="text-red-400 text-sm">{{ submitErr }}</p>
      <div class="flex gap-2">
        <button @click="step = 3" class="btn btn-outline flex-1">← 이전</button>
        <button @click="submit" :disabled="submitting" class="btn btn-primary flex-1">
          {{ submitting ? '제출 중...' : t('issue.submit_btn') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { issueAsset } from '@/api/award'

const { t } = useI18n()
const step    = ref(1)
const fileInput = ref<HTMLInputElement | null>(null)
const preview = ref('')
const fileName= ref('')
const submitting = ref(false)
const submitErr  = ref('')

const form = ref({ asset_class: '', token_type: 'SBT', file: null as File | null, name: '', description: '' })

const assetTypes = [
  { value: 'product_design', icon: '🧴', label: '상품 디자인', token: 'SBT' },
  { value: 'brand_logo',     icon: '🏷',  label: '브랜드 로고', token: 'SBT' },
  { value: 'brand_video',    icon: '🎬', label: '브랜드 영상', token: 'NFT' },
  { value: 'model_portrait', icon: '👤', label: '모델 초상',   token: 'NFT' },
]

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  form.value.file = file
  fileName.value  = file.name
  preview.value   = URL.createObjectURL(file)
}

function onDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  form.value.file = file
  fileName.value  = file.name
}

async function submit() {
  submitting.value = true
  submitErr.value  = ''
  try {
    const body = {
      asset_class:    form.value.asset_class,
      token_type:     form.value.token_type,
      asset_metadata: { name: form.value.name, description: form.value.description },
    }
    await issueAsset(body)
    alert('✅ 아뜰리에 검토 신청이 완료되었습니다!')
    step.value = 1
    form.value = { asset_class: '', token_type: 'SBT', file: null, name: '', description: '' }
  } catch (e: unknown) {
    submitErr.value = (e as Error).message || '제출 실패'
  } finally {
    submitting.value = false
  }
}
</script>
