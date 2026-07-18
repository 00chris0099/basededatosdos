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
