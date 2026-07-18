"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { apiClient } from "@/lib/api/client";

export default function ProductsPage() {
  const { token, canSupervise } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiClient("/api/products", { token })
      .then((res) => setProducts(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = products.filter(p =>
    (p.Nombre_Producto || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.Codigo_Producto || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Cargando productos...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0 }}>Productos</h1>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>{products.length} productos registrados</p>
        </div>
        {canSupervise() && (
          <Link href="/products/register" style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
            borderRadius: 10, background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none",
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Nuevo Producto
          </Link>
        )}
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: 10, padding: "11px 14px",
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#94a3b8" }}>search</span>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o SKU..."
          style={{ border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: "#0f172a", width: "100%", fontFamily: "inherit" }}
        />
      </div>

      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #e2e8f0" }}>
        <table className="data-table">
          <thead>
            <tr><th>SKU</th><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Ubicación</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {filtered.map((p: any) => {
              const status = p.Stock_Actual === 0 ? "Agotado" : p.Stock_Actual <= p.Stock_Minimo ? "Bajo Stock" : "En Stock";
              const statusColor = status === "En Stock" ? "#15803d" : status === "Bajo Stock" ? "#d97706" : "#dc2626";
              const statusBg = status === "En Stock" ? "#dcfce7" : status === "Bajo Stock" ? "#fffbeb" : "#fef2f2";
              return (
                <tr key={p.Codigo_Producto}>
                  <td style={{ fontWeight: 700, color: "#2563eb" }}>{p.Codigo_Producto}</td>
                  <td style={{ fontWeight: 600 }}>{p.Nombre_Producto}</td>
                  <td>{p.Nombre_Categoria}</td>
                  <td style={{ fontWeight: 700 }}>S/ {Number(p.Precio).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</td>
                  <td style={{ fontWeight: 700 }}>{p.Stock_Actual}</td>
                  <td style={{ color: "#64748b" }}>{p.Codigo_Ubicacion}</td>
                  <td>
                    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: statusBg, color: statusColor }}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
