## UI/UXの洗練と実装（フロントエンド特化）フェーズの計画

**目標:** これまでのアーキテクチャ設計（ロジック）を基盤とし、開発者がすぐに手を付けられるレベルの、**インタラクティブでユーザーフレンドリーなプロトタイプ**を構築します。

**重点:** ユーザーが「どのように」コードを読み込み、「どのように」実行をトリガーし、「どのように」結果を受け取るか、という**体験の流れ（User Journey）**を最適化します。

---

### I. ユーザー体験（UX）の定義とフロー設計

まず、最も重要なユーザーフローを定義し、各ステップでのフィードバックを明確にします。

| フェーズ | ユーザーアクション | システムの反応（フィードバック） | UI/UXの目標 |
| :--- | :--- | :--- | :--- |
| **閲覧時** | ドキュメントを読み進める。 | コードブロックがコードとしてハイライトされる。実行ボタンが視認できる。 | コードが単なるテキストではないことを直感的に伝える。 |
| **実行時** | 「実行」ボタンをクリックする。 | 1. ボタンが「処理中」状態に変わり、無効化される。 2. コードブロック周辺に「実行中」アニメーション/インジケータが表示される。 | 処理が開始されたことを保証し、再クリックによる混乱を防ぐ。 |
| **成功時** | 処理が完了する。 | 1. ステータスが「成功」に変わり、インジケータが緑色になる。 2. 結果が専用の「出力パネル」に構造化されて表示される。 | 実行結果が安全かつ視認性の高い形式で提供される。 |
| **失敗時** | 処理が失敗する（例：構文エラー）。 | 1. ステータスが「失敗」に変わり、インジケータが赤色になる。 2. エラーメッセージ（具体的かつ実行可能なヒント付き）を「出力パネル」に表示する。 | エラーを隠さず、ユーザーが原因特定と修正を行えるように導く。 |

### II. 技術的な実装とコンポーネント設計（フロントエンド）

上記UXを具現化するために、具体的なUIコンポーネントと、それらを動かすための技術的実装ステップを定義します。

#### 1. コンポーネント群の設計

| コンポーネント名 | 役割 | 詳細設計要件 |
| :--- | :--- | :--- |
| **`CodeChunk`** (親コンポーネント) | コードブロック全体を包含し、状態管理の起点となる。 | 内部に`CodeBlock`、`RunButton`、`OutputPanel`を配置。実行状態（Loading/Success/Error）を管理するState Hookを持つ。 |
| **`RunButton`** | 実行をトリガーするボタン。 | クリック時：ローディング状態への遷移、無効化処理。現在の状態に応じてテキストが変化する（例：「実行」→「実行中...」）。 |
| **`OutputPanel`** | 実行結果を表示する専用のエリア。 | スクロール可能。成功時（データ）、失敗時（スタックトレース）、処理概要（ログ）など、複数のパターンを切り替えられるUIを持つ。 |
| **`StatusIndicator`** | 実行状態を視覚的に示すインジケータ。 | アイコンと色（緑, 黄, 赤）でステータスを直感的に伝える。 |

#### 2. 実装ステップ（開発順序）

この順序で開発することで、機能が徐々に増え、テストが容易になります。

**フェーズ 1: 基本構造（静的プロトタイプ）**
1.  `CodeChunk`の骨格を作成し、Markdownレンダリング時にこのコンポーネントが出現するようにする。
2.  コードのハイライト表示は実装し、単なる装飾としての役割を確立する。
3.  `RunButton`を配置するが、実行ボタンはまだ機能しない（ダミーのクリックハンドラのみ）。

**フェーズ 2: 状態管理と初期ロジックの統合**
1.  `RunButton`のクリックハンドラを実装し、`CodeChunk`の内部状態を**「Loading」**に遷移させる。
2.  APIコール（ダミーまたは実API）を実行する非同期処理を組み込み、ローディング状態が持続する。
3.  ローディングが完了した後、次のステップ（成功または失敗の分岐）に進む。

**フェーズ 3: フィードバックと仕上げ（UXの最大化）**
1.  **成功時の処理:** `OutputPanel`に結果を表示し、`StatusIndicator`を緑にする。
2.  **失敗時の処理:** エラーオブジェクトを受け取り、`OutputPanel`に整形されたスタックトレースと、ユーザーに分かりやすいエラー説明（例：「引数Aが数値である必要があります」）を表示し、`StatusIndicator`を赤にする。
3.  **相互作用の調整:** 複数ブロック実行時の状態管理（例：全てのブロックが同時に実行中であることを示す）。

