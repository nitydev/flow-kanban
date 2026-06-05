# Flow Kanban

設計書や工程フローと連動してタスクカードを自動生成する、設計連動型カンバンアプリです。

## 実装状況

現在はMVPのフロントエンド縦 slice と、インメモリ版APIを実装しています。

- 工程フローをDAGとして表示
- プロジェクト開始時に開始工程の最初のタスクを自動生成
- タスク完了時に同一工程の次タスクを自動生成
- 工程内の最後のタスク完了時に工程を自動完了
- 分岐先工程のタスク自動生成
- 合流工程はすべての前工程完了後に生成
- 完了済みタスクの未完了戻しを禁止
- 期限と状態に応じたカード表示
- WebSocketイベント想定ログの表示
- 工程、接続、タスク定義の追加UI
- Fastify REST API
- プロジェクト単位WebSocket
- Prisma schema
- Vitestによるドメインテスト

PostgreSQL永続化とPrisma repository実装は次の実装対象です。

## アーキテクチャ

Bulletproof Reactを参考に、責務でディレクトリを分けています。

```txt
src/
- app
- components/ui
- entities/flow
- features/flow-kanban
- shared/lib
server/
- app.ts
- routes.ts
- realtime.ts
- flow-store.ts
prisma/
- schema.prisma
```

主な実装:

- `src/entities/flow/types.ts`: ドメイン型
- `src/entities/flow/fixtures.ts`: 初期データ
- `src/features/flow-kanban/domain/flow-domain.ts`: 開始判定、DAG検証、タスク生成、完了処理
- `src/features/flow-kanban/model/use-flow-kanban.ts`: UI向け状態管理
- `src/features/flow-kanban/ui`: 画面コンポーネント
- `server/routes.ts`: REST API
- `server/realtime.ts`: WebSocket接続管理
- `prisma/schema.prisma`: PostgreSQL向けDB schema

## 開発

```bash
npm install
npm run dev
```

APIサーバー:

```bash
npm run dev:api
```

デフォルトでは `http://127.0.0.1:4000` で起動します。

## 検証

```bash
npm run build
npm run lint
npm run test
```

## 技術スタック

- Vite
- React
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- React Flow
- dnd-kit
- date-fns
- lucide-react
- Fastify
- Prisma
- Vitest

## 次の実装候補

- PostgreSQL永続化
- Prisma repository実装
- `POST /tasks/:taskId/complete` のトランザクション化
- Playwrightによる主要フローE2E
