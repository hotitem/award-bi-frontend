import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/verify',
      name: 'verify',
      component: () => import('@/views/VerifyView.vue'),
    },
    {
      path: '/brand/:slug',
      name: 'brand',
      component: () => import('@/views/BrandView.vue'),
    },
    // 단축 URL — /s/:code → QR 랜딩 or VC 검증
    {
      path: '/s/:code',
      name: 'short',
      component: () => import('@/views/ShortUrlView.vue'),
    },
    // 회원 전용
    {
      path: '/my',
      name: 'mypage',
      component: () => import('@/views/MyPageView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/my/issue',
      name: 'issue',
      component: () => import('@/views/IssueView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/my/market',
      name: 'market',
      component: () => import('@/views/MarketView.vue'),
      meta: { requiresAuth: true },
    },
    // 아뜰리에
    {
      path: '/atelier',
      name: 'atelier',
      component: () => import('@/views/AtelierView.vue'),
      meta: { requiresRole: ['atelier', 'admin'] },
    },
    // 관리자
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
      meta: { requiresRole: ['admin'] },
    },
    // Open API 문서
    {
      path: '/api',
      name: 'api-docs',
      component: () => import('@/views/ApiDocsView.vue'),
    },
    // 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // restoreSession()이 완료될 때까지 대기 (페이지 새로고침 시 race condition 방지)
  if (!auth.isReady) {
    await new Promise<void>(resolve => {
      const unwatch = watch(() => auth.isReady, (ready) => {
        if (ready) { unwatch(); resolve() }
      })
    })
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    auth.openLogin()
    return false
  }

  if (to.meta.requiresRole) {
    const roles = to.meta.requiresRole as string[]
    if (!auth.isLoggedIn) {
      auth.openLogin()
      return false
    }
    if (!roles.includes(auth.user?.role ?? '')) {
      return { name: 'home' }
    }
  }
})

export default router
