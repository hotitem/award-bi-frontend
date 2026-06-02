import { createRouter, createWebHistory } from 'vue-router'
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
    {
      path: '/s/:code',
      name: 'short',
      component: () => import('@/views/ShortUrlView.vue'),
    },
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
    {
      path: '/atelier',
      name: 'atelier',
      component: () => import('@/views/AtelierView.vue'),
      meta: { requiresRole: ['atelier', 'admin'] },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
      meta: { requiresRole: ['admin'] },
    },
    {
      path: '/api',
      name: 'api-docs',
      component: () => import('@/views/ApiDocsView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

// localStorage에서 즉시 복원한 user 정보로 라우터 가드 (동기, deadlock 없음)
router.beforeEach((to) => {
  const auth = useAuthStore()

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
