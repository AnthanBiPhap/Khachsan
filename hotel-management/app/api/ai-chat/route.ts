import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { message, locationInfo } = await request.json();
  
  try {
    if (!message) {
      return NextResponse.json(
        { error: 'Thiếu tin nhắn' },
        { status: 400 }
      );
    }

    // Sử dụng Groq API (nhanh và miễn phí)
    const prompt = `Bạn là một hướng dẫn viên du lịch chuyên nghiệp và thân thiện. 

Thông tin địa điểm:
- Tên: ${locationInfo?.name || 'địa điểm tham quan'}
- Địa chỉ: ${locationInfo?.address || 'không xác định'}
- Loại: ${locationInfo?.type || 'địa điểm tham quan'}

Câu hỏi của khách hàng: ${message}

QUAN TRỌNG: Trả lời ngắn gọn, tối đa 150 từ. Tập trung vào thông tin hữu ích nhất. Không dài dòng.`;

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
    
    // Fallback responses based on location
    const locationName = locationInfo?.name || 'địa điểm này';
    const fallbackResponses = [
      `Cảm ơn bạn đã quan tâm đến ${locationName}! Đây là một nơi rất thú vị để tham quan với nhiều hoạt động hấp dẫn.`,
      `Tôi khuyên bạn nên tham quan ${locationName} vào buổi sáng từ 8h-11h để có trải nghiệm tốt nhất và tránh đông đúc.`,
      `Địa điểm ${locationName} có nhiều hoạt động thú vị như tham quan, chụp ảnh, thưởng thức ẩm thực địa phương và khám phá văn hóa.`,
      `Thời gian tốt nhất để tham quan là từ 8h-17h hàng ngày. Đừng quên mang theo máy ảnh và nước uống nhé!`,
      `Địa điểm này rất phù hợp cho gia đình và bạn bè. Bạn có thể dành 2-3 giờ để khám phá đầy đủ.`
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return NextResponse.json({
      success: true,
      response: randomResponse
    });
  }
}
