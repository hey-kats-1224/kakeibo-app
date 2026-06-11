# kakeibo-app

レシート読み込み家計簿Webアプリ。レシート画像をアップロードするとClaude APIが自動で内容を読み取り、カテゴリ別に集計してグラフ表示する。

## 技術スタック

### フロントエンド
- **React 18** — UIフレームワーク
- **Vite** — ビルドツール・開発サーバー（ポート 5173）
- **Chart.js / react-chartjs-2** — グラフ描画（円グラフ・棒グラフ）
- **LocalStorage** — クライアントサイドデータ永続化

### バックエンド
- **Node.js / Express** — APIサーバー（ポート 3001）
- **@anthropic-ai/sdk** — Claude API クライアント
- **multer** — マルチパートファイルアップロード処理
- **dotenv** — 環境変数管理

### 使用モデル
- `claude-haiku-4-5`（フルID: `claude-haiku-4-5-20251001`）

## プロジェクト構成

```
kakeibo-app/
├── .env                    # APIキー（Gitに含めない）
├── .gitignore
├── package.json            # ルート（concurrentlyで両サーバー同時起動）
├── CLAUDE.md
├── server/
│   ├── package.json
│   └── server.js           # Express + Claude API統合
└── client/
    ├── package.json
    ├── vite.config.js       # APIプロキシ設定
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx           # メインコンポーネント・状態管理
        ├── App.css           # スタイルシート
        ├── components/
        │   ├── ReceiptUpload.jsx   # 画像アップロードUI
        │   ├── ExpenseList.jsx     # レシート一覧・明細
        │   ├── Charts.jsx          # グラフ（円・棒）
        │   └── CategorySummary.jsx # カテゴリ別集計
        └── utils/
            └── storage.js    # LocalStorage操作・集計ユーティリティ
```

## セットアップ

```bash
# 依存関係のインストール
npm run install:all

# .envにAPIキーを設定
# ANTHROPIC_API_KEY=sk-ant-...

# 開発サーバー起動（フロントエンド + バックエンド同時起動）
npm run dev
```

## アプリ仕様

- レシート画像（JPG/PNG/WEBP）をアップロードするとClaude APIが内容を解析
- 読み取った商品名・金額・日付・店舗名を一覧表示
- カテゴリ別自動分類：食費・日用品・外食・交通費・娯楽・その他
- Chart.jsでカテゴリ別円グラフ + 月別棒グラフを表示
- LocalStorageによりリロード後もデータを保持
- レスポンシブ対応（モバイル・PC両対応）

## API設計

| メソッド | エンドポイント | 内容 |
|--------|-------------|------|
| POST | /api/upload | レシート画像を受け取り、Claude APIで解析して構造化データを返す |
| GET | /api/health | サーバーの稼働確認 |

## 環境変数

| 変数名 | 内容 |
|-------|------|
| `ANTHROPIC_API_KEY` | Anthropic APIキー（必須） |
| `PORT` | サーバーポート番号（デフォルト: 3001） |

## コーディング規約

- `let` / `const` を使用し `var` は使わない
- コメントは日本語で記載
- ES Modules（`import/export`）を使用
- フロントエンド：React Hooks（`useState`）で状態管理
- バックエンド：Express + async/await

## Git 運用ルール

- **コードを変更するたびに GitHub へプッシュする**
- コミットメッセージは日本語可。変更内容を簡潔に記述する
- `main` ブランチで直接作業する（小規模プロジェクトのため）
- 変更後のコマンド例:

```bash
git add .
git commit -m "変更内容の説明"
git push origin main
```

リモートリポジトリ: https://github.com/hey-kats-1224/kakeibo-app.git
