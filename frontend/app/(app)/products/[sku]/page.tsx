"use client";
import { use } from "react";
import Link from "next/link";
import { mockData } from "@/lib/mock/data";
import { money } from "@/lib/utils/format";
import { useAuth } from "@/lib/auth/auth-context";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    "En Stock":   { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    "Bajo Stock": { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    "Agotado":    { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    "Entrada":    { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    "Salida":     { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    "Ajuste":     { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  };
  const s = map[status] || { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 10px", borderRadius: 999,
      fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {status}
    </span>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = use(params);
  const { canSupervise } = useAuth();
  const product = mockData.products.find(p => p.sku === sku);

  if (!product) {
    return (
      <div className="premium-card" style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
        Producto no encontrado
      </div>
    );
  }

  const handleMovement = async () => {
    const type = prompt("Tipo de movimiento: Entrada, Salida o Ajuste", "Entrada");
    if (!type) return;
    const qty = Number(prompt("Cantidad", "1"));
    if (Number.isNaN(qty) || qty === 0) return;
    const reason = prompt("Motivo o referencia", "Movimiento manual") || "Movimiento manual";
    await fetch(`/api/products/${sku}/movements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, quantity: qty, reason }),
    });
    window.location.reload();
  };

  const locParts = product.location.split("-");
  const stockPct = product.max > 0 ? Math.round((product.stock / product.max) * 100) : 0;
  const stockColor = product.stock <= product.min ? "#dc2626" : product.stock < product.max * 0.4 ? "#d97706" : "#15803d";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0 }}>
            Detalle del Producto
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
            Inventario / Productos / <strong style={{ color: "#0f172a" }}>{product.sku}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <Link href="/products" style={{
            padding: "9px 18px", borderRadius: 9,
            border: "1px solid #e2e8f0", background: "#fff",
            fontSize: 13, fontWeight: 600, color: "#334155",
            textDecoration: "none",
          }}>
            ← Volver
          </Link>
          {canSupervise() && (
            <button onClick={handleMovement} className="premium-button">
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>swap_horiz</span>
              Registrar Movimiento
            </button>
          )}
        </div>
      </div>

      {/* ── PRODUCT HERO ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>

        {/* Main info card */}
        <div className="premium-card" style={{ padding: 28, display: "flex", gap: 24, alignItems: "flex-start" }}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: 140, height: 120, objectFit: "cover",
                borderRadius: 12, border: "1px solid #e2e8f0", flexShrink: 0,
              }}
            />
          ) : (
            <div style={{
              width: 140, height: 120, borderRadius: 12,
              background: "#f1f5f9", border: "1px solid #e2e8f0",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#94a3b8" }}>inventory_2</span>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 10 }}>
              <StatusBadge status={product.status} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 6px 0" }}>
              {product.name}
            </h2>
            <p style={{ fontSize: 13.5, color: "#64748b", margin: "0 0 12px 0" }}>
              {product.category} · {product.brand}
            </p>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#2563eb", fontFamily: "var(--font-display, system-ui)" }}>
              {money(product.price)}
            </div>
          </div>
        </div>

        {/* Stock counters */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="premium-card" style={{ padding: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 10 }}>
              Stock Actual
            </span>
            <div style={{ fontSize: 32, fontWeight: 900, color: stockColor, fontFamily: "var(--font-display, system-ui)", lineHeight: 1, marginBottom: 10 }}>
              {product.stock}
              <span style={{ fontSize: 14, fontWeight: 500, color: "#94a3b8", marginLeft: 6 }}>unidades</span>
            </div>
            <div style={{ height: 5, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${stockPct}%`, background: stockColor, borderRadius: 999 }} />
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
              Mín: {product.min} · Máx: {product.max}
            </div>
          </div>
          <div className="premium-card" style={{ padding: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>
              Stock Mínimo
            </span>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", lineHeight: 1 }}>
              {product.min}
              <span style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", marginLeft: 6 }}>unidades</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── DESCRIPTION + LOCATION ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="premium-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 12px 0", paddingBottom: 10, borderBottom: "1px solid #e2e8f0" }}>
            Descripción del Producto
          </h3>
          <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.7 }}>
            {product.description || "Sin descripción registrada."}
          </p>
        </div>

        <div className="premium-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 16px 0", paddingBottom: 10, borderBottom: "1px solid #e2e8f0" }}>
            Ubicación en Almacén
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, textAlign: "center", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
            {["Sección", "Pasillo", "Nivel", "Bin"].map((label, i) => (
              <div key={label}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                  {label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#2563eb", fontFamily: "var(--font-display, system-ui)" }}>
                  {locParts[i] || "01"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MOVEMENTS TABLE ── */}
      <div className="premium-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 16px 0" }}>
          Historial de Movimientos Recientes
        </h3>
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <table className="data-table">
            <thead>
              <tr>
                {["Tipo", "Cantidad", "Motivo", "Responsable"].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {product.movements.map((m, i) => (
                <tr key={i}>
                  <td><StatusBadge status={String(m[0])} /></td>
                  <td style={{ fontWeight: 700, color: Number(m[1]) > 0 ? "#15803d" : "#dc2626" }}>
                    {Number(m[1]) > 0 ? `+${m[1]}` : m[1]}
                  </td>
                  <td style={{ color: "#64748b" }}>{String(m[2])}</td>
                  <td style={{ color: "#94a3b8" }}>{String(m[3])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}