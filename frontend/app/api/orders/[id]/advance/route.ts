import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";
import { nextOrderStatus } from "@/lib/utils/format";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = mockData.orders.find(o => o.id === id);
  if (!order) return NextResponse.json({ success: false, message: "Pedido no encontrado" }, { status: 404 });
  if (order.status === "Cancelado" || order.status === "Entregado") {
    return NextResponse.json({ success: false, message: "Este pedido ya no puede avanzar" }, { status: 400 });
  }
  order.status = nextOrderStatus(order.status);
  return NextResponse.json({ success: true, message: "Pedido avanzado", data: { status: order.status } });
}
