import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
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
import { getAllUsers, updateUserRole, UserProfile, ROLE_LEVELS, UserRole, MASTER_EMAIL } from '../../lib/userService';
import { auth } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const currentUser = auth.currentUser;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách người dùng. Vui lòng kiểm tra quyền hạn.');
    } finally {
      setLoading(false);
    }
  };
  
  // High-performance hierarchy check
  const getPermissionContext = (targetUser: UserProfile) => {
    const me = users.find(u => u.uid === currentUser?.uid);
    if (!me) return { canManage: false };

    const myLevel = ROLE_LEVELS[me.role] || 0;
    const targetLevel = ROLE_LEVELS[targetUser.role] || 0;

    // Master can manage all except self
    if (me.role === 'master' || me.email === MASTER_EMAIL) {
      return { 
        canManage: me.uid !== targetUser.uid,
        isMaster: true 
      };
    }

    // Admins can only manage:
    // 1. Users with strictly lower levels
    // 2. Users they actually created/granted permissions to
    const isCreator = targetUser.grantedBy === me.uid;
    const isLowerLevel = myLevel > targetLevel;
    
    return {
      canManage: isLowerLevel && isCreator,
      isMaster: false
    };
  };

  const handleSetRole = async (targetUserId: string, newRole: UserRole) => {
    const targetUser = users.find(u => u.uid === targetUserId);
    if (!targetUser || !currentUser) return;

    const { canManage } = getPermissionContext(targetUser);
    
    if (!canManage) {
      toast.error('Bạn không có thẩm quyền điều chỉnh người dùng này');
      return;
    }

    const myProfile = users.find(u => u.uid === currentUser.uid);
    const myRole = myProfile?.role || 'user';
    const isMaster = myRole === 'master' || myProfile?.email === MASTER_EMAIL;

    if (ROLE_LEVELS[newRole] >= ROLE_LEVELS[myRole] && !isMaster) {
      toast.error('Bạn không thể cấp quyền cao hơn hoặc bằng cấp bậc của chính mình');
      return;
    }

    setUpdatingId(targetUserId);
    try {
      await updateUserRole(targetUserId, newRole, currentUser.uid);
      setUsers(prev => prev.map(u => u.uid === targetUserId ? { ...u, role: newRole, grantedBy: currentUser.uid } : u));
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
            {filteredUsers.map((user) => {
              const { canManage } = getPermissionContext(user);
              const granter = users.find(u => u.uid === user.grantedBy);

              return (
              <motion.div 
                key={user.uid}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-8 rounded-[32px] border border-surface-variant/10 shadow-sm relative group hover:shadow-md transition-all overflow-hidden"
              >
                {/* Role Badge Indicator */}
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-[100px] -mr-10 -mt-10 group-hover:scale-110 transition-transform ${
                  user.role === 'master' ? 'bg-error' : user.role === 'admin' ? 'bg-primary' : 'bg-on-surface-variant'
                }`} />

                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-6 h-6 text-on-surface-variant" />
                    )}
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                    user.role === 'master' ? 'bg-error text-white' : 
                    user.role === 'admin' ? 'bg-primary text-white' : 
                    'bg-surface-container text-on-surface-variant'
                  }`}>
                    {user.role === 'master' && <ShieldAlert className="w-3 h-3" />}
                    {user.role}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Link 
                      to={`/admin/customers/${user.uid}`}
                      className="text-lg font-bold truncate hover:text-primary transition-colors block"
                    >
                      {user.displayName || 'Khách hàng'}
                    </Link>
                    <p className="text-xs text-on-surface-variant font-bold truncate opacity-60 tracking-wider uppercase mb-0.5">{user.role}</p>
                    <p className="text-sm text-primary font-bold truncate">{user.email || 'N/A'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-surface-variant/10">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1 opacity-40">Gia nhập</p>
                      <p className="text-xs font-bold">{user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy') : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1 opacity-40">Cấp quyền bởi</p>
                      <p className="text-xs font-bold truncate text-primary">{granter ? granter.displayName : 'SYSTEM'}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-3">
                       <Shield className="w-3 h-3" /> Quản trị quyền hạn
                    </div>
                    
                    {updatingId === user.uid ? (
                      <div className="flex items-center justify-center py-2">
                        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : !canManage ? (
                      <div className="p-3 bg-surface-container/50 rounded-xl border border-dashed border-surface-variant/20 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest italic">Quyền hạn bị khóa</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          className="w-full bg-surface-container border-none rounded-xl py-2 px-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                          value={user.role}
                          onChange={(e) => handleSetRole(user.uid, e.target.value as UserRole)}
                        >
                          {Object.keys(ROLE_LEVELS).map(role => (
                            <option key={role} value={role} disabled={role === 'master'}>
                              {role.toUpperCase()}
                            </option>
                          ))}
                        </select>
                        <button 
                          onClick={() => handleSetRole(user.uid, 'user')}
                          className="flex items-center justify-center gap-2 text-[10px] font-bold px-3 py-2 bg-error/5 text-error rounded-xl hover:bg-error/10 transition-all uppercase tracking-widest"
                        >
                          Gỡ quyền
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )})}
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
