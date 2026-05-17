import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NAV_LINKS } from '../constants';
import { useBookingModal } from '../context/BookingContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { openModal } = useBookingModal();

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface-bright/80 backdrop-blur-xl border-b border-white/10 shadow-sm h-20">
      <div className="flex justify-between items-center px-6 md:px-20 h-full max-w-7xl mx-auto">
        <motion.a 
          href="#"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-sans text-2xl tracking-tighter text-primary font-bold"
        >
          LUMIÈRE 
        </motion.a>
        
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
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openModal}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary/90 transition-all"
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
          className="md:hidden absolute top-20 left-0 w-full bg-surface-bright border-b border-surface-variant p-6 space-y-4"
        >
          {NAV_LINKS.map((link) => (
            <a 
              key={link.href}
              href={link.href}
              className="block text-on-surface-variant font-medium py-2"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </motion.div>
      )}
    </nav>
  );
};
