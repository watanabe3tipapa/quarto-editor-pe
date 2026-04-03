const PYTHON_PATTERNS = {
  syntaxErrors: [
    { pattern: /def\s+\w+\s*\([^)]*$/m, message: '関数定義の最後に関数本体がありません', type: 'error' },
    { pattern: /class\s+\w+\s*$/m, message: 'クラス定義の最後にコロン(:)が必要です', type: 'error' },
    { pattern: /if\s+.+[^:]$/m, message: 'if文の最後にコロン(:)が必要です', type: 'error' },
    { pattern: /for\s+.+[^:]$/m, message: 'for文の最後にコロン(:)が必要です', type: 'error' },
    { pattern: /while\s+.+[^:]$/m, message: 'while文の最後にコロン(:)が必要です', type: 'error' },
    { pattern: /except\s*$/m, message: 'except節に例外クラスまたはfinallyが必要です', type: 'error' },
    { pattern: /^\s*(else|elif|except|finally)\s*:/m, message: 'このキーワードは適切なブロックが必要です', type: 'error' },
    { pattern: /return\s+[^:\n]+$/m, message: 'return statements should be on their own line', type: 'warning' },
    { pattern: /(\s+|^)(print|input)\s*(?!\(\))/m, message: 'print/inputには括弧が必要です (Python 3)', type: 'warning' },
  ],
  styleWarnings: [
    { pattern: /^\s{8,}/m, message: '8スペース以上のインデント detected', type: 'info' },
    { pattern: /\t/m, message: 'タブの使用。建议: スペースに変換', type: 'info' },
    { pattern: /[^\u{0}-\u{7F}]/u, message: '全角文字が検出されました', type: 'info' },
  ],
  commonErrors: [
    {
      pattern: /=\s*$/m,
      message: '代入に値がありません',
      type: 'error'
    },
    {
      pattern: /\(\s*\)/m,
      message: '空の括弧 ()',
      type: 'warning'
    },
    {
      pattern: /,\s*$/m,
      message: 'カンマが行末にあります',
      type: 'warning'
    },
    {
      pattern: /def\s+(\w+)\s*\([^)]*,\s*\)/,
      message: '関数の最後の引数の後に余分なカンマがあります',
      type: 'warning'
    },
    {
      pattern: /\[\s*,/,
      message: 'リスト内のカンマが不足しています',
      type: 'warning'
    },
    {
      pattern: /\{\s*,/,
      message: '辞書内のカンマが不足しています',
      type: 'warning'
    },
  ]
};

const JAVASCRIPT_PATTERNS = {
  commonErrors: [
    { pattern: /const\s+\w+\s*=\s*$/m, message: 'const宣言に値が必要です', type: 'error' },
    { pattern: /let\s+\w+\s*=\s*$/m, message: 'let宣言に値が必要です', type: 'error' },
    { pattern: /=\s*;/m, message: '代入に値がありません', type: 'error' },
    { pattern: /function\s+\w+\s*\([^)]*,\s*\)/, message: '最後の引数の後に余分なカンマがあります', type: 'warning' },
    { pattern: /\(\s*,/m, message: '関数の最初の引数としてカンマがあります', type: 'error' },
    { pattern: /\$\{[^}]*$/m, message: 'テンプレートリテラルの閉じ括弧 } が見つかりません', type: 'error' },
    { pattern: /`[^`]*$/m, message: 'テンプレートリテラルの閉じバック틱 ` が見つかりません', type: 'error' },
    { pattern: /'[^']*$/m, message: 'シングルクォートの閉じが見つかりません', type: 'error' },
    { pattern: /"[^"]*$/m, message: 'ダブルクォートの閉じが見つかりません', type: 'error' },
    { pattern: /\/\/$/m, message: 'コメントが閉じられていません', type: 'warning' },
    { pattern: /\/\*/m, message: 'ブロックコメントが閉じられていません', type: 'error' },
    { pattern: /;\s*}/m, message: 'ブロックの終わりに余分なセミコロンがあります', type: 'info' },
  ]
};

export class LinterService {
  lintPython(code) {
    const issues = [];
    const lines = code.split('\n');

    for (const rule of PYTHON_PATTERNS.syntaxErrors) {
      const matches = code.match(new RegExp(rule.pattern, 'gm'));
      if (matches) {
        matches.forEach((match) => {
          const lineNum = this.findLineNumber(code, match);
          issues.push({
            line: lineNum,
            message: rule.message,
            type: rule.type,
            rule: 'E999'
          });
        });
      }
    }

    for (const rule of PYTHON_PATTERNS.commonErrors) {
      const matches = code.match(new RegExp(rule.pattern, 'gm'));
      if (matches) {
        matches.forEach((match) => {
          const lineNum = this.findLineNumber(code, match);
          issues.push({
            line: lineNum,
            message: rule.message,
            type: rule.type,
            rule: 'E501'
          });
        });
      }
    }

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      if (line.length > 120) {
        issues.push({
          line: lineNum,
          message: `行が120文字を超えています (${line.length}文字)`,
          type: 'warning',
          rule: 'E501'
        });
      }

      if (/^\s+$/.test(line)) {
        issues.push({
          line: lineNum,
          message: '空白行にスペースのみが含まれています',
          type: 'info',
          rule: 'W293'
        });
      }

      const trailingSpaces = line.match(/\s+$/);
      if (trailingSpaces && line.trim().length > 0) {
        issues.push({
          line: lineNum,
          message: '行末に余分なスペースがあります',
          type: 'info',
          rule: 'W291'
        });
      }
    });

    return issues.sort((a, b) => a.line - b.line);
  }

  lintJavaScript(code) {
    const issues = [];
    const lines = code.split('\n');

    for (const rule of JAVASCRIPT_PATTERNS.commonErrors) {
      const matches = code.match(new RegExp(rule.pattern, 'gm'));
      if (matches) {
        matches.forEach((match) => {
          const lineNum = this.findLineNumber(code, match);
          issues.push({
            line: lineNum,
            message: rule.message,
            type: rule.type
          });
        });
      }
    }

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      if (line.length > 120) {
        issues.push({
          line: lineNum,
          message: `行が120文字を超えています (${line.length}文字)`,
          type: 'warning'
        });
      }

      const trailingSpaces = line.match(/\s+$/);
      if (trailingSpaces && line.trim().length > 0) {
        issues.push({
          line: lineNum,
          message: '行末に余分なスペースがあります',
          type: 'info'
        });
      }
    });

    return issues.sort((a, b) => a.line - b.line);
  }

  lint(code, language) {
    switch (language.toLowerCase()) {
    case 'python':
    case 'py':
      return this.lintPython(code);
    case 'javascript':
    case 'js':
      return this.lintJavaScript(code);
    default:
      return [];
    }
  }

  findLineNumber(code, match) {
    const beforeMatch = code.split(match)[0];
    return beforeMatch.split('\n').length;
  }
}

export default new LinterService();
