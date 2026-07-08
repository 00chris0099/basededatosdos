# WMS Pro - Rebuild Implementation Plan

## 1. Project Structure

```
wms-pro/
├── backend/
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   ├── src/
│   │   ├── index.js                    # Express app entry point
│   │   ├── config/
│   │   │   ├── database.js             # SQL Server connection pool (mssql)
│   │   │   └── env.js                  # Environment variable loader
│   │   ├── middleware/
│   │   │   ├── auth.js                 # JWT verification
│   │   │   └── roleGuard.js            # Role-based access control
│   │   ├── routes/
│   │   │   ├── auth.routes.js          # POST /login, POST /logout, GET /me
│   │   │   ├── users.routes.js         # CRUD /users
│   │   │   ├── products.routes.js      # CRUD /products
│   │   │   ├── locations.routes.js     # CRUD /locations
│   │   │   ├── orders.routes.js        # CRUD /orders, status transitions
│   │   │   ├── picking.routes.js       # POST /picking/scan, GET /picking/current
│   │   │   ├── packing.routes.js       # POST /packing/confirm
│   │   │   ├── dispatch.routes.js      # GET /dispatch/stats, POST /dispatch/status
│   │   │   ├── reports.routes.js       # GET /reports/kpis, /reports/charts
│   │   │   ├── incidents.routes.js     # CRUD /incidents
│   │   │   └── warehouse.routes.js     # GET/PUT /warehouse-config
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── users.service.js
│   │   │   ├── products.service.js
│   │   │   ├── locations.service.js
│   │   │   ├── orders.service.js
│   │   │   ├── picking.service.js
│   │   │   ├── packing.service.js
│   │   │   ├── dispatch.service.js
│   │   │   ├── reports.service.js
│   │   │   ├── incidents.service.js
│   │   │   └── warehouse.service.js
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   ├── users.validator.js
│   │   │   ├── products.validator.js
│   │   │   └── orders.validator.js
│   │   ├── utils/
│   │   │   ├── sku.generator.js        # SKU-YYYY-NNNN generation
│   │   │   ├── locationCode.js         # Section-Aisle-Level-Bin composition
│   │   │   └── helpers.js              # formatMoney, status helpers
│   │   └── seed.js                     # Mock data seeder for dev
│   └── sql/
│       ├── schema.sql                  # CREATE TABLE statements
│       └── seed.sql                    # INSERT mock data
│
├── mobile/
│   ├── package.json
│   ├── App.js
│   ├── app.json
│   ├── babel.config.js
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js               # Axios instance with interceptors
│   │   │   └── endpoints.js           # All API endpoint constants
│   │   ├── auth/
│   │   │   ├── AuthContext.js          # React Context for auth state
│   │   │   └── useAuth.js             # Hook to consume auth context
│   │   ├── navigation/
│   │   │   ├── AppNavigator.js         # Root navigator (auth check)
│   │   │   ├── DrawerNavigator.js      # Main app drawer
│   │   │   └── StackNavigators.js      # Nested stacks per feature
│   │   ├── screens/
│   │   │   ├── LoginScreen.js
│   │   │   ├── DashboardScreen.js
│   │   │   ├── ProductsScreen.js
│   │   │   ├── ProductRegisterScreen.js
│   │   │   ├── ProductDetailScreen.js
│   │   │   ├── LocationsScreen.js
│   │   │   ├── OrdersScreen.js
│   │   │   ├── PickingScreen.js
│   │   │   ├── PackingScreen.js
│   │   │   ├── DispatchScreen.js
│   │   │   ├── ReportsScreen.js
│   │   │   ├── UsersScreen.js
│   │   │   └── SettingsScreen.js
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Card.js
│   │   │   │   ├── StatCard.js
│   │   │   │   ├── Badge.js
│   │   │   │   ├── Button.js
│   │   │   │   ├── SearchInput.js
│   │   │   │   ├── Modal.js
│   │   │   │   ├── Toast.js
│   │   │   │   ├── LoadingSpinner.js
│   │   │   │   ├── EmptyState.js
│   │   │   │   └── Header.js
│   │   │   ├── forms/
│   │   │   │   ├── FormField.js
│   │   │   │   ├── SelectField.js
│   │   │   │   ├── ImagePicker.js
│   │   │   │   └── LocationPicker.js
│   │   │   ├── tables/
│   │   │   │   ├── DataTable.js
│   │   │   │   └── OrderRow.js
│   │   │   ├── charts/
│   │   │   │   ├── BarChart.js
│   │   │   │   └── ProgressBar.js
│   │   │   ├── warehouse/
│   │   │   │   ├── WarehouseMap.js
│   │   │   │   └── BinCell.js
│   │   │   └── orders/
│   │   │       ├── StatusBadge.js
│   │   │       ├── OrderModal.js
│   │   │       └── StatusFlow.js
│   │   ├── theme/
│   │   │   ├── colors.js               # #0959d9, #2563eb, #293040, etc.
│   │   │   ├── typography.js           # Inter font weights
│   │   │   ├── spacing.js              # Consistent spacing scale
│   │   │   └── theme.js                # Unified theme object
│   │   ├── utils/
│   │   │   ├── format.js               # formatMoney (S/), formatDate
│   │   │   ├── storage.js              # AsyncStorage wrapper
│   │   │   └── permissions.js          # Role check helpers
│   │   └── mock/
│   │       └── mockData.js             # Development mock data
│   └── assets/
│       ├── fonts/                      # Inter font files
│       └── images/
│
└── README.md
```

