import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { TESTIMONIALS, PORTFOLIO, SERVICES, PRICING_PLANS } from '../../constants';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Database, 
  ImageIcon, 
  MessageSquare, 
  Layout, 
  Tag
} from 'lucide-react';

export const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchData = async () => {
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

  useEffect(() => {
    fetchData();
  }, [activeTab]);

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
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-sans font-bold text-primary tracking-tight">Quản lý nội dung</h1>
          <p className="text-on-surface-variant">Chỉnh sửa hình ảnh, dịch vụ và phản hồi của khách hàng.</p>
        </div>

        <div className="flex items-center gap-4">
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
        </div>
      </header>

      {/* Tabs */}
      <div className="flex p-2 bg-surface-container rounded-[24px] inline-flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-[18px] text-sm font-bold transition-all ${
              activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'
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
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-center p-10">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant mb-6">
              <Database className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-2">Chưa có dữ liệu</h3>
            <p className="text-on-surface-variant">Hãy nhấn "Nạp dữ liệu mẫu" hoặc "Thêm mới" để bắt đầu.</p>
          </div>
        ) : (
          <div className="p-10">
            {(activeTab === 'portfolio' || activeTab === 'gallery') && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.map((item) => (
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
                ))}
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
