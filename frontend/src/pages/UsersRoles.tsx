import { useState, useEffect, FormEvent } from 'react';
import { colors } from '../theme/colors';
import { page, pageHead, pageTitle, grid2 } from '../theme/styles';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import api from '../api/axios';
import { User } from '../types';

const ROLES = ['Administrador', 'Supervisor', 'Operario', 'Due\u00F1o'];

export default function UsersRoles() {
  const { user, canManage } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    dni: '',
    role: 'Operario',
    password: '123456',
  });

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.data || data);
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage()) fetchUsers();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/users', form);
      toast.success('Usuario creado exitosamente');
      setForm({ name: '', email: '', dni: '', role: 'Operario', password: '123456' });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear usuario');
    } finally {
      setSubmitting(false);
    }
  };

  if (!canManage()) {
    return (
      <div style={page}>
        <h1 style={pageTitle}>Usuarios y Roles</h1>
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: colors.muted,
            backgroundColor: colors.card,
            borderRadius: colors.radius,
            boxShadow: colors.shadow,
          }}
        >
          Acceso restringido. No tienes permisos para gestionar usuarios.
        </div>
      </div>
    );
  }

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
          padding: '3px 10px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          color: colors.white,
          backgroundColor: roleColors[role] || colors.blue,
        }}
      >
        {role}
      </span>
    );
  };

  return (
    <div style={page}>
      <div style={pageHead}>
        <h1 style={pageTitle}>Usuarios y Roles</h1>
      </div>

      <div style={grid2}>
        {/* Form */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 20px', color: colors.ink }}>
            Nuevo usuario
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nombre *</label>
              <input
                style={inputStyle}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Correo *</label>
              <input
                style={inputStyle}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>DNI *</label>
              <input
                style={inputStyle}
                value={form.dni}
                onChange={(e) => setForm({ ...form, dni: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Rol</label>
              <select
                style={inputStyle}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Contrase\u00F1a</label>
              <input
                style={inputStyle}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '11px 0',
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
              {submitting ? 'Creando...' : 'Crear usuario'}
            </button>
          </form>
        </div>

        {/* Admin summary */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 20px', color: colors.ink, alignSelf: 'flex-start' }}>
            Resumen de cuenta administrador
          </h2>
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
              marginBottom: 16,
            }}
          >
            {user?.photo ? (
              <img
                src={user.photo}
                alt={user.name}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              user?.name?.charAt(0) || '?'
            )}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 6px', color: colors.ink }}>
            {user?.name}
          </h3>
          {roleBadge(user?.role || '')}
          <p style={{ fontSize: 14, color: colors.muted, margin: '10px 0 0' }}>{user?.email}</p>
        </div>
      </div>

      {/* User list */}
      <div style={{ ...cardStyle, marginTop: 18 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 18px', color: colors.ink }}>
          Listado de usuarios
        </h2>
        {loading ? (
          <p style={{ color: colors.muted }}>Cargando usuarios...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${colors.line}` }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: colors.muted, fontWeight: 500 }}>Foto</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: colors.muted, fontWeight: 500 }}>Nombre</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: colors.muted, fontWeight: 500 }}>Correo</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: colors.muted, fontWeight: 500 }}>DNI</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: colors.muted, fontWeight: 500 }}>Rol</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: colors.muted, fontWeight: 500 }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${colors.line}` }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          backgroundColor: colors.blue,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colors.white,
                          fontWeight: 600,
                          fontSize: 14,
                          overflow: 'hidden',
                        }}
                      >
                        {u.photo ? (
                          <img src={u.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          u.name.charAt(0)
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: '10px 12px', color: colors.muted }}>{u.email}</td>
                    <td style={{ padding: '10px 12px', color: colors.muted }}>{(u as any).dni || '-'}</td>
                    <td style={{ padding: '10px 12px' }}>{roleBadge(u.role)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          color: colors.green,
                          backgroundColor: '#f0fdf4',
                        }}
                      >
                        Activo
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: colors.muted }}>
                      No hay usuarios registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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
