import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { motion } from 'motion/react';
import { LogIn, ShieldCheck } from 'lucide-react';

export const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'caphuutuan1@gmail.com') {
        navigate('/admin');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email !== 'caphuutuan1@gmail.com') {
        await auth.signOut();
        setError('Bạn không có quyền truy cập trang quản trị.');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      setError('Đã xảy ra lỗi khi đăng nhập.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[32px] shadow-2xl p-10 text-center"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-8">
          <ShieldCheck className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-sans font-bold text-primary mb-2">Quản trị Lumière</h1>
        <p className="text-on-surface-variant mb-10">Đăng nhập để quản lý lịch hẹn và nội dung website</p>

        {error && (
          <div className="bg-error/10 text-error p-4 rounded-xl mb-8 text-sm font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Đăng nhập bằng Google
            </>
          )}
        </button>
        
        <p className="mt-8 text-xs text-on-surface-variant leading-relaxed">
          Chỉ tài khoản admin được cấp quyền mới có thể truy cập.<br/>
          Hệ thống được bảo mật bởi Google Firebase.
        </p>
      </motion.div>
    </div>
  );
};
