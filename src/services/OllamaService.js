const OLLAMA_BASE_URL = 'http://localhost:11434';

export class OllamaService {
  constructor(baseUrl = OLLAMA_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async checkConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Failed to get models:', error);
      return [];
    }
  }

  async generate(prompt, options = {}) {
    const {
      model = 'llama3.2',
      stream = false,
      system = 'あなたは優秀なプログラミングアシスタントです。簡潔で有用なコードを書いてください。'
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          system,
          stream,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          }
        })
      });

      if (!response.ok) throw new Error('Generation failed');
      return await response.json();
    } catch (error) {
      throw new Error(`Ollama generation failed: ${error.message}`, { cause: error });
    }
  }

  async chat(messages, options = {}) {
    const {
      model = 'llama3.2',
      stream = false
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream
        })
      });

      if (!response.ok) throw new Error('Chat failed');
      return await response.json();
    } catch (error) {
      throw new Error(`Ollama chat failed: ${error.message}`, { cause: error });
    }
  }

  async explainCode(code, language = 'python') {
    const prompt = `以下の${language}コードの説明を日本語で簡潔に行ってください。:

\`\`\`${language}
${code}
\`\`\`

説明:`;

    return this.generate(prompt, {
      system: 'あなたはコードの説明を行うアシスタントです。日本語で簡潔に、コメント付きの説明を返してください。'
    });
  }

  async completeCode(code, language = 'python') {
    const prompt = `以下の${language}コードの続きを補完してください。完成形のコードをそのまま返してください:

\`\`\`${language}
${code}
\`\`\`

続き:`;

    return this.generate(prompt, {
      system: 'あなたはコード補完のアシスタントです。入力されたコードの続きを、ただのコードで返してください。説明は不要です。'
    });
  }

  async refactorCode(code, language = 'python', goal = 'より簡潔に') {
    const prompt = `以下の${language}コードを「${goal}」するようにリファクタリングしてください。完成形のコードをそのまま返してください:

\`\`\`${language}
${code}
\`\`\`

リファクタリング後:`;

    return this.generate(prompt, {
      system: 'あなたはコードリファクタリングのアシスタントです。改善されたコードをそのまま返してください。説明は不要です。'
    });
  }

  async fixError(code, errorMessage, language = 'python') {
    const prompt = `以下の${language}コードでエラーが発生しました。エラーを修正した完成形のコードをそのまま返してください:

エラー内容: ${errorMessage}

\`\`\`${language}
${code}
\`\`\`

修正後:`;

    return this.generate(prompt, {
      system: 'あなたはデバッグアシスタントです。エラー修正後のコードをそのまま返してください。説明は不要です。'
    });
  }
}

export default new OllamaService();
