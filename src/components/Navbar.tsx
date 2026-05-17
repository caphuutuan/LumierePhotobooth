import { motion } from 'motion/react';
import { Menu, X, User, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NAV_LINKS } from '../constants';
import { useBookingModal } from '../context/BookingContext';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { openModal } = useBookingModal();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface-bright/80 backdrop-blur-xl border-b border-white/10 shadow-sm h-20">
      <div className="flex justify-between items-center px-6 md:px-20 h-full max-w-7xl mx-auto">
        <Link 
          to="/"
          className="font-sans text-2xl tracking-tighter text-primary font-bold"
        >
          LUMIÈRE 
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a 
              key={link.href}
              href={link.href}
              className="text-on-surface-variant hover:text-primary transition-colors font-medium text-sm"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            {user ? (
              <Link 
                to="/account"
                className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full text-xs font-bold hover:bg-primary/5 hover:text-primary transition-all"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-5 h-5 rounded-full" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                Tài khoản
              </Link>
            ) : (
              <Link 
                to="/login"
                className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all text-xs font-bold uppercase tracking-widest px-4 py-2"
              >
                <LogIn className="w-4 h-4" /> Đăng nhập
              </Link>
            )}
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openModal}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Book Now
          </motion.button>
          
          <button 
            className="md:hidden text-on-surface"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-20 left-0 w-full bg-surface-bright border-b border-surface-variant p-6 space-y-4 shadow-xl"
        >
          {NAV_LINKS.map((link) => (
            <a 
              key={link.href}
              href={link.href}
              className="block text-on-surface-variant font-bold py-2 border-b border-surface-variant/5"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            {user ? (
              <Link 
                to="/account"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 bg-surface-container py-3 rounded-2xl font-bold text-sm text-primary"
              >
                <User className="w-4 h-4" /> Tài khoản của tôi
              </Link>
            ) : (
              <Link 
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 bg-surface-container py-3 rounded-2xl font-bold text-sm"
              >
                <LogIn className="w-4 h-4" /> Đăng nhập / Đăng ký
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};
