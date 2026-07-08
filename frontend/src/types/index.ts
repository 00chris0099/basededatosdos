export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  photo: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockMinimo: number;
  categoryName: string;
  stockActual: number;
  estadoStock: string;
  ubicacionCodigo: string;
}

export interface Location {
  codigo: string;
  pasillo: number;
  estante: number;
  nivel: number;
}

export interface Order {
  id: number;
  fecha: string;
  precioTotal: number;
  clienteNombre: string;
  estado: string;
}

export interface OrderDetail {
  id: number;
  cantidad: number;
  subtotal: number;
  precioUnitario: number;
  productoNombre: string;
}

export interface Picking {
  id: number;
  fecha: string;
  pedidoId: number;
  estado: string;
}

export interface Packing {
  id: number;
  fecha: string;
  pickingId: number;
  estado: string;
}

export interface Despacho {
  id: number;
  direccionEnvio: string;
  fecha: string;
  packingId: number;
  estado: string;
}

export interface Movement {
  id: number;
  fecha: string;
  usuario: string;
  tipo: string;
  observacion: string;
}

export interface ReportSummary {
  totalProducts: number;
  totalOrders: number;
  stockAlerts: number;
  totalMovements: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
