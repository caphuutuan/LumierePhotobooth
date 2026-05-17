import { motion } from 'motion/react';
import { PRICING_PLANS } from '../constants';
import { useBookingModal } from '../context/BookingContext';

export const Pricing = () => {
  const { openModal } = useBookingModal();

  return (
    <section id="pricing" className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6 md:px-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-sans font-bold text-primary mb-4 tracking-tight">
            Lựa chọn gói dịch vụ
          </h2>
          <p className="text-on-surface-variant text-xl font-body">
            Phù hợp với mọi quy mô sự kiện của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan, index) => (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ 
                scale: plan.isPopular ? 1.08 : 1.03,
                y: -10,
                transition: { duration: 0.2 }
              }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`p-10 rounded-[40px] flex flex-col items-center text-center ${
                plan.isPopular 
                  ? 'bg-primary text-white shadow-2xl scale-105 relative z-10' 
                  : 'bg-white border border-surface-variant hover:shadow-xl'
              } transition-shadow duration-300`}
            >
              {plan.isPopular && (
                <div className="absolute top-6 right-6 bg-primary-container text-on-primary-container px-4 py-1 rounded-full text-xs uppercase font-bold tracking-widest shadow-sm">
                  Nổi bật
                </div>
              )}
              
              <h3 className={`text-2xl font-sans font-bold mb-2 ${plan.isPopular ? 'text-white' : 'text-on-surface'}`}>
                {plan.name}
              </h3>
              <p className={`text-4xl font-sans font-bold mb-8 ${plan.isPopular ? 'text-primary-fixed' : 'text-primary'}`}>
                {plan.price}
              </p>
              
              <ul className={`space-y-4 mb-10 font-body flex-grow ${plan.isPopular ? 'text-white/90' : 'text-on-surface-variant'}`}>
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    {feature.includes('In ảnh vô hạn') ? <strong>{feature}</strong> : feature}
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => openModal(plan.name)}
                className={`w-full py-4 rounded-full font-bold transition-all shadow-md active:scale-95 ${
                  plan.isPopular 
                    ? 'bg-white text-primary hover:shadow-lg' 
                    : 'border-2 border-primary text-primary hover:bg-primary/5'
                }`}
              >
                Chọn {plan.name.replace('Gói ', '')}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
