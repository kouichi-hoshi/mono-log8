---
title: "MS8 テストケース（取得・キャッシュ・無限スクロール）"
created: 2026-02-05
tags:
  - test-cases
  - MS8
---

# MS8 テストケース（取得・キャッシュ・無限スクロール）

| ID | レベル(Unit\|結合\|E2E) | 観点 | 前提 | 手順 | 期待結果 | 実績(Pass/Fail) | メモ | 証跡 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-001 | Unit | queryKey（通常/ごみ箱）の安定性 | `buildPostsQueryKey` を利用 | 通常: `view=normal, mode=memo` で生成／ごみ箱: `view=trash` で生成 | 正しいキー構造になり、順序が安定する |  |  |  |
| TC-002 | Unit | queryKey（filters）の正規化 | `buildPostsFilterQueryKey` を利用 | tagsの重複/順序違いを与える | tags が重複排除され昇順になる |  |  |  |
| TC-003 | Unit | postsCache upsertSorted（追加/更新） | `upsertSorted` を利用 | 新規投稿を追加／既存投稿を更新 | ソート順が維持され、既存重複がない |  |  |  |
| TC-004 | Unit | postsCache removeById | `removeById` を利用 | postId を指定して除去 | 対象投稿が一覧から除去される |  |  |  |
| TC-005 | Unit | 無限スクロールのトリガー条件 | `useInfiniteScrollSentinel` を利用 | `disabled=false` で intersection を発火 | `onIntersect` が1回呼ばれる |  |  |  |
| TC-006 | 結合 | 初回ロードのSkeleton | `findPostsAction` が遅延/未解決 | ページ表示直後のUIを確認 | Skeletonのみ表示される |  |  |  |
| TC-007 | 結合 | 追加ロードのSkeleton | 1ページ取得済み | sentinel 交差で追加取得 | 取得済み一覧は維持され、末尾にSkeletonが表示 |  |  |  |
| TC-008 | 結合 | 取得失敗時の状態維持と再試行 | `findPostsAction` がエラーを返す | 失敗時のUIを確認し再試行 | 一覧維持＋エラーメッセージ＋再試行導線 |  |  |  |
| TC-009 | 結合 | モード切替のキャッシュ復元 | memoとnoteのキャッシュ取得済み | mode切替 | 即時にキャッシュが復元される |  |  |  |
| TC-010 | 結合 | フィルタ時は非キャッシュ | tags/favorite絞り込み | フィルタ切替→戻す | 毎回再取得が走る |  |  |  |
