import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/services`, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Trả về data.data.data (nested structure từ backend)
    const servicesData = data?.data?.data || data?.data || data || [];
    
    return NextResponse.json(servicesData);
  } catch (error) {
    console.error("❌ Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
