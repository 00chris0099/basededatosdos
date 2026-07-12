"use client";
import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { mockData } from "@/lib/mock/data";

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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 6,
};

function StatusBadge({ role }: { role: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    "Administrador": { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    "Supervisor":    { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
    "Operario":      { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    "Dueño":         { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  };
  const s = map[role] || { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 10px", borderRadius: 999,
      fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      whiteSpace: "nowrap",
    }}>
      {role}
    </span>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", dni: "", photo: "" });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (user) {
      const found = mockData.users.find(u => u.id === user.id);
      if (found) {
        setForm({ name: found.name, email: found.email, dni: found.dni, photo: found.photo });
        setPhotoPreview(found.photo);
      }
    }
  }, [user]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const r = reader.result as string;
      setPhotoPreview(r);
      setForm({ ...form, photo: r });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      setMsg({ text: "Error al actualizar perfil", ok: false });
      return;
    }
    setMsg({ text: "Perfil actualizado exitosamente", ok: true });
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── PAGE HEADER ── */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0 }}>
          Configuración y Perfil
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
          Administre su información personal, preferencias de cuenta e identidad.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, alignItems: "start" }}>

        {/* LEFT: Preview Profile Card */}
        <div className="premium-card" style={{ padding: 28, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "#eff6ff", border: "4px solid #bfdbfe",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, fontWeight: 700, color: "#2563eb",
              overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
            }}>
              {photoPreview ? (
                <img src={photoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                form.name?.charAt(0) || "?"
              )}
            </div>
            <span style={{ position: "absolute", bottom: 4, right: 4, width: 16, height: 16, background: "#10b981", border: "3px solid #fff", borderRadius: "50%" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0, fontFamily: "var(--font-display, system-ui)" }}>
              {form.name || user?.name}
            </h3>
            <StatusBadge role={user?.role || ""} />
          </div>

          <div style={{ fontSize: 13.5, color: "#64748b", display: "flex", flexDirection: "column", gap: 2 }}>
            <span>{form.email || user?.email}</span>
            {form.dni && <span style={{ fontSize: 11, color: "#94a3b8" }}>DNI: {form.dni}</span>}
          </div>
        </div>

        {/* RIGHT: Form Edit Profile */}
        <div className="premium-card" style={{ padding: 28 }}>
          <h3 style={{
            fontSize: 15, fontWeight: 700, color: "#0f172a",
            fontFamily: "var(--font-display, system-ui)",
            margin: "0 0 20px 0", paddingBottom: 14,
            borderBottom: "1px solid #e2e8f0",
          }}>
            Editar Perfil
          </h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Nombre Completo</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={fieldStyle} placeholder="Nombre" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Correo Electrónico</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={fieldStyle} placeholder="correo@empresa.com" />
              </div>
              <div>
                <label style={labelStyle}>DNI / Identificación</label>
                <input value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} style={fieldStyle} placeholder="Documento de identidad" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Fotografía de Perfil</label>
              <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                  style={{ fontSize: 13, color: "#64748b" }}
                />
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt=""
                    style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "1px solid #e2e8f0" }}
                  />
                )}
              </div>
            </div>

            <button type="submit" className="premium-button" style={{ marginTop: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>save</span>
              Guardar Cambios
            </button>
          </form>

          {msg && (
            <div style={{
              marginTop: 16, padding: "10px 14px", borderRadius: 8,
              fontSize: 13.5, fontWeight: 600,
              background: msg.ok ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${msg.ok ? "#bbf7d0" : "#fecaca"}`,
              color: msg.ok ? "#15803d" : "#dc2626",
            }}>
              {msg.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}