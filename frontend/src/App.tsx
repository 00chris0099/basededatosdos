import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Shell from './components/Layout/Shell';
import Login from './components/Login';
import UsersRoles from './pages/UsersRoles';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ fontSize: 14, color: '#64748b' }}>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function Dashboard() {
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 27, letterSpacing: '-0.03em', margin: 0 }}>Dashboard</h1>
      <p style={{ color: '#64748b', marginTop: 8 }}>Bienvenido al panel de control WMSPro</p>
    </div>
  );
}

function ProductsList() {
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 27, letterSpacing: '-0.03em', margin: 0 }}>Productos</h1>
      <p style={{ color: '#64748b', marginTop: 8 }}>Gesti\u00F3n de productos del almac\u00E9n</p>
    </div>
  );
}

function ProductRegister() {
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 27, letterSpacing: '-0.03em', margin: 0 }}>Registrar Producto</h1>
      <p style={{ color: '#64748b', marginTop: 8 }}>Formulario de registro de productos</p>
    </div>
  );
}

function ProductDetail() {
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 27, letterSpacing: '-0.03em', margin: 0 }}>Detalle de Producto</h1>
      <p style={{ color: '#64748b', marginTop: 8 }}>Informaci\u00F3n detallada del producto</p>
    </div>
  );
}

function Locations() {
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 27, letterSpacing: '-0.03em', margin: 0 }}>Ubicaciones</h1>
      <p style={{ color: '#64748b', marginTop: 8 }}>Mapa de ubicaciones del almac\u00E9n</p>
    </div>
  );
}

function Orders() {
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 27, letterSpacing: '-0.03em', margin: 0 }}>Pedidos</h1>
      <p style={{ color: '#64748b', marginTop: 8 }}>Gesti\u00F3n de pedidos</p>
    </div>
  );
}

function Picking() {
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 27, letterSpacing: '-0.03em', margin: 0 }}>Picking</h1>
      <p style={{ color: '#64748b', marginTop: 8 }}>Operaciones de picking</p>
    </div>
  );
}

function Packing() {
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 27, letterSpacing: '-0.03em', margin: 0 }}>Packing</h1>
      <p style={{ color: '#64748b', marginTop: 8 }}>Operaciones de empaque</p>
    </div>
  );
}

function Dispatch() {
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 27, letterSpacing: '-0.03em', margin: 0 }}>Despacho</h1>
      <p style={{ color: '#64748b', marginTop: 8 }}>Gesti\u00F3n de despachos</p>
    </div>
  );
}

function Reports() {
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 27, letterSpacing: '-0.03em', margin: 0 }}>Reportes</h1>
      <p style={{ color: '#64748b', marginTop: 8 }}>Reportes y estad\u00EDsticas</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Shell>
                <Dashboard />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Shell>
                <ProductsList />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/register"
          element={
            <ProtectedRoute>
              <Shell>
                <ProductRegister />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:sku"
          element={
            <ProtectedRoute>
              <Shell>
                <ProductDetail />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/locations"
          element={
            <ProtectedRoute>
              <Shell>
                <Locations />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Shell>
                <Orders />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/picking"
          element={
            <ProtectedRoute>
              <Shell>
                <Picking />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/packing"
          element={
            <ProtectedRoute>
              <Shell>
                <Packing />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dispatch"
          element={
            <ProtectedRoute>
              <Shell>
                <Dispatch />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Shell>
                <Reports />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Shell>
                <UsersRoles />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Shell>
                <Settings />
              </Shell>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
