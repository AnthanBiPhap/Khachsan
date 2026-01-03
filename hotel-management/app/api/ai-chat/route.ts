import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/v1`;

// Function để fetch dữ liệu từ backend
async function fetchHotelData() {
  try {
    const [locationsRes, servicesRes, roomsRes, roomTypesRes, bookingsRes, contactInfoRes] = await Promise.allSettled([
      fetch(`${API_URL}/locations?status=active&limit=50`).then(r => r.json()),
      fetch(`${API_URL}/services?status=active&limit=50`).then(r => r.json()),
      fetch(`${API_URL}/rooms?limit=50`).then(r => r.json()),
      fetch(`${API_URL}/room-types?limit=50`).then(r => r.json()),
      fetch(`${API_URL}/bookings?limit=20&sort_by=createdAt&sort_type=desc`).then(r => r.json()),
      fetch(`${API_URL}/contact-info`).then(r => r.json()),
    ]);

    const locations = locationsRes.status === 'fulfilled' 
      ? (locationsRes.value?.data?.data || locationsRes.value?.data?.locations || [])
      : [];
    
    const services = servicesRes.status === 'fulfilled'
      ? (servicesRes.value?.data?.data || servicesRes.value?.data?.services || [])
      : [];
    
    const rooms = roomsRes.status === 'fulfilled'
      ? (roomsRes.value?.data?.data || roomsRes.value?.data?.rooms || [])
      : [];

    const roomTypes = roomTypesRes.status === 'fulfilled'
      ? (roomTypesRes.value?.data?.data || roomTypesRes.value?.data?.roomTypes || [])
      : [];

    const bookings = bookingsRes.status === 'fulfilled'
      ? (bookingsRes.value?.data?.data || bookingsRes.value?.data?.bookings || [])
      : [];

    const contactInfo = contactInfoRes.status === 'fulfilled'
      ? (contactInfoRes.value?.data || contactInfoRes.value || {})
      : {};

    return { locations, services, rooms, roomTypes, bookings, contactInfo };
  } catch (error) {
    console.error('Error fetching hotel data:', error);
    return { locations: [], services: [], rooms: [], roomTypes: [], bookings: [], contactInfo: {} };
  }
}

export async function POST(request: NextRequest) {
  const { message, locationInfo, userPreferences } = await request.json();
  
  // Fetch dữ liệu từ backend (đặt ngoài try-catch để dùng trong catch)
  let locations: any[] = [];
  let services: any[] = [];
  let rooms: any[] = [];
  let roomTypes: any[] = [];
  let bookings: any[] = [];
  let contactInfo: any = {};
  
  try {
    if (!message) {
      return NextResponse.json(
        { error: 'Thiếu tin nhắn' },
        { status: 400 }
      );
    }

    // Fetch dữ liệu từ backend
    const hotelData = await fetchHotelData();
    locations = hotelData.locations;
    services = hotelData.services;
    rooms = hotelData.rooms;
    roomTypes = hotelData.roomTypes;
    bookings = hotelData.bookings;
    contactInfo = hotelData.contactInfo;
    
    // Log để debug
    console.log('📊 Hotel data fetched:', {
      locations: locations.length,
      services: services.length,
      rooms: rooms.length,
      roomTypes: roomTypes.length,
      bookings: bookings.length,
      contactInfo: Object.keys(contactInfo || {}).length
    });

    // Format dữ liệu để đưa vào context
    const locationsText = locations.length > 0
      ? `\n\n=== ĐỊA ĐIỂM THAM QUAN CÓ SẴN (${locations.length} địa điểm) ===\n${locations.slice(0, 15).map((loc: any, index: number) => 
          `${index + 1}. ${loc.name}${loc.type ? ` (${loc.type})` : ''}${loc.address ? ` - ${loc.address}` : ''}${loc.description ? `: ${loc.description.substring(0, 150)}` : ''}`
        ).join('\n')}`
      : '';

    const servicesText = services.length > 0
      ? `\n\n=== DỊCH VỤ KHÁCH SẠN (${services.length} dịch vụ) ===\n${services.slice(0, 15).map((svc: any, index: number) => 
          `${index + 1}. ${svc.name}${svc.basePrice ? ` - Giá: ${svc.basePrice.toLocaleString('vi-VN')} VND` : ''}${svc.description ? `: ${svc.description.substring(0, 150)}` : ''}${svc.workingHours ? ` - Giờ làm việc: ${svc.workingHours.startTime || ''} - ${svc.workingHours.endTime || ''}` : ''}`
        ).join('\n')}`
      : '';

    const roomTypesText = roomTypes.length > 0
      ? `\n\n=== BẢNG GIÁ PHÒNG (${roomTypes.length} loại phòng) ===\n${roomTypes.slice(0, 20).map((type: any, index: number) => 
          `${index + 1}. ${type.name}${type.pricePerNight ? ` - Giá: ${type.pricePerNight.toLocaleString('vi-VN')} VND/đêm` : ''}${type.capacity ? ` - Sức chứa: ${type.capacity} người` : ''}${type.description ? ` - Mô tả: ${type.description.substring(0, 150)}` : ''}`
        ).join('\n')}`
      : '';

    const roomsText = rooms.length > 0
      ? `\n\n=== DANH SÁCH PHÒNG (${rooms.length} phòng) ===\n${rooms.slice(0, 30).map((room: any, index: number) => {
          const typeName = room.typeId?.name || (typeof room.typeId === 'string' ? 'N/A' : (typeof room.typeId === 'object' && room.typeId ? room.typeId.name : 'N/A'));
          const price = room.typeId?.pricePerNight || (typeof room.typeId === 'object' && room.typeId?.pricePerNight ? room.typeId.pricePerNight : null);
          const capacity = room.typeId?.capacity || (typeof room.typeId === 'object' && room.typeId?.capacity ? room.typeId.capacity : null);
          const status = room.status || 'available';
          return `${index + 1}. Phòng ${room.roomNumber} - Loại: ${typeName}${price ? ` - Giá: ${price.toLocaleString('vi-VN')} VND/đêm` : ''}${capacity ? ` - ${capacity} người` : ''} - ${status === 'available' ? 'Sẵn sàng' : status === 'maintenance' ? 'Bảo trì' : 'Không khả dụng'}`;
        }).join('\n')}`
      : '';

    const bookingsText = bookings.length > 0
      ? `\n\n=== THÔNG TIN ĐẶT PHÒNG GẦN ĐÂY (${bookings.length} booking) ===\n${bookings.slice(0, 10).map((booking: any, index: number) => {
          const guestName = booking.customerId?.fullName || booking.guestInfo?.fullName || 'Khách';
          const roomInfo = booking.roomId?.roomNumber || 'N/A';
          const checkIn = booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('vi-VN') : 'N/A';
          const checkOut = booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('vi-VN') : 'N/A';
          const status = booking.status || 'pending';
          return `${index + 1}. ${guestName} - Phòng ${roomInfo} - Từ ${checkIn} đến ${checkOut} - Trạng thái: ${status}`;
        }).join('\n')}`
      : '';

    const contactInfoText = contactInfo && Object.keys(contactInfo).length > 0
      ? `\n\n=== THÔNG TIN LIÊN HỆ ===\n${[
          contactInfo.hotelName ? `Khách sạn: ${contactInfo.hotelName}` : null,
          contactInfo.address ? `Địa chỉ: ${contactInfo.address}` : null,
          contactInfo.phone ? `SĐT: ${contactInfo.phone}` : null,
          contactInfo.email ? `Email: ${contactInfo.email}` : null,
          contactInfo.facebook ? `Facebook: ${contactInfo.facebook}` : null,
          contactInfo.zalo ? `Zalo: ${contactInfo.zalo}` : null,
          contactInfo.website ? `Website: ${contactInfo.website}` : null,
          contactInfo.description ? `Mô tả: ${contactInfo.description}` : null,
        ].filter(Boolean).join('\n')}`
      : '';

    const preferencesText = userPreferences && userPreferences.length > 0 
      ? `\nSở thích của khách hàng: ${userPreferences.join(', ')}. Hãy ưu tiên gợi ý phù hợp với sở thích này.`
      : '';

    // Phân tích câu hỏi để xác định loại
    const messageLower = message.toLowerCase();
    const isAboutRooms = messageLower.includes('phòng') || messageLower.includes('giá phòng') || messageLower.includes('room') || (messageLower.includes('giá') && (messageLower.includes('phòng') || messageLower.includes('khách sạn')));
    const isAboutServices = messageLower.includes('dịch vụ') || messageLower.includes('service') || messageLower.includes('spa') || messageLower.includes('nhà hàng');
    const isAboutLocations = messageLower.includes('địa điểm') || messageLower.includes('location') || messageLower.includes('tham quan') || messageLower.includes('du lịch') || messageLower.includes('vui');
    const isAboutBookings = messageLower.includes('đặt phòng') || messageLower.includes('booking') || messageLower.includes('reservation') || messageLower.includes('đặt');

    const prompt = `Bạn là nhân viên tư vấn của Miko Hotel Đà Nẵng. Bạn có quyền truy cập vào DỮ LIỆU THỰC TẾ từ hệ thống khách sạn.

