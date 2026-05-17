import { motion, AnimatePresence } from 'motion/react';
import { Phone, MessageCircle, X } from 'lucide-react';
import { SiZalo, SiMessenger } from 'react-icons/si';
import { useState, useEffect } from 'react';

const NOTIFICATIONS = [
  "Bạn cần Lumière tư vấn?",
  "3 khách vừa đặt lịch sáng nay",
  "Nhận ưu đãi 10% khi đặt sớm",
  "Lumière đang online hỗ trợ",
  "Ưu đãi gói Basic chỉ từ 2tr",
  "Dịch vụ tận tâm 24/7",
];

export const ContactFloat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [noticeIndex, setNoticeIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isOpen) {
        setNoticeIndex(prev => (prev + 1) % NOTIFICATIONS.length);
        setShowNotice(true);
        
        // Hide after 5 seconds
        setTimeout(() => setShowNotice(false), 5000);
      }
    }, 12000); // Trigger every 12 seconds

    return () => clearInterval(timer);
  }, [isOpen]);

  const contactMethods = [
    {
      id: 'messenger',
      icon: SiMessenger,
      label: 'Messenger',
      color: 'bg-[#0084FF]',
      href: 'https://m.me/yourprofile', // Replace with real links
    },
    {
      id: 'zalo',
      icon: SiZalo,
      label: 'Zalo',
      color: 'bg-[#0068FF]',
      href: 'https://zalo.me/090xxxxxxx', // Replace with real phone
    },
    {
      id: 'phone',
      icon: Phone,
      label: 'Gọi điện',
      color: 'bg-primary',
      href: 'tel:090xxxxxxx', // Replace with real phone
    },
  ];

  return (
    <div className="fixed bottom-24 md:bottom-10 right-6 z-[70] flex flex-col items-end gap-4">
      {/* Random Notification */}
      <AnimatePresence>
        {showNotice && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="bg-white px-5 py-3 rounded-2xl shadow-2xl border border-primary/10 relative mb-2 max-w-[200px]"
          >
            <button 
              onClick={() => setShowNotice(false)}
              className="absolute -top-2 -right-2 bg-on-surface text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"
            >
              <X className="w-3 h-3" />
            </button>
            <p className="text-sm font-bold text-on-surface-variant leading-tight">
              {NOTIFICATIONS[noticeIndex]}
            </p>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white rotate-45 border-r border-b border-primary/10" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-2">
            {contactMethods.map((method, index) => (
              <motion.a
                key={method.id}
                href={method.href}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.1, x: -5 }}
                className={`${method.color} text-white p-4 rounded-full shadow-2xl flex items-center gap-3 group`}
              >
                <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-300 font-bold text-sm whitespace-nowrap">
                  {method.label}
                </span>
                <method.icon className="w-6 h-6" />
              </motion.a>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowNotice(false);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-primary text-white p-5 rounded-full shadow-2xl relative z-10 flex items-center justify-center border-2 border-white/20"
      >
        <motion.div
           animate={{ rotate: isOpen ? 45 : 0 }}
           transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <MessageCircle className="w-8 h-8 rotate-45" />
          ) : (
            <div className="relative">
              <MessageCircle className="w-8 h-8" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full border-2 border-white animate-pulse"></span>
            </div>
          )}
        </motion.div>
      </motion.button>
    </div>
  );
};
