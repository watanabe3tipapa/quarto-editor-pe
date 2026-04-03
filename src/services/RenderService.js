import { marked } from 'marked';

const QUARTO_API_URL = 'http://localhost:3001/api/render';

export const RenderService = {
  async renderWithQuarto(content) {
    try {
      const response = await fetch(QUARTO_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { content }
      });
      
      if (!response.ok) throw new Error('Quarto API failed');
      const data = await response.json();
      return data.html;
    } catch (error) {
      console.warn('Quarto CLI not available, using fallback:', error.message);
      throw error;
    }
  },

  renderWithMarked(content) {
    return marked.parse(content);
  },

  async render(content, useQuarto = true) {
    if (useQuarto) {
      try {
        return await this.renderWithQuarto(content);
      } catch {
        console.log('Falling back to marked library');
      }
    }
    return this.renderWithMarked(content);
  },

  async isQuartoAvailable() {
    try {
      const response = await fetch(QUARTO_API_URL.replace('/render', '/health'), {
        method: 'GET'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};

export default RenderService;