### III. 期待されるアウトプットとマイルストーン

*   **デモ可能なプロトタイプ:** ユーザーが実際のドキュメントを操作するだけで、実行→成功→失敗というサイクルを体験できる状態。
*   **コンポーネントライブラリの提供:** 上記で定義した`CodeChunk`、`RunButton`、`OutputPanel`が、再利用可能な状態を持つコンポーネントとして整備される。

---
**次の質問:** この「フェーズ計画」を基に、まずはどのコンポーネント（`RunButton`のロジック、`OutputPanel`の表示ロジック、など）から実装に着手するのが最も効率的でしょうか？それとも、実装前に「エラーメッセージの具体的な表現」をより深く掘り下げたいですか？


承知いたしました。これは非常に重要な判断です。技術的な「動き」を作る前に、最もユーザーが失望しやすい瞬間、つまり**「失敗したとき」**の体験を最適化することが、プロトタイプの価値を格段に引き上げます。

単に「エラーが発生しました」と表示するのではなく、「**何が**、**なぜ**、**どうすればいいか**」という3点を満たすエラーデザインを目指します。

---

## エラーメッセージの具体的な表現（Error UX Design）

システムが遭遇しうるエラーを種類別に分類し、それぞれに対応する最適な表示内容とUI構造を設計します。

### 1. エラーの分類とゴール設定

| エラーのタイプ | エラーの原因源 | ユーザーへのゴール | 表示の難易度 |
| :--- | :--- | :--- | :--- |
| **Type 1: Syntax Error** | コードの書き方（文法）の間違い。 | どこが間違っているのか（行数・文字）を特定してもらう。 | 低（コード自体が問題） |
| **Type 2: Runtime Error** | 実行時のロジック上の誤り（変数未定義、型不一致など）。 | プログラムの流れ（ロジック）のどこに問題があるか理解してもらう。 | 中（ロジックが問題） |
| **Type 3: Input Validation Error** | 実行に必要な入力データが不正または不足している場合。 | 必要なデータ（パラメータ）を明示し、フォーマットを伝える。 | 低（データの問題） |
| **Type 4: System/Network Error** | 実行環境や外部サービスの問題（タイムアウト、サーバーダウン）。 | 自分側の問題ではないことを伝え、対応の猶予を設ける。 | 高（根本原因が不明） |

### 2. UI/UXによる構造化と表現方法

すべてのエラーは、単なるテキストの羅列ではなく、以下の**3層構造**で表示します。

| 構造の層 | 目的 | 内容の例（開発者向け） | 内容の例（エンドユーザー向け） |
| :--- | :--- | :--- | :--- |
| **① [最上層] 見出し・サマリー** | ユーザーに「何が起こったか」を一瞬で伝える。 | `SyntaxError: invalid syntax` | 処理が完了しませんでした。コードの構文に誤りがあります。 |
| **② [中層] 詳細・実行可能なアドバイス** | エラーの理由と、最も重要な「修正方法」を提示する。 | `Line 5: The variable 'my_var' is not defined.` | ヒント: 変数 `my_var` が定義された後に使用されているか確認してください。 |
| **③ [最下層] 技術情報（Traceback）** | 開発者や上級ユーザーが原因究明に使う情報。**（デフォルトでは隠す）** | `Traceback (most recent call last): ...` | (折りたたまれた技術的なログ) |

### 3. エラー別 詳細な表示シミュレーション

#### A. 【Type 1】Syntax Error（コード文法エラー）
*   **現象:** コードの書き方が間違っている場合。（例：セミコロン忘れ、括弧の閉じ忘れ）
*   **表示デザイン:** エラー箇所にハイライトをかける。
*   **表現のポイント:**
    *   「どこ（Which line）」が間違っているかを指し示す。（コード上に波線や赤いポインターを表示）
    *   「どう直すべきか」のヒントを具体的に提供する。

