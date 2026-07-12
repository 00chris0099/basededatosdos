import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function POST(request: Request) {
  const { orderId, sku } = await request.json();
  const order = mockData.orders.find(o => o.id === orderId);
  if (!order) return NextResponse.json({ success: false, message: "Pedido no encontrado" }, { status: 404 });
  const item = order.items.find(i => i.sku === sku);
  if (!item) return NextResponse.json({ success: false, message: "SKU no encontrado en el pedido" }, { status: 400 });
  if (item.scanned < item.qty) item.scanned++;
  if (order.items.every(i => i.scanned >= i.qty)) order.status = "Packing";
  else order.status = "Picking";
  return NextResponse.json({ success: true, message: "Item confirmado" });
}
