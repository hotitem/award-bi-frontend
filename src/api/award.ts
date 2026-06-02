import axios from 'axios'

const BASE = import.meta.env.VITE_AWARD_API ?? 'https://api.award.bi'

const award = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 12000,
})

// 토큰 자동 주입
award.interceptors.request.use(cfg => {
  const token = localStorage.getItem('award_bi_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// 401 자동 로그아웃
award.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('award_bi_token')
      localStorage.removeItem('award_bi_user')
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────
export const authSsumLogin   = (user_token: string, email?: string) => award.post('/auth/ssum/login', { user_token, email })
export const authAdminLogin  = (email: string, password: string)    => award.post('/auth/admin/login', { email, password })
export const authMe          = ()                                    => award.get('/auth/me')
export const authLogout      = ()                                    => award.post('/auth/logout')

// ── Verify ────────────────────────────────────
export const verifySearch    = (q: string)                           => award.get('/verify/search', { params: { q } })
export const verifyById      = (vc_id: string)                       => award.get(`/verify/${vc_id}`)
export const verifyBatch     = (batch_id: string)                    => award.get(`/verify/batch/${batch_id}`)
export const verifyBtcLatest = ()                                    => award.get('/verify/btc/latest')

// ── Stats ─────────────────────────────────────
export const getStats        = ()                                    => award.get('/stats')

// ── Brands ────────────────────────────────────
export const getBrand        = (slug: string)                        => award.get(`/brands/${slug}`)
export const getBrandAssets  = (slug: string, limit = 20)            => award.get(`/brands/${slug}/assets`, { params: { limit } })

// ── My Assets ─────────────────────────────────
export const myAssets        = ()                                    => award.get('/my/assets')
export const myAssetDetail   = (id: string)                          => award.get(`/my/assets/${id}`)
export const issueAsset      = (body: Record<string, unknown>)       => award.post('/my/assets/issue', body)
export const listForSale     = (id: string, price: number)           => award.post(`/my/assets/${id}/list`, { price_points: price })
export const delistAsset     = (id: string)                          => award.delete(`/my/assets/${id}/list`)

// ── Market ────────────────────────────────────
export const getMarket       = (params?: Record<string, unknown>)    => award.get('/market', { params })
export const buyAsset        = (listing_id: string)                  => award.post(`/market/${listing_id}/buy`)

// ── Short URL ─────────────────────────────────
export const resolveShortUrl = (code: string)                        => award.get(`/s/${code}`)
export const createShortUrl  = (target: string)                      => award.post('/s', { target })

// ── Declarations (Atelier) ────────────────────
export const getDeclarations = (status?: string)                     => award.get('/declarations', { params: { status } })
export const approveDecl     = (id: string)                          => award.post(`/declarations/${id}/approve`)
export const rejectDecl      = (id: string, reason: string)         => award.post(`/declarations/${id}/reject`, { reason })

// ── Admin ─────────────────────────────────────
export const adminStats      = ()                                    => award.get('/admin/stats')
export const adminUsers      = ()                                    => award.get('/admin/users')
export const adminBatches    = ()                                    => award.get('/admin/batches')
export const runBatch        = ()                                    => award.post('/admin/batch/run')

// ── API Keys ──────────────────────────────────
export const getApiKeys      = ()                                    => award.get('/my/api-keys')
export const createApiKey    = (label: string)                       => award.post('/my/api-keys', { label })
export const revokeApiKey    = (key_id: string)                      => award.delete(`/my/api-keys/${key_id}`)

export default award
