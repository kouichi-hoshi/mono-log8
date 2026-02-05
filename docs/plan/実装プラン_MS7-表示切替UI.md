---
title: 07.MS7-表示切替UI 実装プラン（項番25）
source:
author:
  -
published:
created: 2026-02-05
description: MS7（作業計画書 項番25）の実装プラン。表示切替UIとfiltersのURL駆動を実装する。
tags:
  - milestone
  - MS7
---

# MS7-表示切替UI 実装プラン（項番25）

## 1. 目的

- 表示切替UI（`mode=memo|note`、`view=normal|trash`）を URL 駆動で実装する
- Tag/Favorite/Clear のフィルタUIを URL 正規化規約に沿って更新する
- UI は state を持たず、URL を唯一の正として同期する

## 2. スコープ

### In scope（本プランでやる）

- 表示切替UI（モード切替 + ごみ箱切替）
- TagFilter / FavoriteFilter / ClearFilters の URL 反映
- URL 正規化（tags 重複排除/ソート、favorite=1 正規化）を `mergeSearchParams` に従って担保
- `view=trash` で filters/モード切替を非表示
- UI テスト（RTL）

### Out of scope（本プランではやらない）

- ごみ箱の投稿操作（復元/削除/一括）
- スクロール保存/復元
- TanStack Query のキャッシュ設計変更

## 3. 参照元

- 作業計画書: `docs/04.作業計画書.md`（項番25）
- 仕様: `docs/02.仕様書.md`
- URL 設計: `docs/03.v2/10_URL-状態管理.md`
- 取得/キャッシュ: `docs/03.v2/50_取得-キャッシュ-ページング.md`
- レイアウト参照: `docs/miro/frames.md`（モード切替 sm/md）

## 4. 成果物

### コード

- 表示切替UI
  - `mono-log/components/posts/mode-switch.tsx`（新規）
- 画面統合
  - `mono-log/components/posts/posts-page.tsx`（配置 + URL 更新）

### ドキュメント

- 本ファイル: `docs/plan/実装プラン_MS7-表示切替UI.md`
- テストケース追記: `docs/test-cases/ms7.md`

## 5. 決定事項（挙動）

- `mode` 切替は `guardedPush({ mode })` で URL 更新する
- `view=trash` 切替は `guardedPush({ view: "trash" })` で URL 更新する
- 通常ビューへの復帰は `guardedPush({ view: undefined })` で URL から `view` を削除する
- `view=trash` では
  - モード切替 UI を非表示
  - Tag/Favorite/Clear の filters を非表示
- フィルタ操作は URL のみ更新し、state は持たない

## 6. 作業手順（実装順）

1. `docs/test-cases/ms7.md` に表示切替の観点を追記する
2. 表示切替 UI コンポーネントを作成する
3. `PostsPage` に表示切替 UI を組み込み、`useGuardedSearchParams` で URL 更新する
4. `view=trash` で filters/モード切替が非表示になることを担保する
5. RTL テストを追加する（表示/クリック/URL更新）

## 7. テスト計画（最小）

- RTL: モード切替ボタンで `guardedPush({ mode })` が呼ばれる
- RTL: ごみ箱切替で `guardedPush({ view: "trash" })` が呼ばれる
- RTL: 通常復帰で `guardedPush({ view: undefined })` が呼ばれる
- RTL: `view=trash` でモード切替/filters が非表示

## 8. DoD（完了条件）

- 表示切替 UI が URL 駆動で動作する
- `view=trash` で filters/モード切替が非表示
- `docs/test-cases/ms7.md` に観点が追記済み
- テストが PASS する

## 9. リスク/注意

- URL が唯一の正である前提を崩さない（state を持たない）
- `view=trash` 中の filters 値は保持するが、UI は非表示