---

## 2. Database Schema (SQL Server)

```sql
-- Roles are embedded as an ENUM-like CHECK constraint, not a separate table.
-- This matches the 4 fixed roles from the original app.

CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(150) NOT NULL,
    email NVARCHAR(200) NOT NULL UNIQUE,
    dni NVARCHAR(20) NOT NULL UNIQUE,
    role NVARCHAR(50) NOT NULL
        CHECK (role IN ('Dueño','Administrador','Supervisor','Operario')),
    password_hash NVARCHAR(255) NOT NULL,
    photo NVARCHAR(500) NULL,
    active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Locations (
    id INT PRIMARY KEY IDENTITY(1,1),
    code NVARCHAR(20) NOT NULL UNIQUE,          -- e.g. 'A-01-03-02'
    zone NVARCHAR(10) NOT NULL,                  -- section letter
    rack NVARCHAR(10) NOT NULL,                  -- aisle number
    level NVARCHAR(10) NOT NULL,                 -- level number
    bin NVARCHAR(10) NOT NULL,                   -- bin number
    capacity INT NOT NULL DEFAULT 0,
    used INT NOT NULL DEFAULT 0,
    type NVARCHAR(100) NULL,                     -- category label
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Products (
    sku NVARCHAR(20) PRIMARY KEY,                -- 'SKU-YYYY-NNNN'
    name NVARCHAR(200) NOT NULL,
    brand NVARCHAR(100) NULL,
    category NVARCHAR(100) NULL,
    unit NVARCHAR(50) NULL DEFAULT 'Unidad',
    description NVARCHAR(MAX) NULL,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 0,
    max_stock INT NOT NULL DEFAULT 0,
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    image_url NVARCHAR(500) NULL,
    location_code NVARCHAR(20) NULL
        REFERENCES Locations(code),
    status NVARCHAR(50) NOT NULL DEFAULT 'En Stock'
        CHECK (status IN ('En Stock','Bajo Stock','Agotado')),
    capacity_pct INT NOT NULL DEFAULT 0,          -- percentage 0-100
    active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Movements (
    id INT PRIMARY KEY IDENTITY(1,1),
    product_sku NVARCHAR(20) NOT NULL
        REFERENCES Products(sku),
    type NVARCHAR(50) NOT NULL
        CHECK (type IN ('Entrada','Salida','Ajuste')),
    quantity INT NOT NULL,
    reason NVARCHAR(500) NULL,
    performed_by NVARCHAR(150) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Orders (
    id NVARCHAR(20) PRIMARY KEY,                 -- 'ORD-XXXX'
    customer NVARCHAR(200) NOT NULL,
    priority NVARCHAR(20) NOT NULL DEFAULT 'Media'
        CHECK (priority IN ('Alta','Media','Baja')),
    order_date DATETIME2 NOT NULL DEFAULT GETDATE(),
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status NVARCHAR(50) NOT NULL DEFAULT 'Pendiente'
        CHECK (status IN (
            'Pendiente','Picking','Packing',
            'Listo para Despacho','En Ruta',
            'Entregado','Cancelado'
        )),
    assigned_to NVARCHAR(150) NULL,
    assigned_user_id INT NULL REFERENCES Users(id),
    route NVARCHAR(500) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE OrderItems (
    id INT PRIMARY KEY IDENTITY(1,1),
    order_id NVARCHAR(20) NOT NULL REFERENCES Orders(id) ON DELETE CASCADE,
    product_sku NVARCHAR(20) NOT NULL REFERENCES Products(sku),
    quantity INT NOT NULL DEFAULT 1,
    scanned INT NOT NULL DEFAULT 0
);

CREATE TABLE Incidents (
    id INT PRIMARY KEY IDENTITY(1,1),
    order_id NVARCHAR(20) NOT NULL REFERENCES Orders(id),
    message NVARCHAR(1000) NOT NULL,
    reported_by NVARCHAR(150) NULL,
    reported_by_user_id INT NULL REFERENCES Users(id),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE WarehouseConfig (
    id INT PRIMARY KEY IDENTITY(1,1),
    config_key NVARCHAR(100) NOT NULL UNIQUE,
    config_value NVARCHAR(500) NOT NULL
    -- stores: sections, aisles, levels, bins as JSON strings
);
```

---

## 3. Backend API Endpoints

