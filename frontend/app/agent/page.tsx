'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';
import { Send, Bot, User, Coffee } from 'lucide-react';

// --- 더미 데이터 설정 ---
interface Menu {
  id: number;
  korName: string;
  price: number;
  description: string;
  category: string;
}

const dummyMenus: Menu[] = [
  { id: 1, korName: '아메리카노', price: 4500, description: '깔끔한 맛의 에스프레소 커피', category: '커피' },
  { id: 2, korName: '카페라떼', price: 5000, description: '부드러운 우유가 들어간 커피', category: '커피' },
  { id: 3, korName: '망고 스무디', price: 6000, description: '달콤한 망고를 갈아 만든 스무디', category: '스무디/주스' },
  { id: 4, korName: '오렌지 주스', price: 5500, description: '신선한 오렌지 100% 생과일 주스', category: '스무디/주스' },
  { id: 5, korName: '캐모마일', price: 4500, description: '마음이 편안해지는 허브티', category: '티' },
];

interface Message {
  id: number;
  sender: 'system' | 'user' | 'agent';
  text: string;
  recommendations?: Menu[];
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now(),
      sender: 'agent',
      text: '안녕하세요! NCafe 인공지능 바리스타입니다. 무엇을 도와드릴까요? (예: 상큼한 거 추천해줘, 아메리카노 주문할게)',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 올 때마다 스크롤 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    
    // 사용자 메시지 추가
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text: userText },
    ]);
    setInputValue('');
    setIsTyping(true);

    // AI 응답 흉내내기 (딜레이 임의 설정)
    setTimeout(() => {
      generateAgentResponse(userText);
    }, 1000);
  };

  const generateAgentResponse = (userInput: string) => {
    let responseText = '죄송합니다. 아직 제가 이해하지 못한 말이에요. 메뉴 추천이나 주문을 도와드릴 수 있어요!';
    let recommendations: Menu[] | undefined = undefined;

    const text = userInput.replace(/\s+/g, '');

    // 1. 인사
    if (text.includes('안녕') || text.includes('하이') || text.includes('반가워')) {
      responseText = '안녕하세요! 오늘 어떤 음료를 찾으시나요? 원하시는 맛이나 기분을 말씀해주시면 추천해 드릴게요.';
    }
    // 2. 추천 (상큼한 거)
    else if (text.includes('상큼') || text.includes('시원') || text.includes('과일')) {
      responseText = '상큼한 음료를 찾으시는군요! 이런 메뉴들은 어떠신가요?';
      recommendations = dummyMenus.filter((m) => m.category === '스무디/주스' || m.korName.includes('주스'));
    }
    // 3. 추천 (달달한 거, 라떼)
    else if (text.includes('달달') || text.includes('단거') || text.includes('라떼')) {
      responseText = '달콤하고 부드러운 음료가 좋으시겠네요. 아래 메뉴를 추천해 드려요!';
      recommendations = dummyMenus.filter((m) => m.korName.includes('라떼') || m.korName.includes('초코'));
    }
    // 4. 주문 확인
    else if (text.includes('주문') || text.includes('주세요') || text.includes('먹을래')) {
      const orderedMenu = dummyMenus.find((m) => text.includes(m.korName.replace(/\s+/g, '')));
      if (orderedMenu) {
        responseText = `네, [${orderedMenu.korName}]을(를) 장바구니에 담으시겠어요? (결제 기능은 준비 중입니다!)`;
        recommendations = [orderedMenu];
      } else {
        responseText = '어떤 메뉴를 주문하시겠어요? 정확한 메뉴 이름을 포함해서 말씀해 주시면 더 도와드리기 쉬워요!';
      }
    }

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'agent', text: responseText, recommendations },
    ]);
    setIsTyping(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Bot className={styles.headerIcon} />
          <div>
            <h1>NCafe AI 바리스타</h1>
            <p>무엇이든 물어보세요</p>
          </div>
        </div>
      </header>

      <main className={styles.chatArea}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.messageWrapper} ${
              msg.sender === 'user' ? styles.messageWrapperUser : styles.messageWrapperAgent
            }`}
          >
            {msg.sender === 'agent' && (
              <div className={styles.avatarAgent}>
                <Bot size={20} />
              </div>
            )}
            
            <div className={styles.messageContent}>
              <div
                className={`${styles.bubble} ${
                  msg.sender === 'user' ? styles.bubbleUser : styles.bubbleAgent
                }`}
              >
                {msg.text}
              </div>

              {/* 추천 메뉴 카드 (에이전트일 경우에만) */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className={styles.recommendationList}>
                  {msg.recommendations.map((menu) => (
                    <div key={menu.id} className={styles.menuCard}>
                      <div className={styles.menuInfo}>
                        <div className={styles.menuHeader}>
                          <h4>{menu.korName}</h4>
                          <span className={styles.price}>{menu.price.toLocaleString()}원</span>
                        </div>
                        <p className={styles.desc}>{menu.description}</p>
                      </div>
                      <button 
                        className={styles.orderBtn}
                        onClick={() => {
                          setInputValue(`${menu.korName} 주문할래`);
                        }}
                      >
                        주문하기
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className={styles.avatarUser}>
                <User size={20} />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className={`${styles.messageWrapper} ${styles.messageWrapperAgent}`}>
            <div className={styles.avatarAgent}>
              <Bot size={20} />
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
            disabled={isTyping}
          />
          <button type="submit" className={styles.sendBtn} disabled={!inputValue.trim() || isTyping}>
            <Send size={20} />
          </button>
        </form>
      </footer>
    </div>
  );
}
