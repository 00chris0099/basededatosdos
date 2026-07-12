import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = mockData.orders.find(o => o.id === id);
  if (!order) return NextResponse.json({ success: false, message: "Pedido no encontrado" }, { status: 404 });
  return NextResponse.json({ success: true, data: order });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = mockData.orders.findIndex(o => o.id === id);
  if (idx === -1) return NextResponse.json({ success: false, message: "Pedido no encontrado" }, { status: 404 });
  mockData.orders.splice(idx, 1);
  return NextResponse.json({ success: true, message: "Pedido eliminado" });
}
