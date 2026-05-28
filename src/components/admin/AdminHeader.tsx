import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Menu, 
  X, 
  Check, 
  ExternalLink, 
  Inbox, 
  Calendar, 
  Sparkles, 
  Clock, 
  LogOut, 
  User as UserIcon, 
  Bot, 
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface AdminHeaderProps {
  user: any;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ user, onMenuClick, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [unreadChats, setUnreadChats] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // 1. Subscribe to Bookings and filter for 'new'
  useEffect(() => {
    const qBookings = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubscribeBookings = onSnapshot(qBookings, (snapshot) => {
      const bList: any[] = [];
      snapshot.forEach((d) => {
        bList.push({ id: d.id, ...d.data() });
      });
      setBookings(bList);
    }, (err) => {
      console.error('Error listening to bookings:', err);
    });

    return () => unsubscribeBookings();
  }, []);

  // 2. Subscribe to AI Chats with unread status
  useEffect(() => {
    const qChats = query(collection(db, 'ai_chats'), orderBy('updatedAt', 'desc'));
    const unsubscribeChats = onSnapshot(qChats, (snapshot) => {
      const allChats: any[] = [];
      snapshot.forEach((d) => {
        allChats.push({ id: d.id, ...d.data() });
      });
      
      const unreadList = allChats
        .filter(chat => chat.unreadByAdmin === true)
        .map(chat => ({
          ...chat,
          allChats // Inject full chats to map sequence index
        }));
      setUnreadChats(unreadList);
    }, (err) => {
      console.error('Error listening to unread AI chats:', err);
    });

    return () => unsubscribeChats();
  }, []);

  const getChatDisplayName = (chat: any) => {
    const userName = chat.userName || 'Khách hàng vãng lai';
    if (userName === 'Khách hàng vãng lai') {
      const allChats = chat.allChats || [];
      const guestChats = [...allChats]
        .sort((a, b) => {
          const getMs = (field: any) => {
            if (!field) return 0;
            if (field.seconds) return field.seconds * 1000;
            if (field.toDate) return field.toDate().getTime();
            return new Date(field).getTime() || 0;
          };
          return getMs(a.updatedAt) - getMs(b.updatedAt);
        })
        .filter(s => (s.userName || 'Khách hàng vãng lai') === 'Khách hàng vãng lai');
      
      const index = guestChats.findIndex(s => s.id === chat.id);
      if (index !== -1) {
        const orderNumber = index + 1;
        const paddedId = String(orderNumber).padStart(6, '0');
        return `Khách vãng lai #${paddedId}`;
      }
      return 'Khách vãng lai #000000';
    }
    return userName;
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const newBookings = bookings.filter(b => b.status === 'new');
  const totalNotificationsCount = newBookings.length + unreadChats.length;

  const handleApproveBooking = async (e: React.MouseEvent, bookingId: string) => {
    e.stopPropagation();
    try {
      const docRef = doc(db, 'bookings', bookingId);
      await updateDoc(docRef, { status: 'confirmed' });
      toast.success('Đã duyệt thành công lịch hẹn này! ✅');
    } catch (err: any) {
      console.error('Cant approve from header:', err);
      toast.error('Có lỗi xảy ra: ' + err.message);
    }
  };

  const handleMarkChatRead = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    try {
      const docRef = doc(db, 'ai_chats', chatId);
      await updateDoc(docRef, { unreadByAdmin: false });
      toast.success('Đã đánh dấu là đã xem cuộc hội thoại! 👍');
    } catch (err: any) {
      console.error('Cant mark read from header:', err);
      toast.error('Có lỗi xảy ra: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  // Get dynamic greeting message based on local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Chào đêm muộn,';
    if (hour < 11) return 'Chào buổi sáng,';
    if (hour < 14) return 'Chào buổi trưa,';
    if (hour < 18) return 'Chào buổi chiều,';
    return 'Chào buổi tối,';
  };

  return (
    <header className="bg-white border-b border-surface-variant/10 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-xs">
      {/* Left side: Brand or Greeting */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2.5 bg-[#F8F9FA] rounded-xl text-primary hover:bg-primary/5 transition-all outline-none"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand visual (Mobile only) */}
        <div className="lg:hidden">
          <Link to="/" className="font-sans text-lg text-primary font-black tracking-tighter">LUMIÈRE</Link>
        </div>

        {/* Desktop Breadcrumbs/Greeting */}
        <div className="hidden lg:block">
          <span className="text-[10px] font-bold text-primary/70 tracking-widest uppercase block mb-0.5">
            Không gian làm việc
          </span>
          <h2 className="text-sm font-bold text-on-surface flex items-center gap-1.5 font-sans">
            {getGreeting()} <span className="text-primary font-semibold">{user?.displayName || 'Quản trị viên'}</span>
            <span className="animate-pulse">👋</span>
          </h2>
        </div>
      </div>

      {/* Right side Actions (Time, Notifications Bell, Avatar) */}
      <div className="flex items-center gap-4">
        
        {/* Bell Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2.5 rounded-2xl border transition-all relative flex items-center justify-center outline-none ${
              showNotifications 
                ? 'bg-primary/5 border-primary/20 text-primary' 
                : 'bg-white border-surface-variant/15 text-on-surface-variant hover:bg-[#F8F9FA] hover:text-on-surface'
            }`}
            title="Thông báo hệ thống"
          >
            <Bell className={`w-[18px] h-[18px] ${totalNotificationsCount > 0 ? 'animate-bounce text-primary' : ''}`} />
            
            {/* Visual Red Pulse badge */}
            {totalNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[9px] font-black leading-none text-white shadow-sm animate-pulse">
                {totalNotificationsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Cards */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="fixed sm:absolute right-4 sm:right-0 top-[76px] sm:top-auto mt-3 w-[calc(100vw-32px)] sm:w-96 bg-white rounded-3xl border border-surface-variant/15 shadow-xl overflow-hidden z-50 flex flex-col"
              >
                {/* Header */}
                <div className="px-5 py-4 bg-slate-50 border-b border-surface-variant/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 bg-primary/10 rounded-full text-[10px] font-bold text-primary">
                      {totalNotificationsCount} chưa xử lý
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-on-surface-variant">Thông Báo Thời Gian Thực</span>
                </div>

                {/* Content Stream */}
                <div className="max-h-[350px] overflow-y-auto scrollbar-thin divide-y divide-surface-variant/5">
                  {totalNotificationsCount === 0 ? (
                    <div className="p-8 text-center py-16 flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface">Mọi việc đã hoàn tất!</p>
                        <p className="text-[11px] text-on-surface-variant/70 mt-1 max-w-[200px] mx-auto">
                          Không có lịch hẹn mới hay chat khách hàng chưa đọc.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Section 1: New Bookings */}
                      {newBookings.length > 0 && (
                        <div className="p-2.5 bg-[#ffe088]/5">
                          <span className="text-[9px] font-bold text-[#d4af37] px-2.5 uppercase tracking-wider block mb-1">
                            Lịch đặt hẹn mới ({newBookings.length})
                          </span>
                          {newBookings.map((b) => (
                            <div 
                              key={b.id} 
                              onClick={() => {
                                navigate('/admin/bookings');
                                setShowNotifications(false);
                              }}
                              className="p-3 rounded-2xl hover:bg-white transition-all border border-transparent hover:border-[#ffe088]/20 cursor-pointer mb-1"
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                  <Calendar className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 flex-grow">
                                  <div className="flex justify-between items-center bg-transparent mt-0.5">
                                    <p className="text-xs font-bold text-on-surface truncate">{b.name}</p>
                                    <span className="text-[10px] text-on-surface-variant/60">
                                      {b.createdAt?.seconds 
                                        ? formatDistanceToNow(new Date(b.createdAt.seconds * 1000), { addSuffix: true, locale: vi })
                                        : 'Vừa xong'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-1">
                                    Gói: <strong className="text-primary">{b.packagePlan}</strong> • Loại: {b.eventType}
                                  </p>
                                  <p className="text-[10px] text-on-surface-variant/70 italic mt-0.5 break-all">
                                    SĐT: {b.phone}
                                  </p>
                                  
                                  {/* Quick Approve Action */}
                                  <div className="flex justify-end gap-1.5 mt-2.5">
                                    <button
                                      onClick={(e) => handleApproveBooking(e, b.id)}
                                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-[9px] flex items-center gap-1 transition-all shadow-xs"
                                      title="Phê duyệt ngay lập tức"
                                    >
                                      <Check className="w-2.5 h-2.5" /> Duyệt nhanh
                                    </button>
                                    <button 
                                      onClick={() => navigate('/admin/bookings')}
                                      className="px-2 py-1 bg-white border border-surface-variant/20 hover:bg-slate-100 text-on-surface-variant font-bold rounded-lg text-[9px]"
                                    >
                                      Chi tiết
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Section 2: Unread AI Customer Chats */}
                      {unreadChats.length > 0 && (
                        <div className="p-2.5 bg-primary/5">
                          <span className="text-[9px] font-bold text-primary/80 px-2.5 uppercase tracking-wider block mb-1">
                            Hội thoại AI mới ({unreadChats.length})
                          </span>
                          {unreadChats.map((c) => (
                            <div 
                              key={c.id} 
                              onClick={() => {
                                navigate('/admin/ai-chats');
                                setShowNotifications(false);
                              }}
                              className="p-3 rounded-2xl hover:bg-white transition-all border border-transparent hover:border-primary/10 cursor-pointer mb-1"
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 flex-grow">
                                  <div className="flex justify-between items-center bg-transparent mt-0.5">
                                    <p className="text-xs font-bold text-on-surface truncate">{getChatDisplayName(c)}</p>
                                    <span className="text-[10px] text-on-surface-variant/60">
                                      {c.updatedAt?.seconds 
                                        ? formatDistanceToNow(new Date(c.updatedAt.seconds * 1000), { addSuffix: true, locale: vi })
                                        : 'Mới cập nhật'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-1">
                                    Tin nhắn cuối: <em className="text-on-surface-variant/80">"{c.messages?.[c.messages.length - 1]?.content || ''}"</em>
                                  </p>
                                  {c.userPhone && (
                                    <p className="text-[10px] text-primary font-bold mt-0.5">SĐT: {c.userPhone}</p>
                                  )}
                                  
                                  {/* Actions */}
                                  <div className="flex justify-end gap-1.5 mt-2.5">
                                    <button
                                      onClick={(e) => handleMarkChatRead(e, c.id)}
                                      className="px-2.5 py-1 bg-[#1aa3ff] hover:bg-[#0088e6] text-white font-bold rounded-lg text-[9px] flex items-center gap-1 transition-all shadow-xs"
                                    >
                                      Đã xem
                                    </button>
                                    <button 
                                      onClick={() => navigate('/admin/ai-chats')}
                                      className="px-2 py-1 bg-white border border-surface-variant/20 hover:bg-slate-100 text-on-surface-variant font-bold rounded-lg text-[9px]"
                                    >
                                      Chat live
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Footer view-all */}
                <div className="p-3 bg-slate-50 border-t border-surface-variant/10 text-center">
                  <button 
                    onClick={() => {
                      navigate('/admin/bookings');
                      setShowNotifications(false);
                    }}
                    className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Đến sảnh đặt hẹn <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Account Info Selector */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 pr-3 hover:bg-[#F8F9FA] rounded-2xl border border-surface-variant/15 transition-all text-left outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 border border-primary/20">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
              ) : (
                <span>{user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}</span>
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] font-bold leading-none text-on-surface">{user?.displayName || 'Admin'}</p>
              <p className="text-[9px] text-[#22c55e] font-black mt-0.5 uppercase tracking-wider">Đang online</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant/70 shrink-0 hidden sm:block" />
          </button>

          {/* Account Profile Popover Dropdown */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-3 w-64 bg-white rounded-3xl border border-surface-variant/15 shadow-xl overflow-hidden z-50 p-2.5"
              >
                {/* Popover Title info */}
                <div className="p-3 bg-slate-50/70 rounded-2xl mb-1.5">
                  <p className="text-xs font-bold text-on-surface">{user?.displayName || 'Quản trị viên'}</p>
                  <p className="text-[10px] text-on-surface-variant truncate mt-0.5">{user?.email}</p>
                  <div className="mt-2.5 flex items-center gap-1.5 bg-white border border-emerald-100 rounded-lg py-1 px-2.5 w-fit">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Active Workspace</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <button 
                    onClick={() => {
                      navigate('/');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-primary/5 hover:text-primary text-xs font-semibold text-on-surface-variant transition-all flex items-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-on-surface-variant/70" />
                    <span>Xem trang chính</span>
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/admin/settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-primary/5 hover:text-primary text-xs font-semibold text-on-surface-variant transition-all flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-on-surface-variant/70" />
                    <span>Hồ sơ website</span>
                  </button>
                  
                  <div className="border-t border-surface-variant/10 my-1 px-1" />

                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-error/5 hover:text-error text-xs font-semibold text-error transition-all flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
