import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { motion } from 'motion/react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    newBookings: 0,
    confirmedBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentBookings(bookings);

        // Simple aggregation for now
        const allSnapshot = await getDocs(collection(db, 'bookings'));
        const all = allSnapshot.docs.map(doc => doc.data());
        setStats({
          totalBookings: all.length,
          newBookings: all.filter((b: any) => b.status === 'new').length,
          confirmedBookings: all.filter((b: any) => b.status === 'confirmed').length,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'dashboard_stats');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return recentBookings.slice(startIndex, startIndex + pageSize);
  }, [recentBookings, currentPage, pageSize]);

  const totalPages = Math.ceil(recentBookings.length / pageSize);

  const statCards = [
    { label: 'Tổng lịch đặt', value: stats.totalBookings, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Lịch mới', value: stats.newBookings, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Đã xác nhận', value: stats.confirmedBookings, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Tỉ lệ chốt', value: '85%', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-6 lg:space-y-10">
      <header>
        <h1 className="text-2xl lg:text-3xl font-sans font-bold text-primary">Chào mừng trở lại!</h1>
        <p className="text-on-surface-variant text-sm lg:text-base">Dưới đây là tổng quan hoạt động kinh doanh của Lumière hôm nay.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 lg:p-8 rounded-[24px] lg:rounded-[32px] border border-surface-variant/10 shadow-sm"
          >
            <div className={`w-10 h-10 lg:w-12 lg:h-12 ${stat.bg} ${stat.color} rounded-xl lg:rounded-2xl flex items-center justify-center mb-4 lg:mb-6`}>
              <stat.icon className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <p className="text-on-surface-variant text-xs lg:text-sm font-medium">{stat.label}</p>
            <div className="flex items-end justify-between mt-1 lg:mt-2">
              <p className="text-2xl lg:text-3xl font-bold">{stat.value}</p>
              <span className="text-emerald-600 text-[10px] lg:text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                +12% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg lg:text-xl font-bold flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              Lịch đặt gần đây
            </h2>
            <button className="text-primary text-xs lg:text-sm font-bold hover:underline">Xem tất cả</button>
          </div>

          <div className="bg-white rounded-[24px] lg:rounded-[32px] border border-surface-variant/10 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-surface-container/30">
                    <th className="px-4 lg:px-6 py-4 text-[10px] lg:text-xs font-bold uppercase tracking-wider text-on-surface-variant">Khách hàng</th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] lg:text-xs font-bold uppercase tracking-wider text-on-surface-variant">Ngày tiệc</th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] lg:text-xs font-bold uppercase tracking-wider text-on-surface-variant">Sự kiện</th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] lg:text-xs font-bold uppercase tracking-wider text-on-surface-variant">Gói</th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] lg:text-xs font-bold uppercase tracking-wider text-on-surface-variant">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/10">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-on-surface-variant">Đang tải dữ liệu...</td>
                    </tr>
                  ) : recentBookings.length === 0 ? (
                     <tr>
                      <td colSpan={5} className="p-10 text-center text-on-surface-variant">Chưa có lịch đặt nào.</td>
                    </tr>
                  ) : (
                    paginatedBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-primary/5 transition-colors">
                        <td className="px-4 lg:px-6 py-4">
                          <p className="font-bold text-xs lg:text-sm">{booking.name}</p>
                          <p className="text-[10px] lg:text-xs text-on-surface-variant">{booking.phone}</p>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-on-surface-variant">{booking.date}</td>
                        <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-on-surface-variant font-medium">{booking.eventType || 'N/A'}</td>
                        <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm font-bold text-primary">{booking.packagePlan || 'Basic'}</td>
                        <td className="px-4 lg:px-6 py-4">
                          <span className={`px-2 lg:px-3 py-1 rounded-full text-[9px] lg:text-[10px] font-bold uppercase tracking-wide inline-block whitespace-nowrap ${
                            booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                            booking.status === 'new' ? 'bg-amber-100 text-amber-700' : 'bg-surface-variant text-on-surface-variant'
                          }`}>
                            {booking.status === 'confirmed' ? 'Xác nhận' : 'Chờ xử lý'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Simple Pagination Footer for Dashboard */}
            {recentBookings.length > 0 && (
              <div className="px-4 lg:px-6 py-4 bg-surface-container/10 border-t border-surface-variant/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <select 
                    className="bg-white border border-surface-variant/20 px-2 py-1 rounded-lg text-[10px] font-bold focus:outline-none"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={5}>5 dòng</option>
                    <option value={10}>10 dòng</option>
                    <option value={20}>20 dòng</option>
                  </select>
                  <span className="text-[10px] text-on-surface-variant font-medium">Trang {currentPage} / {totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-1.5 bg-white border border-surface-variant/20 rounded-lg disabled:opacity-30 hover:bg-primary/5 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-1.5 bg-white border border-surface-variant/20 rounded-lg disabled:opacity-30 hover:bg-primary/5 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications/Alerts */}
        <div className="space-y-6 px-2 lg:px-0">
          <h2 className="text-lg lg:text-xl font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-primary" />
            Thông báo hệ thống
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-5 lg:p-6 rounded-[20px] lg:rounded-[24px] border border-surface-variant/10 shadow-sm">
              <p className="text-[10px] text-on-surface-variant mb-1">Hôm nay, 09:30 AM</p>
              <p className="text-xs lg:text-sm font-medium">Bạn có 3 lịch đặt mới chưa xử lý.</p>
            </div>
            <div className="bg-white p-5 lg:p-6 rounded-[20px] lg:rounded-[24px] border border-surface-variant/10 shadow-sm">
              <p className="text-[10px] text-on-surface-variant mb-1">Hôm nay, 08:00 AM</p>
              <p className="text-xs lg:text-sm font-medium">Sao lưu dữ liệu định kỳ thành công.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
