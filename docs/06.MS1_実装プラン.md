---
title: 06.MS1 実装プラン（スコープ/参照/基盤整備）
source:
author:
  -
published:
created: 2026-02-04
description: MS1（作業計画書 項番1–5）の実装プラン。目的/範囲/成果物/DoD/テスト/作業手順と、Miro参照フレーム（frameId付き）を1ファイルに確定保存する。
tags:
  - milestone
  - MS1
---

# MS1 実装プラン（スコープ/参照/基盤整備）

## 1. 目的（MS1で何を確定するか）

MS1の目的は、後続マイルストーンが迷わないように、以下の「正（参照元/文言/テスト/接続ポイント）」を確定すること。

- MVPスコープ（MVPはフル）と「将来機能（初期対象外）」の根拠をドキュメントに残す
- Miroワイヤーフレームの参照先（どの画面/コンポーネントがどのフレームか）を frameId 付きで固定する
- UI文言（Toast/Alert/ボタン/モーダル文言）を一元参照する方針と置き場所を固定する
- Jest/RTL で Next.js App Router をテストできる最小基盤を整備し、スモークで担保する
- スタブ/本物の切替を「ドメインごとに1つの接続ポイント」に集約するため、接続ポイント（`authAdapter`/`postRepository`）のI/Fと配置を確定する

## 2. スコープ

### In scope（MS1でやる）

- `docs/04.作業計画書.md` の項番1–5に対応する意思決定の確定（必要なら進捗欄に根拠/補足を追記）
- Miroフレーム参照表（frameId固定）の作成
- UI文言辞書の方針確定（雛形作成まで）
- Jest/RTL の最小基盤整備（実行できること、スモーク1本以上）
- 接続ポイント（`authAdapter`/`postRepository`）のI/Fと配置固定（雛形作成まで）

### Out of scope（MS1ではやらない）

- DBマイグレーションの作成/適用
- DBデータの作成・更新・削除（INSERT/UPDATE/DELETE）
- Auth.js / Prisma / PostgreSQL の本物接続（MS13以降）
- 投稿CRUD・認証UIの本格実装（MS4/MS5以降）

## 3. 成果物

### ドキュメント

- 本ファイル: `docs/06.MS1_実装プラン.md`
- （MS1内で作成予定）Miro参照表: `docs/miro/frames.md`
  - 画面/コンポーネント → フレーム（frameId）対応
  - 本ファイルの「Miro参照」を参照元として固定する

### コード（MS1で置く“土台”）

MS1では、後続MSで差し替えやすい“接続点/参照点”を先に固定する。

- UI文言辞書（予定）: `mono-log/lib/texts.ts`
- 接続ポイント（server-only、予定）
  - `mono-log/server/auth/authAdapter.ts`
  - `mono-log/server/posts/postRepository.ts`
- テスト基盤（予定）
  - `mono-log/jest.config.ts`
  - `mono-log/jest.setup.ts`
  - スモークテスト（`*.test.tsx`）1本以上

## 4. Miro参照（フレーム一覧・参照目的・frameId）

### 4.1 フレーム一覧（MS1で参照対象に固定）

MS1では、以下のフレームを「参照元」として固定する（レイアウト/ワイヤーの正）。

| 画面/用途 | 表示名（人間向け） | frame title（取得原文） | frameId | 備考 |
|---|---|---|---|---|
| 未ログイン画面 | 未ログイン（sm/md共通） | 未ログイン​&#xff08;sm/md共通&#xff09;​ | 3458764651554734142 | ログインボタン/ウェルカム/免責など |
| ログイン中画面（SP） | ログイン中（sm） | ログイン中​&#xff08;sm&#xff09;​ | 3458764651454510117 | 一覧/エディタ等のSP配置 |
| ログイン中画面（PC） | ログイン中（md） | ログイン中(md) | 3458764654036831014 | 一覧/エディタ等のPC配置 |
| 共通ヘッダー | ヘッダー | ヘッダー | 3458764656504573186 | アプリタイトル等 |
| 共通フッター | フッター（共通） | フッター ​&#xff08;ログイン中・未ログイン共通&#xff09;​ | 3458764651892150179 | コピーライト等 |
| 表示切替UI（SP） | モード切替（sm） | モード切替​&#xff08;sm&#xff09;​ | 3458764656494338766 | メモ/ノート/ごみ箱/お気に入り等 |
| ユーザー操作 | ユーザーアイコンPopover | ユーザアイコンの​ポップオーバー | 3458764652107057479 | ユーザー名/ログアウト |
| 共通モーダル | モーダル | モーダル | 3458764652108448313 | ログイン/削除確認など |

