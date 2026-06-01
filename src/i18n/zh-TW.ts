export default {
  nav: { home: '首頁', brands: '品牌', verify: '驗證', mypage: '我的', atelier: '工坊', admin: '管理員', api: 'Open API', login: '登入', logout: '登出' },
  hero: { tag: 'K-BEAUTY 數位刻錄平台', title: 'BEAUTY IDENTITY\nAWARD', sub: '用W3C VC認證K-Beauty品牌資產\n並永久刻錄到比特幣', cta_primary: '申請認證', cta_secondary: '查詢證書', stats: { vcs: '已發行VC', inscribed: '比特幣刻錄', brands: '認證品牌', block: '最新區塊' } },
  btc: { title: '每日比特幣刻錄', subtitle: '每天凌晨KST，所有VC匯聚成Merkle樹永久寫入比特幣', status: { pending: '待處理', submitted: 'OTS已提交', confirmed: '刻錄完成' }, next_batch: '下次批次倒計時' },
  verify: { title: '資產證書 搜尋·驗證', placeholder: 'VC ID · SHA-256雜湊 · BTC TX · 品牌 · 產品', btn: '驗證', loading: '驗證中...', status: { valid: '有效證書', revoked: '已吊銷證書' }, inscribed: '比特幣刻錄完成', pending: '等待比特幣刻錄', ots_submitted: 'OTS日曆已提交·等待區塊確認', not_found: '未找到證書', merkle_title: 'Merkle證明路徑', batch_date: '批次日期', leaf_index: '批次內序號' },
  brand: { assets: '認證資產', sbt: 'SBT', nft: 'NFT', verified: 'Kei官方認證', qr_download: '下載QR碼', short_url: '複製短連結' },
  auth: { title: 'award.bi 登入', sub: '透過電子郵件接收6位驗證碼登入', email_label: '電子郵件', email_placeholder: 'your@email.com', send_otp: '取得驗證碼 →', otp_title: '輸入驗證碼', otp_sub: '請輸入發送到郵箱的6位驗證碼', verify_btn: '完成登入', resend: '重新發送', back: '← 重新輸入郵箱', err_email: '請輸入有效郵箱', err_otp: '驗證碼錯誤或已過期。\n請重新發送後再試。', err_server: '伺服器出錯，請稍後重試。', err_code: '請輸入所有6位數字' },
  mypage: { title: '我的頁面', points: 'ssum積分', my_certs: '我的證書', issue: '註冊資產', market: 'NFT市場', history: '活動記錄', no_certs: '暫無證書', did: 'W3C DID' },
  issue: { title: '註冊 SBT / NFT', step1: '資產類型', step2: '上傳檔案', step3: '中繼資料', step4: '提交', sbt_desc: '不可轉讓 — 鎖定品牌身份', nft_desc: '可轉讓 — 可在市場上架', submit_btn: '提交工坊審核' },
  market: { title: 'NFT市場', filter_all: '全部', buy_btn: '積分購買', list_btn: '上架市場', price: '價格（積分）', seller: '賣家' },
  footer: { copy: '© 2026 award.bi · Powered by kei.bio · 比特幣永久刻錄', links: { verify: '驗證', api: 'Open API', brand: '品牌', atelier: '工坊' } },
}
