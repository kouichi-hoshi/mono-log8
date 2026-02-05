# 次タスク提案（推奨: MS5「投稿基盤」だけを完了させる）

## サマリ
現状、MS1/3/4は完了しており、MS2相当（`normalizeHomeSearchParams`/`mergeSearchParams`とテスト）もコード上は実装済みです。一方で、次の未着手の本丸は `postRepository`（投稿ドメインの接続ポイント）で、ここが空のため後続（エディタ/一覧/Query/ごみ箱等）が進めづらい状態です。  
次は **MS5（作業計画書: 項番13–15）を“UI無しで”完了**し、後続MSの入口を固めます（あなたの選択: 「MS5のみ」「Server Actions中心」「スタブはファイル永続」）。

## 目標 / 完了条件（DoD）
- `docs/04.作業計画書.md` の **項番13–15** が「済」になり、進捗欄に実装ファイルとテストが記載されている
- `postRepository` が **開発環境のみ**（`NODE_ENV!=test/production` かつ `USE_STUB_POSTS=true`）で動作し、それ以外は 403 で必ず失敗する
- 投稿の作成/更新時に `contentText` を **サーバー側で生成**し、バリデーション（422）が揃っている
- Jest のユニットテストが追加され、`pnpm -C mono-log test` が通る

## 変更点（API/インターフェース）
- `mono-log/server/posts/postRepository.ts` は **接続ポイントとして維持**（公開I/Fは原則そのまま）
- ただしテスト容易性のため、内部実装は以下に分割する（外部からの import 先は変えない）
  - `createPostRepository(deps)`（純粋寄り・DI可能）
  - `postRepository`（本番export。Next依存のdepsを注入して生成）

## 実装方針（決め打ち）
### 1) スタブ有効ガード（項番14）
- `mono-log/server/posts/stubPostsGuard.ts`
  - `isStubPostsEnabled(nodeEnv, useStubPosts)` を追加（authの `stubAuthGuard` と同型）
  - `NODE_ENV=test|production` は常に `false`
  - `USE_STUB_POSTS==="true"` のときのみ `true`
- テスト: `mono-log/server/posts/stubPostsGuard.test.ts`

### 2) スタブ投稿ストア（ファイル永続）
- 永続ファイル（dev専用）: `mono-log/.local-data/stub-posts.json`
  - `.gitignore` に `.local-data/` を追加（誤コミット防止）
- ストア実装: `mono-log/server/posts/stubPostsStore.ts`
  - 役割: JSONの read/write、スキーマversion管理、最低限の排他（簡易mutex）  
  - テストでは `os.tmpdir()` の一時ファイルパスを注入して、リポジトリを汚さない

### 3) contentText生成 + バリデーション（項番15）
- `mono-log/server/posts/contentText.ts`（純関数）
  - `mode=memo`: 1行に正規化（改行→空白、連続空白圧縮、trim）
  - `mode=note`: ProseMirror doc JSON を走査してテキスト抽出、ブロック境界を改行扱い、trim
- `mono-log/server/posts/validation.ts`（純関数）
  - 空: `contentText.trim().length === 0` → 422
  - memo: 280文字超 → 422
  - note: 20000文字超 → 422
  - tags: 正規化（空除去+重複排除+ソート）後 10件超 → 422
- テスト: `contentText.test.ts` + `validation.test.ts`

### 4) postRepositoryスタブCRUD（項番13–14）
- `mono-log/server/posts/postRepository.ts`
  - `import "server-only";` を追加
  - 依存注入で実装を分離し、Next環境依存（session取得/ENV/ファイルパス）は export側で束ねる
  - 認可（authorIdスコープ）:
    - repo内部で「現在ユーザー」を取得できないと 401（`status`付きエラー）  
      ※UIはMS11で統一予定だが、まずは status を機械的に付ける
    - すべての操作は `authorId === session.user.id` でフィルタ
  - findMany:
    - `status` 必須、`mode/tags/favorite` は params通りに適用（tagsはOR）
    - sort: `createdAt DESC, postId DESC`
    - cursor: postId を「そのpostIdの次」から返す（stubでも安定）
  - create/update/trash/restore/hardDelete/hardDeleteMany/hardDeleteAllTrashed を実装
- テスト: `mono-log/server/posts/postRepository.stub.test.ts`
  - DIした `getSession()` と temp-store で CRUD とフィルタ/ページングを検証

### 5) Server Actions（“中心”の土台だけ用意、UIは次回）
- `mono-log/app/_actions/posts.ts`（`"use server"`）
  - create/update/trash/restore/delete などの薄いアクションを定義（入力DTO→repo呼び出し）
  - 返却は「成功/失敗（status+code）」の判定ができる形にしておき、MS6でUIに繋ぐ  
  - ※この段階ではUIからは未使用でもOK（次のMS6で接続）

## テストケース（docs）
- 追加: `docs/test-cases/ms5.md`
  - Unit中心で以下を列挙
    - スタブ有効条件/無効条件（403）
    - セッション無し（401）
    - create/updateでcontentText生成
    - バリデーション（空/文字数/tags上限）
    - findManyのフィルタ（status/mode/tagsOR/favorite）
    - cursorページング

## 付随の“差分整合”タスク（任意だが推奨）
- `docs/04.作業計画書.md` の項番6–7が未のまま（実コードは `mono-log/lib/routing/*` に実装済み）なので、MS5着手前に表を同期しておく（計画書の信頼性を回復）

## 前提 / 注意
- DB・マイグレーション・.env参照は行わない（AGENTS.md遵守）
- ファイル永続スタブはローカル開発専用であり、`NODE_ENV=test/production` では必ず無効化する
