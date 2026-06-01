import axios from 'axios'

const BASE     = import.meta.env.VITE_SSUM_API      ?? 'https://api.ssum.app'
const SITE_KEY = import.meta.env.VITE_SSUM_SITE_KEY ?? 'ssum_sk_live_award_bi_002'

const ssum = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

ssum.interceptors.request.use(cfg => {
  const token = localStorage.getItem('ssum_user_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const requestOtp = (email: string, lang: string) =>
  ssum.post('/v1/auth/request-otp', {
    site_key: SITE_KEY,
    email,
    lang,
    device_meta: { platform: navigator.userAgent.slice(0, 80) },
  })

export const verifyOtp = (session_token: string, otp_code: string) =>
  ssum.post('/v1/auth/verify-otp', { session_token, otp_code })

export const ssumMe = () =>
  ssum.get('/v1/auth/me')

export default ssum
