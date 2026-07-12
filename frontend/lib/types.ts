export interface User {
  id: number;
  name: string;
  email: string;
  dni: string;
  role: string;
  password: string;
  photo: string;
  active: boolean;
}

export interface Product {
  sku: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  description: string;
  stock: number;
  min: number;
  max: number;
  price: number;
  image: string;
  location: string;
  status: string;
  capacity: number;
  movements: [string, number, string, string][];
}

export interface Location {
  code: string;
  zone: string;
  rack: string;
  level: string;
  capacity: number;
  used: number;
  type: string;
}

export interface OrderItem {
  sku: string;
  qty: number;
  scanned: number;
}

export interface Order {
  id: string;
  customer: string;
  priority: string;
  date: string;
  amount: number;
  status: string;
  assigned: string;
  items: OrderItem[];
  route: string;
}

export interface Incident {
  orderId: string;
  msg: string;
  user: string;
  date: string;
}

export interface WarehouseConfig {
  sections: string[];
  aisles: string[];
  levels: string[];
  bins: string[];
}

export interface Session {
  id: number;
  name: string;
  email: string;
  dni: string;
  role: string;
  photo: string;
}

export interface WMSData {
  users: User[];
  products: Product[];
  locations: Location[];
  orders: Order[];
  incidents: Incident[];
  warehouseConfig: WarehouseConfig;
  session: Session | null;
}
