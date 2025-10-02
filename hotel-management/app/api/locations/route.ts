import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Lấy các tham số từ query string
    const search = searchParams.get('search') || '';
    const types = searchParams.get('types');
    const limit = searchParams.get('limit') || '10';
    const page = searchParams.get('page') || '1';
    
    // Tạo URL cho API backend
    const url = new URL(`${API_BASE_URL}/api/v1/locations`);
    
    // Thêm các tham số vào URL nếu có
    if (search) url.searchParams.append('search', search);
    if (types && types !== '') {
      // Nếu có types, thêm vào URL
      url.searchParams.append('types', types);
      console.log('Filtering by types:', types);
    } else {
      console.log('No types filter applied');
    }
    url.searchParams.append('limit', limit);
    url.searchParams.append('page', page);
    
    console.log('Final API URL:', url.toString());
    
    // Gọi API backend
    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      // Thêm các headers cần thiết khác nếu có
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Chuyển đổi dữ liệu từ API backend sang định dạng phù hợp với frontend
    const locations = data.data.locations.map((location: any) => ({
      ...location,
      // Thêm các trường bổ sung nếu cần
    }));
    
    return NextResponse.json({
      ...data.data,
      locations
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { 
        statusCode: 500,
        message: "Failed to fetch locations",
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
