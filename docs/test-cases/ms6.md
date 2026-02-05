---
title: MS6 テストケース（投稿エディタ/編集/離脱ガード）
created: 2026-02-05
description: MS6（項番16–21）のテストケース
---

# MS6 テストケース（投稿エディタ/編集/離脱ガード）

対象: `docs/04.作業計画書.md` 項番16–21 / `docs/03.v2/30_投稿-編集-本文形式.md` / `docs/02.仕様書.md`

| ID | レベル(Unit\|結合\|E2E) | 観点 | 前提 | 手順 | 期待結果 | 実績(Pass/Fail) | メモ | 証跡 |
|---|---|---|---|---|---|---|---|---|
| TC-MS6-001 | Unit | 新規memo保存 | NewPostEditorが実装済み | memo入力→保存 | 入力クリア+フォーカス復帰+成功通知 |  |  |  |
| TC-MS6-002 | Unit | note拡大/縮小 | note editorが実装済み | 拡大→縮小 | 同一インスタンスで内容維持 |  |  |  |
| TC-MS6-003 | Unit | memoインライン編集 | EditMemoInlineが実装済み | 編集→更新/キャンセル | 更新成功で解除、キャンセルで離脱確認 |  |  |  |
| TC-MS6-004 | Unit | note編集Dialog | EditNoteDialogが実装済み | ダイアログ開閉 | 開閉でき、編集開始時に新規エディタがロック |  |  |  |
| TC-MS6-005 | Unit | hasEditsガード | UnsavedChangesProviderが実装済み | URL変更/編集切替/モーダル閉じ操作 | AlertDialogで分岐 |  |  |  |
| TC-MS6-006 | Unit | noteプレビューの折りたたみ | PostPreviewが実装済み | 10行超のnote | 「もっと見る/折りたたむ」で開閉 |  |  |  |
