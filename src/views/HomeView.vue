<template>
  <div class="bg-bg-0 min-h-screen">

  <!-- ── Hero ─────────────────────────────────────────────── -->
  <section class="relative min-h-screen flex items-center overflow-hidden">
    <!-- 배경 오브 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute w-[800px] h-[800px] -top-64 -left-64 bg-primary/10 rounded-full blur-[120px]" />
      <div class="absolute w-[500px] h-[500px] top-1/2 right-0 bg-[#4f46e5]/10 rounded-full blur-[100px]" />
    </div>

    <div class="container relative z-10 py-20">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- 좌 -->
        <div>
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-txt-3 uppercase tracking-widest mb-6">
            ⭐ K-BEAUTY · IDENTITY · AWARD · BITCOIN
          </div>
          <h1 class="text-6xl md:text-8xl font-black leading-[0.95] mb-4">
            <span class="text-txt-1">BEAUTY</span><br>
            <span class="text-txt-1">IDENTITY</span><br>
            <span class="bg-grad-purple bg-clip-text text-transparent">AWARD</span>
          </h1>
          <p class="text-xl text-txt-3 font-light italic mb-4">Global Inscription Platform</p>
          <p class="text-base text-txt-3 leading-relaxed mb-8 max-w-md">
            비트코인에 당신의 브랜드를, 세계로 연결된다.<br>
            W3C 국제 표준 VC · SBT · NFT 발행으로<br>
            K-Beauty 자산을 영구 인증하세요.
          </p>
          <div class="flex gap-3 flex-wrap mb-12">
            <a href="https://kei.bio" target="_blank" class="btn btn-primary px-6 py-3 text-base">🚀 브랜드 등록하기</a>
            <RouterLink to="/verify" class="btn btn-outline px-6 py-3 text-base">🔍 인증 확인하기</RouterLink>
          </div>
          <!-- 하단 통계 -->
          <div class="flex gap-8 flex-wrap">
            <div v-for="s in heroStats" :key="s.label">
              <div class="text-2xl font-black" :class="s.color">{{ s.value }}</div>
              <div class="text-xs text-txt-4">{{ s.label }}</div>
            </div>
          </div>
        </div>

        <!-- 우 — 실시간 위젯 -->
        <div class="flex flex-col gap-4">
          <!-- Real-time Status -->
          <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold text-txt-3 uppercase tracking-wider">⚡ REAL TIME STATUS</span>
              <span class="flex items-center gap-1.5 text-xs text-success-light">
                <span class="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> LIVE
              </span>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-bg-0 rounded-md p-3 text-center">
                <div class="text-2xl font-black text-primary-light">{{ btc.totalVcs.toLocaleString() || '—' }}</div>
                <div class="text-[10px] text-txt-3">VC 발행</div>
              </div>
              <div class="bg-bg-0 rounded-md p-3 text-center">
                <div class="text-2xl font-black text-gold">{{ btc.latestBatches.length || '—' }}</div>
                <div class="text-[10px] text-txt-3">배치</div>
              </div>
              <div class="bg-bg-0 rounded-md p-3 text-center">
                <div class="text-2xl font-black text-success-light">{{ btc.totalInscribed || '—' }}</div>
                <div class="text-[10px] text-txt-3">확인 ✓</div>
              </div>
            </div>
          </div>

          <!-- Featured Asset -->
          <div v-if="featuredAsset" class="card p-4 flex items-center gap-4 cursor-pointer hover:border-primary/30 transition-colors"
               @click="router.push(`/verify?id=${featuredAsset.vc_id}`)">
            <div class="w-14 h-14 rounded-lg overflow-hidden bg-bg-0 border border-white/10 flex-shrink-0 flex items-center justify-center">
              <template v-if="isVideo(featuredAsset.source_url as string, featuredAsset.asset_class as string)">
                <span class="text-2xl">🎬</span>
              </template>
              <img v-else-if="featuredAsset.source_url" :src="featuredAsset.source_url as string"
                   class="w-full h-full object-cover"
                   @error="(e) => (e.target as HTMLImageElement).style.display='none'" />
              <span v-else class="text-2xl">🧴</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-txt-1 text-sm truncate">
                {{ featuredAsset.asset_metadata?.title ?? featuredAsset.asset_class }}
              </div>
              <div class="text-xs text-txt-4">by kei.bio/esco</div>
              <div class="flex gap-1.5 mt-1.5">
                <span class="badge badge-green text-[9px]">✓ award.bi 인증</span>
                <span class="badge badge-purple text-[9px]">⭐ SBT</span>
                <span class="badge badge-gold text-[9px]">⚓ 각인</span>
              </div>
            </div>
            <button class="btn btn-outline btn-sm text-xs">🔍 검증</button>
          </div>

          <!-- Bitcoin 카운트다운 -->
          <div class="card p-5 bg-[#1a1205] border-gold/20">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold text-gold">⚓ 다음 BITCOIN 각인</span>
              <span class="badge badge-gold text-[9px]">매일 1회</span>
            </div>
            <div class="text-4xl font-black font-mono text-gold mb-3">{{ countdown }}</div>
            <div class="space-y-1.5 text-xs text-txt-4">
              <div class="flex justify-between">
                <span>자정 KST 배치 실행</span>
              </div>
              <div class="flex items-center justify-between">
                <span>대기 중 VC</span>
                <div class="flex items-center gap-2">
                  <div class="w-20 h-1.5 bg-bg-0 rounded-full overflow-hidden">
                    <div class="h-full bg-gold rounded-full transition-all" :style="`width:${Math.min(100, (btc.totalVcs % 500) / 5)}%`" />
                  </div>
                  <span class="text-gold font-mono font-bold">{{ btc.totalVcs % 500 }}</span>
                </div>
              </div>
              <div class="flex justify-between" v-if="btc.blockHeight">
                <span>최신 블록</span>
                <span class="text-txt-2 font-mono">#{{ btc.blockHeight.toLocaleString() }} ✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Live Ticker ──────────────────────────────────────── -->
  <div class="border-y border-white/[0.07] bg-bg-1 py-2.5 overflow-hidden">
    <div class="flex animate-ticker whitespace-nowrap">
      <span v-for="(item, i) in [...tickerItems, ...tickerItems]" :key="i"
            class="inline-flex items-center gap-2 mx-6 text-xs text-txt-3">
        <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="item.color" />
        {{ item.text }}
      </span>
    </div>
  </div>

  <!-- ── Bitcoin 각인 ─────────────────────────────────────── -->
  <section id="bitcoin" class="py-24 bg-bg-0">
    <div class="container">
      <div class="text-center mb-16">
        <div class="section-tag">⚓ BITCOIN DAILY INSCRIPTION</div>
        <h2 class="text-4xl md:text-5xl font-black text-txt-1 mb-4">
          매일 1회 Bitcoin에<br><span class="text-gold">모든 자산을 영구 각인합니다</span>
        </h2>
        <p class="text-txt-3 max-w-lg mx-auto">
          머클 트리 → Bitcoin 블록체인 영구 각인<br>서버가 꺼져도 비트코인은 영원합니다
        </p>
      </div>

      <!-- 5단계 플로우 -->
      <div class="flex items-center justify-center gap-0 mb-16 flex-wrap">
        <div v-for="(step, i) in btcFlow" :key="i" class="flex items-center">
          <div class="card p-5 text-center w-36" :class="step.active ? 'border-gold/40 bg-gold/5' : ''">
            <div class="text-3xl mb-2">{{ step.icon }}</div>
            <div class="text-xs font-bold text-txt-1 mb-0.5">{{ step.title }}</div>
            <div class="text-[10px] text-txt-4">{{ step.sub }}</div>
          </div>
          <div v-if="i < btcFlow.length-1" class="text-txt-4 mx-1">→</div>
        </div>
      </div>

      <!-- 각인 통계 + 최근 이력 -->
      <div class="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div class="card p-6">
          <div class="text-xs font-bold text-txt-3 mb-4 uppercase tracking-wider">🔢 각인 통계</div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-3xl font-black text-gold">{{ btc.latestBatches.length }}</div>
              <div class="text-xs text-txt-4">총 배치 수</div>
            </div>
            <div>
              <div class="text-3xl font-black text-success-light">{{ btc.totalVcs.toLocaleString() }}</div>
              <div class="text-xs text-txt-4">총 각인 VC</div>
            </div>
            <div>
              <div class="text-3xl font-black text-primary-light">{{ btc.blockHeight?.toLocaleString() ?? '—' }}</div>
              <div class="text-xs text-txt-4">최신 블록</div>
            </div>
            <div>
              <div class="text-3xl font-black text-txt-1">100%</div>
              <div class="text-xs text-txt-4">무결성 보장</div>
            </div>
          </div>
        </div>
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-bold text-txt-3 uppercase tracking-wider">🟢 최근 각인 이력</span>
          </div>
          <div class="space-y-2.5">
            <div v-for="batch in btc.latestBatches.slice(0,4)" :key="batch.batch_id"
                 class="flex items-center justify-between text-sm">
              <span class="text-txt-3 text-xs">{{ batch.batch_date }}</span>
              <span v-if="batch.btc_block_height" class="font-mono text-xs text-txt-2">#{{ Number(batch.btc_block_height).toLocaleString() }}</span>
              <span v-else class="text-[10px] text-gold">제출 중</span>
              <span class="badge text-[9px]" :class="batch.ots_status==='confirmed'?'badge-green':'badge-gold'">
                {{ batch.ots_status==='confirmed' ? `✓${batch.vc_count}건` : `⏳${batch.vc_count}건` }}
              </span>
            </div>
            <RouterLink to="/verify" class="block text-xs text-primary-light hover:underline mt-2">전체 각인 이력 보기 →</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Global Activity Map ──────────────────────────────── -->
  <section class="py-24 bg-bg-1">
    <div class="container">
      <div class="grid lg:grid-cols-2 gap-12">
        <!-- 지도 -->
        <div>
          <div class="section-tag">🌐 GLOBAL ACTIVITY MAP</div>
          <h2 class="section-title">실시간 글로벌 인증 현황</h2>
          <div ref="mapEl" class="h-72 rounded-xl overflow-hidden border border-white/[0.07] mt-4" />
          <div class="flex gap-6 mt-4">
            <div><span class="text-lg font-black text-primary-light">8,241+</span><span class="text-xs text-txt-4 ml-1">서울</span></div>
            <div><span class="text-lg font-black text-success-light">2,165+</span><span class="text-xs text-txt-4 ml-1">글로벌</span></div>
            <div><span class="text-lg font-black text-gold">42+</span><span class="text-xs text-txt-4 ml-1">파트너</span></div>
          </div>
        </div>

        <!-- 인기 브랜드 -->
        <div>
          <div class="section-tag">🔥 TRENDING</div>
          <h2 class="section-title">인기 브랜드</h2>
          <div class="space-y-3 mt-4">
            <div v-for="(brand, i) in trendingBrands" :key="brand.name"
                 class="card-hover p-4 flex items-center gap-4">
              <div class="text-lg font-black text-txt-4 w-6 text-center">{{ i+1 }}</div>
              <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                   :style="`background:${brand.color}22;`">{{ brand.icon }}</div>
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-txt-1 text-sm">{{ brand.name }}</div>
                <div class="text-xs text-txt-3">{{ brand.sub }}</div>
              </div>
              <div class="text-success-light text-sm font-bold shrink-0">+{{ brand.growth }}%</div>
            </div>
            <RouterLink to="https://kei.bio" target="_blank"
              class="block w-full text-center py-3 text-sm text-primary-light border border-primary/20 rounded-md hover:bg-primary/10 transition-colors">
              내 브랜드 인증 현황 확인
            </RouterLink>
            <a href="https://kei.bio" target="_blank" class="btn btn-primary w-full justify-center">
              kei.bio에서 등록하기 →
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── 자산 인증 카테고리 ────────────────────────────────── -->
  <section id="about" class="py-24 bg-bg-0">
    <div class="container">
      <div class="text-center mb-16">
        <div class="section-tag">⭐ 2026 AWARD CATEGORIES</div>
        <h2 class="section-title">자산 인증 <span>카테고리</span></h2>
        <p class="text-txt-3 max-w-lg mx-auto">W3C 국제 표준을 기반으로 6가지 자산 유형을 비트코인에 영구 각인합니다</p>
      </div>
      <div class="grid md:grid-cols-3 gap-5">
        <div v-for="cat in categories" :key="cat.title"
             class="card-hover p-6 group cursor-pointer" @click="router.push(cat.link)">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" :style="`background:${cat.color}22`">
              {{ cat.icon }}
            </div>
            <span class="text-txt-4 group-hover:text-primary-light transition-colors text-lg">↗</span>
          </div>
          <h3 class="font-bold text-txt-1 mb-2">{{ cat.title }}</h3>
          <p class="text-xs text-txt-3 leading-relaxed mb-4">{{ cat.desc }}</p>
          <div>
            <div class="text-2xl font-black" :style="`color:${cat.color}`">{{ cat.count }}</div>
            <div class="text-xs text-txt-4">{{ cat.unit }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Featured Brand (ESCO 실시간) ─────────────────────── -->
  <section class="py-24 bg-bg-1">
    <div class="container">
      <div class="text-center mb-12">
        <div class="section-tag">🏆 FEATURED BRAND</div>
        <h2 class="section-title">인증 브랜드 <span>쇼케이스</span></h2>
        <p class="text-txt-3">award.bi 아뜰리에가 인증한 K-Beauty 브랜드의 자산을 확인하세요</p>
      </div>

      <div class="card p-6 max-w-4xl mx-auto">
        <!-- ESCO 브랜드 헤더 -->
        <div class="flex items-center gap-5 mb-8 flex-wrap">
          <div class="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center text-3xl shrink-0">🧴</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <h3 class="text-xl font-black text-txt-1">ESCO</h3>
              <span class="badge badge-green text-[10px]">✓ Kei 공식인증</span>
              <span class="badge badge-purple text-[10px]">⭐ award.bi 아뜰리에</span>
            </div>
            <p class="text-xs text-txt-3">escobeauty.co.kr · K-Beauty 스킨케어 브랜드 · 제주 감귤 성분 특화</p>
          </div>
          <div class="flex items-center gap-6 shrink-0">
            <div class="text-center">
              <div class="text-2xl font-black text-primary-light">{{ escoAssets.length }}</div>
              <div class="text-[10px] text-txt-4">SBT</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-black text-gold">{{ escoConfirmed }}</div>
              <div class="text-[10px] text-txt-4">각인</div>
            </div>
            <RouterLink to="/brand/esco" class="btn btn-outline btn-sm">전체 보기 →</RouterLink>
          </div>
        </div>

        <!-- 자산 그리드 -->
        <div v-if="escoAssets.length" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="asset in escoAssets.slice(0,4)" :key="asset.declaration_id"
               class="cursor-pointer group" @click="router.push(`/verify?id=${asset.vc_id}`)">
            <div class="relative aspect-[3/4] rounded-xl overflow-hidden bg-bg-0 border border-white/5 mb-2">
              <!-- 영상 자산 -->
              <template v-if="isVideo(asset.source_url as string, asset.asset_class as string)">
                <div v-if="homeVideoErrors[asset.declaration_id as string]"
                     class="w-full h-full flex flex-col items-center justify-center gap-1">
                  <span class="text-3xl">🎬</span>
                  <span class="text-[9px] text-txt-4">브랜드 영상</span>
                </div>
                <template v-else>
                  <video :src="asset.source_url as string"
                         class="w-full h-full object-cover"
                         muted loop playsinline preload="metadata"
                         @error="homeVideoErrors[asset.declaration_id as string] = true"
                         @mouseenter="(e) => (e.target as HTMLVideoElement).play().catch(()=>{})"
                         @mouseleave="(e) => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0 }" />
                  <div class="absolute inset-0 flex items-center justify-center opacity-60 group-hover:opacity-0 transition-opacity pointer-events-none">
                    <div class="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white">▶</div>
                  </div>
                </template>
              </template>
              <!-- 이미지 자산 -->
              <img v-else-if="asset.source_url" :src="asset.source_url as string"
                   class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div v-else class="w-full h-full flex items-center justify-center text-4xl opacity-30">
                {{ assetIcon(asset.asset_class as string) }}
              </div>

              <div class="absolute top-2 left-2">
                <span class="badge badge-purple text-[9px]">{{ assetLabel(asset.asset_class as string) }}</span>
              </div>
              <div class="absolute top-2 right-2">
                <span class="badge badge-gold text-[9px]">⭐ award.bi</span>
              </div>
              <div class="absolute bottom-2 left-2">
                <span class="badge badge-purple text-[9px]">⭐ {{ asset.token_category }}</span>
              </div>
            </div>
            <div class="text-xs font-semibold text-txt-1 truncate mb-1">
              {{ (asset.asset_metadata as Record<string,string>)?.title ?? asset.asset_class }}
            </div>
            <div class="flex gap-1 flex-wrap">
              <span class="badge badge-green text-[9px]">⭐ award.bi 인증</span>
              <span class="badge badge-gold text-[9px]">🔍 {{ asset.token_category }}</span>
            </div>
          </div>
        </div>
        <div v-else-if="escoLoading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="aspect-[3/4] rounded-xl bg-white/5 animate-pulse" />
        </div>

        <RouterLink to="/brand/esco" class="block text-center text-sm text-primary-light hover:underline mt-6">
          ESCO 전체 인증 자산 보기 →
        </RouterLink>
      </div>
    </div>
  </section>

  <!-- ── 파트너 채널 라이브 자산 피드 ──────────────────────── -->
  <section class="py-20 bg-bg-0 border-t border-white/[0.05]">
    <div class="container">
      <div class="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <div class="section-tag">📡 LIVE ASSET FEED</div>
          <h2 class="section-title">파트너 채널 <span>실시간 자산</span></h2>
          <p class="text-txt-3 text-sm mt-1">kei.bio에서 수신된 자산이 자동으로 업데이트됩니다</p>
        </div>
        <!-- 상태 필터 탭 -->
        <div class="flex items-center gap-2 flex-wrap">
          <button v-for="f in feedFilters" :key="f.key"
            @click="feedFilter = f.key; loadFeed()"
            class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            :class="feedFilter === f.key
              ? 'bg-primary text-white'
              : 'bg-white/5 text-txt-3 hover:bg-white/10'">
            {{ f.label }}
          </button>
          <span class="flex items-center gap-1.5 text-[10px] text-success-light ml-2">
            <span class="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> AUTO
          </span>
        </div>
      </div>

      <!-- 스켈레톤 로딩 -->
      <div v-if="feedLoading && !liveFeed.length"
           class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 min-h-[200px]">
        <div v-for="i in 12" :key="i" class="aspect-[3/4] rounded-xl bg-white/5 animate-pulse" />
      </div>

      <!-- 피드 그리드 -->
      <div v-else-if="liveFeed.length"
           class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 min-h-[200px]">
        <div v-for="item in liveFeed" :key="item.declaration_id"
             class="group cursor-pointer"
             @click="item.vc_id ? router.push(`/verify?id=${item.vc_id}`) : router.push(`/brand/${item.brand_slug}`)">
          <!-- 미디어 -->
          <div class="relative aspect-[3/4] rounded-xl overflow-hidden bg-bg-1 border border-white/[0.06] mb-2">
            <!-- 영상 -->
            <template v-if="isVideo(item.source_url, item.asset_class)">
              <div v-if="feedVideoErrors[item.declaration_id]"
                   class="w-full h-full flex flex-col items-center justify-center gap-1 opacity-40">
                <span class="text-3xl">🎬</span>
                <span class="text-[9px] text-txt-4">영상</span>
              </div>
              <template v-else>
                <video :src="item.source_url" class="w-full h-full object-cover"
                       muted loop playsinline preload="metadata"
                       @error="feedVideoErrors[item.declaration_id] = true"
                       @mouseenter="(e) => (e.target as HTMLVideoElement).play().catch(()=>{})"
                       @mouseleave="(e) => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime=0 }" />
                <div class="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-0 transition-opacity pointer-events-none">
                  <div class="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white text-sm">▶</div>
                </div>
              </template>
            </template>
            <!-- 이미지 -->
            <img v-else-if="item.source_url" :src="item.source_url"
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                 @error="(e) => (e.target as HTMLImageElement).style.display='none'" />
            <div v-else class="w-full h-full flex items-center justify-center text-3xl opacity-20">
              {{ assetIcon(item.asset_class) }}
            </div>

            <!-- 상태 배지 (좌상단) -->
            <div class="absolute top-2 left-2">
              <span class="badge text-[8px] font-bold"
                    :class="{
                      'badge-gold':   item.status === 'pending',
                      'badge-purple': item.status === 'vc_issued',
                      'badge-green':  item.btc_status === 'confirmed',
                    }">
                {{ item.status === 'pending'   ? '심사 중'
                 : item.btc_status === 'confirmed' ? '⚓ 각인'
                 : 'award.bi 인증' }}
              </span>
            </div>
            <!-- 자산 유형 (우상단) -->
            <div class="absolute top-2 right-2">
              <span class="badge badge-gray text-[8px]">{{ assetLabel(item.asset_class) }}</span>
            </div>
          </div>

          <!-- 텍스트 -->
          <div class="text-[11px] font-semibold text-txt-1 truncate">{{ item.title ?? item.asset_class }}</div>
          <div class="text-[10px] text-txt-4 truncate">{{ item.brand_name }}</div>
        </div>
      </div>

      <div v-else class="text-center py-12 text-txt-4 text-sm">아직 등록된 자산이 없습니다</div>

      <!-- 더보기 + 갱신 안내 -->
      <div class="flex items-center justify-between mt-8 flex-wrap gap-3">
        <button v-if="liveFeed.length >= 24"
                @click="feedOffset += 24; loadFeed(true)"
                class="btn btn-outline btn-sm text-xs">
          더 보기 →
        </button>
        <div class="text-[10px] text-txt-4 flex items-center gap-1.5">
          <span class="w-1 h-1 bg-success rounded-full animate-pulse" />
          {{ feedLastUpdated ? `마지막 갱신: ${feedLastUpdated}` : '30초마다 자동 갱신' }}
        </div>
      </div>
    </div>
  </section>

  <!-- ── 인증 5단계 여정 ──────────────────────────────────── -->
  <section id="journey" class="py-24 bg-bg-0">
    <div class="container">
      <div class="text-center mb-16">
        <div class="section-tag">📜 AWARD JOURNEY</div>
        <h2 class="section-title">인증 <span>5단계 여정</span></h2>
        <p class="text-txt-3">kei.bio 가입부터 Bitcoin 영구 각인까지, 단계별로 자산을 인증하세요</p>
      </div>

      <!-- 타임라인 -->
      <div class="relative max-w-4xl mx-auto">
        <div class="absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-gold to-success hidden md:block" />
        <div class="grid md:grid-cols-5 gap-6">
          <div v-for="(step, i) in journeySteps" :key="i" class="text-center">
            <div class="relative mx-auto w-20 h-20 rounded-full border-2 flex items-center justify-center text-3xl mb-4 bg-bg-0 z-10"
                 :style="`border-color:${step.color}`">{{ step.icon }}</div>
            <div class="text-sm font-bold text-txt-1 mb-2">{{ i+1 }}. {{ step.title }}</div>
            <div class="text-xs text-txt-3 leading-relaxed">
              <div v-for="d in step.details" :key="d">{{ d }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── 역대 수상 브랜드 ──────────────────────────────────── -->
  <section class="py-24 bg-bg-1">
    <div class="container">
      <div class="text-center mb-12">
        <div class="section-tag">🏆 PAST WINNERS</div>
        <h2 class="section-title">역대 <span>수상 브랜드</span></h2>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="winner in pastWinners" :key="winner.brand" class="card p-6 text-center">
          <div class="text-4xl mb-3">{{ winner.medal }}</div>
          <div class="text-[10px] text-txt-4 mb-2">{{ winner.year }} · {{ winner.category }}</div>
          <div class="font-black text-txt-1 mb-1">{{ winner.brand }}</div>
          <div class="text-xs text-txt-3">{{ winner.sub }}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── 파트너 ────────────────────────────────────────────── -->
  <section class="py-16 bg-bg-0">
    <div class="container">
      <div class="text-center mb-10">
        <div class="section-tag">🤝 PARTNERS &amp; MEDIA</div>
        <h2 class="text-2xl font-black text-txt-1">신뢰받는 파트너</h2>
      </div>
      <div class="flex items-center justify-center gap-10 flex-wrap opacity-40">
        <span v-for="p in partners" :key="p" class="text-lg font-bold text-txt-2">{{ p }}</span>
      </div>
    </div>
  </section>

  <!-- ── CTA ─────────────────────────────────────────────── -->
  <section class="py-24 bg-[#0a0614]">
    <div class="container text-center">
      <div class="section-tag mx-auto">🚀 지금 시작하세요</div>
      <h2 class="text-4xl md:text-6xl font-black text-txt-1 mb-4">
        당신의 브랜드를<br><span class="text-gradient">비트코인에 영구 각인하세요</span>
      </h2>
      <p class="text-txt-3 mb-8">kei.bio 계정으로 5분 안에 시작할 수 있습니다</p>
      <div class="flex gap-4 justify-center flex-wrap">
        <a href="https://kei.bio" target="_blank" class="btn btn-primary px-8 py-4 text-base">🔑 kei.bio로 시작하기</a>
        <RouterLink to="/verify" class="btn btn-outline px-8 py-4 text-base">🔍 인증서 검색하기</RouterLink>
      </div>
    </div>
  </section>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useBtcStore } from '@/stores/btc'
