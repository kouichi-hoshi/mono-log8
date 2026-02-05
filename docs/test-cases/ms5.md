---
title: MS5 テストケース（投稿基盤）
created: 2026-02-05
description: MS5（postRepository/スタブCRUD/contentText/validation）のテストケース
---

# MS5 テストケース（投稿基盤）

対象: `docs/04.作業計画書.md` 項番13–15 / `docs/03.v2/20_認証-認可-スタブ.md` / `docs/03.v2/30_投稿-編集-本文形式.md`

| ID | レベル(Unit\|結合\|E2E) | 観点 | 前提 | 手順 | 期待結果 | 実績(Pass/Fail) | メモ | 証跡 |
|---|---|---|---|---|---|---|---|---|
| TC-MS5-001 | Unit | スタブガード: 有効条件 | `isStubPostsEnabled` が実装済み | `NODE_ENV=development` + `USE_STUB_POSTS=true` で評価 | `true` になる |  |  |  |
| TC-MS5-002 | Unit | スタブガード: 無効条件 | 同上 | `NODE_ENV=production/test` or `USE_STUB_POSTS!=true` | `false` になる |  |  |  |
| TC-MS5-003 | Unit | contentText: memo 正規化 | `deriveContentText` が実装済み | 改行/連続空白を含む入力で生成 | 1行に正規化された文字列になる |  |  |  |
| TC-MS5-004 | Unit | contentText: note 抽出 | 同上 | ProseMirror JSON から生成 | ブロック境界が改行で連結される |  |  |  |
| TC-MS5-005 | Unit | validation: 空入力 | `validatePostInput` が実装済み | 空の contentText で検証 | 422 が返る |  |  |  |
| TC-MS5-006 | Unit | validation: 文字数上限 | 同上 | memo>280 / note>20000 | 422 が返る |  |  |  |
| TC-MS5-007 | Unit | validation: タグ上限 | 同上 | 正規化後 10件超 | 422 が返る |  |  |  |
| TC-MS5-008 | Unit | repo: 未認証 | `postRepository` スタブが実装済み | sessionなしで操作 | 401 になる |  |  |  |
| TC-MS5-009 | Unit | repo: スタブ無効 | 同上 | `USE_STUB_POSTS!=true` | 403 になる |  |  |  |
| TC-MS5-010 | Unit | repo: create/findMany | 同上 | 作成→一覧取得 | 作成した投稿が取得できる |  |  |  |
| TC-MS5-011 | Unit | repo: フィルタ | 同上 | mode/tags/favorite で取得 | 条件に合う投稿のみ返る |  |  |  |
| TC-MS5-012 | Unit | repo: cursor paging | 同上 | cursor 付きで取得 | 次のページが返る |  |  |  |
| TC-MS5-013 | Unit | repo: trash/restore | 同上 | trash→restore | status/trashedAt が変化 |  |  |  |
| TC-MS5-014 | Unit | repo: hard delete | 同上 | hardDelete | 対象が削除される |  |  |  |
