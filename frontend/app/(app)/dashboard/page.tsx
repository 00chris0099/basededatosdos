"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { apiClient } from "@/lib/api/client";

const stats = [
  { icon: "inventory_2",  label: "Total Productos",    valueKey: "products",  color: "#2563eb", bg: "#eff6ff" },
  { icon: "shopping_cart", label: "Pedidos Pendientes", valueKey: "pending",   color: "#d97706", bg: "#fffbeb" },
  { icon: "warning",       label: "Alertas Bajo Stock", valueKey: "lowStock",  color: "#dc2626", bg: "#fef2f2" },
  { icon: "swap_horiz",    label: "Movimientos",        valueKey: "movements", color: "#7c3aed", bg: "#f5f3ff" },
];

export default function DashboardPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      apiClient("/api/products", { token }),
      apiClient("/api/orders", { token }),
    ]).then(([p, o]) => {
      setProducts(p.data || []);
      setOrders(o.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const lowStock = products.filter(p => p.Stock_Actual <= p.Stock_Minimo).length;
  const pending = orders.filter(o => o.Estado_Pedido === "Pendiente" || o.Estado_Pedido === "En Proceso").length;
  const movementsCount = products.length;

  const statValues: Record<string, number> = {
    products: products.length,
    pending,
    lowStock,
    movements: movementsCount,
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Cargando dashboard...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {lowStock > 0 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 12, padding: "14px 20px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#dc2626" }}>warning</span>
            <div>
              <strong style={{ fontSize: 14, fontWeight: 700, color: "#991b1b", fontFamily: "var(--font-display, system-ui)", display: "block" }}>
                Atención de Stock requerida
              </strong>
              <p style={{ fontSize: 13, color: "#b91c1c", marginTop: 2 }}>
                Hay {lowStock} productos por debajo de su stock mínimo.
              </p>
            </div>
          </div>
          <Link href="/products" style={{ padding: "7px 16px", borderRadius: 8, background: "#dc2626", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            Revisar Stock
          </Link>
        </div>
      )}

      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0 }}>Dashboard General</h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>Monitoreo de almacenamiento, flujos de pedidos e inventario.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        {stats.map((s) => (
          <div key={s.label} className="premium-card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</span>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: s.color }}>{s.icon}</span>
              </div>
            </div>
            <div style={{ fontSize: 38, fontWeight: 900, color: "#0f172a", lineHeight: 1, fontFamily: "var(--font-display, system-ui)" }}>
              {statValues[s.valueKey]}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div className="premium-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 4px 0", fontFamily: "var(--font-display, system-ui)" }}>Productos por Categoría</h3>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>Distribución actual del inventario</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(() => {
              const cats: Record<string, number> = {};
              products.forEach(p => { cats[p.Nombre_Categoria] = (cats[p.Nombre_Categoria] || 0) + 1; });
              const maxCount = Math.max(...Object.values(cats), 1);
              const colors = ["#2563eb", "#7c3aed", "#d97706", "#15803d", "#dc2626"];
              return Object.entries(cats).map(([cat, count], i) => (
                <div key={cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{cat}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(count / maxCount) * 100}%`, background: colors[i % colors.length], borderRadius: 999 }} />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="premium-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 4px 0", fontFamily: "var(--font-display, system-ui)" }}>Pedidos por Estado</h3>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 24 }}>Desglose de la carga operativa</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {["Pendiente", "En Proceso", "Completado", "Cancelado"].map(status => {
              const count = orders.filter(o => o.Estado_Pedido === status).length;
              const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;
              return (
                <div key={status}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{status}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{count} <span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8" }}>({Math.round(pct)}%)</span></span>
                  </div>
                  <div style={{ height: 6, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "#2563eb", borderRadius: 999 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="premium-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0, fontFamily: "var(--font-display, system-ui)" }}>Pedidos Recientes</h3>
          <Link href="/orders" style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            Ver todos <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_forward</span>
          </Link>
        </div>
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <table className="data-table">
            <thead>
              <tr><th>Pedido</th><th>Cliente</th><th>Monto</th><th>Estado</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o: any) => (
                <tr key={o.Id_Pedido}>
                  <td style={{ fontWeight: 700, color: "#0f172a" }}>#{o.Id_Pedido}</td>
                  <td style={{ fontWeight: 500 }}>{o.Cliente}</td>
                  <td style={{ fontWeight: 700 }}>S/ {Number(o.Precio_Total).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</td>
                  <td>
                    <span style={{
                      display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                      background: o.Estado_Pedido === "Pendiente" ? "#eff6ff" : o.Estado_Pedido === "En Proceso" ? "#fffbeb" : o.Estado_Pedido === "Completado" ? "#dcfce7" : "#f1f5f9",
                      color: o.Estado_Pedido === "Pendiente" ? "#2563eb" : o.Estado_Pedido === "En Proceso" ? "#d97706" : o.Estado_Pedido === "Completado" ? "#15803d" : "#64748b",
                    }}>
                      {o.Estado_Pedido}
                    </span>
                  </td>
                  <td style={{ color: "#64748b", fontSize: 13 }}>{new Date(o.Fecha_Pedido).toLocaleDateString("es-PE")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