import { getBrandAssets, getBrandFeed } from '@/api/award'

const btc    = useBtcStore()
const router = useRouter()

// ── ESCO 실시간 데이터 ──────────────────────────────────────
const escoAssets  = ref<Record<string, unknown>[]>([])
const escoLoading = ref(true)
const escoConfirmed = computed(() => escoAssets.value.filter((a: Record<string,unknown>) => a.ots_status === 'confirmed').length)

const featuredAsset = computed(() => escoAssets.value.find((a: Record<string,unknown>) => !!a.vc_id) ?? null)

async function loadEsco() {
  try {
    const { data } = await getBrandAssets('esco', 20)
    escoAssets.value = data.assets ?? []
  } catch {}
  finally { escoLoading.value = false }
}

// ── 라이브 피드 ───────────────────────────────────────────
type FeedItem = {
  declaration_id: string; status: string; asset_class: string
  source_url: string; title: string; brand_name: string; brand_slug: string
  vc_id: string | null; btc_status: string | null; declared_at: string
}
const liveFeed        = ref<FeedItem[]>([])
const feedLoading     = ref(true)
const feedFilter      = ref('')
const feedOffset      = ref(0)
const feedLastUpdated = ref('')
const feedVideoErrors = ref<Record<string, boolean>>({})
const feedFilters     = [
  { key: '',          label: '전체' },
  { key: 'pending',   label: '심사 중' },
  { key: 'vc_issued', label: '인증 완료' },
]

