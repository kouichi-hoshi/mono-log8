---
title: MS2 テストケース（URL基盤）
created: 2026-02-04
description: MS2（URL正規化/URL更新ユーティリティ）のテストケース
---

# MS2 テストケース（URL基盤）

対象: `docs/04.作業計画書.md` 項番6–7 / `docs/03.v2/10_URL-状態管理.md`

| ID | レベル(Unit\|結合\|E2E) | 観点 | 前提 | 手順 | 期待結果 | 実績(Pass/Fail) | メモ | 証跡 |
|---|---|---|---|---|---|---|---|---|
| TC-001 | Unit | ログイン中: canonical URL（mode必須） | `normalizeHomeSearchParams` が実装済み | 空のsearchParamsで関数を呼ぶ | `mode=memo` が付与され、canonicalが返る |  |  |  |
| TC-002 | Unit | ログイン中: mode不正値の正規化 | 同上 | `mode=hoge` で関数を呼ぶ | `mode=memo` に正規化される |  |  |  |
| TC-003 | Unit | ログイン中: view不正値の削除 | 同上 | `view=hoge` で関数を呼ぶ | `view` が削除される |  |  |  |
| TC-004 | Unit | ログイン中: tagsの正規化（空/重複/ソート） | 同上 | `tags=b&tags=a&tags=&tags=a` 相当で関数を呼ぶ | `tags=a&tags=b` になる |  |  |  |
| TC-005 | Unit | ログイン中: favoriteの正規化（true→1、false相当は削除） | 同上 | `favorite=true` / `favorite=false` で関数を呼ぶ | `favorite=1` / なし になる |  |  |  |
| TC-006 | Unit | ログイン中: 未知キーは保持 | 同上 | `errorTest=1` 等を含めて関数を呼ぶ | `errorTest=1` が保持される |  |  |  |
| TC-007 | Unit | 未ログイン: クエリ全削除（純関数） | `normalizeHomeSearchParams` が `isLoggedIn=false` を扱える | 任意のsearchParamsで関数を呼ぶ | canonicalが空になり、changed=trueになる |  |  |  |
| TC-008 | Unit | URL更新: merge規約（重複排除/ソート/削除） | `mergeSearchParams` が実装済み | `current` と `patch` を与えて関数を呼ぶ | 出力が正規化された `URLSearchParams` になる |  |  |  |
