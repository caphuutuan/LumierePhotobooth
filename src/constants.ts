import { NavLink, Stat, Service, PortfolioItem, PricingPlan, Testimony, FAQItem, Step } from './types';

export const NAV_LINKS: NavLink[] = [
  { label: 'Dịch vụ', href: '#services' },
  { label: 'Bảng giá', href: '#pricing' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'FAQ', href: '#faq' },
];

export const STATS: Stat[] = [
  { value: '1,200+', label: 'Khách hàng tin tưởng' },
  { value: '45+', label: 'Đối tác Studio' },
  { value: '5+', label: 'Năm kinh nghiệm' },
];

export const SERVICES: Service[] = [
  {
    id: 'wedding',
    title: 'Tiệc cưới',
    description: 'Lưu giữ trọn vẹn sự lãng mạn và hạnh phúc của đôi lứa trong ngày trọng đại.',
    icon: 'Heart',
    features: ['In ảnh lấy liền', 'Frame thiết kế riêng', 'Phụ kiện trendy'],
  },
  {
    id: 'birthday',
    title: 'Sinh nhật',
    description: 'Bữa tiệc thêm sôi động và đầy ắp những tấm hình kỉ niệm vui vẻ cùng bạn bè.',
    icon: 'Cake',
    features: ['Backdrop theo concept', 'GIF & Video ngắn', 'QR Code tải ảnh'],
  },
  {
    id: 'corporate',
    title: 'Sự kiện doanh nghiệp',
    description: 'Tăng nhận diện thương hiệu và kết nối nhân viên qua những trải nghiệm thú vị.',
    icon: 'Briefcase',
    features: ['Gắn Logo thương hiệu', 'Data khách hàng', 'Setup nhanh chóng'],
  },
  {
    id: 'baby',
    title: 'Tiệc đầy tháng',
    description: 'Mừng thiên thần nhỏ với những bức ảnh ấm áp cùng gia đình và người thân.',
    icon: 'Baby',
    features: ['Phụ kiện trẻ em', 'Chụp ảnh thợ chuyên nghiệp', 'Giao ảnh tận nhà'],
  },
];

