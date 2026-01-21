# /test-design — テストケース設計

このスラッシュコマンドは、`.codex/skills/test-design/SKILL.md` に定義された手順に従って、テストケース設計を行います。

## 手順

以下のskillファイルを参照し、その手順に従って実行してください：

1. `.codex/skills/test-design/SKILL.md` を読み込む
2. skillに定義された手順（Workflow）に従って実行する
3. テスト観点の洗い出し、優先順位付け、単体/結合/E2Eへの配分を行う
4. チェックリストIDとの紐づけを行う

## 注意事項

- TDD（Red→Green→Refactor）の前提で進める
- 実装前に「対象範囲（入口/出口）」と「観点」を整理する
- 小さなスコープで Red → Green → Refactor を回す
