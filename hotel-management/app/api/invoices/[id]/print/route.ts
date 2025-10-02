// app/api/invoices/[id]/print/route.ts
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const backendUrl = `${API_BASE_URL}/api/v1/invoices/${id}/print`;
    console.log("Calling backend:", backendUrl);

    const backendRes = await fetch(backendUrl);

    if (!backendRes.ok) {
      const text = await backendRes.text();
      console.error("Backend error:", backendRes.status, text);
      return NextResponse.json(
        {
          error: "Backend fetch failed",
          details: `Status ${backendRes.status}: ${text}`,
        },
        { status: backendRes.status }
      );
    }

    // Trả PDF trực tiếp bằng stream
    return new Response(backendRes.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error fetching invoice PDF:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch invoice PDF",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
