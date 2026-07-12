"use client";
import { mockData } from "@/lib/mock/data";

export default function ReportsPage() {
  const locs = mockData.locations;
  const occupancyPct = locs.length > 0
    ? Math.round(
        locs.reduce((a, l) => a + l.used, 0) /
        locs.reduce((a, l) => a + l.capacity, 0) * 100
      )
    : 0;

  const chartData = [35, 48, 39, 55, 82, 75, 31, 70];
  const maxBar = Math.max(...chartData);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── PAGE HEADER ── */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0 }}>
          Reportes Avanzados
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
          Métricas operativas y rendimiento logístico en tiempo real.
        </p>
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {[
          {
            label: "SKU Más Vendido",
            value: mockData.products[0]?.sku || "N/A",
            sub: mockData.products[0]?.name || "",
            icon: "trending_up", color: "#2563eb", bg: "#eff6ff",
          },
          {
            label: "Tiempo Promedio Picking",
            value: "18.5 min",
            sub: "Optimizado en último periodo",
            icon: "schedule", color: "#7c3aed", bg: "#f5f3ff",
          },
          {
            label: "Ocupación Almacén",
            value: `${occupancyPct}%`,
            sub: "Dentro del margen recomendado",
            icon: "warehouse", color: "#15803d", bg: "#f0fdf4",
          },
        ].map((kpi, i) => (
          <div key={i} className="premium-card" style={{ padding: "22px 24px", display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: kpi.bg, display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: kpi.color }}>{kpi.icon}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", lineHeight: 1, marginBottom: 4 }}>
                {kpi.value}
              </div>
              {kpi.sub && (
                <div style={{ fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {kpi.sub}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS + INCIDENTS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Bar chart */}
        <div className="premium-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 4px 0" }}>
            Tendencias Operativas
          </h3>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>Volumen operativo por periodo</p>

          <div style={{
            height: 200, display: "flex", alignItems: "flex-end", gap: 8,
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: 12, padding: "16px 14px 12px",
          }}>
            {chartData.map((h, i) => {
              const barH = (h / maxBar) * 140;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div
                    title={`Periodo ${i + 1}: ${h}%`}
                    style={{
                      width: "100%", height: barH,
                      background: "linear-gradient(to top, #2563eb, #60a5fa)",
                      borderRadius: "5px 5px 0 0",
                      cursor: "pointer", transition: "opacity 0.15s",
                    }}
                  />
                  <span style={{ fontSize: 9, fontWeight: 600, color: "#94a3b8" }}>P{i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incidents */}
        <div className="premium-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 4px 0", paddingBottom: 12, borderBottom: "1px solid #e2e8f0" }}>
            Incidencias Recientes
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 220, overflowY: "auto", marginTop: 12 }}>
            {mockData.incidents.length === 0 ? (
              <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", textAlign: "center", padding: "24px 0" }}>
                Sin incidencias registradas
              </p>
            ) : mockData.incidents.map((inc, i) => (
              <div key={i} style={{
                background: "#f8fafc", border: "1px solid #e2e8f0",
                borderRadius: 10, padding: "12px 14px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Pedido {inc.orderId}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{inc.date}</span>
                </div>
                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 4px 0" }}>{inc.msg}</p>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>Reportado por: {inc.user}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PERFORMANCE TABLE ── */}
      <div className="premium-card" style={{ padding: 24 }}>
        <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 4px 0" }}>
            Rendimiento por Categoría
          </h3>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>Rotación de inventario por línea de producto</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { cat: "Electrónica",             pct: 84, color: "#2563eb" },
            { cat: "Herramientas Eléctricas", pct: 67, color: "#7c3aed" },
            { cat: "Calzado",                 pct: 52, color: "#d97706" },
            { cat: "Accesorios",              pct: 91, color: "#15803d" },
          ].map(r => (
            <div key={r.cat}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{r.cat}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{r.pct}%</span>
              </div>
              <div style={{ height: 6, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${r.pct}%`,
                  background: r.color, borderRadius: 999,
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}