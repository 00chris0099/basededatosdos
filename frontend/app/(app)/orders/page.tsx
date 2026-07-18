"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { apiClient, getOrders, getOrderById, advanceOrder, updateOrderStatus, createOrder, getClients, getAllProducts, Order, OrderDetail, Client } from "@/lib/api/client";
import { money, statusBadgeColor, orderFlow } from "@/lib/utils/format";

const kpiConfigs = [
  { key: "Pendiente",  color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", icon: "hourglass_empty" },
  { key: "En Proceso",   color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", icon: "qr_code_scanner"  },
  { key: "Completado",   color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "inventory"         },
  { key: "Cancelado",   color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", icon: "local_shipping"   },
];

export default function OrdersPage() {
  const { token, canManage, canSupervise } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOrder, setModalOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");

  // Create order modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [orderItems, setOrderItems] = useState<{ Id_Producto: number; Cantidad: number; Precio_Unitario: number; Nombre: string }[]>([]);
  const [creating, setCreating] = useState(false);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const data = await getOrders(token);
      setOrders(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [token]);

  const handleAdvance = async (id: number) => {
    if (!token) return;
    setError("");
    try {
      await advanceOrder(id, token);
      await fetchOrders();
      if (modalOrder?.Id_Pedido === id) {
        const updated = await getOrderById(id, token);
        setModalOrder(updated);
      }
    } catch (e: any) {
      setError(e.message || "Error al avanzar pedido");
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    if (!token) return;
    setError("");
    try {
      await updateOrderStatus(id, status, token);
      await fetchOrders();
    } catch (e: any) {
      setError(e.message || "Error al cambiar estado");
    }
  };

  const openModal = async (id: number) => {
    if (!token) return;
    try {
      const detail = await getOrderById(id, token);
      setModalOrder(detail);
    } catch {}
  };

  const openCreateModal = async () => {
    if (!token) return;
    try {
      const [c, p] = await Promise.all([getClients(token), getAllProducts(token)]);
      setClients(c);
      setProducts(p);
      setSelectedClient("");
      setOrderItems([]);
      setShowCreateModal(true);
    } catch {}
  };

  const addProductToOrder = (prod: any) => {
    const existing = orderItems.find(i => i.Id_Producto === prod.Id_Producto);
    if (existing) {
      setOrderItems(orderItems.map(i =>
        i.Id_Producto === prod.Id_Producto ? { ...i, Cantidad: i.Cantidad + 1 } : i
      ));
    } else {
      setOrderItems([...orderItems, {
        Id_Producto: prod.Id_Producto,
        Cantidad: 1,
        Precio_Unitario: prod.Precio,
        Nombre: prod.Nombre_Producto,
      }]);
    }
  };

  const removeItemFromOrder = (idProducto: number) => {
    setOrderItems(orderItems.filter(i => i.Id_Producto !== idProducto));
  };

  const handleCreateOrder = async () => {
    if (!token || !selectedClient || orderItems.length === 0) return;
    setCreating(true);
    setError("");
    try {
      await createOrder(Number(selectedClient), orderItems.map(i => ({
        Id_Producto: i.Id_Producto,
        Cantidad: i.Cantidad,
        Precio_Unitario: i.Precio_Unitario,
      })), token);
      setShowCreateModal(false);
      await fetchOrders();
    } catch (e: any) {
      setError(e.message || "Error al crear pedido");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Cargando pedidos...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* PAGE HEADER */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0, lineHeight: 1.2 }}>
            Gestión de Pedidos
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 6, fontWeight: 400 }}>
            Control de flujo operativo: desde la recepción hasta la última milla.
          </p>
        </div>
        {canSupervise() && (
          <button onClick={openCreateModal} className="premium-button" style={{ flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>add_box</span>
            Nuevo Pedido
          </button>
        )}
      </div>

      {error && (
        <div style={{
          padding: "12px 16px", borderRadius: 10, background: "#fef2f2",
          border: "1px solid #fecaca", color: "#dc2626", fontSize: 13, fontWeight: 600,
        }}>
          {error}
          <button onClick={() => setError("")} style={{ marginLeft: 10, background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* KPI CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        {kpiConfigs.map(({ key, color, bg, border, icon }) => {
          const count = orders.filter(o => o.Estado_Pedido === key).length;
          return (
            <div key={key} className="premium-card" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.07em", color, background: bg, border: `1px solid ${border}`,
                  padding: "3px 8px", borderRadius: 6,
                }}>
                  {key}
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color }}>{icon}</span>
              </div>
              <div style={{ fontSize: 38, fontWeight: 900, color: "#0f172a", lineHeight: 1, fontFamily: "var(--font-display, system-ui)" }}>
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {/* ORDERS TABLE */}
      <div className="premium-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0", fontFamily: "var(--font-display, system-ui)" }}>
          Pedidos del Almacén
        </h3>
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <table className="data-table">
            <thead>
              <tr>
                {["Pedido", "Cliente", "Fecha", "Monto", "Estado", "Items", "Acciones"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.Id_Pedido}>
                  <td style={{ fontWeight: 700, color: "#0f172a" }}>#{o.Id_Pedido}</td>
                  <td style={{ fontWeight: 500 }}>{o.Cliente}</td>
                  <td style={{ color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap" }}>
                    {new Date(o.Fecha_Pedido).toLocaleDateString("es-PE")}
                  </td>
                  <td style={{ fontWeight: 700 }}>{money(o.Precio_Total)}</td>
                  <td>
                    <select
                      value={o.Estado_Pedido}
                      onChange={e => handleStatusChange(o.Id_Pedido, e.target.value)}
                      style={{
                        border: "1px solid #e2e8f0", borderRadius: 8,
                        padding: "5px 32px 5px 10px", background: "#fff",
                        fontSize: 12, fontWeight: 600, color: "#334155",
                        cursor: "pointer", outline: "none", minWidth: 130,
                        fontFamily: "inherit",
                      }}
                    >
                      {orderFlow().map(st => <option key={st}>{st}</option>)}
                    </select>
                  </td>
                  <td style={{ color: "#64748b", fontWeight: 500 }}>{o.Total_Lineas || 0} líneas</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => openModal(o.Id_Pedido)}
                        style={{
                          padding: "5px 12px", borderRadius: 7,
                          border: "1px solid #e2e8f0", background: "#fff",
                          fontSize: 12, fontWeight: 600, color: "#334155",
                          cursor: "pointer", whiteSpace: "nowrap",
                        }}
                      >Ver</button>
                      <button
                        onClick={() => handleAdvance(o.Id_Pedido)}
                        style={{
                          padding: "5px 12px", borderRadius: 7,
                          border: "none", background: "#2563eb",
                          fontSize: 12, fontWeight: 600, color: "#fff",
                          cursor: "pointer", whiteSpace: "nowrap",
                        }}
                      >Avanzar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#94a3b8" }}>No hay pedidos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {modalOrder && (
        <div
          onClick={() => setModalOrder(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            width: "100%", maxWidth: 500, background: "#fff", borderRadius: 18,
            padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", border: "1px solid #e2e8f0",
            display: "flex", flexDirection: "column", gap: 20,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display, system-ui)", margin: 0 }}>
                  Pedido #{modalOrder.Id_Pedido}
                </h3>
                <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{modalOrder.Cliente}</span>
              </div>
              <span className={statusBadgeColor(modalOrder.Estado_Pedido)} style={{
                display: "inline-flex", padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
              }}>
                {modalOrder.Estado_Pedido}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#f8fafc", borderRadius: 10, padding: 14, border: "1px solid #e2e8f0" }}>
              <div>
                <span style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 3 }}>Fecha:</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>
                  {new Date(modalOrder.Fecha_Pedido).toLocaleDateString("es-PE")}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 3 }}>Total:</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#2563eb" }}>{money(modalOrder.Precio_Total)}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 10 }}>
                Artículos del Pedido
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                {modalOrder.items?.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "#f8fafc", border: "1px solid #e2e8f0",
                    borderRadius: 8, padding: "8px 12px",
                  }}>
                    <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.Nombre_Producto}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.Codigo_Producto} · {money(item.Precio_Unitario)} c/u</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#334155", flexShrink: 0 }}>
                      x{item.Cantidad}
                    </span>
                  </div>
                ))}
                {(!modalOrder.items || modalOrder.items.length === 0) && (
                  <div style={{ textAlign: "center", padding: 12, color: "#94a3b8", fontSize: 13 }}>Sin items</div>
                )}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16, display: "flex", gap: 10 }}>
              <button
                onClick={() => setModalOrder(null)}
                style={{
                  flex: 1, padding: "11px", borderRadius: 10,
                  border: "1px solid #e2e8f0", background: "#fff",
                  fontSize: 13, fontWeight: 600, color: "#334155",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Cerrar
              </button>
              {canSupervise() && (
                <button
                  onClick={() => { handleAdvance(modalOrder.Id_Pedido); setModalOrder(null); }}
                  className="premium-button"
                  style={{ flex: 1 }}
                >
                  Avanzar Pedido
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE ORDER MODAL */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            width: "100%", maxWidth: 550, background: "#fff", borderRadius: 18,
            padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            display: "flex", flexDirection: "column", gap: 18, maxHeight: "85vh", overflowY: "auto",
          }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Nuevo Pedido</h3>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Cliente *</label>
              <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} style={{
                width: "100%", border: "1px solid #e2e8f0", borderRadius: 10,
                padding: "10px 14px", fontSize: 13.5, color: "#0f172a", outline: "none",
              }}>
                <option value="">Seleccionar cliente...</option>
                {clients.map(c => <option key={c.Id_Cliente} value={c.Id_Cliente}>{c.Nombre} ({c.Num_Documento})</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Agregar productos</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 100, overflowY: "auto", padding: "8px 0" }}>
                {products.map(p => (
                  <button key={p.Id_Producto} onClick={() => addProductToOrder(p)} style={{
                    padding: "5px 10px", borderRadius: 6, border: "1px solid #e2e8f0",
                    background: "#fff", fontSize: 11, fontWeight: 600, color: "#334155",
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    {p.Nombre_Producto} · {money(p.Precio)}
                  </button>
                ))}
              </div>
            </div>

            {orderItems.length > 0 && (
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>
                  Items ({orderItems.length})
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {orderItems.map(item => (
                    <div key={item.Id_Producto} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "#f8fafc", border: "1px solid #e2e8f0",
                      borderRadius: 8, padding: "8px 12px",
                    }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{item.Nombre}</span>
                        <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>{money(item.Precio_Unitario)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="number" min="1" value={item.Cantidad}
                          onChange={e => setOrderItems(orderItems.map(i =>
                            i.Id_Producto === item.Id_Producto ? { ...i, Cantidad: Number(e.target.value) || 1 } : i
                          ))}
                          style={{ width: 50, border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 8px", fontSize: 12, textAlign: "center", outline: "none" }}
                        />
                        <button onClick={() => removeItemFromOrder(item.Id_Producto)} style={{
                          background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 16, fontWeight: 700,
                        }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
              <button onClick={() => setShowCreateModal(false)} style={{
                padding: "9px 18px", borderRadius: 9, border: "1px solid #e2e8f0",
                background: "#fff", fontSize: 13, fontWeight: 600, color: "#334155",
                cursor: "pointer", fontFamily: "inherit",
              }}>Cancelar</button>
              <button
                onClick={handleCreateOrder}
                disabled={!selectedClient || orderItems.length === 0 || creating}
                className="premium-button"
                style={{ opacity: (!selectedClient || orderItems.length === 0 || creating) ? 0.5 : 1 }}
              >
                {creating ? "Creando..." : "Crear Pedido"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
