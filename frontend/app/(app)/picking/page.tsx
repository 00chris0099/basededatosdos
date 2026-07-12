"use client";
import { useState } from "react";
import { mockData } from "@/lib/mock/data";

export default function PickingPage() {
  const order = mockData.orders.find(o => o.status === "Picking" || o.status === "Pendiente") || mockData.orders[0];
  const item = order?.items.find(i => i.scanned < i.qty) || order?.items[0];
  const product = item ? mockData.products.find(p => p.sku === item.sku) : null;
  const [scanVal, setScanVal] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  if (!order || !item || !product) {
    return (
      <div className="premium-card" style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>No hay pedidos activos en picking</h2>
      </div>
    );
  }

  const scannedTotal = order.items.reduce((a, i) => a + i.scanned, 0);
  const totalItems = order.items.reduce((a, i) => a + i.qty, 0);
  const pct = totalItems > 0 ? Math.round((scannedTotal / totalItems) * 100) : 0;

  const confirmScan = async () => {
    if (scanVal.trim() !== product.sku) {
      setMsg({ text: "SKU incorrecto. Debe coincidir con el producto.", ok: false });
      return;
    }
    await fetch("/api/picking/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, sku: product.sku }),
    });
    setMsg({ text: "✓ Item confirmado con escaneo", ok: true });
    setTimeout(() => window.location.reload(), 700);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── PAGE HEADER ── */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0 }}>
          Picking Activo
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
          Orden de picking <strong style={{ color: "#0f172a" }}>#{order.id}</strong> asignada a{" "}
          <strong style={{ color: "#2563eb" }}>{order.assigned}</strong>.
        </p>
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Progress bar */}
          <div className="premium-card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>Progreso del Pedido</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{pct}%</span>
            </div>
            <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${pct}%`,
                background: "linear-gradient(90deg, #2563eb, #8b5cf6)",
                borderRadius: 999, transition: "width 0.4s ease",
              }} />
            </div>
          </div>

          {/* Target location card */}
          <div className="premium-card" style={{ padding: 32, textAlign: "center", position: "relative", overflow: "hidden" }}>
            {/* top accent stripe */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3,
              background: "linear-gradient(90deg, #2563eb, #8b5cf6)",
            }} />

            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px 0" }}>
              Siguiente Ubicación
            </p>
            <div style={{
              fontSize: 52, fontWeight: 900, color: "#2563eb",
              fontFamily: "var(--font-display, system-ui)", lineHeight: 1, marginBottom: 8,
            }}>
              {product.location}
            </div>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
              Diríjase al pasillo/rack indicado para recolectar el artículo.
            </p>

            {/* Product info */}
            <div style={{
              display: "flex", alignItems: "center", gap: 20,
              background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: 14, padding: "16px 20px",
              textAlign: "left", maxWidth: 480, margin: "0 auto 24px",
            }}>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: 90, height: 80, objectFit: "cover",
                    borderRadius: 10, border: "1px solid #e2e8f0", flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{
                  width: 90, height: 80, borderRadius: 10,
                  background: "#e2e8f0", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#94a3b8" }}>inventory_2</span>
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                  {product.name}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>SKU: {product.sku}</div>
                <span style={{
                  display: "inline-flex", padding: "3px 12px", borderRadius: 999,
                  background: "#eff6ff", color: "#2563eb", fontSize: 12, fontWeight: 700,
                  border: "1px solid #bfdbfe",
                }}>
                  Cantidad a recolectar: ×{item.qty}
                </span>
              </div>
            </div>

            {/* Scan input */}
            <div style={{ display: "flex", gap: 10, maxWidth: 440, margin: "0 auto" }}>
              <input
                value={scanVal}
                onChange={e => setScanVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && confirmScan()}
                placeholder="Escanee o escriba SKU"
                style={{
                  flex: 1, border: "1px solid #e2e8f0", borderRadius: 10,
                  padding: "10px 14px", background: "#fff",
                  fontSize: 13.5, outline: "none", fontFamily: "inherit",
                  color: "#0f172a",
                }}
              />
              <button onClick={confirmScan} className="premium-button" style={{ flexShrink: 0 }}>
                Confirmar Item
              </button>
            </div>

            {msg && (
              <p style={{
                marginTop: 12, fontSize: 13, fontWeight: 600,
                color: msg.ok ? "#15803d" : "#dc2626",
              }}>
                {msg.text}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Picking queue */}
          <div className="premium-card" style={{ padding: 20 }}>
            <h3 style={{
              fontSize: 14, fontWeight: 700, color: "#0f172a",
              fontFamily: "var(--font-display, system-ui)",
              margin: "0 0 14px 0", paddingBottom: 10, borderBottom: "1px solid #e2e8f0",
            }}>
              Cola de Picking
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {order.items.map((it, i) => {
                const pr = mockData.products.find(p => p.sku === it.sku);
                const done = it.scanned >= it.qty;
                return (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: done ? "#f0fdf4" : "#f8fafc",
                    border: `1px solid ${done ? "#bbf7d0" : "#e2e8f0"}`,
                    borderRadius: 8, padding: "10px 12px",
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: done ? "#15803d" : "#0f172a", fontFamily: "var(--font-display, system-ui)" }}>
                        {pr?.location}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {pr?.name}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                      color: done ? "#15803d" : "#94a3b8", marginLeft: 8,
                    }}>
                      {it.scanned} / {it.qty}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workers on shift */}
          <div className="premium-card" style={{ padding: 20 }}>
            <h3 style={{
              fontSize: 14, fontWeight: 700, color: "#0f172a",
              fontFamily: "var(--font-display, system-ui)",
              margin: "0 0 14px 0", paddingBottom: 10, borderBottom: "1px solid #e2e8f0",
            }}>
              Trabajadores en Turno
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {mockData.users.filter(u => ["Operario", "Supervisor"].includes(u.role)).map(u => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: "2px solid #e2e8f0", overflow: "hidden", flexShrink: 0,
                    background: "#f1f5f9",
                  }}>
                    {u.photo ? (
                      <img src={u.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#64748b" }}>
                        {u.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", lineHeight: 1.3 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{u.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}