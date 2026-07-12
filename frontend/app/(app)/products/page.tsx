"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { mockData } from "@/lib/mock/data";
import { money } from "@/lib/utils/format";
import { useAuth } from "@/lib/auth/auth-context";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    "En Stock":   { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    "Bajo Stock": { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    "Agotado":    { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  };
  const s = map[status] || { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 10px", borderRadius: 999,
      fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
}

export default function ProductsPage() {
  const { canSupervise } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [products, setProducts] = useState(mockData.products);

  useEffect(() => {
    let filtered = mockData.products;
    if (search) filtered = filtered.filter(p =>
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    if (filter !== "Todos") filtered = filtered.filter(p => p.status === filter);
    setProducts(filtered);
  }, [search, filter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0 }}>
            Gestión de Inventario
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
            Consulta stock, ubicación, estado e historial de cada producto.
          </p>
        </div>
        {canSupervise() && (
          <Link href="/products/register" className="premium-button" style={{ textDecoration: "none" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>add</span>
            Nuevo Producto
          </Link>
        )}
      </div>

      {/* ── FILTER CARD ── */}
      <div className="premium-card" style={{ padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>

          {/* Search */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>
              Buscar Producto
            </label>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: 10, padding: "10px 14px",
              transition: "border-color 0.15s",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#94a3b8", flexShrink: 0 }}>search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="SKU o nombre de artículo..."
                style={{
                  border: "none", outline: "none", background: "transparent",
                  fontSize: 13.5, color: "#0f172a", width: "100%", fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* Filter */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>
              Filtrar por Estado
            </label>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{
                width: "100%", border: "1px solid #e2e8f0", borderRadius: 10,
                padding: "10px 36px 10px 14px", background: "#f8fafc",
                fontSize: 13.5, fontWeight: 500, color: "#0f172a",
                outline: "none", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {["Todos", "En Stock", "Bajo Stock", "Agotado"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* ── TABLE ── */}
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <table className="data-table">
            <thead>
              <tr>
                {["SKU", "Producto", "Categoría", "Precio", "Stock", "Ubicación", "Estado", "Acciones"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.sku}>
                  <td style={{ fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-display, system-ui)" }}>{p.sku}</td>
                  <td style={{ fontWeight: 600, color: "#0f172a" }}>{p.name}</td>
                  <td style={{ color: "#64748b" }}>{p.category}</td>
                  <td style={{ fontWeight: 700 }}>{money(p.price)}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: p.stock <= p.min ? "#dc2626" : "#334155" }}>
                      {p.stock}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}> / {p.max}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: "#2563eb", fontFamily: "var(--font-display, system-ui)" }}>{p.location}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <Link
                      href={`/products/${p.sku}`}
                      style={{
                        display: "inline-block",
                        padding: "5px 14px", borderRadius: 8,
                        border: "1px solid #e2e8f0", background: "#fff",
                        fontSize: 12.5, fontWeight: 600, color: "#334155",
                        textDecoration: "none", whiteSpace: "nowrap",
                        transition: "all 0.15s ease",
                      }}
                    >
                      Detalles
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}