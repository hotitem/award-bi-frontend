<template>
  <!-- 백드롭 + 모달 -->
  <div
    v-if="auth.loginVisible"
    class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    style="background:rgba(0,0,0,0.75);backdrop-filter:blur(6px)"
    @click.self="auth.closeLogin()"
  >
    <div class="bg-[#141929] border border-[rgba(124,58,237,0.3)] rounded-2xl w-full max-w-sm relative shadow-2xl"
         style="max-height:90vh;overflow-y:auto">
      <!-- 닫기 -->
      <button
        @click="auth.closeLogin()"
        class="absolute top-4 right-4 text-[#64748b] hover:text-white text-xl leading-none z-10"
        type="button"
      >✕</button>

      <div class="p-10">
        <!-- Step 1: 이메일 -->
        <div v-show="step === 1">
          <div class="text-center mb-7">
            <div class="text-4xl mb-3">⭐</div>
            <h2 class="text-xl font-extrabold text-white mb-1.5">award.bi 로그인</h2>
            <p class="text-sm text-[#64748b]">이메일로 6자리 인증코드를 받아 로그인하세요</p>
          </div>
          <label class="block text-xs font-semibold text-[#94a3b8] mb-1.5">이메일</label>
          <input
            v-model="email"
            type="email"
            placeholder="your@email.com"
            @keydown.enter="sendOtp()"
            class="w-full px-4 py-3 bg-[#0f1117] border border-[rgba(124,58,237,0.3)] rounded-lg text-sm text-white mb-3 outline-none"
            style="box-sizing:border-box"
          />
          <p v-if="err1" class="text-red-400 text-xs mb-3" style="white-space:pre-line">{{ err1 }}</p>
          <button
            @click="sendOtp()"
            :disabled="sending"
            type="button"
            class="w-full py-3.5 rounded-lg text-white text-sm font-bold"
            style="background:linear-gradient(135deg,#7c3aed,#4f46e5)"
          >{{ sending ? '⏳ 발송 중...' : '인증코드 받기 →' }}</button>
        </div>

        <!-- Step 2: OTP 입력 -->
        <div v-show="step === 2">
          <div class="text-center mb-6">
            <div class="text-4xl mb-3">✉️</div>
            <h2 class="text-lg font-extrabold text-white mb-1">인증코드 입력</h2>
            <p class="text-[#a78bfa] text-sm font-medium">{{ email }}</p>
            <p class="text-xs text-[#64748b] mt-1">이메일로 발송된 6자리 코드를 입력하세요</p>
          </div>

          <!-- OTP 6칸 -->
          <div class="flex gap-2 justify-center mb-5">
            <input
              v-for="i in 6"
              :key="i"
              :ref="(el) => { if (el) otpInputs[i-1] = el as HTMLInputElement }"
              type="text"
              maxlength="1"
              inputmode="numeric"
              class="text-center text-2xl font-black text-white outline-none"
              style="width:48px;height:56px;background:#0f1117;border:2px solid rgba(124,58,237,0.3);border-radius:10px"
              @input="onInput($event, i-1)"
              @keydown="onKey($event, i-1)"
              @paste="onPaste($event)"
            />
          </div>

          <p v-if="err2" class="text-red-400 text-xs mb-3 text-center" style="white-space:pre-line">{{ err2 }}</p>

          <button
            @click="verify()"
            :disabled="verifying"
            type="button"
            class="w-full py-3.5 rounded-lg text-white text-sm font-bold mb-4"
            style="background:linear-gradient(135deg,#7c3aed,#4f46e5)"
          >{{ verifying ? '⏳ 확인 중...' : '로그인 완료' }}</button>

          <div class="flex justify-center gap-5 text-xs">
            <button @click="step = 1" type="button" class="text-[#64748b] hover:text-white">← 이메일 다시 입력</button>
            <span class="text-[#1e293b]">·</span>
            <button @click="sendOtp(true)" type="button" class="text-[#a78bfa] hover:underline">코드 재발송</button>
          </div>
        </div>

        <!-- Step 3: 로딩 -->
        <div v-show="step === 3" class="text-center py-8">
          <div class="text-4xl mb-3 inline-block" style="animation:spin 1s linear infinite">⏳</div>
          <p class="text-sm text-[#94a3b8]">로그인 중...</p>
        </div>
      </div>
    </div>
  </div>

  <!-- spin 애니메이션 -->
  <component :is="'style'">
    @keyframes spin { to { transform: rotate(360deg); } }
  </component>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { requestOtp, verifyOtp as ssumVerifyOtp } from '@/api/ssum'

