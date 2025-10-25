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
    
    console.log('🔍 Calling backend API:', url.toString());
    
    // Gọi API backend
    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      // Thêm các headers cần thiết khác nếu có
    });
    
    console.log('🔍 Backend response status:', response.status);
    console.log('🔍 Backend response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 Backend error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log('🔍 Raw data from backend:', data);
    console.log('🔍 Data structure:', {
      hasData: !!data.data,
      hasLocations: !!data.data?.locations,
      locationsLength: data.data?.locations?.length || 0
    });
    
    // Chuyển đổi dữ liệu từ API backend sang định dạng phù hợp với frontend
    const allLocations = data.data?.locations || [];
    
    console.log('🔍 Total locations from backend:', allLocations.length);
    
    if (allLocations.length > 0) {
      console.log('🔍 First location sample:', allLocations[0]);
      console.log('🔍 Location statuses:', allLocations.map((loc: any) => ({ 
        id: loc._id, 
        name: loc.name, 
        status: loc.status 
      })));
    } else {
      console.log('⚠️ No locations found in backend response');
    }
    
    // Chỉ trả về location có trạng thái active (không ẩn)
    const visibleLocations = allLocations.filter((location: any) => 
      location.status === 'active'
    );
    
    console.log('🔍 Total locations:', allLocations.length);
    console.log('🔍 Visible locations (active only):', visibleLocations.length);
    console.log('🔍 Hidden locations:', allLocations.filter((loc: any) => loc.status === 'hidden').length);
    
    return NextResponse.json({
      ...data.data,
      locations: visibleLocations
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