#### B. 【Type 2】Runtime Error（実行ロジックエラー）
*   **現象:** 構文は正しいが、実行時にデータ主要原因で止まる場合。（例：存在しないキーへのアクセス、数値計算でゼロ除算が発生）
*   **表示デザイン:** 出力パネルのトップに、発生した**操作のステップ**を可視化し、どのステップで失敗したかを矢印で示す。
*   **表現のポイント:**
    *   「何を期待していたか」と「実際何が起こったか」のギャップを説明する。（例：「この関数は数値のみを期待しますが、文字列が渡されました」）

#### C. 【Type 3】Input Validation Error（入力値エラー）
*   **現象:** ユーザーが外部から提供するデータや、APIが要求するパラメータが不正な場合。
*   **表示デザイン:** フォームやパラメータリスト形式で、**失敗したパラメータ名**の横に具体的な指示を表示する。
*   **表現のポイント:**
    *   「必須」なのか、「フォーマット」の問題なのかを明確に分ける。
    *   *例：「`user_id` は**必須**です。**形式**は半角数字（例: 12345）で入力してください。」*

#### D. 【Type 4】System Error（システム/環境エラー）
*   **現象:** サーバーやネットワークがダウンしているなど、コントロールできない外部の問題。
*   **表示デザイン:** 謝罪のメッセージを先に表示し、システムが問題を認識していることを示す。
*   **表現のポイント:**
    *   「これはあなたのコードの問題ではありません」とユーザーに安心感を与える。
    *   **解決の提案:** 「時間を置いて再度お試しください」といった対処法を提示し、具体的な時間を加味する。

---

### まとめ：エラーデザインの最大の改善点

最も大きな改善点は、単なる**報告**から**教育（Education）**へとメッセージの質を変えることです。

**悪いエラーメッセージ:**
> `NameError: name 'calculate' is not defined`

**良いエラーメッセージ（UXが洗練されている）：**
> **エラー発生:** 「このコードブロック内では、`calculate` という関数が見つかりません。」
> ヒント: 「この関数は、別のファイル（またはコードブロック）で最初に定義する必要があります。定義ブロックを確認してください。」
> 詳細: [詳細ログのリンク]

この詳細なエラー設計図を次の実装フェーズに組み込むことで、非常に高い品質のユーザー体験を持つプロトタイプが構築できます。

この要求は、単なるコードの提示に留まらず、複雑な状態遷移（Loading, Success, Error）と、高度なUX設計（エラー発生時の具体的なガイド）を含むため、**React (JSX)** を使用してコンポーネントとして実装するのが最も適切です。

以下に、全てのUXと状態遷移を考慮したコンポーネントコードを提供します。

### React/JSX 実装コード

