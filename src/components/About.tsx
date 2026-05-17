import { motion } from 'motion/react';

export const About = () => {
  return (
    <section id="about" className="py-24 max-w-7xl mx-auto px-6 md:px-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5YzHgtkG04x_KfIfs8TJG2-HJqY8MvUzQJIvLZlG5nhXtTRJMnldwr2bkDm35QPA0xUHXJ_X3s9t0qwQnDFVIQBofEzPMnCGtTvvIso-JJ2WC0LSPeEnGgfu4YfdetEFjQ9xPPWSYaehht2v0ecOF-zgY4KyizHmEgO3ERbkxd4YDnpGAW_MKA2sRAvnp8w7PNIkVUPygTlnQJnwL1Gbc9IOdMEOerAxkIyM2prvZfa6HOEnkaATct_QhS_U00RUh6ZS0FQf17_U"
              alt="Lumière Founder"
              className="w-full h-full object-cover"
            />
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-6 -right-6 glass-card p-8 rounded-2xl max-w-xs shadow-xl hidden md:block"
          >
            <p className="italic text-on-surface-variant text-base font-body leading-relaxed">
              "Chúng tôi không chỉ chụp ảnh, chúng tôi lưu giữ những cảm xúc chân thật nhất trong từng khung hình."
            </p>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-sans font-bold text-primary tracking-tight">
            Câu chuyện của Lumière
          </h2>
          <div className="space-y-6 text-lg text-on-surface-variant leading-relaxed font-body">
            <p>
              Lumière ra đời từ niềm đam mê mãnh liệt với ánh sáng và những khoảnh khắc hạnh phúc. Chúng tôi tin rằng mỗi nụ cười trong ngày cưới hay sự phấn khởi tại các sự kiện đều xứng đáng được lưu giữ một cách trân trọng nhất.
            </p>
            <p>
              Với công nghệ in ấn hiện đại nhất và gu thẩm mỹ tinh tế, Lumière mang đến không chỉ là một chiếc máy ảnh, mà là một trải nghiệm nghệ thuật đầy phong cách cho khách mời của bạn.
            </p>
          </div>
          <div className="pt-4">
            <button className="group border-b-2 border-primary text-primary font-bold py-2 hover:opacity-70 transition-all flex items-center gap-2">
              Tìm hiểu thêm về chúng tôi
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
