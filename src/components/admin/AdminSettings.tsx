import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  Tag,
  AlertCircle,
  Globe,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Layout,
  Upload
} from 'lucide-react';
import { getGlobalSettings, updateGlobalSettings, GlobalSettings } from '../../lib/settingsService';
import toast from 'react-hot-toast';

export const AdminSettings = () => {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getGlobalSettings();
      setSettings(data);
    } catch (err) {
      toast.error('Không thể tải cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = (field: string, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleUpdateSocial = (platform: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      socialLinks: {
        ...(settings.socialLinks || {}),
        [platform]: value
      }
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateGlobalSettings(settings);
      toast.success('Đã cập nhật cấu hình hệ thống thành công');
    } catch (err) {
      toast.error('Lỗi khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-sans font-bold text-primary tracking-tight">Cấu hình hệ thống</h1>
          <p className="text-on-surface-variant font-medium mt-1">Quản lý thương hiệu, thông tin liên hệ và SEO của website.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Lưu tất cả thay đổi
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* General Brand Settings */}
          <section className="bg-white p-8 lg:p-10 rounded-[40px] border border-surface-variant/10 shadow-sm space-y-8 h-full">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Thương hiệu & Identity</h2>
                <p className="text-xs text-on-surface-variant font-medium">Tên website, logo và favicon của bạn.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Tên Website / Thương hiệu</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                  value={settings.siteName}
                  onChange={(e) => handleUpdateSetting('siteName', e.target.value)}
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Logo URL (Header)</label>
                <div className="flex flex-col gap-4">
                  <div className="w-full h-32 bg-surface-container rounded-2xl border-2 border-dashed border-surface-variant/20 flex flex-col items-center justify-center p-4">
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center text-on-surface-variant/40">
                          <Layout className="w-8 h-8 mb-2" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Logo Preview</span>
                        </div>
                      )}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Dán link ảnh logo tại đây..."
                    className="w-full bg-surface-container border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                    value={settings.logoUrl}
                    onChange={(e) => handleUpdateSetting('logoUrl', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Favicon URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="https://..."
                    className="flex-1 bg-surface-container border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                    value={settings.faviconUrl}
                    onChange={(e) => handleUpdateSetting('faviconUrl', e.target.value)}
                  />
                  <div className="p-4 bg-surface-container rounded-xl text-on-surface-variant">
                    <Upload className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Contact Information */}
          <section className="bg-white p-8 lg:p-10 rounded-[40px] border border-surface-variant/10 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Thông tin liên hệ</h2>
                <p className="text-xs text-on-surface-variant font-medium">Email, số điện thoại và địa chỉ hiển thị trên site.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 flex items-center gap-2">
                   <Mail className="w-3 h-3" /> Email
                </label>
                <input 
                  type="email" 
                  className="w-full bg-surface-container border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                  value={settings.contactEmail}
                  onChange={(e) => handleUpdateSetting('contactEmail', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 flex items-center gap-2">
                   <Phone className="w-3 h-3" /> Hotline
                </label>
                <input 
                  type="tel" 
                  className="w-full bg-surface-container border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                  value={settings.contactPhone}
                  onChange={(e) => handleUpdateSetting('contactPhone', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Địa chỉ
              </label>
              <textarea 
                rows={3}
                className="w-full bg-surface-container border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 resize-none"
                value={settings.address}
                onChange={(e) => handleUpdateSetting('address', e.target.value)}
              />
            </div>
          </section>

          {/* Social Links */}
          <section className="bg-white p-8 lg:p-10 rounded-[40px] border border-surface-variant/10 shadow-sm space-y-8">
             <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <Facebook className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Mạng xã hội</h2>
                <p className="text-xs text-on-surface-variant font-medium">Các liên kết xã hội của thương hiệu.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 bg-surface-container/30 p-2 pl-4 rounded-xl border border-surface-variant/5">
                 <Facebook className="w-5 h-5 text-[#1877F2]" />
                 <input 
                   type="text" 
                   placeholder="Facebook URL"
                   className="flex-1 bg-transparent border-none p-2 text-sm font-bold focus:ring-0"
                   value={settings.socialLinks?.facebook || ''}
                   onChange={(e) => handleUpdateSocial('facebook', e.target.value)}
                 />
              </div>
              <div className="flex items-center gap-4 bg-surface-container/30 p-2 pl-4 rounded-xl border border-surface-variant/5">
                 <Instagram className="w-5 h-5 text-[#E4405F]" />
                 <input 
                   type="text" 
                   placeholder="Instagram URL"
                   className="flex-1 bg-transparent border-none p-2 text-sm font-bold focus:ring-0"
                   value={settings.socialLinks?.instagram || ''}
                   onChange={(e) => handleUpdateSocial('instagram', e.target.value)}
                 />
              </div>
              <div className="flex items-center gap-4 bg-surface-container/30 p-2 pl-4 rounded-xl border border-surface-variant/5">
                 <Youtube className="w-5 h-5 text-[#FF0000]" />
                 <input 
                   type="text" 
                   placeholder="Youtube URL"
                   className="flex-1 bg-transparent border-none p-2 text-sm font-bold focus:ring-0"
                   value={settings.socialLinks?.youtube || ''}
                   onChange={(e) => handleUpdateSocial('youtube', e.target.value)}
                 />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
