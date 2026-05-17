import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Mail, CheckCircle2 } from 'lucide-react';
import { submitBooking } from '../lib/bookingService';

export const ContactForm = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    eventType: 'Đám cưới',
    packagePlan: 'Consultation',
    date: '',
    message: ''
  });

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await submitBooking(formData);
    setLoading(false);
    if (result.success) {
      setSubmitted(true);
      setFormData({ 
        name: '', 
        phone: '', 
        email: '', 
        eventType: 'Đám cưới', 
        packagePlan: 'Consultation',
        date: '', 
        message: '' 
      });
    } else {
      alert('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  if (submitted) {
    return (
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-20 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[40px] shadow-2xl border border-primary/10 inline-block"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-sans font-bold text-primary mb-4">Gửi thành công!</h2>
          <p className="text-on-surface-variant max-w-sm mx-auto mb-8">
            Cảm ơn bạn đã tin tưởng Lumière. Đội ngũ tư vấn sẽ liên hệ lại với bạn trong vòng 30 phút.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="text-primary font-bold hover:underline"
          >
            Gửi yêu cầu khác
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="py-24 max-w-7xl mx-auto px-6 md:px-20" id="contact">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-sans font-bold text-primary tracking-tight">
            Gửi yêu cầu tư vấn
          </h2>
          <p className="text-on-surface-variant text-xl font-body leading-relaxed">
            Hãy để lại thông tin, Lumière sẽ liên hệ lại ngay trong vòng 30 phút để cùng bạn lên kế hoạch cho sự kiện hoàn hảo.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-6 text-on-surface-variant p-4 rounded-2xl transition-colors hover:bg-surface-container">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <MapPin className="w-6 h-6" />
              </div>
              <p className="font-medium">Xã Lạc Tánh, Tỉnh Lâm Đồng</p>
            </div>
            <div className="flex items-center gap-6 text-on-surface-variant p-4 rounded-2xl transition-colors hover:bg-surface-container">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Mail className="w-6 h-6" />
              </div>
              <p className="font-medium">hello@lumierephotobooth.vn</p>
            </div>
          </div>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="bg-white p-10 rounded-[40px] shadow-2xl border border-surface-variant/50 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-bold text-xs uppercase tracking-[0.2em] text-on-surface-variant px-1">Họ tên</label>
              <input 
                required
                className="w-full bg-surface-container-low border-none rounded-2xl p-5 focus:ring-2 focus:ring-primary/20 transition-all font-body"
                placeholder="Nguyễn Văn A" 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="font-bold text-xs uppercase tracking-[0.2em] text-on-surface-variant px-1">Số điện thoại</label>
              <input 
                required
                className="w-full bg-surface-container-low border-none rounded-2xl p-5 focus:ring-2 focus:ring-primary/20 transition-all font-body"
                placeholder="090 123 4567" 
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-bold text-xs uppercase tracking-[0.2em] text-on-surface-variant px-1">Loại sự kiện</label>
              <select 
                className="w-full bg-surface-container-low border-none rounded-2xl p-5 focus:ring-2 focus:ring-primary/20 transition-all font-body appearance-none"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              >
                <option>Đám cưới</option>
                <option>Sinh nhật</option>
                <option>Sự kiện doanh nghiệp</option>
                <option>Khác</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-bold text-xs uppercase tracking-[0.2em] text-on-surface-variant px-1">Ngày sự kiện</label>
              <input 
                required
                className="w-full bg-surface-container-low border-none rounded-2xl p-5 focus:ring-2 focus:ring-primary/20 transition-all font-body"
                type="date"
                min={today}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="font-bold text-xs uppercase tracking-[0.2em] text-on-surface-variant px-1">Lời nhắn</label>
            <textarea 
              className="w-full bg-surface-container-low border-none rounded-2xl p-5 focus:ring-2 focus:ring-primary/20 transition-all font-body min-h-[120px]"
              placeholder="Chi tiết yêu cầu của bạn..." 
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            ></textarea>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-5 rounded-full hover:shadow-2xl transition-all shadow-xl text-lg mt-4 flex items-center justify-center"
            type="submit"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : "Gửi yêu cầu ngay"}
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
};
