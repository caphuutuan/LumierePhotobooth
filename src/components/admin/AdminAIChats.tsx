import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Search, 
  Trash2, 
  User as UserIcon, 
  CheckCircle, 
  MessageSquare, 
  Clock, 
  RefreshCw, 
  Sparkles,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface AIChatSession {
  id: string;
  userId: string | null;
  userName: string;
  userEmail: string | null;
  userPhone: string | null;
  messages: Message[];
  updatedAt: any;
  unreadByAdmin: boolean;
}

export const AdminAIChats = () => {
  const [sessions, setSessions] = useState<AIChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AIChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Subscribe to real-time chat sessions from Firestore
  useEffect(() => {
    const q = query(collection(db, 'ai_chats'), orderBy('updatedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData: AIChatSession[] = [];
      snapshot.forEach((snapDoc) => {
        const data = snapDoc.data();
        docsData.push({
          id: snapDoc.id,
          userId: data.userId || null,
          userName: data.userName || 'Khách hàng vãng lai',
          userEmail: data.userEmail || null,
          userPhone: data.userPhone || null,
          messages: data.messages || [],
          updatedAt: data.updatedAt,
          unreadByAdmin: data.unreadByAdmin ?? true,
        });
      });
      setSessions(docsData);
      
      // Keep selected session updated with live incoming message chains
      if (selectedSession) {
        const currentSelected = docsData.find(s => s.id === selectedSession.id);
        if (currentSelected) {
          setSelectedSession(currentSelected);
        }
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Error fetching real-time AI chats:', error);
      toast.error('Không thể truyền tải trực tiếp cuộc hội thoại AI.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedSession?.id]);

  // 2. Auto-scroll chat details to the bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedSession?.messages]);

  // 3. Mark current chat as read
  const handleSelectSession = async (session: AIChatSession) => {
    setSelectedSession(session);
    if (session.unreadByAdmin) {
      try {
        const docRef = doc(db, 'ai_chats', session.id);
        await updateDoc(docRef, { unreadByAdmin: false });
      } catch (err) {
        console.error('Cant mark read:', err);
      }
    }
  };

  // Toggle Read Status manually
  const toggleReadStatus = async (e: React.MouseEvent, session: AIChatSession) => {
    e.stopPropagation();
    try {
      const docRef = doc(db, 'ai_chats', session.id);
      await updateDoc(docRef, { unreadByAdmin: !session.unreadByAdmin });
      toast.success(session.unreadByAdmin ? 'Đã đánh dấu là Đã đọc' : 'Đã đánh dấu là Chưa đọc');
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái.');
    }
  };

  // 4. Delete session
  const handleDeleteSession = async (e: React.MouseEvent, session: AIChatSession) => {
    e.stopPropagation();
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn đoạn chat của "${session.userName}" không?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'ai_chats', session.id));
      toast.success('Xóa cuộc hội thoại thành công');
      if (selectedSession?.id === session.id) {
        setSelectedSession(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xóa cuộc hội thoại.');
    }
  };

  // 5. Filters
  const filteredSessions = sessions.filter(session => {
    const rawSearch = search.toLowerCase();
    return (
      session.userName.toLowerCase().includes(rawSearch) ||
      (session.userEmail && session.userEmail.toLowerCase().includes(rawSearch)) ||
      (session.userPhone && session.userPhone.includes(rawSearch)) ||
      session.messages.some(m => m.content.toLowerCase().includes(rawSearch))
    );
  });

  const unreadCount = sessions.filter(s => s.unreadByAdmin).length;

  const parseFirestoreDate = (field: any) => {
    if (!field) return new Date();
    if (field.toDate) return field.toDate();
    if (field.seconds) return new Date(field.seconds * 1000);
    return new Date(field);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* Header Panel */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-variant/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-tight text-on-surface flex items-center gap-2">
            Trợ lý AI Monitor <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </h2>
          <p className="text-sm text-on-surface-variant font-sans mt-0.5">
            Theo dõi, định lượng và đọc lại toàn bộ các cuộc hội thoại thời gian thực của Lumière AI với khách hàng.
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="bg-[#ffe088]/20 border border-primary/20 rounded-2xl px-4 py-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#d4af37] rounded-full animate-pulse" />
            <span className="text-xs font-bold text-primary tracking-wide uppercase">
              {unreadCount} Hội thoại chưa xem
            </span>
          </div>
        )}
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left Side: Sessions List */}
        <div className="w-full lg:w-[400px] bg-white rounded-3xl border border-surface-variant/10 shadow-sm flex flex-col overflow-hidden shrink-0">
          {/* Search bar */}
          <div className="p-5 border-b border-surface-variant/10 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên khách, số ĐT, tin nhắn..."
                className="w-full pl-11 pr-4 py-2.5 bg-[#F8F9FA] rounded-2xl border border-surface-variant/5 text-sm focus:border-primary/30 outline-none transition-all placeholder:text-on-surface-variant/40"
              />
            </div>
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="px-3 hover:bg-surface-container rounded-xl text-xs font-medium cursor-pointer"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Session Cards */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-0 scrollbar-thin">
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant py-20 flex flex-col items-center gap-3">
                <MessageSquare className="w-10 h-10 opacity-30" />
                <p className="text-sm font-medium">Không tìm thấy hội thoại nào</p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isSelected = selectedSession?.id === session.id;
                const lastMsg = session.messages[session.messages.length - 1];
                const dateObj = parseFirestoreDate(session.updatedAt);
                const timeDist = formatDistanceToNow(dateObj, { addSuffix: true, locale: vi });

                return (
                  <div
                    key={session.id}
                    onClick={() => handleSelectSession(session)}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all relative flex flex-col gap-2 group ${
                      isSelected 
                        ? 'bg-primary/5 border-primary/20 shadow-sm' 
                        : 'bg-white border-surface-variant/10 hover:bg-[#F8F9FA]'
                    }`}
                  >
                    {/* Unread dot */}
                    {session.unreadByAdmin && (
                      <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white shadow-sm" />
                    )}

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {session.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-sm text-on-surface truncate pr-4">
                            {session.userName}
                          </h4>
                        </div>
                        {session.userPhone && (
                          <p className="text-[11px] text-primary font-medium tracking-wide">
                            {session.userPhone}
                          </p>
                        )}
                        {session.userEmail && (
                          <p className="text-[10px] text-on-surface-variant/70 truncate">
                            {session.userEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    {lastMsg && (
                      <p className="text-xs text-on-surface-variant/80 truncate font-sans bg-[#F8F9FA] group-hover:bg-white/50 p-2 rounded-lg ml-1">
                        <span className="font-semibold text-[10px] uppercase text-primary mr-1">
                          {lastMsg.role === 'user' ? 'Khách:' : 'AI:'}
                        </span>
                        {lastMsg.content}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant/60 mt-1 pl-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeDist}
                      </span>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => toggleReadStatus(e, session)}
                          className="p-1 px-1.5 bg-background border border-surface-variant/10 hover:border-primary/20 rounded-md text-[10px] flex items-center gap-1 transition-all text-on-surface"
                          title={session.unreadByAdmin ? "Đánh dấu đã đọc" : "Đánh dấu chưa đọc"}
                        >
                          {session.unreadByAdmin ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={(e) => handleDeleteSession(e, session)}
                          className="p-1 bg-error-container border border-error/10 text-error hover:bg-error/10 hover:border-error/20 rounded-md transition-all"
                          title="Xóa hội thoại"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Conversation Detail */}
        <div className="flex-1 bg-white rounded-3xl border border-surface-variant/10 shadow-sm flex flex-col overflow-hidden min-h-0">
          {selectedSession ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Detail Header */}
              <div className="p-6 border-b border-surface-variant/10 flex justify-between items-center bg-[#F8F9FA]/30 shrink-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                    {selectedSession.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                      {selectedSession.userName}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant/80 mt-1">
                      {selectedSession.userPhone && (
                        <span>Số ĐT: <strong className="text-primary">{selectedSession.userPhone}</strong></span>
                      )}
                      {selectedSession.userEmail && (
                        <span>Email: <strong>{selectedSession.userEmail}</strong></span>
                      )}
                      <span>Bắt đầu: <em>{format(parseFirestoreDate(selectedSession.updatedAt), 'HH:mm dd/MM/yyyy')}</em></span>
                    </div>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => toggleReadStatus(e, selectedSession)}
                    className="p-2 px-3 border border-surface-variant/20 rounded-xl text-xs font-semibold hover:bg-primary/5 hover:text-primary transition-all flex items-center gap-1.5 cursor-pointer text-on-surface-variant"
                  >
                    {selectedSession.unreadByAdmin ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Đã đọc</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Chưa đọc</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={(e) => handleDeleteSession(e, selectedSession)}
                    className="p-2 border border-error/20 bg-error-container text-error rounded-xl hover:bg-error/10 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-semibold">Xóa hội thoại</span>
                  </button>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-background/30 scrollbar-thin">
                {selectedSession.messages.map((msg, idx) => {
                  const isAI = msg.role === 'assistant';
                  return (
                    <div key={idx} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                      {isAI && (
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mr-2.5 self-start">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div className={`max-w-[75%] ${isAI ? 'mr-12' : 'ml-12'}`}>
                        <div 
                          className={`p-4 rounded-2xl relative font-sans text-xs leading-relaxed ${
                            isAI 
                              ? 'bg-white border border-surface-variant/5 text-on-surface shadow-sm rounded-tl-none' 
                              : 'bg-primary text-white shadow-sm rounded-tr-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span className={`text-[10px] text-on-surface-variant/60 mt-1 block px-1 ${!isAI && 'text-right'}`}>
                          {isAI ? 'Lumière AI' : 'Khách hàng'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-on-surface-variant">
              <Bot className="w-16 h-16 opacity-20 text-primary animate-pulse mb-4" />
              <h3 className="font-bold text-lg text-on-surface">Chưa chọn cuộc hội thoại</h3>
              <p className="text-xs max-w-sm mt-1">
                Hãy lựa chọn một cuộc hội thoại ở danh sách bên trái để đọc chi tiết lịch sử tin nhắn của Lumìere AI với khách hàng.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
