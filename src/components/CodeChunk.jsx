import React, { useState, useEffect } from 'react';
import RunButton from './RunButton';
import OutputPanel from './OutputPanel';
import StatusIndicator from './StatusIndicator';
import LintPanel from './LintPanel';
import LinterService from '../services/LinterService';
import './CodeChunk.css';

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

const CodeChunk = ({
  chunk,
  status,
  output,
  isSelected,
  isHovered,
  onExecute,
  onReset,
  onSelect,
  onMouseEnter,
  onMouseLeave
}) => {
  const [showLint, setShowLint] = useState(false);
  const [lintIssues, setLintIssues] = useState([]);
  const langColor = LANGUAGE_COLORS[chunk.language] || '#6c757d';

  useEffect(() => {
    if (isSelected && ['python', 'js', 'javascript'].includes(chunk.language.toLowerCase())) {
      const issues = LinterService.lint(chunk.code, chunk.language);
      setLintIssues(issues);
    }
  }, [isSelected, chunk.code, chunk.language]);

  const hasLintErrors = lintIssues.some(i => i.type === 'error');
  const hasLintWarnings = lintIssues.some(i => i.type === 'warning');
  const showDetails = isSelected || isHovered || status !== 'idle';

  return (
    <div
      className={`code-chunk ${isSelected ? 'code-chunk--selected' : ''}`}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ '--lang-color': langColor }}
    >
      <div className="code-chunk__bar">
        <div className="code-chunk__lang" style={{ backgroundColor: langColor }}>
          {chunk.language}
        </div>

        {showDetails && (
          <div className="code-chunk__controls">
            <StatusIndicator status={status} mini />
            {hasLintErrors && <span className="code-chunk__badge code-chunk__badge--error">❌</span>}
            {hasLintWarnings && !hasLintErrors && <span className="code-chunk__badge code-chunk__badge--warning">⚠️</span>}
            <RunButton status={status} onClick={onExecute} mini />
            {status !== 'idle' && (
              <button className="code-chunk__btn code-chunk__btn--reset" onClick={(e) => { e.stopPropagation(); onReset(); }}>
                ×
              </button>
            )}
          </div>
        )}

        {!showDetails && status !== 'idle' && (
          <div className="code-chunk__controls">
            <StatusIndicator status={status} mini />
          </div>
        )}
      </div>

      {showLint && lintIssues.length > 0 && isSelected && (
        <LintPanel issues={lintIssues} language={chunk.language} />
      )}

      {output && (
        <OutputPanel type={output.type} content={output} />
      )}
    </div>
  );
};

export default CodeChunk;
