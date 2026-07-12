import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = mockData.orders.find(o => o.id === id);
  if (!order) return NextResponse.json({ success: false, message: "Pedido no encontrado" }, { status: 404 });
  order.status = "Listo para Despacho";
  return NextResponse.json({ success: true, message: "Empaque confirmado" });
}
