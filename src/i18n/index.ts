import { createI18n } from 'vue-i18n'
import ko from './ko'
import en from './en'
import ja from './ja'
import zhCN from './zh-CN'
import vi from './vi'
import th from './th'
import id from './id'
import fr from './fr'
import de from './de'
import es from './es'
import ar from './ar'
import pt from './pt'

export const LOCALES = [
  { code: 'en',    label: 'English',    flag: '🇺🇸', dir: 'ltr' },
  { code: 'ko',    label: '한국어',      flag: '🇰🇷', dir: 'ltr' },
  { code: 'ja',    label: '日本語',      flag: '🇯🇵', dir: 'ltr' },
  { code: 'zh-CN', label: '中文',        flag: '🇨🇳', dir: 'ltr' },
  { code: 'vi',    label: 'Tiếng Việt', flag: '🇻🇳', dir: 'ltr' },
  { code: 'th',    label: 'ภาษาไทย',    flag: '🇹🇭', dir: 'ltr' },
  { code: 'id',    label: 'Indonesia',  flag: '🇮🇩', dir: 'ltr' },
  { code: 'fr',    label: 'Français',   flag: '🇫🇷', dir: 'ltr' },
  { code: 'de',    label: 'Deutsch',    flag: '🇩🇪', dir: 'ltr' },
  { code: 'es',    label: 'Español',    flag: '🇪🇸', dir: 'ltr' },
  { code: 'ar',    label: 'العربية',    flag: '🇸🇦', dir: 'rtl' },
  { code: 'pt',    label: 'Português',  flag: '🇧🇷', dir: 'ltr' },
]

const SUPPORTED = LOCALES.map(l => l.code)

function detectLocale(): string {
  // 1. 저장된 선호 언어
  const saved = localStorage.getItem('award_bi_locale')
  if (saved && SUPPORTED.includes(saved)) return saved

  // 2. 브라우저 언어 감지 (navigator.languages 전체 탐색)
  for (const lang of navigator.languages ?? [navigator.language]) {
    const code = lang.slice(0, 5) // zh-CN 형태
    if (SUPPORTED.includes(code)) return code
    const short = lang.slice(0, 2)
    const match = SUPPORTED.find(s => s.startsWith(short))
    if (match) return match
  }

  // 3. 영어 기본값
  return 'en'
}

export function setLocale(code: string) {
  if (!SUPPORTED.includes(code)) return
  i18n.global.locale.value = code as typeof i18n.global.locale.value
  localStorage.setItem('award_bi_locale', code)
  document.documentElement.lang = code
  const locale = LOCALES.find(l => l.code === code)
  document.documentElement.dir = locale?.dir ?? 'ltr'
  updateHreflang(code)
}

function updateHreflang(current: string) {
  // 기존 hreflang 제거
  document.querySelectorAll('link[rel="alternate"]').forEach(el => el.remove())
  const base = 'https://award.bi'
  const path = window.location.pathname
  LOCALES.forEach(({ code }) => {
    const link = document.createElement('link')
    link.rel = 'alternate'
    link.hreflang = code
    link.href = `${base}${path}?lang=${code}`
    document.head.appendChild(link)
  })
  // x-default
  const xDefault = document.createElement('link')
  xDefault.rel = 'alternate'
  xDefault.hreflang = 'x-default'
  xDefault.href = `${base}${path}`
  document.head.appendChild(xDefault)
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: { ko, en, ja, 'zh-CN': zhCN, vi, th, id, fr, de, es, ar, pt },
})

// 초기 HTML lang/dir 설정
const initial = detectLocale()
document.documentElement.lang = initial
const initLocale = LOCALES.find(l => l.code === initial)
document.documentElement.dir = initLocale?.dir ?? 'ltr'
