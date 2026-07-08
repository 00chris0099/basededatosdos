import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../hooks/useToast';
import { colors } from '../theme/colors';
import { page, pageHead, pageTitle, grid3, grid2 } from '../theme/styles';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import { getBadgeColor } from '../utils/statusBadge';

interface SummaryData {
  totalProducts: number;
  totalOrders: number;
  stockAlerts: number;
  totalMovements: number;
  skuMasVendido?: string;
  ocupacionAlmacen?: number;
}

interface Incident {
  id: number;
  pedidoId: number;
  mensaje: string;
  usuario: string;
  fecha: string;
}

const BAR_DATA = [35, 48, 39, 55, 82, 75, 31, 70];
const BAR_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom', 'Hoy'];
const MAX_BAR = Math.max(...BAR_DATA);

export default function Reports() {
  const { toast, toasts } = useToast();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const [summaryRes, incidentsRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/incidents'),
      ]);
      const sData = summaryRes.data?.data || summaryRes.data;
      setSummary(sData);
      const iData = incidentsRes.data?.data || incidentsRes.data;
      setIncidents(Array.isArray(iData) ? iData : []);
    } catch {
      toast('Error al cargar reportes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const topSku = summary?.skuMasVendido || 'SKU-4821';
  const avgTime = '18.5 min';
  const occupancy = summary?.ocupacionAlmacen ?? 73;

  return (
    <div style={page}>
      <div style={pageHead}>
        <div>
          <h1 style={pageTitle}>Reportes Avanzados</h1>
          <p style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
            Metricas demo para rendimiento operativo y logistico.
          </p>
        </div>
      </div>

      <div style={grid3}>
        <Card>
          <div style={{ minHeight: 112, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: '#e9efff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons" style={{ fontSize: 22, color: colors.blue }}>inventory</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: colors.muted, letterSpacing: '0.05em' }}>SKU mas vendido</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: colors.ink }}>{topSku}</span>
            <span style={{ fontSize: 12, color: colors.muted }}>Producto con mayor rotacion este mes</span>
          </div>
        </Card>
        <Card>
          <div style={{ minHeight: 112, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons" style={{ fontSize: 22, color: colors.amber }}>schedule</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: colors.muted, letterSpacing: '0.05em' }}>Tiempo promedio</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: colors.ink }}>{avgTime}</span>
            <span style={{ fontSize: 12, color: colors.muted }}>De recepcion a despacho</span>
          </div>
        </Card>
        <Card>
          <div style={{ minHeight: 112, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons" style={{ fontSize: 22, color: colors.green }}>warehouse</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: colors.muted, letterSpacing: '0.05em' }}>Ocupacion almacen</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: colors.ink }}>{occupancy}%</span>
            <div style={{ height: 8, backgroundColor: colors.line, borderRadius: 999, overflow: 'hidden', marginTop: 4 }}>
              <div style={{ height: '100%', width: `${occupancy}%`, backgroundColor: occupancy > 85 ? colors.red : colors.green, borderRadius: 999, transition: 'width 0.3s' }} />
            </div>
          </div>
        </Card>
      </div>

      <div style={{ ...grid2, marginTop: 18 }}>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 18px', color: colors.ink }}>
            Tendencias de salidas vs entradas
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 200, padding: '0 8px' }}>
            {BAR_DATA.map((value, i) => {
              const height = (value / MAX_BAR) * 160;
              const isMax = value === MAX_BAR;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: colors.muted }}>{value}</span>
                  <div
                    style={{
                      width: '100%',
                      height,
                      backgroundColor: isMax ? colors.blue : '#dbeafe',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.4s ease',
                      border: isMax ? `2px solid ${colors.blue2}` : '2px solid transparent',
                    }}
                  />
                  <span style={{ fontSize: 10, fontWeight: 600, color: colors.muted }}>{BAR_LABELS[i]}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: colors.blue }} />
              Salidas
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#dbeafe' }} />
              Entradas
            </div>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px', color: colors.ink }}>
            Incidencias
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {loading ? (
              <p style={{ padding: 20, textAlign: 'center', color: colors.muted, fontSize: 13 }}>Cargando...</p>
            ) : incidents.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center' }}>
                <span className="material-icons" style={{ fontSize: 36, color: colors.green, display: 'block', marginBottom: 8 }}>check_circle</span>
                <p style={{ color: colors.muted, fontSize: 13, margin: 0 }}>Sin incidencias registradas</p>
              </div>
            ) : (
              incidents.map((inc) => (
                <div
                  key={inc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: '1px solid ' + colors.line,
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <span className="material-icons" style={{ fontSize: 18, color: colors.amber }}>warning</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: colors.ink }}>Pedido #{inc.pedidoId}</span>
                      <Badge color={getBadgeColor('Alta')}>Alta</Badge>
                    </div>
                    <p style={{ fontSize: 12, color: colors.muted, margin: '0 0 4px' }}>{inc.mensaje}</p>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: colors.muted }}>
                      <span style={{ fontWeight: 700 }}>{inc.usuario}</span>
                      <span>{new Date(inc.fecha).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
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
