"use client";
import { useState } from "react";
import { mockData } from "@/lib/mock/data";
import { money, statusBadgeColor, orderFlow } from "@/lib/utils/format";
import { useAuth } from "@/lib/auth/auth-context";

const kpiConfigs = [
  { key: "Pendiente",  color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", icon: "hourglass_empty" },
  { key: "Picking",   color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", icon: "qr_code_scanner"  },
  { key: "Packing",   color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "inventory"         },
  { key: "En Ruta",   color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", icon: "local_shipping"   },
];

export default function OrdersPage() {
  const { canManage } = useAuth();
  const [orders, setOrders] = useState(mockData.orders);
  const [modalOrder, setModalOrder] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setOrders([...mockData.orders]);
  };

  const advanceOrder = async (id: string) => {
    await fetch(`/api/orders/${id}/advance`, { method: "POST" });
    setOrders([...mockData.orders]);
  };

  const deleteOrder = async (id: string) => {
    if (!confirm(`¿Borrar pedido ${id}?`)) return;
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    setOrders([...mockData.orders]);
  };

  const createOrder = async () => {
    await fetch("/api/orders", { method: "POST" });
    setOrders([...mockData.orders]);
  };

  const modal = modalOrder ? mockData.orders.find(o => o.id === modalOrder) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0, lineHeight: 1.2 }}>
            Gestión de Pedidos
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 6, fontWeight: 400 }}>
            Control de flujo operativo: desde la recepción hasta la última milla.
          </p>
        </div>
        <button onClick={createOrder} className="premium-button" style={{ flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>add_box</span>
          Nuevo Pedido Demo
        </button>
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        {kpiConfigs.map(({ key, color, bg, border, icon }) => {
          const count = orders.filter(o => o.status === key).length;
          return (
            <div key={key} className="premium-card" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.07em", color, background: bg, border: `1px solid ${border}`,
                  padding: "3px 8px", borderRadius: 6,
                }}>
                  {key}
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color }}>{icon}</span>
              </div>
              <div style={{ fontSize: 38, fontWeight: 900, color: "#0f172a", lineHeight: 1, fontFamily: "var(--font-display, system-ui)" }}>
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── ORDERS TABLE ── */}
      <div className="premium-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0", fontFamily: "var(--font-display, system-ui)" }}>
          Pedidos del Almacén
        </h3>
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <table className="data-table">
            <thead>
              <tr>
                {["Pedido", "Cliente", "Prioridad", "Fecha", "Monto", "Estado", "Asignado", "Acciones"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700, color: "#0f172a" }}>#{o.id}</td>
                  <td style={{ fontWeight: 500 }}>{o.customer}</td>
                  <td>
                    <span className={statusBadgeColor(o.priority)} style={{
                      display: "inline-flex", padding: "2px 10px",
                      borderRadius: 999, fontSize: 11, fontWeight: 600,
                    }}>
                      {o.priority}
                    </span>
                  </td>
                  <td style={{ color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap" }}>{o.date}</td>
                  <td style={{ fontWeight: 700 }}>{money(o.amount)}</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value)}
                      style={{
                        border: "1px solid #e2e8f0", borderRadius: 8,
                        padding: "5px 32px 5px 10px", background: "#fff",
                        fontSize: 12, fontWeight: 600, color: "#334155",
                        cursor: "pointer", outline: "none", minWidth: 130,
                        fontFamily: "inherit",
                      }}
                    >
                      {orderFlow().map(st => <option key={st}>{st}</option>)}
                    </select>
                  </td>
                  <td style={{ color: "#64748b", fontWeight: 500 }}>{o.assigned}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => setModalOrder(o.id)}
                        style={{
                          padding: "5px 12px", borderRadius: 7,
                          border: "1px solid #e2e8f0", background: "#fff",
                          fontSize: 12, fontWeight: 600, color: "#334155",
                          cursor: "pointer", transition: "all 0.15s ease",
                          whiteSpace: "nowrap",
                        }}
                      >Ver</button>
                      <button
                        onClick={() => advanceOrder(o.id)}
                        style={{
                          padding: "5px 12px", borderRadius: 7,
                          border: "none", background: "#2563eb",
                          fontSize: 12, fontWeight: 600, color: "#fff",
                          cursor: "pointer", transition: "all 0.15s ease",
                          whiteSpace: "nowrap",
                        }}
                      >Avanzar</button>
                      {canManage() && (
                        <button
                          onClick={() => deleteOrder(o.id)}
                          style={{
                            padding: "5px 12px", borderRadius: 7,
                            border: "none", background: "#fee2e2",
                            fontSize: 12, fontWeight: 600, color: "#dc2626",
                            cursor: "pointer", transition: "all 0.15s ease",
                            whiteSpace: "nowrap",
                          }}
                        >Borrar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── INFO BANNER ── */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        background: "#eff6ff", border: "1px solid #bfdbfe",
        borderRadius: 12, padding: "16px 20px",
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#2563eb", flexShrink: 0, marginTop: 1 }}>info</span>
        <div style={{ fontSize: 13, color: "#334155" }}>
          <strong style={{ color: "#1e3a5f", fontWeight: 700, display: "block", marginBottom: 3 }}>Flujo del Paquete:</strong>
          Pendiente → Picking (Recolección) → Packing (Empaque) → Listo para Despacho → En Ruta → Entregado.
        </div>
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <div
          onClick={() => setModalOrder(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 460,
              background: "#fff", borderRadius: 18,
              padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              border: "1px solid #e2e8f0",
              display: "flex", flexDirection: "column", gap: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0 }}>
                  Detalle de Pedido {modal.id}
                </h3>
                <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{modal.customer}</span>
              </div>
              <span className={statusBadgeColor(modal.status)} style={{
                display: "inline-flex", padding: "3px 12px",
                borderRadius: 999, fontSize: 11, fontWeight: 700,
              }}>
                {modal.status}
              </span>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>
                Cambiar Estado
              </label>
              <select
                value={modal.status}
                onChange={e => { updateStatus(modal.id, e.target.value); setModalOrder(null); }}
                style={{
                  width: "100%", border: "1px solid #e2e8f0", borderRadius: 10,
                  padding: "10px 36px 10px 14px", background: "#f8fafc",
                  fontSize: 13.5, fontWeight: 500, color: "#0f172a",
                  outline: "none", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {orderFlow().map(st => <option key={st}>{st}</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#f8fafc", borderRadius: 10, padding: 14, border: "1px solid #e2e8f0" }}>
              <div>
                <span style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 3 }}>Asignado a:</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>{modal.assigned}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 3 }}>Ruta de Envío:</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>{modal.route}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 10 }}>
                Artículos del Pedido
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 160, overflowY: "auto" }}>
                {modal.items.map((item, i) => {
                  const prod = mockData.products.find(p => p.sku === item.sku);
                  return (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "#f8fafc", border: "1px solid #e2e8f0",
                      borderRadius: 8, padding: "8px 12px",
                    }}>
                      <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {prod?.name || item.sku}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.sku}</div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#334155", flexShrink: 0 }}>
                        {item.scanned} / {item.qty} esc.
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
              <button
                onClick={() => setModalOrder(null)}
                style={{
                  width: "100%", padding: "11px", borderRadius: 10,
                  border: "1px solid #e2e8f0", background: "#fff",
                  fontSize: 13, fontWeight: 600, color: "#334155",
                  cursor: "pointer", transition: "all 0.15s ease",
                  fontFamily: "inherit",
                }}
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}