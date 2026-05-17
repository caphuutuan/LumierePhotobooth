import { motion } from 'motion/react';
import { Heart, Cake, Briefcase, Baby, CheckCircle2 } from 'lucide-react';
import { SERVICES } from '../constants';

const icons = {
  Heart: Heart,
  Cake: Cake,
  Briefcase: Briefcase,
  Baby: Baby,
};

export const Services = () => {
  return (
    <section id="services" className="py-24 bg-surface-container">
      <div className="max-w-7xl mx-auto px-6 md:px-20">
        <h2 className="text-center text-4xl md:text-5xl font-sans font-bold text-primary mb-16 tracking-tight">
          Dịch vụ cho mọi dịp đặc biệt
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, index) => {
            const Icon = icons[service.icon as keyof typeof icons] || Heart;
            return (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-[24px] shadow-sm hover:shadow-xl transition-all flex flex-col h-full border border-surface-variant group"
              >
                <div className="w-14 h-14 bg-primary-container/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-sans font-bold mb-4">{service.title}</h3>
                <p className="text-on-surface-variant text-base mb-6 flex-grow font-body">
                  {service.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm font-bold text-on-surface-variant">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
