import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../hooks/useToast';
import { colors } from '../theme/colors';
import { page, pageHead, pageTitle, grid2 } from '../theme/styles';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Select from '../components/UI/Select';
import Input from '../components/UI/Input';

interface LocationData {
  codigo: string;
  tipo?: string;
  capacidad?: number;
  ocupacion?: number;
  productos?: string[];
  pasillo?: number;
  estante?: number;
  nivel?: number;
}

const SECTIONS = ['A', 'B', 'C', 'D', 'E'];
const AISLES = [1, 2, 3, 4, 5, 6, 7];

function getBinColor(occupancy: number) {
  if (occupancy >= 95) return { bg: '#fee2e2', color: '#b91c1c' };
  if (occupancy >= 75) return { bg: '#2563eb', color: '#ffffff' };
  return { bg: '#dbeafe', color: '#1d4ed8' };
}

export default function Locations() {
  const { toast, toasts } = useToast();
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [newType, setNewType] = useState('section');
  const [newValue, setNewValue] = useState('');

  const fetchLocations = async () => {
    try {
      const { data } = await api.get('/locations');
      setLocations(Array.isArray(data) ? data : data.data || []);
    } catch {
      toast('Error al cargar ubicaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  const getOccupancy = (section: string, aisle: number): number => {
    const match = locations.find(
      (l) => l.codigo && l.codigo.startsWith(`${section}-${aisle}`)
    );
    if (match && match.ocupacion !== undefined) return match.ocupacion;
    const hash = (section.charCodeAt(0) * 7 + aisle * 13) % 100;
    return hash;
  };

  const handleBinClick = (section: string, aisle: number) => {
    const code = `${section}-${aisle}`;
    const loc = locations.find((l) => l.codigo === code) || {
      codigo: code,
      tipo: 'Pasillo',
      capacidad: 120,
      ocupacion: getOccupancy(section, aisle),
      productos: ['Cajas estandar', 'Pallets'],
    };
    setSelectedLocation(loc);
  };

  const handleNewSection = async () => {
    if (!newValue.trim()) {
      toast('Ingresa un valor', 'error');
      return;
    }
    toast(`${newType === 'section' ? 'Seccion' : 'Pasillo'} "${newValue}" creado`, 'success');
    setNewValue('');
  };

  return (
    <div style={page}>
      <div style={pageHead}>
        <div>
          <h1 style={pageTitle}>Hub Central de Distribucion</h1>
          <p style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
            Layout del almacen por secciones y pasillos — vista de planta interactiva
          </p>
        </div>
        <Button variant="outline" icon="file_download">
          Exportar mapa
        </Button>
      </div>

      <div style={{ ...grid2, gridTemplateColumns: '1fr 320px' }}>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px', color: colors.ink }}>
            Vista de planta por secciones y pasillos
          </h3>
          <div
            style={{
              backgroundColor: '#eef2ff',
              borderRadius: 14,
              padding: 26,
              minHeight: 440,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: colors.muted }}>Cargando mapa...</div>
            ) : (
              SECTIONS.map((section) => (
                <div key={section}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: colors.ink, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Seccion {section}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                    {AISLES.map((aisle) => {
                      const occ = getOccupancy(section, aisle);
                      const { bg, color: txtColor } = getBinColor(occ);
                      const isSelected = selectedLocation?.codigo === `${section}-${aisle}`;
                      return (
                        <button
                          key={aisle}
                          onClick={() => handleBinClick(section, aisle)}
                          style={{
                            backgroundColor: bg,
                            color: txtColor,
                            border: isSelected ? '2px solid ' + colors.ink : '2px solid transparent',
                            borderRadius: 8,
                            padding: '10px 4px',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: 11,
                            textAlign: 'center',
                            transition: 'transform 0.15s',
                            boxShadow: isSelected ? colors.shadowLg : 'none',
                          }}
                          onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = 'scale(1.08)'; }}
                          onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
                        >
                          <div>{section}-{aisle}</div>
                          <div style={{ fontSize: 10, marginTop: 2, opacity: 0.85 }}>
                            {occ >= 95 ? `${occ}%` : occ >= 75 ? `${occ}%` : 'Libre'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: colors.ink }}>
              Selecciona una ubicacion
            </h3>
            {selectedLocation ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span className="material-icons" style={{ fontSize: 28, color: colors.blue }}>place</span>
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{selectedLocation.codigo}</p>
                    <p style={{ fontSize: 12, color: colors.muted, margin: 0 }}>{selectedLocation.tipo || 'Pasillo'}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  <div style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: 8 }}>
                    <span style={{ fontSize: 10, color: colors.muted, textTransform: 'uppercase', fontWeight: 700 }}>Capacidad</span>
                    <p style={{ fontSize: 16, fontWeight: 800, margin: '4px 0 0' }}>{selectedLocation.capacidad || 120}</p>
                  </div>
                  <div style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: 8 }}>
                    <span style={{ fontSize: 10, color: colors.muted, textTransform: 'uppercase', fontWeight: 700 }}>Ocupacion</span>
                    <p style={{ fontSize: 16, fontWeight: 800, margin: '4px 0 0' }}>{selectedLocation.ocupacion ?? getOccupancy(selectedLocation.codigo[0], parseInt(selectedLocation.codigo.split('-')[1]))}%</p>
                  </div>
                </div>
                {selectedLocation.productos && selectedLocation.productos.length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: colors.muted, textTransform: 'uppercase', marginBottom: 6 }}>Productos</p>
                    {selectedLocation.productos.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid ' + colors.line, fontSize: 13 }}>
                        <span className="material-icons" style={{ fontSize: 16, color: colors.green }}>inventory_2</span>
                        {p}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: colors.muted, fontSize: 13 }}>Haz clic en un bin del mapa para ver los detalles de la ubicacion.</p>
            )}
          </Card>

          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: colors.ink }}>
              Abrir nueva seccion o pasillo
            </h3>
            <Select
              label="Tipo"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              options={[
                { value: 'section', label: 'Seccion' },
                { value: 'aisle', label: 'Pasillo' },
              ]}
            />
            <Input
              label="Valor"
              placeholder={newType === 'section' ? 'Ej: F' : 'Ej: A-8'}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              style={{ marginTop: 10 }}
            />
            <Button variant="primary" icon="add" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }} onClick={handleNewSection}>
              Crear {newType === 'section' ? 'seccion' : 'pasillo'}
            </Button>
          </Card>

          <Card style={{ background: 'linear-gradient(135deg, #eef4ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px', color: colors.ink }}>
              Mapa del pedido
            </h3>
            <div style={{ position: 'relative', height: 120, display: 'flex', alignItems: 'center' }}>
              <svg width="100%" height="80" viewBox="0 0 280 80">
                <path d="M 20 40 Q 80 10 140 40 Q 200 70 260 40" stroke="#2563eb" strokeWidth="3" fill="none" strokeDasharray="6 3" />
                <circle cx="20" cy="40" r="8" fill="#22c55e" />
                <circle cx="140" cy="40" r="8" fill="#f59e0b" />
                <circle cx="260" cy="40" r="8" fill="#ef4444" />
                <text x="20" y="65" textAnchor="middle" fontSize="10" fontWeight="700" fill={colors.ink}>A</text>
                <text x="140" y="65" textAnchor="middle" fontSize="10" fontWeight="700" fill={colors.ink}>R</text>
                <text x="260" y="65" textAnchor="middle" fontSize="10" fontWeight="700" fill={colors.ink}>C</text>
              </svg>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {[
                { label: 'Almacen', color: '#22c55e' },
                { label: 'Ruta', color: '#f59e0b' },
                { label: 'Cliente', color: '#ef4444' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>
          </Card>
        </div>
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
