import { motion } from 'motion/react';
import { MessageCircle, PhoneCall } from 'lucide-react';

export const FinalCTA = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-primary">
      <div className="absolute inset-0 bg-black/20 z-0"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-20 relative z-10 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-sans font-bold text-white mb-8 tracking-tight"
        >
          Bạn chỉ có một lần cho ngày đặc biệt ấy.
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/80 text-xl font-body mb-12 max-w-2xl mx-auto"
        >
          Đừng để những khoảnh khắc quý giá trôi qua. Hãy để Lumière giúp bạn lưu giữ chúng một cách hoàn mỹ nhất.
        </motion.p>
        
        <div className="flex flex-wrap justify-center gap-6">
          <motion.a 
            href="https://zalo.me/090xxxxxxx"
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-primary px-8 py-5 rounded-full font-bold flex items-center gap-3 shadow-xl"
          >
            <MessageCircle className="w-6 h-6" />
            Zalo: 090x xxx xxx
          </motion.a>
          <motion.a 
            href="tel:090xxxxxxx"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-5 rounded-full font-bold flex items-center gap-3 transition-all hover:bg-white/20"
          >
            <PhoneCall className="w-6 h-6" />
            Hotline Tư vấn
          </motion.a>
        </div>
      </div>
    </section>
  );
};
