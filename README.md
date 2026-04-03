[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Version](https://img.shields.io/badge/version-0.3.0-green.svg)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

# Quarto Editor PE

インタラクティブなQuartoドキュメントエディタ + AIアシスタント（Ollama対応）

## 技術スタック

### フロントエンド

| カテゴリ | 技術 | バージョン |
|----------|------|------------|
| **フレームワーク** | React | 18.x |
| **ビルドツール** | Vite | 5.x |
| **エディタ** | CodeMirror 6 | 6.x |
| **Markdown変換** | marked | 17.x |
| **Python実行** | Pyodide (WebAssembly) | 0.25.x |
| **言語** | JavaScript (JSX) | ES2022 |

### コアライブラリ (CodeMirror 6)

| パッケージ | 用途 |
|-----------|------|
| `@codemirror/state` | エディタ状態管理 |
| `@codemirror/view` | ビュー・描画 |
| `@codemirror/commands` | キーバインド・UNDO/REDO |
| `@codemirror/language` | シンタックスハイライト・折りたたみ |
| `@codemirror/autocomplete` | 自動補完 |
| `@codemirror/search` | 検索・置換 |
| `@codemirror/lang-markdown` | Markdownモード |

### サーバーサイド

| 技術 | 用途 |
|------|------|
| Express | Quarto CLI APIサーバー |
| Quarto CLI | HTMLレンダリング |

### 開発・運用

| カテゴリ | 技術 |
|----------|------|
| **デプロイ** | Vercel / Netlify / 静的配信 |
| **スタイリング** | CSS |

## コンポーネント構造

```
src/
├── App.jsx                      # アプリケーションルート
├── main.jsx                     # エントリーポイント
├── components/
│   ├── QuartoEditor.jsx         # CodeMirror統合エディタ
│   │   ├── CodeChunk.jsx        # コードブロックUI
│   │   │   ├── RunButton.jsx    # 実行ボタン
│   │   │   ├── StatusIndicator  # ○●✓✗ ステータス
│   │   │   ├── OutputPanel.jsx  # 結果表示
│   │   │   └── LintPanel.jsx    # リント表示
│   │   │
│   │   └── SampleDocument.jsx   # プレビュー
│   │
│   ├── FloatingButtons.jsx      # フローティングAIボタン
│   ├── AIAssistant.jsx          # Ollama AIチャット
│   └── LintPanel.jsx            # リントパネル
│
├── services/
│   ├── OllamaService.js         # Ollama APIクライアント
│   ├── LinterService.js         # コードリント
│   ├── PyodideService.js        # Python実行 (WebAssembly)
│   └── RenderService.js         # HTMLレンダリング
│
└── styles/                      # CSSファイル
server/
└── quarto-api.js                # Quarto CLI APIサーバー
```

## 主な機能

- **リアルタイムMarkdown編集** - CodeMirror 6ベースのエディタ
- **エディタツールバー** - 見出し、太字、リスト、コードブロック挿入
- **ライブプレビュー** - Edit/Previewモード切り替え
- **コードブロック実行**
  - JavaScript: ブラウザ上で実際実行
  - Python: Pyodide (WebAssembly) で実行
- **コードブロックパネル** - 選択したブロックの実行UIを右側に表示
- **HTMLエクスポート** - Quarto CLI または marked でHTML出力
- **AIアシスタント** - Ollama接続によるコード説明・補完・リファクタリング
- **ファイル操作** - アップロード・保存・HTMLダウンロード
- **コードブロック解析** - 言語自動正規化 (python/py → python, js/javascript → js)

## セットアップ

```bash
git clone <repository-url>
cd quarto-editor-pe
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

## コード実行

### JavaScript
- ブラウザ上で実際実行
- console.log 出力を取得

### Python
- Pyodide (WebAssembly) で実行
- 初回読み込みに時間かかります

## HTMLエクスポート

### 方法1: Quarto CLI (正確)
```bash
# APIサーバー起動 (別のターミナル)
npm run server

# エディタで「RENDER (DL)」クリック → OK
```

### 方法2: marked (シンプル)
```bash
# エディタで「RENDER (DL)」クリック → キャンセル
```

## AIアシスタントを使う

Ollamaが必要です:

```bash
# macOS
brew install ollama

# モデルをダウンロード
ollama pull llama3.2

# Ollamaを起動
ollama serve
```

## ビルド

```bash
npm run build
```

## ライセンス

MIT License