export const PORTFOLIO: PortfolioItem[] = [
  {
    id: '1',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBgwDTmIXL_lqZSfkWA2JZjH_jGoA3sE9jNUoxNz7fnmf6o2NrwQCXc2dMeiFCKc50z8LKI9NUXWuDGe6Mo32oQ-ZxKwMMFL1m2ERoXzBk3Afd3voXwzYiUMnHWVDr8T6TNG85Zz-g2FMpC3rAe3d0HhYhrTUAr4mM3EPPZCdn2OtexE2eVxQQEtue9XusiyhA40gxTTVKlqiNOPCIaaFntzI2vCl5t5BN-3J1VU1OwkSwgByEXeoo_fsQv7rk4goKpkiiKqPCJRY',
    alt: 'Event Moment',
    category: 'Sự kiện',
  },
  {
    id: '2',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwlVXBxwybJdsaar8HW6dcT0q4Vqz_1oXt3xTzz6nUZQv_37u3eltElMuj8izX4ybOmCC8q_E9TFgbP3XpqQ-1hxC8ibvrwCudQd1tnzSeolxUDFIoDDwvidRCrWfoR4pBVmjFNCxJNBuWrrO93DzOJbUL-sZVizs5UuPrzNqfR-ftUb_5FYQfRMIdLMtDKM-ilnkHkYJoSrzwmrVAJPDiH-yqP_Qxz37rSe9lTvf9HhVvh9j3rYsVfCWanO4ivYien3sck1lhK84',
    alt: 'Wedding Moment',
    category: 'Đám cưới',
  },
  {
    id: '3',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClJhZ6m80W0sI4jrM_Wg7xUsaUJSRSBwiHCSATa_4ie27pnhucpuaEhhnTPAqlPTyuZ8V6UnUUHPpKtLfOb8LOYdy8rggXtmHb8qA5zxpdpllDwCuZkxNW1KLEtNvAkwwPUowzTm33Fr56yLf9wjLwlWm933B2yALosReL6d7phtK_EkpxpLTubi9yExkdZMy_Fs1LfCb5-45XQvj4XYZpvGP1EB2Ly0uiL2_lPeiR-Y6m1sJr76xCuQsWnly8Bh73b1R0kuztbqA',
    alt: 'Corporate Event',
    category: 'Sự kiện',
  },
  {
    id: '4',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsl3dTQ_N6QIJPVqrF5t1EutYK4uofjeJ00Sd2EQeaDF31y0aY7TyFm0RGcmqtrx_aTDvcOVu4T16UrMtFcuWDFEE-L6v5ZKCfAmzFRqoxmt3ZVgsZSRW8XG4szcf_TzmFwdQsBQYrVxufoBG7qmtweGG2V8TvlQouv-zwQjl8vkC9vMCgA0LEwRYCjoW9KVbAmwqSic_MklHW3vCYH39TemhOuC1Rx0QmBGye2KaWC4bLVf081cEttJJTLPYK69zS4_Lgxv54LJw',
    alt: 'Birthday Moment',
    category: 'Đám cưới',
  },
  {
    id: '5',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeKWPQywRpDVS7SbHTFPGn4T358YkcMiuRKQCwZNAkmzkddRznWsw2H_sF0vv4ng7xNcy05fRK_oKc4SV1jsgrdHHbdFfLqebegKJ00_VgBSkqgVFyEFxCkZWdAvf54qo93UtGgupEtqqYi0cGYxN23BEbr72twqeqVXpJevuqpX5PIJ-SG9Z5OqtbPh3FOlWXQDYlOxwyR2-4hoRL2d3FEBnKm3NFPaj6_uh-cd27XILU91rr5SehZ7tsE3KXTv11-8MU_4g723s',
    alt: 'Detail Moment',
    category: 'Đám cưới',
  },
  {
    id: '6',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJqBwy0DYkcpXDtyVOMHBXbbEfHjkz7hyfWf3mmSEbRhwNYe3FyOfhKXWSDNzio003drbFOnpW8sts1wK6Dt_pN8LDqmTXUKvyVdJS8vvi62x2xS518WeafzqOISrKUN_ljT7jSRScMiF2rXhYkpR48N4OE7b8TNFUjeenrjLSr1tvXkcAoVSMphv76cMhEAQ4ssRLk4a5OBwI8qzn9wp6TmxPd8nm_pHpkrBGsoNVJKpIsVzZPkxD_EFucCdmx4rw0cF5yEr8I7E',
    alt: 'Outdoor Setup',
    category: 'Đám cưới',
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Gói Basic',
    price: '2.000.000đ',
    features: [
      '2 giờ phục vụ',
      'Tối đa 100 ảnh in lấy liền',
      '1 Nhân viên hỗ trợ chuyên nghiệp',
      'Frame thiết kế cơ bản',
      'QR Code tải ảnh Digital',
    ],
  },
  {
    id: 'premium',
    name: 'Gói Premium',
    price: '3.500.000đ',
    isPopular: true,
    features: [
      '4 giờ phục vụ',
      'In ảnh vô hạn',
      '2 Nhân viên hỗ trợ',
      'Props (phụ kiện) cao cấp',
      'Frame thiết kế Exclusive',
      'GIF & Video Boomerang',
    ],
  },
  {
    id: 'luxury',
    name: 'Gói Luxury',
    price: '5.000.000đ',
    features: [
      'Toàn bộ thời gian sự kiện',
      'Album ký tên thủ công cao cấp',
      'Background hoa tươi thiết kế',
      'In ảnh chất lượng cao 10x15cm',
      'Video highlight sự kiện photobooth',
    ],
  },
];

