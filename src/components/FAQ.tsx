import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { FAQ_ITEMS } from '../constants';

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 max-w-3xl mx-auto px-6">
      <h2 className="text-4xl md:text-5xl font-sans font-bold text-primary mb-16 text-center tracking-tight">
        Câu hỏi thường gặp
      </h2>
      
      <div className="space-y-4">
        {FAQ_ITEMS.map((item, index) => (
          <div 
            key={index}
            className="bg-white rounded-3xl border border-surface-variant/50 overflow-hidden shadow-sm transition-all hover:shadow-md"
          >
            <button 
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex justify-between items-center w-full p-8 text-left font-sans font-bold text-lg text-on-surface"
            >
              {item.question}
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="text-primary w-6 h-6" />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-8 pb-8 text-on-surface-variant text-base leading-relaxed font-body border-t border-surface-variant/20 pt-6">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};
