"use client";
import { useState } from "react";
import Link from "next/link";
import { mockData } from "@/lib/mock/data";

const stats = [
  { icon: "inventory_2",  label: "Total Productos",   valueKey: "products",   color: "#2563eb", bg: "#eff6ff" },
  { icon: "shopping_cart",label: "Pedidos Pendientes",valueKey: "pending",    color: "#d97706", bg: "#fffbeb" },
  { icon: "warning",      label: "Alertas Bajo Stock",valueKey: "lowStock",   color: "#dc2626", bg: "#fef2f2" },
  { icon: "swap_horiz",   label: "Movimientos",       valueKey: "movements",  color: "#7c3aed", bg: "#f5f3ff" },
];

const chartData = [
  { label: "Lun", incoming: 20, outgoing: 14 },
  { label: "Mar", incoming: 25, outgoing: 20 },
  { label: "Mié", incoming: 18, outgoing: 20 },
  { label: "Jue", incoming: 40, outgoing: 25 },
  { label: "Vie", incoming: 30, outgoing: 22 },
  { label: "Sáb", incoming: 50, outgoing: 28 },
  { label: "Dom", incoming: 22, outgoing: 20 },
];

export default function DashboardPage() {
  const [data] = useState(mockData);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const low = data.products.filter(p => p.stock <= p.min).length;
  const pending = data.orders.filter(o => !["Despachado", "Cancelado", "Entregado"].includes(o.status)).length;
  const movementsCount = data.products.reduce((a, p) => a + p.movements.length, 0);

  const statValues: Record<string, number> = {
    products: data.products.length,
    pending,
    lowStock: low,
    movements: movementsCount,
  };

  const maxVal = Math.max(...chartData.map(d => Math.max(d.incoming, d.outgoing)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── ALERT BANNER ── */}
      {low > 0 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 12, padding: "14px 20px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#dc2626", flexShrink: 0 }}>warning</span>
            <div>
              <strong style={{ fontSize: 14, fontWeight: 700, color: "#991b1b", fontFamily: "var(--font-display, system-ui)", display: "block" }}>
                Atención de Stock requerida
              </strong>
              <p style={{ fontSize: 13, color: "#b91c1c", marginTop: 2 }}>
                Hay {low} productos operando por debajo de su límite de stock mínimo.
              </p>
            </div>
          </div>
          <Link href="/products" style={{
            padding: "7px 16px", borderRadius: 8, background: "#dc2626",
            color: "#fff", fontSize: 13, fontWeight: 600, flexShrink: 0,
            textDecoration: "none",
          }}>
            Revisar Stock
          </Link>
        </div>
      )}

      {/* ── PAGE HEADER ── */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0 }}>
          Dashboard General
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
          Monitoreo de almacenamiento, flujos de pedidos e inventario.
        </p>
      </div>

      {/* ── STATS GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        {stats.map((s) => {
          const val = statValues[s.valueKey];
          return (
            <div key={s.label} className="premium-card" style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {s.label}
                </span>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: s.bg, display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: s.color }}>{s.icon}</span>
                </div>
              </div>
              <div style={{ fontSize: 38, fontWeight: 900, color: "#0f172a", lineHeight: 1, fontFamily: "var(--font-display, system-ui)" }}>
                {val}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CHARTS ROW ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>

        {/* Stock Movements Chart */}
        <div className="premium-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0, fontFamily: "var(--font-display, system-ui)" }}>
                Flujo de Movimientos
              </h3>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Entradas y salidas registradas en la última semana</p>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, fontWeight: 500 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#2563eb", display: "inline-block" }} />
                Entradas
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#8b5cf6", display: "inline-block" }} />
                Salidas
              </span>
            </div>
          </div>

          <div style={{ height: 220, position: "relative" }}>
            <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Gridlines */}
              {[0.25, 0.5, 0.75, 1].map((p, idx) => (
                <line key={idx} x1="0" y1={200 - p * 170} x2="500" y2={200 - p * 170} stroke="#f1f5f9" strokeWidth="1" />
              ))}
              {/* Bars */}
              {chartData.map((d, i) => {
                const xBase = 30 + i * 66;
                const hIn = (d.incoming / maxVal) * 160;
                const hOut = (d.outgoing / maxVal) * 160;
                const isHovered = hoveredBar === i;
                return (
                  <g key={i}>
                    <rect x={xBase - 15} y="0" width="55" height="200" fill="transparent" className="cursor-pointer"
                      onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)} />
                    {isHovered && <rect x={xBase - 8} y="0" width="50" height="200" fill="#f8fafc" rx="4" />}
                    {/* Incoming */}
                    <rect x={xBase} y={200 - hIn} width="14" height={hIn} rx="3"
                      fill="#2563eb" opacity={isHovered ? 1 : 0.85} />
                    {/* Outgoing */}
                    <rect x={xBase + 18} y={200 - hOut} width="14" height={hOut} rx="3"
                      fill="#8b5cf6" opacity={isHovered ? 1 : 0.85} />
                    {/* Label */}
                    <text x={xBase + 13} y="198" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600">
                      {d.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Tooltip */}
            {hoveredBar !== null && (
              <div style={{
                position: "absolute",
                left: Math.min(30 + hoveredBar * 66 - 20, 400),
                bottom: 80,
                background: "#0f172a", color: "#fff",
                borderRadius: 8, padding: "8px 12px",
                fontSize: 12, pointerEvents: "none",
                border: "1px solid #1e293b", boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                zIndex: 10,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>
                  {chartData[hoveredBar].label}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 20, marginBottom: 3 }}>
                  <span style={{ color: "#94a3b8" }}>Entradas:</span>
                  <span style={{ fontWeight: 700, color: "#60a5fa" }}>+{chartData[hoveredBar].incoming}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
                  <span style={{ color: "#94a3b8" }}>Salidas:</span>
                  <span style={{ fontWeight: 700, color: "#a78bfa" }}>-{chartData[hoveredBar].outgoing}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="premium-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 4px 0", fontFamily: "var(--font-display, system-ui)" }}>
            Pedidos por Estado
          </h3>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 24 }}>Desglose de la carga operativa actual</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {[
              { status: "Pendiente", color: "#2563eb", trackBg: "#eff6ff" },
              { status: "Picking",   color: "#7c3aed", trackBg: "#f5f3ff" },
              { status: "Packing",   color: "#d97706", trackBg: "#fffbeb" },
              { status: "En Ruta",   color: "#15803d", trackBg: "#f0fdf4" },
            ].map(s => {
              const count = data.orders.filter(o => o.status === s.status).length;
              const pct = data.orders.length > 0 ? (count / data.orders.length) * 100 : 0;
              return (
                <div key={s.status}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 500, color: "#334155" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block", flexShrink: 0 }} />
                      {s.status}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                      {count} <span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8" }}>({Math.round(pct)}%)</span>
                    </span>
                  </div>
                  <div style={{ height: 6, background: s.trackBg, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: s.color, borderRadius: 999, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RECENT ORDERS ── */}
      <div className="premium-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0, fontFamily: "var(--font-display, system-ui)" }}>
            Pedidos Recientes
          </h3>
          <Link href="/orders" style={{
            fontSize: 12, fontWeight: 600, color: "#2563eb",
            textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
          }}>
            Ver todos
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_forward</span>
          </Link>
        </div>
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <table className="data-table">
            <thead>
              <tr>
                {["Pedido", "Cliente", "Monto", "Estado", "Asignado"].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.orders.slice(0, 5).map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700, color: "#0f172a" }}>#{o.id}</td>
                  <td style={{ fontWeight: 500 }}>{o.customer}</td>
                  <td style={{ fontWeight: 700 }}>{
                    "S/ " + Number(o.amount).toLocaleString("es-PE", { minimumFractionDigits: 2 })
                  }</td>
                  <td>
                    <span style={{
                      display: "inline-block", padding: "2px 10px", borderRadius: 999,
                      fontSize: 11, fontWeight: 600,
                      background:
                        o.status === "Pendiente" ? "#eff6ff" :
                        o.status === "Picking" ? "#f5f3ff" :
                        o.status === "Packing" ? "#fffbeb" :
                        o.status === "En Ruta" ? "#f0fdf4" :
                        o.status === "Entregado" ? "#dcfce7" : "#f1f5f9",
                      color:
                        o.status === "Pendiente" ? "#2563eb" :
                        o.status === "Picking" ? "#7c3aed" :
                        o.status === "Packing" ? "#d97706" :
                        o.status === "En Ruta" ? "#15803d" :
                        o.status === "Entregado" ? "#15803d" : "#64748b",
                    }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ color: "#64748b" }}>{o.assigned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}