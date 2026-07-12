"use client";
import { useState } from "react";
import { mockData } from "@/lib/mock/data";
import { locCode } from "@/lib/utils/format";

export default function LocationsPage() {
  const [selected, setSelected] = useState<string | null>("A4-12-03");
  const cfg = mockData.warehouseConfig;
  const locs = mockData.locations;

  const getLocInfo = (code: string) => locs.find(l => l.code === code);
  const sel = selected ? getLocInfo(selected) : null;

  const productsInLoc = sel
    ? mockData.products.filter(p =>
        p.location === sel.code ||
        p.location?.replace(/-/g, "") === sel.code.replace(/-/g, "")
      )
    : [];

  // Overall occupancy stats
  const totalUsed = locs.reduce((a, l) => a + l.used, 0);
  const totalCap = locs.reduce((a, l) => a + l.capacity, 0);
  const occupancyPct = totalCap > 0 ? Math.round((totalUsed / totalCap) * 100) : 0;
  const fullLocs = locs.filter(l => (l.used / l.capacity) >= 0.95).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── PAGE HEADER ── */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0 }}>
          Hub Central de Distribución
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
          Distribución espacial y control de capacidad del almacén (Secciones A-E).
        </p>
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: "Ocupación Total",     value: `${occupancyPct}%`, icon: "donut_large",   color: "#2563eb", bg: "#eff6ff" },
          { label: "Ubicaciones Totales", value: locs.length,        icon: "pin_drop",      color: "#7c3aed", bg: "#f5f3ff" },
          { label: "Ubicaciones Críticas",value: fullLocs,           icon: "warning",       color: "#dc2626", bg: "#fef2f2" },
        ].map(s => (
          <div key={s.label} className="premium-card" style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", lineHeight: 1 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>

        {/* LEFT: Warehouse Floor Map */}
        <div className="premium-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 4px 0" }}>
                Mapa de Estanterías
              </h3>
              <p style={{ fontSize: 12, color: "#94a3b8" }}>Distribución en planta y ocupación de pasillos</p>
            </div>
            {/* Legend */}
            <div style={{ display: "flex", gap: 14, fontSize: 11, fontWeight: 600 }}>
              {[
                { dot: "#bfdbfe", text: "Libre / Bajo" },
                { dot: "#fde68a", text: "Medio" },
                { dot: "#fecaca", text: "Lleno" },
              ].map(l => (
                <span key={l.text} style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: l.dot, display: "inline-block", border: "1px solid rgba(0,0,0,0.08)" }} />
                  {l.text}
                </span>
              ))}
            </div>
          </div>

          {/* Section grid */}
          <div style={{
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: 12, padding: 20, overflowX: "auto",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, minWidth: 600 }}>
              {cfg.sections.map(section => (
                <div key={section} style={{
                  background: "#fff", border: "1px solid #e2e8f0",
                  borderRadius: 12, padding: 14,
                  boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
                }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid #f1f5f9",
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-display, system-ui)" }}>
                      Sección {section}
                    </span>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>Pasillos 1-7</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {cfg.aisles.map(aisle => {
                      const found = locs.find(l =>
                        l.zone === section || (l.zone.startsWith(section) && l.rack === aisle)
                      );
                      const code = found ? found.code : locCode(section, aisle, "01", "01");
                      const pct = found ? Math.round((found.used / found.capacity) * 100) : 0;
                      const isSelected = selected === code;

                      const cellBg   = pct >= 95 ? "#fef2f2" : pct >= 75 ? "#fffbeb" : "#eff6ff";
                      const cellColor= pct >= 95 ? "#dc2626" : pct >= 75 ? "#d97706" : "#2563eb";
                      const cellBdr  = pct >= 95 ? "#fecaca" : pct >= 75 ? "#fde68a" : "#bfdbfe";

                      return (
                        <button
                          key={aisle}
                          onClick={() => setSelected(code)}
                          style={{
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            padding: "10px 6px", borderRadius: 8, border: `1.5px solid ${isSelected ? "#2563eb" : cellBdr}`,
                            background: isSelected ? "#eff6ff" : cellBg,
                            cursor: "pointer", transition: "all 0.15s ease",
                            outline: isSelected ? "2px solid #bfdbfe" : "none",
                            outlineOffset: 2,
                          }}
                        >
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: isSelected ? "#2563eb" : cellColor }}>
                            {section}-{aisle}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 500, color: isSelected ? "#2563eb" : cellColor, opacity: 0.8, marginTop: 2 }}>
                            {found ? `${pct}%` : "Vacío"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Info + Route */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Location detail */}
          <div className="premium-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 14px 0", paddingBottom: 10, borderBottom: "1px solid #e2e8f0" }}>
              Información de Ubicación
            </h3>

            {sel ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Code */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  borderRadius: 8, padding: "10px 14px",
                }}>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Código Estante</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)" }}>{sel.code}</span>
                </div>

                {/* Capacity bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Nivel de Capacidad</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                      {sel.used} / {sel.capacity}
                    </span>
                  </div>
                  <div style={{ height: 6, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(100, (sel.used / sel.capacity) * 100)}%`,
                      background: Math.round((sel.used / sel.capacity) * 100) >= 95 ? "#dc2626" : "#2563eb",
                      borderRadius: 999, transition: "width 0.3s",
                    }} />
                  </div>

                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500 }}>
                    {Math.round((sel.used / sel.capacity) * 100) >= 95 ? (
                      <>
                        <span className="material-symbols-outlined" style={{ fontSize: 15, color: "#dc2626" }}>warning</span>
                        <span style={{ color: "#dc2626" }}>Capacidad máxima alcanzada.</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined" style={{ fontSize: 15, color: "#15803d" }}>check_circle</span>
                        <span style={{ color: "#15803d" }}>Estado operativo normal.</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Products in location */}
                <div style={{ paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 10 }}>
                    Productos Almacenados
                  </span>
                  {productsInLoc.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {productsInLoc.map(p => (
                        <div key={p.sku} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          background: "#f8fafc", border: "1px solid #e2e8f0",
                          borderRadius: 8, padding: "8px 10px",
                        }}>
                          {p.image ? (
                            <img src={p.image} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover", border: "1px solid #e2e8f0", flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 32, height: 32, borderRadius: 6, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#94a3b8" }}>inventory_2</span>
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{p.sku}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                      No hay productos en esta ubicación.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "24px 0" }}>
                Haz clic en un estante para ver su info.
              </p>
            )}
          </div>

          {/* Route Planner */}
          <div className="premium-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 4px 0" }}>
              Planificador de Ruta
            </h3>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>Secuencia optimizada de picking</p>

            <div style={{
              height: 180, background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: 10, overflow: "hidden", position: "relative",
            }}>
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 280 180">
                {/* Grid lines */}
                {[40, 80, 120, 160].map(y => (
                  <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                ))}
                {[70, 140, 210].map(x => (
                  <line key={x} x1={x} y1="0" x2={x} y2="180" stroke="#e2e8f0" strokeWidth="1" />
                ))}
                {/* Route path */}
                <path d="M 40 130 C 100 70, 180 150, 240 60"
                  fill="none" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="6,4" />
                {/* Nodes */}
                {[
                  { cx: 40, cy: 130, n: "1", loc: "A-02" },
                  { cx: 140, cy: 90, n: "2", loc: "B-04" },
                  { cx: 240, cy: 60, n: "3", loc: "C-03" },
                ].map(nd => (
                  <g key={nd.n}>
                    <circle cx={nd.cx} cy={nd.cy} r="14" fill="#2563eb" />
                    <text x={nd.cx} y={nd.cy + 4} fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">{nd.n}</text>
                    <text x={nd.cx} y={nd.cy + 24} fill="#475569" fontSize="9" fontWeight="bold" textAnchor="middle">{nd.loc}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}