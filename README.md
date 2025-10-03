# Kanban Lite フロントエンド設計書（T3 App 専用 / Next.js + TypeScript + Tailwind + shadcn）

最終更新: 2025-10-03

---

## 0. スコープと前提（見直し反映）

* 対象: **T3 App（tRPC）** のフロントのみ。バックエンド設計は不要（貴社で実装）。
* 目的: 王道構成で作り、別リポジトリへ容易に移植できるUI実装を提示。
* 認証: なし（NextAuth未導入）。
* API: 別途Swaggerで定義。ここでは**フロントのコンポーネント設計**と**最小モック**のみ示す。
* UIライブラリ: Tailwind + **shadcn/ui** 採用。
* リアルタイム: なし（検証対象外）。

---

## 1. ディレクトリ構成（指定ツリーに準拠）

```
src
├── app
│   ├── _components
│   │   ├── board
│   │   │   ├── Board.tsx
│   │   │   ├── Column.tsx
│   │   │   └── TaskCard.tsx
│   │   ├── task
│   │   │   ├── TaskDetailSheet.tsx
│   │   │   ├── CommentList.tsx
│   │   │   └── CommentForm.tsx
│   │   ├── layout
│   │   │   ├── AppHeader.tsx
│   │   │   └── SearchAndFilters.tsx
│   │   ├── common
│   │   │   ├── LabelBadge.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── UploadButton.tsx
│   │   └── providers
│   │       ├── QueryProvider.tsx
│   │       └── ThemeProvider.tsx
│   ├── api
│   │   └── trpc
│   │       └── [trpc]
│   │           └── route.ts            // BE側で実装。FE設計では中身不要
│   ├── layout.tsx
│   └── page.tsx                        // ボード画面
├── env.js
├── server
│   ├── api
│   │   ├── root.ts                     // BE側で実装する想定
│   │   ├── routers
│   │   │   └── post.ts                 // 雛形のままでOK（本件未使用）
│   │   └── trpc.ts                     // BE側で実装する想定
│   └── db.ts                           // BE側で実装する想定
├── styles
│   └── globals.css
└── trpc
    ├── query-client.ts
    ├── react.tsx
    └── server.ts
```

> 指定のツリーを維持しつつ、UIは `app/_components` 配下に整理。

---

## 2. shadcn 導入方針

* 使うコンポーネント（最小）: `button`, `input`, `textarea`, `select`, `dialog` or `sheet`, `badge`, `avatar`, `sonner`(toast)
* 導入例:

  * `npx shadcn@latest init`
  * `npx shadcn@latest add button input textarea select dialog sheet badge avatar sonner`
* カスタムトークンはTailwindで管理。角丸`rounded-2xl`、影`shadow-sm`、最小余白`p-3`。

---

## 3. 画面と動き（最小）

* **Board（/）**: 3カラム（Todo/InProgress/Done）。検索・ラベル/ステータスの簡易フィルタ。カードクリックで詳細Sheet。
* **TaskDetailSheet**: タスク編集フォーム + コメント一覧/投稿。添付1点のアップロードUI。
* **ヘッダ**: 検索バー + フィルタ。
* ダッシュボードや認証は今回は対象外。

---

## 4. 必要コンポーネント一覧

* `Board.tsx` … 3カラムをレイアウト。Props: `{ groups:{ Todo:Task[]; InProgress:Task[]; Done:Task[] } }`
* `Column.tsx` … ステータス単位のタスクリスト。Props: `{ status:Status; tasks:Task[] }`
* `TaskCard.tsx` … タスク概要。Props: `{ task:Task; onClick:()=>void }`
* `TaskDetailSheet.tsx` … 詳細編集。Props: `{ taskId:string|null; open:boolean; onOpenChange:(b:boolean)=>void }`
* `CommentList.tsx` / `CommentForm.tsx`
* `AppHeader.tsx` … 検索・フィルタ・「新規作成」ボタン。
* `SearchAndFilters.tsx` … クエリやステータス/ラベル選択UI。
* `LabelBadge.tsx` … HEXカラーを背景にしたバッジ。
* `ConfirmDialog.tsx` … 削除確認。
* `UploadButton.tsx` … 画像1点の選択とプレビュー。
* `QueryProvider.tsx` … React QueryのProvider。

> すべてクライアントコンポーネント。スタイルはshadcnのプリミティブにTailwindで上書き。

---

## 5. 型（DTO）と最小モック

* **型定義**はこのファイルに集約: `src/trpc/react.tsx`（移植性重視のためあえてローカル定義）
* **モック**は ENV で切替: `NEXT_PUBLIC_USE_MOCK=1` のときモック実装を使用。

