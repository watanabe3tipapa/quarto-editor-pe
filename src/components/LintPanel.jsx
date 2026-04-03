import React from 'react';
import './LintPanel.css';

const LintPanel = ({ issues = [], language }) => {
  if (issues.length === 0) {
    return null;
  }

  const getIcon = (type) => {
    switch (type) {
    case 'error': return '❌';
    case 'warning': return '⚠️';
    default: return 'ℹ️';
    }
  };

  const getClassName = (type) => {
    switch (type) {
    case 'error': return 'lint-issue--error';
    case 'warning': return 'lint-issue--warning';
    default: return 'lint-issue--info';
    }
  };

  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const infoCount = issues.filter(i => i.type === 'info').length;

  return (
    <div className="lint-panel">
      <div className="lint-panel__header">
        <span className="lint-panel__title">🔍 Lint Results</span>
        <div className="lint-panel__stats">
          {errorCount > 0 && (
            <span className="lint-stat lint-stat--error">
              ❌ {errorCount}
            </span>
          )}
          {warningCount > 0 && (
            <span className="lint-stat lint-stat--warning">
              ⚠️ {warningCount}
            </span>
          )}
          {infoCount > 0 && (
            <span className="lint-stat lint-stat--info">
              ℹ️ {infoCount}
            </span>
          )}
        </div>
      </div>
      <div className="lint-panel__list">
        {issues.map((issue, index) => (
          <div
            key={index}
            className={`lint-issue ${getClassName(issue.type)}`}
          >
            <span className="lint-issue__icon">{getIcon(issue.type)}</span>
            <span className="lint-issue__line">L{issue.line}</span>
            <span className="lint-issue__message">{issue.message}</span>
            {issue.rule && (
              <span className="lint-issue__rule">{issue.rule}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LintPanel;
