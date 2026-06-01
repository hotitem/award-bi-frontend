import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authSsumLogin, authMe } from '@/api/award'

export interface AwardUser {
  user_id:       string
  w3c_did:       string
  email?:        string
  role:          string
  award_site_key:string
  ssum_points:   number
  vc_count:      number
}

export const useAuthStore = defineStore('auth', () => {
  const user         = ref<AwardUser | null>(null)
  const awardToken   = ref(localStorage.getItem('award_bi_token') ?? '')
  const ssumToken    = ref(localStorage.getItem('ssum_user_token') ?? '')
  const loginVisible = ref(false)

  const isLoggedIn  = computed(() => !!user.value)
  const isAtelier   = computed(() => ['atelier','admin'].includes(user.value?.role ?? ''))
  const isAdmin     = computed(() => user.value?.role === 'admin')

  async function restoreSession() {
    const token = localStorage.getItem('award_bi_token')
    if (!token) return false
    try {
      const { data } = await authMe()
      if (data.ok) {
        const saved = JSON.parse(localStorage.getItem('award_bi_user') ?? '{}')
        user.value = { ...data.user, ...saved }
        awardToken.value = token
        return true
      }
    } catch {}
    logout()
    return false
  }

  // ssum OTP 인증 완료 후 호출
  async function loginWithSsum(userToken: string, email: string) {
    const { data } = await authSsumLogin(userToken)
    if (!data.ok) throw new Error('award.bi 인증 실패')
    awardToken.value = data.token
    ssumToken.value = userToken
    user.value = {
      user_id:        data.user.user_id ?? '',
      w3c_did:        data.user.w3c_did,
      email,
      role:           data.user.role,
      award_site_key: data.user.award_site_key,
      ssum_points:    data.user.ssum_points ?? 0,
      vc_count:       data.user.vc_count ?? 0,
    }
    localStorage.setItem('award_bi_token', data.token)
    localStorage.setItem('ssum_user_token', userToken)
    localStorage.setItem('award_bi_user', JSON.stringify(user.value))
    loginVisible.value = false
  }

  function logout() {
    user.value = null
    awardToken.value = ''
    ssumToken.value = ''
    localStorage.removeItem('award_bi_token')
    localStorage.removeItem('ssum_user_token')
    localStorage.removeItem('award_bi_user')
  }

  function openLogin()  { loginVisible.value = true }
  function closeLogin() { loginVisible.value = false }

  return {
    user, awardToken, ssumToken, loginVisible,
    isLoggedIn, isAtelier, isAdmin,
    restoreSession, loginWithSsum, logout, openLogin, closeLogin,
  }
})
