---
title: 06.MS3 実装プラン（UI基盤）
source:
author:
  -
published:
created: 2026-02-04
description: MS3（作業計画書 項番8）の実装プラン。shadcn/ui + tailwind + sonner(Toaster) を導入し、後続MSで使うUI部品とレイアウト骨格を整備する。
tags:
  - milestone
  - MS3
---

# MS3 実装プラン（UI基盤）

## 1. 目的

- shadcn/ui + tailwind + sonner（Toaster）を導入し、後続MSで使う共通UI部品を揃える
- 共通レイアウト骨格（SP/PC、`md=768px`）を先に作り、後続実装の置き場所を固定する
- Dialog/Popover/Toaster が最低限動くことを、RTLのスモークで担保する

## 2. スコープ

### In scope（MS3でやる）

- shadcn/ui 初期化（CLI）
- UI部品追加（Button/Dialog/Alert/AlertDialog/Popover/Skeleton/Sonner/Checkbox/Toggle相当）
- ThemeProvider + Toaster の組み込み（構造の回帰テスト可能な形）
- 共通レイアウト骨格（ヘッダー/フッター/メイン枠）のSP/PC対応
- Dialog/Popover/Toaster の最小UIテスト（RTL）

### Out of scope（MS3ではやらない）

- 認証UIの実装（MS4）
- 投稿UIの本格実装（MS6以降）
- DB/マイグレーション/データ操作

## 3. 参照元

- 作業計画書: `docs/04.作業計画書.md`（項番8）
- 設計（UI基盤）: `docs/03.v2/03_UI基盤.md`
- Miro参照表: `docs/miro/frames.md`（見た目の正）
- テスト方針: `docs/03.v2/90_品質-セキュリティ-テスト.md`

## 4. 成果物

### コード

- shadcn設定: `mono-log/components.json`
- UI部品: `mono-log/components/ui/*`
- utils: `mono-log/lib/utils.ts`
- ThemeProvider: `mono-log/components/theme-provider.tsx`
- レイアウト骨格: `mono-log/components/layout/*`
- 画面（プレースホルダ）: `mono-log/app/page.tsx`
- スモークテスト: `mono-log/components/ui/ui-smoke.test.tsx`

### ドキュメント

- 本ファイル: `docs/06.MS3_実装プラン.md`
- テストケース: `docs/test-cases/ms3.md`

## 5. 作業手順（実装順）

1. Miro参照（ヘッダー/フッター/ログイン中 SP/PC）の該当フレームを確認し、レイアウトの基準を押さえる
2. shadcn/ui を CLI で初期化し、`components.json` と必要依存を追加する
3. 必要なUI部品を CLI で追加し、`mono-log/components/ui/*` に揃える
4. `app/globals.css` を shadcn のCSS変数（Tailwind v4）に合わせる
5. `ThemeProvider` 配下で `Toaster` をレンダリングする構造を `app/layout.tsx` に組み込む
6. `components/layout/*` を新設し、SP/PCの骨格を作る（後続MSの置き場所を固定）
7. RTLで Dialog/Popover/Toaster のスモークテストを追加する

## 6. テスト計画（MS3最小）

- TC-MS3-01: Dialogが開閉できる
- TC-MS3-02: Popoverが開閉できる
- TC-MS3-03: `toast()` でToasterが表示される

## 7. DoD（MS3完了条件）

- 指定のshadcn/ui部品が `mono-log/components/ui/*` に揃っている
- `ThemeProvider` 配下で `Toaster` がレンダリングされる
- SP/PCの共通レイアウト骨格が用意され、後続MSが迷わず実装できる
- `pnpm -C mono-log test` が通る（UIスモーク含む）
- `docs/test-cases/ms3.md` が作成されている

## 8. リスク

- shadcn CLI はネットワーク/環境制約で失敗する可能性がある（失敗時は相談）
- Tailwind v4 と shadcn の差分で `globals.css` の調整が増える可能性がある

