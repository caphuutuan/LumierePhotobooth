import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { 
  Search, 
  Trash2, 
  CheckCircle2, 
  Phone, 
  MessageSquare,
  Calendar as CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutList
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
import { vi } from 'date-fns/locale';

export const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // Default 9 to fit 3x3 grid
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: newStatus });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      toast.success(newStatus === 'confirmed' ? 'Đã duyệt lịch đặt' : 'Đã chuyển về chờ xử lý');
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'bookings', id));
      setBookings(prev => prev.filter(b => b.id !== id));
      toast.success('Đã xoá lịch đặt thành công');
      setDeletingId(null);
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi xoá lịch đặt');
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'all' || b.status === filter;
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (b.phone && b.phone.includes(searchTerm)) || 
                          (b.email && b.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredBookings.slice(startIndex, startIndex + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getBookingsForDay = (day: Date) => {
    return bookings.filter(b => {
      try {
        const bookingDate = parseISO(b.date);
        return isSameDay(bookingDate, day);
      } catch (e) {
        return false;
      }
    });
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-2 lg:px-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-sans font-bold text-primary tracking-tight">Lịch đặt hẹn</h1>
          <p className="text-on-surface-variant text-sm lg:text-base">Quản lý và tương tác với các yêu cầu từ khách hàng.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:gap-4">
          <div className="flex p-1 bg-surface-container rounded-2xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'
              }`}
              title="Danh sách"
            >
              <LayoutList className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'calendar' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'
              }`}
              title="Lịch"
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..."
              className="pl-12 pr-6 py-3 bg-white border border-surface-variant/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 w-48 lg:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex p-1 bg-surface-container rounded-2xl overflow-x-auto no-scrollbar max-w-full">
            {['all', 'new', 'confirmed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 lg:px-4 py-2 rounded-xl text-[10px] lg:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                {f === 'all' ? 'Tất cả' : f === 'new' ? 'Mới' : 'Đã duyệt'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="bg-white rounded-[24px] lg:rounded-[40px] border border-surface-variant/10 shadow-sm overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[600px]">
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-on-surface-variant font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="p-6 lg:p-10">
            {filteredBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center px-4">
                <div className="w-16 lg:w-20 h-16 lg:h-20 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant mb-6">
                  <CalendarIcon className="w-8 lg:w-10 h-8 lg:h-10" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold mb-2">Không tìm thấy yêu cầu</h3>
                <p className="text-on-surface-variant text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {paginatedBookings.map((booking) => (
                    <motion.div
                      key={booking.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-surface-container/30 p-6 lg:p-8 rounded-[24px] lg:rounded-[32px] border border-surface-variant/10 relative group hover:bg-white hover:shadow-xl transition-all"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] lg:text-[10px] font-bold uppercase tracking-wide inline-block whitespace-nowrap ${
                          booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                          booking.status === 'new' ? 'bg-amber-100 text-amber-700' : 'bg-surface-variant text-on-surface-variant'
                        }`}>
                          {booking.status === 'confirmed' ? 'Đã duyệt' : 'Chờ xử lý'}
                        </span>
                        <button 
                          onClick={() => setDeletingId(booking.id)}
                          className="p-2 text-on-surface-variant hover:text-error lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-base lg:text-lg font-bold">{booking.name}</h3>
                          <p className="text-primary text-sm lg:text-base font-bold">{booking.phone}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-variant/10">
                          <div>
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Ngày dự kiến</p>
                            <p className="text-xs lg:text-sm font-medium">{booking.date}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Gói dịch vụ</p>
                            <p className="text-xs lg:text-sm font-bold text-primary">{booking.packagePlan || 'Basic'}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Loại sự kiện</p>
                          <p className="text-xs lg:text-sm font-medium">{booking.eventType || 'N/A'}</p>
                        </div>

                        {booking.message && (
                          <div className="pt-2">
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Lời nhắn</p>
                            <p className="text-xs lg:text-sm line-clamp-3 italic text-on-surface/80 bg-surface-container-low p-3 rounded-xl border border-surface-variant/5">
                              "{booking.message}"
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-8 grid grid-cols-2 gap-2 lg:gap-3">
                        {booking.status === 'new' ? (
                          <button 
                            onClick={() => updateStatus(booking.id, 'confirmed')}
                            className="col-span-2 bg-primary text-white py-3 rounded-2xl text-[10px] lg:text-sm font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Duyệt lịch đặt
                          </button>
                        ) : (
                          <button 
                             onClick={() => updateStatus(booking.id, 'new')}
                             className="col-span-2 border border-primary/20 text-primary py-3 rounded-2xl text-[10px] lg:text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-all"
                          >
                            <X className="w-4 h-4" />
                            Bỏ duyệt
                          </button>
                        )}
                        <a 
                          href={`tel:${booking.phone}`}
                          className="bg-white border border-surface-variant/20 py-3 rounded-xl text-[10px] lg:text-xs font-bold flex items-center justify-center gap-2 hover:bg-surface-container transition-all"
                        >
                          <Phone className="w-3 h-3" /> Gọi
                        </a>
                        <a 
                          href={`https://zalo.me/${booking.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white border border-surface-variant/20 py-3 rounded-xl text-[10px] lg:text-xs font-bold flex items-center justify-center gap-2 hover:bg-surface-container transition-all"
                        >
                          <MessageSquare className="w-3 h-3" /> Zalo
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination Controls */}
              {filteredBookings.length > 0 && (
                <div className="mt-8 lg:mt-12 flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-surface-variant/10">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-on-surface-variant">Hiển thị</span>
                    <select 
                      className="bg-surface-container px-3 lg:px-4 py-2 rounded-xl text-[10px] lg:text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={6}>6 mục</option>
                      <option value={9}>9 mục</option>
                      <option value={15}>15 mục</option>
                      <option value={30}>30 mục</option>
                    </select>
                    <span className="text-[10px] lg:text-xs text-on-surface-variant">
                      trong tổng số <strong>{filteredBookings.length}</strong> lịch
                    </span>
                  </div>

                  <div className="flex items-center gap-1 lg:gap-2">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="p-2 lg:p-3 bg-surface-container rounded-xl disabled:opacity-30 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                    >
                      <ChevronLeft className="w-4 lg:w-5 h-4 lg:h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1 px-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          const maxVisible = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5;
                          if (totalPages <= maxVisible) return true;
                          return Math.abs(page - currentPage) <= (typeof window !== 'undefined' && window.innerWidth < 640 ? 0 : 1) || page === 1 || page === totalPages;
                        })
                        .map((page, i, arr) => {
                          const showEllipsis = i > 0 && page - arr[i-1] > 1;
                          return (
                            <div key={page} className="flex items-center gap-0.5 lg:gap-1">
                              {showEllipsis && <span className="text-on-surface-variant px-1 lg:px-2">...</span>}
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl text-[10px] lg:text-xs font-bold transition-all ${
                                  currentPage === page 
                                  ? 'bg-primary text-white shadow-lg' 
                                  : 'hover:bg-primary/5 hover:text-primary'
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          );
                        })
                      }
                    </div>

                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="p-2 lg:p-3 bg-surface-container rounded-xl disabled:opacity-30 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                    >
                      <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
        ) : (
          <div className="p-6 lg:p-10 flex flex-col h-full uppercase-first">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 lg:gap-6 mb-8">
              <h2 className="text-xl lg:text-2xl font-bold font-sans text-primary capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: vi })}
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 lg:p-3 bg-surface-container rounded-xl lg:rounded-2xl hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-4 lg:px-6 py-2 lg:py-3 bg-surface-container rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-bold uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                >
                  Hôm nay
                </button>
                <button 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 lg:p-3 bg-surface-container rounded-xl lg:rounded-2xl hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar rounded-[20px] lg:rounded-[32px] border border-surface-variant/10">
              <div className="grid grid-cols-7 gap-px lg:gap-px bg-surface-variant/10 min-w-[700px]">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                  <div key={day} className="bg-surface-container/10 py-4 lg:py-5 text-center text-[10px] lg:text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, i) => {
                  const dayBookings = getBookingsForDay(day);
                  const isCurMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div 
                      key={i} 
                      onClick={() => {
                        if (dayBookings.length > 0) setSelectedDay(day);
                      }}
                      className={`min-h-[120px] lg:min-h-[160px] p-2 lg:p-4 bg-white transition-all hover:bg-primary/5 group relative border-t border-l border-surface-variant/10 cursor-pointer ${
                        !isCurMonth ? 'bg-surface-container/5 opacity-40' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 lg:mb-3">
                        <span className={`text-[10px] lg:text-sm font-black w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center rounded-full ${
                          isToday ? 'bg-primary text-white shadow-lg' : 'text-on-surface-variant/60'
                        }`}>
                          {format(day, 'd')}
                        </span>
                      </div>

                      <div className="space-y-1 lg:space-y-1.5">
                        {dayBookings.slice(0, 3).map(b => (
                          <div 
                            key={b.id} 
                            className={`text-[8px] lg:text-[10px] p-1 lg:p-2 rounded-lg lg:rounded-xl truncate border flex items-center gap-1 lg:gap-2 group/item transition-all ${
                              b.status === 'confirmed' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'
                            }`}
                            title={`${b.name} - ${b.eventType}`}
                          >
                            <div className={`w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full shrink-0 ${b.status === 'confirmed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                            <span className="font-bold truncate">{b.name}</span>
                          </div>
                        ))}
                        {dayBookings.length > 3 && (
                          <div className="text-[7px] lg:text-[9px] font-black text-primary text-center bg-primary/5 py-1 rounded-lg border border-primary/10 uppercase">
                            + {dayBookings.length - 3} Yêu cầu
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedDay && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] lg:z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full lg:max-w-md bg-white z-[80] lg:z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 lg:p-8 border-b border-surface-variant/10 flex items-center justify-between">
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-primary">Lịch hẹn {format(selectedDay, 'dd/MM/yyyy')}</h2>
                  <p className="text-on-surface-variant text-xs lg:text-sm">{getBookingsForDay(selectedDay).length} yêu cầu được tìm thấy</p>
                </div>
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="p-3 bg-surface-container rounded-2xl hover:bg-error/10 hover:text-error transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
                {getBookingsForDay(selectedDay).map((booking) => (
                  <div key={booking.id} className="bg-surface-container/30 p-5 lg:p-6 rounded-[24px] lg:rounded-3xl border border-surface-variant/10 relative">
                     <div className="flex justify-between items-start mb-4">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-wider ${
                          booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.status === 'confirmed' ? 'Đã duyệt' : 'Chờ xử lý'}
                        </span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => updateStatus(booking.id, booking.status === 'confirmed' ? 'new' : 'confirmed')}
                            className="p-1.5 lg:p-2 bg-white rounded-lg border border-surface-variant/10 hover:text-primary transition-all shadow-sm"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => setDeletingId(booking.id)}
                            className="p-1.5 lg:p-2 bg-white rounded-lg border border-surface-variant/10 hover:text-error transition-all shadow-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-bold text-sm lg:text-base">{booking.name}</h4>
                        <div className="flex items-center gap-3 text-xs lg:text-sm">
                          <span className="text-primary font-bold">{booking.phone}</span>
                          <span className="w-1 h-1 bg-surface-variant/30 rounded-full" />
                          <span className="text-on-surface-variant whitespace-nowrap">{booking.packagePlan}</span>
                        </div>
                        <p className="text-[10px] lg:text-xs bg-white/50 p-3 rounded-xl border border-surface-variant/10 italic text-on-surface-variant">
                          "{booking.message || 'Không có lời nhắn'}"
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <a 
                          href={`tel:${booking.phone}`}
                          className="bg-primary text-white py-2 lg:py-2.5 rounded-xl text-[9px] lg:text-[10px] font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                        >
                          <Phone className="w-3 h-3" /> Gọi điện
                        </a>
                        <a 
                          href={`https://zalo.me/${booking.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white border border-primary/20 text-primary py-2 lg:py-2.5 rounded-xl text-[9px] lg:text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-all"
                        >
                          <MessageSquare className="w-3 h-3" /> Zalo
                        </a>
                      </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingId(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-[32px] p-8 z-[101] shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold mb-2">Xoá lịch đặt này?</h2>
              <p className="text-on-surface-variant text-sm mb-8 px-4">
                Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xoá lịch đặt của <strong>{bookings.find(b => b.id === deletingId)?.name}</strong>?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setDeletingId(null)}
                  className="py-4 rounded-2xl bg-surface-container text-on-surface font-bold hover:bg-surface-variant/20 transition-all"
                >
                  Huỷ
                </button>
                <button 
                  onClick={() => deletingId && deleteBooking(deletingId)}
                  className="py-4 rounded-2xl bg-error text-white font-bold hover:shadow-lg hover:shadow-error/20 transition-all"
                >
                  Xác nhận xoá
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
