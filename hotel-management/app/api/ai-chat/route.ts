import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { message, locationInfo, userPreferences } = await request.json();
  
  try {
    if (!message) {
      return NextResponse.json(
        { error: 'Thiếu tin nhắn' },
        { status: 400 }
      );
    }

    // Sử dụng Groq API (nhanh và miễn phí)
    const preferencesText = userPreferences && userPreferences.length > 0 
      ? `\nSở thích của khách hàng: ${userPreferences.join(', ')}. Hãy ưu tiên gợi ý phù hợp với sở thích này.`
      : '';

    const prompt = `Bạn là một hướng dẫn viên du lịch chuyên nghiệp và thân thiện của Miko Hotel Đà Nẵng. 

Thông tin về Miko Hotel Đà Nẵng:
- Tên: ${locationInfo?.name || 'Miko Hotel Đà Nẵng'}
- Địa chỉ: ${locationInfo?.address || 'Đà Nẵng, Việt Nam'}
- Loại: ${locationInfo?.type || 'khách sạn và dịch vụ du lịch tại Đà Nẵng'}${preferencesText}

Context về Đà Nẵng:
- Đà Nẵng là thành phố biển đẹp với nhiều bãi biển nổi tiếng
- Các địa điểm nổi tiếng: Cầu Vàng, Bà Nà Hills, Chùa Linh Ứng, Bãi biển Mỹ Khê
- Ẩm thực đặc sản: Bún bò Huế, Mì Quảng, Hải sản tươi sống
- Hoạt động: Lướt sóng, Golf, Leo núi, Tham quan Hội An, Huế
- Bảo tàng: Bảo tàng Chăm, Bảo tàng Điêu khắc Chăm
- Gần các điểm du lịch: Hội An (30km), Huế (100km), Bà Nà Hills (40km)

Câu hỏi của khách hàng: ${message}

QUAN TRỌNG: Trả lời ngắn gọn, tối đa 150 từ. Tập trung vào thông tin hữu ích nhất về Đà Nẵng và phù hợp với sở thích của khách hàng. Ưu tiên gợi ý địa điểm, dịch vụ cụ thể tại Đà Nẵng. Không dài dòng.`;

    // Debug: Log API key (chỉ để debug)
    console.log('Groq API Key:', process.env.GROQ_API_KEY ? 'Có API key' : 'Không có API key');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'Bạn là một hướng dẫn viên du lịch chuyên nghiệp, thân thiện và nhiệt tình. Trả lời bằng tiếng Việt một cách tự nhiên và hữu ích.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Groq API response:', data);
    
    const aiResponse = data.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';
    
    return NextResponse.json({
      success: true,
      response: aiResponse
    });

  } catch (error) {
    console.error('Groq API error:', error);
    
    // Fallback responses based on Đà Nẵng
    const locationName = locationInfo?.name || 'Miko Hotel Đà Nẵng';
    const fallbackResponses = [
      `Cảm ơn bạn đã quan tâm đến ${locationName}! Đà Nẵng là thành phố biển tuyệt đẹp với nhiều hoạt động hấp dẫn như tham quan Cầu Vàng, Bà Nà Hills.`,
      `Tôi khuyên bạn nên tham quan các địa điểm nổi tiếng Đà Nẵng vào buổi sáng từ 8h-11h để có trải nghiệm tốt nhất và tránh đông đúc.`,
      `Đà Nẵng có nhiều hoạt động thú vị như tham quan bãi biển Mỹ Khê, thưởng thức món ăn đặc sản như Bún bò Huế, Mì Quảng.`,
      `Thời gian tốt nhất để tham quan Đà Nẵng là từ 8h-17h hàng ngày. Đừng quên mang theo máy ảnh và kem chống nắng nhé!`,
      `Đà Nẵng rất phù hợp cho gia đình và bạn bè. Bạn có thể dành 2-3 ngày để khám phá đầy đủ thành phố này.`,
      `Từ Miko Hotel Đà Nẵng, bạn có thể dễ dàng đến Hội An (30km), Huế (100km) và Bà Nà Hills (40km) để có trải nghiệm du lịch hoàn hảo.`
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return NextResponse.json({
      success: true,
      response: randomResponse
    });
  }
}