### Authentication
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/api/auth/login` | No | All | Returns JWT + user data |
| POST | `/api/auth/logout` | Yes | All | Invalidates token (optional blacklist) |
| GET | `/api/auth/me` | Yes | All | Returns current user profile |

### Users
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/users` | Yes | Admin, Dueño | List all users |
| GET | `/api/users/:id` | Yes | Admin, Dueño | Get user by ID |
| POST | `/api/users` | Yes | Admin, Dueño | Create user |
| PUT | `/api/users/:id` | Yes | Admin, Dueño (or self) | Update user |
| DELETE | `/api/users/:id` | Yes | Admin, Dueño | Soft delete (set active=false) |

### Products
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/products` | Yes | All | List products (query: search, status, category) |
| GET | `/api/products/:sku` | Yes | All | Get product detail + movements |
| POST | `/api/products` | Yes | Admin, Dueño, Supervisor | Create product (auto SKU) |
| PUT | `/api/products/:sku` | Yes | Admin, Dueño, Supervisor | Update product |
| DELETE | `/api/products/:sku` | Yes | Admin, Dueño | Deactivate product |
| POST | `/api/products/:sku/movements` | Yes | Admin, Dueño, Supervisor | Register stock movement |

### Locations
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/locations` | Yes | All | List all locations with capacity info |
| GET | `/api/locations/:code` | Yes | All | Location detail + products at location |
| POST | `/api/locations` | Yes | Admin, Dueño | Create new location |
| PUT | `/api/locations/:code` | Yes | Admin, Dueño | Update capacity/type |

### Warehouse Config
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/warehouse-config` | Yes | All | Get sections, aisles, levels, bins |
| PUT | `/api/warehouse-config` | Yes | Admin, Dueño | Add section or aisle |

### Orders
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/orders` | Yes | All | List orders (query: status, assigned) |
| GET | `/api/orders/:id` | Yes | All | Order detail + items |
| POST | `/api/orders` | Yes | Admin, Dueño, Supervisor | Create order |
| PUT | `/api/orders/:id/status` | Yes | All | Change order status (validates flow) |
| POST | `/api/orders/:id/advance` | Yes | All | Advance to next status |
| DELETE | `/api/orders/:id` | Yes | Admin, Dueño | Delete order |

### Picking
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/picking/current` | Yes | All | Get active picking order for user |
| POST | `/api/picking/scan` | Yes | All | Confirm SKU scan (validates match) |
| GET | `/api/picking/progress/:orderId` | Yes | All | Get scan progress for order |

### Packing
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/packing/pending` | Yes | All | List orders pending packing |
| POST | `/api/packing/confirm/:orderId` | Yes | All | Confirm packing, advance to Listo para Despacho |

### Dispatch
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/dispatch/stats` | Yes | All | Counts by status |
| POST | `/api/dispatch/status/:orderId` | Yes | Admin, Dueño, Supervisor | Set dispatch status |

### Reports
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/reports/kpis` | Yes | Admin, Dueño, Supervisor | Top SKU, avg time, occupancy % |
| GET | `/api/reports/charts` | Yes | Admin, Dueño, Supervisor | Movement trends data |
| GET | `/api/reports/incidents` | Yes | Admin, Dueño, Supervisor | All incidents list |

### Incidents
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/api/incidents` | Yes | All | Report incident for order |
| GET | `/api/incidents` | Yes | Admin, Dueño, Supervisor | List all incidents |

---

## 4. JWT Authentication Flow

```
1. POST /api/auth/login { email, password }
   → Backend: find user by email, bcrypt.compare(password, hash)
   → On success: sign JWT with { id, email, role, name } → 24h expiry
   → Return: { token, user: { id, name, email, role, photo, dni } }

2. Store token in AsyncStorage (mobile)

3. Axios interceptor on every request:
   → Attach header: Authorization: Bearer <token>
   → On 401 response: clear token, redirect to login

4. GET /api/auth/me
   → Backend: verify JWT, return full user profile from DB
   → Used on app startup to restore session
```

**Token payload:**
```json
{
  "id": 1,
  "email": "admin@wmspro.com",
  "role": "Administrador",
  "name": "Alex Thompson",
  "iat": 1719300000,
  "exp": 1719386400
}
```

**bcrypt hashing:** All passwords stored as bcrypt hashes. Default test password "123456" is hashed at seed time.

---

## 5. Role-Based Access Control (RBAC)

### Middleware: `roleGuard.js`

```javascript
// Usage in routes:
router.get('/users', auth, roleGuard('Administrador', 'Dueño'), getUsers);
router.post('/products', auth, roleGuard('Administrador', 'Dueño', 'Supervisor'), createProduct);

