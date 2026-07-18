const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RequestOptions {
  method?: string;
  body?: any;
  token?: string;
}

export async function apiClient<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Error en la solicitud');
  }

  return data;
}

export interface Category {
  Id_Categoria: number;
  Nombre_Categoria: string;
}

export interface Brand {
  Id_Marca: number;
  Nombre_Marca: string;
  Id_Categoria: number;
  Nombre_Categoria: string;
}

export async function getCategories(token: string): Promise<Category[]> {
  const res = await apiClient<{ success: boolean; data: Category[] }>("/api/products/categories", { token });
  return res.data;
}

export async function createCategory(nombre: string, token: string): Promise<Category> {
  const res = await apiClient<{ success: boolean; data: Category }>("/api/products/categories", {
    method: "POST",
    body: { nombre },
    token,
  });
  return res.data;
}

export async function getBrandsByCategory(categoryId: number, token: string): Promise<Brand[]> {
  const res = await apiClient<{ success: boolean; data: Brand[] }>(`/api/brands/${categoryId}`, { token });
  return res.data;
}

export async function createBrand(nombre: string, categoriaId: number, token: string): Promise<Brand> {
  const res = await apiClient<{ success: boolean; data: Brand }>("/api/brands", {
    method: "POST",
    body: { nombre, categoriaId },
    token,
  });
  return res.data;
}

export interface Order {
  Id_Pedido: number;
  Fecha_Pedido: string;
  Precio_Total: number;
  Cliente: string;
  Estado_Pedido: string;
  Total_Lineas: number;
  Total_Unidades: number;
}

export interface OrderDetail extends Order {
  Id_Cliente: number;
  Num_Documento: string;
  Telefono_Cliente: string;
  items: OrderItem[];
}

export interface OrderItem {
  Id_Detalle_Pedido: number;
  Cantidad: number;
  Subtotal: number;
  Precio_Unitario: number;
  Id_Producto: number;
  Nombre_Producto: string;
  Codigo_Producto: string;
}

export interface Client {
  Id_Cliente: number;
  Nombre: string;
  Num_Documento: string;
}

export async function getOrders(token: string): Promise<Order[]> {
  const res = await apiClient<{ success: boolean; data: Order[] }>("/api/orders", { token });
  return res.data;
}

export async function getOrderById(id: number, token: string): Promise<OrderDetail> {
  const res = await apiClient<{ success: boolean; data: OrderDetail }>(`/api/orders/${id}`, { token });
  return res.data;
}

export async function createOrder(clienteId: number, items: { Id_Producto: number; Cantidad: number; Precio_Unitario: number }[], token: string): Promise<{ id: number }> {
  const res = await apiClient<{ success: boolean; data: { id: number } }>("/api/orders", {
    method: "POST",
    body: { clienteId, items },
    token,
  });
  return res.data;
}

export async function advanceOrder(id: number, token: string): Promise<{ Nuevo_Estado: string }> {
  const res = await apiClient<{ success: boolean; data: { Nuevo_Estado: string } }>(`/api/orders/${id}/advance`, {
    method: "POST",
    token,
  });
  return res.data;
}

export async function updateOrderStatus(id: number, status: string, token: string): Promise<void> {
  await apiClient(`/api/orders/${id}/status`, {
    method: "PUT",
    body: { status },
    token,
  });
}

export async function getClients(token: string): Promise<Client[]> {
  const res = await apiClient<{ success: boolean; data: Client[] }>("/api/products/clients", { token });
  return res.data;
}

export async function getAllProducts(token: string): Promise<any[]> {
  const res = await apiClient<{ success: boolean; data: any[] }>("/api/products", { token });
  return res.data;
}