async function loadFeed(append = false) {
  feedLoading.value = true
  try {
    const { data } = await getBrandFeed(24, append ? feedOffset.value : 0, feedFilter.value || undefined)
    liveFeed.value = append
      ? [...liveFeed.value, ...(data.feed ?? [])]
      : (data.feed ?? [])
    feedLastUpdated.value = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {} finally { feedLoading.value = false }
}

// 30초 자동 갱신
let feedTimer: ReturnType<typeof setInterval>

// ── 카운트다운 ────────────────────────────────────────────
const countdown = computed(() => {
  const ms = btc.nextBatchMs
  if (!ms) return '--:--:--'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
})
const timer = setInterval(() => { btc.nextBatchMs = Math.max(0, btc.nextBatchMs - 1000) }, 1000)
onUnmounted(() => { clearInterval(timer); clearInterval(feedTimer) })

// ── 통계 ──────────────────────────────────────────────────
const heroStats = computed(() => [
  { label: '등록 브랜드',  value: btc.totalBrands ? `${btc.totalBrands.toLocaleString()}+` : '2,145+',   color: 'text-primary-light' },
  { label: 'VC 발행',     value: btc.totalVcs    ? `${btc.totalVcs.toLocaleString()}+`    : '6,782+',   color: 'text-gold' },
  { label: '글로벌 인증', value: btc.totalInscribed ? `${btc.totalInscribed.toLocaleString()}+` : '24,687+', color: 'text-success-light' },
  { label: '파트너',      value: '42+',                                                                  color: 'text-txt-2' },
])

// ── Live Ticker ───────────────────────────────────────────
const tickerItems = computed(() => [
  { text: `Bitcoin Block #${btc.blockHeight?.toLocaleString() ?? '952,015'} 각인`, color: 'bg-gold' },
  { text: `오늘 VC 발행 ${btc.totalVcs || 247}건`, color: 'bg-success' },
  { text: 'AMOREPACIFIC 수출면장 SBT', color: 'bg-primary-light' },
  { text: 'W3C VC 인증 Ed25519 서명', color: 'bg-blue-400' },
  { text: 'Bitcoin 각인 영구 공증 완료', color: 'bg-gold' },
  { text: 'ESCO  SBT 발행 완료', color: 'bg-success' },
  { text: 'K-LAB 정품인증 500개 발행', color: 'bg-primary-light' },
])

// ── Bitcoin 플로우 ────────────────────────────────────────
const btcFlow = [
  { icon: '📁', title: '자산 활동', sub: 'SBT·NFT·VC 발행', active: false },
  { icon: '🌲', title: '머클 트리', sub: '자정 자동 배치', active: false },
  { icon: '⚓', title: 'Bitcoin 각인', sub: 'Bitcoin 영구 기록', active: true },
  { icon: '🔗', title: '블록 확정', sub: '1~6시간 후', active: false },
  { icon: '✅', title: '영구 검증', sub: '누구나 확인', active: false },
]

// ── 지도 ──────────────────────────────────────────────────
const mapEl = ref<HTMLElement | null>(null)
onMounted(async () => {
  await nextTick()
  if (!mapEl.value) return
  try {
    const L = await import('leaflet')
    await import('leaflet/dist/leaflet.css')
    const map = L.map(mapEl.value, { zoomControl: false, attributionControl: true })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      maxZoom: 19,
    }).addTo(map)
    map.setView([30, 110], 2)
    const markers = [
      { lat: 37.5, lng: 127, label: 'Seoul', color: '#7c3aed' },
      { lat: 35.6, lng: 139.6, label: 'Tokyo', color: '#a78bfa' },
      { lat: 31.2, lng: 121.5, label: 'Shanghai', color: '#10b981' },
      { lat: 48.8, lng: 2.3, label: 'Paris', color: '#ec4899' },
      { lat: 25.2, lng: 55.2, label: 'Dubai', color: '#f59e0b' },
      { lat: 1.3, lng: 103.8, label: 'Singapore', color: '#3b82f6' },
      { lat: 22.3, lng: 114.1, label: 'HK', color: '#34d399' },
    ]
    markers.forEach(m => {
      L.circleMarker([m.lat, m.lng], { radius: 8, color: m.color, fillColor: m.color, fillOpacity: 0.7, weight: 2 })
        .addTo(map).bindPopup(m.label)
    })
  } catch (e) { console.warn('Leaflet 로드 실패', e) }
})

