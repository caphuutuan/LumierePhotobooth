import { motion } from 'motion/react';
import { PROCESS_STEPS } from '../constants';

export const Process = () => {
  return (
    <section className="py-24 bg-surface-container-low overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-20">
        <h2 className="text-4xl md:text-5xl font-sans font-bold text-primary mb-20 text-center tracking-tight">
          Quy trình 4 bước đơn giản
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
          {/* Connector Line (Desktop Only) */}
          <div className="hidden md:block absolute top-[60px] left-0 w-full h-[1px] bg-primary-container/30 -z-0"></div>
          
          {PROCESS_STEPS.map((step, index) => (
            <motion.div 
              key={step.number}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative z-10 text-center space-y-6"
            >
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl border-2 border-primary/5 group transition-all hover:border-primary">
                <span className="text-primary font-bold text-2xl tracking-tighter transition-all group-hover:scale-125">
                  {step.number}
                </span>
              </div>
              <h3 className="font-sans font-bold text-2xl">{step.title}</h3>
              <p className="text-on-surface-variant text-base px-4 font-body leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