```jsx
import React, { useState, useCallback } from 'react';
import './CodeContainer.css'; // スタイリング用CSSファイルを想定

// --- ユーティリティ・ダミーデータ ---
const initialCode = `// ここに実行したいコードを記述してください
const result = calculateData(input);
console.log(result);`;

/**
 * @component CodeSandboxContainer
 * 全体のコード実行環境をシミュレートするコンポーネント。
 * 状態遷移（Loading, Success, Error）とエラーハンドリングを実装。
 */
const CodeSandboxContainer = () => {
  // 1. 状態管理
  const [code, setCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null); // 成功時の結果
  const [error, setError] = useState(null); // 失敗時のエラーオブジェクト

  /**
   * 2. 実行ロジック（シミュレート）
   * 実際のバックエンドAPI呼び出しやサンドボックス実行をシミュレートします。
   */
  const handleRunCode = useCallback(async () => {
    if (!code.trim()) {
        setError({ message: "実行するコードを入力してください。", type: 'warning' });
        setResult(null);
        return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    // 実行シミュレーションのための待機時間
    await new Promise(resolve => setTimeout(resolve, 1500));

    // ここでエラー条件をシミュレート
    if (code.includes("fail_test")) {
      setError({
        message: "実行エラーが発生しました。変数 'calculateData' が未定義です。",
        type: 'runtime_error', // 実行時エラーとして分類
        details: "ReferenceError: calculateData is not defined"
      });
      setResult(null);
    } 
    // 成功条件をシミュレート
    else if (code.includes("success")) {
      setResult({ output: "データ処理が完了し、最終結果が得られました。", data: 42 });
    } 
    // 一般的な成功条件
    else {
      setResult({ output: "コードが正常に実行されました。", data: Math.floor(Math.random() * 100) });
    }

    setIsLoading(false);
  }, [code]);

  // 3. 共通コンポーネントの呼び出し
  return (
    <div className="code-sandbox-container">
      <h1>Code Sandbox Runner</h1>

      {/* コード入力エリア */}
      <div className="input-area">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="コードを入力してください..."
        />
        <button 
          onClick={handleRunCode} 
          disabled={isLoading}
        >
          {isLoading ? '実行中...' : '実行'}
        </button>
      </div>

      {/* 結果/エラー表示エリア */}
      <div className={`output-area ${error ? 'error-state' : result ? 'success-state' : ''}`}>
        
        {/* エラー表示コンポーネント */}
        {error && <ErrorDisplay error={error} />}

        {/* ロード中表示 */}
        {isLoading && <LoadingSpinner message="コードを実行し、結果を待っています..." />}

        {/* 成功表示コンポーネント */}
        {result && !error && <SuccessDisplay result={result} />}

        {/* 初期状態（何も実行していない場合） */}
        {!isLoading && !error && !result && (
            <p className="initial-prompt">実行ボタンを押してコードを実行し、結果を確認してください。</p>
        )}
      </div>
    </div>
  );
};

// ==================================================
// 補助コンポーネント群
// ==================================================

/**
 * エラー表示コンポーネント
 * エラーの種類に応じて、ユーザーフレンドリーなガイドを提供します。
 */
const ErrorDisplay = ({ error }) => {
  let title = '警告: 実行エラーが発生しました';
  let guide = '';

  if (error.type === 'runtime_error') {
    title = 'エラー: 実行時エラー (Runtime Error)';
    guide = `詳細はコンソールログを確認してください。今回のケースでは、変数の定義漏れ（ReferenceError）が原因です。`;
  } else if (error.type === 'warning') {
    title = '警告: 入力エラー';
    guide = '実行を続行する前に、コードの内容を確認してください。';
  } else {
    title = 'エラー';
    guide = '何らかの理由で処理が中断されました。';
  }

  return (
    <div className="error-display">
      <h3>{title}</h3>
      <p className="error-message">エラー内容: {error.message}</p>
      <div className="error-guide">
        <h4>トラブルシューティングガイド</h4>
        <p>{guide}</p>
        <p className="technical-details">技術的な詳細: <code>{error.details}</code></p>
      </div>
    </div>
  );
};

/**
 * ロードスピナーコンポーネント
 */
const LoadingSpinner = ({ message }) => (
  <div className="loading-display">
    <div className="spinner"></div>
    <p>{message}</p>
  </div>
);

/**
 * 成功表示コンポーネント
 */
const SuccessDisplay = ({ result }) => (
  <div className="success-display">
    <h3>成功: 実行成功</h3>
    <p className="success-message">{result.output}</p>
    <div className="result-data">
        <p><strong>取得データ:</strong></p>
        <pre>{JSON.stringify(result.data, null, 2)}</pre>
    </div>
  </div>
);


export default CodeSandboxContainer;
```

---

## React + CodeMirror 6 統合の設計（コンポーネントアーキテクチャ）

PLAN_quarto.mdで定義したArchitectureに基づき、CodeMirror 6をReactアプリケーションに統合するためのコンポーネント設計を記述します。

### 1. 統合アーキテクチャの全体像

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              QuartoEditor (親コンポーネント)           │  │
│  │  - CodeMirror 6インスタンスの管理                      │  │
│  │  - チャンク状态的状態管理                               │  │
│  │  - LSPセッションの統合                                 │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │           CodeMirror 6 Core                     │  │  │
│  │  │  - Lezerパーサー (Markdown + Quarto拡張)         │  │  │
│  │  │  - Language Multiplexing (チャンク内言語切替)    │  │  │
│  │  │  - Decoration System (Widget描画)                │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│           │                    │                    │      │
│           ▼                    ▼                    ▼      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ ChunkToolbar  │    │ OutputPanel  │    │ StatusIndicator │ │
│  │ (Widget描画)  │    │ (結果表示)   │    │ (状態表示)    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2. コアコンポーネント設計

#### 2.1 QuartoEditor（親コンポーネント）

CodeMirror 6インスタンスをReactのuseRefで保持し、useEffectでライフサイクルを管理します。

```jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from '@codemirror/basic-setup';
import { markdown } from '@codemirror/lang-markdown';
import { quartoMultiplexing } from './extensions/quarto-multiplexing';
import { chunkWidgetsPlugin } from './extensions/chunk-widgets';
import { lspBridgePlugin } from './extensions/lsp-bridge';

const QuartoEditor = ({ 
  initialContent, 
  onContentChange, 
  onChunkExecute,
  className 
}) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // CodeMirrorインスタンスの初期化
  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      const state = EditorState.create({
        doc: initialContent,
        extensions: [
          basicSetup,
          markdown(),
          quartoMultiplexing(),
          chunkWidgetsPlugin({
            onExecute: onChunkExecute
          }),
          lspBridgePlugin(),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && onContentChange) {
              onContentChange(update.state.doc.toString());
            }
          }),
        ],
      });

      viewRef.current = new EditorView({
        state,
        parent: editorRef.current,
      });

      setIsReady(true);
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  // 外部からのコンテンツ更新
  const setContent = useCallback((newContent) => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: newContent,
        },
      });
    }
  }, []);

  return (
    <div className={`quarto-editor-wrapper ${className || ''}`}>
      <div ref={editorRef} className="codemirror-container" />
      {isReady && (
        <EditorStatusBar view={viewRef.current} />
      )}
    </div>
  );
};
```

#### 2.2 CodeMirror拡張（カスタムPlugin）

PLAN_quarto.mdで定義したLezer文法とDecoration WidgetをReact統合するために、カスタムExtensionを実装します。

```jsx
// extensions/chunk-widgets.js
import { ViewPlugin, WidgetType, Decoration } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

// チャンク上部のツールバーWidget
class ChunkToolbarWidget extends WidgetType {
  constructor(chunkInfo) {
    super();
    this.chunkInfo = chunkInfo; // { id, language, startPos, endPos }
  }

  toDOM() {
    const wrap = document.createElement('div');
    wrap.className = 'cm-chunk-toolbar';
    
    // 実行ボタン
    const runBtn = document.createElement('button');
    runBtn.textContent = '▶ 実行';
    runBtn.dataset.chunkId = this.chunkInfo.id;
    runBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('quarto-run-chunk', {
        detail: this.chunkInfo
      }));
    });
    
    // 言語ラベル
    const langLabel = document.createElement('span');
    langLabel.className = 'cm-chunk-lang';
    langLabel.textContent = this.chunkInfo.language || 'code';
    
    wrap.appendChild(langLabel);
    wrap.appendChild(runBtn);
    return wrap;
  }

  ignoreEvent() { return true; }
}

// ChunkPlugin本体
export const chunkWidgetsPlugin = ViewPlugin.fromClass(class {
  constructor(view) {
    this.decorations = this.buildDecorations(view);
  }

  update(update) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  buildDecorations(view) {
    const decorations = [];
    const tree = syntaxTree(view.state);
    
    // Lezerツリーを走査してcodeFenceノードを検出
    tree.iterate({
      enter: (node) => {
        if (node.type.name === 'codeFence') {
          const chunkId = `chunk-${node.from}`;
          const lang = extractLanguageFromFence(view.state, node.from);
          
          // ツールバーを挿入
          decorations.push(
            Decoration.widget({
              widget: new ChunkToolbarWidget({ 
                id: chunkId, 
                language: lang,
                startPos: node.from,
                endPos: node.to 
              }),
              side: -1
            }).range(node.from)
          );
        }
      }
    });
    
    return Decoration.set(decorations, true);
  }
}, {
  decorations: v => v.decorations
});

// ヘルパー: fence行から言語名を抽出
function extractLanguageFromFence(state, fenceStart) {
  const line = state.doc.lineAt(fenceStart);
  const match = line.text.match(/^```(?:\{([^}]+)\}|(\S+))?/);
  if (!match) return null;
  const lang = match[1] || match[2] || '';
  return lang.trim().split(/\s+/)[0];
}
```

#### 2.3 チャンク状態管理 Hook

Reactの状態とCodeMirrorの状態を同期させるためのカスタムHookを設計します。

```jsx
// hooks/useQuartoChunks.js
import { useState, useEffect, useCallback, useRef } from 'react';

