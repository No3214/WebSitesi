"use client";

import React, { useState, useEffect, useRef } from 'react';

/**
 * Digital Concierge Component
 * A premium AI-driven chat widget that uses the brand's persona.
 */
export function DigitalConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Merhaba! Ben Kozbeyli Konağı\'nın Dijital Kâhyasıyım. Size odalarımız, menümüz veya rezervasyon sürecimiz hakkında nasıl yardımcı olabilirim?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Üzgünüm, şu anda bağlantı kuramıyorum. Lütfen daha sonra tekrar deneyin veya bize WhatsApp üzerinden ulaşın.' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="concierge-wrapper">
      {!isOpen && (
        <button className="concierge-trigger" onClick={() => setIsOpen(true)}>
          <div className="trigger-icon">✨</div>
          <span className="trigger-text">Dijital Kâhya</span>
        </button>
      )}

      {isOpen && (
        <div className="concierge-card">
          <div className="concierge-header">
            <div className="header-info">
              <span className="avatar">🌿</span>
              <div>
                <h3>Dijital Kâhya</h3>
                <p>Growth Architect & Concierge</p>
              </div>
            </div>
            <button className="close-button" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="concierge-messages">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role}`}>
                <div className="message-bubble">{m.content}</div>
              </div>
            ))}
            {isTyping && (
              <div className="message assistant">
                <div className="message-bubble typing">...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="concierge-input">
            <input 
              type="text" 
              placeholder="Sorunuzu buraya yazın..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend}>Gönder</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .concierge-wrapper {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
          font-family: inherit;
        }

        .concierge-trigger {
          background: var(--gold, #B59458);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 50px;
          box-shadow: 0 8px 24px rgba(181, 148, 88, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .concierge-trigger:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 32px rgba(181, 148, 88, 0.5);
        }

        .trigger-icon {
          font-size: 1.2rem;
        }

        .concierge-card {
          width: 380px;
          height: 550px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(181, 148, 88, 0.1);
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(40px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .concierge-header {
          background: var(--olive, #4A5D4E);
          color: white;
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .header-info h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .header-info p {
          margin: 0;
          font-size: 0.75rem;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 0.6;
          transition: 0.2s;
        }

        .close-button:hover {
          opacity: 1;
        }

        .concierge-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #FDFCF9;
        }

        .message {
          display: flex;
          width: 100%;
        }

        .message.assistant {
          justify-content: flex-start;
        }

        .message.user {
          justify-content: flex-end;
        }

        .message-bubble {
          max-width: 80%;
          padding: 12px 18px;
          border-radius: 18px;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .assistant .message-bubble {
          background: white;
          color: #333;
          border: 1px solid #EEE;
          border-bottom-left-radius: 4px;
        }

        .user .message-bubble {
          background: var(--gold, #B59458);
          color: white;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 12px rgba(181, 148, 88, 0.2);
        }

        .typing {
          font-style: italic;
          opacity: 0.6;
        }

        .concierge-input {
          padding: 20px;
          background: white;
          display: flex;
          gap: 12px;
          border-top: 1px solid #EEE;
        }

        .concierge-input input {
          flex: 1;
          border: 1px solid #DDD;
          padding: 12px 16px;
          border-radius: 50px;
          outline: none;
          transition: 0.2s;
        }

        .concierge-input input:focus {
          border-color: var(--gold, #B59458);
        }

        .concierge-input button {
          background: var(--gold, #B59458);
          color: white;
          border: none;
          padding: 0 20px;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 600;
          transition: 0.2s;
        }

        .concierge-input button:hover {
          filter: brightness(1.1);
        }

        @media (max-width: 480px) {
          .concierge-card {
            width: calc(100vw - 40px);
            height: calc(100vh - 100px);
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>
    </div>
  );
}
