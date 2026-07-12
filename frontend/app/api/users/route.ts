import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function GET() {
  return NextResponse.json({ success: true, data: mockData.users.map(u => ({ ...u, password: undefined })) });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, dni, role, password } = body;
  if (!name || !email || !dni || !role) {
    return NextResponse.json({ success: false, message: "Campos requeridos faltantes" }, { status: 400 });
  }
  if (mockData.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return NextResponse.json({ success: false, message: "El correo ya existe" }, { status: 400 });
  }
  const newUser = {
    id: Date.now(),
    name, email, dni, role,
    password: password || "123456",
    photo: "https://i.pravatar.cc/120?u=" + encodeURIComponent(email),
    active: true,
  };
  mockData.users.push(newUser);
  return NextResponse.json({ success: true, message: "Usuario creado exitosamente" }, { status: 201 });
}
