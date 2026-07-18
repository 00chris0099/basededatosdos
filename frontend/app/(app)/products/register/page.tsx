"use client";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { apiClient, getCategories, getBrandsByCategory, createCategory, createBrand, Category, Brand } from "@/lib/api/client";
import ModalOverlay from "@/components/ModalOverlay";

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

const addBtnStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 8,
  border: "1px dashed #cbd5e1",
  background: "#f8fafc",
  color: "#2563eb",
  fontSize: 18,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "background 0.15s, border-color 0.15s",
};

const warehouseConfig = {
  sections: ["A", "B", "C", "D", "E"],
  aisles: ["1", "2", "3", "4", "5", "6", "7"],
  levels: ["01", "02", "03", "04"],
  bins: ["01", "02", "03", "04", "05"],
};

export default function ProductRegisterPage() {
  const { canSupervise, token } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(false);

  const [modalCategory, setModalCategory] = useState(false);
  const [modalBrand, setModalBrand] = useState(false);

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    brandId: "",
    price: "0",
    unit: "Unidad",
    description: "",
    stock: "0",
    min: "0",
    max: "100",
    section: "A",
    aisle: "1",
    level: "01",
    bin: "01",
  });

  // Load categories on mount
  useEffect(() => {
    if (!token) return;
    getCategories(token)
      .then((data) => {
        setCategories(data);
        if (data.length > 0) {
          setForm((f) => ({ ...f, categoryId: String(data[0].Id_Categoria) }));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCategories(false));
  }, [token]);

  // Load brands when category changes
  useEffect(() => {
    if (!token || !form.categoryId) {
      setBrands([]);
      return;
    }
    setLoadingBrands(true);
    setForm((f) => ({ ...f, brandId: "" }));
    getBrandsByCategory(Number(form.categoryId), token)
      .then((data) => {
        setBrands(data);
        if (data.length > 0) {
          setForm((f) => ({ ...f, brandId: String(data[0].Id_Marca) }));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingBrands(false));
  }, [form.categoryId, token]);

  if (!canSupervise()) {
    return (
      <div className="premium-card" style={{ padding: 24, textAlign: "center", color: "#dc2626" }}>
        Acceso restringido
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const locationCode = `${form.section}-${String(form.aisle).padStart(2, "0")}-${form.level}-${form.bin}`;

    // Generate SKU client-side
    const sku = `SKU-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")}`;

    await apiClient("/api/products", {
      method: "POST",
      token,
      body: {
        codigo: sku,
        nombre: form.name,
        descripcion: form.description,
        precio: Number(form.price),
        stockMinimo: Number(form.min),
        categoria: Number(form.categoryId),
        idMarca: form.brandId ? Number(form.brandId) : null,
        stockInicial: Number(form.stock),
        ubicacion: locationCode,
      },
    });
    router.push("/products");
  };

  const handleCreateCategory = async (nombre: string) => {
    if (!token) return;
    const newCat = await createCategory(nombre, token);
    setCategories((prev) => [...prev, newCat]);
    setForm((f) => ({ ...f, categoryId: String(newCat.Id_Categoria), brandId: "" }));
  };

  const handleCreateBrand = async (nombre: string) => {
    if (!token || !form.categoryId) return;
    const newBrand = await createBrand(nombre, Number(form.categoryId), token);
    setBrands((prev) => [...prev, newBrand]);
    setForm((f) => ({ ...f, brandId: String(newBrand.Id_Marca) }));
  };

  const locationCode = `${form.section}-${String(form.aisle).padStart(2, "0")}-${form.level}-${form.bin}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* PAGE HEADER */}
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

      {/* FORM GRID */}
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
              <input readOnly value="Se genera al guardar" style={readonlyFieldStyle} />
            </div>

            {/* CATEGORÍA con botón + */}
            <div>
              <label style={labelStyle}>Categoría *</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  style={{ ...selectStyle, flex: 1 }}
                  disabled={loadingCategories}
                >
                  {loadingCategories && <option>Cargando...</option>}
                  {categories.map(c => (
                    <option key={c.Id_Categoria} value={c.Id_Categoria}>{c.Nombre_Categoria}</option>
                  ))}
                </select>
                <button
                  type="button"
                  title="Crear nueva categoría"
                  onClick={() => setModalCategory(true)}
                  style={addBtnStyle}
                  onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderColor = "#2563eb"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
                >
                  +
                </button>
              </div>
            </div>

            {/* MARCA con botón + */}
            <div>
              <label style={labelStyle}>Marca</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select
                  value={form.brandId}
                  onChange={e => setForm({ ...form, brandId: e.target.value })}
                  style={{ ...selectStyle, flex: 1 }}
                  disabled={loadingBrands || !form.categoryId}
                >
                  {loadingBrands && <option>Cargando...</option>}
                  {!loadingBrands && brands.length === 0 && <option value="">Sin marcas</option>}
                  {brands.map(b => (
                    <option key={b.Id_Marca} value={b.Id_Marca}>{b.Nombre_Marca}</option>
                  ))}
                </select>
                <button
                  type="button"
                  title="Crear nueva marca"
                  onClick={() => setModalBrand(true)}
                  style={addBtnStyle}
                  onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderColor = "#2563eb"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
                >
                  +
                </button>
              </div>
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
                  {warehouseConfig.sections.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Pasillo</label>
                <select value={form.aisle} onChange={e => setForm({ ...form, aisle: e.target.value })} style={selectStyle}>
                  {warehouseConfig.aisles.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Nivel</label>
                <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} style={selectStyle}>
                  {warehouseConfig.levels.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Bin</label>
                <select value={form.bin} onChange={e => setForm({ ...form, bin: e.target.value })} style={selectStyle}>
                  {warehouseConfig.bins.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>

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

      {/* MODALS */}
      <ModalOverlay
        open={modalCategory}
        title="Nueva Categoría"
        placeholder="Nombre de la categoría..."
        onConfirm={handleCreateCategory}
        onClose={() => setModalCategory(false)}
      />
      <ModalOverlay
        open={modalBrand}
        title={`Nueva Marca ${categories.find(c => c.Id_Categoria === Number(form.categoryId))?.Nombre_Categoria ? `para ${categories.find(c => c.Id_Categoria === Number(form.categoryId))?.Nombre_Categoria}` : ""}`}
        placeholder="Nombre de la marca..."
        onConfirm={handleCreateBrand}
        onClose={() => setModalBrand(false)}
      />
    </div>
  );
}
