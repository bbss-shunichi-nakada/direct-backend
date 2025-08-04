# Dairect Backend

このリポジトリは、Nuxt.js フロントエンドと連携するための TypeScript 製 Express バックエンドです。  
AWS EC2 上で MariaDB とともに動作します。

---

## 📦 技術スタック

- TypeScript
- Express
- Prisma ORM
- MariaDB（EC2 ローカルインストール）
- pm2（Node.js プロセス管理）
- Prettier / ESLint 対応済み（VSCode 設定同梱）

---

## 🧑‍💻 セットアップ手順（初回）

### 1. MariaDB のインストール・初期設定（EC2 内）

```bash
# MariaDB インストール
sudo yum install -y mariadb-server

# サービス起動
sudo systemctl start mariadb

# 自動起動設定
sudo systemctl enable mariadb

# 初期セットアップ（root パスワードなどを設定）
sudo mysql_secure_installation

# DB・ユーザー作成（例）
mysql -u root -p
> CREATE DATABASE mydb;
> CREATE USER 'root'@'localhost' IDENTIFIED BY 'root';
> GRANT ALL PRIVILEGES ON mydb.* TO 'root'@'localhost';
> FLUSH PRIVILEGES;
> EXIT;
```

---

### 2. `.env` の確認

```env
DATABASE_URL="mysql://root:root@localhost:3306/mydb"
```

---

### 3. 依存パッケージのインストール

```bash
cd /home/ec2-user/direct-backend
npm install
```

---

### 4. Prisma マイグレーションの適用

```bash
npx prisma migrate dev --name init
```

**DB リセットが必要な場合（開発時など）**:

```bash
npx prisma migrate reset
```

---

### 5. Node.js サーバーの起動・管理（pm2）

```bash
# pm2 インストール（未導入の場合）
npm install -g pm2

# サーバー起動
pm2 start npm --name "dairect-backend-dev" -- run dev

# サーバー再起動
pm2 restart dairect-backend-dev

# サーバー停止
pm2 stop dairect-backend-dev

# pm2 プロセス一覧
pm2 ls

# サーバー自動起動設定（EC2再起動時も自動起動）
pm2 startup
pm2 save
```

---

## ✅ API 動作確認方法

リモート環境のため Thunder Client などは利用できません。  
**curl** または **Postman（ローカル PC から EC2 の API エンドポイントにアクセス）** をご利用ください。

### 例: curl でログイン API をテスト

```bash
curl -X POST http://<EC2のパブリックIP>:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

※ セキュリティグループで 3001 ポートのインバウンド許可が必要です。

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
| サーバーが起動しない        | pm2 のログや `npm install` の実行を確認        |
| MariaDB が起動しない        | `sudo systemctl status mariadb` で状態確認     |

---

## 📂 ディレクトリ構成（抜粋）

```
dairect-backend/
├── .vscode/             # VSCode 設定（Prettier, 推奨拡張）
├── prisma/              # Prisma スキーマとマイグレーション
├── src/                 # APIエントリポイントとルーティング
├── .env                 # DB接続情報
├── package.json
└── README.md
```

---

## 🚀 今後の予定（例）

- RDS への DB 移行
- JWT 認証の導入
- Signup（ユーザー登録）API
- 商品・カート関連の API

---

何か問題があればお気軽にご相談