export const TESTIMONIALS: Testimony[] = [
  {
    id: '1',
    name: 'Hồng Hạnh',
    event: 'Đám cưới tại Park Hyatt',
    text: '"Lumière thực sự đã tạo nên một cơn sốt tại đám cưới của mình. Khách mời ai cũng hào hứng vì có ảnh in lấy liền làm kỷ niệm. Chất lượng ảnh cực kỳ sắc nét!"',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwNFzmSXZsohDteYO074H80UlShkeJYJNezE_KBCZy3FLngaTn7wmdXrWVl3v3l58n_8as0mi0gKrftiwDe-ZWvQuZh92ZgqzYMAtg7csRY6f0UuM-DrPtWmjK_MpVQfoRMBaCX6OkRGf5IxDoqxGbQ-bYdSuRDAHngRsea8oMgR5XRbrJCjfMDOgQxBLrNilPCxJ-EwB7gxeZnj6DKhNGrI9pU8Y6VO4Olepuekmg9t6S0GDSLGVEi0rHJSAG5EQI1WNoRQRv7n0',
  },
  {
    id: '2',
    name: 'Minh Tuấn',
    event: 'Sự kiện Tech Summit',
    text: '"Team Lumière làm việc rất chuyên nghiệp từ khâu setup đến khi sự kiện kết thúc. Giải pháp Marketing qua QR code thực sự hiệu quả cho doanh nghiệp mình."',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAelpfBXjP0Y0du8nWTzUPeeluSchtXy6lDpJpciAsBPiryD3vXexNGOHQEapkaws1SkHCtGEkvu2lmueILSCwFGBGPBgS4teTaIAZPFvnkCQLne61kJncRSkANTgcw_doIfqQ0SFJe056S9aPyW2zMtLDzaoU8aoUp2mkjt2yyX6JAbq5VACIcAy9u1zEVF9AICceaY5PrUT3C7cVWLEzXXuKbl27C271e6d9yd4OzgtL7O3NFa1Zwrb0UyeUeWTjuEdy48M_nFgo',
  },
  {
    id: '3',
    name: 'Thảo Vy',
    event: 'Tiệc Sinh Nhật',
    text: '"Phụ kiện trang trí ở đây rất trendy, hợp gu giới trẻ tụi mình lắm. Các bạn nhân viên nhiệt tình, hay hướng dẫn mọi người tạo dáng nữa."',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1rUKwqjdeG8LefDeg9Nlfzs_EJqpffRGyhYmZuBjYzncUKt0JelT_t8OnJreT0I-TBUEfDsc4vXLIJWiIXFfK9kGwDnbgMRie5CWrx8UtlQW9ZCb9RfyXaxSzoFvZ2uA97DLhhLr7Mj5AboFGlIHfrBugH-DFoBKGO79hO_1xNSZt6cXTp_1csJCggprI0aFkexISWkR2Aokrzy-00d9fXj8Dtq9hy47g8hRIVbfV7c1HeK1EpC_Xl2aDQl_AmYEgpXI12kp8m7Y',
  },
  {
    id: '4',
    name: 'Hoàng Nam',
    event: 'Grand Opening - Retail Store',
    text: '"Sự góp mặt của Lumière làm không khí khai trương náo nhiệt hẳn lên. Khách hàng rất thích thú khi được tặng ảnh lưu niệm ngay tại chỗ."',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  },
  {
    id: '5',
    name: 'Bảo Trân',
    event: 'Year End Party',
    text: '"Năm nào cũng thuê Photobooth nhưng Lumière là bên mình ưng ý nhất. Từ cách các bạn hỗ trợ tạo dáng đến tốc độ in ảnh đều cực kỳ hài lòng."',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  },
  {
    id: '6',
    name: 'Anh Khoa',
    event: 'Wedding - Đà Lạt',
    text: '"Mặc dù tổ chức ở xa nhưng team Lumière vẫn hỗ trợ rất nhiệt tình. Backdrop hoa tươi và frame ảnh thiết kế riêng rất sang trọng."',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Cần đặt trước bao lâu để giữ lịch?',
    answer: 'Để đảm bảo Lumière có thể phục vụ tốt nhất, bạn nên đặt trước tối thiểu 2-4 tuần đối với sự kiện nhỏ và 2-3 tháng đối với mùa cưới cao điểm.',
  },
  {
    question: 'Tôi có thể thiết kế frame ảnh riêng không?',
    answer: 'Tất nhiên! Đội ngũ thiết kế của Lumière sẽ làm việc cùng bạn để tạo ra frame ảnh mang đậm dấu ấn cá nhân hoặc thương hiệu riêng của bạn.',
  },
  {
    question: 'Chi phí vận chuyển tính như thế nào?',
    answer: 'Chúng tôi miễn phí vận chuyển trong bán kính 10km nội thành TP.HCM và Hà Nội. Các khu vực xa hơn sẽ có phụ phí nhỏ dựa trên quãng đường thực tế.',
  },
];

export const PROCESS_STEPS: Step[] = [
  {
    number: '01',
    title: 'Liên hệ',
    description: 'Gửi thông tin sự kiện qua website hoặc Hotline.',
  },
  {
    number: '02',
    title: 'Tư vấn',
    description: 'Lumière đề xuất concept và báo giá chi tiết.',
  },
  {
    number: '03',
    title: 'Setup',
    description: 'Chúng tôi đến sớm chuẩn bị mọi thứ hoàn hảo.',
  },
  {
    number: '04',
    title: 'Tận hưởng',
    description: 'Vui chơi hết mình và nhận lại những tấm hình đẹp.',
  },
];
