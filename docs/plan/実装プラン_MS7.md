---
title: 07.MS7 実装プラン（タグ/お気に入り/検索UI）
source:
author:
  -
published:
created: 2026-02-05
description: MS7（作業計画書 項番22–25）の実装プラン。タグ編集・お気に入り・検索フィルタをURL駆動で実装する。
tags:
  - milestone
  - MS7
---

# MS7 実装プラン（タグ/お気に入り/検索UI）

## 1. 目的

- タグの正規化/バリデーションと編集UIを成立させる
- お気に入り（スター）操作と絞り込みをURL駆動で成立させる
- MS8（TanStack Query）に差し替えやすい構成を保つ

## 2. スコープ

### In scope（MS7でやる）

- タグラベルの正規化/バリデーション（NFKC、制御文字除去、空白圧縮、1行化、空/32文字超）
- タグ編集UI（新規/編集の両方）＋タグクラウド/サジェスト
- お気に入り（スター）トグル（通常ビューのみ）
- TagFilter / FavoriteFilter / ClearFilters（URL反映、絞り込み解除）
- 文言追加とテストケース追加

### Out of scope（MS7ではやらない）

- TanStack Query・無限スクロール（MS8）
- スクロール復元（MS9）
- ごみ箱操作（MS10）

## 3. 参照元

- 作業計画書: `docs/04.作業計画書.md`（項番22–25）
- 仕様: `docs/02.仕様書.md`
- 設計（タグ/お気に入り）: `docs/03.v2/40_タグ-お気に入り.md`
- 設計（取得/キャッシュ）: `docs/03.v2/50_取得-キャッシュ-ページング.md`
- URL設計: `docs/03.v2/10_URL-状態管理.md`
- 投稿編集: `docs/03.v2/30_投稿-編集-本文形式.md`
- 文言: `docs/05.テキスト・コンテンツ定義.md`
- レイアウト参照: `docs/miro/frames.md`

## 4. 成果物

### コード

- タグ処理
  - `mono-log/lib/posts/tags.ts`（`normalizeTagLabel`, `normalizeTagLabels`, `validateTagLabel`）
  - `mono-log/server/posts/tagResolver.ts`（label→tagId解決、タグ作成、tag cloud）
- スタブストア
  - `mono-log/server/posts/stubPostsStore.ts`（tag一覧の追加、後方互換）
- Repository / Actions
  - `mono-log/server/posts/postRepository.ts`（tagsの解決、findTagCloud, setFavorite）
  - `mono-log/app/_actions/posts.ts`（`findTagCloudAction`, `setFavoriteAction`）
- UI
  - `mono-log/components/posts/editor/*`（TagEditor/TagInput/TagChip追加）
  - `mono-log/components/posts/list/post-card.tsx`（スターをボタン化）
  - `mono-log/components/posts/filters/*`（TagFilter/FavoriteFilter/ClearFilters）
  - `mono-log/components/posts/posts-page.tsx`（filtersとtag cloud導入、URL同期）
- 文言
  - `docs/05.テキスト・コンテンツ定義.md`
  - `mono-log/lib/texts.ts`

### ドキュメント

- 本ファイル: `docs/plan/実装プラン_MS7.md`
- テストケース: `docs/test-cases/ms7.md`

## 5. 決定事項（UI/挙動）

- タグID生成: `@paralleldrive/cuid2` の `createId()` を使用
- タグ入力: 「タグ」ボタンでアコーディオン開閉
- タグ上限: 正規化・重複排除後に最大10件（超過はAlert）
- タグクラウド: `status=active` 投稿に紐づくタグのみ表示し、`label` 昇順で並べる
- お気に入りトグル: 通常ビューのみ有効、処理中はdisabled
- フィルタ: `useGuardedSearchParams` でURL更新
- `view=trash` ではフィルタUIを非表示

## 6. 作業手順（実装順）

1. `docs/test-cases/ms7.md` を作成して観点を固定する
2. タグ正規化/バリデーションの実装 + ユニットテスト
3. スタブタグ構造の追加（tagId/label/ownerId）と後方互換
4. タグ解決（label→tagId）と tag cloud 取得を `postRepository` に追加
5. `PostSummary.tags` を `TagSummary[]` へ移行
6. エディタ内タグ編集UI（新規/編集）を実装
7. お気に入りトグルを実装（Server Action + UI）
8. フィルタUI（Tag/Favorite/Clear）とURL反映を実装
9. URL変更時の一覧再同期を実装
10. 文言追加と参照先統一
11. RTL/ユニットテスト追加 → `pnpm -C mono-log test`

## 7. テスト計画（最小）

- Unit: `normalizeTagLabel` の正規化（NFKC/制御文字/空白/改行）
- Unit: タグバリデーション（空/32文字超/10件超）
- Unit: tag cloud 生成（active投稿のみ、重複排除）
- Unit: `setFavoriteAction`（更新とエラー）
- RTL: TagEditor で追加/削除/上限10
- RTL: Favorite トグル（通常ビューのみ有効）
- RTL: TagFilter/FavoriteFilter/ClearFilters のURL更新

## 8. DoD（MS7完了条件）

- タグ編集（新規/編集）とお気に入りトグルが動作する
- タグ/お気に入り絞り込みがURLに反映される
- `view=trash` でフィルタUI非表示・お気に入り無効
- テストがPASSし、`docs/test-cases/ms7.md` が作成済み

## 9. リスク/注意

- `PostSummary.tags` の型変更により影響範囲が広い
- タグクラウドは未使用タグを表示しない（仕様遵守）
- MS8導入時に TanStack Query へ置換する前提で最小構成を維持する