// roleGuard middleware:
// 1. Extracts role from JWT payload (req.user.role)
// 2. Checks if role is in the allowed list
// 3. Returns 403 if not authorized
```

### Permission Matrix

| Action | Dueño | Administrador | Supervisor | Operario |
|--------|-------|--------------|------------|----------|
| Dashboard view | ✅ | ✅ | ✅ | ✅ |
| Products list | ✅ | ✅ | ✅ | ✅ |
| Product register | ✅ | ✅ | ✅ | ❌ |
| Product detail | ✅ | ✅ | ✅ | ✅ |
| Register movement | ✅ | ✅ | ✅ | ❌ |
| Locations view | ✅ | ✅ | ✅ | ✅ |
| Add location | ✅ | ✅ | ❌ | ❌ |
| Orders view | ✅ | ✅ | ✅ | ✅ |
| Order status change | ✅ | ✅ | ✅ | ✅ |
| Delete order | ✅ | ✅ | ❌ | ❌ |
| Picking | ✅ | ✅ | ✅ | ✅ |
| Packing | ✅ | ✅ | ✅ | ✅ |
| Dispatch view | ✅ | ✅ | ✅ | ✅ |
| Reports | ✅ | ✅ | ✅ | ❌ |
| Users CRUD | ✅ | ✅ | ❌ | ❌ |
| Settings (own profile) | ✅ | ✅ | ✅ | ✅ |
| Warehouse config | ✅ | ✅ | ❌ | ❌ |

### Frontend Role Guards

```javascript
// utils/permissions.js
export const canManage = (role) => ['Administrador', 'Dueño'].includes(role);
export const canSupervise = (role) => ['Administrador', 'Dueño', 'Supervisor'].includes(role);
export const canOperate = (role) => ['Operario', 'Supervisor', 'Administrador', 'Dueño'].includes(role);

// Used in navigation to hide/show menu items
// Used in screens to conditionally render action buttons
```

---

## 6. Frontend Navigation (React Navigation)

### Structure

```
App.js
└── AuthContext.Provider
    └── AppNavigator
        ├── LoginStack (not authenticated)
        │   └── LoginScreen
        └── MainDrawer (authenticated)
            ├── DashboardStack
            │   └── DashboardScreen
            ├── ProductsStack
            │   ├── ProductsScreen
            │   ├── ProductRegisterScreen
            │   └── ProductDetailScreen
            ├── LocationsStack
            │   └── LocationsScreen
            ├── OrdersStack
            │   └── OrdersScreen
            ├── PickingStack
            │   └── PickingScreen
            ├── PackingStack
            │   └── PackingScreen
            ├── DispatchStack
            │   └── DispatchScreen
            ├── ReportsStack
            │   └── ReportsScreen
            ├── UsersStack (conditional - Admin/Dueño only)
            │   └── UsersScreen
            └── SettingsStack
                └── SettingsScreen
```

### Drawer Configuration

```javascript
// Custom drawer content showing:
// - Logo "WMS Pro" + subtitle
// - Section headers: "Almacén", "Administración"
// - Nav items with Material Symbols icons
// - User avatar + name + role at bottom
// - Hidden items based on role:
//   - "Registrar" (products submenu) → only Supervisor+
//   - "Usuarios y Roles" → only Admin/Dueño
// - Sidebar color: #293040
```

### Package Dependencies

```
@react-navigation/native
@react-navigation/drawer
@react-navigation/native-stack
react-native-screens
react-native-safe-area-context
react-native-gesture-handler
react-native-reanimated
@expo/vector-icons (or react-native-vector-icons)
```

---

## 7. State Management

### Approach: React Context + useReducer (no Redux needed)

**Why Context over Redux:** The app has ~12 screens with relatively simple state. Context with useReducer handles auth state, and each screen manages its own server state via Axios calls. No complex cross-screen shared mutable state exists.

### AuthContext

```javascript
// auth/AuthContext.js
const AuthContext = createContext();

// State shape:
{
  user: null | { id, name, email, role, photo, dni },
  token: null | string,
  loading: true,    // true while checking stored token on startup
}

// Actions:
// LOGIN: store token + user
// LOGOUT: clear token + user
// RESTORE_SESSION: load token from AsyncStorage, fetch /me
// UPDATE_PROFILE: update user fields after settings edit
```

### Screen-Level State

Each screen fetches its own data on mount:

```javascript
// Example: OrdersScreen
const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);
const [filter, setFilter] = useState('Todos');

useEffect(() => {
  fetchOrders();
}, [filter]);

const fetchOrders = async () => {
  const res = await api.get('/orders', { params: { status: filter } });
  setOrders(res.data);
  setLoading(false);
};
```

### Axios Configuration

```javascript
// api/axios.js
const api = axios.create({
  baseURL: 'http://YOUR_SERVER:3000/api',
  timeout: 10000,
});

