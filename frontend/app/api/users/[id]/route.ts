import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = mockData.users.find(u => u.id === Number(id));
  if (!user) return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 });
  return NextResponse.json({ success: true, data: { ...user, password: undefined } });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const user = mockData.users.find(u => u.id === Number(id));
  if (!user) return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 });
  if (body.name) user.name = body.name;
  if (body.email) user.email = body.email;
  if (body.dni) user.dni = body.dni;
  if (body.photo) user.photo = body.photo;
  if (body.role) user.role = body.role;
  if (mockData.session?.id === user.id) {
    mockData.session = { id: user.id, name: user.name, email: user.email, dni: user.dni, role: user.role, photo: user.photo };
  }
  return NextResponse.json({ success: true, message: "Usuario actualizado" });
}
