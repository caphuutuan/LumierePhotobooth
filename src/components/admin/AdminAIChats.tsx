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
  EyeOff,
  MapPin,
  Gift,
  Save,
  Edit2,
  Calendar,
  Phone
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
  summaryName?: string;
  summaryPhone?: string;
  summaryAddress?: string;
  summaryDateTime?: string;
  summaryPackage?: string;
}

export const AdminAIChats = () => {
  const [sessions, setSessions] = useState<AIChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AIChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Form states for manual summary editing
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [editedDateTime, setEditedDateTime] = useState('');
  const [editedPackage, setEditedPackage] = useState('');

  // 1. Heuristics lead data extraction
  const extractLeadInformation = (messages: Message[], session: AIChatSession) => {
    const hasSummary = !!(session.summaryName || session.summaryPhone || session.summaryAddress || session.summaryDateTime || session.summaryPackage);
    
    if (hasSummary) {
      return {
        name: session.summaryName || session.userName || 'Chưa rõ',
        phone: session.summaryPhone || session.userPhone || 'Chưa rõ',
        address: session.summaryAddress || 'Chưa rõ',
        datetime: session.summaryDateTime || 'Chưa rõ',
        servicePackage: session.summaryPackage || 'Chưa rõ',
        isAuto: false
      };
    }

    // Fallback to real-time auto extraction
    let name = session.userName && session.userName !== 'Khách hàng vãng lai' ? session.userName : '';
    let phone = session.userPhone || '';
    let address = '';
    let datetime = '';
    let servicePackage = '';

    for (const m of messages) {
      if (m.role === 'user') {
        const text = m.content;
        
        // Phone extraction (Vietnamese phone regex)
        if (!phone) {
          const phoneRegex = /(?:0|\+84)[35789]\d{8}\b/g;
          const phoneMatch = text.match(phoneRegex);
          if (phoneMatch) {
            phone = phoneMatch[0];
          }
        }

        // Name extraction
        if (!name) {
          const nameKeywords = [
            /tên (?:mình|em|tôi|tớ|khách) là\s+([A-ZÀ-Ỹa-zà-ỹ\s]{2,20})/i,
            /mình là\s+([A-ZÀ-Ỹa-zà-ỹ\s]{2,20})/i,
            /em là\s+([A-ZÀ-Ỹa-zà-ỹ\s]{2,20})/i,
            /tớ là\s+([A-ZÀ-Ỹa-zà-ỹ\s]{2,20})/i,
          ];
          for (const regex of nameKeywords) {
            const match = text.match(regex);
            if (match && match[1]) {
              name = match[1].trim().split(/[.,?!;]/)[0];
              break;
            }
          }
        }

        // Service package selection
        if (!servicePackage) {
          const textLower = text.toLowerCase();
          if (textLower.includes('basic') || textLower.includes('gói 2tr') || textLower.includes('gói 2 triệu')) {
            servicePackage = 'Gói Basic (2.000.000đ)';
          } else if (textLower.includes('premium') || textLower.includes('gói 3.5') || textLower.includes('bán chạy') || textLower.includes('gói 3 triệu rưỡi')) {
            servicePackage = 'Gói Premium (3.500.000đ) ⭐';
          } else if (textLower.includes('luxury') || textLower.includes('gói 5tr') || textLower.includes('gói 5 triệu')) {
            servicePackage = 'Gói Luxury (5.000.000đ)';
          }
        }

        // Address setup extraction
        if (!address) {
          const addressKeywords = [
            /(?:địa chỉ|ở|tại|setup tại|sảnh|nhà hàng|khách sạn)\s+([^.?!,]{5,80})/i,
          ];
          for (const regex of addressKeywords) {
            const match = text.match(regex);
            if (match && match[1]) {
              const potentialAddr = match[1].trim();
              if (potentialAddr && !['đâu', 'nào', 'gì', 'mấy', 'bên', 'được'].some(word => potentialAddr.toLowerCase().includes(word))) {
                address = potentialAddr;
                break;
              }
            }
          }
        }

        // Date extraction
        if (!datetime) {
          const dateKeywords = [
            /(?:ngày|vào ngày|tổ chức ngày|hẹn ngày|tối ngày|chiều ngày)\s+(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/i,
            /(?:ngày)\s+([^.?!,]{4,40})/i,
          ];
          for (const regex of dateKeywords) {
            const match = text.match(regex);
            if (match && match[1]) {
              const potentialDate = match[1].trim();
              if (potentialDate && !['nào', 'gì', 'mấy', 'đó'].some(word => potentialDate.toLowerCase().includes(word))) {
                datetime = potentialDate;
                break;
              }
            }
          }
        }
      }
    }

    return {
      name: name || 'Chưa rõ',
      phone: phone || 'Chưa rõ',
      address: address || 'Chưa rõ',
      datetime: datetime || 'Chưa rõ',
      servicePackage: servicePackage || 'Chưa rõ',
      isAuto: !hasSummary
    };
  };

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
          summaryName: data.summaryName || '',
          summaryPhone: data.summaryPhone || '',
          summaryAddress: data.summaryAddress || '',
          summaryDateTime: data.summaryDateTime || '',
          summaryPackage: data.summaryPackage || '',
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

  // Sync inputs with selected chat session
  useEffect(() => {
    if (!selectedSession) return;
    
    const autoExtracted = extractLeadInformation(selectedSession.messages, selectedSession);
    
    if (!isEditingSummary) {
      setEditedName(selectedSession.summaryName || (autoExtracted.name !== 'Chưa rõ' ? autoExtracted.name : selectedSession.userName));
      setEditedPhone(selectedSession.summaryPhone || (autoExtracted.phone !== 'Chưa rõ' ? autoExtracted.phone : selectedSession.userPhone || ''));
      setEditedAddress(selectedSession.summaryAddress || (autoExtracted.address !== 'Chưa rõ' ? autoExtracted.address : ''));
      setEditedDateTime(selectedSession.summaryDateTime || (autoExtracted.datetime !== 'Chưa rõ' ? autoExtracted.datetime : ''));
      setEditedPackage(selectedSession.summaryPackage || (autoExtracted.servicePackage !== 'Chưa rõ' ? autoExtracted.servicePackage : ''));
    }
  }, [selectedSession?.id, isEditingSummary]);

  // Save manual/auto summary back to firestore
  const handleSaveSummary = async () => {
    if (!selectedSession) return;
    try {
      const docRef = doc(db, 'ai_chats', selectedSession.id);
      await updateDoc(docRef, {
        summaryName: editedName,
        summaryPhone: editedPhone,
        summaryAddress: editedAddress,
        summaryDateTime: editedDateTime,
        summaryPackage: editedPackage,
      });

      setSelectedSession(prev => prev ? {
        ...prev,
        summaryName: editedName,
        summaryPhone: editedPhone,
        summaryAddress: editedAddress,
        summaryDateTime: editedDateTime,
        summaryPackage: editedPackage,
      } : null);

      setIsEditingSummary(false);
      toast.success('Đã lưu tóm tắt sự kiện thành công! ✨');
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi khi lưu tóm tắt sự kiện: ' + err.message);
    }
  };

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

  // Deletion protection status: 24h block from updatedAt
  const getDeletionProtectionStatus = (updatedAtField: any) => {
    if (!updatedAtField) return { isProtected: false, remainingMs: 0, countdownText: '' };
    const updatedAt = parseFirestoreDate(updatedAtField);
    const now = new Date();
    const ageMs = now.getTime() - updatedAt.getTime();
    const PROTECT_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    const remainingMs = PROTECT_DURATION - ageMs;
    const isProtected = remainingMs > 0;

    let countdownText = '';
    if (isProtected) {
      const totalSeconds = Math.floor(remainingMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      countdownText = `${hours}h ${minutes}m`;
    }

    return {
      isProtected,
      remainingMs,
      countdownText
    };
  };

  // 4. Delete session
  const handleDeleteSession = async (e: React.MouseEvent, session: AIChatSession) => {
    e.stopPropagation();

    // Re-verify protection rule
    const status = getDeletionProtectionStatus(session.updatedAt);
    if (status.isProtected) {
      toast.error(`Để phòng ngừa thất lạc lead đột xuất, hệ thống khóa xóa trong 24h đầu. Vui lòng quay lại sau ${status.countdownText}!`, {
        duration: 4000
      });
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn đoạn chat của "${session.userName}" không?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'ai_chats', session.id));
      toast.success('Xóa cuộc hội thoại thành công');
      if (selectedSession?.id === session.id) {
        setSelectedSession(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi khi xóa cuộc hội thoại: ' + err.message);
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
                        {(() => {
                          const status = getDeletionProtectionStatus(session.updatedAt);
                          if (status.isProtected) {
                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.error(`Để phòng ngừa thất lạc lead, hệ thống bảo an cuộc gọi này 24h. Còn lại: ${status.countdownText}`);
                                }}
                                className="p-1 bg-amber-50 border border-amber-200 text-amber-600 rounded-md hover:bg-amber-100 transition-all cursor-not-allowed"
                                title={`Hệ thống bảo vệ lead 24h (Còn lại: ${status.countdownText})`}
                              >
                                <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                              </button>
                            );
                          }
                          return (
                            <button
                              onClick={(e) => handleDeleteSession(e, session)}
                              className="p-1 bg-error-container border border-error/10 text-error hover:bg-error/10 hover:border-error/20 rounded-md transition-all"
                              title="Xóa cuộc hội thoại"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          );
                        })()}
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
            <div className="flex-1 flex flex-col lg:flex-row min-h-0">
              {/* Left Column: Chat Conversation Stream */}
              <div className="flex-1 flex flex-col min-h-0 border-r border-surface-variant/10">
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
                    {(() => {
                      const status = getDeletionProtectionStatus(selectedSession.updatedAt);
                      if (status.isProtected) {
                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.error(`Để bảo mật dữ liệu khách hàng, bạn chỉ có thể xóa hội thoại này sau 24 giờ. Còn lại: ${status.countdownText}`);
                            }}
                            className="p-2 border border-amber-200 bg-amber-50 text-amber-700 rounded-xl cursor-not-allowed flex items-center gap-1.5 text-xs font-semibold"
                            title={`Cuộc gọi được bảo mật chống xóa nhầm. Còn lại: ${status.countdownText}`}
                          >
                            <Clock className="w-4 h-4 animate-pulse text-amber-500" />
                            <span className="hidden sm:inline text-amber-700">Khóa xóa ({status.countdownText})</span>
                          </button>
                        );
                      }
                      return (
                        <button
                          onClick={(e) => handleDeleteSession(e, selectedSession)}
                          className="p-2 border border-error/20 bg-error-container text-error rounded-xl hover:bg-error/10 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Xóa hội thoại</span>
                        </button>
                      );
                    })()}
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

              {/* Right Column: Lead Structured Summary */}
              {(() => {
                const autoExtracted = extractLeadInformation(selectedSession.messages, selectedSession);
                return (
                  <div className="w-full lg:w-[350px] bg-slate-50 p-6 flex flex-col gap-5 overflow-y-auto shrink-0 scrollbar-thin border-t lg:border-t-0 border-surface-variant/10">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                        Tóm tắt sự kiện
                      </h3>
                      {autoExtracted.isAuto ? (
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                          AI trích xuất
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-full">
                          Admin xác nhận
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Thông tin quan trọng được phần mềm phân tích trực tiếp từ nội dung chat. Bạn có thể thay đổi dữ liệu để chuẩn hóa booking.
                    </p>

                    <div className="border-t border-surface-variant/10 my-1" />

                    {isEditingSummary ? (
                      <div className="space-y-4">
                        {/* Editing fields */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Tên khách hàng</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-white border border-surface-variant/20 rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            placeholder="Tên khách hàng"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Số điện thoại</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-white border border-surface-variant/20 rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface"
                            value={editedPhone}
                            onChange={(e) => setEditedPhone(e.target.value)}
                            placeholder="Số điện thoại"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Địa chỉ setup dịch vụ</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-white border border-surface-variant/20 rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface"
                            value={editedAddress}
                            onChange={(e) => setEditedAddress(e.target.value)}
                            placeholder="Ví dụ: Sảnh Gold, Khách sạn Meliá"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Ngày giờ setup</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-white border border-surface-variant/20 rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface"
                            value={editedDateTime}
                            onChange={(e) => setEditedDateTime(e.target.value)}
                            placeholder="Ví dụ: 19:30 ngày 15/06/2026"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Gói dịch vụ đăng ký</label>
                          <select
                            className="w-full px-3 py-2 bg-white border border-surface-variant/20 rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface"
                            value={editedPackage}
                            onChange={(e) => setEditedPackage(e.target.value)}
                          >
                            <option value="">-- Chưa chọn / Chọn gói --</option>
                            <option value="Gói Basic (2.000.000đ)">Gói Basic (2.000.000đ)</option>
                            <option value="Gói Premium (3.500.000đ) ⭐">Gói Premium (3.500.000đ) ⭐</option>
                            <option value="Gói Luxury (5.000.000đ)">Gói Luxury (5.000.000đ)</option>
                          </select>
                          <p className="text-[10px] text-on-surface-variant/60 mt-1">Hoặc tự nhập gói tùy chọn:</p>
                          <input
                            type="text"
                            className="w-full px-3 py-2 mt-1 bg-white border border-surface-variant/20 rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface"
                            value={editedPackage}
                            onChange={(e) => setEditedPackage(e.target.value)}
                            placeholder="Nhập tên gói tự do..."
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setIsEditingSummary(false)}
                            className="flex-1 py-2 bg-white border border-surface-variant/25 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer text-center text-on-surface-variant"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={handleSaveSummary}
                            className="flex-1 py-2 bg-primary text-white hover:bg-primary/95 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Lưu cấu hình
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Display Blocks */}
                        <div className="p-3.5 bg-white border border-surface-variant/5 rounded-2xl flex items-start gap-3 shadow-sm hover:shadow-md transition-all">
                          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-on-surface-variant/60 tracking-wider uppercase block">Tên khách hàng</span>
                            <span className="text-xs font-bold text-on-surface">
                              {autoExtracted.name || 'Chưa cung cấp'}
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 bg-white border border-surface-variant/5 rounded-2xl flex items-start gap-3 shadow-sm hover:shadow-md transition-all">
                          <div className="w-8 h-8 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-on-surface-variant/60 tracking-wider uppercase block">Số điện thoại</span>
                            {autoExtracted.phone && autoExtracted.phone !== 'Chưa rõ' ? (
                              <a href={`tel:${autoExtracted.phone}`} className="text-xs font-bold text-primary hover:underline">
                                {autoExtracted.phone}
                              </a>
                            ) : (
                              <span className="text-xs text-on-surface-variant/60 italic">Chưa xác định</span>
                            )}
                          </div>
                        </div>

                        <div className="p-3.5 bg-white border border-surface-variant/5 rounded-2xl flex items-start gap-3 shadow-sm hover:shadow-md transition-all">
                          <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-on-surface-variant/60 tracking-wider uppercase block">Địa chỉ setup dịch vụ</span>
                            <span className="text-xs font-semibold text-on-surface block break-words">
                              {autoExtracted.address || 'Chưa cung cấp'}
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 bg-white border border-surface-variant/5 rounded-2xl flex items-start gap-3 shadow-sm hover:shadow-md transition-all">
                          <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-on-surface-variant/60 tracking-wider uppercase block">Ngày giờ setup</span>
                            <span className="text-xs font-semibold text-on-surface">
                              {autoExtracted.datetime || 'Chưa cung cấp'}
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 bg-white border border-surface-variant/5 rounded-2xl flex items-start gap-3 shadow-sm hover:shadow-md transition-all">
                          <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                            <Gift className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-on-surface-variant/60 tracking-wider uppercase block">Gói dịch vụ đăng ký</span>
                            <span className="text-xs font-bold text-primary">
                              {autoExtracted.servicePackage || 'Chưa xác định'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setIsEditingSummary(true)}
                          className="w-full mt-2 py-2.5 bg-white border border-surface-variant/15 hover:border-primary/20 hover:text-primary rounded-xl text-xs font-bold text-on-surface transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Chỉnh sửa thông tin lead
                        </button>
                      </div>
                    )}

                    <div className="mt-auto bg-primary/5 rounded-2xl p-4 border border-primary/10">
                      <h4 className="text-xs font-bold text-primary flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        CRM Lead Insights
                      </h4>
                      <p className="text-[10.5px] text-on-surface-variant/90 leading-relaxed mt-1">
                        Hệ thống tự động học từ hội thoại và trích xuất thông tin SĐT, Địa chỉ, Ngày tổ chức và Gói dịch vụ. Bạn có thể sửa thủ công để cập nhật dữ liệu chuẩn xác lên Firestore.
                      </p>
                    </div>
                  </div>
                );
              })()}
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
