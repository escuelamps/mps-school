'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { Send, User, Bot, Clock, Power, PowerOff, Phone } from 'lucide-react';

export default function ChatsDashboard() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Cargar lista de chats
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

  // Cargar mensajes del chat seleccionado
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
      // Llamar a nuestro API local para que envíe el mensaje vía Meta y pause el bot
      const res = await fetch('/api/admin/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: selectedChat.id, text: messageText }),
      });

      if (!res.ok) {
        console.error('Error enviando mensaje');
      }
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
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Sidebar: Lista de Chats */}
      <div className="w-1/3 max-w-sm bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 bg-blue-600 text-white shadow-md z-10 flex justify-between items-center">
          <h1 className="text-xl font-bold">Chats MPS</h1>
          <div className="text-xs bg-blue-700 px-2 py-1 rounded-full flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span> En vivo
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay chats registrados.
            </div>
          ) : (
            chats.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${selectedChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold text-gray-800 flex items-center">
                    <Phone className="w-4 h-4 mr-1 text-gray-400" /> {chat.phone}
                  </div>
                  <span className="text-xs text-gray-400">{formatTime(chat.lastMessageTime)}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                
                <div className="mt-2 flex items-center">
                  <span className={`text-[10px] px-2 py-1 rounded font-medium ${chat.botState === 'PAUSADO_ASESOR_HUMANO' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                    {chat.botState === 'PAUSADO_ASESOR_HUMANO' ? 'Bot Pausado (Humano)' : 'Bot Activo'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content: Ventana de Chat */}
      <div className="flex-1 flex flex-col bg-[#e5ddd5] relative">
        {/* Patrón de fondo WhatsApp */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-solid-color-whatsapp-pattern-black-thumbnail.jpg")', backgroundSize: '400px' }}></div>

        {selectedChat ? (
          <>
            {/* Header del Chat */}
            <div className="px-6 py-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center z-10 shadow-sm">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 mr-3">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">{selectedChat.phone}</h2>
                  <p className="text-xs text-green-600 flex items-center">
                    En línea
                  </p>
                </div>
              </div>

              {/* Botón para Pausar/Activar Bot */}
              <button 
                onClick={() => toggleBot(selectedChat.id, selectedChat.botState)}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedChat.botState === 'PAUSADO_ASESOR_HUMANO' 
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                }`}
                title={selectedChat.botState === 'PAUSADO_ASESOR_HUMANO' ? "El bot está pausado. Clic para reactivar." : "El bot está activo. Clic para pausarlo y hablar tú."}
              >
                {selectedChat.botState === 'PAUSADO_ASESOR_HUMANO' ? (
                  <><PowerOff className="w-4 h-4 mr-2" /> Bot Pausado</>
                ) : (
                  <><Power className="w-4 h-4 mr-2" /> Bot Activo</>
                )}
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 z-10 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center my-10 bg-yellow-100/80 rounded-lg p-3 mx-auto max-w-sm text-sm text-yellow-800 shadow-sm">
                  Aquí aparecerán los mensajes de esta conversación.
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isUser = msg.sender === 'user';
                  const isBot = msg.sender === 'bot';
                  const isAdmin = msg.sender === 'admin';
                  
                  return (
                    <div key={msg.id || index} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm relative group ${
                        isUser ? 'bg-white rounded-tl-none border border-gray-100' : 
                        isAdmin ? 'bg-[#dcf8c6] rounded-tr-none border border-green-200/50' : 
                        'bg-blue-100 rounded-tr-none border border-blue-200/50'
                      }`}>
                        
                        {/* Indicador de quién envió (si no es el usuario) */}
                        {!isUser && (
                          <div className={`text-[10px] font-bold mb-1 flex items-center ${isAdmin ? 'text-green-700' : 'text-blue-700'}`}>
                            {isAdmin ? <User className="w-3 h-3 mr-1" /> : <Bot className="w-3 h-3 mr-1" />}
                            {isAdmin ? 'Marketing' : 'Bot (Automático)'}
                          </div>
                        )}
                        
                        <p className="text-gray-800 text-[15px] whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        
                        <div className="text-[10px] text-gray-400 mt-1 flex justify-end items-center">
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
            <div className="p-3 bg-gray-100 flex items-end border-t border-gray-200 z-10">
              <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 rounded-xl border border-gray-300 py-3 px-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none max-h-32 min-h-[50px] transition-all bg-white shadow-sm"
                  rows={1}
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
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md h-[50px] w-[50px]"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center z-10 text-gray-500">
            <div className="w-24 h-24 bg-gray-200/50 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-light text-gray-700 mb-2">MPS WhatsApp CRM</h2>
            <p className="text-sm">Selecciona un chat en la barra lateral para ver los mensajes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
