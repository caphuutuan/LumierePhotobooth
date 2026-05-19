import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, User, Phone, MessageSquare, CheckCircle2, Mail } from 'lucide-react';
import { useBookingModal } from '../context/BookingContext';
import { submitBooking } from '../lib/bookingService';
import { getGlobalSettings } from '../lib/settingsService';
import { auth } from '../lib/firebase';

export const BookingModal = () => {
  const { isOpen, closeModal, selectedPlan } = useBookingModal();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [eventTypes, setEventTypes] = useState<string[]>(['Đám cưới', 'Sinh nhật', 'Sự kiện doanh nghiệp', 'Khác']);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    eventType: 'Đám cưới',
    packagePlan: selectedPlan || 'Basic',
    message: ''
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Prefill user data if logged in
    const user = auth.currentUser;
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
        phone: user.phoneNumber || prev.phone
      }));
    }

    const fetchEventTypes = async () => {
      const settings = await getGlobalSettings();
      if (settings.eventTypes && settings.eventTypes.length > 0) {
        setEventTypes(settings.eventTypes);
        setFormData(prev => ({ ...prev, eventType: settings.eventTypes[0] }));
      }
    };
    fetchEventTypes();
  }, [isOpen]);

  // Update packagePlan when selectedPlan changes (modal opened from pricing)
  useEffect(() => {
    if (selectedPlan) {
      setFormData(prev => ({ ...prev, packagePlan: selectedPlan }));
    }
  }, [selectedPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Add current user info if available
    const finalData = {
      ...formData,
      userId: auth.currentUser?.uid || null,
      email: formData.email || auth.currentUser?.email || null
    };

    const result = await submitBooking(finalData as any);
    setLoading(false);
    if (result.success) {
      setSubmitted(true);
      setFormData({ 
        name: '', 
        email: '',
        phone: '', 
        date: '', 
        eventType: 'Đám cưới', 
        packagePlan: 'Basic',
        message: '' 
      });
      setTimeout(() => {
        setSubmitted(false);
        closeModal();
      }, 3000);
    } else {
      alert('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[101] px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden pointer-events-auto relative"
            >
              {submitted ? (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-sans font-bold text-primary mb-4">Gửi thành công!</h2>
                  <p className="text-on-surface-variant">Lumière sẽ liên hệ lại ngay trong vòng 30 phút.</p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="bg-primary p-8 text-white relative">
                    <button
                      onClick={closeModal}
                      className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-3xl font-sans font-bold mb-2">Book Your Date</h2>
                    <p className="text-white/80 font-body">Hãy để lại thông tin, Lumière sẽ liên hệ lại ngay.</p>
                  </div>

                  {/* Form */}
                  <form className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-on-surface-variant px-1">
                          <User className="w-4 h-4" /> Họ tên
                        </label>
                        <input
                          required
                          type="text"
                          className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-body"
                          placeholder="Nguyễn Văn A"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-on-surface-variant px-1">
                          <Phone className="w-4 h-4" /> Số điện thoại
                        </label>
                        <input
                          required
                          type="tel"
                          className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-body"
                          placeholder="090 123 4567"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-on-surface-variant px-1">
                        <Mail className="w-4 h-4" /> Email liên hệ
                      </label>
                      <input
                        required
                        type="email"
                        className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-body"
                        placeholder="example@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-on-surface-variant px-1">
                          <Calendar className="w-4 h-4" /> Ngày sự kiện
                        </label>
                        <input
                          required
                          type="date"
                          min={today}
                          className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-body"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-bold text-xs uppercase tracking-widest text-on-surface-variant px-1">Loại sự kiện</label>
                        <select 
                          className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-body"
                          value={formData.eventType}
                          onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                        >
                          {eventTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-bold text-xs uppercase tracking-widest text-on-surface-variant px-1">Gói dịch vụ</label>
                      <select 
                        className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-body"
                        value={formData.packagePlan}
                        onChange={(e) => setFormData({ ...formData, packagePlan: e.target.value })}
                      >
                        <option>Basic</option>
                        <option>Premium</option>
                        <option>Luxury</option>
                        <option>Custom</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-on-surface-variant px-1">
                        <MessageSquare className="w-4 h-4" /> Lời nhắn (không bắt buộc)
                      </label>
                      <textarea
                        className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-body min-h-[100px]"
                        placeholder="VD: Địa điểm tổ chức, yêu cầu đặc biệt..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      type="submit"
                      className="w-full bg-primary text-white font-bold py-5 rounded-full shadow-xl hover:shadow-2xl transition-all text-lg flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : "Gửi yêu cầu ngay"}
                    </motion.button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
