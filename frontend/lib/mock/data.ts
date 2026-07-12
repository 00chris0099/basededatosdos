const imgs = {
  drill: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=500&auto=format&fit=crop",
  shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500&auto=format&fit=crop",
  laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=500&auto=format&fit=crop",
  headset: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500&auto=format&fit=crop",
  cable: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=500&auto=format&fit=crop",
};

export const mockData = {
  users: [
    { id: 1, name: "Alex Thompson", email: "admin@wmspro.com", dni: "70000001", role: "Administrador", password: "123456", photo: "https://i.pravatar.cc/120?img=12", active: true },
    { id: 2, name: "María Ramos", email: "supervisor@wmspro.com", dni: "70000002", role: "Supervisor", password: "123456", photo: "https://i.pravatar.cc/120?img=32", active: true },
    { id: 3, name: "Juan Delgado", email: "operario@wmspro.com", dni: "70000003", role: "Operario", password: "123456", photo: "https://i.pravatar.cc/120?img=52", active: true },
    { id: 4, name: "Samuel Kiyosaki", email: "dueno@wmspro.com", dni: "70000004", role: "Dueño", password: "123456", photo: "https://i.pravatar.cc/120?img=60", active: true },
  ],
  products: [
    { sku: "SKU-2026-0001", name: "Taladro Percutor Inalámbrico 20V Max", brand: "DeWalt", category: "Herramientas Eléctricas", unit: "Unidad", description: "Taladro percutor de alto rendimiento diseñado para uso industrial y profesional. Incluye batería de ion litio y maletín de transporte.", stock: 142, min: 50, max: 180, price: 450, image: imgs.drill, location: "A4-12-03", status: "En Stock", capacity: 79, movements: [["Salida", -12, "Pedido ORD-8921", "M. Ramos"], ["Entrada", 60, "Recepción OC-445", "J. López"], ["Ajuste", -2, "Inventario cíclico", "S. Aguila"]] },
    { sku: "SKU-2026-0002", name: "Sneaker Pro X-Series Talla 42", brand: "Urban Fit", category: "Calzado", unit: "Par", description: "Zapatilla deportiva para venta ecommerce.", stock: 34, min: 20, max: 60, price: 129, image: imgs.shoes, location: "A-12-04", status: "En Stock", capacity: 56, movements: [["Salida", -3, "Pedido ORD-8234", "Juan Delgado"]] },
    { sku: "SKU-2026-0003", name: "Microsoft Surface Laptop 4", brand: "Microsoft", category: "Electrónica", unit: "Unidad", description: "Laptop para oficina y productividad.", stock: 8, min: 15, max: 40, price: 3200, image: imgs.laptop, location: "C-03-01", status: "Bajo Stock", capacity: 20, movements: [["Salida", -2, "Pedido ORD-8235", "Juan Delgado"]] },
    { sku: "SKU-2026-0004", name: "Headphones ProSound X2", brand: "Logitech", category: "Electrónica", unit: "Unidad", description: "Audífonos inalámbricos con cancelación de ruido.", stock: 0, min: 5, max: 30, price: 260, image: imgs.headset, location: "B-02-04", status: "Agotado", capacity: 100, movements: [["Salida", -5, "Pedido ORD-8236", "J. López"]] },
    { sku: "SKU-2026-0005", name: "Cable USB-C Fast Charging", brand: "Baseus", category: "Accesorios", unit: "Unidad", description: "Cable de carga rápida tipo C.", stock: 150, min: 50, max: 160, price: 24.5, image: imgs.cable, location: "C-04-06", status: "En Stock", capacity: 94, movements: [["Entrada", 120, "Recepción OC-452", "M. Ramos"]] },
  ],
  locations: [
    { code: "A4-12-03", zone: "A4", rack: "12", level: "03", capacity: 180, used: 142, type: "Herramientas" },
    { code: "A-12-04", zone: "A", rack: "12", level: "04", capacity: 60, used: 34, type: "Calzado" },
    { code: "C-03-01", zone: "C", rack: "03", level: "01", capacity: 40, used: 8, type: "Electrónica" },
    { code: "B-02-04", zone: "B", rack: "02", level: "04", capacity: 30, used: 30, type: "Electrónica" },
    { code: "C-04-06", zone: "C", rack: "04", level: "06", capacity: 160, used: 150, type: "Accesorios" },
  ],
  orders: [
    { id: "ORD-8921", customer: "Lucía Hernández", priority: "Alta", date: "24/10/2026 09:12", amount: 1420, status: "Pendiente", assigned: "Juan Delgado", items: [{ sku: "SKU-2026-0001", qty: 3, scanned: 0 }, { sku: "SKU-2026-0002", qty: 1, scanned: 0 }], route: "Almacén Central → Zona Sur" },
    { id: "ORD-8234", customer: "Alejandro Sanz", priority: "Media", date: "24/10/2026 08:32", amount: 246.8, status: "Picking", assigned: "Juan Delgado", items: [{ sku: "SKU-2026-0002", qty: 1, scanned: 0 }, { sku: "SKU-2026-0004", qty: 2, scanned: 0 }], route: "A-12 → Packing" },
    { id: "ORD-8235", customer: "Mercado Urbano", priority: "Alta", date: "24/10/2026 08:10", amount: 2890, status: "Packing", assigned: "María Ramos", items: [{ sku: "SKU-2026-0003", qty: 1, scanned: 1 }, { sku: "SKU-2026-0005", qty: 2, scanned: 1 }], route: "Packing → Despacho" },
    { id: "ORD-8236", customer: "Amazon S.A.", priority: "Baja", date: "23/10/2026 17:20", amount: 89, status: "Entregado", assigned: "María Ramos", items: [{ sku: "SKU-2026-0005", qty: 3, scanned: 3 }], route: "Despacho → Cliente" },
  ],
  incidents: [] as { orderId: string; msg: string; user: string; date: string }[],
  warehouseConfig: {
    sections: ["A", "B", "C", "D", "E"],
    aisles: ["1", "2", "3", "4", "5", "6", "7"],
    levels: ["01", "02", "03", "04", "05", "06"],
    bins: ["01", "02", "03", "04"],
  },
  session: null as { id: number; name: string; email: string; dni: string; role: string; photo: string } | null,
};
