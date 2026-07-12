import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function GET() {
  const pending = mockData.orders.filter(o => ["Packing", "Picking", "Listo para Despacho"].includes(o.status));
  return NextResponse.json({ success: true, data: pending });
}
