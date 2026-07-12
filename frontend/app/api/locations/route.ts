import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function GET() {
  return NextResponse.json({ success: true, data: mockData.locations });
}

export async function POST(request: Request) {
  const body = await request.json();
  mockData.locations.push(body);
  return NextResponse.json({ success: true, message: "Ubicación creada" }, { status: 201 });
}
