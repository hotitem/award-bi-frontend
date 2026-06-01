<template>
  <footer class="bg-bg-1 border-t border-white/[0.07]">
    <div class="container py-12">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
        <!-- 브랜드 -->
        <div class="col-span-2 md:col-span-1">
          <div class="flex items-center gap-2 font-black text-lg mb-3">
            <span class="w-8 h-8 rounded-lg bg-grad-purple flex items-center justify-center text-sm">⭐</span>
            <span class="text-gradient">award.bi</span>
          </div>
          <p class="text-xs text-txt-3 leading-relaxed mb-4">
            award.bi는 kei.bio 포인트 자산 인증 플랫폼입니다.<br>
            W3C VC · SBT · NFT · Bitcoin 각인으로<br>
            K-Beauty 브랜드 자산을 영구 인증합니다.
          </p>
          <div class="flex gap-2">
            <span class="badge badge-gold text-[10px]">⚓ Bitcoin 각인</span>
            <span class="badge badge-purple text-[10px]">📜 W3C VC</span>
          </div>
        </div>

        <!-- 서비스 -->
        <div>
          <div class="text-xs font-bold text-txt-3 uppercase tracking-wider mb-4">서비스</div>
          <div class="space-y-2.5">
            <RouterLink v-for="l in serviceLinks" :key="l.to" :to="l.to"
              class="block text-sm text-txt-3 hover:text-txt-1 transition-colors">{{ l.label }}</RouterLink>
          </div>
        </div>

        <!-- 기술 -->
        <div>
          <div class="text-xs font-bold text-txt-3 uppercase tracking-wider mb-4">기술</div>
          <div class="space-y-2.5">
            <span v-for="t in techLinks" :key="t" class="block text-sm text-txt-3">{{ t }}</span>
          </div>
        </div>

        <!-- 링크 -->
        <div>
          <div class="text-xs font-bold text-txt-3 uppercase tracking-wider mb-4">링크</div>
          <div class="space-y-2.5">
            <a v-for="l in extLinks" :key="l.href" :href="l.href" target="_blank"
              class="block text-sm text-txt-3 hover:text-primary-light transition-colors">{{ l.label }}</a>
          </div>
        </div>
      </div>

      <div class="border-t border-white/[0.07] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <p class="text-xs text-txt-4">© 2026 award.bi · Powered by kei.bio · Bitcoin 영구 각인</p>
        <div class="flex gap-4 text-xs text-txt-4">
          <span>이용약관</span>
          <span>개인정보처리방침</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

const serviceLinks = [
  { to: '/#about', label: '서비스 소개' },
  { to: '/brand/esco', label: '브랜드 탐색' },
  { to: '/verify', label: '인증서 검색' },
  { to: '/my/issue', label: 'NFT · SBT' },
]
const techLinks = ['W3C VC 표준', 'Bitcoin 각인', 'Bitcoin 각인', 'API 문서']
const extLinks = [
  { href: 'https://kei.bio', label: 'kei.bio ↗' },
  { href: 'https://api.kei.bio', label: 'api.kei.bio ↗' },
  { href: '#', label: '공지사항' },
  { href: '#', label: 'Forum' },
]
</script>
