---
title: 06.MS4 実装プラン（認証: スタブ/ログインUI）
source:
author:
  -
published:
created: 2026-02-04
description: MS4（作業計画書 項番9–12）の実装プラン。authAdapterの実装、スタブ認証、ログイン/ログアウトUIを整備する。
tags:
  - milestone
  - MS4
---

# MS4 実装プラン（認証: スタブ/ログインUI）

## 1. 目的

- 認証の参照点を `authAdapter` に固定し、スタブでも本物でも接続点を変えずに実装できる状態にする
- スタブ認証（開発専用）とログイン/ログアウトUIを成立させる
- 未ログイン時のURL正規化（クエリ全削除）と、ログイン時のcanonical URL統一を `app/page.tsx` で担保する

## 2. スコープ

### In scope（MS4でやる）

- `authAdapter` の実装（スタブ→Auth.js差替え可能）
- スタブ認証 Route Handler（`/api/auth/stub`）の実装
- ログインモーダル（Dialog）/ ログアウトPopover の実装
- `app/page.tsx` に URL正規化 + セッション判定を適用
- RTL による最小スモークテスト

### Out of scope（MS4ではやらない）

- Auth.js 本番接続（MS13）
- 投稿CRUD（MS5以降）
- TanStack Query 導入（MS8）

## 3. 参照元

- 作業計画書: `docs/04.作業計画書.md`（項番9–12）
- 認証/認可: `docs/03.v2/20_認証-認可-スタブ.md`
- 環境変数: `docs/03.v2/02_設定-環境変数-PWA.md`
- 仕様: `docs/02.仕様書.md`

## 4. 成果物

### コード

- 接続ポイント: `mono-log/server/auth/authAdapter.ts`
- スタブガード: `mono-log/server/auth/stubAuthGuard.ts`
- スタブCookie: `mono-log/server/auth/stubSession.ts`
- スタブAPI: `mono-log/app/api/auth/stub/route.ts`
- 認証UI: `mono-log/components/auth/*`
- ページ判定: `mono-log/app/page.tsx`
- テスト: `mono-log/components/auth/*.test.tsx`, `mono-log/server/auth/*.test.ts`

### ドキュメント

- 本ファイル: `docs/06.MS4_実装プラン.md`
- テストケース: `docs/test-cases/ms4.md`

## 5. 作業手順（実装順）

1. `docs/test-cases/ms4.md` を作成し、観点を固定
2. スタブガード/セッションの純関数を実装し、ユニットテストで担保
3. `authAdapter` を実装（server-only、スタブCookieのread/set）
4. `/api/auth/stub` Route Handler を実装（POST/DELETE、ガードで403）
5. ログインモーダル/ログアウトPopover を実装
6. `app/page.tsx` にセッション判定とURL正規化を適用
7. RTLスモークテストを追加し、`pnpm -C mono-log test` が通ることを確認

## 6. テスト計画（MS4最小）

- TC-MS4-001: スタブガードの有効条件が正しい
- TC-MS4-002: スタブガードの無効条件が正しい
- TC-MS4-003: スタブCookieが session に変換できる
- TC-MS4-004: ログインモーダルが開閉できる
- TC-MS4-005: ログイン成功時に `router.refresh()` が呼ばれる
- TC-MS4-006: ログアウト成功時に `router.replace("/")` + `router.refresh()` が呼ばれる

## 7. DoD（MS4完了条件）

- `authAdapter` 経由でセッション参照/ログイン/ログアウトが成立する
- `USE_STUB_AUTH` + `NODE_ENV` ガードで本番/CIのスタブが無効化されている
- 未ログイン/ログイン中の画面が正しく切り替わり、URLがcanonicalに収束する
- テストがPASSし、`docs/test-cases/ms4.md` が作成済み

## 8. リスク

- Auth.js 未導入のため、本番環境ではスタブ導線が常に無効（未ログイン表示になる）

