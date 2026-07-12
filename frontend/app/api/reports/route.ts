import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function GET() {
  const kpis = {
    topSku: mockData.products[0]?.sku || "N/A",
    topSkuName: mockData.products[0]?.name || "N/A",
    avgTime: "18.5 min",
    occupancy: mockData.locations.length > 0
      ? Math.round(mockData.locations.reduce((a, l) => a + l.used, 0) / mockData.locations.reduce((a, l) => a + l.capacity, 0) * 100)
      : 0,
  };
  return NextResponse.json({ success: true, data: kpis });
}
