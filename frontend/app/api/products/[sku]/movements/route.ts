import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function POST(request: Request, { params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const body = await request.json();
  const { type, quantity, reason } = body;
  const product = mockData.products.find(p => p.sku === sku);
  if (!product) return NextResponse.json({ success: false, message: "Producto no encontrado" }, { status: 404 });
  product.stock += quantity;
  if (product.stock < 0) product.stock = 0;
  product.status = product.stock === 0 ? "Agotado" : product.stock <= product.min ? "Bajo Stock" : "En Stock";
  product.capacity = Math.round(product.stock / product.max * 100);
  product.movements.unshift([type || "Ajuste", quantity, reason || "Movimiento", mockData.session?.name || "Sistema"]);
  return NextResponse.json({ success: true, message: "Movimiento registrado" });
}
