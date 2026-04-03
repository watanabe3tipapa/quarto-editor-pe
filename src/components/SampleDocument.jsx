import React from 'react';
import './SampleDocument.css';

const SampleDocument = ({ content }) => {
  const renderMarkdown = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeContent = [];
    let codeLanguage = '';

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.slice(3).replace(/\{/, '').replace(/\}/, '').trim();
          codeContent = [];
        } else {
          inCodeBlock = false;
          elements.push(
            <pre key={index} className={`code-block code-block--${codeLanguage}`}>
              <code>{codeContent.join('\n')}</code>
            </pre>
          );
          codeContent = [];
        }
      } else if (inCodeBlock) {
        codeContent.push(line);
      } else if (line.startsWith('# ')) {
        elements.push(<h1 key={index}>{line.slice(2)}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={index}>{line.slice(3)}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={index}>{line.slice(4)}</h3>);
      } else if (line.trim()) {
        elements.push(<p key={index}>{line}</p>);
      }
    });

    return elements;
  };

  return (
    <div className="sample-document">
      <div className="sample-document__content">
        {renderMarkdown(content)}
      </div>
    </div>
  );
};

export default SampleDocument;
