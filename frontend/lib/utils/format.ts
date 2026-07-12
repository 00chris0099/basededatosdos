export function money(n: number): string {
  return "S/ " + Number(n).toLocaleString("es-PE", { minimumFractionDigits: 2 });
}

export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function statusBadgeColor(s: string): string {
  const map: Record<string, string> = {
    Pendiente: "badge-pendiente",
    Picking: "badge-picking",
    Packing: "badge-packing",
    "Listo para Despacho": "badge-pendiente",
    "En Ruta": "badge-picking",
    Entregado: "badge-en-ruta",
    Despachado: "badge-en-ruta",
    Cancelado: "badge-cancelado",
    "En Stock": "badge-en-ruta",
    "Bajo Stock": "badge-packing",
    Agotado: "badge-cancelado",
    Alta: "badge-cancelado",
    Media: "badge-packing",
    Baja: "badge-pendiente",
    Entrada: "badge-en-ruta",
    Salida: "badge-cancelado",
    Ajuste: "badge-packing",
  };
  return map[s] || "badge-pendiente";
}

export function orderFlow(): string[] {
  return ["Pendiente", "Picking", "Packing", "Listo para Despacho", "En Ruta", "Entregado", "Cancelado"];
}

export function nextOrderStatus(status: string): string {
  const f = orderFlow();
  const i = f.indexOf(status);
  return i >= 0 && i < f.length - 2 ? f[i + 1] : status;
}

export function uniqueSKU(existingSkus: string[]): string {
  const year = new Date().getFullYear();
  let n = 1;
  let sku: string;
  do {
    sku = `SKU-${year}-${String(n).padStart(4, "0")}`;
    n++;
  } while (existingSkus.includes(sku));
  return sku;
}

export function locCode(section: string, aisle: string, level: string, bin: string): string {
  return `${section}-${String(aisle).padStart(2, "0")}-${level}-${bin}`;
}
