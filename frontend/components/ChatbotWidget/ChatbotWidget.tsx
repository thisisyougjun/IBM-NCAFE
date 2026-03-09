'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ChatbotWidget.module.css';
import { Send, Bot, User, MessageCircle, X } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface UIMessage {
  id: number;
  sender: 'user' | 'agent';
  text: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [uiMessages, setUiMessages] = useState<UIMessage[]>([
    {
      id: Date.now(),
      sender: 'agent',
      text: '안녕하세요! NCafe AI 바리스타입니다. 메뉴 추천이나 음료에 대해 궁금한 점을 물어보세요! ☕',
    },
  ]);
  // 멀티턴 히스토리 (클라이언트 관리, agent-server 명세에 따라)
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [uiMessages, isStreaming, isOpen]);

  const toggleWidget = () => setIsOpen((prev) => !prev);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const userText = inputValue.trim();
    if (!userText || isStreaming) return;

    setInputValue('');

    // 유저 메시지 UI에 추가
    const userMsg: UIMessage = { id: Date.now(), sender: 'user', text: userText };
    setUiMessages((prev) => [...prev, userMsg]);

    // 히스토리에 유저 메시지 추가
    const newHistory: ChatMessage[] = [...history, { role: 'user', content: userText }];

    // 에이전트 응답 메시지 자리 만들기 (스트리밍용)
    const agentMsgId = Date.now() + 1;
    setUiMessages((prev) => [...prev, { id: agentMsgId, sender: 'agent', text: '' }]);
    setIsStreaming(true);

    try {
      abortControllerRef.current = new AbortController();

      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error('agent-server 응답 오류');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullReply = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullReply += parsed.content;
                // 스트리밍 중 UI 실시간 업데이트
                setUiMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === agentMsgId ? { ...msg, text: fullReply } : msg
                  )
                );
              }
            } catch {
              // JSON 파싱 실패 무시
            }
          }
        }
      }

      // 히스토리에 에이전트 응답 추가
      setHistory([...newHistory, { role: 'model', content: fullReply }]);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setUiMessages((prev) =>
          prev.map((msg) =>
            msg.id === agentMsgId
              ? { ...msg, text: '죄송합니다. AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.' }
              : msg
          )
        );
      }
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className={styles.widgetContainer}>
      {isOpen && (
        <div className={styles.chatWindow}>
          <header className={styles.header}>
            <div className={styles.headerTitle}>
              <div className={styles.headerIcon}>
                <Bot size={20} color="#fff" />
              </div>
              <div className={styles.headerTextContainer}>
                <h3>AI 바리스타</h3>
                <p>NCAFE 챗봇</p>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={toggleWidget}>
              <X size={24} />
            </button>
          </header>

          <main className={styles.chatArea}>
            {uiMessages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageWrapper} ${
                  msg.sender === 'user' ? styles.messageWrapperUser : styles.messageWrapperAgent
                }`}
              >
                {msg.sender === 'agent' && (
                  <div className={styles.avatarAgent}>
                    <Bot size={18} />
                  </div>
                )}

                <div className={styles.messageContent}>
                  <div
                    className={`${styles.bubble} ${
                      msg.sender === 'user' ? styles.bubbleUser : styles.bubbleAgent
                    }`}
                  >
                    {msg.text || <span className={styles.cursorBlink}>▌</span>}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className={styles.avatarUser}>
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}

            {isStreaming && uiMessages[uiMessages.length - 1]?.text === '' && (
              <div className={`${styles.messageWrapper} ${styles.messageWrapperAgent}`}>
                <div className={styles.avatarAgent}>
                  <Bot size={18} />
                </div>
                <div className={styles.messageContent}>
                  <div className={`${styles.bubble} ${styles.bubbleAgent} ${styles.typing}`}>
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>

          <footer className={styles.footer}>
            <form onSubmit={handleSendMessage} className={styles.inputForm}>
              <input
                type="text"
                className={styles.input}
                placeholder="메시지를 입력하세요..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isStreaming}
              />
              <button type="submit" className={styles.sendBtn} disabled={!inputValue.trim() || isStreaming}>
                <Send size={18} />
              </button>
            </form>
          </footer>
        </div>
      )}

      {!isOpen && (
        <button className={styles.fab} onClick={toggleWidget} aria-label="챗봇 열기">
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
}
