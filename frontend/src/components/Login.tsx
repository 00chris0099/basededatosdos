import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Credenciales incorrectas');
    } finally {
      setLoading(false);
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <form
        onSubmit={handleSubmit}
        style={{ width: 380, padding: 36, backgroundColor: colors.card, borderRadius: colors.radius, boxShadow: colors.shadowLg }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: colors.ink }}>Iniciar Sesion</h1>
        <p style={{ fontSize: 14, color: colors.muted, margin: '0 0 24px' }}>Ingresa tus credenciales para acceder</p>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', color: colors.red, borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: colors.ink, marginBottom: 6 }}>Correo</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ ...inputStyle, marginBottom: 16 }} />

        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: colors.ink, marginBottom: 6 }}>Contrasena</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ ...inputStyle, marginBottom: 24 }} />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '11px 0',
            backgroundColor: colors.blue,
            color: colors.white,
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
