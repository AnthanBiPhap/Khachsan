import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";

// GET: lấy chi tiết phòng theo id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log("id", id);
    const response = await fetch(`${API_BASE_URL}/api/v1/rooms/${id}`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    return NextResponse.json(data?.data);
  } catch (error) {
    console.error("Error fetching room detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch room detail" },
      { status: 500 }
    );
  }
}

// POST: đặt phòng (tạo booking) cho phòng theo id
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/v1/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, roomId: id }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