Thông tin về Miko Hotel Đà Nẵng:
- Tên: ${locationInfo?.name || 'Miko Hotel Đà Nẵng'}
- Địa chỉ: ${locationInfo?.address || 'Đà Nẵng, Việt Nam'}${preferencesText}

DỮ LIỆU THỰC TẾ TỪ HỆ THỐNG KHÁCH SẠN:${roomTypesText}${roomsText}${servicesText}${locationsText}${bookingsText}${contactInfoText}

Câu hỏi của khách hàng: "${message}"

HƯỚNG DẪN TRẢ LỜI:
${isAboutRooms ? `- Khách đang hỏi về PHÒNG/GIÁ PHÒNG. Nếu có dữ liệu trong phần "BẢNG GIÁ PHÒNG" và "DANH SÁCH PHÒNG" ở trên, hãy sử dụng để trả lời cụ thể.
- Nếu không có dữ liệu, trả lời dựa trên kiến thức chung về khách sạn Đà Nẵng một cách tự nhiên` : ''}
${isAboutServices ? `- Khách đang hỏi về DỊCH VỤ. Nếu có dữ liệu trong phần "DỊCH VỤ KHÁCH SẠN" ở trên, hãy sử dụng để trả lời cụ thể.
- Nếu không có dữ liệu, trả lời dựa trên kiến thức chung về dịch vụ khách sạn Đà Nẵng một cách tự nhiên` : ''}
${isAboutLocations ? `- Khách đang hỏi về ĐỊA ĐIỂM. Nếu có dữ liệu trong phần "ĐỊA ĐIỂM THAM QUAN CÓ SẴN" ở trên, hãy sử dụng để trả lời cụ thể.
- Nếu không có dữ liệu, trả lời dựa trên kiến thức chung về địa điểm du lịch Đà Nẵng một cách tự nhiên` : ''}
${isAboutBookings ? `- Khách đang hỏi về ĐẶT PHÒNG. Sử dụng thông tin từ phần "THÔNG TIN ĐẶT PHÒNG GẦN ĐÂY" để tham khảo nếu có.` : ''}
${!isAboutRooms && !isAboutServices && !isAboutLocations && !isAboutBookings ? `- Phân tích câu hỏi và trả lời một cách tự nhiên, ưu tiên dữ liệu có sẵn nếu phù hợp` : ''}

