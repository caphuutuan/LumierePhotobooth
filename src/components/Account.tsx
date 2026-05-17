import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Settings, 
  Calendar, 
  LogOut, 
  Phone, 
  Mail, 
  Clock, 
  UserCircle,
  Home,
  ChevronLeft,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { syncUserProfile, updateUserProfile, UserProfile } from '../lib/userService';
import toast from 'react-hot-toast';

export const Account = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    email: '',
    phone: ''
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
      const userProfile = await syncUserProfile(currentUser);
      setProfile(userProfile);
      setEditForm({
        displayName: userProfile?.displayName || currentUser.displayName || '',
        email: userProfile?.email || currentUser.email || '',
        phone: userProfile?.phone || currentUser.phoneNumber || ''
      });
      await fetchUserBookings(currentUser, userProfile);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserBookings = async (currentUser: any, userProfile: any) => {
    try {
      const bookingsRef = collection(db, 'bookings');
      
      // We'll perform two queries: one by userId (most reliable) and one by email (for legacy/guest bookings)
      const qByUserId = query(
        bookingsRef,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const email = userProfile?.email || currentUser.email;
      const qByEmail = query(
        bookingsRef,
        where('email', '==', email || '---'),
        orderBy('createdAt', 'desc')
      );

      const [snapUserId, snapEmail] = await Promise.all([
        getDocs(qByUserId),
        getDocs(qByEmail)
      ]);

      const bookingMap = new Map();
      
      snapEmail.docs.forEach(doc => {
        bookingMap.set(doc.id, { id: doc.id, ...doc.data() });
      });

      snapUserId.docs.forEach(doc => {
        bookingMap.set(doc.id, { id: doc.id, ...doc.data() });
      });

      const sortedBookings = Array.from(bookingMap.values()).sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      setBookings(sortedBookings);
    } catch (err) {
      console.error("Booking fetch error:", err);
    }
  };

  const isGoogleUser = user?.providerData.some((provider: any) => provider.providerId === 'google.com');

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Update Firebase Auth display name if changed
      if (editForm.displayName !== user.displayName) {
        await updateProfile(user, { displayName: editForm.displayName });
      }

      // Update Firestore profile
      await updateUserProfile(user.uid, {
        displayName: editForm.displayName,
        email: editForm.email,
        phone: editForm.phone
      });

      setProfile(prev => prev ? { ...prev, ...editForm } : null);
      setIsEditing(false);
      toast.success('Đã cập nhật thông tin thành công');
    } catch (err: any) {
      toast.error('Lỗi khi cập nhật: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Đã đăng xuất');
      navigate('/');
    } catch (err: any) {
      toast.error('Lỗi: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-40 px-6 flex flex-col items-center justify-center">
         <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-4" />
         <p className="text-on-surface-variant font-medium">Đang tải tài khoản...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-5xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all font-bold group"
        >
          <div className="p-2 bg-surface-container rounded-xl group-hover:bg-primary/5">
            <ChevronLeft className="w-5 h-5" />
          </div>
          Trang chủ
        </Link>
        <div className="flex gap-3">
          {profile?.role === 'admin' && (
            <Link 
              to="/admin"
              className="flex items-center gap-2 px-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-bold hover:bg-primary hover:text-white transition-all text-sm"
            >
              <Settings className="w-4 h-4" /> Quản trị
            </Link>
          )}
        </div>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 lg:p-10 rounded-[40px] border border-surface-variant/10 shadow-sm relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl lg:shrink-0">
             {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
                <UserCircle className="w-12 h-12 text-primary/40" />
             )}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-sans font-bold text-primary">
              {profile?.displayName || user.displayName || 'Khách hàng'}
            </h1>
            <p className="text-on-surface-variant flex items-center gap-2 text-sm lg:text-base mt-1">
               <Mail className="w-4 h-4 opacity-40" /> {profile?.email || user.email || 'Chưa cập nhật email'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-3 bg-error/5 text-error border border-error/10 rounded-2xl font-bold hover:bg-error transition-all hover:text-white text-sm"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              Lịch đặt hẹn của tôi
            </h2>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black uppercase">
              {bookings.length} Lịch
            </span>
          </div>

          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="bg-white p-12 rounded-[32px] border border-surface-variant/10 text-center space-y-4">
                <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto text-on-surface-variant">
                   <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-on-surface-variant font-medium">Bạn chưa có lịch hẹn nào được ghi nhận.</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">Các lịch hẹn bạn đặt bằng email {user.email} sẽ xuất hiện tại đây.</p>
                </div>
                <button 
                   onClick={() => navigate('/')} 
                   className="mt-4 bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:shadow-lg transition-all"
                >
                  Đặt lịch ngay
                </button>
              </div>
            ) : (
              bookings.map((booking) => (
                <motion.div 
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-[24px] border border-surface-variant/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                       }`}>
                          {booking.status === 'confirmed' ? 'Đã duyệt' : 'Chờ xử lý'}
                       </span>
                       <span className="text-xs text-on-surface-variant flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 opacity-40" /> {booking.date}
                       </span>
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{booking.eventType || 'Dịch vụ Photobooth'}</h3>
                    <div className="flex items-center gap-2">
                       <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest">Gói dịch vụ:</p>
                       <strong className="text-sm text-primary">{booking.packagePlan}</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-surface-container/50 p-4 rounded-2xl md:border-l border-surface-variant/10">
                    <div>
                       <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1 opacity-60">Mã xác nhận</p>
                       <p className="text-xs font-mono font-bold tracking-wider">#{booking.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              Thông tin hồ sơ
            </h2>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 bg-surface-container rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-surface-variant/10 shadow-sm space-y-6">
             {isEditing ? (
               <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Họ và tên</label>
                    <input 
                      type="text"
                      className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                      value={editForm.displayName}
                      onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                      Email {isGoogleUser && "(Đã liên kết với Google)"}
                    </label>
                    <input 
                      type="email"
                      disabled={isGoogleUser}
                      className={`w-full bg-surface-container-low border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 ${isGoogleUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Số điện thoại</label>
                    <input 
                      type="tel"
                      className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-3 pt-4">
                   <button 
                     onClick={() => setIsEditing(false)}
                     className="flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-container text-on-surface font-bold text-sm hover:bg-surface-variant/20 transition-all"
                   >
                     <X className="w-4 h-4" /> Hủy
                   </button>
                   <button 
                     disabled={saving}
                     onClick={handleSaveProfile}
                     className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50"
                   >
                     {saving ? (
                       <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                     ) : (
                       <Save className="w-4 h-4" />
                     )}
                     Lưu
                   </button>
                 </div>
               </div>
             ) : (
               <div className="space-y-6">
                 <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Số điện thoại</p>
                    <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
                       <Phone className="w-4 h-4 text-primary opacity-40" />
                       <span className="font-bold text-sm">{profile?.phone || 'Chưa cập nhật'}</span>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email liên hệ</p>
                    <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3 overflow-hidden">
                       <Mail className="w-4 h-4 text-primary opacity-40 shrink-0" />
                       <span className="font-bold text-sm truncate">{profile?.email || 'Chưa cập nhật'}</span>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-surface-variant/10">
                    <p className="text-xs text-on-surface-variant italic leading-relaxed">
                       Nếu cần thay đổi các thông tin bảo mật quan trọng, vui lòng liên hệ hotline Lumière để được xác minh.
                    </p>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