// ── 트렌딩 브랜드 ─────────────────────────────────────────
const trendingBrands = [
  { name: 'ESCO Cosmetics', sub: 'SBT 11건 인증',        icon: '🧴', color: '#7c3aed', growth: '12.4' },
  { name: 'K-LAB Beauty',  sub: 'SBT 3건 · NFT 500개', icon: '🧪', color: '#10b981', growth: '8.7' },
  { name: 'Jeju Lab',      sub: 'SBT 5건 · NFT 300개', icon: '🍊', color: '#f59e0b', growth: '6.2' },
  { name: 'Allure Korea',  sub: 'SBT 2건 · NFT 200개', icon: '💄', color: '#ec4899', growth: '4.1' },
  { name: 'Blossom Co.',   sub: 'SBT 4건 · NFT 150개', icon: '🌸', color: '#a78bfa', growth: '3.8' },
]

// ── 카테고리 ──────────────────────────────────────────────
const categories = computed(() => [
  { title: '브랜드 디자인 SBT', desc: '로고·상표·제품 디자인을 Soulbound Token으로 영구 선언. 양도 불가, 브랜드 정체성 그 자체.', icon: '🏷', color: '#a78bfa', count: '3,241', unit: '발행된 SBT', link: '/my/issue' },
  { title: '정품인증 NFT',      desc: '기업이 N개 수량 한정으로 정품인증서 NFT를 발행. 소비자 구매·리뷰 완료 시 자동 지급.', icon: '🏅', color: '#f59e0b', count: '18,492', unit: '발행된 NFT', link: '/my/issue' },
  { title: '모델·AI 인증 SBT',  desc: '브랜드 모델·AI 생성 이미지의 원작자 권리를 SBT로 선언. 저작권 분쟁 사전 방지.', icon: '👤', color: '#10b981', count: '892', unit: '발행된 SBT', link: '/my/issue' },
  { title: '수출면장·계약 SBT', desc: '수출면장, 계약서, 공증 서류를 W3C VC로 발행 후 Bitcoin에 각인. 글로벌 무역 증명.', icon: '📋', color: '#3b82f6', count: '247', unit: '발행된 VC', link: '/my/issue' },
  { title: '멤버십 NFT',        desc: '브랜드 VIP 멤버십 권리를 NFT로 발행. 포인트로 구매하거나 후원 상품 수령 시 지급.', icon: '💎', color: '#ec4899', count: '1,089', unit: '발행된 NFT', link: '/my/issue' },
  { title: 'Bitcoin 각인 현황', desc: '모든 자산 활동은 매일 자정 1회 비트코인 머클 트리로 영구 각인합니다.', icon: '⚓', color: '#f59e0b',
    count: btc.blockHeight?.toLocaleString() ?? '—', unit: `최신 블록 · ${btc.latestBatches.length}배치`, link: '/verify' },
])

