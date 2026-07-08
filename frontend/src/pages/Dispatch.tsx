import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../hooks/useToast';
import { colors } from '../theme/colors';
import { page, pageHead, pageTitle, grid4, grid2 } from '../theme/styles';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import StatCard from '../components/UI/StatCard';
import Badge from '../components/UI/Badge';
import { getBadgeColor } from '../utils/statusBadge';
import { money } from '../utils/money';

interface DispatchOrder {
  id: number;
  fecha: string;
  precioTotal: number;
  clienteNombre: string;
  estado: string;
  direccionEnvio?: string;
  transportista?: string;
}

const carrierData = [
  { name: 'FedEx', icon: 'local_shipping', status: 'Activo', deliveries: 24, onTime: 96 },
  { name: 'DHL', icon: 'local_shipping', status: 'Activo', deliveries: 18, onTime: 91 },
  { name: 'UPS', icon: 'local_shipping', status: 'Retrasado', deliveries: 12, onTime: 85 },
];

export default function Dispatch() {
  const { toast, toasts } = useToast();
  const [orders, setOrders] = useState<DispatchOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDispatch = async () => {
    try {
      const { data } = await api.get('/dispatch');
      setOrders(Array.isArray(data) ? data : data.data || []);
    } catch {
      toast('Error al cargar despachos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDispatch(); }, []);

  const pendientes = orders.filter((o) => o.estado === 'Pendiente').length;
  const listos = orders.filter((o) => o.estado === 'Listo para Despacho').length;
  const enRuta = orders.filter((o) => o.estado === 'En Ruta').length;
  const entregados = orders.filter((o) => o.estado === 'Entregado').length;

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.put(`/dispatch/${id}`, { estado: newStatus });
      toast('Estado actualizado', 'success');
      fetchDispatch();
    } catch {
      toast('Error al actualizar estado', 'error');
    }
  };

  const handleBulkDispatch = () => {
    toast('Despacho masivo iniciado', 'info');
  };

  return (
    <div style={page}>
      <div style={pageHead}>
        <div>
          <h1 style={pageTitle}>Listos para Despacho</h1>
          <p style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
            Gestion de envios y seguimiento de transportistas en tiempo real
          </p>
        </div>
        <Button variant="primary" icon="local_shipping" onClick={handleBulkDispatch}>
          Despacho masivo
        </Button>
      </div>

      <div style={grid4}>
        <Card>
          <StatCard icon="pending_actions" label="Pendiente" value={pendientes} color={colors.blue} />
        </Card>
        <Card>
          <StatCard icon="inventory_2" label="Listo para Despacho" value={listos} color={colors.amber} />
        </Card>
        <Card>
          <StatCard icon="alt_route" label="En Ruta" value={enRuta} color={colors.purple} />
        </Card>
        <Card>
          <StatCard icon="check_circle" label="Entregado" value={entregados} color={colors.green} />
        </Card>
      </div>

      <Card style={{ marginTop: 18 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px', color: colors.ink }}>
          Pedidos para despacho
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid ' + colors.line }}>
                {['Pedido', 'Cliente', 'Destino', 'Fecha', 'Monto', 'Estado', 'Transportista', 'Acciones'].map((h) => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: colors.muted, fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 20, textAlign: 'center', color: colors.muted }}>Cargando...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 20, textAlign: 'center', color: colors.muted }}>No hay pedidos para despacho</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid ' + colors.line }}>
                    <td style={{ padding: '12px', fontWeight: 800 }}>#{order.id}</td>
                    <td style={{ padding: '12px' }}>{order.clienteNombre}</td>
                    <td style={{ padding: '12px', color: colors.muted, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {order.direccionEnvio || '—'}
                    </td>
                    <td style={{ padding: '12px', color: colors.muted }}>{new Date(order.fecha).toLocaleDateString()}</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{money(order.precioTotal)}</td>
                    <td style={{ padding: '12px' }}>
                      <select
                        value={order.estado}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{
                          border: '1px solid ' + colors.line,
                          borderRadius: 6,
                          padding: '5px 8px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: colors.white,
                        }}
                      >
                        {['Pendiente', 'Listo para Despacho', 'En Ruta', 'Entregado'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '12px', color: colors.muted }}>{order.transportista || '—'}</td>
                    <td style={{ padding: '12px' }}>
                      <Button variant="outline" style={{ padding: '5px 10px', fontSize: 11 }}>
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ ...grid2, marginTop: 18 }}>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px', color: colors.ink }}>
            Mapa de distribucion
          </h3>
          <div
            style={{
              background: 'linear-gradient(135deg, #eef4ff 0%, #dbeafe 100%)',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #bfdbfe',
            }}
          >
            <svg width="100%" height="140" viewBox="0 0 400 140">
              <path d="M 30 70 Q 100 20 200 70 Q 300 120 370 70" stroke="#2563eb" strokeWidth="3" fill="none" strokeDasharray="8 4" />
              <circle cx="30" cy="70" r="10" fill="#22c55e" />
              <circle cx="200" cy="70" r="10" fill="#f59e0b" />
              <circle cx="370" cy="70" r="10" fill="#ef4444" />
              <text x="30" y="105" textAnchor="middle" fontSize="12" fontWeight="700" fill={colors.ink}>Almacen (A)</text>
              <text x="200" y="105" textAnchor="middle" fontSize="12" fontWeight="700" fill={colors.ink}>Ruta (R)</text>
              <text x="370" y="105" textAnchor="middle" fontSize="12" fontWeight="700" fill={colors.ink}>Cliente (C)</text>
            </svg>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
              {[
                { label: 'Origen', color: '#22c55e' },
                { label: 'En transito', color: '#f59e0b' },
                { label: 'Destino', color: '#ef4444' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px', color: colors.ink }}>
            Estado de transportistas
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {carrierData.map((carrier) => (
              <div
                key={carrier.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: 10,
                  border: '1px solid ' + colors.line,
                }}
              >
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  backgroundColor: carrier.status === 'Activo' ? '#dcfce7' : '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span className="material-icons" style={{ fontSize: 22, color: carrier.status === 'Activo' ? colors.green : colors.amber }}>
                    {carrier.icon}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: colors.ink }}>{carrier.name}</span>
                    <Badge color={carrier.status === 'Activo' ? 'green' : 'amber'}>
                      {carrier.status}
                    </Badge>
                  </div>
                  <p style={{ fontSize: 12, color: colors.muted, margin: '4px 0 0' }}>
                    {carrier.deliveries} envios este mes — {carrier.onTime}% a tiempo
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: '12px 20px',
              borderRadius: 10,
              color: colors.white,
              backgroundColor: t.type === 'success' ? colors.green : t.type === 'error' ? colors.red : colors.blue,
              fontWeight: 700,
              fontSize: 13,
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
