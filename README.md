# Dairect Backend

Nuxt フロントエンドと連携する **TypeScript + Express** バックエンドです。  
DB は MariaDB/MySQL（Prisma ORM）。環境は EC2 を想定しています。

---

## 📦 Tech Stack

- TypeScript / Express
- Prisma ORM / MariaDB(MySQL)
- JWT（Access）+ Refresh Token（DB 管理・回転）
- Cookie（HttpOnly）運用（Refresh）
- Rate Limit（メモリ or Redis）
- Prometheus `/metrics`（`prom-client`）
- Logger（`requestId` 付与）
- ESLint / Prettier

---

## 🗺️ 現状の仕様（P0〜P2 反映済）

### 認証・セッション

- `POST /api/users/login`
  - 成功時: `accessToken` を JSON で返却 + **Refresh を HttpOnly Cookie に保存**
  - レスポンスに将来フラグ `mfaRequired: false` を付与（今は常に false）
- `POST /api/users/refresh`
  - Cookie（優先） or `body.refreshToken` を受理
  - **Refresh を回転**（旧 Refresh は DB で失効）し、Cookie を再設定
- `POST /api/users/logout`（要認証）
  - **そのユーザーの全 Refresh** を DB で失効 + Cookie 削除
- `POST /api/users/logoutone`
  - Cookie or `body.refreshToken` の **1 本だけ** 失効 + Cookie 削除

### 汎用

- `GET /healthz`：ヘルスチェック
- `GET /metrics`：Prometheus メトリクス（`prom-client`）
- `X-Request-Id` を入出力（無ければサーバが採番）
- CSRF：**ヘッダ受理のみ**（`X-CSRF-Token`）。検証は **今は未実施**（将来 ON 予定）
- Idempotency：`Idempotency-Key` ヘッダで **POST/PUT/PATCH/DELETE** の重複実行を吸収（orders などに適用）

### 一覧 API のページング

- 既存の `limit/offset` を継続
- 将来移行のため、レスポンスに `nextCursor` を **追加**（今は使わなくても OK）
- `GET /api/products?limit=&offset=&cursor=` は `cursor` 指定時に **キーセット（id desc）** で返却

### エラーフォーマット（標準化）

```json
{ "error": "メッセージ", "code": "任意のエラーコード", "requestId": "<X-Request-Id>" }
```

---

## 📂 ディレクトリ構成（抜粋）

```
dairect-backend/
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/            # migrate dev で生成
│  └─ seed.ts                # 任意: 開発データ投入
├─ src/
│  ├─ config/
│  │  └─ env.ts              # .env を型安全に取り込み
│  ├─ lib/
│  │  └─ prisma.ts
│  ├─ middlewares/
│  │  ├─ auth.ts
│  │  ├─ async.ts
│  │  ├─ requestId.ts
│  │  ├─ rateLimit.ts        # loginLimiter / generalLimiter
│  │  ├─ idempotency.ts
│  │  └─ csrfHint.ts         # X-CSRF-Token を保持（検証は未実施）
│  ├─ routes/
│  │  ├─ common/
│  │  │  └─ metrics.ts       # GET /metrics
│  │  ├─ users/
│  │  │  ├─ login.ts
│  │  │  ├─ refresh.ts
│  │  │  ├─ logout.ts        # 全セッション失効（要認証）
│  │  │  └─ logoutOne.ts     # 1本だけ失効
│  │  ├─ products/
│  │  │  └─ list.ts          # nextCursor を追加で返却
│  │  └─ orders/
│  │     ├─ index.ts         # ルータ集約（idempotency 適用可）
│  │     ├─ create.ts
│  │     ├─ list.ts          # nextCursor を追加で返却
│  │     ├─ detail.ts
│  │     ├─ update.ts / patch.ts / remove.ts / itemUpdate.ts
│  ├─ schemas/               # zod 等（バリデーション）
│  ├─ services/
│  │  ├─ users.service.ts    # authenticateUser など
│  │  ├─ orders.service.ts
│  │  ├─ tokens.service.ts   # Refresh の発行/回転/失効
│  │  └─ audit.service.ts    # 監査ログ基盤（組み込みは後段）
│  ├─ utils/
│  │  ├─ jwt.ts              # Access（Sign/Verify）
│  │  ├─ refresh.ts          # Refresh（Sign/Verify）
│  │  ├─ hash.ts             # パスワード hash/verify
│  │  ├─ cookies.ts          # Refresh Cookie オプション
│  │  ├─ cursor.ts           # cursor エンコード/デコード（将来）
│  │  ├─ errors.ts / response.ts
│  │  └─ logger.ts（任意）
│  └─ index.ts               # Express 起動
├─ .env
├─ package.json
└─ README.md
```