```tsx
// src/trpc/react.tsx
"use client";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";

// ===== DTO =====
export type Status = "Todo"|"InProgress"|"Done";
export type Task = { id:string; title:string; description?:string; status:Status; labelId?:string; attachmentUrl?:string; version:number; createdAt:string; updatedAt:string };
export type Comment = { id:string; taskId:string; body:string; createdAt:string };
export type Label = { id:string; name:string; color:string };

// ===== API IF =====
export interface Api {
  listTasks(params?:{ q?:string; status?:Status; labelId?:string }): Promise<Task[]>;
  getTask(id:string): Promise<Task>;
  createTask(input:{ title:string; description?:string; labelId?:string }): Promise<Task>;
  updateTask(id:string, input:Partial<Omit<Task, "id"|"createdAt"|"updatedAt">> & { version:number }): Promise<Task>;
  deleteTask(id:string): Promise<{ id:string }>;
  listLabels(): Promise<Label[]>;
  listComments(taskId:string): Promise<Comment[]>;
  addComment(taskId:string, input:{ body:string }): Promise<Comment>;
}

// ===== Mock API =====
function createMock(): Api {
  let tasks: Task[] = [
    { id:"t1", title:"最初のタスク", status:"Todo", version:0, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
  ];
  let comments: Comment[] = [];
  const labels: Label[] = [{ id:"l1", name:"General", color:"#64748b" }];
  return {
    async listTasks(p){ const q=(p?.q??"").toLowerCase(); const st=p?.status; const lb=p?.labelId; return tasks.filter(t=>(!q||t.title.toLowerCase().includes(q))&&(!st||t.status===st)&&(!lb||t.labelId===lb)); },
    async getTask(id){ const t=tasks.find(x=>x.id===id); if(!t) throw new Error("NotFound"); return t; },
    async createTask(input){ const now=new Date().toISOString(); const t:Task={ id:crypto.randomUUID(), title:input.title, description:input.description, labelId:input.labelId, status:"Todo", version:0, createdAt:now, updatedAt:now }; tasks=[t,...tasks]; return t; },
    async updateTask(id, input){ const i=tasks.findIndex(x=>x.id===id); if(i<0) throw new Error("NotFound"); if(input.version!==tasks[i].version) throw new Error("Conflict"); const v=tasks[i].version+1; const t={ ...tasks[i], ...input, version:v, updatedAt:new Date().toISOString() }; tasks[i]=t; return t; },
    async deleteTask(id){ tasks=tasks.filter(t=>t.id!==id); return { id }; },
    async listLabels(){ return labels; },
    async listComments(taskId){ return comments.filter(c=>c.taskId===taskId); },
    async addComment(taskId, { body }){ const c:Comment={ id:crypto.randomUUID(), taskId, body, createdAt:new Date().toISOString() }; comments=[c,...comments]; return c; },
  };
}

// ===== tRPC API 置き換えポイント =====
function createTrpcApi(): Api {
  // 実装はBE完成後に差し替え。メソッドの署名だけ固定。
  // 例: return { listTasks: (p)=>trpc.tasks.list.query(p), ... }
  throw new Error("tRPC API is not wired yet");
}

const ApiCtx = createContext<Api|null>(null);
export function ApiProvider({ children }:{ children:React.ReactNode }){
  const api = useMemo<Api>(()=> process.env.NEXT_PUBLIC_USE_MOCK ? createMock() : createTrpcApi(), []);
  const qc = useMemo(()=> new QueryClient(), []);
  return (
    <ApiCtx.Provider value={api}>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </ApiCtx.Provider>
  );
}
export const useApi = () => {
  const v = useContext(ApiCtx); if(!v) throw new Error("ApiProvider missing"); return v;
};

// ===== Hooks（UIからはここだけ使う） =====
export function useTasks(params?:{ q?:string; status?:Status; labelId?:string }){
  const api = useApi();
  return useQuery({ queryKey:["tasks", params], queryFn:()=>api.listTasks(params) });
}
export function useTask(id:string|undefined){
  const api = useApi();
  return useQuery({ queryKey:["task", id], queryFn:()=> api.getTask(id as string), enabled: !!id });
}
export function useCreateTask(){
  const api = useApi(); const qc=useQueryClient();
  return useMutation({ mutationFn:(i:{ title:string; description?:string; labelId?:string })=>api.createTask(i), onSuccess:()=> qc.invalidateQueries({ queryKey:["tasks"] }) });
}
export function useUpdateTask(){
  const api = useApi(); const qc=useQueryClient();
  return useMutation({ mutationFn:(v:{ id:string; input:any })=>api.updateTask(v.id, v.input), onSuccess:(_r,vars)=>{ qc.invalidateQueries({ queryKey:["tasks"] }); qc.invalidateQueries({ queryKey:["task", vars.id] }); } });
}
export function useDeleteTask(){
  const api = useApi(); const qc=useQueryClient();
  return useMutation({ mutationFn:(id:string)=>api.deleteTask(id), onSuccess:()=> qc.invalidateQueries({ queryKey:["tasks"] }) });
}
export function useLabels(){
  const api = useApi();
  return useQuery({ queryKey:["labels"], queryFn:()=>api.listLabels() });
}
export function useComments(taskId:string){
  const api = useApi();
  return useQuery({ queryKey:["comments", taskId], queryFn:()=>api.listComments(taskId), enabled: !!taskId });
}
export function useAddComment(){
  const api = useApi(); const qc=useQueryClient();
  return useMutation({ mutationFn:(v:{ taskId:string; body:string })=>api.addComment(v.taskId, { body:v.body }), onSuccess:(_r,vars)=> qc.invalidateQueries({ queryKey:["comments", vars.taskId] }) });
}
```

