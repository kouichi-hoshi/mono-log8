---
title: 08.MS8 実装プラン（取得/キャッシュ/無限スクロール）
source:
author:
  -
published:
created: 2026-02-05
description: MS8（作業計画書 項番26–27）の実装プラン。TanStack Query でキャッシュ復元と無限スクロールを実装する。
tags:
  - milestone
  - MS8
---

# MS8 実装プラン（取得/キャッシュ/無限スクロール）

## 1. 目的

- TanStack Query で通常/ごみ箱のキャッシュ復元を成立させる
- cursor 方式の無限スクロールを成立させる
- 取得失敗時に状態維持+再試行導線を提供する

## 2. スコープ

### In scope（MS8でやる）

- QueryProvider（`QueryClientProvider`）の導入
- queryKey 設計（通常/ごみ箱と filters の分離）
- 通常/ごみ箱: キャッシュあり（`staleTime=5分` / `gcTime=30分`）
- tags/favorite 絞り込み: 非キャッシュ（`staleTime=0` / `gcTime=0`）
- `useInfiniteQuery` による無限スクロール（limit=10）
- 初回/追加ロードの Skeleton 表示
- 失敗時の状態維持 + 再試行導線
- キャッシュ更新ユーティリティの最小導入（作成/更新/お気に入り/削除）

### Out of scope（MS8ではやらない）

- スクロール位置の保存/復元（MS9）
- ごみ箱操作のUI/一括処理（MS10）
- エラー共通化/シミュレーション（MS11）

## 3. 参照元

- 作業計画書: `docs/04.作業計画書.md`（項番26–27）
- 仕様: `docs/02.仕様書.md`
- 設計（取得/キャッシュ/ページング）: `docs/03.v2/50_取得-キャッシュ-ページング.md`
- URL設計: `docs/03.v2/10_URL-状態管理.md`
- 文言: `docs/05.テキスト・コンテンツ定義.md`

## 4. 成果物

### コード

- Query 基盤
  - `mono-log/lib/queryClient.ts`（標準TTL設定）
  - `mono-log/components/query-provider.tsx`
  - `mono-log/app/layout.tsx`（Provider追加）
- QueryKey / Query hook
  - `mono-log/lib/posts/queryKeys.ts`
  - `mono-log/lib/posts/usePostsInfiniteQuery.ts`
- キャッシュ更新
  - `mono-log/lib/posts/postsCache.ts`
- 無限スクロール
  - `mono-log/components/posts/list/useInfiniteScrollSentinel.ts`
  - `mono-log/components/posts/list/post-list-skeleton.tsx`
- 画面
  - `mono-log/components/posts/posts-page.tsx`
  - `mono-log/app/page.tsx`

### ドキュメント

- 本ファイル: `docs/plan/実装プラン_MS8.md`
- テストケース: `docs/test-cases/ms8.md`
- 仕様: `docs/02.仕様書.md`
- 設計: `docs/03.v2/50_取得-キャッシュ-ページング.md`

## 5. 決定事項（キャッシュ方針）

- 通常/ごみ箱はキャッシュ有効
  - `staleTime=5分` / `gcTime=30分`
  - `refetchOnMount/Focus/Reconnect=false`
- tags/favorite 絞り込みは非キャッシュ
  - `staleTime=0` / `gcTime=0`

## 6. 作業手順（実装順）

1. `docs/test-cases/ms8.md` を作成して観点を固定する
2. `docs/plan/実装プラン_MS8.md` を作成する
3. 仕様/設計へ TTL 方針を追記する
4. `QueryClientProvider` を導入する
5. queryKey を純関数化する
6. `useInfiniteQuery` ラッパーを実装する（filtersは非キャッシュ）
7. IntersectionObserver hook と sentinel を導入する
8. Skeleton/失敗UIを追加する
9. キャッシュ更新ユーティリティを導入し、作成/更新/削除に適用する
10. テストを追加し、`pnpm -C mono-log test` を確認する

## 7. テスト計画（最小）

- Unit: queryKey の正規化（tags ソート/重複排除）
- Unit: postsCache の upsert/remove
- Unit: sentinel のガード条件
- RTL: 初回ロードの Skeleton
- RTL: 追加ロードの Skeleton
- RTL: 取得失敗時の状態維持 + 再試行導線

## 8. DoD（MS8完了条件）

- 通常/ごみ箱でキャッシュ復元が成立する
- 無限スクロールが動作し、追加ロード時も状態維持できる
- 失敗時に再試行導線が表示される
- `docs/test-cases/ms8.md` が作成済み
- テストが PASS する

## 9. リスク/注意

- filters は非キャッシュのため、頻繁な再取得に注意
- キャッシュ更新の整合は `postsCache` に集約し、UI側から直接 `queryClient` を触らない
