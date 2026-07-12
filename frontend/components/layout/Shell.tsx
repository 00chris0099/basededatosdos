"use client";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

type NavItem = { href: string; label: string; icon: string; adminOnly?: boolean; supervisorOnly?: boolean };
type NavParentItem = { href: string; label: string; icon: string; submenu: NavItem[]; adminOnly?: boolean };
type NavSectionItem = NavItem | NavParentItem;

const navSections: { label: string; items: NavSectionItem[] }[] = [
  {
    label: "Almacén",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
      {
        href: "/products", label: "Productos", icon: "inventory_2",
        submenu: [
          { href: "/products", label: "Listado", icon: "list_alt" },
          { href: "/products/register", label: "Registrar", icon: "add_box", supervisorOnly: true },
        ],
      },
      { href: "/locations", label: "Ubicaciones", icon: "pin_drop" },
      { href: "/orders", label: "Pedidos", icon: "shopping_cart" },
      { href: "/picking", label: "Picking", icon: "qr_code_scanner" },
      { href: "/packing", label: "Packing", icon: "inventory" },
      { href: "/dispatch", label: "Despacho", icon: "local_shipping" },
    ],
  },
  {
    label: "Administración",
    items: [
      { href: "/reports", label: "Reportes", icon: "bar_chart" },
      { href: "/users", label: "Usuarios y Roles", icon: "group", adminOnly: true },
      { href: "/settings", label: "Configuración", icon: "settings" },
    ],
  },
];

export default function Shell({ children }: { children: ReactNode }) {
  const { user, logout, canManage, canSupervise } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); router.push("/login"); };

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <div className="app-shell">
      {/* ── SIDEBAR ── */}
      <aside className={`app-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>

        {/* Logo */}
        <div
          style={{
            height: 64,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            padding: collapsed ? "0 0 0 20px" : "0 20px",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24, color: "#3b82f6", flexShrink: 0 }}>inventory_2</span>
          <div className="sidebar-text" style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "var(--font-display, system-ui)" }}>WMS Pro</span>
            <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600, marginTop: 2 }}>Logística E-commerce</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: collapsed ? "16px 8px" : "16px 12px", display: "flex", flexDirection: "column", gap: 20 }}>
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="nav-section-label" style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 4px", marginBottom: 6 }}>
                {section.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {section.items.map((item) => {
                  if (item.adminOnly && !canManage()) return null;
                  if ("submenu" in item && item.submenu) {
                    const parentActive = item.submenu.some((s) => pathname.startsWith(s.href));
                    return (
                      <div key={item.href}>
                        <Link
                          href={item.href}
                          className={`nav-item ${parentActive ? "active" : ""}`}
                          title={collapsed ? item.label : undefined}
                        >
                          <span className="material-symbols-outlined nav-icon">{item.icon}</span>
                          <span className="nav-label sidebar-text">{item.label}</span>
                          <span className="material-symbols-outlined nav-chevron sidebar-text" style={{ fontSize: 16, color: "#475569", marginLeft: "auto" }}>expand_more</span>
                        </Link>
                        {!collapsed && (
                          <div style={{ paddingLeft: 16, marginTop: 2, borderLeft: "2px solid rgba(255,255,255,0.04)", marginLeft: 16, display: "flex", flexDirection: "column", gap: 1 }}>
                            {item.submenu.map((sub) => {
                              if (sub.supervisorOnly && !canSupervise()) return null;
                              const subActive = isActive(sub.href);
                              return (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "7px 10px",
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: subActive ? 600 : 400,
                                    color: subActive ? "#3b82f6" : "#64748b",
                                    backgroundColor: subActive ? "rgba(59,130,246,0.1)" : "transparent",
                                    textDecoration: "none",
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: subActive ? "#3b82f6" : "#475569" }}>{sub.icon}</span>
                                  {sub.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-item ${isActive(item.href) ? "active" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="material-symbols-outlined nav-icon">{item.icon}</span>
                      <span className="nav-label sidebar-text">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: collapsed ? "12px 8px" : "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <div
            style={{
              width: 34, height: 34,
              borderRadius: "50%",
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#3b82f6", fontWeight: 700, fontSize: 13,
              flexShrink: 0, overflow: "hidden",
            }}
          >
            {user?.photo
              ? <img src={user.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : (user?.name?.charAt(0) || "?")}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name?.split(" ")[0]}
              </div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{user?.role}</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: "#475569", padding: 6, borderRadius: 6,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "color 0.15s ease",
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 39, backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* ── MAIN ── */}
      <main className={`app-main ${collapsed ? "sidebar-collapsed" : ""}`}>

        {/* Topbar */}
        <header className="app-topbar">
          {/* Collapse toggle — desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: 8,
              border: "1px solid #e2e8f0", background: "#fff",
              color: "#64748b", cursor: "pointer",
              transition: "all 0.15s ease", flexShrink: 0,
            }}
            className="max-md:hidden"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {collapsed ? "menu_open" : "menu"}
            </span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: "none",
              alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: 8,
              border: "1px solid #e2e8f0", background: "#fff",
              color: "#64748b", cursor: "pointer",
              flexShrink: 0,
            }}
            className="md:hidden"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>menu</span>
          </button>

          {/* Search bar */}
          <div style={{
            flex: 1, maxWidth: 420,
            display: "flex", alignItems: "center", gap: 8,
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: 10, padding: "8px 14px",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#94a3b8", flexShrink: 0 }}>search</span>
            <input
              type="text"
              placeholder="Buscar pedido, producto o SKU..."
              style={{
                border: "none", outline: "none", background: "transparent",
                fontSize: 13.5, color: "#0f172a", width: "100%",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Right: user info + logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto", flexShrink: 0 }}>
            <Link
              href="/settings"
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 14px", borderRadius: 9,
                border: "1px solid #e2e8f0", background: "#fff",
                fontSize: 13, fontWeight: 600, color: "#334155",
                textDecoration: "none", transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#94a3b8" }}>account_circle</span>
              <span>{user?.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 36, height: 36, borderRadius: 9,
                border: "1px solid #e2e8f0", background: "#fff",
                color: "#64748b", cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="app-content">
          {children}
        </div>
      </main>
    </div>
  );
}
