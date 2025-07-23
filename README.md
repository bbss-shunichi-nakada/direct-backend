# Dairect Backend

このリポジトリは、Nuxt.js フロントエンドと連携するための TypeScript 製の Express バックエンドです。Docker ベースで構築されており、MySQL を使用します。

---

## 📦 技術スタック

- TypeScript
- Express
- Prisma ORM
- MySQL (Docker)
- Docker Compose
- Prettier / ESLint 対応済み（VSCode 設定同梱）

---

## 🧑‍💻 セットアップ手順（初回）

### 1. `.env` の確認

```env
DATABASE_URL="mysql://root:root@db:3306/mydb"
```

すでに設定済みです（パスワードなどは `root` に統一）。

---

### 2. Docker コンテナ起動

```bash
docker-compose run --rm api npm install
docker-compose up --build
```

- バックエンド（API サーバー）: http://localhost:3001
- MySQL: localhost:3306（`root` / `root`）

---

### 3. 初期マイグレーションの適用（初回のみ）

```bash
docker-compose run --rm api npx prisma migrate dev --name init
```

**DB リセットが必要な場合（開発時など）**:

```bash
docker-compose run --rm api npx prisma migrate reset
```

---

## ✅ Thunder Client を使ったログイン API 接続確認

### エンドポイント

```http
POST http://localhost:3001/api/login
```

### リクエスト Body（JSON）

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### レスポンス例（Status: 200）

```json
{
  "id": 1,
  "name": "Test User",
  "email": "test@example.com"
}
```

※ 上記ユーザーは初期マイグレーション時に自動で登録されます。

---

## 💡 補足

- VSCode を使用している場合は、自動で以下が適用されます：
  - 保存時の Prettier フォーマット
  - 拡張機能インストールのおすすめ通知（SQLTools, Prisma など）

---

## 🔧 よくあるトラブル

| 症状                        | 対応                                           |
| --------------------------- | ---------------------------------------------- |
| `User` テーブルが存在しない | `prisma migrate dev` または `reset` を実行     |
| JSON 整形が動作しない       | `.vscode/settings.json` が適用されているか確認 |
| Docker が起動しない         | Docker Desktop が起動中か確認する              |

---

## 📂 ディレクトリ構成（抜粋）

```
dairect-backend/
├── .vscode/             # VSCode 設定（Prettier, 推奨拡張）
├── prisma/              # Prisma スキーマとマイグレーション
├── src/                 # APIエントリポイントとルーティング
├── .env                 # DB接続情報
├── docker-compose.yml
└── README.md
```

---

## 🚀 今後の予定（例）

- JWT 認証の導入
- Signup（ユーザー登録）API
- 商品・カート関連の API

---

何か問題があればお気軽にご相談ください！
