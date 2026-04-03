import React, { useState, useCallback, useRef } from 'react';
import QuartoEditor from './components/QuartoEditor';
import SampleDocument from './components/SampleDocument';
import FloatingButtons from './components/FloatingButtons';
import AIAssistant from './components/AIAssistant';
import './styles/App.css';

const DEFAULT_CONTENT = `# Quarto Editor Prototype

これはインタラクティブなQuartoエディタのデモです。

## Python コードの例

\`\`\`{python}
# 基本的な計算
result = 42 * 2
print(f"結果: {result}")
\`\`\`

## データ分析の例

\`\`\`{python}
import numpy as np
data = np.array([1, 2, 3, 4, 5])
mean = np.mean(data)
print(f"平均値: {mean}")
\`\`\`

## JavaScript の例

\`\`\`{javascript}
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("World"));
\`\`\`

## エラー案例

\`\`\`{python}
undefined_variable * 10
\`\`\`
`;

function App() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [editingMode, setEditingMode] = useState(true);
  const [showAI, setShowAI] = useState(false);
  const [selectedCode, setSelectedCode] = useState('');
  const [selectedLang, setSelectedLang] = useState('python');
  const fileInputRef = useRef(null);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setContent(text);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, []);

  const handleSave = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quarto-document.qmd';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content]);

  const handleClear = useCallback(() => {
    if (window.confirm('ドキュメントをクリアしますか？')) {
      setContent('');
    }
  }, []);

  const handleInsertCode = useCallback((code) => {
    setContent(prev => prev + '\n\n```' + selectedLang + '\n' + code + '\n```');
    setShowAI(false);
  }, [selectedLang]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Quarto Editor PE</h1>
        <div className="header-actions">
          <div className="file-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept=".qmd,.md,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button onClick={() => fileInputRef.current?.click()}>
              📂 UPLOAD
            </button>
            <button onClick={handleSave}>
              💾 SAVE
            </button>
            <button onClick={handleClear}>
              🗑️ CLEAR
            </button>
          </div>
          <div className="header-controls">
            <button
              className={editingMode ? 'active' : ''}
              onClick={() => setEditingMode(true)}
            >
              Edit
            </button>
            <button
              className={!editingMode ? 'active' : ''}
              onClick={() => setEditingMode(false)}
            >
              Preview
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {editingMode ? (
          <QuartoEditor
            initialContent={content}
            onChange={setContent}
            onCodeSelect={(code, lang) => {
              setSelectedCode(code);
              setSelectedLang(lang);
            }}
          />
        ) : (
          <div className="preview-mode">
            <SampleDocument content={content} />
          </div>
        )}
      </main>

      <FloatingButtons onClick={() => setShowAI(true)} />

      {showAI && (
        <AIAssistant
          selectedCode={selectedCode}
          language={selectedLang}
          onInsertCode={handleInsertCode}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  );
}

export default App;
