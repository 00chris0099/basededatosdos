import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function GET() {
  const stats = {
    pendiente: mockData.orders.filter(o => o.status === "Pendiente").length,
    listo: mockData.orders.filter(o => o.status === "Listo para Despacho").length,
    enRuta: mockData.orders.filter(o => o.status === "En Ruta").length,
    entregado: mockData.orders.filter(o => o.status === "Entregado").length,
  };
  return NextResponse.json({ success: true, data: { stats, orders: mockData.orders } });
}
