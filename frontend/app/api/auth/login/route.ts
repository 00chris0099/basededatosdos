import { NextResponse } from "next/server";
import { mockData } from "@/lib/mock/data";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ success: false, message: "Correo y contraseña son requeridos" }, { status: 400 });
  }
  const user = mockData.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.active
  );
  if (!user) {
    return NextResponse.json({ success: false, message: "Credenciales inválidas" }, { status: 400 });
  }
  const session = { id: user.id, name: user.name, email: user.email, dni: user.dni, role: user.role, photo: user.photo };
  return NextResponse.json({ success: true, token: "mock-jwt-token-" + user.id, user: session });
}