QUY TẮC BẮT BUỘC:
1. ƯU TIÊN: NẾU câu hỏi liên quan đến phòng/dịch vụ/địa điểm/đặt phòng VÀ có dữ liệu trong hệ thống, PHẢI sử dụng dữ liệu thực tế từ hệ thống
2. KHÔNG được trả lời chung chung nếu đã có dữ liệu thực tế trong hệ thống
3. NẾU KHÔNG CÓ dữ liệu trong hệ thống, BẠN CÓ THỂ sử dụng kiến thức chung của bạn về Đà Nẵng để trả lời
4. Khi sử dụng dữ liệu thực tế: Liệt kê cụ thể tên, giá (nếu có), mô tả
5. Khi không có dữ liệu: Trả lời dựa trên kiến thức chung về Đà Nẵng một cách tự nhiên
6. KHÔNG được đề cập đến "dữ liệu hệ thống", "thông tin chung", "không có trong hệ thống" - chỉ trả lời tự nhiên như một nhân viên tư vấn
7. Trả lời ngắn gọn, rõ ràng, tối đa 250 từ
8. Trả lời bằng tiếng Việt
9. Luôn thân thiện và hữu ích`;

    // Groq API Key - Lấy từ biến môi trường
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      console.error('❌ Groq API Key không được cấu hình. Vui lòng thêm GROQ_API_KEY vào file .env.local');
      throw new Error('Groq API Key chưa được cấu hình');
    }
    
    // Debug: Log API key (chỉ để debug)
    console.log('Groq API Key:', GROQ_API_KEY ? 'Có API key' : 'Không có API key');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
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
    console.error('❌ Groq API error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    
    // Fallback: Sử dụng dữ liệu đã fetch ở trên (không fetch lại)
    const fallbackMessageLower = message.toLowerCase();
    const isAboutRooms = fallbackMessageLower.includes('phòng') || fallbackMessageLower.includes('giá phòng') || fallbackMessageLower.includes('room') || (fallbackMessageLower.includes('giá') && (fallbackMessageLower.includes('phòng') || fallbackMessageLower.includes('khách sạn')));
    const isAboutServices = fallbackMessageLower.includes('dịch vụ') || fallbackMessageLower.includes('service') || fallbackMessageLower.includes('spa') || fallbackMessageLower.includes('nhà hàng');
    const isAboutLocations = fallbackMessageLower.includes('địa điểm') || fallbackMessageLower.includes('location') || fallbackMessageLower.includes('tham quan') || fallbackMessageLower.includes('du lịch') || fallbackMessageLower.includes('vui');
    
    // Trả lời dựa trên dữ liệu thực tế
    if (isAboutRooms && roomTypes.length > 0) {
      const roomsInfo = roomTypes.slice(0, 10).map((type: any, index: number) => 
        `${index + 1}. ${type.name}${type.pricePerNight ? ` - ${type.pricePerNight.toLocaleString('vi-VN')} VND/đêm` : ''}${type.capacity ? ` (${type.capacity} người)` : ''}${type.description ? ` - ${type.description.substring(0, 80)}` : ''}`
      ).join('\n');
      
      return NextResponse.json({
        success: true,
        response: `Dưới đây là thông tin về các loại phòng tại Miko Hotel Đà Nẵng:\n\n${roomsInfo}\n\nBạn muốn biết thêm thông tin về loại phòng nào?`
      });
    }
    
    if (isAboutLocations && locations.length > 0) {
      const locationsInfo = locations.slice(0, 10).map((loc: any, index: number) => 
        `${index + 1}. ${loc.name}${loc.type ? ` (${loc.type})` : ''}${loc.address ? ` - ${loc.address}` : ''}${loc.description ? `: ${loc.description.substring(0, 100)}` : ''}`
      ).join('\n');
      
      return NextResponse.json({
        success: true,
        response: `Dưới đây là các địa điểm tham quan thú vị tại Đà Nẵng:\n\n${locationsInfo}\n\nBạn muốn biết thêm về địa điểm nào?`
      });
    }
    
    if (isAboutServices && services.length > 0) {
      const servicesInfo = services.slice(0, 10).map((svc: any, index: number) => 
        `${index + 1}. ${svc.name}${svc.basePrice ? ` - ${svc.basePrice.toLocaleString('vi-VN')} VND` : ''}${svc.description ? `: ${svc.description.substring(0, 100)}` : ''}`
      ).join('\n');
      
      return NextResponse.json({
        success: true,
        response: `Dưới đây là các dịch vụ tại Miko Hotel Đà Nẵng:\n\n${servicesInfo}\n\nBạn muốn biết thêm về dịch vụ nào?`
      });
    }
    
    // Fallback responses - Câu hỏi sơ cứu khi mất mạng/API lỗi
    const locationName = locationInfo?.name || 'Miko Hotel Đà Nẵng';
    
    // Phân tích câu hỏi để trả lời phù hợp
    if (fallbackMessageLower.includes('phòng') || fallbackMessageLower.includes('giá') || fallbackMessageLower.includes('room')) {
      return NextResponse.json({
        success: true,
        response: `Miko Hotel Đà Nẵng có nhiều loại phòng đa dạng phù hợp với mọi nhu cầu. Chúng tôi có phòng đơn, phòng đôi, phòng gia đình và suite cao cấp. Giá phòng dao động từ 500.000 - 2.000.000 VND/đêm tùy loại phòng và thời điểm. Bạn có thể liên hệ trực tiếp để được tư vấn chi tiết và đặt phòng với giá ưu đãi nhất.`
      });
    }
    
    if (fallbackMessageLower.includes('dịch vụ') || fallbackMessageLower.includes('service') || fallbackMessageLower.includes('spa')) {
      return NextResponse.json({
        success: true,
        response: `Miko Hotel Đà Nẵng cung cấp đầy đủ các dịch vụ tiện ích: nhà hàng phục vụ ẩm thực địa phương và quốc tế, spa thư giãn, phòng gym, hồ bơi, dịch vụ đưa đón sân bay, tour du lịch. Chúng tôi luôn sẵn sàng phục vụ bạn 24/7.`
      });
    }
    
    if (fallbackMessageLower.includes('địa điểm') || fallbackMessageLower.includes('tham quan') || fallbackMessageLower.includes('du lịch') || fallbackMessageLower.includes('vui')) {
      return NextResponse.json({
        success: true,
        response: `Đà Nẵng có nhiều địa điểm tham quan nổi tiếng: Cầu Vàng (Bà Nà Hills), Chùa Linh Ứng, Bãi biển Mỹ Khê, Bãi biển Non Nước, Bảo tàng Chăm, Công viên Châu Á. Từ khách sạn, bạn có thể dễ dàng đến Hội An (30km) và Huế (100km). Chúng tôi có thể hỗ trợ đặt tour và phương tiện di chuyển.`
      });
    }
    
    if (fallbackMessageLower.includes('đặt phòng') || fallbackMessageLower.includes('booking') || fallbackMessageLower.includes('reservation')) {
      return NextResponse.json({
        success: true,
        response: `Để đặt phòng tại Miko Hotel Đà Nẵng, bạn có thể: 1) Đặt trực tuyến qua website, 2) Gọi hotline 24/7, 3) Đến trực tiếp khách sạn. Chúng tôi có chính sách hủy phòng linh hoạt và nhiều ưu đãi đặc biệt. Vui lòng liên hệ để được tư vấn chi tiết.`
      });
    }
    
    if (fallbackMessageLower.includes('ăn uống') || fallbackMessageLower.includes('nhà hàng') || fallbackMessageLower.includes('món ăn')) {
      return NextResponse.json({
        success: true,
        response: `Đà Nẵng nổi tiếng với ẩm thực phong phú: Bún bò Huế, Mì Quảng, Bánh xèo, Hải sản tươi sống. Khách sạn có nhà hàng phục vụ các món đặc sản địa phương và ẩm thực quốc tế. Ngoài ra, bạn có thể thưởng thức tại các nhà hàng ven biển hoặc chợ đêm Đà Nẵng.`
      });
    }
    
    if (fallbackMessageLower.includes('rạp chiếu phim') || fallbackMessageLower.includes('cinema') || fallbackMessageLower.includes('phim')) {
      return NextResponse.json({
        success: true,
        response: `Ở Đà Nẵng có một số rạp chiếu phim như CGV, Lotte Cinema, Galaxy Cinema tại các trung tâm thương mại. Các rạp này thường có phòng chiếu IMAX và 4DX, rất phù hợp cho gia đình và bạn bè. Từ khách sạn, bạn có thể dễ dàng di chuyển đến các rạp này.`
      });
    }
    
    // Fallback chung
    return NextResponse.json({
      success: true,
      response: `Cảm ơn bạn đã quan tâm đến ${locationName}! Chúng tôi rất vui được hỗ trợ bạn về: đặt phòng, dịch vụ khách sạn, địa điểm tham quan Đà Nẵng, ẩm thực địa phương. Bạn muốn biết thêm thông tin gì? Vui lòng hỏi cụ thể hoặc liên hệ trực tiếp để được tư vấn chi tiết.`
    });
  }
}
