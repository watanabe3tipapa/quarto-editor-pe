# Quarto Editor PE

インタラクティブなQuartoドキュメントエディタ + AIアシスタント

## 目次

- [概要](#概要)
- [前提条件](#前提条件)
- [インストール](#インストール)
- [開発](#開発)
- [ビルド](#ビルド)
- [デプロイ](#デプロイ)
- [使い方](#使い方)
- [機能一覧](#機能一覧)
- [Ollama AI機能](#ollama-ai機能)

---

## 概要

Quarto Editor PEは、Quarto/markdownドキュメントを編集・プレビューできるブラウザベースのエディタです。コードブロックの実行、AIアシスタントによるコード支援機能を備えています。

### 主な機能

- **リアルタイムMarkdown編集** - CodeMirror 6ベースのエディタ
- **ライブプレビュー** - Edit/Previewモード切り替え
- **コードブロック実行** - JavaScript/Python コードの実行（シミュレート）
- **AIアシスタント** - Ollama接続によるコード説明・補完・リファクタリング
- **ファイル操作** - アップロード・保存・クリア

---

## 前提条件

- **Node.js** 18.x 以上
- **npm** 9.x 以上
- （AI機能使用時）**Ollama** インストール済み

### Ollamaインストール（AI機能を使う場合）

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# モデルダウンロード
ollama pull llama3.2

# Ollama起動
ollama serve
```

> **注意**: Ollama AI機能はローカル環境でのみ動作します。Vercelデプロイ版では利用できません。

---

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-repo/quarto-editor-pe.git
cd quarto-editor-pe

# 依存関係インストール
npm install
```

---

## 開発

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

### ホットリロード

開発中はファイル保存時に自動リロードされます。

---

## ビルド

### 本番用ビルド

```bash
npm run build
```

ビルド成果物は `dist/` ディレクトリに出力されます。

### ビルド確認（ローカル）

```bash
npm run preview
```

`http://localhost:4173` でビルド結果を確認できます。

### serveで配信

```bash
npx serve dist
```

`http://localhost:3000` でアクセスできます。

---

## デプロイ

### Vercelにデプロイ（推奨）

VercelはGitHubリポジトリと連携することで、自动的なデプロイが可能です。

#### 方法1: GitHubからデプロイ（推奨）

1. **GitHubにリポジトリを作成**

   ```bash
   # リポジトリを初期化
   git init
   git add .
   git commit -m "Initial commit"
   
   # GitHubでリポジトリを作成後
   git remote add origin https://github.com/あなたのユーザー名/quarto-editor-pe.git
   git branch -M main
   git push -u origin main
   ```

2. **Vercel Dashboardからインポート**

   - [vercel.com](https://vercel.com) でアカウント作成/ログイン
   - 「New Project」をクリック
   - 「Import Git Repository」から先ほど作成したリポジトリを選択
   - Framework Presetは「Vite」が自動検出されます
   - Build Command, Output Directory は自動設定済み
   - 「Deploy」をクリック

3. **デプロイ完了**

   デプロイが完了すると、URLが発行されます（例: `https://quarto-editor-pe.vercel.app`）

#### 方法2: Vercel CLIでデプロイ

```bash
# Vercel CLIをインストール
npm install -g vercel

# プロジェクトルートでログイン
vercel login

# デプロイ（テスト用）
vercel

# 本番環境にデプロイ
vercel --prod
```

#### 設定ファイル（vercel.json）

プロジェクトには既に `vercel.json` が含まれています:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

#### 自動デプロイの設定

GitHubに接続すると、mainブランチにpushするたびに自动的にデプロイされます。

- `vercel.json` によりビルドコマンドと出力ディレクトリが自動設定
- カスタムドメインの追加も可能（Vercel Dashboardから設定）

### Netlifyにデプロイ

#### 準備

`netlify.toml` を作成:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### デプロイ方法

1. GitHubにリポジトリをプッシュ
2. [netlify.com](https://netlify.com) でアカウント作成
3. 「New site from Git」をクリック
4. GitHubリポジトリを選択
5. Build settingsが自動設定される
6. 「Deploy site」をクリック

### 静的ファイルとして配信

```bash
# dist/ を生成
npm run build

# serveで配信
npx serve dist
# http://localhost:3000 でアクセス

# またはPythonのhttp.server
python -m http.server 8000 -d dist
```

### 各デプロイ先の比較

| プラットフォーム | メリット | デメリット |
|----------------|---------|-----------|
| **Vercel** | GitHub連携、自动デプロイ、手軽 | Ollama機能不可 |
| **Netlify** | 静的サイトに強い | Ollama機能不可 |
| **ローカルserve** | Ollama機能完全動作 | 公開できない |

> **注意**: AIアシスタント機能（Ollama）はローカル環境でのみ動作します。VercelやNetlifyにデプロイした場合、Ollama接続はできません。

---

## 使い方

### メイン画面

```
┌─────────────────────────────────────────────────────────┐
│  Quarto Editor PE                    [UPLOAD] [SAVE]...  │
├─────────────────────────────────────────────────────────┤
│  Edit | Preview                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  # ドキュメントタイトル                                  │
│                                                         │
│  ``` {python}                                           │
│  code = "hello"                                         │
│  print(code)                                            │
│  ```                                                    │
│                                                         │
│  [python] [○待機中] [▶ 実行]                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
                                    ┌─────────────────┐
                                    │ 🤖 AI Assistant │
                                    └─────────────────┘
```

### ヘッダーボタン

| ボタン | 説明 |
|--------|------|
| 📂 **UPLOAD** | `.qmd`, `.md`, `.txt` ファイルを読み込む |
| 💾 **SAVE** | ドキュメントを `quarto-document.qmd` としてダウンロード |
| 🗑️ **CLEAR** | ドキュメントをクリア（確認ダイアログ付き） |
| **Edit** | Markdownエディタを表示 |
| **Preview** | 整形されたプレビューを表示 |

### コードブロック操作

1. **実行**: コードブロック横の「▶ 実行」ボタンをクリック
2. **状態表示**: ○待機中 → ●処理中 → ✓成功/✗エラー
3. **結果表示**: 成功/エラーの出力結果が下部に表示
4. **リセット**: 「Reset」ボタンで状態をクリア

### AIアシスタント（左下ボタン）

1. **🤖 AI** ボタンをクリックしてアシスタントを開く
2. **コード選択**: エディタでコードブロックをクリック
3. **機能を選択**:
   - 📖 **Explain**: コードの説明を生成
   - ✨ **Complete**: コードの続きを補完
   - 🔄 **Refactor**: コードのリファクタリング
4. **チャット**: 直接AIに質問もできます

> **注意**: AI機能はOllama接続が必要です

---

## 機能一覧

### エディタ機能

| 機能 | 説明 |
|------|------|
| シンタックスハイライト | Markdown/Code ハイライト |
| 自動補完 | 括弧、コード補完 |
| 検索・置換 | Ctrl+F / Ctrl+H |
| UNDO/REDO | Ctrl+Z / Ctrl+Shift+Z |
| タブ切り替え | Edit/Preview |

### コード実行

| 言語 | 実行方法 | 備考 |
|------|----------|------|
| JavaScript | ブラウザで実行 | console.log 出力取得 |
| Python | シミュレート | 結果は擬似出力 |

### エラー表示

エラー発生時は3層構造で表示:

1. **サマリー**: 何が起こったか
2. **ヒント**: 修正方法（エラー種類別）
3. **詳細**: 技術的なスタックトレース（折りたたみ）

---

## Ollama AI機能

### 接続確認

AIアシスタント右上のインジケーター:

- 🟢 **緑点滅**: 接続済み
- 🔴 **赤点**: 未接続
- 🟡 **黄点**: 確認中

### 利用可能モデル

デフォルト: `llama3.2`

他のモデルをダウンロード:

```bash
ollama pull codellama
ollama pull mistral
ollama pull phi
```

### プロンプトカスタマイズ

`src/services/OllamaService.js` を編集してシステムプロンプトを変更できます。

### APIエンドポイント変更

デフォルト: `http://localhost:11434`

変更する場合:

```javascript
const ollama = new OllamaService('http://your-ollama-server:11434')
```

---

## プロジェクト構造

```
quarto-editor-pe/
├── src/
│   ├── components/
│   │   ├── QuartoEditor.jsx    # メインエディタ
│   │   ├── CodeChunk.jsx       # コードブロックUI
│   │   ├── RunButton.jsx       # 実行ボタン
│   │   ├── OutputPanel.jsx     # 出力パネル
│   │   ├── StatusIndicator.jsx # ステータス表示
│   │   ├── AIAssistant.jsx     # AIアシスタント
│   │   ├── FloatingButtons.jsx # フローティングボタン
│   │   └── SampleDocument.jsx  # プレビュー
│   ├── services/
│   │   └── OllamaService.js    # Ollama API接続
│   ├── styles/
│   │   └── *.css
│   ├── App.jsx
│   └── main.jsx
├── dist/                       # ビルド成果物
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

---

## トラブルシューティング

### 開発サーバーが起動しない

```bash
# ポート確認
lsof -i :5173

# プロセスkill
kill -9 <PID>

# 再起動
npm run dev
```

### Ollamaに接続できない

```bash
# Ollama起動確認
curl http://localhost:11434/api/tags

# Ollama再起動
pkill ollama
ollama serve
```

### ビルドエラー

```bash
# node_modules再インストール
rm -rf node_modules package-lock.json
npm install
```

---

## ライセンス

MIT License
