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
  Phone,
  ArrowLeft,
  Copy,
  Check,
  Filter,
  X
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

  const [filterType, setFilterType] = useState<'all' | 'unread' | 'has_phone'>('all');
  const [copied, setCopied] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Form states for manual summary editing
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [editedDateTime, setEditedDateTime] = useState('');
  const [editedPackage, setEditedPackage] = useState('');

  // Search keyword highlighter
  const getSessionDisplayName = (session: AIChatSession) => {
    if (session.userName === 'Khách hàng vãng lai') {
      const guestSessions = [...sessions]
        .sort((a, b) => {
          const timeA = parseFirestoreDate(a.updatedAt).getTime();
          const timeB = parseFirestoreDate(b.updatedAt).getTime();
          return timeA - timeB;
        })
        .filter(s => s.userName === 'Khách hàng vãng lai');
      
      const index = guestSessions.findIndex(s => s.id === session.id);
      if (index !== -1) {
        const orderNumber = index + 1;
        const paddedId = String(orderNumber).padStart(6, '0');
        return `Khách vãng lai #${paddedId}`;
      }
      return 'Khách vãng lai #000000';
    }
    return session.userName;
  };

  const highlightText = (text: string, searchWord: string) => {
    if (!searchWord) return <span>{text}</span>;
    const cleanSearch = searchWord.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const parts = text.split(new RegExp(`(${cleanSearch})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === searchWord.toLowerCase() 
            ? <mark key={i} className="bg-[#FFE088] text-[#5C4000] px-1 rounded-sm font-semibold">{part}</mark> 
            : part
        )}
      </span>
    );
  };

  // Double-copy lead to system helper
  const handleCopyAllInfo = (autoExtracted: any) => {
    const textToCopy = `📋 THÔNG TIN KHÁCH HÀNG - LUMIÈRE AI\n` +
      `- Tên khách hàng: ${autoExtracted.name || 'Chưa rõ'}\n` +
      `- Số điện thoại: ${autoExtracted.phone || 'Chưa rõ'}\n` +
      `- Địa chỉ setup: ${autoExtracted.address || 'Chưa rõ'}\n` +
      `- Ngày giờ tổ chức: ${autoExtracted.datetime || 'Chưa rõ'}\n` +
      `- Gói dịch vụ đăng ký: ${autoExtracted.servicePackage || 'Chưa rõ'}`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        toast.success('Đã sao chép thông tin lead vào khay nhớ tạm! 📋');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Error copying:', err);
        toast.error('Không thể sao chép thông tin.');
      });
  };

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
    // A. Filter by tab selector
    if (filterType === 'unread' && !session.unreadByAdmin) {
      return false;
    }
    
    if (filterType === 'has_phone') {
      const info = extractLeadInformation(session.messages, session);
      const hasPhone = !!session.userPhone || !!session.summaryPhone || (info.phone && info.phone !== 'Chưa rõ');
      if (!hasPhone) return false;
    }

    // B. Filter by text search query
    const rawSearch = search.toLowerCase();
    if (!rawSearch) return true;

    return (
      session.userName.toLowerCase().includes(rawSearch) ||
      (session.userEmail && session.userEmail.toLowerCase().includes(rawSearch)) ||
      (session.userPhone && session.userPhone.includes(rawSearch)) ||
      (session.summaryPhone && session.summaryPhone.includes(rawSearch)) ||
      (session.summaryAddress && session.summaryAddress.toLowerCase().includes(rawSearch)) ||
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
      <div className="hidden lg:flex bg-white rounded-3xl p-6 shadow-sm border border-surface-variant/10 flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
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
        <div className={`w-full lg:w-[400px] bg-white rounded-3xl border border-surface-variant/10 shadow-sm flex flex-col overflow-hidden shrink-0 ${selectedSession ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-5 pb-3 border-b border-surface-variant/10 flex flex-col gap-3 shrink-0 bg-[#FBFBFC]">
            {/* Search Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm tên khách, số ĐT, tin nhắn..."
                  className="w-full pl-11 pr-4 py-2.5 bg-white rounded-2xl border border-surface-variant/15 text-xs focus:border-primary/50 focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40 shadow-xs"
                />
              </div>
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="px-3 hover:bg-[#F1F3F5] border border-surface-variant/10 rounded-xl text-xs font-semibold cursor-pointer text-on-surface-variant transition-all shrink-0"
                >
                  Xóa
                </button>
              )}
            </div>

            {/* Visual Tabs */}
            <div className="flex items-center gap-1.5 pt-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setFilterType('all')}
                className={`py-1.5 px-3 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'all'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white text-on-surface-variant border border-surface-variant/10 hover:bg-[#F1F3F5]'
                }`}
              >
                Tất cả ({sessions.length})
              </button>
              <button
                onClick={() => setFilterType('unread')}
                className={`py-1.5 px-3 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  filterType === 'unread'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white text-on-surface-variant border border-surface-variant/10 hover:bg-[#F1F3F5]'
                }`}
              >
                {unreadCount > 0 && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping shrink-0" />}
                Chưa xem ({unreadCount})
              </button>
              <button
                onClick={() => setFilterType('has_phone')}
                className={`py-1.5 px-3 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  filterType === 'has_phone'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-on-surface-variant border border-surface-variant/10 hover:bg-[#F1F3F5]'
                }`}
              >
                SĐT / Lead ({
                  sessions.filter(s => {
                    const info = extractLeadInformation(s.messages, s);
                    return !!s.userPhone || !!s.summaryPhone || (info.phone && info.phone !== 'Chưa rõ');
                  }).length
                })
              </button>
            </div>
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
                const info = extractLeadInformation(session.messages, session);
                const hasPhone = !!session.userPhone || !!session.summaryPhone || (info.phone && info.phone !== 'Chưa rõ');
                const hasPackage = !!session.summaryPackage || (info.servicePackage && info.servicePackage !== 'Chưa rõ');

                return (
                  <div
                    key={session.id}
                    onClick={() => handleSelectSession(session)}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all relative flex flex-col gap-2.5 group ${
                      isSelected 
                        ? 'bg-primary/5 border-primary/35 shadow-xs ring-1 ring-primary/10' 
                        : 'bg-white border-surface-variant/10 hover:bg-slate-50/75 hover:border-surface-variant/20 hover:shadow-xs'
                    }`}
                  >
                    {/* Unread mark */}
                    {session.unreadByAdmin && (
                      <span className="absolute top-4 right-4 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                      }`}>
                        {getSessionDisplayName(session).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-xs text-on-surface truncate pr-2">
                            {getSessionDisplayName(session)}
                          </h4>
                          <span className="text-[9px] font-medium text-on-surface-variant/60 whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded-md shrink-0">
                            {session.messages.length} tin
                          </span>
                        </div>
                        
                        {/* Dynamic status badges inside the card */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {hasPhone ? (
                            <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                              <Phone className="w-2.5 h-2.5" />
                              {session.summaryPhone || session.userPhone || info.phone}
                            </span>
                          ) : (
                            <span className="text-[9px] font-medium text-on-surface-variant/50 bg-slate-50 border border-surface-variant/5 px-1.5 py-0.5 rounded-md">
                              Chưa có SĐT
                            </span>
                          )}

                          {hasPackage && (
                            <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                              <Gift className="w-2.5 h-2.5" />
                              Đăng ký gói
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {lastMsg && (
                      <p className="text-[11px] text-on-surface-variant/75 truncate font-sans bg-[#FAFBFC] group-hover:bg-white p-2 rounded-lg ml-0.5 border border-[#F1F3F5] transition-colors">
                        <span className="font-bold text-[9px] uppercase tracking-wider text-primary mr-1">
                          {lastMsg.role === 'user' ? 'Khách:' : 'AI:'}
                        </span>
                        {lastMsg.content}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-on-surface-variant/50 mt-0.5 pl-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-on-surface-variant/40" />
                        {timeDist}
                      </span>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => toggleReadStatus(e, session)}
                          className="p-1 px-1.5 bg-white border border-surface-variant/15 hover:border-primary/20 hover:text-primary rounded-md text-[9px] flex items-center gap-1 transition-all text-on-surface font-semibold shadow-2xs"
                          title={session.unreadByAdmin ? "Đánh dấu đã đọc" : "Đánh dấu chưa đọc"}
                        >
                          {session.unreadByAdmin ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
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
                                className="p-1 px-1.5 bg-amber-50 border border-amber-200/50 text-amber-600 rounded-md hover:bg-amber-100 transition-all cursor-not-allowed shadow-2xs"
                                title={`Hệ thống bảo vệ lead 24h (Còn lại: ${status.countdownText})`}
                              >
                                <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                              </button>
                            );
                          }
                          return (
                            <button
                              onClick={(e) => handleDeleteSession(e, session)}
                              className="p-1 px-1.5 bg-red-50 border border-red-100 text-red-600 hover:bg-red-100/80 rounded-md transition-all shadow-2xs"
                              title="Xóa cuộc hội thoại"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        <div className={`flex-1 flex flex-col min-h-0 ${selectedSession ? 'flex' : 'hidden lg:flex'}`}>
          {selectedSession ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Back button OUTSIDE the white card on mobile/tablet */}
              <button
                onClick={() => setSelectedSession(null)}
                className="lg:hidden self-start mb-3.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-primary border border-surface-variant/15 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-primary" />
                <span>Quay lại danh sách</span>
              </button>

              <div className="flex-1 bg-white rounded-3xl border border-surface-variant/10 shadow-sm flex flex-col overflow-hidden min-h-0">
                {/* Detail Header */}
                <div className="p-4 sm:p-5 border-b border-surface-variant/10 bg-[#F8F9FA]/30 shrink-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
                    <div className="flex flex-wrap items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {getSessionDisplayName(selectedSession).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-grow sm:flex-initial">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-on-surface truncate">
                            {getSessionDisplayName(selectedSession)}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-on-surface-variant/80 mt-0.5">
                          {selectedSession.userPhone && (
                            <span className="truncate">SĐT: <strong className="text-primary">{selectedSession.userPhone}</strong></span>
                          )}
                          {selectedSession.userEmail && (
                            <span className="truncate">Email: <strong className="text-on-surface">{selectedSession.userEmail}</strong></span>
                          )}
                          <span>Bắt đầu: <em>{format(parseFirestoreDate(selectedSession.updatedAt), 'HH:mm dd/MM/yyyy')}</em></span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Badges / Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* Floating Summary Trigger Button as float modal */}
                      <button
                        onClick={() => {
                          const autoExtracted = extractLeadInformation(selectedSession.messages, selectedSession);
                          setEditedName(selectedSession.summaryName || (autoExtracted.name !== 'Chưa rõ' ? autoExtracted.name : selectedSession.userName));
                          setEditedPhone(selectedSession.summaryPhone || (autoExtracted.phone !== 'Chưa rõ' ? autoExtracted.phone : selectedSession.userPhone || ''));
                          setEditedAddress(selectedSession.summaryAddress || (autoExtracted.address !== 'Chưa rõ' ? autoExtracted.address : ''));
                          setEditedDateTime(selectedSession.summaryDateTime || (autoExtracted.datetime !== 'Chưa rõ' ? autoExtracted.datetime : ''));
                          setEditedPackage(selectedSession.summaryPackage || (autoExtracted.servicePackage !== 'Chưa rõ' ? autoExtracted.servicePackage : ''));
                          setIsEditingSummary(false);
                          setIsSummaryModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer shrink-0"
                        title="Xem tóm tắt cuộc hẹn & thông tin Lead"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                        <span>Tóm tắt & Lead</span>
                      </button>

                      <button
                        onClick={(e) => toggleReadStatus(e, selectedSession)}
                        className="p-1.5 px-3 border border-surface-variant/20 rounded-xl text-xs font-semibold hover:bg-primary/5 hover:text-primary transition-all flex items-center gap-1.5 cursor-pointer text-on-surface-variant bg-white"
                      >
                        {selectedSession.unreadByAdmin ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                            <span>Đã đọc</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
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
                              className="p-1.5 px-3 border border-amber-250/50 bg-amber-50 text-amber-700 rounded-xl cursor-not-allowed flex items-center gap-1.5 text-xs font-semibold font-sans"
                              title={`Cuộc gọi được bảo mật chống xóa nhầm. Còn lại: ${status.countdownText}`}
                            >
                              <Clock className="w-4 h-4 animate-pulse text-amber-500" />
                              <span className="text-amber-700">Khóa xóa (${status.countdownText})</span>
                            </button>
                          );
                        }
                        return (
                          <button
                            onClick={(e) => handleDeleteSession(e, selectedSession)}
                            className="p-1.5 px-3 border border-error/20 bg-error-container text-error rounded-xl hover:bg-error/10 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold font-sans"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Xóa hội thoại</span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Chat Message Stream */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50 scrollbar-thin">
                  {selectedSession.messages.map((msg, idx) => {
                    const isAI = msg.role === 'assistant';
                    return (
                      <div key={idx} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                        {isAI && (
                          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mr-3 self-start shadow-xs">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div className={`max-w-[80%] ${isAI ? 'mr-12' : 'ml-12'}`}>
                          <div 
                            className={`p-4 rounded-2xl relative font-sans text-xs leading-relaxed transition-all ${
                              isAI 
                                ? 'bg-white border border-surface-variant/15 text-on-surface shadow-xs rounded-tl-none' 
                                : 'bg-primary text-white shadow-xs rounded-tr-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{highlightText(msg.content, search)}</p>
                          </div>
                          <span className={`text-[9px] font-semibold text-on-surface-variant/50 mt-1 block px-1.5 tracking-wide ${!isAI && 'text-right'}`}>
                            {isAI ? 'LUMIÈRE AI' : 'KHÁCH HÀNG'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow bg-white rounded-3xl border border-surface-variant/10 shadow-sm flex flex-col items-center justify-center text-center p-8 text-on-surface-variant">
              <Bot className="w-16 h-16 opacity-20 text-primary animate-pulse mb-4" />
              <h3 className="font-bold text-lg text-on-surface">Chưa chọn cuộc hội thoại</h3>
              <p className="text-xs max-w-sm mt-1">
                Hãy lựa chọn một cuộc hội thoại ở danh sách bên trái để đọc chi tiết lịch sử tin nhắn của Lumìere AI với khách hàng.
              </p>
            </div>
          )}
        </div>

      {/* Lead Summary Modal */}
      <AnimatePresence>
        {isSummaryModalOpen && selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSummaryModalOpen(false)}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl border border-surface-variant/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-surface-variant/10 bg-[#FAFBFC] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                      Tóm tắt sự kiện & thông tin Lead
                    </h3>
                    <p className="text-[11px] text-on-surface-variant/80 mt-0.5">
                      Phân tích thông tin khách hàng <span className="font-semibold text-primary">{getSessionDisplayName(selectedSession)}</span> từ cuộc hội thoại AI.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCopyAllInfo(extractLeadInformation(selectedSession.messages, selectedSession))}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs group"
                    title="Sao chép toàn bộ thông tin lead để dán vào CRM/Spreadsheet"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                        <span className="text-emerald-700 font-bold font-sans">Đã sao chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary transition-colors" />
                        <span className="font-sans">Sao chép nhanh Lead</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsSummaryModalOpen(false)}
                    className="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-xl transition-all cursor-pointer shadow-2xs"
                    title="Đóng cửa sổ"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0 bg-white">
                {(() => {
                  const autoExtracted = extractLeadInformation(selectedSession.messages, selectedSession);
                  return (
                    <div className="flex flex-col gap-6">
                      {/* Top banner status row */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <span className="text-[11px] text-slate-500">
                          Bạn có thể trực tiếp đồng bộ thông tin của khách hàng vào CRM.
                        </span>
                        {autoExtracted.isAuto ? (
                          <span className="text-[10px] font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                            AI tự động trích xuất
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-250/30 px-3 py-1.5 rounded-xl">
                            Quản trị viên xác nhận
                          </span>
                        )}
                      </div>

                      {/* Content Section utilizing xl:flex-row for perfect balance */}
                      <div className="flex flex-col md:flex-row gap-6 items-stretch">
                        
                        {/* Active forms/displays */}
                        <div className="flex-grow w-full">
                          {isEditingSummary ? (
                            <div className="space-y-5">
                              {/* Inputs in grid layout */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider block">Tên khách hàng</label>
                                  <input
                                    type="text"
                                    className="w-full px-3.5 py-2.5 bg-white border border-surface-variant/20 rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface font-sans"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    placeholder="Tên khách hàng"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider block">Số điện thoại</label>
                                  <input
                                    type="text"
                                    className="w-full px-3.5 py-2.5 bg-white border border-surface-variant/20 rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface font-sans"
                                    value={editedPhone}
                                    onChange={(e) => setEditedPhone(e.target.value)}
                                    placeholder="Số điện thoại"
                                  />
                                </div>

                                <div className="space-y-1 sm:col-span-2">
                                  <label className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider block">Địa chỉ setup dịch vụ</label>
                                  <input
                                    type="text"
                                    className="w-full px-3.5 py-2.5 bg-white border border-surface-variant/20 rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface font-sans"
                                    value={editedAddress}
                                    onChange={(e) => setEditedAddress(e.target.value)}
                                    placeholder="Ví dụ: Sảnh Gold, Khách sạn Meliá"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider block">Ngày giờ setup</label>
                                  <input
                                    type="text"
                                    className="w-full px-3.5 py-2.5 bg-white border border-surface-variant/20 rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface font-sans"
                                    value={editedDateTime}
                                    onChange={(e) => setEditedDateTime(e.target.value)}
                                    placeholder="Ví dụ: 19:30 ngày 15/06/2026"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider block">Gói dịch vụ đăng ký</label>
                                  <select
                                    className="w-full px-3.5 py-2.5 bg-white border border-surface-variant/20 rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface font-sans"
                                    value={editedPackage}
                                    onChange={(e) => setEditedPackage(e.target.value)}
                                  >
                                    <option value="">-- Chưa chọn / Chọn gói --</option>
                                    <option value="Gói Basic (2.000.000đ)">Gói Basic (2.000.000đ)</option>
                                    <option value="Gói Premium (3.500.000đ) ⭐">Gói Premium (3.500.000đ) ⭐</option>
                                    <option value="Gói Luxury (5.000.000đ)">Gói Luxury (5.000.000đ)</option>
                                  </select>
                                  <input
                                    type="text"
                                    className="w-full px-3.5 py-2.5 bg-white border border-surface-variant/20 rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface font-sans"
                                    value={editedPackage}
                                    onChange={(e) => setEditedPackage(e.target.value)}
                                    placeholder="Hoặc nhập tên gói tự do..."
                                  />
                                </div>
                              </div>

                              <div className="flex gap-2 justify-end pt-2">
                                <button
                                  onClick={() => setIsEditingSummary(false)}
                                  className="px-5 py-2.5 bg-white border border-surface-variant/25 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer text-center text-on-surface-variant transition-all font-sans"
                                >
                                  Hủy
                                </button>
                                <button
                                  onClick={handleSaveSummary}
                                  className="px-5 py-2.5 bg-primary text-white hover:bg-primary/95 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs font-sans"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  Lưu cấu hình
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-5">
                              {/* Grid block displays */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-[#FAFBFC] border border-surface-variant/5 rounded-2xl flex items-start gap-3.5 shadow-xs hover:shadow-md transition-all">
                                  <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                    <UserIcon className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-bold text-on-surface-variant/60 tracking-wider uppercase block">Tên khách hàng</span>
                                    <span className="text-xs font-bold text-on-surface block truncate font-sans">
                                      {autoExtracted.name || 'Chưa cung cấp'}
                                    </span>
                                  </div>
                                </div>

                                <div className="p-4 bg-[#FAFBFC] border border-surface-variant/5 rounded-2xl flex items-start gap-3.5 shadow-xs hover:shadow-md transition-all">
                                  <div className="w-9 h-9 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
                                    <Phone className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-bold text-on-surface-variant/60 tracking-wider uppercase block">Số điện thoại</span>
                                    {autoExtracted.phone && autoExtracted.phone !== 'Chưa rõ' ? (
                                      <a href={`tel:${autoExtracted.phone}`} className="text-xs font-semibold text-primary hover:underline block truncate font-sans">
                                        {autoExtracted.phone}
                                      </a>
                                    ) : (
                                      <span className="text-xs text-on-surface-variant/60 italic block truncate font-sans">Chưa xác định</span>
                                    )}
                                  </div>
                                </div>

                                <div className="p-4 bg-[#FAFBFC] border border-surface-variant/5 rounded-2xl flex items-start gap-3.5 shadow-xs hover:shadow-md transition-all min-w-0 sm:col-span-2">
                                  <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-bold text-on-surface-variant/60 tracking-wider uppercase block">Địa chỉ setup dịch vụ</span>
                                    <span className="text-xs font-semibold text-on-surface block break-words font-sans">
                                      {autoExtracted.address || 'Chưa cung cấp'}
                                    </span>
                                  </div>
                                </div>

                                <div className="p-4 bg-[#FAFBFC] border border-surface-variant/5 rounded-2xl flex items-start gap-3.5 shadow-xs hover:shadow-md transition-all">
                                  <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-bold text-on-surface-variant/60 tracking-wider uppercase block">Ngày giờ setup</span>
                                    <span className="text-xs font-semibold text-on-surface block truncate font-sans">
                                      {autoExtracted.datetime || 'Chưa cung cấp'}
                                    </span>
                                  </div>
                                </div>

                                <div className="p-4 bg-[#FAFBFC] border border-surface-variant/5 rounded-2xl flex items-start gap-3.5 shadow-xs hover:shadow-md transition-all">
                                  <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                                    <Gift className="w-4 h-4 text-purple-500" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-bold text-on-surface-variant/60 tracking-wider uppercase block">Gói đăng ký</span>
                                    <span className="text-xs font-bold text-primary block truncate font-sans">
                                      {autoExtracted.servicePackage || 'Chưa xác định'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setEditedName(autoExtracted.name || '');
                                  setEditedPhone(autoExtracted.phone || '');
                                  setEditedAddress(autoExtracted.address || '');
                                  setEditedDateTime(autoExtracted.datetime || '');
                                  setEditedPackage(autoExtracted.servicePackage || '');
                                  setIsEditingSummary(true);
                                }}
                                className="px-5 py-3 bg-white border border-surface-variant/15 hover:border-primary/20 hover:text-primary rounded-xl text-xs font-bold text-on-surface transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs w-full sm:w-auto font-sans"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Chỉnh sửa thông tin lead
                              </button>
                            </div>
                          )}
                        </div>

                        {/* CRM Insight Sidebar inside modal */}
                        <div className="w-full md:w-[280px] bg-primary/5 rounded-2xl p-5 border border-primary/10 shrink-0 self-stretch flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                              CRM Lead Insights
                            </h4>
                            <p className="text-[10.5px] text-on-surface-variant/90 leading-relaxed mt-2 font-sans">
                              Hệ thống AI tự động học hỏi liên tục qua tiến trình hội thoại với khách hàng để trích xuất thông tin SĐT, Địa chỉ, Ngày tổ chức và Gói mong muốn. Bạn có thể thay đổi dữ liệu thủ công bất kỳ lúc nào để chuẩn hóa tệp khách hàng tuyển dụng.
                            </p>
                          </div>
                          
                          <div className="mt-6 border-t border-primary/10 pt-4 flex flex-col gap-2">
                            <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">Trạng thái đồng bộ</span>
                            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 font-sans">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Sẵn sàng đồng bộ Excel
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
};