// Request interceptor: attach JWT
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      // Trigger logout via context
    }
    return Promise.reject(error);
  }
);
```

---

## 8. Screen-by-Screen Breakdown

### 8.1 LoginScreen

**Layout:** Split view — left hero card (brand), right form card.
- Brand badge: warehouse icon + "WMS Pro" title + subtitle
- Form: email input, password input, "Iniciar sesión" button, error message area
- Footer: copyright text

**Behavior:**
1. POST `/api/auth/login` with email + password
2. On success: store JWT in AsyncStorage, set AuthContext, navigate to Dashboard
3. On error: show "Usuario o contraseña incorrectos"

**Mobile adaptation:** Full-width stacked layout instead of side-by-side. Hero on top, form below.

---

### 8.2 DashboardScreen

**Layout:**
- Alert banner (red) if any products have stock <= min_stock
- 4 StatCards in 2x2 grid: Total productos, Pedidos pendientes, Alertas bajo stock, Movimientos
- 2-column grid: Bar chart (movimientos), Orders by status + recent activity feed
- Compact orders table (latest 4)

**Data:** GET `/api/reports/kpis` + GET `/api/orders?limit=4`

**Components used:** StatCard, BarChart, ProgressBar, Badge, DataTable

---

### 8.3 ProductsScreen

**Layout:**
- Page header with "Gestión de Inventario" title + "Nuevo producto" button (Supervisor+ only)
- SearchInput + status filter dropdown
- DataTable with columns: SKU, Producto, Categoría, Precio, Stock, Ubicación, Estado, Acciones
- "Detalles" button per row navigates to ProductDetailScreen

**Data:** GET `/api/products?search=...&status=...`

**Behavior:**
- Search and filter trigger re-fetch with query params
- Price formatted as "S/ X,XXX.XX"

---

### 8.4 ProductRegisterScreen

**Layout:** Multi-section form in 3 cards:
1. **Información general:** Name, SKU (auto-generated readonly), Brand, Category (dropdown), Price, Unit, Description (textarea), Image upload with preview
2. **Control de inventario:** Initial stock, Min threshold, Bin max
3. **Ubicación en almacén:** 4 dropdowns (Section, Aisle, Level, Bin) + live location code preview

**Data:** GET `/api/warehouse-config` for dropdown options

**Behavior:**
- SKU fetched from GET `/api/products/next-sku` on mount
- Validate: stock <= max, max >= 1
- Validate: bin capacity not exceeded at selected location
- POST `/api/products` on submit
- Navigate to ProductDetailScreen on success

---

### 8.5 ProductDetailScreen

**Layout:**
- Back button + "Registrar movimiento" button (Supervisor+)
- Two-column top: Product card (image, status badge, name, category, brand, price) + Stat cards (current stock, min stock)
- Description card
- Location visualization: 4 large styled numbers (Section, Aisle, Level, Bin)
- Movements history table: Type badge, Quantity, Reason, Responsible, Date

**Data:** GET `/api/products/:sku`

**Stock Movement Modal:**
- Triggered by "Registrar movimiento" button
- Fields: Type (Entrada/Salida/Ajuste), Quantity, Reason
- POST `/api/products/:sku/movements`
- Auto-recalculates stock and status

---

### 8.6 LocationsScreen

**Layout:**
- Page header with "Hub Central de Distribución" title
- Warehouse grid map organized by sections (A-E) and aisles (1-7)
- Each bin is a colored cell:
  - Blue (#0959d9): free/low usage
  - Dark blue: 75%+ full
  - Red: 95%+ full
- Clicking a bin opens info panel on the side/bottom
- Form to add new section or aisle (Admin/Dueño only)

**Data:** GET `/api/locations` + GET `/api/warehouse-config`

**Bin Info Panel:**
- Location code, type, used/capacity ratio, alert if near full
- List of products at that location

**Mobile adaptation:** Scrollable grid with horizontal sections, info panel as bottom sheet modal.

---

### 8.7 OrdersScreen

**Layout:**
- Page header + "Nuevo pedido demo" button
- 4 StatCards: Pendiente, Picking, Packing, En Ruta counts
- Full DataTable with columns: #ID, Cliente, Prioridad, Fecha, Monto, Estado (inline dropdown), Trabajador, Acciones
- Status flow description card below table

**Data:** GET `/api/orders`

**Actions per row:**
- "Ver" → opens OrderModal
- "Avanzar" → POST `/api/orders/:id/advance`
- "Borrar" → DELETE `/api/orders/:id` (Admin/Dueño only)

**OrderModal:**
- Full order details, status change dropdown, items list with scan progress
- Buttons: Guardar estado, Reportar incidencia, Cerrar

---

### 8.8 PickingScreen

**Layout:**
- Page header with order ID + assigned worker + "Reportar incidencia" button
- Progress bar showing scanned/total ratio
- Focus card: Large location code (48px), product image, name, SKU, quantity
- Scan input field + "Confirmar item" button
- Sidebar/panel: Picking queue (all items with scan progress)
- Workers list

**Data:** GET `/api/picking/current` + GET `/api/picking/progress/:orderId`

**Behavior:**
1. Scan input validates SKU matches expected product
2. On correct scan: POST `/api/picking/scan`
3. When all items scanned: order auto-advances to Packing
4. Toast notifications for success/error

---

### 8.9 PackingScreen

**Layout:**
- Page header
- Two-column grid:
  - Left: List of pending orders with "Confirmar empaque" button
  - Right: Checklist summary (scanned count, total count, labels generated)

**Data:** GET `/api/packing/pending`

**Behavior:**
- "Confirmar empaque" → POST `/api/packing/confirm/:orderId`
- Advances order to "Listo para Despacho"

---

### 8.10 DispatchScreen

**Layout:**
- Page header + "Despacho masivo" button
- 4 StatCards: Pendiente, Listo para Despacho, En Ruta, Entregado
- Orders DataTable (no delete button)
- 2-column: Route map visualization + Carrier status display

**Data:** GET `/api/dispatch/stats` + GET `/api/orders`

---

### 8.11 ReportsScreen

**Layout:**
- 3 KPI StatCards: Top-selling SKU, Average processing time, Warehouse occupancy %
- Bar chart: Entry/exit trends
- Incidents list

**Data:** GET `/api/reports/kpis` + GET `/api/reports/charts` + GET `/api/reports/incidents`

---

### 8.12 UsersScreen

**Layout:**
- Page header
- Two-column top: User creation form (Admin/Dueño) + Admin account summary
- Full user table: Photo, Nombre, Correo, DNI, Rol badge, Estado

**Data:** GET `/api/users`

**Creation form:** Name, Email, DNI, Role (dropdown), Password (default "123456")
POST `/api/users` on submit.

---

### 8.13 SettingsScreen

**Layout:**
- Profile card: Avatar, name, role badge, email, DNI
- Edit form: Name, Email, DNI, Photo upload

**Data:** GET `/api/auth/me`

**Behavior:**
- Photo upload converts to base64 preview
- PUT `/api/users/:id` on submit
- Updates AuthContext with new profile data

---

## 9. Design System

### Colors

```javascript
// theme/colors.js
export const colors = {
  primary: '#0959d9',       // Primary actions, links, active nav
  brand: '#2563eb',         // Brand elements, gradients
  sidebar: '#293040',       // Sidebar background
  background: '#f8fafc',    // Page background
  card: '#ffffff',           // Card background
  text: '#1e293b',          // Primary text
  textSecondary: '#64748b', // Secondary text/hints
  border: '#e2e8f0',        // Borders, dividers
  success: '#16a34a',       // Green badges (En Stock, Entregado)
  warning: '#d97706',       // Amber badges (Bajo Stock, Media priority)
  danger: '#dc2626',        // Red badges (Agotado, Cancelado, Alta priority)
  purple: '#7c3aed',        // Purple badges (Picking, En Ruta)
};
```

### Badge Colors (matches original)

```javascript
export const badgeColors = {
  Pendiente: 'b-blue',
  Picking: 'b-purple',
  Packing: 'b-amber',
  'Listo para Despacho': 'b-blue',
  'En Ruta': 'b-purple',
  Entregado: 'b-green',
  Cancelado: 'b-red',
  'En Stock': 'b-green',
  'Bajo Stock': 'b-amber',
  Agotado: 'b-red',
  Alta: 'b-red',
  Media: 'b-amber',
  Baja: 'b-blue',
  Entrada: 'b-green',
  Salida: 'b-red',
  Ajuste: 'b-amber',
};
```

### Typography

```javascript
// theme/typography.js
export const typography = {
  fontFamily: 'Inter',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 28,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};
