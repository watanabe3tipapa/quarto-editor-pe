# Quarto Editor PE

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

インタラクティブなQuartoドキュメントエディタ + AIアシスタント（Ollama対応）

## 技術スタック

### フロントエンド

| カテゴリ | 技術 | バージョン |
|----------|------|------------|
| **フレームワーク** | React | 18.x |
| **ビルドツール** | Vite | 5.x |
| **エディタ** | CodeMirror 6 | 6.x |
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
| `@codemirror/lint` | リント |
| `@codemirror/lang-markdown` | Markdownモード |

### 開発・運用

| カテゴリ | 技術 |
|----------|------|
| **デプロイ** | Vercel / Netlify / 静的配信 |
| **スタイリング** | CSS Modules |
| **ロギング** | console.log (browser) |

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                         App.jsx                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ QuartoEditor │  │FloatingBtns  │  │   AIAssistant    │  │
│  │              │  │              │  │                  │  │
│  │ CodeMirror 6 │  │  🤖 AI Btn   │  │ • Chat           │  │
│  │              │  │              │  │ • Explain        │  │
│  │ ┌──────────┐ │  └──────────────┘  │ • Complete       │  │
│  │ │CodeChunk │ │                      │ • Refactor       │  │
│  │ │          │ │                      └──────────────────┘  │
│  │ │┌────────┐│ │                                           │
│  │ ││RunBtn  ││ │                                           │
│  │ │├────────┤│ │                                           │
│  │ ││Output  ││ │                                           │
│  │ ││Panel   ││ │                                           │
│  │ │└────────┘│ │                                           │
│  │ └──────────┘ │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      OllamaService                           │
│                    (http://localhost:11434)                  │
└─────────────────────────────────────────────────────────────┘
```

### コンポーネント構造

```
src/
├── App.jsx                      # アプリケーションルート
├── main.jsx                     # エントリーポイント
├── components/
│   ├── QuartoEditor.jsx         # CodeMirror統合エディタ
│   │   ├── CodeChunk.jsx        # コードブロックUIラッパー
│   │   │   ├── RunButton.jsx    # 実行ボタン
│   │   │   ├── StatusIndicator  # ○●✓✗ ステータス
│   │   │   └── OutputPanel.jsx  # 結果表示
│   │   │
│   │   └── SampleDocument.jsx   # プレビューモード
│   │
│   ├── FloatingButtons.jsx      # フローティングAIボタン
│   └── AIAssistant.jsx          # Ollama AIチャット
│       └── (Chat / History)
│
├── services/
│   └── OllamaService.js         # Ollama APIクライアント
│       ├── checkConnection()
│       ├── getModels()
│       ├── chat()
│       ├── explainCode()
│       ├── completeCode()
│       └── refactorCode()
│
└── styles/                      # CSSモジュール
```

## 状態管理

React Hooks によるローカル状態管理:

```jsx
// App.jsx
const [content, setContent] = useState(DEFAULT_CONTENT)      // ドキュメント内容
const [editingMode, setEditingMode] = useState(true)         // Edit/Preview
const [showAI, setShowAI] = useState(false)                  // AIAssist表示
const [selectedCode, setSelectedCode] = useState('')          // 選択コード
const [selectedLang, setSelectedLang] = useState('python')    // 選択言語

// QuartoEditor.jsx
const [chunks, setChunks] = useState([])                    // 解析済みチャンク
const [chunkOutputs, setChunkOutputs] = useState({})         // 出力結果
const [chunkStatuses, setChunkStatuses] = useState({})       // 実行状態
const [selectedChunkId, setSelectedChunkId] = useState(null) // 選択チャンク
```

## CodeMirror 6 統合

### Extension構成

```javascript
EditorState.create({
  extensions: [
    // 表示系
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    highlightActiveLine(),
    
    // 編集系
    history(),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    drawSelection(),
    dropCursor(),
    
    // 機能系
    autocompletion(),
    highlightSelectionMatches(),
    foldGutter(),
    
    // キーバインド
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      ...lintKeymap,
    ]),
    
    // 言語
    markdown(),
    
    // リスナー
    updateListener,
  ]
})
```

### チャンク解析

正規表現でMarkdownからコードブロックを抽出:

```javascript
const chunkRegex = /```\{(\w+)\}([\s\S]*?)```/g
// 例: ```{python}
//       code
//       ```
```

## Ollama API

### エンドポイント

| エンドポイント | メソッド | 用途 |
|---------------|---------|------|
| `/api/tags` | GET | 利用可能モデル一覧 |
| `/api/generate` | POST | テキスト生成 |
| `/api/chat` | POST | チャット会話 |

### リクエスト例

```javascript
// チャット
POST http://localhost:11434/api/chat
{
  "model": "llama3.2",
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "stream": false
}
```

## コードブロック実行

### JavaScript

```javascript
const logs = []
const originalLog = console.log
console.log = (...args) => {
  logs.push(args.map(String).join(' '))
  originalLog.apply(console, args)
}
try {
  new Function(source)()
} finally {
  console.log = originalLog
}
```

### Python（シミュレート）

現在Pythonコードは実行せず、シミュレート結果を返します。
実際のPython実行には以下が必要:
- Pyodide (WebAssembly Python)
- サーバーサイド実行
- サンドボックス環境

## 貢献

### 開発環境セットアップ

```bash
git clone https://github.com/your-repo/quarto-editor-pe.git
cd quarto-editor-pe
npm install
npm run dev
```

### コーディング規約

- React 関数コンポーネント + Hooks
- CSS Modules または 標準CSS
- コンポーネントは1ファイル1エクスポート

### テスト

```bash
# ビルドテスト
npm run build

# プレビュー
npm run preview
```

## ロードマップ

- [ ] Python実行（Pyodide統合）
- [ ] 複数ファイル対応
- [ ] テーマ切り替え
- [ ] キーボードショートカット追加
- [ ] エディタ分割表示
- [ ] リアルタイム共同編集
- [ ] OpenAI/Anthropic API対応

## ライセンス

MIT License - see [LICENSE](LICENSE) for details.

## 作者

Quarto Editor PE Team
