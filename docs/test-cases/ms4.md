---
title: MS4 テストケース（認証: スタブ/ログインUI）
created: 2026-02-04
description: MS4（認証: 接続ポイント→スタブ→UI）のテストケース
---

# MS4 テストケース（認証: スタブ/ログインUI）

対象: `docs/04.作業計画書.md` 項番9–12 / `docs/03.v2/20_認証-認可-スタブ.md`

| ID | レベル(Unit\|結合\|E2E) | 観点 | 前提 | 手順 | 期待結果 | 実績(Pass/Fail) | メモ | 証跡 |
|---|---|---|---|---|---|---|---|---|
| TC-MS4-001 | Unit | スタブガード: 有効条件 | `isStubAuthEnabled` が実装済み | `NODE_ENV=development` + `USE_STUB_AUTH=true` で評価 | `true` になる |  |  |  |
| TC-MS4-002 | Unit | スタブガード: 無効条件 | 同上 | `NODE_ENV=production` または `USE_STUB_AUTH!=true` で評価 | `false` になる |  |  |  |
| TC-MS4-003 | Unit | スタブセッション: cookie→session | `readStubSession` が実装済み | 期待値のcookieを渡す | `session.user.id` が `stub-user-1` になる |  |  |  |
| TC-MS4-004 | Unit | ログインモーダル: 開閉 | `LoginModal` が実装済み | ログインボタン→モーダル表示→閉じる | 表示/非表示が切り替わる |  |  |  |
| TC-MS4-005 | Unit | ログイン: 成功時の更新 | `authClient.signIn` をモック | 「Googleでログイン」押下 | `authClient.signIn` が呼ばれ、`router.refresh` が呼ばれる |  |  |  |
| TC-MS4-006 | Unit | ログアウト: 成功時の遷移 | `authClient.signOut` をモック | 「ログアウト」押下 | `router.replace("/")` + `router.refresh` が呼ばれる |  |  |  |

