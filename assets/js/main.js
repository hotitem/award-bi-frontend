/**
 * award.bi — Main JavaScript
 * Global interactions, counters, Bitcoin countdown
 */

// ─── Bitcoin Countdown (매일 자정 KST) ───────────────────
function updateCountdown() {
  const el = document.getElementById('btcCountdown');
  if (!el) return;

  const now = new Date();
  const kst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const tomorrow = new Date(kst);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const diff = tomorrow - kst;
  const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
  const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
  const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
  el.textContent = `${h}:${m}:${s}`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// ─── BTC Price Display ─────────────────────────────────
async function fetchBTCPrice() {
  const el = document.getElementById('btcPrice');
  if (!el) return;
  try {
    const r = await fetch('https://api.coinbase.com/v2/prices/BTC-KRW/spot', { signal: AbortSignal.timeout(5000) });
    const d = await r.json();
    const price = parseInt(d.data.amount).toLocaleString('ko-KR');
    el.textContent = `₿ ₩${price}`;
  } catch {
    el.textContent = '₿ Bitcoin';
  }
}
fetchBTCPrice();
setInterval(fetchBTCPrice, 60000);

// ─── Animated Counters ────────────────────────────────
function animateCounter(el, target, duration = 1500, prefix = '', suffix = '') {
  if (!el) return;
  const start = performance.now();
  const startVal = 0;
  const endVal = parseInt(target.replace(/,/g, ''));

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current = Math.floor(startVal + (endVal - startVal) * ease);
    el.textContent = prefix + current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Intersection Observer for counter animation
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      entry.target.dataset.animated = '1';
      const raw = entry.target.dataset.target || entry.target.textContent.replace(/[^0-9,]/g, '');
      const suffix = entry.target.textContent.includes('+') ? '+' : '';
      animateCounter(entry.target, raw, 1500, '', suffix);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.hero-stat-num, .stat-number, .brand-stat-val').forEach(el => {
  const raw = el.textContent.replace(/[^0-9]/g, '');
  if (raw) {
    el.dataset.target = raw;
    counterObserver.observe(el);
  }
});

// ─── Header Scroll Effect ─────────────────────────────
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.style.background = 'rgba(6,10,24,0.95)';
    } else {
      header.style.background = 'rgba(6,10,24,0.85)';
    }
  }, { passive: true });
}

// ─── Mobile Menu ──────────────────────────────────────
const mobileBtn = document.getElementById('mobileMenuBtn');
if (mobileBtn) {
  mobileBtn.addEventListener('click', () => {
    const nav = document.querySelector('.header-nav');
    if (!nav) return;
    const isOpen = nav.style.display === 'flex';
    nav.style.display = isOpen ? 'none' : 'flex';
    nav.style.flexDirection = 'column';
    nav.style.position = 'absolute';
    nav.style.top = '64px';
    nav.style.left = '0';
    nav.style.right = '0';
    nav.style.background = 'rgba(6,10,24,0.98)';
    nav.style.padding = '16px 24px';
    nav.style.borderBottom = '1px solid rgba(255,255,255,0.07)';
    nav.style.backdropFilter = 'blur(16px)';
    mobileBtn.textContent = isOpen ? '☰' : '✕';
  });
}

// ─── Smooth scroll for anchor links ──────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── Pending VC counter (simulated live) ─────────────
const pendingEl = document.getElementById('pendingVC');
if (pendingEl) {
  setInterval(() => {
    const current = parseInt(pendingEl.textContent);
    const delta = Math.floor(Math.random() * 3) - 1; // -1 ~ +2
    const next = Math.max(200, Math.min(300, current + delta));
    if (next !== current) pendingEl.textContent = next;
  }, 5000);
}

// ─── Float VC counter (simulated live) ───────────────
const floatVCEl = document.getElementById('floatVC');
if (floatVCEl) {
  let vcCount = 12458;
  setInterval(() => {
    vcCount += Math.floor(Math.random() * 3);
    floatVCEl.textContent = vcCount.toLocaleString();
  }, 8000);
}

// ─── Card hover: subtle glow ──────────────────────────
document.querySelectorAll('.asset-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.boxShadow = '0 12px 40px rgba(124,58,237,0.15)';
  });
  card.addEventListener('mouseleave', function() {
    this.style.boxShadow = '';
  });
});