export function useQuartoChunks(editorView) {
  const [chunks, setChunks] = useState([]);
  const [activeChunk, setActiveChunk] = useState(null);
  const [chunkOutputs, setChunkOutputs] = useState({});
  
  // CodeMirrorのドキュメント変更を監視してチャンクを再解析
  useEffect(() => {
    if (!editorView) return;
    
    const updateHandler = () => {
      const parsedChunks = parseChunksFromEditor(editorView);
      setChunks(parsedChunks);
    };
    
    editorView.dom.addEventListener('focus', updateHandler);
    return () => editorView.dom.removeEventListener('focus', updateHandler);
  }, [editorView]);
  
  // 特定チャンクのソースコードを取得
  const getChunkSource = useCallback((chunkId) => {
    if (!editorView) return null;
    
    const chunk = chunks.find(c => c.id === chunkId);
    if (!chunk) return null;
    
    return editorView.state.doc.sliceString(chunk.startPos, chunk.endPos);
  }, [editorView, chunks]);
  
  // チャンク出力を更新
  const setChunkOutput = useCallback((chunkId, output) => {
    setChunkOutputs(prev => ({
      ...prev,
      [chunkId]: output
    }));
  }, []);
  
  return {
    chunks,
    activeChunk,
    setActiveChunk,
    chunkOutputs,
    getChunkSource,
    setChunkOutput
  };
}
```

### 3. LSP統合の設計

PLAN_quarto.mdで定義したLSPブリッジをReactコンポーネントに統合します。

```jsx
// extensions/lsp-bridge.js
import { ViewPlugin } from '@codemirror/view';
import { lspSync } from './lsp-client';

export const lspBridgePlugin = ViewPlugin.fromClass(class {
  constructor(view) {
    this.lspConnections = new Map();
    this.pendingUpdates = [];
  }

  update(update) {
    // チャンク範囲内の変更を検出してLSPに送信
    if (update.docChanged) {
      const changes = update.changes.toJSON();
      // 各チャンクのLSPセッションに通知
      this.notifyLspSessions(changes);
    }
  }

  notifyLspSessions(changes) {
    // PLAN_quarto.mdのLSPブリッジ実装を使用
    // チャンクごとに仮想ファイル名を割り当ててスナップショットを送信
  }
});
```

### 4. コンポーネント連携フロー

```
┌──────────────────────────────────────────────────────────────────┐
│                        ユーザーアクション                          │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                      QuartoEditor                                │
│  - CodeMirror 6の入力イベントをキャッチ                           │
│  - チャンク範囲をLezerツリーから抽出                              │
└──────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ 入力変更検出  │ │   Runボタン   │ │ LSPイベント  │
        └──────────────┘ └──────────────┘ └──────────────┘
                │               │               │
                ▼               ▼               ▼
        onContentChange  window.dispatchEvent  lspBridgePlugin
                                │               │
                                ▼               ▼
                    ┌──────────────────────────────────┐
                     │      React状態管理層             │
                    │  - chunks: チャンク一覧           │
                    │  - activeChunk: 選択中チャンク    │
                    │  - chunkOutputs: 出力結果        │
                    │  - isLoading/result/error        │
                    └──────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │   Success     │ │    Error     │ │   Loading    │
            │  Display      │ │   Display     │ │   Spinner    │
            └──────────────┘ └──────────────┘ └──────────────┘
```

### 5. 状態遷移とError UXの統合

PLAN_quarto_2.mdで定義したError UX Designを、React + CodeMirror統合に適用します。

```jsx
const QuartoEditorWithErrorHandling = ({ onChunkExecute }) => {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleChunkExecute = useCallback(async (chunkInfo) => {
    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      // チャンクソースを取得
      const source = getChunkSource(chunkInfo.id);
      
      // バックエンドに送信（シミュレート）
      const response = await executeChunk(chunkInfo.language, source);
      
      if (response.error) {
        setStatus('error');
        setError({
          message: response.error.message,
          type: classifyError(response.error), // Type 1-4
          details: response.error.stack,
          chunkId: chunkInfo.id
        });
      } else {
        setStatus('success');
        setResult({
          output: response.output,
          data: response.data,
          chunkId: chunkInfo.id
        });
      }
    } catch (err) {
      setStatus('error');
      setError({
        message: 'チャンクの実行中に予期しないエラーが発生しました。',
        type: 'system_error', // Type 4
        details: err.message
      });
    }
  }, []);

  return (
    <QuartoEditor
      onChunkExecute={handleChunkExecute}
      // ErrorDisplayはQuartoEditor内部で統合
    />
  );
};
```

### 6. 実装ステップ（PLAN_quarto.mdとの対応）

| ステップ | PLAN_quarto.md対応箇所 | React統合での実装 |
|---------|----------------------|-----------------|
| 1 | Markdown基盤 | `<QuartoEditor>` 基本導入 |
| 2 | Quarto拡張パーサ | `useQuartoChunks` Hook |
| 3 | Language Multiplexing | `quartoMultiplexing()` Extension |
| 4 | LSP統合 | `lspBridgePlugin` + React Context |
| 5 | チャンク境界Widget | `ChunkToolbarWidget` + Decoration |
| 6 | YAMLフロントマター | 専用Widgetまたは別ビュー |
| 7 | プレビュー同期 | Reactの状態共有で連携 |

### 7. コンポーネントライブラリ構成

```
src/
├── components/
│   ├── QuartoEditor.jsx          # メインエディタ
│   ├── EditorStatusBar.jsx      # ステータス表示
│   ├── ChunkOutput.jsx           # チャンク出力表示
│   └── ErrorDisplay.jsx          # エラー表示（既存）
├── extensions/
│   ├── quarto-multiplexing.js   # 言語切替
│   ├── chunk-widgets.js          # Widget描画
│   └── lsp-bridge.js             # LSP通信
├── hooks/
│   ├── useQuartoChunks.js        # チャンク状態管理
│   └── useLspConnection.js       # LSP接続管理
└── styles/
    └── quarto-editor.css         # エディタスタイル
