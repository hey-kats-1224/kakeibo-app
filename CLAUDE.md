# kakeibo-app

家計簿アプリ。収入・支出の記録・管理を行うフロントエンドアプリケーション。

## 技術スタック

- **HTML5** — 構造・マークアップ
- **CSS3** — スタイリング・アニメーション
- **Vanilla JavaScript (ES6+)** — ロジック・DOM操作
- ビルドツール・フレームワーク不使用（純粋なWeb標準技術のみ）

## プロジェクト構成

```
kakeibo-app/
├── index.html        # エントリーポイント
├── css/
│   └── style.css     # スタイルシート
├── js/
│   └── app.js        # メインロジック
└── data/
    └── records.js    # 収支データ（必要に応じて）
```

## 開発・実行方法

ブラウザで `index.html` を直接開くか、ローカルサーバーを使用する。

```bash
# Python を使う場合
python -m http.server 8080

# Node.js の npx を使う場合
npx serve .
```

## アプリ仕様

- 収入・支出の登録（金額・カテゴリ・日付・メモ）
- カテゴリ別集計・月別集計の表示
- LocalStorage によるデータ永続化
- 収支バランスのサマリー表示

## コーディング規約

- `let` / `const` を使用し `var` は使わない
- DOM操作は `document.querySelector` / `querySelectorAll` を使用
- イベントリスナーは `addEventListener` で登録
- CSSクラスの付け外しで状態管理（`classList.add/remove/toggle`）
- グローバル変数は最小限に抑え、モジュールパターンまたはクロージャで管理
- データ操作は純粋関数として切り出す

## 注意事項

- 外部ライブラリ・CDN依存は原則禁止（追加する場合はユーザーに確認）
- IE非対応、モダンブラウザ（Chrome/Firefox/Safari/Edge最新版）のみサポート
- レスポンシブ対応必須（モバイル・PC両対応）

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
