## プロジェクト概要と操作方法（t3-app-demo）

最終更新: 2025-10-03

### 概要
- Next.js 15 + TypeScript + tRPC + Prisma の T3 App ベースのデモ。
- React Query を用いたデータ取得、Tailwind v4 利用。UIは shadcn/ui の導入を想定（現状は導入例のみ、未同梱）。
- README は「Kanban Lite フロントエンド設計書」。現リポは T3 のサンプル（Post ルータ）で起動・確認できます。Kanban UI 群（Board/Column/TaskCard など）は未実装です。

### 技術スタック（主要）
- フロント: Next.js 15 / React 19 / TypeScript 5
- API: tRPC（`src/server/api`）
- DB: Prisma（デフォルトは SQLite, `DATABASE_URL`）
- スタイル: Tailwind CSS v4
- ツール: ESLint / Prettier

### 主なディレクトリ
- `src/app/page.tsx`: トップページ（tRPC 経由で Post を表示/作成）
- `src/app/_components/post.tsx`: Post 作成/最新取得のクライアントコンポーネント
- `src/trpc/*`: tRPC クライアント/Provider 周り
- `src/server/api/*`: tRPC サーバ（`post` ルータなど）
- `prisma/schema.prisma`: Prisma スキーマ（SQLite 想定）

> 注意: README に記載の Kanban 用コンポーネントは設計段階です。追加実装が必要です。

---

## 事前準備
- Node.js: 18 以上（LTS 推奨）
- パッケージマネージャ: pnpm（`packageManager: pnpm@10.12.1`）
- .env を作成し `DATABASE_URL` を設定（SQLite 例）

```env
# .env（ローカル例）
DATABASE_URL="file:./dev.db"
NODE_ENV=development
# SQLite の file: スキーマ利用時、Zod の url() バリデーションを回避したい場合
SKIP_ENV_VALIDATION=1
```

> メモ: `src/env.js` で `DATABASE_URL` は `z.string().url()` です。SQLite の `file:` を使う場合は `SKIP_ENV_VALIDATION=1` を併用してください。

---

## 初期セットアップ
```sh
pnpm i            # 依存インストール（postinstall で prisma generate 実行）
pnpm db:push      # スキーマを DB に反映（migrate を使う場合は pnpm db:generate）
pnpm db:studio    # 必要なら Prisma Studio を起動
```

### よく使うスクリプト（package.json より）
- `pnpm dev`: 開発サーバ起動（Turbo）
- `pnpm build` / `pnpm start`: 本番ビルドと起動
- `pnpm preview`: `next build && next start`
- `pnpm typecheck`: TypeScript 型チェック
- `pnpm lint` / `pnpm lint:fix`: ESLint 実行/修正
- `pnpm format:check` / `pnpm format:write`: Prettier チェック/整形
- DB 操作: `pnpm db:push`, `pnpm db:generate`（= migrate dev）, `pnpm db:migrate`, `pnpm db:studio`

---

## 開発サーバの起動
```sh
pnpm dev
# 既定で http://localhost:3000 で起動
```

画面上では T3 デフォルトページが表示され、Post の作成/最新取得が動作します（tRPC + Prisma 経由）。

---

## 本番ビルド/起動
```sh
pnpm build
pnpm start
```

---

## README に記載の Kanban 仕様について（現状）
- README は UI 設計書です。`app/_components/board/*` などのコンポーネント群は未作成です。
- モック切替の記述（`NEXT_PUBLIC_USE_MOCK=1`）は設計上の案で、現行コードには未配線です。
- 実装を進める場合は README のツリー/Props を踏襲して `src/app/_components/board/*` 等を追加してください。

---

## トラブルシュート
- `DATABASE_URL` 周りのエラー:
  - SQLite の `file:` を使うと `url()` バリデーションで失敗することがあります。`.env` に `SKIP_ENV_VALIDATION=1` を追加して再実行。
- Prisma クライアント未生成エラー:
  - `pnpm i` 後に `prisma generate` が走ります。失敗時は `pnpm exec prisma generate` を手動実行。
- ポート競合:
  - `PORT=3001 pnpm dev` のように環境変数で変更可能。

---

## 参考パス
- `src/app/page.tsx`
- `src/app/_components/post.tsx`
- `src/server/api/routers/post.ts`
- `src/server/api/root.ts`
- `prisma/schema.prisma`

以上。
