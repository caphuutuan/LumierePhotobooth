import { motion } from 'motion/react';
import { Calendar, Smile } from 'lucide-react';
import { useBookingModal } from '../context/BookingContext';

export const Hero = () => {
  const { openModal } = useBookingModal();

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDM0uqkCOGpFQOJi76AG73AGHHdVNceufWbUaA19TGQIDqYwmNF04rsslEEXJRHjFuYkinW7tYaCZyqcd9bsn_jfiCdnaU9zKhiSn-6t-LBH1QhR6XSEzv9i3cWRLEQTd59wJMzGWzivdB-O0xNGShb-voVKTs79gax-46FVQbuUVer75pbdB2Wun6sB_JJJaL9eO3bHh7Qy-YiQOmhmMUJuYgd4N25KK7U5IoKoVujMIsrAt-PCKCJathxlE91GvRXdkU7mHriALQ"
          alt="Premium Wedding Event"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-20 w-full text-center md:text-left">
        <div className="max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-sans text-5xl md:text-7xl text-white mb-6 leading-tight font-bold drop-shadow-lg tracking-tight"
          >
            Biến mọi khoảnh khắc thành ký ức đáng nhớ
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 mb-10 max-w-xl font-body"
          >
            Dịch vụ Photobooth cao cấp dành cho đám cưới và sự kiện tại Việt Nam. Đỉnh cao của sự sang trọng và trải nghiệm cảm xúc.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <button 
              onClick={openModal}
              className="bg-primary-container text-on-primary-container px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              Book lịch ngay
            </button>
            <a 
              href="#pricing"
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-full font-bold text-lg transition-all hover:bg-white/20 text-center"
            >
              Xem bảng giá
            </a>
          </motion.div>
        </div>
      </div>

      {/* Floating Glass Cards */}
      <div className="absolute bottom-24 right-20 hidden lg:flex flex-col gap-6">
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="glass-card p-6 rounded-2xl flex items-center gap-4 shadow-xl"
        >
          <Calendar className="text-primary w-10 h-10" />
          <div>
            <p className="font-bold text-2xl leading-tight">500+</p>
            <p className="text-on-surface-variant text-xs uppercase font-bold tracking-widest">Sự kiện</p>
          </div>
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="glass-card p-6 rounded-2xl flex items-center gap-4 shadow-xl"
        >
          <Smile className="text-primary w-10 h-10" />
          <div>
            <p className="font-bold text-2xl leading-tight">99%</p>
            <p className="text-on-surface-variant text-xs uppercase font-bold tracking-widest">Hài lòng</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
