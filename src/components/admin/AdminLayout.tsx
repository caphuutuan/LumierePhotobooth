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
  ChevronLeft,
  Menu,
  X,
  Users,
  Bot
} from 'lucide-react';
import { syncUserProfile } from '../../lib/userService';
import toast from 'react-hot-toast';
import { AdminHeader } from './AdminHeader';

export const AdminLayout = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('lumiere_admin_sidebar_collapsed') === 'true';
  });
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebarCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('lumiere_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

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
        fixed inset-y-0 left-0 ${isCollapsed ? 'lg:w-[88px]' : 'lg:w-72'} w-72 bg-white border-r border-[#F1F3F5] flex flex-col h-full z-[70] transition-all duration-300 lg:sticky lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header for Mobile */}
        <div className="p-6 flex items-center justify-between lg:hidden border-b border-surface-variant/10 bg-[#F8F9FA]/50">
          <Link to="/" className="font-sans text-xl text-primary font-bold tracking-tighter">LUMIÈRE</Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 bg-surface-container rounded-xl text-on-surface-variant cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Header for Desktop */}
        <div className={`p-8 hidden lg:flex items-center justify-between border-b border-[#F8F9FA] ${isCollapsed ? 'px-4 py-6 flex-col gap-4' : ''}`}>
          {!isCollapsed ? (
            <div>
              <Link to="/" className="font-sans text-2xl text-primary font-bold tracking-tighter">LUMIÈRE</Link>
              <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mt-1">Admin Panel</p>
            </div>
          ) : (
            <Link to="/" className="font-sans text-2xl text-primary font-black tracking-tighter bg-primary/5 w-11 h-11 rounded-2xl flex items-center justify-center">L</Link>
          )}
          <button
            onClick={toggleSidebarCollapse}
            className={`p-1.5 hover:bg-primary/5 rounded-xl text-primary transition-all cursor-pointer border border-primary/10 hover:border-primary/20 ${isCollapsed ? 'mt-2' : ''}`}
            title={isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-grow px-4 space-y-2 mt-6 lg:mt-5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center transition-all group px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl font-medium ${
                  isCollapsed ? 'lg:px-0 lg:justify-center lg:h-12 lg:w-12 lg:mx-auto' : ''
                } ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-on-surface-variant hover:bg-primary/5 hover:text-primary'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className={`whitespace-nowrap transition-all duration-250 ml-4 opacity-100 ${isCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <ChevronRight className={`w-4 h-4 ml-auto ${isCollapsed ? 'lg:hidden' : 'block'}`} />
                )}
              </Link>
            );
          })}
        </nav>

        <div className={`p-6 border-t border-surface-variant/10 ${isCollapsed ? 'lg:p-3' : ''}`}>
          <div className={`flex items-center gap-4 px-4 py-4 bg-surface-container rounded-2xl mb-4 transition-all ${
            isCollapsed ? 'lg:flex-col lg:gap-2 lg:px-2 lg:py-4 lg:bg-transparent' : ''
          }`}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden shrink-0 border border-primary/15">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div className={`overflow-hidden text-left ${isCollapsed ? 'lg:hidden' : 'block'}`}>
              <p className="text-sm font-bold truncate text-on-surface">{user.displayName || 'Admin'}</p>
              <p className="text-[10px] text-on-surface-variant truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center transition-all px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl font-medium text-error hover:bg-error/5 cursor-pointer ${
              isCollapsed ? 'lg:px-0 lg:justify-center lg:h-12 lg:w-12 lg:mx-auto lg:rounded-2xl' : ''
            }`}
            title={isCollapsed ? "Đăng xuất" : ""}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={`transition-all duration-200 ml-4 opacity-100 ${isCollapsed ? 'lg:hidden lg:w-0 lg:opacity-0' : ''}`}>
              Đăng xuất
            </span>
          </button>
        </div>
      </aside>

      {/* Main Container Right-side */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Dynamic header containing logo, search/actions, real-time unread/appointment notifications, and current online account profile */}
        <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
        
        {/* Main Content Pane */}
        <main className="flex-1 p-6 lg:p-10 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