const { locale } = useI18n()
const auth = useAuthStore()

const step      = ref(1)
const email     = ref('')
const err1      = ref('')
const err2      = ref('')
const sending   = ref(false)
const verifying = ref(false)
const sessionToken = ref('')
const otpInputs = ref<HTMLInputElement[]>([])

// 모달 열릴 때 초기화
watch(() => auth.loginVisible, (v) => {
  if (v) { step.value = 1; email.value = ''; err1.value = ''; err2.value = '' }
})

function clearOtp() {
  otpInputs.value.forEach(el => { if (el) el.value = '' })
  err2.value = ''
}

function focusOtp(idx: number) {
  setTimeout(() => otpInputs.value[idx]?.focus(), 80)
}

async function sendOtp(resend = false) {
  const mail = email.value.trim()
  if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    err1.value = '올바른 이메일을 입력하세요'
    return
  }
  err1.value = ''
  sending.value = true
  step.value = 3

  try {
    const { data } = await requestOtp(mail, locale.value.slice(0, 2) || 'ko')
    if (data.status !== 'success') throw new Error(data.message || '발송 실패')
    sessionToken.value = data.session_token
    clearOtp()
    step.value = 2
    focusOtp(0)
  } catch (e: unknown) {
    step.value = 1
    err1.value = (e as Error).message || '발송 실패'
  } finally {
    sending.value = false
  }
}

async function verify() {
  const code = otpInputs.value.map(el => el?.value ?? '').join('')
  if (code.length !== 6) { err2.value = '6자리 코드를 모두 입력하세요'; return }

  verifying.value = true
  step.value = 3

  try {
    const { data: vd } = await ssumVerifyOtp(sessionToken.value, code)
    if (vd.status !== 'success') {
      const m = (vd.message ?? '').toLowerCase()
      throw new Error(
        m.includes('expired') || m.includes('invalid')
          ? '인증코드가 올바르지 않거나 만료됐습니다.\n코드 재발송 후 다시 시도하세요.'
          : (vd.message || '코드 오류')
      )
    }
    await auth.loginWithSsum(vd.user_token, email.value.trim())
    step.value = 1
    email.value = ''
  } catch (e: unknown) {
    step.value = 2
    err2.value = (e as Error).message || '오류가 발생했습니다. 다시 시도하세요.'
    clearOtp()
    focusOtp(0)
  } finally {
    verifying.value = false
  }
}

function onInput(e: Event, idx: number) {
  const el = e.target as HTMLInputElement
  el.value = el.value.replace(/\D/g, '').slice(-1)
  if (el.value && idx < 5) otpInputs.value[idx + 1]?.focus()
  if (idx === 5 && el.value) verify()
}

function onKey(e: KeyboardEvent, idx: number) {
  if (e.key === 'Backspace' && !(e.target as HTMLInputElement).value && idx > 0) {
    otpInputs.value[idx - 1]?.focus()
  }
}

function onPaste(e: ClipboardEvent) {
  e.preventDefault()
  const digits = (e.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, 6)
  if (!digits) return
  digits.split('').forEach((c, i) => { if (otpInputs.value[i]) otpInputs.value[i].value = c })
  otpInputs.value[Math.min(digits.length - 1, 5)]?.focus()
  if (digits.length === 6) verify()
}
</script>
