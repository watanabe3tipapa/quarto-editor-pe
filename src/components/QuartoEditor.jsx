import React, { useRef, useEffect, useState, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, foldKeymap } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { markdown } from '@codemirror/lang-markdown';
import PyodideService from '../services/PyodideService';
import './QuartoEditor.css';

const LANGUAGE_COLORS = {
  python: '#3776ab',
  javascript: '#f7df1e',
  js: '#f7df1e',
  typescript: '#3178c6',
  ts: '#3178c6',
  r: '#276dc3',
  ruby: '#cc342d',
  go: '#00add8',
  rust: '#dea584',
  java: '#ed8b00',
  css: '#264de4',
  html: '#e34c26',
  shell: '#89e051',
  bash: '#89e051',
  sql: '#e38c00',
};

const QuartoEditor = ({ initialContent = '', onChange, onCodeSelect }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const [chunks, setChunks] = useState([]);
  const [chunkOutputs, setChunkOutputs] = useState({});
  const [chunkStatuses, setChunkStatuses] = useState({});
  const [selectedChunkId, setSelectedChunkId] = useState(null);
  const [hoveredChunkId, setHoveredChunkId] = useState(null);
  const [showChunkPanel, setShowChunkPanel] = useState(false);

  const parseChunks = useCallback((doc) => {
    const chunkRegex = /```\{(\w+)\}([\s\S]*?)```/g;
    const parsedChunks = [];
    let match;

    const normalizeLang = (lang) => {
      const map = { python: 'python', py: 'python', javascript: 'js', js: 'js', typescript: 'ts', ts: 'ts' };
      return map[lang.toLowerCase()] || lang.toLowerCase();
    };

    while ((match = chunkRegex.exec(doc)) !== null) {
      const language = normalizeLang(match[1]);
      const code = match[2].trim();
      const startPos = match.index;

      parsedChunks.push({
        id: `chunk-${startPos}`,
        language,
        code,
        startPos,
      });
    }

    setChunks(parsedChunks);
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    if (viewRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const doc = update.state.doc.toString();
        if (onChange) onChange(doc);
        parseChunks(doc);
      }
    });

    const state = EditorState.create({
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
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
        ]),
        markdown(),
        updateListener,
        EditorView.theme({
          '&': { height: '100%', fontSize: '14px' },
          '.cm-scroller': {
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            overflow: 'auto',
          },
          '.cm-content': { padding: '20px' },
          '.cm-line': { padding: '0 4px' },
        }),
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });

    parseChunks(initialContent);

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [initialContent, onChange, parseChunks]);

  useEffect(() => {
    if (editorRef.current && viewRef.current) {
      const handleClick = () => {
        const selection = viewRef.current?.state.selection.main;
        if (selection && !selection.empty) {
          const selectedText = viewRef.current.state.sliceDoc(selection.from, selection.to);
          const chunk = chunks.find(c => c.code.includes(selectedText));
          if (chunk) {
            setSelectedChunkId(chunk.id);
            if (onCodeSelect) onCodeSelect(chunk.code, chunk.language);
          }
        }
      };
      editorRef.current.addEventListener('click', handleClick);
      return () => editorRef.current?.removeEventListener('click', handleClick);
    }
  }, [chunks, onCodeSelect]);

  const handleChunkExecute = useCallback(async (chunkId, language, source) => {
    setChunkStatuses(prev => ({ ...prev, [chunkId]: 'loading' }));
    setChunkOutputs(prev => ({ ...prev, [chunkId]: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (language === 'javascript') {
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
          originalLog.apply(console, args);
        };
        try {
          new Function(source)();
        } finally {
          console.log = originalLog;
        }
        setChunkOutputs(prev => ({ ...prev, [chunkId]: { type: 'success', output: logs.join('\n') || '実行完了' } }));
      } else if (language === 'python') {
        try {
          const result = await PyodideService.runPython(source);
          if (result.hasError) {
            setChunkOutputs(prev => ({ ...prev, [chunkId]: { type: 'error', error: result.output } }));
            setChunkStatuses(prev => ({ ...prev, [chunkId]: 'error' }));
          } else {
            setChunkOutputs(prev => ({ ...prev, [chunkId]: { type: 'success', output: result.output || '実行完了' } }));
            setChunkStatuses(prev => ({ ...prev, [chunkId]: 'success' }));
          }
        } catch (error) {
          setChunkOutputs(prev => ({ ...prev, [chunkId]: { type: 'error', error: error.message } }));
          setChunkStatuses(prev => ({ ...prev, [chunkId]: 'error' }));
        }
      } else {
        setChunkOutputs(prev => ({ ...prev, [chunkId]: { type: 'success', output: `${language} コードが実行されました（シミュレート）` } }));
        setChunkStatuses(prev => ({ ...prev, [chunkId]: 'success' }));
      }
    } catch (error) {
      setChunkOutputs(prev => ({ ...prev, [chunkId]: { type: 'error', error: error.message, stack: error.stack } }));
      setChunkStatuses(prev => ({ ...prev, [chunkId]: 'error' }));
    }
  }, []);

  const handleChunkReset = useCallback((chunkId) => {
    setChunkOutputs(prev => {
      const newOutputs = { ...prev };
      delete newOutputs[chunkId];
      return newOutputs;
    });
    setChunkStatuses(prev => {
      const newStatuses = { ...prev };
      delete newStatuses[chunkId];
      return newStatuses;
    });
  }, []);

  const getLanguageColor = (lang) => LANGUAGE_COLORS[lang] || '#6c757d';

  const insertText = useCallback((before, after = '') => {
    if (!viewRef.current) return;
    const selection = viewRef.current.state.selection.main;
    const selectedText = viewRef.current.state.sliceDoc(selection.from, selection.to);
    
    viewRef.current.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: before + selectedText + after
      },
      selection: { anchor: selection.from + before.length }
    });
    viewRef.current.focus();
  }, []);

  const insertAtLineStart = useCallback((prefix) => {
    if (!viewRef.current) return;
    const cursor = viewRef.current.state.selection.main.head;
    const line = viewRef.current.state.doc.lineAt(cursor);
    
    viewRef.current.dispatch({
      changes: { from: line.from, insert: prefix }
    });
    viewRef.current.focus();
  }, []);

  const selectedLang = 'python';

  const selectedChunk = chunks.find(c => c.id === selectedChunkId);
  const selectedChunkOutput = selectedChunkId ? chunkOutputs[selectedChunkId] : null;
  const selectedChunkStatus = selectedChunkId ? chunkStatuses[selectedChunkId] : 'idle';

  return (
    <div className={`quarto-editor ${selectedChunkId ? 'with-chunk-panel' : ''}`}>
      <div className="editor-toolbar">
        <button onClick={() => insertAtLineStart('# ')} title="見出し1">H1</button>
        <button onClick={() => insertAtLineStart('## ')} title="見出し2">H2</button>
        <button onClick={() => insertAtLineStart('### ')} title="見出し3">H3</button>
        <span className="toolbar-divider"></span>
        <button onClick={() => insertText('**', '**')} title="太字"><strong>B</strong></button>
        <button onClick={() => insertText('*', '*')} title="斜体"><em>I</em></button>
        <button onClick={() => insertText('`', '`')} title="インラインコード">``</button>
        <span className="toolbar-divider"></span>
        <button onClick={() => insertAtLineStart('- ')} title="リスト">•</button>
        <button onClick={() => insertAtLineStart('1. ')} title="番号付きリスト">1.</button>
        <button onClick={() => insertAtLineStart('> ')} title="引用">"</button>
        <span className="toolbar-divider"></span>
        <button onClick={() => insertText('\n```' + selectedLang + '\n', '\n```\n')} title="コードブロック">```</button>
        <button onClick={() => insertText('[]()', '')} title="リンク">🔗</button>
        <button onClick={() => insertText('![alt]()', '')} title="画像">🖼️</button>
        <span className="toolbar-spacer"></span>
        {selectedChunkId && (
          <button 
            onClick={() => {
              setSelectedChunkId(null);
              if (onCodeSelect) onCodeSelect('', '');
            }} 
            title="選択を解除"
            className="toolbar-close-btn"
          >
            ✕ 閉じる
          </button>
        )}
      </div>
      <div className="editor-wrapper">
        <div className="editor-container" ref={editorRef} />

        <div className="minimap">
          {chunks.map((chunk, index) => (
            <div
              key={chunk.id}
              className={`minimap-item ${chunkStatuses[chunk.id] ? `minimap-item--${chunkStatuses[chunk.id]}` : ''} ${selectedChunkId === chunk.id ? 'minimap-item--selected' : ''}`}
              style={{
                backgroundColor: getLanguageColor(chunk.language),
                top: `${(index / Math.max(chunks.length, 1)) * 100}%`
              }}
              onClick={() => {
                setSelectedChunkId(chunk.id);
                if (onCodeSelect) onCodeSelect(chunk.code, chunk.language);
              }}
              title={`${chunk.language} - ${chunkStatuses[chunk.id] || '待機中'}`}
            />
          ))}
        </div>

        {selectedChunkId && (
          <div className="chunk-panel">
            <div className="chunk-panel__header">
              <span className="chunk-panel__lang" style={{ backgroundColor: getLanguageColor(selectedChunk?.language) }}>
                {selectedChunk?.language}
              </span>
              <span className={`chunk-panel__status chunk-panel__status--${selectedChunkStatus}`}>
                {selectedChunkStatus === 'loading' ? '● 実行中' :
                  selectedChunkStatus === 'success' ? '✓ 成功' :
                    selectedChunkStatus === 'error' ? '✗ エラー' : '○ 待機中'}
              </span>
            </div>
            <div className="chunk-panel__actions">
              <button 
                className="chunk-panel__run-btn"
                onClick={() => handleChunkExecute(selectedChunkId, selectedChunk?.language, selectedChunk?.code)}
                disabled={selectedChunkStatus === 'loading'}
              >
                ▶ 実行
              </button>
              {selectedChunkStatus !== 'idle' && (
                <button 
                  className="chunk-panel__reset-btn"
                  onClick={() => handleChunkReset(selectedChunkId)}
                >
                  × リセット
                </button>
              )}
            </div>
            {selectedChunkOutput && (
              <div className={`chunk-panel__output chunk-panel__output--${selectedChunkOutput.type}`}>
                {selectedChunkOutput.type === 'error' ? (
                  <div className="output-error">
                    <strong>エラー:</strong> {selectedChunkOutput.error}
                  </div>
                ) : (
                  <div className="output-success">
                    <strong>結果:</strong>
                    <pre>{selectedChunkOutput.output}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <button
        className="toggle-panel-btn"
        onClick={() => setShowChunkPanel(!showChunkPanel)}
        title={showChunkPanel ? 'パネルを隠す' : 'パネルを表示'}
      >
        {showChunkPanel ? '◀' : '▶'}
      </button>
    </div>
  );
};

export default QuartoEditor;
