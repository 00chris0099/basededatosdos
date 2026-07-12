import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function GET() {
  const order = mockData.orders.find(o => o.status === "Picking" || o.status === "Pendiente") || mockData.orders[0];
  return NextResponse.json({ success: true, data: order });
}
