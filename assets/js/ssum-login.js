/**
 * award.bi × ssum.app 6자리 이메일 OTP 로그인
 * site_key: ssum_sk_live_award_bi_002
 */
(function () {
  const SSUM_API    = 'https://api.ssum.app';
  const AWARD_API   = 'https://api.award.bi';
  const SITE_KEY    = 'ssum_sk_live_award_bi_002';
  const TOKEN_KEY   = 'award_bi_token';
  const USER_KEY    = 'award_bi_user';

  /* ── 공개 인터페이스 ─────────────────────────────── */
  window.AwardAuth = {
    getToken:    () => sessionStorage.getItem(TOKEN_KEY),
    getUser:     () => { try { return JSON.parse(sessionStorage.getItem(USER_KEY)); } catch { return null; } },
    isLoggedIn:  () => !!sessionStorage.getItem(TOKEN_KEY),
    logout() {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      updateHeaderBtn();
    },
    openLogin:   () => document.getElementById('awardLoginModal')?.classList.remove('hidden'),
    onLogin:     null,  // 로그인 성공 콜백
  };

  /* ── 모달 HTML 주입 ─────────────────────────────── */
  function injectModal() {
    if (document.getElementById('awardLoginModal')) return;
    const el = document.createElement('div');
    el.id = 'awardLoginModal';
    el.className = 'hidden';
    el.innerHTML = `
<div style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);" onclick="if(event.target===this)document.getElementById('awardLoginModal').classList.add('hidden')">
  <div style="background:var(--bg-card,#1a1f2e);border:1px solid rgba(124,58,237,0.3);border-radius:20px;padding:40px 36px;width:100%;max-width:400px;position:relative;box-shadow:0 24px 80px rgba(0,0,0,0.5);">
    <button onclick="document.getElementById('awardLoginModal').classList.add('hidden')" style="position:absolute;top:16px;right:16px;background:none;border:none;color:#64748b;font-size:20px;cursor:pointer;line-height:1;">✕</button>

    <!-- Step 1: 이메일 -->
    <div id="loginStep1">
      <div style="text-align:center;margin-bottom:28px;">
        <div style="font-size:32px;margin-bottom:12px;">⭐</div>
        <div style="font-size:20px;font-weight:800;color:#e2e8f0;margin-bottom:6px;">award.bi 로그인</div>
        <div style="font-size:13px;color:#64748b;">이메일로 6자리 인증코드를 받아 로그인하세요</div>
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:12px;font-weight:600;color:#94a3b8;margin-bottom:6px;">이메일</label>
        <input id="loginEmail" type="email" placeholder="your@email.com"
          style="width:100%;padding:12px 14px;background:#0f1117;border:1px solid rgba(124,58,237,0.3);border-radius:10px;color:#e2e8f0;font-size:14px;box-sizing:border-box;outline:none;"
          onfocus="this.style.borderColor='rgba(124,58,237,0.7)'" onblur="this.style.borderColor='rgba(124,58,237,0.3)'"
          onkeydown="if(event.key==='Enter')window.AwardAuth._sendOTP()">
      </div>
      <div id="loginError1" style="color:#f87171;font-size:12px;margin-bottom:12px;display:none;"></div>
      <button onclick="window.AwardAuth._sendOTP()"
        style="width:100%;padding:13px;background:linear-gradient(135deg,#7c3aed,#4f46e5);border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">
        인증코드 받기 →
      </button>
    </div>

    <!-- Step 2: OTP -->
    <div id="loginStep2" style="display:none;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:32px;margin-bottom:12px;">✉️</div>
        <div style="font-size:18px;font-weight:800;color:#e2e8f0;margin-bottom:6px;">인증코드 입력</div>
        <div id="loginEmailShow" style="font-size:13px;color:#a78bfa;"></div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;">이메일로 발송된 6자리 코드를 입력하세요</div>
      </div>
      <div style="display:flex;gap:8px;justify-content:center;margin-bottom:20px;">
        ${[0,1,2,3,4,5].map(i=>`<input id="otp${i}" type="text" maxlength="1" inputmode="numeric"
          style="width:48px;height:56px;text-align:center;font-size:24px;font-weight:800;background:#0f1117;border:2px solid rgba(124,58,237,0.3);border-radius:10px;color:#e2e8f0;outline:none;"
          onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='rgba(124,58,237,0.3)'"
          oninput="window.AwardAuth._otpInput(this,${i})"
          onkeydown="window.AwardAuth._otpKey(event,${i})">`).join('')}
      </div>
      <div id="loginError2" style="color:#f87171;font-size:12px;margin-bottom:12px;text-align:center;display:none;"></div>
      <button onclick="window.AwardAuth._verifyOTP()"
        style="width:100%;padding:13px;background:linear-gradient(135deg,#7c3aed,#4f46e5);border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">
        로그인 완료
      </button>
      <div style="text-align:center;margin-top:14px;">
        <button onclick="window.AwardAuth._backToEmail()" style="background:none;border:none;color:#64748b;font-size:12px;cursor:pointer;">← 이메일 다시 입력</button>
        <span style="color:#334155;margin:0 8px;">·</span>
        <button onclick="window.AwardAuth._sendOTP(true)" style="background:none;border:none;color:#a78bfa;font-size:12px;cursor:pointer;">코드 재발송</button>
      </div>
    </div>

    <!-- Step 3: 로딩 -->
    <div id="loginStep3" style="display:none;text-align:center;padding:20px 0;">
      <div style="font-size:36px;margin-bottom:12px;animation:spin 1s linear infinite;display:inline-block;">⏳</div>
      <div style="font-size:14px;color:#94a3b8;">로그인 중...</div>
    </div>
  </div>
</div>`;
    document.body.appendChild(el);
  }

  let _sessionToken = '';
  let _email = '';

  /* ── OTP 발송 ─────────────────────────────────── */
  AwardAuth._sendOTP = async function (resend) {
    const email = document.getElementById('loginEmail').value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showErr(1, '올바른 이메일을 입력하세요');
      return;
    }
    _email = email;
    setStep(3);

    try {
      const res = await fetch(`${SSUM_API}/v1/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_key: SITE_KEY, email, lang: navigator.language?.slice(0,2) || 'ko' })
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message || '발송 실패');
      _sessionToken = data.session_token;
      document.getElementById('loginEmailShow').textContent = email;
      setStep(2);
      setTimeout(() => document.getElementById('otp0')?.focus(), 100);
    } catch (e) {
      setStep(1);
      showErr(1, e.message);
    }
  };

  /* ── OTP 입력 처리 ──────────────────────────── */
  AwardAuth._otpInput = function (el, idx) {
    el.value = el.value.replace(/\D/g, '').slice(-1);
    if (el.value && idx < 5) document.getElementById(`otp${idx+1}`)?.focus();
    if (idx === 5 && el.value) AwardAuth._verifyOTP();
  };

  AwardAuth._otpKey = function (e, idx) {
    if (e.key === 'Backspace' && !e.target.value && idx > 0) document.getElementById(`otp${idx-1}`)?.focus();
  };

  /* ── OTP 검증 ──────────────────────────────── */
  AwardAuth._verifyOTP = async function () {
    const code = [0,1,2,3,4,5].map(i => document.getElementById(`otp${i}`)?.value || '').join('');
    if (code.length !== 6) { showErr(2, '6자리 코드를 모두 입력하세요'); return; }
    setStep(3);

    try {
      // 1. ssum.app OTP 검증
      const verRes = await fetch(`${SSUM_API}/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: _sessionToken, otp_code: code })
      });
      const verData = await verRes.json();
      if (!verRes.ok || verData.status !== 'success') throw new Error(verData.message || '코드가 올바르지 않습니다');

      const ssumToken = verData.user_token;

      // 2. award.bi JWT 발급
      const awardRes = await fetch(`${AWARD_API}/auth/ssum/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_token: ssumToken })
      });
      const awardData = await awardRes.json();
      if (!awardRes.ok || !awardData.ok) throw new Error('award.bi 인증 실패');

      // 3. 저장
      sessionStorage.setItem(TOKEN_KEY, awardData.token);
      sessionStorage.setItem(USER_KEY, JSON.stringify({ ...awardData.user, email: _email }));

      document.getElementById('awardLoginModal').classList.add('hidden');
      updateHeaderBtn();
      if (typeof AwardAuth.onLogin === 'function') AwardAuth.onLogin(awardData.user);
    } catch (e) {
      setStep(2);
      showErr(2, e.message);
      [0,1,2,3,4,5].forEach(i => { if(document.getElementById(`otp${i}`)) document.getElementById(`otp${i}`).value = ''; });
      document.getElementById('otp0')?.focus();
    }
  };

  AwardAuth._backToEmail = function () { setStep(1); };

  /* ── 헤더 버튼 업데이트 ─────────────────────── */
  function updateHeaderBtn() {
    const btns = document.querySelectorAll('.award-login-btn');
    const user = AwardAuth.getUser();
    btns.forEach(btn => {
      if (user) {
        btn.textContent = `⭐ ${user.email?.split('@')[0] || '내 계정'}`;
        btn.onclick = () => {
          if (confirm('로그아웃 하시겠습니까?')) AwardAuth.logout();
        };
      } else {
        btn.textContent = '⭐ 로그인';
        btn.onclick = () => AwardAuth.openLogin();
      }
    });
  }

  /* ── 헬퍼 ──────────────────────────────────── */
  function setStep(n) {
    [1,2,3].forEach(i => {
      const el = document.getElementById(`loginStep${i}`);
      if (el) el.style.display = i === n ? '' : 'none';
    });
    if (n === 1) [1,2].forEach(i => showErr(i, ''));
  }

  function showErr(step, msg) {
    const el = document.getElementById(`loginError${step}`);
    if (!el) return;
    el.textContent = msg;
    el.style.display = msg ? '' : 'none';
  }

  /* ── 초기화 ─────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    injectModal();

    // .award-login-btn 클래스를 가진 버튼 자동 연결
    document.querySelectorAll('.award-login-btn').forEach(btn => {
      btn.onclick = () => AwardAuth.isLoggedIn() ? (confirm('로그아웃 하시겠습니까?') && AwardAuth.logout()) : AwardAuth.openLogin();
    });

    updateHeaderBtn();
  });

  /* ── CSS 스핀 애니메이션 ─────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    #awardLoginModal.hidden { display:none!important; }
    @keyframes spin { to { transform:rotate(360deg); } }
    #loginEmail::placeholder, #loginStep2 input::placeholder { color:#334155; }
  `;
  document.head.appendChild(style);
})();
