import { motion } from 'motion/react';
import { useBookingModal } from '../context/BookingContext';

export const MobileBookingBar = () => {
  const { openModal } = useBookingModal();

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="md:hidden fixed bottom-0 left-0 w-full glass-card p-4 flex items-center justify-between z-[60] border-t border-white/20 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]"
    >
      <div className="pl-2">
        <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Chỉ từ</p>
        <p className="font-sans font-bold text-xl text-primary tracking-tight">2.000.000đ</p>
      </div>
      
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={openModal}
        className="bg-primary text-on-primary px-10 py-3.5 rounded-full font-bold shadow-lg text-sm"
      >
        Book Now
      </motion.button>
    </motion.div>
  );
};
