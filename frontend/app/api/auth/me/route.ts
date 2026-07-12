import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function GET() {
  if (!mockData.session) {
    return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 });
  }
  return NextResponse.json({ success: true, user: mockData.session });
}
