import { motion } from 'motion/react';
import { Facebook, Instagram, Linkedin, Send } from 'lucide-react';
import { SiTiktok } from 'react-icons/si';

const SOCIAL_LINKS = [
  { icon: Facebook, href: 'https://facebook.com/lumierephotobooth.vn', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/lumierephotobooth.vn', label: 'Instagram' },
  { icon: SiTiktok, href: 'https://tiktok.com/@lumierephotobooth.vn', label: 'TikTok' },
  { icon: Linkedin, href: 'https://linkedin.com/company/lumierephotobooth', label: 'LinkedIn' },
];

export const Footer = () => {
  return (
    <footer className="bg-surface-container py-24 border-t border-surface-variant/30">
      <div className="max-w-7xl mx-auto px-6 md:px-20 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <span className="font-sans text-3xl text-primary font-bold tracking-tighter">LUMIÈRE</span>
          <p className="text-on-surface-variant text-base font-body leading-relaxed">
            © 2024 Lumière Photobooth Vietnam. <br/>Ghi lại từng khoảnh khắc trân quý.
          </p>
          <div className="flex gap-4">
            {SOCIAL_LINKS.map((social, i) => (
              <motion.a
                key={i}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -5, scale: 1.1 }}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm hover:shadow-lg transition-all"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-sans font-bold text-xl">Dịch vụ</h4>
          <ul className="space-y-4 font-body">
            <li><a href="#" className="text-on-surface-variant hover:text-primary transition-all">Tiệc cưới</a></li>
            <li><a href="#" className="text-on-surface-variant hover:text-primary transition-all">Sự kiện doanh nghiệp</a></li>
            <li><a href="#" className="text-on-surface-variant hover:text-primary transition-all">Sinh nhật & Kỷ niệm</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-sans font-bold text-xl">Hỗ trợ</h4>
          <ul className="space-y-4 font-body">
            <li><a href="#pricing" className="text-on-surface-variant hover:text-primary transition-all">Bảng giá</a></li>
            <li><a href="#" className="text-on-surface-variant hover:text-primary transition-all">Quy trình làm việc</a></li>
            <li><a href="#faq" className="text-on-surface-variant hover:text-primary transition-all">FAQ</a></li>
            <li><a href="#" className="text-on-surface-variant hover:text-primary transition-all">Chính sách bảo mật</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-sans font-bold text-xl">Đăng ký bản tin</h4>
          <p className="text-on-surface-variant text-base font-body">Nhận các ưu đãi đặc biệt và cảm hứng sự kiện.</p>
          <div className="flex group bg-white rounded-full p-1 shadow-sm focus-within:shadow-md transition-all">
            <input 
              className="bg-transparent border-none rounded-l-full px-6 py-3 w-full focus:ring-0 font-body text-sm" 
              placeholder="Email của bạn" 
              type="email" 
            />
            <button className="bg-primary text-white p-3 rounded-full hover:bg-primary/90 transition-all">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
