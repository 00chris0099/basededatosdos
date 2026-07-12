"use client";
import { useState, FormEvent } from "react";
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

const selectStyle: React.CSSProperties = {
  ...fieldStyle,
  paddingRight: 36,
  cursor: "pointer",
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

export default function UsersPage() {
  const { user, canManage } = useAuth();
  const [users, setUsers] = useState(mockData.users);
  const [form, setForm] = useState({ name: "", email: "", dni: "", role: "Operario", password: "123456" });
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  if (!canManage()) {
    return (
      <div className="premium-card" style={{ padding: 24, textAlign: "center", color: "#dc2626", fontWeight: 600 }}>
        Acceso restringido. Solo los administradores pueden gestionar usuarios.
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg({ text: data.message || "Error al crear usuario", ok: false });
      return;
    }
    setForm({ name: "", email: "", dni: "", role: "Operario", password: "123456" });
    setUsers([...mockData.users]);
    setMsg({ text: "Usuario creado exitosamente", ok: true });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── PAGE HEADER ── */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0 }}>
          Usuarios y Roles
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
          Administre las cuentas de los operarios, supervisores y permisos del sistema.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

        {/* LEFT: Create User Card */}
        <div className="premium-card" style={{ padding: 28 }}>
          <h3 style={{
            fontSize: 15, fontWeight: 700, color: "#0f172a",
            fontFamily: "var(--font-display, system-ui)",
            margin: "0 0 20px 0", paddingBottom: 14,
            borderBottom: "1px solid #e2e8f0",
          }}>
            Crear Nuevo Usuario
          </h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Nombre Completo</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={fieldStyle} placeholder="Ej. Carlos Mendoza" />
              </div>
              <div>
                <label style={labelStyle}>Correo Electrónico</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={fieldStyle} placeholder="correo@empresa.com" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>DNI / Identificación</label>
                <input required value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} style={fieldStyle} placeholder="Documento de identidad" />
              </div>
              <div>
                <label style={labelStyle}>Rol de Sistema</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={selectStyle}>
                  {["Administrador", "Supervisor", "Operario", "Dueño"].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Contraseña Temporal</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={fieldStyle} />
            </div>

            <button type="submit" className="premium-button" style={{ marginTop: 8, justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>person_add</span>
              Crear Usuario
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

        {/* RIGHT: Current User Summary Card */}
        <div className="premium-card" style={{ padding: 28, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "#eff6ff", border: "4px solid #bfdbfe",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, fontWeight: 700, color: "#2563eb",
              overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
            }}>
              {user?.photo ? (
                <img src={user.photo} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                user?.name?.charAt(0) || "?"
              )}
            </div>
            <span style={{ position: "absolute", bottom: 4, right: 4, width: 16, height: 16, background: "#10b981", border: "3px solid #fff", borderRadius: "50%" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0, fontFamily: "var(--font-display, system-ui)" }}>
              {user?.name}
            </h3>
            <StatusBadge role={user?.role || ""} />
          </div>

          <div style={{ fontSize: 13.5, color: "#64748b", display: "flex", flexDirection: "column", gap: 2 }}>
            <span>{user?.email}</span>
            {user?.dni && <span style={{ fontSize: 11, color: "#94a3b8" }}>DNI: {user.dni}</span>}
          </div>
        </div>
      </div>

      {/* ── USERS LIST TABLE ── */}
      <div className="premium-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0", fontFamily: "var(--font-display, system-ui)" }}>
          Listado de Usuarios Registrados
        </h3>
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <table className="data-table">
            <thead>
              <tr>
                {["Foto", "Nombre", "Correo", "DNI", "Rol", "Estado"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "#eff6ff", border: "1px solid #bfdbfe",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 600, color: "#2563eb", overflow: "hidden",
                    }}>
                      {u.photo ? (
                        <img src={u.photo} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        u.name.charAt(0)
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: "#0f172a" }}>{u.name}</td>
                  <td style={{ color: "#64748b" }}>{u.email}</td>
                  <td style={{ color: "#64748b", fontFamily: "var(--font-display, system-ui)" }}>{u.dni}</td>
                  <td><StatusBadge role={u.role} /></td>
                  <td>
                    <span style={{
                      display: "inline-flex", padding: "2px 8px", borderRadius: 999,
                      fontSize: 11, fontWeight: 700, background: "#f0fdf4", color: "#15803d",
                      border: "1px solid #bbf7d0",
                    }}>
                      Activo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}