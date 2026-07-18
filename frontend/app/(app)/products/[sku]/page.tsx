"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { apiClient } from "@/lib/api/client";
import { money } from "@/lib/utils/format";

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
  const { token, canSupervise } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [movementType, setMovementType] = useState("Entrada");
  const [movementQty, setMovementQty] = useState("1");
  const [movementReason, setMovementReason] = useState("");
  const [showMovementModal, setShowMovementModal] = useState(false);

  useEffect(() => {
    if (!token || !sku) return;
    apiClient(`/api/products/sku/${sku}`, { token })
      .then((res) => setProduct(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, sku]);

  const handleMovement = async () => {
    if (!token || !product) return;
    const qty = Number(movementQty);
    if (qty <= 0) return;

    try {
      await apiClient("/api/products/movements", {
        method: "POST",
        token,
        body: {
          tipo_movimiento: movementType,
          codigo_producto: product.Codigo_Producto,
          cantidad: qty,
          codigo_ubicacion: product.Codigo_Ubicacion,
          observacion: movementReason || "Movimiento manual",
        },
      });
      setShowMovementModal(false);
      setMovementQty("1");
      setMovementReason("");
      // Reload product
      const res = await apiClient(`/api/products/sku/${sku}`, { token });
      setProduct(res.data);
    } catch (error: any) {
      alert(error.message || "Error al registrar movimiento");
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Cargando producto...</div>;

  if (!product) {
    return (
      <div className="premium-card" style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
        Producto no encontrado
      </div>
    );
  }

  const stock = product.Stock_Actual || 0;
  const min = product.Stock_Minimo || 0;
  const max = 100;
  const stockPct = max > 0 ? Math.round((stock / max) * 100) : 0;
  const stockColor = stock <= min ? "#dc2626" : stock < max * 0.4 ? "#d97706" : "#15803d";
  const status = stock === 0 ? "Agotado" : stock <= min ? "Bajo Stock" : "En Stock";
  const locCode = product.Codigo_Ubicacion || "N/A";
  const locParts = locCode.split(/[-]/);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* PAGE HEADER */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0 }}>
            Detalle del Producto
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
            Inventario / Productos / <strong style={{ color: "#0f172a" }}>{product.Codigo_Producto}</strong>
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
            <button onClick={() => setShowMovementModal(true)} className="premium-button">
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>swap_horiz</span>
              Registrar Movimiento
            </button>
          )}
        </div>
      </div>

      {/* PRODUCT HERO */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
        <div className="premium-card" style={{ padding: 28, display: "flex", gap: 24, alignItems: "flex-start" }}>
          <div style={{
            width: 140, height: 120, borderRadius: 12,
            background: "#f1f5f9", border: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#94a3b8" }}>inventory_2</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 10 }}>
              <StatusBadge status={status} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 6px 0" }}>
              {product.Nombre_Producto}
            </h2>
            <p style={{ fontSize: 13.5, color: "#64748b", margin: "0 0 12px 0" }}>
              {product.Nombre_Categoria || "Sin categoría"} {product.Nombre_Marca ? `· ${product.Nombre_Marca}` : ""}
            </p>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#2563eb", fontFamily: "var(--font-display, system-ui)" }}>
              {money(product.Precio)}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="premium-card" style={{ padding: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 10 }}>
              Stock Actual
            </span>
            <div style={{ fontSize: 32, fontWeight: 900, color: stockColor, fontFamily: "var(--font-display, system-ui)", lineHeight: 1, marginBottom: 10 }}>
              {stock}
              <span style={{ fontSize: 14, fontWeight: 500, color: "#94a3b8", marginLeft: 6 }}>unidades</span>
            </div>
            <div style={{ height: 5, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${stockPct}%`, background: stockColor, borderRadius: 999 }} />
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
              Mín: {min} · Máx: {max}
            </div>
          </div>
          <div className="premium-card" style={{ padding: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>
              Stock Mínimo
            </span>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", lineHeight: 1 }}>
              {min}
              <span style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", marginLeft: 6 }}>unidades</span>
            </div>
          </div>
        </div>
      </div>

      {/* DESCRIPTION + LOCATION */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="premium-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 12px 0", paddingBottom: 10, borderBottom: "1px solid #e2e8f0" }}>
            Descripción del Producto
          </h3>
          <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.7 }}>
            {product.Descripcion || "Sin descripción registrada."}
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
                  {locParts[i] || "N/A"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MOVEMENT MODAL */}
      {showMovementModal && (
        <div
          onClick={() => setShowMovementModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 14, padding: 28, width: 400,
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              Registrar Movimiento
            </h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Tipo</label>
              <select value={movementType} onChange={e => setMovementType(e.target.value)} style={{
                width: "100%", border: "1px solid #e2e8f0", borderRadius: 10,
                padding: "10px 14px", fontSize: 13.5, color: "#0f172a", outline: "none",
              }}>
                <option value="Entrada">Entrada</option>
                <option value="Salida">Salida</option>
                <option value="Ajuste">Ajuste</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Cantidad</label>
              <input type="number" min="1" value={movementQty} onChange={e => setMovementQty(e.target.value)} style={{
                width: "100%", border: "1px solid #e2e8f0", borderRadius: 10,
                padding: "10px 14px", fontSize: 13.5, color: "#0f172a", outline: "none", boxSizing: "border-box",
              }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Motivo</label>
              <input value={movementReason} onChange={e => setMovementReason(e.target.value)} placeholder="Opcional..." style={{
                width: "100%", border: "1px solid #e2e8f0", borderRadius: 10,
                padding: "10px 14px", fontSize: 13.5, color: "#0f172a", outline: "none", boxSizing: "border-box",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowMovementModal(false)} style={{
                padding: "9px 18px", borderRadius: 9, border: "1px solid #e2e8f0",
                background: "#fff", fontSize: 13, fontWeight: 600, color: "#334155",
                cursor: "pointer", fontFamily: "inherit",
              }}>Cancelar</button>
              <button onClick={handleMovement} className="premium-button">
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>save</span>
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
