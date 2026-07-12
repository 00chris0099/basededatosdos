import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";
import { uniqueSKU } from "@/lib/utils/format";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() || "";
  const status = searchParams.get("status") || "";
  let products = mockData.products;
  if (search) {
    products = products.filter(p => p.sku.toLowerCase().includes(search) || p.name.toLowerCase().includes(search));
  }
  if (status && status !== "Todos") {
    products = products.filter(p => p.status === status);
  }
  return NextResponse.json({ success: true, data: products });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, brand, category, unit, description, price, stock, min, max, location, image } = body;
  if (!name) return NextResponse.json({ success: false, message: "Nombre es requerido" }, { status: 400 });
  const sku = uniqueSKU(mockData.products.map(p => p.sku));
  const newProduct = {
    sku, name, brand: brand || "", category: category || "Electrónica", unit: unit || "Unidad",
    description: description || "", stock: stock || 0, min: min || 0, max: max || 100,
    price: price || 0, image: image || "", location: location || "A-01-01-01",
    status: "En Stock", capacity: 0, movements: [] as [string, number, string, string][],
  };
  mockData.products.push(newProduct);
  return NextResponse.json({ success: true, message: "Producto creado", data: { sku } }, { status: 201 });
}
