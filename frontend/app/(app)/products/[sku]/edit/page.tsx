"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { apiClient, getCategories, getBrandsByCategory, Category, Brand } from "@/lib/api/client";
import ImageUploader from "@/components/ImageUploader";

const fieldStyle: React.CSSProperties = {
  width: "100%", border: "1px solid #e2e8f0", borderRadius: 10,
  padding: "10px 14px", background: "#fff", fontSize: 13.5,
  color: "#0f172a", outline: "none", fontFamily: "inherit",
};

const selectStyle: React.CSSProperties = {
  ...fieldStyle, paddingRight: 36, cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8",
  textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6,
};

const warehouseConfig = {
  sections: ["A", "B", "C", "D", "E"],
  aisles: ["1", "2", "3", "4", "5", "6", "7"],
  levels: ["01", "02", "03", "04"],
  bins: ["01", "02", "03", "04", "05"],
};

export default function EditProductPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = use(params);
  const { token, canSupervise } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    id: 0, name: "", categoryId: "", brandId: "", price: "0",
    description: "", min: "0", imagen: null as string | null,
    section: "A", aisle: "1", level: "01", bin: "01",
  });

  useEffect(() => {
    if (!token) return;
    Promise.all([
      apiClient(`/api/products/sku/${sku}`, { token }),
      getCategories(token),
    ]).then(([prodRes, cats]) => {
      const p = prodRes.data;
      setCategories(cats);
      setForm({
        id: p.Id_Producto || 0,
        name: p.Nombre_Producto || "",
        categoryId: String(p.Id_Categoria || ""),
        brandId: p.Id_Marca ? String(p.Id_Marca) : "",
        price: String(p.Precio || 0),
        description: p.Descripcion || "",
        min: String(p.Stock_Minimo || 0),
        imagen: p.Imagen || null,
        section: "A", aisle: "1", level: "01", bin: "01",
      });
      if (p.Id_Categoria) {
        getBrandsByCategory(p.Id_Categoria, token).then(setBrands).catch(() => {});
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token, sku]);

  useEffect(() => {
    if (!token || !form.categoryId) { setBrands([]); return; }
    setForm(f => ({ ...f, brandId: "" }));
    getBrandsByCategory(Number(form.categoryId), token)
      .then(data => {
        setBrands(data);
        if (data.length > 0) setForm(f => ({ ...f, brandId: String(data[0].Id_Marca) }));
      }).catch(() => {});
  }, [form.categoryId, token]);

  if (!canSupervise()) {
    return <div className="premium-card" style={{ padding: 24, textAlign: "center", color: "#dc2626" }}>Acceso restringido</div>;
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Cargando producto...</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await apiClient(`/api/products/${form.id}`, {
        method: "PUT",
        token,
        body: {
          nombre: form.name,
          descripcion: form.description,
          precio: Number(form.price),
          stockMinimo: Number(form.min),
          categoria: Number(form.categoryId),
          idMarca: form.brandId ? Number(form.brandId) : null,
          imagen: form.imagen,
        },
      });
      router.push(`/products/${sku}`);
    } catch (e: any) {
      alert(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0 }}>
            Editar Producto
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
            Modificando: <strong style={{ color: "#0f172a" }}>{sku}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <button type="button" onClick={() => router.push(`/products/${sku}`)} style={{
            padding: "9px 18px", borderRadius: 9, border: "1px solid #e2e8f0",
            background: "#fff", fontSize: 13, fontWeight: 600, color: "#334155",
            cursor: "pointer", fontFamily: "inherit",
          }}>Cancelar</button>
          <button type="button" onClick={handleSubmit} className="premium-button" disabled={saving}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>save</span>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid-2col">
        <div className="premium-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 20px 0", paddingBottom: 14, borderBottom: "1px solid #e2e8f0" }}>
            Información General
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Nombre del producto *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>SKU</label>
              <input readOnly value={sku} style={{ ...fieldStyle, background: "#f8fafc", color: "#64748b", cursor: "not-allowed" }} />
            </div>
            <div>
              <label style={labelStyle}>Categoría *</label>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} style={selectStyle}>
                {categories.map(c => <option key={c.Id_Categoria} value={c.Id_Categoria}>{c.Nombre_Categoria}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Marca</label>
              <select value={form.brandId} onChange={e => setForm({ ...form, brandId: e.target.value })} style={selectStyle}>
                <option value="">Sin marca</option>
                {brands.map(b => <option key={b.Id_Marca} value={b.Id_Marca}>{b.Nombre_Marca}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Precio unitario</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={fieldStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...fieldStyle, resize: "none", lineHeight: 1.6 }} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="premium-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 18px 0", paddingBottom: 12, borderBottom: "1px solid #e2e8f0" }}>
              Imagen del Producto
            </h3>
            <ImageUploader value={form.imagen} onChange={(img) => setForm({ ...form, imagen: img })} size={180} />
          </div>

          <div className="premium-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 18px 0", paddingBottom: 12, borderBottom: "1px solid #e2e8f0" }}>
              Stock Mínimo
            </h3>
            <div>
              <label style={labelStyle}>Stock Mínimo</label>
              <input type="number" min="0" value={form.min} onChange={e => setForm({ ...form, min: e.target.value })} style={fieldStyle} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
