import { motion } from 'motion/react';
import { useState } from 'react';
import { PORTFOLIO } from '../constants';

export const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const categories = ['Tất cả', 'Đám cưới', 'Sự kiện'];

  const filteredItems = activeCategory === 'Tất cả' 
    ? PORTFOLIO 
    : PORTFOLIO.filter(item => item.category === activeCategory);

  return (
    <section id="portfolio" className="py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-sans font-bold text-primary tracking-tight">
              Khoảnh khắc đáng nhớ
            </h2>
            <p className="text-on-surface-variant font-body text-xl mt-2">
              Dự án chúng tôi đã thực hiện
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${
                  activeCategory === cat 
                    ? 'bg-primary text-white' 
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-primary/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          layout
          className="masonry gap-6 space-y-6"
        >
          {filteredItems.map((item) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={item.id}
              className="break-inside-avoid"
            >
              <div className="relative group overflow-hidden rounded-2xl shadow-sm">
                <img 
                  src={item.image} 
                  alt={item.alt} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 text-center">
                  <p className="text-white font-bold text-lg font-body">{item.alt}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
