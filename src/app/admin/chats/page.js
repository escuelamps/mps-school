'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { Send, User, Bot, Power, PowerOff, Phone, LogOut } from 'lucide-react';
import '../admin.css';

export default function ChatsDashboard() {
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Lógica de inactividad (1 hora)
  useEffect(() => {
    let inactivityTimer;
    
    const logout = async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
      } catch (e) {
        console.error(e);
      }
    };

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      // 1 hora en milisegundos: 60 * 60 * 1000 = 3600000
      inactivityTimer = setTimeout(logout, 3600000);
    };

    // Eventos que reinician el temporizador
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    
    // Iniciar temporizador al montar
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [router]);

  useEffect(() => {
    const q = query(collection(db, 'whatsapp_chats'), orderBy('lastMessageTime', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = [];
      snapshot.forEach((doc) => {
        chatsData.push({ id: doc.id, ...doc.data() });
      });
      setChats(chatsData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    const chatRef = doc(db, 'whatsapp_chats', selectedChat.id);
    const messagesRef = collection(chatRef, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    
    const messageText = newMessage;
    setNewMessage('');
    setIsSending(true);

    try {
      const res = await fetch('/api/admin/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: selectedChat.id, text: messageText }),
      });
      if (!res.ok) console.error('Error enviando mensaje');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const toggleBot = async (phone, currentState) => {
    try {
      const newState = currentState === 'PAUSADO_ASESOR_HUMANO' ? 'MENU_PRINCIPAL' : 'PAUSADO_ASESOR_HUMANO';
      await setDoc(doc(db, 'whatsapp_chats', phone), { botState: newState }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dash-container">
      {/* Sidebar: Lista de Chats */}
      <div className="dash-sidebar">
        <div className="dash-header">
          <h1 className="dash-title">Chats MPS</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="live-badge">
              <span className="live-dot"></span> En vivo
            </div>
            <button 
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/admin/login');
                router.refresh();
              }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        
        <div className="chat-list">
          {chats.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              No hay chats registrados.
            </div>
          ) : (
            chats.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
              >
                <div className="chat-item-header">
                  <div className="chat-phone">
                    <Phone size={14} color="#94a3b8" /> {chat.phone}
                  </div>
                  <span className="chat-time">{formatTime(chat.lastMessageTime)}</span>
                </div>
                <p className="chat-preview">{chat.lastMessage}</p>
                
                <div style={{ marginTop: '0.5rem' }}>
                  <span className={`bot-badge ${chat.botState === 'PAUSADO_ASESOR_HUMANO' ? 'paused' : 'active'}`}>
                    {chat.botState === 'PAUSADO_ASESOR_HUMANO' ? 'Bot Pausado (Humano)' : 'Bot Activo'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content: Ventana de Chat */}
      <div className="dash-main">
        <div className="whatsapp-pattern"></div>

        {selectedChat ? (
          <>
            {/* Header del Chat */}
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="avatar">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="user-name">{selectedChat.phone}</h2>
                  <p className="user-status">En línea</p>
                </div>
              </div>

              {/* Botón para Pausar/Activar Bot */}
              <button 
                onClick={() => toggleBot(selectedChat.id, selectedChat.botState)}
                className={`toggle-btn ${selectedChat.botState === 'PAUSADO_ASESOR_HUMANO' ? 'paused' : 'active'}`}
                title={selectedChat.botState === 'PAUSADO_ASESOR_HUMANO' ? "El bot está pausado. Clic para reactivar." : "El bot está activo. Clic para pausarlo y hablar tú."}
              >
                {selectedChat.botState === 'PAUSADO_ASESOR_HUMANO' ? (
                  <><PowerOff size={16} /> Bot Pausado</>
                ) : (
                  <><Power size={16} /> Bot Activo</>
                )}
              </button>
            </div>

            {/* Mensajes */}
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: '2rem auto', background: 'rgba(254, 240, 138, 0.8)', padding: '1rem', borderRadius: '12px', color: '#854d0e', fontSize: '0.875rem' }}>
                  Aquí aparecerán los mensajes de esta conversación.
                </div>
              ) : (
                messages.map((msg, index) => {
                  const senderClass = msg.sender === 'user' ? 'user' : (msg.sender === 'admin' ? 'admin' : 'bot');
                  const isAdmin = msg.sender === 'admin';
                  const isBot = msg.sender === 'bot';
                  
                  return (
                    <div key={msg.id || index} className={`message-row ${senderClass}`}>
                      <div className="message-bubble">
                        
                        {!msg.sender.includes('user') && (
                          <div className={`msg-sender ${isAdmin ? 'admin' : 'bot'}`}>
                            {isAdmin ? <User size={12} /> : <Bot size={12} />}
                            {isAdmin ? 'Marketing' : 'Bot (Automático)'}
                          </div>
                        )}
                        
                        <p className="msg-text">{msg.text}</p>
                        
                        <div className="msg-time">
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensaje */}
            <div className="chat-input-area">
              <form onSubmit={handleSendMessage} style={{ display: 'flex', width: '100%', gap: '1rem' }}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="chat-textarea"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="send-btn"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Bot size={48} />
            </div>
            <h2 className="empty-title">MPS WhatsApp CRM</h2>
            <p className="empty-subtitle">Selecciona un chat en la barra lateral para ver los mensajes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
