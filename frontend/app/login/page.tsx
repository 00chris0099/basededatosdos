"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth/auth-context";

const inputWrap: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  background: "#f8fafc", border: "1px solid #e2e8f0",
  borderRadius: 10, padding: "11px 14px",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const inputBase: React.CSSProperties = {
  border: "none", outline: "none", background: "transparent",
  fontSize: 13.5, color: "#0f172a", width: "100%", fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: "#94a3b8", textTransform: "uppercase",
  letterSpacing: "0.07em", marginBottom: 7,
};

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Usuario o contraseña incorrectos.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
      background: "linear-gradient(135deg, #f0f4ff 0%, #f8fafc 50%, #eff6ff 100%)",
    }}>
      <div style={{
        width: "100%", maxWidth: 900,
        display: "grid", gridTemplateColumns: "1fr 1fr",
        background: "#fff", borderRadius: 20,
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        boxShadow: "0 20px 60px rgba(15,23,42,0.08), 0 4px 16px rgba(15,23,42,0.04)",
      }}>

        {/* ── LEFT HERO ── */}
        <div style={{
          position: "relative",
          backgroundImage: "linear-gradient(135deg, rgba(37,99,235,0.88) 0%, rgba(15,23,42,0.95) 100%), url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: 40,
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          minHeight: 520,
          color: "#fff",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: "rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#fff" }}>inventory_2</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display, system-ui)" }}>WMS Pro</span>
          </div>

          {/* Feature badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "inventory_2",    text: "Gestión inteligente de inventario" },
              { icon: "qr_code_scanner",text: "Picking y packing optimizados" },
              { icon: "local_shipping", text: "Despacho de última milla" },
            ].map(f => (
              <div key={f.icon} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#93c5fd" }}>{f.icon}</span>
                </div>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Bottom tagline */}
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display, system-ui)", lineHeight: 1.3, marginBottom: 8 }}>
              Logística inteligente para ecommerce moderno
            </div>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
              Control total de tu almacén desde un solo panel.
            </p>
          </div>
        </div>

        {/* ── RIGHT FORM ── */}
        <div style={{
          padding: "48px 40px",
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "#eff6ff", border: "1px solid #bfdbfe",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#2563eb" }}>lock</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: "0 0 6px 0" }}>
              Bienvenido
            </h1>
            <p style={{ fontSize: 13.5, color: "#64748b" }}>
              Ingrese sus credenciales de acceso al sistema.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Usuario / Correo</label>
              <div style={inputWrap}>
                <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#94a3b8", flexShrink: 0 }}>mail</span>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="nombre@empresa.com" required
                  style={inputBase}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Contraseña</label>
              <div style={inputWrap}>
                <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#94a3b8", flexShrink: 0 }}>lock</span>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={inputBase}
                />
              </div>
            </div>

            {error && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 8, padding: "10px 14px",
                fontSize: 13, fontWeight: 600, color: "#dc2626",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, flexShrink: 0 }}>error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "13px 20px", borderRadius: 10,
                background: submitting ? "#93c5fd" : "#2563eb",
                color: "#fff", border: "none",
                fontSize: 14, fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "background 0.15s, transform 0.15s",
                marginTop: 4,
              }}
            >
              {submitting ? "Iniciando sesión..." : (
                <>
                  Iniciar sesión
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div style={{
            marginTop: 24, padding: "12px 14px",
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: 10, fontSize: 12, color: "#64748b",
          }}>
            <strong style={{ color: "#334155" }}>Demo:</strong> admin@wms.com / admin123
          </div>

          <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 24 }}>
            © 2026 WMS Pro. Ecommerce Logistics Systems.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
