---
title: MS1 テストケース（基盤整備）
created: 2026-02-04
description: MS1（Jest/RTL基盤・Miro参照表・文言辞書・接続ポイント雛形）のテストケース
---

# MS1 テストケース（基盤整備）

対象: `docs/04.作業計画書.md` 項番1–5 / `docs/06.MS1_実装プラン.md`

| ID | レベル(Unit|結合|E2E) | 観点 | 前提 | 手順 | 期待結果 | 実績(Pass/Fail) | メモ | 証跡 |
|---|---|---|---|---|---|---|---|---|
| TC-001 | Unit | Jest/RTL が実行できる | `mono-log/` 配下で依存が揃っている | `pnpm -C mono-log test` を実行する | テストが実行され、失敗なく完了する |  |  |  |
| TC-002 | Unit | `layout` 相当がレンダリングできる | Jest環境が `testEnvironment=jsdom` | `mono-log/app/layout.test.tsx` を実行する | `RootLayout` がレンダリングされ、children がDOM上に存在する |  |  |  |
| TC-003 | Unit | 文言辞書の代表値を参照できる | `mono-log/lib/texts.ts` が存在する | `mono-log/lib/texts.test.ts` を実行する | 代表キー（例: toast.success/ toast.error 等）が文字列として取得できる |  |  |  |
| TC-004 | Unit | 接続ポイント雛形がimport可能 | `mono-log/server/**` が存在する | `mono-log/server/connectors.test.ts` を実行する | `authAdapter`/`postRepository` がimportでき、公開I/Fが存在する |  |  |  |

