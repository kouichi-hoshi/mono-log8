---
title: MS3 テストケース（UI基盤）
created: 2026-02-04
description: MS3（UI基盤: shadcn/tailwind/Toaster）のテストケース
---

# MS3 テストケース（UI基盤）

対象: `docs/04.作業計画書.md` 項番8 / `docs/03.v2/03_UI基盤.md`

| ID | レベル(Unit\|結合\|E2E) | 観点 | 前提 | 手順 | 期待結果 | 実績(Pass/Fail) | メモ | 証跡 |
|---|---|---|---|---|---|---|---|---|
| TC-MS3-001 | Unit | Dialog: 開閉 | `components/ui/dialog.tsx` が導入済み | DialogTriggerをクリック→内容表示→Closeをクリック | 内容が表示/非表示になる |  |  |  |
| TC-MS3-002 | Unit | Popover: 開閉 | `components/ui/popover.tsx` が導入済み | PopoverTriggerをクリック→内容表示→再度クリック | 内容が表示/非表示になる |  |  |  |
| TC-MS3-003 | Unit | Toaster: toast表示 | `components/ui/sonner.tsx` が導入済み | `toast("msg")` を呼び出す | Toaster内に `msg` が表示される |  |  |  |

