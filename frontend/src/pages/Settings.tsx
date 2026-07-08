import { useState, useEffect, FormEvent } from 'react';
import { colors } from '../theme/colors';
import { page, pageHead, pageTitle } from '../theme/styles';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import api from '../api/axios';
import { User } from '../types';

export default function Settings() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    dni: '',
    photo: '',
  });

  const fetchUser = async () => {
    if (!user) return;
    try {
      const { data } = await api.get(`/users/${user.id}`);
      const u = data.data || data;
      setForm({
        name: u.name || '',
        email: u.email || '',
        dni: (u as any).dni || '',
        photo: u.photo || '',
      });
      if (u.photo) setPhotoPreview(u.photo);
    } catch {
      toast.error('Error al cargar datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [user?.id]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setForm({ ...form, photo: result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await api.put(`/users/${user.id}`, form);
      toast.success('Perfil actualizado exitosamente');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: `1px solid ${colors.line}`,
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: colors.ink,
    marginBottom: 6,
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.card,
    borderRadius: colors.radius,
    padding: 24,
    boxShadow: colors.shadow,
  };

  const roleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      Administrador: colors.blue,
      Due\u00F1o: colors.purple,
      Supervisor: colors.amber,
      Operario: colors.green,
    };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '4px 14px',
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 600,
          color: colors.white,
          backgroundColor: roleColors[role] || colors.blue,
        }}
      >
        {role}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={page}>
        <div style={pageHead}>
          <h1 style={pageTitle}>Configuraci\u00F3n y Perfil</h1>
        </div>
        <p style={{ color: colors.muted }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={pageHead}>
        <div>
          <h1 style={pageTitle}>Configuraci\u00F3n y Perfil</h1>
          <p style={{ fontSize: 14, color: colors.muted, margin: '4px 0 0' }}>
            Administra tu informaci\u00F3n personal y preferencias
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18, alignItems: 'start' }}>
        {/* Profile card */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px' }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              border: `5px solid ${colors.soft}`,
              backgroundColor: colors.blue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              fontWeight: 700,
              color: colors.white,
              overflow: 'hidden',
              marginBottom: 18,
            }}
          >
            {photoPreview || form.photo ? (
              <img
                src={photoPreview || form.photo}
                alt={form.name}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              form.name?.charAt(0) || '?'
            )}
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: colors.ink }}>
            {form.name || user?.name}
          </h2>

          {roleBadge(user?.role || '')}

          <p style={{ fontSize: 14, color: colors.muted, margin: '12px 0 0' }}>
            {form.email || user?.email}
          </p>

          {form.dni && (
            <p style={{ fontSize: 13, color: colors.muted, margin: '6px 0 0' }}>
              DNI: {form.dni}
            </p>
          )}
        </div>

        {/* Edit form */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 22px', color: colors.ink }}>
            Editar perfil
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nombre</label>
              <input
                style={inputStyle}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Correo</label>
              <input
                style={inputStyle}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>DNI</label>
              <input
                style={inputStyle}
                value={form.dni}
                onChange={(e) => setForm({ ...form, dni: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Foto</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ fontSize: 14 }}
              />
              {photoPreview && (
                <div style={{ marginTop: 10 }}>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `2px solid ${colors.line}`,
                    }}
                  />
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '11px 28px',
                backgroundColor: colors.blue,
                color: colors.white,
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      </div>

      {/* Toast container */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toast.toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: '12px 20px',
              borderRadius: 10,
              backgroundColor: t.type === 'success' ? '#f0fdf4' : t.type === 'error' ? '#fef2f2' : '#eff6ff',
              color: t.type === 'success' ? colors.green : t.type === 'error' ? colors.red : colors.blue,
              fontWeight: 500,
              fontSize: 14,
              boxShadow: colors.shadowLg,
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
