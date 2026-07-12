import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function GET() {
  return NextResponse.json({ success: true, data: mockData.orders });
}

export async function POST() {
  const id = "ORD-" + Math.floor(9000 + Math.random() * 999);
  const workers = mockData.users.filter(u => u.role === "Operario" || u.role === "Supervisor");
  const newOrder = {
    id, customer: "Cliente Demo " + id, priority: "Media",
    date: new Date().toLocaleString("es-PE"), amount: 320,
    status: "Pendiente", assigned: workers[0]?.name || "Sin asignar",
    items: [{ sku: mockData.products[0]?.sku || "SKU-2026-0001", qty: 1, scanned: 0 }],
    route: "Recepción → Picking",
  };
  mockData.orders.unshift(newOrder);
  return NextResponse.json({ success: true, message: "Pedido creado", data: { id } }, { status: 201 });
}
