"use client";
import { useState } from "react";
import { mockData } from "@/lib/mock/data";
import { money, statusBadgeColor } from "@/lib/utils/format";

const statusConfigs: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  "Pendiente":          { label: "Pendiente",          color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", icon: "hourglass_empty" },
  "Listo para Despacho":{ label: "Listo p/ Despacho",  color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", icon: "inventory" },
  "En Ruta":            { label: "En Ruta",            color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "local_shipping" },
  "Entregado":          { label: "Entregado",          color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", icon: "check_circle" },
};

export default function DispatchPage() {
  const [orders] = useState(mockData.orders);

  const kpiKeys = ["Pendiente", "Listo para Despacho", "En Ruta", "Entregado"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0, lineHeight: 1.2 }}>
            Listos para Despacho
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 6, fontWeight: 400 }}>
            Monitoreo de pedidos listos para recolección y logística de última milla.
          </p>
        </div>
        <button className="premium-button" style={{ flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>local_shipping</span>
          Despacho Masivo
        </button>
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        {kpiKeys.map((key) => {
          const cfg = statusConfigs[key];
          const count = orders.filter(o => o.status === key).length;
          return (
            <div
              key={key}
              className="premium-card"
              style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.07em", color: cfg.color,
                  background: cfg.bg, border: `1px solid ${cfg.border}`,
                  padding: "3px 8px", borderRadius: 6,
                }}>
                  {cfg.label}
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: cfg.color }}>{cfg.icon}</span>
              </div>
              <div style={{ fontSize: 38, fontWeight: 900, color: "#0f172a", lineHeight: 1, fontFamily: "var(--font-display, system-ui)" }}>
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── TABLE ── */}
      <div className="premium-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0", fontFamily: "var(--font-display, system-ui)" }}>
          Listado de Despachos
        </h3>
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <table className="data-table">
            <thead>
              <tr>
                {["Pedido", "Cliente", "Prioridad", "Fecha", "Monto", "Estado", "Asignado"].map(h => (
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
                    <span className={`${statusBadgeColor(o.priority)}`} style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "2px 10px", borderRadius: 999,
                      fontSize: 11, fontWeight: 600,
                    }}>
                      {o.priority}
                    </span>
                  </td>
                  <td style={{ color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap" }}>{o.date}</td>
                  <td style={{ fontWeight: 700, color: "#0f172a" }}>{money(o.amount)}</td>
                  <td>
                    <span className={`${statusBadgeColor(o.status)}`} style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "2px 10px", borderRadius: 999,
                      fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                    }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ color: "#64748b", fontWeight: 500 }}>{o.assigned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── BOTTOM GRID: Map + Carriers ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Distribution map */}
        <div className="premium-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0", fontFamily: "var(--font-display, system-ui)" }}>
            Mapa de Distribución
          </h3>
          <div style={{
            height: 220, borderRadius: 10, background: "#f8fafc",
            border: "1px solid #e2e8f0", position: "relative", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 300 200">
              <defs>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[40, 80, 120, 160].map(y => (
                <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#e2e8f0" strokeWidth="1" />
              ))}
              {[60, 120, 180, 240].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="200" stroke="#e2e8f0" strokeWidth="1" />
              ))}
              {/* Route path */}
              <path d="M 50 140 C 100 90, 200 160, 250 80" fill="none" stroke="url(#routeGrad)" strokeWidth="3" strokeDasharray="6,4" />
              {/* Node A */}
              <circle cx="50" cy="140" r="16" fill="#2563eb" />
              <text x="50" y="145" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">A</text>
              {/* Node R */}
              <circle cx="150" cy="120" r="16" fill="#8b5cf6" />
              <text x="150" y="125" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">R</text>
              {/* Node C */}
              <circle cx="250" cy="80" r="16" fill="#10b981" />
              <text x="250" y="85" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">C</text>
            </svg>
            {/* Legend */}
            <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 12 }}>
              {[{ label: "Almacén", color: "#2563eb" }, { label: "En Ruta", color: "#8b5cf6" }, { label: "Entregado", color: "#10b981" }].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 600, color: "#64748b" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Carrier statuses */}
        <div className="premium-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0", fontFamily: "var(--font-display, system-ui)" }}>
            Estado de Transportistas
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { carrier: "FedEx Express", status: "Entregado", logo: "🚀" },
              { carrier: "DHL Global",    status: "Picking",   logo: "📦" },
              { carrier: "UPS Ground",   status: "Pendiente", logo: "🚚" },
            ].map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  borderRadius: 10, padding: "12px 16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{c.logo}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>{c.carrier}</span>
                </div>
                <span className={`${statusBadgeColor(c.status)}`} style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "2px 10px", borderRadius: 999,
                  fontSize: 11, fontWeight: 600,
                }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}