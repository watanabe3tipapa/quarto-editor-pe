# Quarto Editor PE - 開発メモ

インタラクティブなQuartoドキュメントエディタ + AIアシスタント

## 前提条件

- **Node.js** 18.x 以上
- **npm** 9.x 以上
- （AI機能使用時）**Ollama** インストール済み

### Ollamaインストール

```bash
# macOS
brew install ollama

# モデルダウンロード
ollama pull llama3.2

# Ollama起動
ollama serve
```

---

## セットアップ

```bash
git clone <repository-url>
cd quarto-editor-pe
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

---

## ビルド

```bash
npm run build
```

`dist/` ディレクトリに出力されます。

### 確認

```bash
npm run preview
```

`http://localhost:4173` で確認できます。

---

## アーキテクチャ

### コンポーネント階層

```
App.jsx
├── QuartoEditor.jsx          # CodeMirror 6 エディタ
│   ├── CodeChunk.jsx         # コードブロックUI
│   │   ├── RunButton.jsx    # 実行ボタン
│   │   ├── StatusIndicator  # ステータス表示
│   │   ├── OutputPanel.jsx  # 出力パネル
│   │   └── LintPanel.jsx    # リントパネル
│   └── SampleDocument.jsx   # プレビュー
├── FloatingButtons.jsx       # フローティングボタン
└── AIAssistant.jsx          # AIアシスタント
```

### サービス

```
services/
├── OllamaService.js         # Ollama APIクライアント
└── LinterService.js         # コードリント
```

---

## 状態管理

### App.jsx

```jsx
const [content, setContent] = useState(DEFAULT_CONTENT)      // ドキュメント内容
const [editingMode, setEditingMode] = useState(true)         // Edit/Preview
const [showAI, setShowAI] = useState(false)                  // AIAssist表示
const [selectedCode, setSelectedCode] = useState('')          // 選択コード
const [selectedLang, setSelectedLang] = useState('python')    // 選択言語
```

### QuartoEditor.jsx

```jsx
const [chunks, setChunks] = useState([])                    // 解析済みチャンク
const [chunkOutputs, setChunkOutputs] = useState({})         // 出力結果
const [chunkStatuses, setChunkStatuses] = useState({})       // 実行状態
const [selectedChunkId, setSelectedChunkId] = useState(null) // 選択チャンク
```

---

## CodeMirror 6 設定

### Extension構成

```javascript
EditorState.create({
  doc: initialContent,
  extensions: [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([...]),
    markdown(),
    updateListener,
  ]
})
```

### チャンク解析

```javascript
const chunkRegex = /```\{(\w+)\}([\s\S]*?)```/g;
// 例: ```{python}
//       code
//       ```
```

### 言語正規化

```javascript
const normalizeLang = (lang) => {
  const map = { python: 'python', py: 'python', javascript: 'js', js: 'js' };
  return map[lang.toLowerCase()] || lang.toLowerCase();
};
```

---

## Ollama API

### エンドポイント

| エンドポイント | メソッド | 用途 |
|---------------|---------|------|
| `/api/tags` | GET | 利用可能モデル一覧 |
| `/api/generate` | POST | テキスト生成 |
| `/api/chat` | POST | チャット会話 |

### デフォルト設定

- モデル: `llama3.2`
- URL: `http://localhost:11434`

---

## コード実行

### JavaScript

```javascript
const logs = [];
const originalLog = console.log;
console.log = (...args) => {
  logs.push(args.map(String).join(' '));
  originalLog.apply(console, args);
};
try {
  new Function(source)();
} finally {
  console.log = originalLog;
}
```

### Python

現在シミュレートのみ。実際の実行にはPyodideなどが必要。

---

## トラブルシューティング

### エディタが表示されない

- ブラウザコンソール（F12）でエラー確認
- ポート5173にアクセスしているか確認

### Ollamaに接続できない

```bash
curl http://localhost:11434/api/tags
ollama serve
```

---

## ライセンス

MIT License
