<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="auth.loginVisible"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        @click.self="auth.closeLogin()"
      >
        <div class="bg-bg-card border border-primary/30 rounded-xl p-10 w-full max-w-sm mx-4 relative shadow-lg shadow-black/50">
          <button @click="auth.closeLogin()" class="absolute top-4 right-4 text-txt-4 hover:text-txt-1 text-xl leading-none">✕</button>

          <!-- Step 1: 이메일 -->
          <div v-if="step === 1">
            <div class="text-center mb-7">
              <div class="text-4xl mb-3">⭐</div>
              <h2 class="text-xl font-extrabold text-txt-1 mb-1.5">{{ t('auth.title') }}</h2>
              <p class="text-sm text-txt-3">{{ t('auth.sub') }}</p>
            </div>
            <label class="block text-xs font-semibold text-txt-3 mb-1.5">{{ t('auth.email_label') }}</label>
            <input
              v-model="email"
              type="email"
              :placeholder="t('auth.email_placeholder')"
              @keydown.enter="sendOtp()"
              class="w-full px-3.5 py-3 bg-bg-0 border border-primary/30 rounded-md text-sm text-txt-1
                     focus:outline-none focus:border-primary/70 transition-colors mb-3"
            />
            <p v-if="err1" class="text-red-400 text-xs mb-3 whitespace-pre-line">{{ err1 }}</p>
            <button @click="sendOtp()" :disabled="sending" class="btn btn-primary w-full">
              {{ sending ? '⏳' : t('auth.send_otp') }}
            </button>
          </div>

          <!-- Step 2: OTP -->
          <div v-else-if="step === 2">
            <div class="text-center mb-6">
              <div class="text-4xl mb-3">✉️</div>
              <h2 class="text-lg font-extrabold text-txt-1 mb-1">{{ t('auth.otp_title') }}</h2>
              <p class="text-primary-light text-sm font-medium">{{ email }}</p>
              <p class="text-xs text-txt-3 mt-1">{{ t('auth.otp_sub') }}</p>
            </div>

            <!-- OTP 6칸 -->
            <div class="flex gap-2 justify-center mb-5">
              <input
                v-for="i in 6" :key="i"
                :ref="el => { if (el) otpRefs[i-1] = el as HTMLInputElement }"
                type="text"
                maxlength="1"
                inputmode="numeric"
                class="w-11 h-14 text-center text-2xl font-extrabold bg-bg-0
                       border-2 border-primary/30 rounded-md text-txt-1 outline-none
                       focus:border-primary transition-colors"
                @input="onOtpInput($event, i-1)"
                @keydown="onOtpKey($event, i-1)"
                @paste="onOtpPaste($event)"
              />
            </div>
            <p v-if="err2" class="text-red-400 text-xs mb-3 text-center whitespace-pre-line">{{ err2 }}</p>

            <button @click="verifyOtp()" :disabled="verifying" class="btn btn-primary w-full mb-4">
              {{ verifying ? '⏳' : t('auth.verify_btn') }}
            </button>
            <div class="flex justify-center gap-4 text-xs">
              <button @click="step = 1" class="text-txt-3 hover:text-txt-1 transition-colors">{{ t('auth.back') }}</button>
              <span class="text-white/10">·</span>
              <button @click="sendOtp(true)" class="text-primary-light hover:underline">{{ t('auth.resend') }}</button>
            </div>
          </div>

          <!-- Step 3: 로딩 -->
          <div v-else class="text-center py-6">
            <div class="text-4xl mb-3 animate-spin inline-block">⏳</div>
            <p class="text-sm text-txt-3">로그인 중...</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { requestOtp, verifyOtp as ssumVerifyOtp } from '@/api/ssum'

const { t, locale } = useI18n()
const auth = useAuthStore()

const step       = ref(1)
const email      = ref('')
const err1       = ref('')
const err2       = ref('')
const sending    = ref(false)
const verifying  = ref(false)
const sessionToken = ref('')
const otpRefs    = ref<HTMLInputElement[]>([])

function resetOtpInputs() {
  otpRefs.value.forEach(el => { if (el) el.value = '' })
  err2.value = ''
}

async function sendOtp(resend = false) {
  const mail = email.value.trim()
  if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    err1.value = t('auth.err_email')
    return
  }
  err1.value = ''
  sending.value = true
  step.value = 3

  try {
    const { data } = await requestOtp(mail, locale.value.slice(0, 2))
    if (data.status !== 'success') throw new Error(data.message)
    sessionToken.value = data.session_token
    resetOtpInputs()
    step.value = 2
    setTimeout(() => otpRefs.value[0]?.focus(), 100)
  } catch (e: unknown) {
    step.value = 1
    err1.value = (e as Error).message || '발송 실패'
  } finally {
    sending.value = false
  }
}

async function verifyOtp() {
  const code = otpRefs.value.map(el => el?.value ?? '').join('')
  if (code.length !== 6) { err2.value = t('auth.err_code'); return }

  verifying.value = true
  step.value = 3

  try {
    // 1. ssum OTP 검증
    const { data: verData } = await ssumVerifyOtp(sessionToken.value, code)
    if (verData.status !== 'success') {
      const m = (verData.message ?? '').toLowerCase()
      throw new Error(
        m.includes('expired') || m.includes('invalid')
          ? t('auth.err_otp')
          : verData.message || t('auth.err_otp')
      )
    }
    // 2. award.bi JWT 발급
    await auth.loginWithSsum(verData.user_token, email.value.trim())
    step.value = 1
    email.value = ''
  } catch (e: unknown) {
    step.value = 2
    err2.value = (e as Error).message || t('auth.err_server')
    resetOtpInputs()
    setTimeout(() => otpRefs.value[0]?.focus(), 50)
  } finally {
    verifying.value = false
  }
}

function onOtpInput(e: Event, idx: number) {
  const el = e.target as HTMLInputElement
  const val = el.value.replace(/\D/g, '')
  el.value = val.slice(-1)
  if (el.value && idx < 5) otpRefs.value[idx + 1]?.focus()
  if (idx === 5 && el.value) verifyOtp()
}

function onOtpKey(e: KeyboardEvent, idx: number) {
  if (e.key === 'Backspace' && !(e.target as HTMLInputElement).value && idx > 0) {
    otpRefs.value[idx - 1]?.focus()
  }
}

function onOtpPaste(e: ClipboardEvent) {
  e.preventDefault()
  const digits = (e.clipboardData?.getData('text') ?? '')
    .replace(/\D/g, '').slice(0, 6)
  if (!digits) return
  digits.split('').forEach((c, i) => {
    if (otpRefs.value[i]) otpRefs.value[i].value = c
  })
  otpRefs.value[Math.min(digits.length - 1, 5)]?.focus()
  if (digits.length === 6) verifyOtp()
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity .2s, transform .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.96); }
</style>