```

### Spacing

```javascript
// theme/spacing.js
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};
```

### Card Style

```javascript
// Consistent across all cards:
{
  backgroundColor: '#ffffff',
  borderRadius: 14,
  padding: 20,
  // Subtle shadow:
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
}
```

### Currency Format

```javascript
// utils/format.js
export const formatMoney = (n) => {
  return `S/ ${Number(n).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
```

### Icons

Using `@expo/vector-icons` MaterialCommunityIcons or react-native-vector-icons/MaterialIcons to replicate Material Symbols:
- `dashboard`, `inventory_2`, `pin_drop`, `shopping_cart`, `qr_code_scanner`, `inventory`, `local_shipping`, `bar_chart`, `group`, `settings`, `logout`, `account_circle`, `search`, `menu`, `add`, `arrow_forward`, `error`, `warning`, `swap_horiz`, `list_alt`, `add_box`, `expand_more`, `image`

---

## 10. Backend Implementation Details

### Express App Setup (`src/index.js`)

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // For base64 images

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/locations', require('./routes/locations.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/picking', require('./routes/picking.routes'));
app.use('/api/packing', require('./routes/packing.routes'));
app.use('/api/dispatch', require('./routes/dispatch.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/incidents', require('./routes/incidents.routes'));
app.use('/api/warehouse-config', require('./routes/warehouse.routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`WMS Pro API running on port ${PORT}`));
```

### Database Connection (`src/config/database.js`)

```javascript
const sql = require('mssql');
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};
const pool = sql.connect(config);
module.exports = { sql, pool };
```

### Auth Middleware (`src/middleware/auth.js`)

```javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token requerido' });

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
```

### Role Guard Middleware (`src/middleware/roleGuard.js`)

```javascript
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
};
```

### SKU Generator (`src/utils/sku.generator.js`)

```javascript
const { pool, sql } = require('../config/database');

async function generateSKU() {
  const year = new Date().getFullYear();
  const result = await pool.request()
    .input('prefix', sql.NVarChar, `SKU-${year}-`)
    .query(`
      SELECT TOP 1 sku FROM Products
      WHERE sku LIKE @prefix + '%'
      ORDER BY sku DESC
    `);

  let nextNum = 1;
  if (result.recordset.length > 0) {
    const lastSKU = result.recordset[0].sku;
    nextNum = parseInt(lastSKU.split('-')[2]) + 1;
  }
  return `SKU-${year}-${String(nextNum).padStart(4, '0')}`;
}
```

### Location Code Utility (`src/utils/locationCode.js`)

```javascript
function composeLocationCode(section, aisle, level, bin) {
  return `${section}-${String(aisle).padStart(2, '0')}-${level}-${bin}`;
}

function parseLocationCode(code) {
  const [section, aisle, level, bin] = code.split('-');
  return { section, aisle, level, bin };
}
```

---

## 11. Mock Data Strategy

### During Development (before SQL Server is connected)

The backend should have a mock mode using in-memory arrays that mirror the original localStorage data. This lets frontend development proceed without a database.

```javascript
// src/seed.js - Used when DB_CONNECTION=mock in .env
const mockData = {
  users: [
    { id: 1, name: 'Alex Thompson', email: 'admin@wmspro.com', dni: '70000001', role: 'Administrador', password_hash: '$2b$10$...', photo: 'https://i.pravatar.cc/120?img=12', active: true },
    { id: 2, name: 'María Ramos', email: 'supervisor@wmspro.com', dni: '70000002', role: 'Supervisor', password_hash: '$2b$10$...', photo: 'https://i.pravatar.cc/120?img=32', active: true },
    { id: 3, name: 'Juan Delgado', email: 'operario@wmspro.com', dni: '70000003', role: 'Operario', password_hash: '$2b$10$...', photo: 'https://i.pravatar.cc/120?img=52', active: true },
    { id: 4, name: 'Samuel Kiyosaki', email: 'dueno@wmspro.com', dni: '70000004', role: 'Dueño', password_hash: '$2b$10$...', photo: 'https://i.pravatar.cc/120?img=60', active: true },
  ],
  products: [
    // Same 5 products from original app.js base()
  ],
  locations: [
    // Same 5 locations from original app.js base()
  ],
  orders: [
    // Same 4 orders from original app.js base()
  ],
  incidents: [],
  warehouseConfig: {
    sections: ['A','B','C','D','E'],
    aisles: ['1','2','3','4','5','6','7'],
    levels: ['01','02','03','04','05','06'],
    bins: ['01','02','03','04'],
  },
};
```

### Test Users

| Role | Email | Password |
|------|-------|----------|
| Dueño | dueno@wmspro.com | 123456 |
| Administrador | admin@wmspro.com | 123456 |
| Supervisor | supervisor@wmspro.com | 123456 |
| Operario | operario@wmspro.com | 123456 |

---

## 12. Implementation Order

### Phase 1: Foundation (Days 1-2)

1. **Project scaffolding** — Initialize both projects (`npx create-expo-app` for mobile, `npm init` for backend)
2. **Backend: Express setup** — Basic Express server with CORS, JSON parsing, health endpoint
3. **Backend: Database config** — SQL Server connection pool + mock data fallback
4. **Backend: Auth module** — Login endpoint, JWT generation, auth middleware, role guard
5. **Backend: Users CRUD** — GET/POST/PUT/DELETE `/api/users`
6. **Mobile: Project setup** — Install React Navigation, set up folder structure
7. **Mobile: Theme** — Colors, typography, spacing constants
8. **Mobile: Axios setup** — Instance with interceptors, endpoint constants
9. **Mobile: AuthContext** — Login, logout, restore session logic
10. **Mobile: Login screen** — Form, API call, token storage

### Phase 2: Core Navigation + Dashboard (Days 3-4)

11. **Mobile: Navigation** — Drawer + stack navigators with all screens
12. **Mobile: Common components** — Card, StatCard, Badge, Button, SearchInput, Modal, Toast, LoadingSpinner, Header
13. **Mobile: Dashboard screen** — KPI cards, alerts, stats, activity feed
14. **Backend: Reports endpoints** — KPIs, charts, incidents aggregation

### Phase 3: Products (Days 5-6)

15. **Backend: Products CRUD** — List, detail, create, update, delete
16. **Backend: SKU generator** — Auto-incrementing SKU-YYYY-NNNN
17. **Backend: Movements endpoint** — Register stock movement, recalculate status
18. **Mobile: ProductsScreen** — Table, search, filter
19. **Mobile: ProductRegisterScreen** — Multi-section form, image upload, location picker
20. **Mobile: ProductDetailScreen** — Info, stock stats, location visualization, movements history
21. **Mobile: Stock movement modal** — Type, quantity, reason inputs

### Phase 4: Locations (Days 7-8)

22. **Backend: Locations endpoints** — CRUD, capacity checks
23. **Backend: Warehouse config endpoints** — Get/update sections, aisles
24. **Mobile: LocationsScreen** — Warehouse grid map, bin color coding, info panel, add section/aisle form

### Phase 5: Orders + Workflow (Days 9-11)

25. **Backend: Orders CRUD** — List, detail, create, status change, advance, delete
26. **Backend: Order status validation** — Enforce flow: Pendiente→Picking→Packing→Listo para Despacho→En Ruta→Entregado/Cancelado
27. **Mobile: OrdersScreen** — Table with inline status dropdown, stat cards, create demo button
28. **Mobile: OrderModal** — Detail view, status change, incident report
29. **Mobile: StatusBadge component** — Color-coded status/priority badges

### Phase 6: Picking + Packing + Dispatch (Days 12-14)

30. **Backend: Picking endpoints** — Current order, scan confirmation, progress tracking
31. **Backend: Packing endpoints** — Pending list, confirm packing
32. **Backend: Dispatch endpoints** — Stats, status update
33. **Mobile: PickingScreen** — Focus card, scan input, progress bar, picking queue
34. **Mobile: PackingScreen** — Pending orders, checklist summary, confirm button
35. **Mobile: DispatchScreen** — Stats, orders table, carrier display

### Phase 7: Users + Settings + Reports (Days 15-16)

36. **Backend: Users endpoints** — Full CRUD with role checks
37. **Mobile: UsersScreen** — Creation form, user table
38. **Mobile: SettingsScreen** — Profile card, edit form, photo upload
39. **Mobile: ReportsScreen** — KPIs, bar chart, incidents list
40. **Backend: Incidents endpoints** — Report + list

### Phase 8: Polish + Testing (Days 17-18)

41. **Mobile: Loading states** — Skeleton screens, spinners
42. **Mobile: Error handling** — API error toasts, retry logic
43. **Mobile: Empty states** — "Sin pedidos", "Sin incidencias" messages
44. **Mobile: Responsive adjustments** — Mobile-first layout refinements
45. **Testing** — Manual walkthrough of all 4 roles across all screens
46. **SQL Server schema** — Final schema when user provides DB connection

---

## 13. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend framework | React Native (Expo) | Cross-platform mobile, matches requirement |
| State management | Context + useReducer | Sufficient complexity, no Redux overhead |
| API calls | Axios with interceptors | Clean auth token injection, error handling |
| Navigation | React Navigation Drawer + Stack | Native drawer UX, nested stack navigation |
| DB abstraction | Repository/Service pattern | Clean separation, easy to swap mock→SQL Server |
| Password hashing | bcrypt | Industry standard, 10 salt rounds |
| JWT expiry | 24 hours | Balance between security and UX |
| Image storage | Base64 in DB (initially) | Simple for MVP; migrate to file storage later |
| SKU format | SKU-YYYY-NNNN | Matches original, year-based uniqueness |
| Location code | Section-Aisle-Level-Bin | Matches original warehouse convention |
| Currency | S/ (Peruvian Soles) | Original app convention |
| Font | Inter (400-900) | Original app font |
| Mock strategy | In-memory arrays | Lets frontend dev proceed without DB |
| Card border radius | 14px | Matches original design system |
| Order flow | 7 states (6 progressive + cancel) | Matches original exactly |

---

## 14. Environment Variables (`.env`)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_SERVER=localhost
DB_NAME=wmspro
DB_USER=sa
DB_PASSWORD=your_password
DB_CONNECTION=mock  # Set to 'sqlserver' when SQL Server is ready

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=*
```

---

## 15. Package Dependencies

### Backend (`backend/package.json`)

```json
{
  "name": "wms-pro-backend",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "mssql": "^10.0.0",
    "express-validator": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

### Mobile (`mobile/package.json`)

```json
{
  "name": "wms-pro-mobile",
  "version": "1.0.0",
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.74.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/drawer": "^6.6.0",
    "@react-navigation/native-stack": "^6.9.0",
    "react-native-screens": "^3.30.0",
    "react-native-safe-area-context": "^4.8.0",
    "react-native-gesture-handler": "^2.14.0",
    "react-native-reanimated": "^3.6.0",
    "react-native-vector-icons": "^10.0.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "axios": "^1.6.0",
    "react-native-image-picker": "^7.0.0"
  }
}
```

---

*Plan created from analysis of the existing WMS Pro codebase (14 HTML pages, app.js with localStorage-based SPA). Ready for implementation when the user begins.*
