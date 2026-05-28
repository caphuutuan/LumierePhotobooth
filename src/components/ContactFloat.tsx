import { motion, AnimatePresence } from 'motion/react';
import { Phone, MessageCircle, X, Bot, Send, Sparkles } from 'lucide-react';
import { SiZalo, SiMessenger } from 'react-icons/si';
import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const NOTIFICATIONS = [
  "Bạn cần Lumière tư vấn?",
  "3 khách vừa đặt lịch sáng nay",
  "Nhận ưu đãi 10% khi đặt sớm",
  "Lumière đang online hỗ trợ",
  "Ưu đãi gói Basic chỉ từ 2tr",
  "Dịch vụ tận tâm 24/7",
];

const SUGGESTIONS = [
  "Khám phá các gói dịch vụ?",
  "Gói Premium có gì tốt nhất?",
  "Đặt lịch cần trước bao lâu?",
  "Có phụ phí vận chuyển không?"
];

export const ContactFloat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [noticeIndex, setNoticeIndex] = useState(0);
  
  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
    { 
      role: 'assistant', 
      content: 'Xin chào! Tôi là Trợ lý ảo Lumière AI ✨. Tôi luôn túc trực 24/7 để tư vấn nhanh cho bạn về dịch vụ chụp ảnh Photobooth in lấy liền cao cấp cho tiệc cưới, sinh nhật, sự kiện. Bạn cần tôi thông tin về điều gì hôm nay?' 
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  // 1. Initialize or load sessionId on client
  useEffect(() => {
    let id = localStorage.getItem('lumiere_ai_chat_session_id');
    if (!id) {
      id = 'chat_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      localStorage.setItem('lumiere_ai_chat_session_id', id);
    }
    setSessionId(id);
  }, []);

  // 2. Load existing chat session if it exists in firestore
  useEffect(() => {
    if (!sessionId) return;
    const loadChatHistory = async () => {
      try {
        const sessionDocRef = doc(db, 'ai_chats', sessionId);
        const docSnap = await getDoc(sessionDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.messages && Array.isArray(data.messages)) {
            const loadedMessages = data.messages.map((m: any) => ({
              role: m.role,
              content: m.content
                ? m.content
                : m.text
                ? m.text
                : ''
            }));
            if (loadedMessages.length > 0) {
              setChatMessages(loadedMessages);
            }
          }
        }
      } catch (err) {
        console.error('Lỗi tải lịch sử chat:', err);
      }
    };
    loadChatHistory();
  }, [sessionId]);

  // 3. Helper to save state to Firestore
  const saveChatSession = async (messages: Array<{ role: 'user' | 'assistant', content: string }>) => {
    if (!sessionId) return;
    try {
      const currentUser = auth.currentUser;
      const sessionDocRef = doc(db, 'ai_chats', sessionId);
      
      const chatData = {
        id: sessionId,
        userId: currentUser?.uid || null,
        userName: currentUser?.displayName || 'Khách hàng vãng lai',
        userEmail: currentUser?.email || null,
        userPhone: currentUser?.phoneNumber || null,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: new Date().toISOString()
        })),
        updatedAt: serverTimestamp(),
        unreadByAdmin: true
      };

      await setDoc(sessionDocRef, chatData, { merge: true });
    } catch (err) {
      console.error('Lỗi lưu hội thoại lên Firestore:', err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isOpen && !isChatOpen) {
        setNoticeIndex(prev => (prev + 1) % NOTIFICATIONS.length);
        setShowNotice(true);
        
        // Hide after 5 seconds
        setTimeout(() => setShowNotice(false), 5000);
      }
    }, 12000); // Trigger every 12 seconds

    return () => clearInterval(timer);
  }, [isOpen, isChatOpen]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => {
        const container = document.getElementById('chat-messages-container');
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  }, [chatMessages, isTyping, isChatOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || inputVal;
    if (!rawText.trim()) return;

    // Create user message
    const userMsg = { role: 'user' as const, content: rawText };
    const updatedMessagesWithUser = [...chatMessages, userMsg];
    setChatMessages(updatedMessagesWithUser);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    // Save early user message state to firestore
    await saveChatSession(updatedMessagesWithUser);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessagesWithUser })
      });

      const data = await response.json();
      if (response.ok) {
        const updatedWithAssistant = [...updatedMessagesWithUser, { role: 'assistant' as const, content: data.reply }];
        setChatMessages(updatedWithAssistant);
        await saveChatSession(updatedWithAssistant);
      } else {
        const errorMsg = { role: 'assistant' as const, content: `Lỗi: ${data.error || 'Không thể kết nối với AI.'}` };
        const updatedWithError = [...updatedMessagesWithUser, errorMsg];
        setChatMessages(updatedWithError);
        await saveChatSession(updatedWithError);
      }
    } catch (err) {
      console.error(err);
      const networkErrorMsg = { role: 'assistant' as const, content: 'Hiện tại không thể liên kết đến hệ thống Trợ lý ảo. Vui lòng kiểm tra kết nối mạng.' };
      const updatedWithNetworkError = [...updatedMessagesWithUser, networkErrorMsg];
      setChatMessages(updatedWithNetworkError);
      await saveChatSession(updatedWithNetworkError);
    } finally {
      setIsTyping(false);
    }
  };

  const contactMethods = [
    {
      id: 'messenger',
      icon: SiMessenger,
      label: 'Messenger',
      color: 'bg-[#0084FF]',
      href: 'https://m.me/yourprofile', // Replace with real links
    },
    {
      id: 'zalo',
      icon: SiZalo,
      label: 'Zalo',
      color: 'bg-[#0068FF]',
      href: 'https://zalo.me/090xxxxxxx', // Replace with real phone
    },
    {
      id: 'phone',
      icon: Phone,
      label: 'Gọi điện',
      color: 'bg-primary',
      href: 'tel:090xxxxxxx', // Replace with real phone
    },
  ];

  return (
    <div className="fixed bottom-24 md:bottom-10 right-6 z-[70] flex flex-col items-end gap-4">
      {/* Random Notification */}
      <AnimatePresence>
        {showNotice && !isOpen && !isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="bg-white px-5 py-3 rounded-2xl shadow-2xl border border-primary/10 relative mb-2 max-w-[200px]"
          >
            <button 
              onClick={() => setShowNotice(false)}
              className="absolute -top-2 -right-2 bg-on-surface text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"
            >
              <X className="w-3 h-3" />
            </button>
            <p className="text-sm font-bold text-on-surface-variant leading-tight">
              {NOTIFICATIONS[noticeIndex]}
            </p>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white rotate-45 border-r border-b border-primary/10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chat Bot Dialog */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(115,92,0,0.15)] border border-primary/10 w-[90vw] sm:w-[380px] h-[520px] flex flex-col overflow-hidden mb-2"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-[#554300] text-white p-5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/12 rounded-2xl relative">
                  <Bot className="w-6 h-6 text-primary-fixed" />
                  <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#735c00] animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5 font-sans">
                    Lumière AI Support <Sparkles className="w-3.5 h-3.5 text-primary-fixed" />
                  </h4>
                  <p className="text-[11px] opacity-75 font-sans">Đang trực tuyến • Trả lời ngay tức thì</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Area */}
            <div 
              id="chat-messages-container"
              className="flex-1 p-5 overflow-y-auto space-y-4 bg-background/50 scrollbar-thin max-h-[300px]"
            >
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs mr-2 self-end shrink-0">
                      AI
                    </div>
                  )}
                  <div 
                    className={`max-w-[78%] px-4 py-3 rounded-[20px] text-xs leading-relaxed font-sans shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white rounded-br-none' 
                        : 'bg-white text-on-surface-variant rounded-bl-none border border-primary/5'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs mr-2 shrink-0">
                    AI
                  </div>
                  <div className="bg-white border border-primary/5 px-4 py-3.5 rounded-[20px] rounded-bl-none shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions Chips */}
            <div className="px-4 py-2 border-t border-surface-variant/20 flex gap-2 overflow-x-auto scrollbar-none whitespace-nowrap bg-white/50 shrink-0">
              {SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sug)}
                  disabled={isTyping}
                  className="px-3 py-1.5 bg-surface-container hover:bg-primary-fixed/20 border border-primary/10 hover:border-primary/30 rounded-full text-[11px] font-medium text-primary transition-all cursor-pointer select-none"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-surface-variant/20 flex gap-2 items-center shrink-0">
              <input 
                type="text" 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
                placeholder="Nhập câu hỏi của bạn tại đây..."
                disabled={isTyping}
                className="flex-1 bg-surface-container border border-surface-variant/10 rounded-2xl px-4 py-3 text-xs outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={isTyping || !inputVal.trim()}
                className="p-3 bg-primary hover:bg-[#554300] text-white rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Options Menu */}
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-2">
            {contactMethods.map((method, index) => {
              return (
                <motion.a
                  key={method.id}
                  href={method.href}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1, x: -5 }}
                  className={`${method.color} text-white p-4 rounded-full shadow-2xl flex items-center gap-3 group`}
                >
                  <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-300 font-bold text-sm whitespace-nowrap">
                    {method.label}
                  </span>
                  <method.icon className="w-6 h-6" />
                </motion.a>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Primary Split Floating Buttons Container */}
      <div className="flex items-center gap-3">
        {/* Button 1: Dedicated AI Chat Button */}
        <motion.button
          onClick={() => {
            setIsChatOpen(!isChatOpen);
            setIsOpen(false);
            setShowNotice(false);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 p-4 sm:px-5 sm:py-3.5 rounded-full shadow-2xl border-2 border-white/20 select-none cursor-pointer transition-all ${
            isChatOpen
              ? 'bg-[#ef4444] text-white hover:bg-[#dc2626]'
              : 'bg-gradient-to-r from-[#d4af37] to-[#735c00] text-white hover:brightness-110 shadow-[0_4px_20px_rgba(115,92,0,0.3)]'
          }`}
          title="Trợ lý AI 24/7"
        >
          {isChatOpen ? (
            <>
              <X className="w-6 h-6 shrink-0" />
              <span className="hidden sm:inline text-xs font-black font-sans tracking-widest uppercase">Đóng Chat</span>
            </>
          ) : (
            <>
              <div className="relative flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white animate-ping"></span>
              </div>
              <span className="hidden sm:inline text-xs font-black font-sans tracking-widest uppercase">Trợ lý AI</span>
            </>
          )}
        </motion.button>

        {/* Button 2: Floating Contact Options Button */}
        <motion.button
          onClick={() => {
            setIsOpen(!isOpen);
            setIsChatOpen(false);
            setShowNotice(false);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 p-4 sm:px-5 sm:py-3.5 rounded-full shadow-2xl border-2 border-white/20 select-none cursor-pointer transition-all ${
            isOpen
              ? 'bg-[#ef4444] text-white hover:bg-[#dc2626]'
              : 'bg-primary text-white hover:bg-[#554300]'
          }`}
          title="Liên hệ với Lumière"
        >
          {isOpen ? (
            <>
              <X className="w-6 h-6 shrink-0" />
              <span className="hidden sm:inline text-xs font-black font-sans tracking-widest uppercase">Đóng Menu</span>
            </>
          ) : (
            <>
              <div className="relative flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full border-2 border-white animate-pulse"></span>
              </div>
              <span className="hidden sm:inline text-xs font-black font-sans tracking-widest uppercase">Liên hệ</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

