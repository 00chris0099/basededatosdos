import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function GET(request: Request, { params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const product = mockData.products.find(p => p.sku === sku);
  if (!product) return NextResponse.json({ success: false, message: "Producto no encontrado" }, { status: 404 });
  return NextResponse.json({ success: true, data: product });
}

export async function PUT(request: Request, { params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const body = await request.json();
  const product = mockData.products.find(p => p.sku === sku);
  if (!product) return NextResponse.json({ success: false, message: "Producto no encontrado" }, { status: 404 });
  Object.assign(product, body);
  return NextResponse.json({ success: true, message: "Producto actualizado" });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const idx = mockData.products.findIndex(p => p.sku === sku);
  if (idx === -1) return NextResponse.json({ success: false, message: "Producto no encontrado" }, { status: 404 });
  mockData.products.splice(idx, 1);
  return NextResponse.json({ success: true, message: "Producto eliminado" });
}
