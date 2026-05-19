import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Shield, 
  ShieldAlert, 
  User as UserIcon, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { getAllUsers, updateUserRole, UserProfile } from '../../lib/userService';
import { auth } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const AdminUsers = () => {
  const [users, setUsers] = useState<(UserProfile & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const currentUser = auth.currentUser;
  const isCurrentUserMaster = currentUser?.email === 'caphuutuan1@gmail.com';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    if (userId === currentUser?.uid) {
      toast.error('Bạn không thể tự thay đổi quyền của chính mình');
      return;
    }

    if (currentRole === 'admin' && !isCurrentUserMaster) {
      toast.error('Chỉ Master Owner mới có quyền gỡ bỏ quyền Admin');
      return;
    }

    setUpdatingId(userId);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`Đã cập nhật quyền thành ${newRole.toUpperCase()}`);
    } catch (err) {
      toast.error('Lỗi khi cập nhật quyền');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-sans font-bold text-primary tracking-tight">Người dùng & Quyền hạn</h1>
          <p className="text-on-surface-variant">Quản lý danh sách người dùng và phân quyền hệ thống.</p>
        </div>

        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm kiếm người dùng..." 
            className="w-full bg-white border border-surface-variant/20 rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-[40px] border border-surface-variant/10">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-on-surface-variant font-medium">Đang tải người dùng...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredUsers.map((user) => (
              <motion.div 
                key={user.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-8 rounded-[32px] border border-surface-variant/10 shadow-sm relative group hover:shadow-md transition-all overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -mr-10 -mt-10 group-hover:scale-110 transition-transform" />

                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-6 h-6 text-on-surface-variant" />
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    user.role === 'admin' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {user.role}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold truncate">{user.displayName || 'Chưa đặt tên'}</h3>
                    <p className="text-sm text-primary font-bold truncate">{user.email || 'N/A'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-surface-variant/10">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">Số điện thoại</p>
                      <p className="text-xs font-medium">{user.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">Tham gia</p>
                      <p className="text-xs font-medium">{user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy') : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                       <Shield className="w-3 h-3" /> Quyền truy cập
                    </div>
                    {updatingId === user.id ? (
                      <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    ) : user.email === 'caphuutuan1@gmail.com' ? (
                      <span className="text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg">
                        MASTER OWNER
                      </span>
                    ) : user.id === currentUser?.uid ? (
                      <span className="text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg">
                        BẠN (ADMIN)
                      </span>
                    ) : user.role === 'admin' && !isCurrentUserMaster ? (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant bg-surface-container px-3 py-1 rounded-lg">
                        <Shield className="w-3 h-3" /> ADMIN
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleToggleRole(user.id, user.role)}
                        className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                          user.role === 'admin' 
                            ? 'text-error hover:bg-error/10' 
                            : 'text-primary hover:bg-primary/10'
                        }`}
                      >
                        {user.role === 'admin' ? (
                          <>
                            <XCircle className="w-4 h-4" /> Gỡ Admin
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-4 h-4" /> Nâng Admin
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredUsers.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-[40px] border border-surface-variant/10 text-center">
              <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6 text-on-surface-variant">
                <Users className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">Không tìm thấy người dùng</h3>
              <p className="text-on-surface-variant">Thử từ khóa tìm kiếm khác của bạn.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
