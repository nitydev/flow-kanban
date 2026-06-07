# Flow Kanban

設計書や工程フローと連動してタスクカードを自動生成する、設計連動型カンバンアプリです。

## 公開URL

https://nitydev.github.io/flow-kanban/

## V1.3

- 初回アクセス時に初心者向けチュートリアルを自動表示
- 「概要 → フロー設計 → カード定義 → プロジェクト開始 → 実行ボード」の利用順を5ステップで案内
- チュートリアルの各ステップに合わせて対象ページへ自動移動
- 途中スキップと、サイドバーの「はじめてガイド」からの再表示に対応
- 完了・スキップ状態をブラウザに保存し、次回アクセス時は自動表示しない

### V1.2

- 初期表示されていたIT開発向けの工程・カード定義を廃止し、空の設計図から開始
- 工程の作成・編集・削除に対応
- 工程間接続の作成・削除に対応
- フロー図上で工程をドラッグ配置し、接続点のD&Dで矢印を作成
- カード定義の作成・編集・削除と工程内の順序変更に対応
- 工程削除時は、その工程のカード定義と接続もまとめて削除
- カード定義の削除・順序変更後は工程順を連番へ自動調整
- 実行中タスクとの不整合を防ぐため、開始済み工程の設計変更を禁止
- 概要、フロー設計、カード定義、実行ボード、イベントを目的別ページとして分離
- 共通サイドナビゲーションとURLハッシュによるページ移動に対応

削除操作は取り消せません。工程を削除すると、その工程に含まれるカード定義と接続も削除されます。

### V1.1

- ライトモード・ダークモードの切り替えボタンを追加
- 選択したテーマをブラウザに保存し、次回アクセス時にも維持
- 初回アクセス時はOSのカラーテーマ設定を反映

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
- 工程、接続、タスク定義のCRUD UI
- カード定義の工程順変更UI
- フロー図上のノード配置・矢印接続UI
- Fastify REST API
- プロジェクト単位WebSocket
- Prisma schema
- Vitestによるドメインテスト
- ダークモード切り替え

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

`main`ブランチへマージすると、GitHub Actionsで検証・ビルド後にGitHub Pagesへ自動公開されます。

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
