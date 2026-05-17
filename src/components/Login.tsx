import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogIn, 
  Mail, 
  Phone, 
  User, 
  ArrowRight, 
  ChevronLeft, 
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { syncUserProfile } from '../lib/userService';
import toast from 'react-hot-toast';

type LoginMethod = 'choice' | 'email-login' | 'email-register' | 'phone' | 'otp';

export const Login = () => {
  const [method, setMethod] = useState<LoginMethod>('choice');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    otp: ''
  });
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await syncUserProfile(result.user);
      toast.success('Chào mừng bạn ' + result.user.displayName);
      navigate('/');
    } catch (error: any) {
      toast.error('Đăng nhập thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      await syncUserProfile(result.user);
      toast.success('Đăng nhập thành công');
      navigate('/');
    } catch (error: any) {
      toast.error('Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(result.user, { displayName: formData.name });
      await syncUserProfile({ ...result.user, displayName: formData.name });
      toast.success('Đăng ký thành công');
      navigate('/');
    } catch (error: any) {
      toast.error('Lỗi đăng ký: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) return;
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible'
    });
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setupRecaptcha();
      const verifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formData.phone, verifier);
      setConfirmationResult(result);
      setMethod('otp');
      toast.success('Mã OTP đã được gửi');
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(formData.otp);
      await syncUserProfile(result.user);
      toast.success('Xác nhận thành công');
      navigate('/');
    } catch (error: any) {
      toast.error('Mã OTP không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-[#F8F9FA] flex items-center justify-center">
      <div id="recaptcha-container"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-primary/5 p-8 lg:p-12 border border-surface-variant/10 relative overflow-hidden"
      >
        <Link to="/" className="absolute top-8 right-8 p-2 bg-surface-container rounded-full text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all">
          <X className="w-5 h-5" />
        </Link>

        <AnimatePresence mode="wait">
          {method === 'choice' && (
            <motion.div 
              key="choice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-sans font-bold tracking-tighter text-primary">Khám phá Lumière</h1>
                <p className="text-on-surface-variant">Đăng nhập để theo dõi lịch hẹn và ưu đãi.</p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-4 bg-white border border-surface-variant/20 p-4 rounded-2xl font-bold hover:bg-surface-container transition-all group"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  Tiếp tục với Google
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-surface-variant/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest text-on-surface-variant bg-white px-4">
                    Hoặc dùng Email
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setMethod('email-login')}
                    className="flex flex-col items-center gap-3 p-6 bg-surface-container/50 rounded-3xl border border-surface-variant/10 hover:bg-primary hover:text-white transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:bg-white/20">
                      <LogIn className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold">Đăng nhập</span>
                  </button>
                  <button 
                    onClick={() => setMethod('email-register')}
                    className="flex flex-col items-center gap-3 p-6 bg-surface-container/50 rounded-3xl border border-surface-variant/10 hover:bg-primary hover:text-white transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:bg-white/20">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold">Đăng ký</span>
                  </button>
                </div>

                <button 
                  onClick={() => setMethod('phone')}
                  className="w-full flex items-center justify-center gap-3 bg-surface-container py-4 rounded-2xl text-sm font-bold hover:bg-primary/5 hover:text-primary transition-all"
                >
                  <Phone className="w-4 h-4" /> Đăng nhập bằng số điện thoại
                </button>
              </div>

              <div className="pt-8 border-t border-surface-variant/10">
                <Link 
                  to="/admin/login" 
                  className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-all"
                >
                  <ShieldCheck className="w-4 h-4" /> Bảng điều khiển quản trị
                </Link>
              </div>
            </motion.div>
          )}

          {(method === 'email-login' || method === 'email-register') && (
            <motion.div 
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <button 
                onClick={() => setMethod('choice')}
                className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Quay lại
              </button>

              <div>
                <h2 className="text-2xl font-sans font-bold tracking-tight text-primary">
                  {method === 'email-login' ? 'Mừng trở lại!' : 'Tạo tài khoản mới'}
                </h2>
                <p className="text-on-surface-variant mt-2 text-sm">
                  {method === 'email-login' ? 'Nhập thông tin truy cập của bạn.' : 'Bắt đầu hành trình cùng Lumière.'}
                </p>
              </div>

              <form onSubmit={method === 'email-login' ? handleEmailLogin : handleEmailRegister} className="space-y-4">
                {method === 'email-register' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Họ và tên</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Nguyễn Văn A" 
                      className="w-full bg-surface-container border-none p-4 rounded-2xl focus:ring-2 focus:ring-primary/20"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email</label>
                  <input 
                    required
                    type="email" 
                    placeholder="email@example.com" 
                    className="w-full bg-surface-container border-none p-4 rounded-2xl focus:ring-2 focus:ring-primary/20"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Mật khẩu</label>
                  <input 
                    required
                    type="password" 
                    placeholder="********" 
                    className="w-full bg-surface-container border-none p-4 rounded-2xl focus:ring-2 focus:ring-primary/20"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý...' : method === 'email-login' ? 'Đăng nhập' : 'Đăng ký'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}

          {method === 'phone' && (
            <motion.div 
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <button 
                onClick={() => setMethod('choice')}
                className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Quay lại
              </button>

              <div>
                <h2 className="text-2xl font-sans font-bold tracking-tight text-primary">Sử dụng Số điện thoại</h2>
                <p className="text-on-surface-variant mt-2 text-sm">Chúng tôi sẽ gửi mã OTP để xác nhận chính chủ.</p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Số điện thoại (đã có mã vùng)</label>
                  <input 
                    required
                    type="tel" 
                    placeholder="+84 900 000 000" 
                    className="w-full bg-surface-container border-none p-4 rounded-2xl focus:ring-2 focus:ring-primary/20"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Đang gửi mã...' : 'Gửi mã xác nhận'}
                  <Phone className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}

          {method === 'otp' && (
            <motion.div 
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <button 
                onClick={() => setMethod('phone')}
                className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Quay lại
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                  <Mail className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-sans font-bold tracking-tight text-primary">Nhập mã OTP</h2>
                <p className="text-on-surface-variant mt-2 text-sm">
                  Mã xác nhận đã được gửi đến số <br />
                  <strong className="text-primary">{formData.phone}</strong>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="flex justify-center">
                  <input 
                    required
                    type="text" 
                    maxLength={6}
                    placeholder="123456" 
                    className="w-48 bg-surface-container border-none p-4 rounded-2xl focus:ring-2 focus:ring-primary/20 text-center text-2xl font-bold tracking-[0.5em]"
                    value={formData.otp}
                    onChange={(e) => setFormData({...formData, otp: e.target.value})}
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Đang xác minh...' : 'Xác nhận đăng nhập'}
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
