import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '\u{1F4CA}' },
  { to: '/products', label: 'Productos', icon: '\u{1F4E6}' },
  { to: '/locations', label: 'Ubicaciones', icon: '\u{1F4CD}' },
  { to: '/orders', label: 'Pedidos', icon: '\u{1F4CB}' },
  { to: '/picking', label: 'Picking', icon: '\u{1F9F9}' },
  { to: '/packing', label: 'Packing', icon: '\u{1F4E8}' },
  { to: '/dispatch', label: 'Despacho', icon: '\u{1F69A}' },
  { to: '/reports', label: 'Reportes', icon: '\u{1F4C8}' },
];

const adminItems = [
  { to: '/users', label: 'Usuarios y Roles', icon: '\u{1F465}' },
  { to: '/settings', label: 'Configuracion', icon: '\u{2699}' },
];

export default function Shell({ children }: { children: ReactNode }) {
  const { user, logout, canManage } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 16px',
    borderRadius: 10,
    textDecoration: 'none',
    color: isActive ? colors.white : '#94a3b8',
    backgroundColor: isActive ? colors.blue : 'transparent',
    fontSize: 14,
    fontWeight: isActive ? 600 : 400,
    transition: 'all .15s',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.bg }}>
      <aside
        style={{
          width: 250,
          backgroundColor: colors.nav,
          color: colors.white,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 14px',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700, padding: '0 12px 24px', letterSpacing: '-0.03em' }}>
          WMSPro
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} style={({ isActive }) => linkStyle(isActive)}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {canManage() && (
            <>
              <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', margin: '10px 12px' }} />
              {adminItems.map((item) => (
                <NavLink key={item.to} to={item.to} style={({ isActive }) => linkStyle(isActive)}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,.08)',
            paddingTop: 16,
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 12px 0',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: colors.blue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0) || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18, padding: 4 }}
            title="Cerrar sesion"
          >
            \u{2190}
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  );
}
