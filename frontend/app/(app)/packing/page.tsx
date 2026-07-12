"use client";
import { useState } from "react";
import { mockData } from "@/lib/mock/data";

export default function PackingPage() {
  const [orders, setOrders] = useState(mockData.orders);
  const pending = orders.filter(o => ["Packing", "Picking", "Listo para Despacho"].includes(o.status));

  const packOrder = async (id: string) => {
    await fetch(`/api/packing/${id}/confirm`, { method: "POST" });
    setOrders([...mockData.orders]);
  };

  const scannedTotal = orders.reduce((a, o) => a + o.items.reduce((b, i) => b + i.scanned, 0), 0);
  const totalItems = orders.reduce((a, o) => a + o.items.reduce((b, i) => b + i.qty, 0), 0);
  const labelsGenerated = orders.filter(o => o.status === "Entregado").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── PAGE HEADER ── */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0 }}>
          Packing y Embalaje
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
          Checklist de verificación final, empaque y generación de etiquetas de envío.
        </p>
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

        {/* Pending orders */}
        <div className="premium-card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 4px 0" }}>
              Pedidos Pendientes de Empaque
            </h3>
            <p style={{ fontSize: 12, color: "#94a3b8" }}>Verifique e imprima la documentación del paquete</p>
          </div>

          {pending.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "#94a3b8", fontSize: 13, fontStyle: "italic" }}>
              No hay pedidos pendientes en esta cola de embalaje.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {pending.map((o, idx) => {
                const statusColors: Record<string, { bg: string; color: string; border: string }> = {
                  "Picking":             { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
                  "Packing":             { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
                  "Listo para Despacho": { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
                };
                const sc = statusColors[o.status] || { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" };
                return (
                  <div key={o.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 0",
                    borderBottom: idx < pending.length - 1 ? "1px solid #f1f5f9" : "none",
                    gap: 12,
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>#{o.id}</span>
                        <span style={{ fontSize: 13, color: "#64748b" }}>{o.customer}</span>
                      </div>
                      <span style={{
                        display: "inline-flex", padding: "2px 10px", borderRadius: 999,
                        fontSize: 11, fontWeight: 600,
                        background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                      }}>
                        {o.status}
                      </span>
                    </div>
                    <button
                      onClick={() => packOrder(o.id)}
                      style={{
                        padding: "7px 14px", borderRadius: 8,
                        background: "#2563eb", color: "#fff",
                        border: "none", fontSize: 12.5, fontWeight: 600,
                        cursor: "pointer", flexShrink: 0, fontFamily: "inherit",
                        transition: "background 0.15s",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Confirmar Empaque
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Session summary */}
        <div className="premium-card" style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 300 }}>
          <div>
            <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 4px 0" }}>
                Resumen de Checklist
              </h3>
              <p style={{ fontSize: 12, color: "#94a3b8" }}>Estadísticas de la sesión operativa de empaque</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Productos Escaneados", val: scannedTotal, icon: "qr_code_scanner", color: "#2563eb" },
                { label: "Productos Totales",    val: totalItems,    icon: "inventory_2",     color: "#7c3aed" },
                { label: "Etiquetas Generadas",  val: labelsGenerated, icon: "local_post_office", color: "#15803d" },
              ].map((item) => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  paddingBottom: 14, borderBottom: "1px solid #f1f5f9",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: `${item.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: item.color }}>{item.icon}</span>
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: "#334155" }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)" }}>
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button className="premium-button" style={{ width: "100%", marginTop: 20, justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>local_printshop</span>
            Generar Etiqueta
          </button>
        </div>
      </div>
    </div>
  );
}