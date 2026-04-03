import React, { useState, useEffect, useCallback } from 'react';
import OllamaService from '../services/OllamaService';
import './AIAssistant.css';

const AIAssistant = ({ selectedCode, language, onInsertCode, onClose }) => {
  const [mode, setMode] = useState('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('llama3.2');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    const connected = await OllamaService.checkConnection();
    if (connected) {
      setConnectionStatus('connected');
      const availableModels = await OllamaService.getModels();
      setModels(availableModels);
    } else {
      setConnectionStatus('disconnected');
    }
  };

  const handleSend = useCallback(async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await OllamaService.chat([...messages, userMessage], {
        model: selectedModel
      });
      setMessages(prev => [...prev, response.message]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `エラー: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [message, isLoading, messages, selectedModel]);

  const handleExplain = useCallback(async () => {
    if (!selectedCode || isLoading) return;
    setIsLoading(true);
    const userMsg = { role: 'user', content: 'このコードの説明を教えてください' };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await OllamaService.explainCode(selectedCode, language);
      const assistantMsg = { role: 'assistant', content: response.response };
      setMessages(prev => [...prev, assistantMsg]);
      setHistory(prev => [...prev, userMsg, assistantMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `エラー: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCode, language, isLoading]);

  const handleComplete = useCallback(async () => {
    if (!selectedCode || isLoading) return;
    setIsLoading(true);

    try {
      const response = await OllamaService.completeCode(selectedCode, language);
      onInsertCode(response.response);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `エラー: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCode, language, isLoading, onInsertCode]);

  const handleRefactor = useCallback(async () => {
    if (!selectedCode || isLoading) return;
    setIsLoading(true);

    try {
      const response = await OllamaService.refactorCode(selectedCode, language);
      onInsertCode(response.response);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `エラー: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCode, language, isLoading, onInsertCode]);

  const handleClearHistory = () => {
    if (window.confirm('履歴をクリアしますか？')) {
      setHistory([]);
    }
  };

  return (
    <div className="ai-assistant">
      <div className="ai-assistant__header">
        <h3>🤖 AI Assistant</h3>
        <div className="ai-assistant__status">
          <span className={`status-dot status-dot--${connectionStatus}`}></span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="model-select"
          >
            <option value="llama3.2">llama3.2</option>
            {models.filter(m => m.name !== 'llama3.2').map(m => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>
        <button className="ai-assistant__close" onClick={onClose}>×</button>
      </div>

      <div className="ai-assistant__actions">
        {selectedCode ? (
          <>
            <button onClick={handleExplain} disabled={isLoading || connectionStatus !== 'connected'}>
              📖 Explain
            </button>
            <button onClick={handleComplete} disabled={isLoading || connectionStatus !== 'connected'}>
              ✨ Complete
            </button>
            <button onClick={handleRefactor} disabled={isLoading || connectionStatus !== 'connected'}>
              🔄 Refactor
            </button>
          </>
        ) : (
          <span className="no-selection-hint">
            コードブロックをクリックして選択してください
          </span>
        )}
      </div>

      <div className="ai-assistant__tabs">
        <button
          className={mode === 'chat' ? 'active' : ''}
          onClick={() => setMode('chat')}
        >
          Chat
        </button>
        <button
          className={mode === 'history' ? 'active' : ''}
          onClick={() => setMode('history')}
        >
          History ({history.length > 0 ? `${history.length / 2}` : '0'})
        </button>
      </div>

      <div className="ai-assistant__messages">
        {mode === 'chat' ? (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`message message--${msg.role}`}>
                <div className="message__role">{msg.role === 'user' ? '👤' : '🤖'}</div>
                <div className="message__content">
                  <pre>{msg.content}</pre>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message message--loading">
                <div className="message__role">🤖</div>
                <div className="message__content">
                  <span className="loading-dots">考え中...</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {history.length === 0 ? (
              <div className="no-history">履歴がありません</div>
            ) : (
              history.map((msg, i) => (
                <div key={i} className={`message message--${msg.role}`}>
                  <div className="message__role">{msg.role === 'user' ? '👤' : '🤖'}</div>
                  <div className="message__content">
                    <pre>{msg.content}</pre>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {mode === 'chat' && (
        <div className="ai-assistant__input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={connectionStatus === 'connected' ? 'AIに質問...' : 'Ollamaに接続されていません'}
            disabled={isLoading || connectionStatus !== 'connected'}
          />
          <button onClick={handleSend} disabled={isLoading || !message.trim() || connectionStatus !== 'connected'}>
            ➤
          </button>
        </div>
      )}

      {mode === 'history' && history.length > 0 && (
        <div className="ai-assistant__footer">
          <button onClick={handleClearHistory} className="clear-history-btn">
            履歴をクリア
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
