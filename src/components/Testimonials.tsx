import { motion, AnimatePresence } from 'motion/react';
import { TESTIMONIALS } from '../constants';
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <section className="py-24 bg-surface-container/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-20 relative">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-sans font-bold text-primary mb-4 tracking-tight"
          >
            Chia sẻ từ khách hàng
          </motion.h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto">
            Những khoảnh khắc hạnh phúc và sự hài lòng của bạn là động lực lớn nhất của Lumière.
          </p>
        </div>
        
        <div className="relative min-h-[450px] md:min-h-[400px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.4 },
                scale: { duration: 0.4 }
              }}
              className="absolute w-full max-w-4xl"
            >
              <div className="glass-card p-8 md:p-12 rounded-[40px] border border-surface-variant/30 shadow-2xl bg-white/80 backdrop-blur-xl flex flex-col items-center text-center relative">
                <div className="absolute top-8 left-8 text-primary/10">
                  <Quote className="w-20 h-20" />
                </div>
                
                <img 
                  src={TESTIMONIALS[currentIndex].avatar} 
                  alt={TESTIMONIALS[currentIndex].name} 
                  className="w-24 h-24 rounded-full object-cover shadow-xl border-4 border-white mb-8 relative z-10"
                />
                
                <p className="text-xl md:text-2xl text-on-surface italic leading-relaxed mb-8 font-body font-medium">
                  {TESTIMONIALS[currentIndex].text}
                </p>
                
                <div className="relative z-10">
                  <p className="font-bold text-xl font-sans text-primary">{TESTIMONIALS[currentIndex].name}</p>
                  <p className="text-on-surface-variant text-sm uppercase font-bold tracking-widest mt-1">
                    {TESTIMONIALS[currentIndex].event}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4 pointer-events-none">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-primary pointer-events-auto hover:bg-primary hover:text-white transition-all transform hover:scale-110 active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-primary pointer-events-auto hover:bg-primary hover:text-white transition-all transform hover:scale-110 active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-3 mt-12">
          {TESTIMONIALS.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-8 bg-primary shadow-sm' : 'w-2 bg-primary/20 hover:bg-primary/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