---

## 6. ページとProvider配線

```tsx
// src/app/layout.tsx
import "@/styles/globals.css";
import { ApiProvider } from "@/trpc/react";
import { Toaster } from "sonner";

export default function RootLayout({ children }:{ children:React.ReactNode }){
  return (
    <html lang="ja">
      <body>
        <ApiProvider>
          {children}
          <Toaster richColors/>
        </ApiProvider>
      </body>
    </html>
  );
}
```

```tsx
// src/app/page.tsx
"use client";
import Board from "./_components/board/Board";
import { useTasks } from "@/trpc/react";

export default function Page(){
  const { data:items=[] } = useTasks();
  const groups = {
    Todo: items.filter(t=>t.status==="Todo"),
    InProgress: items.filter(t=>t.status==="InProgress"),
    Done: items.filter(t=>t.status==="Done"),
  };
  return <Board groups={groups} />;
}
```

---

## 7. コンポーネント要件（要点）

* **Board**: 3カラムをGrid配置。`onCreate`ボタンはヘッダに。ドラッグ&ドロップは後日追加で可。
* **Column**: タイトル + カード群。空状態表示。
* **TaskCard**: タイトル、ラベル色、更新日時。クリックで詳細Sheet。
* **TaskDetailSheet**: フォーム要素はshadcnの`input/textarea/select`。保存時に`useUpdateTask`。`version`をhidden保持し、競合時はトーストで通知。
* **CommentList/Form**: 直近10件で十分。送信後にリスト再取得。
* **UploadButton**: `input[type=file]` で画像のみ。アップロードAPIはBE完成まで未接続で可（モックで `attachmentUrl` を `ObjectURL` に暫定保存）。

---

## 8. スタイル指針

* カード: `rounded-2xl shadow-sm p-3`。列ヘッダにステータス色（Todo=slate, InProgress=amber, Done=emerald）。
* ラベル: HEXに応じて前景色を自動切替（輝度で白黒選択）。

---

## 9. 移植性

* 依存は `src` と `styles/globals.css` のみで自己完結。
* 別リポへは `src/app/_components`, `src/trpc`, `styles/globals.css` をコピーし、`layout.tsx` の Provider 配線を同様に置く。
* モック→本番切替は `NEXT_PUBLIC_USE_MOCK=0` とし、`createTrpcApi()` の中身をtRPC呼び出しへ差し替え。

---

## 10. Swagger 連携の前提（簡易リスト）

* エンドポイントは別ドキュメントで管理。最低限:

  * `GET /tasks`, `POST /tasks`, `GET /tasks/{id}`, `PATCH /tasks/{id}`, `DELETE /tasks/{id}`
  * `GET /labels`, `POST /labels`
  * `GET /tasks/{id}/comments`, `POST /tasks/{id}/comments`
* 本設計では型とメソッド名を固定。I/OはSwaggerを見て `createTrpcApi()` に実装。

---

## 11. 依存パッケージ

```
@tanstack/react-query
class-variance-authority tailwind-merge
lucide-react
sonner
```

---

## 12. 完了定義（FE）

* モックでCRUDとコメントが動作し、UIが崩れない。
* `createTrpcApi()` を差し替えるだけでBEと接続可能。
* ディレクトリ構成は提示ツリーを厳守。
