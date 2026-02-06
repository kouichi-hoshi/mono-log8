---
title: MS7 テストケース（タグ/お気に入り/検索UI）
created: 2026-02-05
description: MS7（項番22–25）のテストケース
---

# MS7 テストケース（タグ/お気に入り/検索UI）

対象: `docs/04.作業計画書.md` 項番22–25 / `docs/03.v2/40_タグ-お気に入り.md` / `docs/02.仕様書.md`

| ID | レベル(Unit\|結合\|E2E) | 観点 | 前提 | 手順 | 期待結果 | 実績(Pass/Fail) | メモ | 証跡 |
|---|---|---|---|---|---|---|---|---|
| TC-MS7-001 | Unit | タグ正規化 | `normalizeTagLabel` 実装済み | 全角/半角・制御文字・空白/改行を含む入力を渡す | 正規化されたラベルが返る |  |  |  |
| TC-MS7-002 | Unit | タグバリデーション | `validateTagLabel` 実装済み | 空文字/32文字超/正常値を渡す | 空/32超でエラー、正常でOK |  |  |  |
| TC-MS7-003 | Unit | tag cloud 生成 | `findTagCloud` 実装済み | active/trashed混在のタグを作成 | active投稿に紐づくタグのみ返る |  |  |  |
| TC-MS7-004 | Unit | お気に入り更新 | `setFavoriteAction` 実装済み | favorite を切替 | favoriteが更新される |  |  |  |
| TC-MS7-005 | Unit | タグ上限 | タグ編集UI実装済み | 10件を超えて追加 | 追加拒否 + 422/Alert |  |  |  |
| TC-MS7-006 | RTL | TagEditor追加/削除 | TagEditor実装済み | タグ追加/削除を操作 | 追加/削除が反映される |  |  |  |
| TC-MS7-007 | RTL | Favoriteトグル | PostCard実装済み | スターを押下 | 状態が切り替わる（trashでは無効） |  |  |  |
| TC-MS7-008 | RTL | フィルタURL反映 | Tag/Favorite/ClearFilter実装済み | ボタン操作 | URLが更新される |  |  |  |
| TC-MS7-009 | RTL | 表示切替URL反映（mode） | 表示切替UI実装済み | 「メモ/ノート」ボタンを押下 | URLの `mode` が更新される（merge正規化される） |  |  |  |
| TC-MS7-010 | RTL | 表示切替URL反映（trash） | 表示切替UI実装済み | 「ごみ箱」ボタンを押下 | URLに `view=trash` が付与される |  |  |  |
| TC-MS7-011 | RTL | 表示切替（通常へ復帰） | 表示切替UI実装済み | trash表示中に「投稿一覧」ボタンを押下 | URLから `view` が削除され通常ビューに戻る |  |  |  |
| TC-MS7-012 | RTL | trash中のUI非表示 | 表示切替UI実装済み | `view=trash` に切替 | mode切替/filters が非表示になる |  |  |  |
