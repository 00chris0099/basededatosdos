import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function GET() {
  return NextResponse.json({ success: true, data: mockData.warehouseConfig });
}

export async function PUT(request: Request) {
  const { type, value } = await request.json();
  if (type === "section" && value) {
    if (!mockData.warehouseConfig.sections.includes(value)) {
      mockData.warehouseConfig.sections.push(value);
    }
  } else if (type === "aisle" && value) {
    if (!mockData.warehouseConfig.aisles.includes(value)) {
      mockData.warehouseConfig.aisles.push(value);
    }
  }
  return NextResponse.json({ success: true, data: mockData.warehouseConfig });
}
