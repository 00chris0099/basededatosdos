"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { mockData } from "@/lib/mock/data";
import { uniqueSKU, locCode } from "@/lib/utils/format";
import { useAuth } from "@/lib/auth/auth-context";

const fieldStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  padding: "10px 14px",
  background: "#fff",
  fontSize: 13.5,
  color: "#0f172a",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const selectStyle: React.CSSProperties = {
  ...fieldStyle,
  paddingRight: 36,
  cursor: "pointer",
};

const readonlyFieldStyle: React.CSSProperties = {
  ...fieldStyle,
  background: "#f8fafc",
  color: "#64748b",
  cursor: "not-allowed",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 6,
};

export default function ProductRegisterPage() {
  const { canSupervise } = useAuth();
  const router = useRouter();
  const sku = uniqueSKU(mockData.products.map(p => p.sku));
  const cfg = mockData.warehouseConfig;

  const [form, setForm] = useState({
    name: "", brand: "", category: "Electrónica", price: "0", unit: "Unidad",
    description: "", stock: "0", min: "0", max: "100",
    section: "A", aisle: "1", level: "01", bin: "01", image: "",
  });

  if (!canSupervise()) {
    return (
      <div className="premium-card" style={{ padding: 24, textAlign: "center", color: "#dc2626" }}>
        Acceso restringido
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name, brand: form.brand, category: form.category, price: Number(form.price),
        unit: form.unit, description: form.description, stock: Number(form.stock),
        min: Number(form.min), max: Number(form.max),
        location: locCode(form.section, form.aisle, form.level, form.bin), image: form.image,
      }),
    });
    router.push("/products");
  };

  const locationCode = locCode(form.section, form.aisle, form.level, form.bin);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0 }}>
            Registrar Producto
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
            El SKU se genera automáticamente. La ubicación usa secciones A-E y pasillos 1-7.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => router.push("/products")}
            style={{
              padding: "9px 18px", borderRadius: 9,
              border: "1px solid #e2e8f0", background: "#fff",
              fontSize: 13, fontWeight: 600, color: "#334155",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Descartar
          </button>
          <button type="button" onClick={handleSubmit} className="premium-button">
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>save</span>
            Finalizar Registro
          </button>
        </div>
      </div>

      {/* ── FORM GRID ── */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" }}
      >
        {/* LEFT: General Info */}
        <div className="premium-card" style={{ padding: 28 }}>
          <h3 style={{
            fontSize: 14, fontWeight: 700, color: "#0f172a",
            fontFamily: "var(--font-display, system-ui)",
            margin: "0 0 20px 0", paddingBottom: 14,
            borderBottom: "1px solid #e2e8f0",
          }}>
            Información General
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Nombre del producto *</label>
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ej. Router WiFi AX3000"
                style={fieldStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>SKU automático *</label>
              <input readOnly value={sku} style={readonlyFieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Marca / Fabricante</label>
              <input
                value={form.brand}
                onChange={e => setForm({ ...form, brand: e.target.value })}
                placeholder="Ej. TP-Link"
                style={fieldStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Categoría</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={selectStyle}>
                {["Electrónica", "Herramientas Eléctricas", "Calzado", "Accesorios", "Hogar"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Precio unitario</label>
              <input
                type="number" min="0" step="0.01"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                style={fieldStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Unidad de medida</label>
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={selectStyle}>
                {["Unidad", "Par", "Caja"].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Descripción técnica</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Especificaciones, uso, garantía..."
              style={{ ...fieldStyle, resize: "none", lineHeight: 1.6 }}
            />
          </div>
        </div>

        {/* RIGHT: Inventory + Location */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Inventory control */}
          <div className="premium-card" style={{ padding: 24 }}>
            <h3 style={{
              fontSize: 14, fontWeight: 700, color: "#0f172a",
              fontFamily: "var(--font-display, system-ui)",
              margin: "0 0 18px 0", paddingBottom: 12,
              borderBottom: "1px solid #e2e8f0",
            }}>
              Control de Inventario
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Stock Inicial</label>
                <input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Stock Mínimo</label>
                <input type="number" min="0" value={form.min} onChange={e => setForm({ ...form, min: e.target.value })} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Capacidad Máxima del Bin</label>
                <input type="number" min="1" value={form.max} onChange={e => setForm({ ...form, max: e.target.value })} style={fieldStyle} />
              </div>
            </div>
          </div>

          {/* Warehouse location */}
          <div className="premium-card" style={{ padding: 24 }}>
            <h3 style={{
              fontSize: 14, fontWeight: 700, color: "#0f172a",
              fontFamily: "var(--font-display, system-ui)",
              margin: "0 0 18px 0", paddingBottom: 12,
              borderBottom: "1px solid #e2e8f0",
            }}>
              Ubicación en Almacén
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Sección</label>
                <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} style={selectStyle}>
                  {cfg.sections.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Pasillo</label>
                <select value={form.aisle} onChange={e => setForm({ ...form, aisle: e.target.value })} style={selectStyle}>
                  {cfg.aisles.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Nivel</label>
                <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} style={selectStyle}>
                  {cfg.levels.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Bin</label>
                <select value={form.bin} onChange={e => setForm({ ...form, bin: e.target.value })} style={selectStyle}>
                  {cfg.bins.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>

            {/* Generated code display */}
            <div style={{
              textAlign: "center", padding: "14px 16px",
              background: "#eff6ff", border: "1px solid #bfdbfe",
              borderRadius: 10,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
                Código de Ubicación Generado
              </span>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#2563eb", fontFamily: "var(--font-display, system-ui)" }}>
                {locationCode}
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}