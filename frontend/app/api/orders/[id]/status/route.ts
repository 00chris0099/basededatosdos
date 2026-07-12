import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await request.json();
  const order = mockData.orders.find(o => o.id === id);
  if (!order) return NextResponse.json({ success: false, message: "Pedido no encontrado" }, { status: 404 });
  order.status = status;
  return NextResponse.json({ success: true, message: "Estado actualizado" });
}