// ── 여정 ──────────────────────────────────────────────────
const journeySteps = [
  { icon: '🔑', title: 'kei.bio 가입',    color: '#7c3aed', details: ['AWS SES 이메일 인증', 'Privy 지갑 연결'] },
  { icon: '📁', title: '자산 등록',        color: '#a78bfa', details: ['이미지·영상·디자인', 'Cloudflare R2 업로드'] },
  { icon: '⭐', title: '아뜰리에 승인',    color: '#f59e0b', details: ['award.bi 전문 검토팀', '진위·저작권 확인'] },
  { icon: '📜', title: 'W3C VC 발행',     color: '#10b981', details: ['국제 표준 인증서', 'Ed25519 서명'] },
  { icon: '⚓', title: 'Bitcoin 각인',    color: '#34d399', details: ['매일 자정 머클 트리', 'Bitcoin 영구 증명'] },
]

// ── 역대 수상 ─────────────────────────────────────────────
const pastWinners = [
  { medal: '🥇', year: '2026', category: '상품 디자인 부문', brand: 'ESCO Cosmetics', sub: 'Jeju Tangerine Series' },
  { medal: '🥇', year: '2026', category: '모델 AI 부문',     brand: 'K-LAB',           sub: 'AI Model Certification' },
  { medal: '🥇', year: '2026', category: '수출 부문',         brand: 'Jeju Lab',        sub: 'Export Certificate SBT' },
  { medal: '🥈', year: '2026', category: '정품인증 부문',     brand: 'Blossom Co.',     sub: '10,000 NFT Authenticity' },
]

// ── 파트너 ────────────────────────────────────────────────
const partners = ['W W3C', '⬡ OpenSea', '₿ coinbase', '📰 Forbes', '✦ allure', '❊ cosmopolitan']

// ── 아이콘/라벨 ───────────────────────────────────────────
function assetIcon(cls: string) {
  return { product_design:'🧴', brand_logo:'🏷', brand_video:'🎬', model_portrait:'👤' }[cls] ?? '📁'
}
function assetLabel(cls: string) {
  return { product_design:'상품 디자인', brand_logo:'로고·명함', brand_video:'브랜드 영상', model_portrait:'모델·AI' }[cls] ?? cls
}
const homeVideoErrors = ref<Record<string, boolean>>({})

const VIDEO_EXTS = ['.mp4', '.mov', '.webm', '.ogg', '.m4v']
function isVideo(url?: string, cls?: string): boolean {
  if (cls === 'brand_video') return true
  if (!url) return false
  return VIDEO_EXTS.some(ext => url.toLowerCase().includes(ext))
}

onMounted(() => {
  loadEsco()
  loadFeed()
  feedTimer = setInterval(() => {
    if (feedFilter.value === '' && feedOffset.value === 0) loadFeed()
  }, 30000)
})
</script>
