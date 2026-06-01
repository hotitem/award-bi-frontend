export default {
  nav: { home: 'ホーム', brands: 'ブランド', verify: '認証検索', mypage: 'マイページ', atelier: 'アトリエ', admin: '管理者', api: 'Open API', login: 'ログイン', logout: 'ログアウト' },
  hero: { tag: 'K-BEAUTY デジタル刻印プラットフォーム', title: 'BEAUTY IDENTITY\nAWARD', sub: 'K-Beautyブランド資産をW3C VCで認証し\nBitcoinに永久刻印します', cta_primary: '認証を申請する', cta_secondary: '認証書を検索', stats: { vcs: '発行済みVC', inscribed: 'Bitcoin刻印', brands: '認証ブランド', block: '最新ブロック' } },
  btc: { title: 'Bitcoin日次刻印', subtitle: '毎日深夜KST、全VCをMerkleTreeにまとめてBitcoinに永久記録', status: { pending: '待機中', submitted: 'OTS提出済', confirmed: '刻印完了' }, next_batch: '次のバッチまで' },
  verify: { title: '資産認証書 検索・検証', placeholder: 'VC ID · SHA-256ハッシュ · BTC TX · ブランド名 · 製品名', btn: '検証', loading: '検証中...', status: { valid: '有効な認証書', revoked: '失効した認証書' }, inscribed: 'Bitcoin刻印完了', pending: 'Bitcoin刻印待ち', ots_submitted: 'OTSカレンダー提出済・ブロック確認待ち', not_found: '認証書が見つかりません', merkle_title: 'Merkle証明パス', batch_date: 'バッチ日付', leaf_index: 'バッチ内順序' },
  brand: { assets: '認証資産', sbt: 'SBT', nft: 'NFT', verified: 'Kei公式認証', qr_download: 'QRダウンロード', short_url: '短縮URLをコピー' },
  auth: { title: 'award.bi ログイン', sub: 'メールで6桁の認証コードを受け取りログインします', email_label: 'メール', email_placeholder: 'your@email.com', send_otp: '認証コードを受け取る →', otp_title: '認証コード入力', otp_sub: 'メールに送られた6桁コードを入力してください', verify_btn: 'ログイン完了', resend: 'コードを再送', back: '← メールを再入力', err_email: '有効なメールを入力してください', err_otp: '認証コードが正しくないか期限切れです。\nコードを再送してやり直してください。', err_server: 'サーバーエラーが発生しました。しばらくしてからやり直してください。', err_code: '6桁すべてを入力してください' },
  mypage: { title: 'マイページ', points: 'ssumポイント', my_certs: '認証書一覧', issue: '資産登録', market: 'NFTマーケット', history: '活動履歴', no_certs: 'まだ認証書がありません', did: 'W3C DID' },
  issue: { title: 'SBT / NFT 登録', step1: '資産タイプ', step2: 'ファイルアップロード', step3: 'メタデータ', step4: '提出', sbt_desc: '譲渡不可 — ブランドアイデンティティを固定', nft_desc: '譲渡可 — マーケットに出品可能', submit_btn: 'アトリエに審査依頼' },
  market: { title: 'NFTマーケット', filter_all: '全て', buy_btn: 'ポイントで購入', list_btn: 'マーケットに出品', price: '価格（ポイント）', seller: '販売者' },
  footer: { copy: '© 2026 award.bi · Powered by kei.bio · Bitcoin永久刻印', links: { verify: '認証検索', api: 'Open API', brand: 'ブランド', atelier: 'アトリエ' } },
}
