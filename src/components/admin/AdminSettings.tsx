import { motion } from 'motion/react';
import { Settings, Save, Globe, Shield } from 'lucide-react';

export const AdminSettings = () => {
  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="px-2 lg:px-0">
        <h1 className="text-2xl lg:text-3xl font-sans font-bold text-primary tracking-tight">Cài đặt hệ thống</h1>
        <p className="text-on-surface-variant text-sm lg:text-base">Cấu hình thông tin chung và bảo mật cho website.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        <div className="bg-white p-6 lg:p-10 rounded-[30px] lg:rounded-[40px] border border-surface-variant/10 shadow-sm space-y-6 lg:space-y-8">
          <div className="flex items-center gap-3 text-primary">
            <Globe className="w-5 h-5 lg:w-6 lg:h-6" />
            <h2 className="text-lg lg:text-xl font-bold">Thông tin chung</h2>
          </div>

          <div className="space-y-4 lg:space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Tên Website</label>
              <input 
                type="text" 
                defaultValue="Lumière Photobooth Vietnam"
                className="w-full bg-surface-container-low border-none rounded-xl lg:rounded-2xl p-4 text-sm lg:text-base focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Email liên hệ</label>
              <input 
                type="email" 
                defaultValue="hello@lumierephotobooth.vn"
                className="w-full bg-surface-container-low border-none rounded-xl lg:rounded-2xl p-4 text-sm lg:text-base focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Hotline</label>
              <input 
                type="tel" 
                defaultValue="090x xxx xxx"
                className="w-full bg-surface-container-low border-none rounded-xl lg:rounded-2xl p-4 text-sm lg:text-base focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <button className="w-full bg-primary text-white py-4 rounded-xl lg:rounded-2xl text-sm lg:text-base font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all">
            <Save className="w-5 h-5" />
            Lưu thay đổi
          </button>
        </div>

        <div className="bg-white p-6 lg:p-10 rounded-[30px] lg:rounded-[40px] border border-surface-variant/10 shadow-sm space-y-6 lg:space-y-8">
          <div className="flex items-center gap-3 text-primary">
            <Shield className="w-5 h-5 lg:w-6 lg:h-6" />
            <h2 className="text-lg lg:text-xl font-bold">Bảo mật & Quyền hạn</h2>
          </div>

          <div className="space-y-4 lg:space-y-6">
            <div className="p-5 lg:p-6 bg-surface-container rounded-xl lg:rounded-2xl border border-surface-variant/5">
              <p className="text-xs lg:text-sm font-bold mb-2">Admin hiện tại:</p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs lg:text-sm text-on-surface-variant truncate">caphuutuan1@gmail.com</span>
                <span className="text-[9px] lg:text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg uppercase w-fit">Super Admin</span>
              </div>
            </div>

            <div className="p-5 lg:p-6 border border-dashed border-surface-variant/30 rounded-xl lg:rounded-2xl text-center">
              <p className="text-[10px] lg:text-xs text-on-surface-variant italic">
                Chức năng thêm Admin thứ hai và quản lý phân quyền đang được cập nhật.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
