import React, { useState } from 'react';
import './OutputPanel.css';

const OutputPanel = ({ type, content }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (type === 'error') {
    const getErrorHint = () => {
      const errorMsg = content.error || '';
      if (errorMsg.includes('not defined') || errorMsg.includes('undefined')) {
        return '変数が定義されていないか、綴りが間違っている可能性があります。';
      }
      if (errorMsg.includes('SyntaxError')) {
        return 'コードの構文に誤りがあります。括弧やカンマを確認してください。';
      }
      if (errorMsg.includes('TypeError')) {
        return 'データ型の不一致です。期待される型と実際の型を確認してください。';
      }
      if (errorMsg.includes('ImportError') || errorMsg.includes('ModuleNotFoundError')) {
        return '必要なライブラリがインストールされていないか、インポートパスが間違っています。';
      }
      return 'エラー内容をよく確認し、該当箇所を修正してください。';
    };

    return (
      <div className="output-panel output-panel--error">
        <div className="output-panel__annotation">
          <span className="annotation-icon">💡</span>
          <span className="annotation-text">このコードは実行時にエラーが発生しました</span>
        </div>

        <div className="output-panel__header">
          <h4>エラー発生</h4>
          <button
            className="output-panel__toggle"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '▲ 詳細を隠す' : '▼ 詳細を表示'}
          </button>
        </div>

        <div className="output-panel__summary">
          <p className="error-title">処理が完了しませんでした</p>
          <div className="error-hint">
            <strong>💡 ヒント:</strong> {getErrorHint()}
          </div>
        </div>

        <div className="output-panel__details">
          <h5>エラーの詳細</h5>
          <pre className="error-stack">{content.error}</pre>
          {content.stack && showDetails && (
            <>
              <h5>スタックトレース</h5>
              <pre className="error-traceback">{content.stack}</pre>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="output-panel output-panel--success">
      <div className="output-panel__annotation">
        <span className="annotation-icon">✨</span>
        <span className="annotation-text">コードが正常に実行されました</span>
      </div>

      <div className="output-panel__header">
        <h4>実行結果</h4>
        <span className="execution-time">実行完了</span>
      </div>

      <div className="output-panel__content">
        <div className="output-label">標準出力:</div>
        <pre className="output-text">{content.output || '(出力なし)'}</pre>
      </div>

      <div className="output-panel__footer">
        <small>この出力はブラウザ上でシミュレートされています</small>
      </div>
    </div>
  );
};

export default OutputPanel;
