import { motion } from 'motion/react';
import { STATS } from '../constants';

export const Stats = () => {
  return (
    <section className="py-20 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6 md:px-20 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        {STATS.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <p className="text-primary text-5xl md:text-6xl font-sans font-bold tracking-tighter">
              {stat.value}
            </p>
            <p className="text-on-surface-variant text-lg font-body">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
