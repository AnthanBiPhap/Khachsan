import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Gọi API backend để lấy thông tin chi tiết địa điểm
    const response = await fetch(`${API_BASE_URL}/api/v1/locations/${params.id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { 
            statusCode: 404,
            message: "Không tìm thấy địa điểm"
          }, 
          { status: 404 }
        );
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Trả về dữ liệu từ API backend
    return NextResponse.json(data.data);
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json(
      { 
        statusCode: 500,
        message: "Lỗi khi tải thông tin địa điểm",
        error: error instanceof Error ? error.message : 'Lỗi không xác định'
      }, 
      { status: 500 }
    );
  }
}