### 4.2 取得手順（再現可能）

以下はローカルで Miro API を叩く補助スクリプト（`.env.miro` を参照する）。

- フレーム一覧取得:
  - `node .codex/skills/miro-frame-fetch/scripts/miro_fetch.mjs --env .env.miro --list-frames`
- フレーム中身取得:
  - `node .codex/skills/miro-frame-fetch/scripts/miro_fetch.mjs --env .env.miro --frame-id <frameId>`

### 4.3 注意事項（必ず守る）

- Miroのtitleには HTML entity（例: `&#xff08;`）が含まれる場合があるため、表では「表示名（人間向け）」と「取得title（原文）」を必要に応じて併記する。
- `.env.miro` の秘匿値（トークン等）は本文・ログに出力しない。
- Miro出力に含まれるリンク等は、必要がない限りドキュメントに転記しない（frameIdとtitleは記載可）。

## 5. 作業手順（項番1〜5をタスク化）

### 項番1: MVPスコープ確定の記録

- `docs/06.実装プラン.md` の前提（MVPはフル）を採用する。
- `docs/01.要件定義書.md` の「将来導入したい機能」を“初期対象外”として根拠付きで記録する（後で範囲ブレを防ぐ）。
- 反映先: `docs/04.作業計画書.md` の項番1（進捗欄に根拠を1行で追記する運用）。

### 項番2: Miro参照表の確定

- 本ファイルの 4.1 の frameId を参照元として固定し、`docs/miro/frames.md` に以下の列で整理する。
  - 画面/コンポーネント、参照フレーム（title/frameId）、備考（状態/出し分け/注意点）
- UI実装時は、該当コンポーネントの参照フレームを `docs/miro/frames.md` から辿れる状態にする。

### 項番3: UI文言辞書方針（`docs/05`を正）

- `docs/05.テキスト・コンテンツ定義.md` を正として、コード上は辞書（定数）参照で統一する。
- 予定ファイル: `mono-log/lib/texts.ts`
- キー命名（例）:
  - `welcome.*` / `toast.success.*` / `toast.error.*` / `modal.*` / `buttons.*`
- 以後、UI文言は原則ハードコードせず辞書参照に寄せる（例外が必要なら理由を残す）。

### 項番4: Jest/RTL最小整備（Next App Router）

- 目的: 後続MSのTDDが回る状態にする（まずスモーク）。
- 方針:
  - Jest + React Testing Library
  - Next.js App Routerに合わせた設定（`next/jest` を利用）
- 最小スモークの例（どちらか/両方）:
  - `layout` 相当（Provider構造）のレンダリング
  - `texts` の参照確認（辞書運用の足場）

### 項番5: 接続ポイント雛形（`authAdapter`/`postRepository`）

- 目的: スタブ/本物の切替を接続ポイントに集約し、アプリコードから Auth.js/Prisma を直呼びさせない。
- 予定配置:
  - `mono-log/server/auth/authAdapter.ts`（server-only）
  - `mono-log/server/posts/postRepository.ts`（server-only）
- MS1ではI/F確定と雛形作成まで（中身は後続MSで段階的に実装）。

## 6. テスト計画（MS1最小）

- TC-MS1-01: Jestが実行でき、スモーク1本がパスする
- TC-MS1-02: `layout` 相当のプロバイダ構造がレンダリング可能
- TC-MS1-03: `texts` の代表文言が辞書参照できる（ハードコードを避ける運用の足場）

## 7. DoD（MS1完了条件）

- `docs/06.MS1_実装プラン.md` が作成され、目的/範囲/成果物/参照/手順/テスト/DoD/リスクが矛盾なく1ファイルにまとまっている
- Miro参照対象フレーム（8件）が frameId 付きで明記されている
- `.env.miro` の秘匿値が一切露出していない（本文・ログ・コミット含む）

## 8. リスク/保留

- MiroのtitleにHTML entityが含まれる（例: `&#xff08;`）。表では必要に応じて「表示名」と「原文title」を併記する。
- 現状 `mono-log/` には Jest/RTL の設定ファイルが未配置のため、MS1の“テスト基盤整備”は差分が大きくなり得る（ただし最小スモークに絞る）。
