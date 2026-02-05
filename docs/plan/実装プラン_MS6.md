---
title: 06.MS6 実装プラン（投稿エディタ/編集/離脱ガード）
source:
author:
  -
published:
created: 2026-02-05
description: MS6（作業計画書 項番16–21）の実装プラン。投稿エディタ・編集UI・hasEdits離脱ガードをDialog/AlertDialogで実装する。
tags:
  - milestone
  - MS6
---

# MS6 実装プラン（投稿エディタ/編集/離脱ガード）

## 1. 目的

- memo/noteの新規作成体験を成立させる（保存・クリア・フォーカス復帰）
- 既存投稿の編集UI（memoはインライン、noteはDialog）を成立させる
- `hasEdits` の離脱ガードを AlertDialog で統一し、URL変更やモーダル閉じ等を安全に制御する

## 2. スコープ

### In scope（MS6でやる）

- 投稿エディタ（新規：memo/note）と保存フロー
- ノート拡大/縮小（新規ノートのみ、同一インスタンス維持）
- 投稿一覧（表示要素：mode/作成日時/タグ/本文プレビュー/削除/編集）
- 既存編集（memoインライン、noteはDialog）
- `hasEdits` 離脱ガード（AlertDialog）
- MS6に必要な文言追加（`docs/05` + `texts.ts`）
- 取得/更新に必要な最小I/F追加（`postRepository.findById` 等）

### Out of scope（MS6ではやらない）

- タグ編集UI/お気に入り操作（MS7）
- TanStack Query / 無限スクロール（MS8）
- ごみ箱ビュー切替や一括操作（MS10）
- エラー共通化（MS11）

## 3. 参照元

- 作業計画書: `docs/04.作業計画書.md`（項番16–21）
- 仕様: `docs/02.仕様書.md`
- 設計（投稿/編集）: `docs/03.v2/30_投稿-編集-本文形式.md`
- 設計（URL/状態）: `docs/03.v2/10_URL-状態管理.md`
- UI文言: `docs/05.テキスト・コンテンツ定義.md`
- レイアウト参照: `docs/miro/frames.md`

## 4. 成果物

### コード

- 投稿UI
  - `mono-log/components/posts/editor/*`（memo input, note tiptap, EditorFrame）
  - `mono-log/components/posts/list/*`（PostList, PostCard, PostPreview）
  - `mono-log/components/posts/guards/*`（hasEdits guard）
- 取得/更新 I/F
  - `mono-log/server/posts/postRepository.ts`（`findById` を追加）
  - `mono-log/app/_actions/posts.ts`（`findPostAction`/`findPostsAction` を追加）
- 画面
  - `mono-log/app/page.tsx`（`UiPreview` を置き換え）

### ドキュメント

- 本ファイル: `docs/plan/実装プラン_MS6.md`
- テストケース: `docs/test-cases/ms6.md`

## 5. 決定事項（UI/挙動）

- 既存ノート編集は `Dialog` を使用（Sheetは使わない）
- hasEdits確認は `AlertDialog` を使用（`window.confirm` は使わない）
- 文言は `docs/05` + `texts.ts` に追加して一元管理する

### 5.1 文言追加（案）

- 保存: 「保存」
- 更新: 「更新」
- キャンセル: 「キャンセル」
- 拡大: 「拡大」
- 戻す: 「戻す」
- もっと見る: 「もっと見る」
- 折りたたむ: 「折りたたむ」
- 離脱確認タイトル: 「編集中の内容があります。破棄して続行しますか？」
- 離脱確認ボタン
  - 破棄して続行: 「破棄して続行」
  - 編集を続ける: 「編集を続ける」

## 6. 作業手順（実装順）

1. `docs/test-cases/ms6.md` を作成して観点を固定する
2. 文言追加（`docs/05` と `mono-log/lib/texts.ts`）
3. `postRepository.findById` を追加し、編集用の `content` を取得できるようにする
4. `app/_actions/posts.ts` に `findPostAction`/`findPostsAction` を追加する
5. `app/page.tsx` を `PostsPage` に置き換え、初期一覧を表示できるようにする
6. 新規エディタ（memo input / note tiptap）を実装する
7. note拡大/縮小（同一インスタンス + scroll lock）を実装する
8. 投稿一覧（PostList/PostCard）を実装し、表示要素を揃える
9. 既存編集（memoインライン、note Dialog）を実装する
10. `hasEdits` ガードを AlertDialog で実装する
11. RTL テストを追加し、`pnpm -C mono-log test` が通ることを確認する

## 7. テスト計画（MS6最小）

- TC-MS6-001: 新規memo保存成功で入力がクリアされ、フォーカスが戻る
- TC-MS6-002: 新規note拡大→縮小でも内容が保持される
- TC-MS6-003: memoインライン編集の更新/キャンセルが正しく動作する
- TC-MS6-004: note編集Dialogが開閉でき、新規エディタがロックされる
- TC-MS6-005: `hasEdits` 確認で「破棄して続行/編集を続ける」の分岐が正しい
- TC-MS6-006: note本文プレビューの「もっと見る/折りたたむ」が動作する

## 8. DoD（MS6完了条件）

- memo/noteの新規投稿が保存でき、成功後に入力がクリアされる
- note拡大/縮小が同一インスタンスで動作し、入力が保持される
- 既存編集（memoインライン / note Dialog）が成立する
- `hasEdits` ガードが URL変更・編集切替・Dialog閉じ・ブラウザ離脱で機能する
- テストがPASSし、`docs/test-cases/ms6.md` が作成済み

## 9. リスク/注意

- TanStack Query 未導入のため、一覧更新は一時的にローカル状態で対応する
- 422以外のエラー挙動（toast等）はMS11で共通化予定のため最小実装で良い
