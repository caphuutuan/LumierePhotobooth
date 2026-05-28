import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Image as ImageIcon, 
  LogOut, 
  User,
  Settings,
  ChevronRight,
  Menu,
  X,
  Users,
  Bot
} from 'lucide-react';
import { syncUserProfile } from '../../lib/userService';
import toast from 'react-hot-toast';

export const AdminLayout = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/admin/login');
      } else {
        const userProfile = await syncUserProfile(user);
        const isAdminRole = userProfile && ['master', 'admin', 'moderator', 'editor', 'staff'].includes(userProfile.role);
        
        if (!isAdminRole) {
          toast.error('Bạn không có quyền truy cập trang quản trị');
          navigate('/');
          return;
        }
        setUser(user);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
    { icon: CalendarCheck, label: 'Lịch đặt hẹn', path: '/admin/bookings' },
    { icon: Bot, label: 'Hội thoại AI', path: '/admin/ai-chats' },
    { icon: ImageIcon, label: 'Quản lý nội dung', path: '/admin/content' },
    { icon: Users, label: 'Người dùng & Quyền', path: '/admin/users' },
    { icon: Settings, label: 'Cài đặt site', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-surface-variant/20 px-6 py-4 flex items-center justify-between sticky top-0 z-[60]">
        <Link to="/" className="font-sans text-xl text-primary font-bold tracking-tighter">LUMIÈRE</Link>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-surface-container rounded-xl text-primary hover:bg-primary/5 transition-all"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[65] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white border-r border-surface-variant/20 flex flex-col h-full z-[70] transition-transform duration-300 lg:sticky lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header for Mobile */}
        <div className="p-6 flex items-center justify-between lg:hidden border-b border-surface-variant/10">
          <Link to="/" className="font-sans text-xl text-primary font-bold tracking-tighter">LUMIÈRE</Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 bg-surface-container rounded-xl text-on-surface-variant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 hidden lg:block">
          <Link to="/" className="font-sans text-2xl text-primary font-bold tracking-tighter">LUMIÈRE</Link>
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mt-1">Admin Panel</p>
        </div>

        <nav className="flex-grow px-4 space-y-2 mt-6 lg:mt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-medium transition-all group ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-on-surface-variant hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-surface-variant/10">
          <div className="flex items-center gap-4 px-4 py-4 bg-surface-container rounded-2xl mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden shrink-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.displayName || 'Admin'}</p>
              <p className="text-[10px] text-on-surface-variant truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-medium text-error hover:bg-error/5 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 lg:p-10 w-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};
