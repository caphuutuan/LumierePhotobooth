import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Shield, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { UserProfile } from '../../lib/userService';
import toast from 'react-hot-toast';

export const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
       fetchCustomerData();
    }
  }, [id]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      // 1. Try to fetch as a User Profile (UID)
      const userDoc = await getDoc(doc(db, 'users', id!));
      let customerEmail = '';
      let customerPhone = id!; // Default to ID if it's a phone number

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        setProfile(userData);
        customerEmail = userData.email || '';
        customerPhone = userData.phone || '';
      }

      // 2. Fetch all bookings related to this customer (by userId, phone, or email)
      const bookingsRef = collection(db, 'bookings');
      
      const queries = [
        query(bookingsRef, where('userId', '==', id)),
        query(bookingsRef, where('phone', '==', customerPhone)),
      ];

      if (customerEmail) {
        queries.push(query(bookingsRef, where('email', '==', customerEmail)));
      }

      const snapshots = await Promise.all(queries.map(q => getDocs(q)));
      const bookingMap = new Map();
      
      snapshots.forEach(snapshot => {
        snapshot.docs.forEach(doc => {
          bookingMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
      });

      const sortedBookings = Array.from(bookingMap.values()).sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });

      setBookings(sortedBookings);

    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải thông tin khách hàng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button 
          onClick={() => navigate('/admin')} 
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all font-bold group w-fit"
        >
          <div className="p-2 bg-white rounded-xl border border-surface-variant/10 group-hover:bg-primary/5">
            <ChevronLeft className="w-5 h-5" />
          </div>
          Quay lại
        </button>

        <div className="flex gap-3">
          {profile?.phone && (
            <a href={`tel:${profile.phone}`} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl font-bold hover:shadow-lg transition-all text-sm">
              <Phone className="w-4 h-4" /> Gọi khách hàng
            </a>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-surface-variant/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[80px] -mr-8 -mt-8" />
            
            <div className="relative z-10 space-y-6">
              <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-md mx-auto mb-4">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-primary/20" />
                )}
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-primary truncate">
                  {profile?.displayName || bookings[0]?.name || 'Khách hàng ẩn danh'}
                </h2>
                <div className="inline-block mt-2 px-3 py-1 bg-surface-container rounded-full text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                   {profile?.role || 'Guest'}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-surface-variant/10 font-bold">
                <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-3 text-on-surface-variant opacity-60">
                      <Phone className="w-4 h-4" /> Số điện thoại
                   </div>
                   <span className="text-primary">{profile?.phone || bookings[0]?.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-3 text-on-surface-variant opacity-60">
                      <Mail className="w-4 h-4" /> Email
                   </div>
                   <span className="text-primary font-bold ml-4 break-all text-right">{profile?.email || bookings[0]?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-3 text-on-surface-variant opacity-60">
                      <Shield className="w-4 h-4" /> UID
                   </div>
                   <span className="text-xs font-mono opacity-40 break-all text-right ml-4">{id}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-3 text-on-surface-variant opacity-60">
                      <Calendar className="w-4 h-4" /> Gia nhập
                   </div>
                   <span>{profile?.createdAt ? format(new Date(profile.createdAt), 'dd/MM/yyyy') : 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                 <a 
                   href={`https://zalo.me/${profile?.phone || bookings[0]?.phone}`}
                   target="_blank"
                   rel="noreferrer"
                   className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-surface-container hover:bg-primary/5 text-primary font-bold text-xs transition-all border border-transparent hover:border-primary/20"
                 >
                   <MessageSquare className="w-4 h-4" /> Zalo
                 </a>
                 <button className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-surface-container hover:bg-primary/5 text-primary font-bold text-xs transition-all border border-transparent hover:border-primary/20">
                   <ExternalLink className="w-4 h-4" /> Profile
                 </button>
              </div>
            </div>
          </div>

          <div className="bg-primary p-8 rounded-[32px] text-white shadow-xl shadow-primary/20">
             <h3 className="text-lg font-bold mb-6 opacity-80 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-5 h-5" /> Ghi chú quản trị
             </h3>
             <textarea 
               placeholder="Nhập ghi chú quan trọng về khách hàng này..."
               className="w-full bg-white/10 border-none rounded-2xl p-4 text-sm font-medium placeholder:text-white/30 focus:ring-2 focus:ring-white/20 min-h-[150px] resize-none"
             />
             <button className="w-full mt-4 bg-white text-primary font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all">
                Lưu ghi chú
             </button>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              Lịch sử đặt hẹn ({bookings.length})
            </h2>
          </div>

          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="bg-white p-20 rounded-[40px] border border-surface-variant/10 text-center">
                <Calendar className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
                <p className="text-on-surface-variant font-medium">Khách hàng này chưa có lịch sử đặt hẹn.</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <motion.div 
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 lg:p-8 rounded-[32px] border border-surface-variant/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                       }`}>
                          {booking.status === 'confirmed' ? 'Đã duyệt' : 'Chờ xử lý'}
                       </span>
                       <span className="text-xs text-on-surface-variant flex items-center gap-1 font-bold">
                          <Clock className="w-3.5 h-3.5 opacity-40" /> {booking.date}
                       </span>
                    </div>
                    <Link to="/admin/bookings" className="block">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{booking.eventType || 'Dịch vụ Photobooth'}</h3>
                    </Link>
                    <div className="flex items-center gap-2">
                       <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest opacity-60">Gói:</p>
                       <strong className="text-sm text-primary">{booking.packagePlan}</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 bg-surface-container/30 px-6 py-4 rounded-2xl md:border-l border-surface-variant/10">
                    <div>
                       <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1 opacity-60">Mã xác nhận</p>
                       <p className="text-xs font-mono font-bold tracking-wider text-primary">#{booking.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1 opacity-60">Action</p>
                        <button className="p-1.5 hover:text-primary transition-colors">
                           <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
