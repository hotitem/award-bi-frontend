export default {
  nav: { home: '首页', brands: '品牌', verify: '验证', mypage: '我的', atelier: '工坊', admin: '管理员', api: 'Open API', login: '登录', logout: '退出' },
  hero: { tag: 'K-BEAUTY 数字刻录平台', title: 'BEAUTY IDENTITY\nAWARD', sub: '用W3C VC认证K-Beauty品牌资产\n并永久刻录到比特币', cta_primary: '申请认证', cta_secondary: '查询证书', stats: { vcs: '已发行VC', inscribed: '比特币刻录', brands: '认证品牌', block: '最新区块' } },
  btc: { title: '每日比特币刻录', subtitle: '每天凌晨KST，所有VC汇聚成Merkle树永久写入比特币', status: { pending: '待处理', submitted: 'OTS已提交', confirmed: '刻录完成' }, next_batch: '下次批次倒计时' },
  verify: { title: '资产证书 搜索·验证', placeholder: 'VC ID · SHA-256哈希 · BTC TX · 品牌 · 产品', btn: '验证', loading: '验证中...', status: { valid: '有效证书', revoked: '已吊销证书' }, inscribed: '比特币刻录完成', pending: '等待比特币刻录', ots_submitted: 'OTS日历已提交·等待区块确认', not_found: '未找到证书', merkle_title: 'Merkle证明路径', batch_date: '批次日期', leaf_index: '批次内序号' },
  brand: { assets: '认证资产', sbt: 'SBT', nft: 'NFT', verified: 'Kei官方认证', qr_download: '下载QR码', short_url: '复制短链接' },
  auth: { title: 'award.bi 登录', sub: '通过邮件接收6位验证码登录', email_label: '邮箱', email_placeholder: 'your@email.com', send_otp: '获取验证码 →', otp_title: '输入验证码', otp_sub: '请输入发送到邮箱的6位验证码', verify_btn: '完成登录', resend: '重新发送', back: '← 重新输入邮箱', err_email: '请输入有效邮箱', err_otp: '验证码错误或已过期。\n请重新发送后再试。', err_server: '服务器出错，请稍后重试。', err_code: '请输入所有6位数字' },
  mypage: { title: '我的页面', points: 'ssum积分', my_certs: '我的证书', issue: '注册资产', market: 'NFT市场', history: '活动记录', no_certs: '暂无证书', did: 'W3C DID' },
  issue: { title: '注册 SBT / NFT', step1: '资产类型', step2: '上传文件', step3: '元数据', step4: '提交', sbt_desc: '不可转让 — 锁定品牌身份', nft_desc: '可转让 — 可在市场上架', submit_btn: '提交工坊审核' },
  market: { title: 'NFT市场', filter_all: '全部', buy_btn: '积分购买', list_btn: '上架市场', price: '价格（积分）', seller: '卖家' },
  footer: { copy: '© 2026 award.bi · Powered by kei.bio · 比特币永久刻录', links: { verify: '验证', api: 'Open API', brand: '品牌', atelier: '工坊' } },
}
