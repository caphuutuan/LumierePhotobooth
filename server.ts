import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

// Initialize Gemini SDK with telemetry header requested by skill
const ai = apiKey ? new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

// Chatbot endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages are required and must be an array' });
    }

    if (!ai) {
      return res.status(500).json({ 
        error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ. Vui lòng thêm trong Settings > Secrets.' 
      });
    }

    // Map frontend messages to Google GenAI Content structure
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text || msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: `Bạn là Lumière AI - Trợ lý ảo chính thức của Lumière Photobooth (Dịch vụ Photobooth chuyên nghiệp, sang trọng hàng đầu tại Việt Nam). 
Hãy tư vấn cho khách hàng một cách thân thiện, lịch thiệp, cao cấp. 
Trả lời ngắn gọn, tinh tế, sử dụng tiếng Việt. 
Thông tin về Lumière Photobooth:
- Ý nghĩa tên: \"Lumière\" là ánh sáng trong tiếng Pháp, đại diện cho những bức ảnh nghệ thuật, rực rỡ và lộng lẫy dưới ánh đèn flash.
- Khách hàng mục tiêu: Tiệc cưới cao cấp, Sinh nhật, Sự kiện doanh nghiệp, Tiệc đầy tháng.
- Thống kê: hơn 1.200 khách hàng tin tưởng, 45+ đối tác studio, 5+ năm kinh nghiệm.
- Dịch vụ chính: 
  + Tiệc cưới (in ảnh lấy liền, frame thiết kế riêng, phụ kiện trendy)
  + Sinh nhật (backdrop theo concept, GIF & Video ngắn, QR Code tải ảnh)
  + Sự kiện doanh nghiệp (gắn Logo thương hiệu, thu thập data khách hàng, setup nhanh chóng)
  + Tiệc đầy tháng (phụ kiện bé cực kỳ dễ thương, thợ chuyên nghiệp chụp ảnh, giao ảnh tận nơi)
- Các gói dịch vụ:
  + Gói Basic (2.000.000đ): 2 giờ phục vụ, tối đa 100 ảnh in lấy liền, 1 nhân viên hỗ trợ, frame thiết kế cơ bản, QR Code tải ảnh digital.
  + Gói Premium (3.500.000đ) - BÁN CHẠY NHẤT: 4 giờ phục vụ, in ảnh vô hạn, 2 nhân viên hỗ trợ, props phụ kiện cao cấp, frame thiết kế Exclusive độc quyền, ảnh GIF & Video Boomerang vui nhộn.
  + Gói Luxury (5.000.000đ): trọn vẹn thời gian sự kiện, album ký tên thủ công cao cấp, background hoa tươi sáng tạo, in ảnh 10x15cm chất lượng cao, video highlight photobooth.
- FAQ:
  + Đặt trước bao lâu? Tối thiểu 2-4 tuần cho sự kiện nhỏ, 2-3 tháng cho đám cưới mùa cao điểm.
  + Thiết kế ô hình riêng? Có, đội ngũ thiết kế riêng của Lumière sẽ đo ni đóng giày theo yêu cầu.
  + Chi phí vận chuyển? Miễn phí 10km nội thành TP.HCM và Hà Nội. Hơn 10km phụ phí nhỏ theo thực tế (ví dụ: Bình Dương, Đồng Nai thêm khoảng 200k - 500k tuỳ khoảng cách).
- Hướng dẫn đặt lịch: 
  + Khách hàng có thể nhập tên, số điện thoại, chọn ngày, loại tiệc và gói dịch vụ để đặt lịch hẹn ngay trên website thông qua nút \"Đặt lịch\" ở góc dưới màn hình/navbar.
  + Hãy nhiệt tình đề xuất họ nhấn vào nút đặt lịch trên để trải nghiệm dịch vụ.

Khi trả lời, hãy giữ giọng văn hào hoa, sang trọng, lịch sự, nhiệt tình, không trả lời lan man dài dòng. Tránh dùng các từ ngữ quá dân dã hoặc không phù hợp với không khí sang trọng của Lumière.`,
      }
    });

    const reply = response.text || "Xin lỗi, hiện tại tôi không thể xử lý yêu cầu này.";
    res.json({ reply });
  } catch (error: any) {
    // Check if it's a rate limit or quota exceeded error (429 or RESOURCE_EXHAUSTED)
    let isQuotaError = false;
    try {
      // 1. Direct code/status inspection
      if (
        error.status === 429 || 
        error.status === '429' ||
        error.statusCode === 429 || 
        error.statusCode === '429' || 
        error.code === 429 ||
        error.code === '429' ||
        error.status === 'RESOURCE_EXHAUSTED' ||
        error.status === 'resource_exhausted'
      ) {
        isQuotaError = true;
      }
      
      // 2. Nested server/client API error payload check
      if (error.error) {
        if (
          error.error.code === 429 || 
          error.error.code === '429' || 
          error.error.status === 'RESOURCE_EXHAUSTED' ||
          error.error.status === 'resource_exhausted'
        ) {
          isQuotaError = true;
        }
      }

      // 3. String lookup check on all error fields
      const searchTerms = ['429', 'resource_exhausted', 'quota', 'exhausted', 'rate limit', 'rate_limit', 'limit exceeded'];
      
      const checkString = (str: string) => {
        const lower = str.toLowerCase();
        return searchTerms.some(term => lower.includes(term));
      };

      if (error.message && checkString(String(error.message))) {
        isQuotaError = true;
      }

      if (checkString(String(error))) {
        isQuotaError = true;
      }

      try {
        const jsonStr = JSON.stringify(error);
        if (checkString(jsonStr)) {
          isQuotaError = true;
        }
      } catch (jsonErr) {
        // Skip JSON verification if circular reference occurs
      }
    } catch (e) {
      // Safe fallback in case of inspection exception
      isQuotaError = String(error).includes('429');
    }

    if (isQuotaError) {
      // Suppress stack traces for intentional quota/resource exhaustion events to keep standard err pristine
      console.warn('Gemini Chat API: Quota/Rate Limit Exceeded (RESOURCE_EXHAUSTED)');
      return res.status(429).json({ 
        error: 'Hệ thống Trợ lý AI của Lumière đang tạm thời bận do nhận quá nhiều yêu cầu cùng lúc. Quý khách vui lòng đợi vài giây và thử lại, hoặc nhắn tin qua Zalo/Messenger bằng nút liên hệ nhanh bên cạnh để được Lumière hỗ trợ tức thì ạ!'
      });
    }

    // Print actual unexpected system crashes
    console.error('Error in gemini/chat endpoint:', error);

    res.status(500).json({ 
      error: 'Hệ thống Trợ lý AI của Lumière đang tạm thời bận hoặc gặp lỗi kết nối. Quý khách vui lòng thử lại sau giây lát hoặc nhắn tin qua Zalo/Messenger để được tư vấn nhanh nhất ạ!' 
    });
  }
});

// Vite middleware setup
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
