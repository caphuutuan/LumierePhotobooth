import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { TESTIMONIALS, PORTFOLIO, SERVICES, PRICING_PLANS } from '../../constants';
import { getGlobalSettings, updateEventTypes } from '../../lib/settingsService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Database, 
  ImageIcon, 
  MessageSquare, 
  Layout, 
  Tag,
  Settings,
  GripVertical,
  AlertCircle,
  Save
} from 'lucide-react';

export const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Settings states for Event Types
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [newType, setNewType] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchData = async () => {
    if (activeTab === 'event-types') {
      await fetchEventTypes();
      return;
    }
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, activeTab));
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, activeTab);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTypes = async () => {
    setLoading(true);
    try {
      const settings = await getGlobalSettings();
      setEventTypes(settings.eventTypes);
    } catch (err) {
      toast.error('Không thể tải danh sách loại sự kiện');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAddType = () => {
    if (!newType.trim()) return;
    if (eventTypes.includes(newType.trim())) {
      toast.error('Loại sự kiện này đã tồn tại');
      return;
    }
    setEventTypes([...eventTypes, newType.trim()]);
    setNewType('');
  };

  const handleRemoveType = (type: string) => {
    setEventTypes(eventTypes.filter(t => t !== type));
  };

  const handleSaveEventTypes = async () => {
    setSavingSettings(true);
    try {
      await updateEventTypes(eventTypes);
      toast.success('Đã cập nhật danh sách loại sự kiện thành công');
    } catch (err) {
      toast.error('Lỗi khi lưu danh sách loại sự kiện');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSeed = async () => {
    if (!window.confirm('Điều này sẽ ghi các dữ liệu mặc định vào Firestore. Tiếp tục?')) return;
    setSeeding(true);
    try {
      const batch = writeBatch(db);
      
      // Seed Testimonials
      TESTIMONIALS.forEach(t => {
        const ref = doc(collection(db, 'testimonials'));
        batch.set(ref, t);
      });

      // Seed Portfolio
      PORTFOLIO.forEach(p => {
        const ref = doc(collection(db, 'portfolio'));
        batch.set(ref, p);
      });

      // Seed Services
      SERVICES.forEach(s => {
        const ref = doc(collection(db, 'services'));
        batch.set(ref, s);
      });

      // Seed Gallery (from constants if available, or just empty)
      // For now, let's just commit what we have
      
      await batch.commit();
      alert('Đã khởi tạo dữ liệu thành công!');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi khởi tạo dữ liệu.');
    } finally {
      setSeeding(false);
    }
  };

  const tabs = [
    { id: 'gallery', label: 'Hero Gallery', icon: ImageIcon },
    { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'services', label: 'Dịch vụ', icon: Layout },
    { id: 'pricing', label: 'Bảng giá', icon: Tag },
    { id: 'event-types', label: 'Loại sự kiện', icon: Settings },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-sans font-bold text-primary tracking-tight">Quản lý nội dung</h1>
          <p className="text-on-surface-variant">Chỉnh sửa hình ảnh, dịch vụ và phản hồi của khách hàng.</p>
        </div>

        <div className="flex items-center gap-4">
          {activeTab === 'event-types' ? (
            <button 
              onClick={handleSaveEventTypes}
              disabled={savingSettings}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:shadow-xl transition-all disabled:opacity-50"
            >
              {savingSettings ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Lưu thay đổi
            </button>
          ) : (
            <>
              <button 
                onClick={handleSeed}
                disabled={seeding}
                className="flex items-center gap-2 px-6 py-3 bg-surface-container text-on-surface-variant font-bold rounded-2xl hover:bg-surface-variant/20 transition-all disabled:opacity-50"
              >
                <Database className="w-4 h-4" />
                {seeding ? 'Đang nạp...' : 'Nạp dữ liệu mẫu'}
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:shadow-xl transition-all">
                <Plus className="w-4 h-4" />
                Thêm mới
              </button>
            </>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap p-2 bg-surface-container rounded-[24px] inline-flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-[18px] text-sm font-bold transition-all ${
              activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-white/40'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content List */}
      <div className="bg-white rounded-[40px] border border-surface-variant/10 shadow-sm overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[500px]">
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-on-surface-variant font-medium">Đang tải nội dung...</p>
          </div>
        ) : (
          <div className="p-10">
            {activeTab === 'event-types' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                      <Tag className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Danh sách loại sự kiện</h2>
                      <p className="text-xs text-on-surface-variant font-medium">Thêm hoặc xóa các loại sự kiện hiển thị trên toàn hệ thống.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Thêm loại sự kiện mới..."
                        className="flex-1 bg-surface-container border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
                      />
                      <button 
                        onClick={handleAddType}
                        className="p-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      <AnimatePresence>
                        {eventTypes.map((type, index) => (
                          <motion.div 
                            key={type}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex items-center justify-between p-4 bg-surface-container/30 rounded-2xl border border-surface-variant/5 group hover:border-primary/20 hover:bg-white hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-on-surface-variant/20" />
                              <span className="font-bold text-sm tracking-tight">{type}</span>
                            </div>
                            <button 
                              onClick={() => handleRemoveType(type)}
                              className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-amber-50 p-8 rounded-[32px] flex gap-5 text-amber-900 border border-amber-200/50 shadow-sm shadow-amber-900/5">
                    <AlertCircle className="w-7 h-7 shrink-0 mt-1 text-amber-600" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse" />
                        Lưu ý quan trọng
                      </p>
                      <p className="text-sm leading-relaxed font-medium">
                        Khi bạn thay đổi danh sách này và nhấn "Lưu thay đổi", hệ thống sẽ đồng bộ ngay lập tức cho các khu vực sau:
                      </p>
                      <ul className="list-disc list-inside mt-4 text-xs space-y-2 opacity-80 font-bold">
                        <li>Form đặt lịch của khách hàng tại trang chủ</li>
                        <li>Trình tạo lịch hẹn mới trong trang quản trị</li>
                        <li>Bộ lọc tìm kiếm loại sự kiện trong danh sách bookings</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-surface-container/20 p-12 rounded-[40px] border border-dashed border-surface-variant/30 flex flex-col items-center justify-center text-center space-y-5">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-on-surface-variant/20 shadow-inner">
                      <Settings className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-on-surface-variant font-bold text-lg tracking-tight">Tính năng sắp ra mắt</p>
                      <p className="text-xs text-on-surface-variant/60 mt-2 uppercase tracking-widest font-black max-w-[200px] mx-auto leading-relaxed">
                        Bạn sẽ có thể tùy chỉnh thêm các trường dữ liệu động cho từng loại sự kiện.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'portfolio' || activeTab === 'gallery') && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.length === 0 ? (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-on-surface-variant font-medium">Chưa có dữ liệu cho mục này.</p>
                  </div>
                ) : (
                  data.map((item) => (
                  <div key={item.id} className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-xl transition-all bg-surface-container">
                    <img src={item.image} alt={item.alt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button className="p-3 bg-white rounded-full text-primary hover:scale-110 transition-transform"><Edit3 className="w-4 h-4" /></button>
                      <button 
                        onClick={async () => {
                          if(confirm('Xóa ảnh này?')) {
                            await deleteDoc(doc(db, activeTab, item.id));
                            fetchData();
                          }
                        }}
                        className="p-3 bg-white rounded-full text-error hover:scale-110 transition-transform"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {item.category && (
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{item.category}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'testimonials' && (
              <div className="space-y-4">
                {data.map((item) => (
                  <div key={item.id} className="bg-surface-container/30 p-6 rounded-[24px] border border-surface-variant/10 flex items-center gap-6 group hover:bg-white hover:shadow-lg transition-all">
                    <img src={item.avatar} className="w-14 h-14 rounded-full object-cover bg-white" />
                    <div className="flex-grow">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-xs text-on-surface-variant mb-2">{item.event}</p>
                      <p className="text-sm text-on-surface italic line-clamp-1">"{item.text}"</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-on-surface-variant hover:text-primary"><Edit3 className="w-5 h-5" /></button>
                      <button 
                        onClick={async () => {
                          if(confirm('Xóa phản hồi này?')) {
                            await deleteDoc(doc(db, 'testimonials', item.id));
                            fetchData();
                          }
                        }}
                        className="p-2 text-on-surface-variant hover:text-error"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Other tabs follow similar pattern */}
            {(activeTab === 'services' || activeTab === 'pricing') && (
              <p className="p-20 text-center text-on-surface-variant italic">
                Chức năng chỉnh sửa chi tiết cho {activeTab} đang được hoàn thiện.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