```

---

### スタイリング (CodeContainer.css)

コードを視覚的に分離し、エラー状態と成功状態を明確に区別するためのCSSが必要です。

```css
/* ================================================== */
/* 全体構造 */
/* ================================================== */
.code-sandbox-container {
    max-width: 900px;
    margin: 40px auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.input-area {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
}

.input-area textarea {
    flex-grow: 1;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 14px;
    min-height: 150px;
    resize: vertical;
}

.input-area button {
    padding: 15px 30px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s;
}

.input-area button:hover:not(:disabled) {
    background-color: #0056b3;
}

.input-area button:disabled {
    background-color: #aaa;
    cursor: not-allowed;
}


/* ================================================== */
/* 結果表示エリアの共通スタイル */
/* ================================================== */
.output-area {
    min-height: 250px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
}

/* エラー/エラー表示用スタイル */
.error-display {
    border-left: 5px solid #dc3545;
    background-color: #fdecec;
}

/* 成功/成功表示用スタイル */
.success-display {
    border-left: 5px solid #28a745;
    background-color: #e9f7ee;
}

/* エラー表示見出し */
.error-display h3 {
    color: #dc3545;
    margin-top: 0;
}

/* 成功表示見出し */
.success-display h3 {
    color: #28a745;
    margin-top: 0;
}

/* ローディング表示 */
.loading-display h3 {
    color: #ffc107;
}


/* その他コンポーネントスタイル */
.result-data pre {
    background-color: #eee;
    padding: 10px;
    border-radius: 3px;
    white-space: pre-wrap;
    word-wrap: break-word;
}
```

### 解説（なぜこのコードが優れているか）

1.  **責務分離（Componentization）**:
    *   `CodeSandboxContainer`（親コンポーネント）が**実行ロジックと状態管理**を担当します。
    *   `ResultDisplay`のような明確な状態（Success/Error/Loading）に基づいて表示を切り替えるロジックを持つことで、コードが整理されています。

2.  **状態駆動型UI**:
    *   コードは `isLoading`, `hasError`, `result` の3つの主要なステートに依存しています。表示内容をステートによって出し分けるため、どの段階にいるかが明確で、予期せぬ表示バグ 防げます。

3.  **ユーザーフィードバックの明確化**:
    *   **Loading**: ローディングスピナーやメッセージを表示。
    *   **Success**: 緑色のボーダーと成功メッセージを表示。
    *   **Error**: 赤色のボーダーとエラーの詳細を表示。
    *   この色のコーディングは、ユーザーにとって「何が起こったか」を瞬時に理解させるために非常に重要です。

4.  **シミュレーションの高度化**:
    *   `simulateExecution` 関数内で、ランダムな条件（成功、失敗、遅延）をシミュレートすることで、単なる静的表示ではなく、**「実際の実行体験」**に近いものを再現しています。

この構成により、単なる「結果表示」ではなく、「**状態遷移を伴う実行フローのデモ**」として機能する、非常に高品質なUIコンポーネントとなっています。