> 互換のため、`/api/...` と **`/api/v1/...` を二重マウント**（将来 `/v2` で破壊変更可）

---

## ⚙️ セットアップ

### 1) 依存のインストール

```bash
npm i
# メトリクス＆Cookie
npm i prom-client on-finished cookie-parser
npm i -D @types/on-finished @types/cookie-parser
```

### 2) `.env`（例）

```env
# DB
DATABASE_URL="mysql://root:root@localhost:3306/mydb"

# App
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# JWT / Refresh
JWT_SECRET=change_me
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
REFRESH_TOKEN_COOKIE=refresh_token
REFRESH_COOKIE_PATH=/api/users
COOKIE_SAME_SITE=lax          # none|lax|strict
COOKIE_DOMAIN=                # 例: .example.com (任意)

# Redis（任意: RateLimit / Idempotency キャッシュ）
REDIS_URL=
```

> 本番で `COOKIE_SAME_SITE=none` の場合は **HTTPS + secure=true**（自動）必須

### 3) DB マイグレーション

```bash
npx prisma migrate dev --name base
# 既存データを消して作り直す場合
# npx prisma migrate reset
# npx prisma generate
```

### 4) 起動

```bash
npm run dev
# or pm2
# pm2 start npm --name "dairect-backend" -- run dev
```

---

## ✅ 動作確認（curl）

### Login → Refresh（Cookie 保存）

```bash
# login（Cookie保存）
curl -i -c jar.txt -b jar.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"password"}' \
  http://localhost:3001/api/users/login

# refresh（Cookieから読み取り、回転して再セット）
curl -i -c jar.txt -b jar.txt -X POST \
  http://localhost:3001/api/users/refresh
```

### Logout（全セッション / 1 本だけ）

```bash
# 全セッション（要 Access）
curl -i -H "Authorization: Bearer <access>" \
  -X POST http://localhost:3001/api/users/logout

# 1本だけ（Cookie or body の refresh）
curl -i -c jar.txt -b jar.txt \
  -X POST http://localhost:3001/api/users/logoutone
```

### Products 一覧（nextCursor 付き）

```bash
curl "http://localhost:3001/api/products?limit=20"
# → { items, total, limit, offset, cursor, nextCursor }
```

---

## 🔒 セキュリティ / 運用の注意

- **CORS**：本番は `CORS_ORIGIN` を固定。フロントは `credentials: 'include'`
- **CSRF**：Cookie 運用のため、将来 `X-CSRF-Token` 検証を有効化予定（今は受理のみ）
- **Idempotency-Key**：副作用のある API（注文/決済等）に適用。並行ロックが必要な場合は SETNX 拡張可
- **/metrics**：本番は IP 制限や Basic 認証等で保護推奨
- **RateLimit**：`loginLimiter` は有効。`generalLimiter` は必要に応じて適用

---

## 🧭 今後のロードマップ（メモ：P3〜P6）

### P3（運用基盤）

- Docker multi-stage / docker-compose、healthcheck
- CI（lint/test/build、`prisma migrate diff`、型チェック、vuln scan）
- CSRF 検証 ON（ダブルサブミット等）
- `/metrics` 保護、`helmet` セキュリティヘッダ

### P4（性能 / データ層）

- キーセットページングへ段階移行（cursor first）
- 主要クエリのインデックス最適化 & N+1 検知
- 読み取りキャッシュ（Redis）
- Idempotency のロック強化（SETNX）

### P5（可観測性）

- OpenTelemetry（Express/HTTP/Prisma）
- Sentry 等のエラートラッキング
- 構造化ログ（requestId/traceId 相関）

### P6（アカウント強化）

- RBAC の権限定義・管理機能
- パスワードリセット / メール検証 / 2FA
- 監査ログの本格組み込み（重要操作に展開）

---

## 🐞 トラブルシュート

| 症状                            | 対応                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `AuditLog` のリレーションエラー | `User.auditLogs AuditLog[] @relation("UserAuditLogs")` を追加し、両側のリレーション名を一致させる |
| `cookie-parser` の型が無い      | `npm i -D @types/cookie-parser`                                                                   |
| `/metrics` が空                 | `metricsMiddleware` を `app.use()` しているか確認                                                 |
| Refresh が更新されない          | Cookie の `SameSite/Domain/Path` と CORS/credentials を確認                                       |

---

## 📜 ライセンス

Private (c) YOUR_ORG
