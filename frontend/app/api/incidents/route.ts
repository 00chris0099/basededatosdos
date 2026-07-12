import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function GET() {
  return NextResponse.json({ success: true, data: mockData.incidents });
}

export async function POST(request: Request) {
  const { orderId, message } = await request.json();
  mockData.incidents.unshift({
    orderId, msg: message, user: mockData.session?.name || "Sistema",
    date: new Date().toLocaleString("es-PE"),
  });
  return NextResponse.json({ success: true, message: "Incidencia registrada" }, { status: 201 });
}
