import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authSsumLogin, authAdminLogin, authMe } from '@/api/award'
import router from '@/router'

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
  const isReady      = ref(false)   // restoreSession 완료 여부

  const isLoggedIn  = computed(() => !!user.value)
  const isAtelier   = computed(() => ['atelier','admin'].includes(user.value?.role ?? ''))
  const isAdmin     = computed(() => user.value?.role === 'admin')

  async function restoreSession() {
    const token = localStorage.getItem('award_bi_token')
    if (!token) { isReady.value = true; return false }
    try {
      const { data } = await authMe()
      if (data.ok) {
        const saved = JSON.parse(localStorage.getItem('award_bi_user') ?? '{}')
        user.value = { ...data.user, ...saved }
        awardToken.value = token
        isReady.value = true
        return true
      }
    } catch {}
    logout()
    isReady.value = true
    return false
  }

  // ssum OTP 인증 완료 후 호출 — email을 API에 전달하여 admin 체크
  async function loginWithSsum(userToken: string, email: string) {
    const { data } = await authSsumLogin(userToken, email)
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
    // 관리자/아뜰리에 계정이면 아뜰리에 대시보드로 이동
    if (data.user.redirect_atelier) {
      router.push('/atelier')
    }
  }

  // 이메일+비밀번호 관리자 로그인
  async function loginAsAdmin(email: string, password: string) {
    const { data } = await authAdminLogin(email, password)
    if (!data.ok) throw new Error('관리자 인증 실패')
    awardToken.value = data.token
    user.value = {
      user_id:        data.user.user_id ?? '',
      w3c_did:        data.user.privy_did ?? '',
      email:          data.user.email,
      role:           'admin',
      award_site_key: data.user.award_site_key ?? '',
      ssum_points:    0,
      vc_count:       0,
    }
    localStorage.setItem('award_bi_token', data.token)
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
    restoreSession, loginWithSsum, loginAsAdmin, logout, openLogin, closeLogin,
    isReady,
  }
})
