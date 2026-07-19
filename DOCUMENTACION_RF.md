# Documentación Funcional - WMS Ecommerce

## Cómo funciona el sistema

El WMS (Warehouse Management System) funciona con una arquitectura **SQL-first**: toda la lógica de negocio vive en la base de datos como Stored Procedures, Vistas, Funciones y Triggers. React/Next.js (frontend) y Express (backend) son solo capas de presentación que llaman a estos objetos SQL.

**Flujo de una operación típica:**
```
Usuario interactúa en React → Frontend llama a API → Backend ejecuta SP en SQL Server → SQL valida, procesa y devuelve resultado
```

---

## RF18 - Autenticación de Usuarios y Roles

### Qué hace
Permite a los usuarios iniciar sesión con correo y contraseña. El sistema verifica las credenciales contra la base de datos y genera un token JWT con el rol del usuario.

### SQL que lo soporta

**Tabla de usuarios y roles:**
```sql
CREATE TABLE Rol(
    Id_Rol INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_Rol VARCHAR(50) NOT NULL
);

CREATE TABLE Usuario(
    Id_Usuario INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Contrasena VARCHAR(255) NOT NULL,
    Correo VARCHAR(100) NOT NULL UNIQUE,
    Id_Rol INT NOT NULL,
    CONSTRAINT FK_Usuario_Rol FOREIGN KEY(Id_Rol) REFERENCES Rol(Id_Rol)
);
```

**Datos iniciales (3 roles, 5 usuarios):**
```sql
INSERT INTO Rol (Nombre_Rol) VALUES ('Administrador'),('Supervisor'),('Operario');

INSERT INTO Usuario (Nombre, Contrasena, Telefono, Correo, Id_Rol)
VALUES
('Juan Perez','Admin2025#','987654321','juan.perez@almacen.com',1),
('Maria Lopez','Super2025#','912345678','maria.lopez@almacen.com',2),
('Carlos Ruiz','Oper2025#','998877665','carlos.ruiz@almacen.com',3);
```

**SP de autenticación:**
```sql
CREATE PROCEDURE sp_AutenticarUsuarioWMS
    @Correo VARCHAR(100),
    @Contrasena VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT u.Id_Usuario, u.Nombre, u.Correo, r.Nombre_Rol AS Rol
    FROM Usuario u
    INNER JOIN Rol r ON u.Id_Rol = r.Id_Rol
    WHERE u.Correo = @Correo AND u.Contrasena = @Contrasena;
END;
```

**SP para asignar rol:**
```sql
CREATE PROCEDURE sp_AsignarRolUsuarioWMS
    @Id_Usuario INT,
    @Id_Rol INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Id_Usuario = @Id_Usuario)
            THROW 51027, 'El usuario no existe.', 1;

        IF NOT EXISTS (SELECT 1 FROM Rol WHERE Id_Rol = @Id_Rol)
            THROW 51028, 'El rol especificado no existe.', 1;

        BEGIN TRANSACTION;
        UPDATE Usuario SET Id_Rol = @Id_Rol WHERE Id_Usuario = @Id_Usuario;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
```

### Flujo de interacción
1. Usuario escribe correo + contraseña en el formulario de login
2. Frontend envía `POST /api/auth/login` con `{ email, password }`
3. Backend ejecuta `sp_AutenticarUsuarioWMS` con los parámetros
4. Si el SP devuelve filas → el usuario existe → backend genera JWT con `userId`, `email`, `role`
5. Frontend almacena el JWT y lo envía en cada petición subsiguiente
6. El middleware `verifyToken` decodifica el JWT y adjunta el usuario a la petición
7. El middleware `roles` verifica el rol antes de permitir ciertas acciones:
   - **Administrador** (Id_Rol=1): puede todo
   - **Supervisor** (Id_Rol=2): puede gestionar productos, movimientos, pedidos
   - **Operario** (Id_Rol=3): solo puede ver inventario y movimientos básicos

### Roles y permisos
| Acción | Administrador | Supervisor | Operario |
|--------|:---:|:---:|:---:|
| Ver productos | ✅ | ✅ | ✅ |
| Registrar producto | ✅ | ✅ | ❌ |
| Editar producto | ✅ | ✅ | ❌ |
| Registrar movimientos | ✅ | ✅ | ❌ |
| Gestionar pedidos | ✅ | ✅ | ❌ |
| Ver reportes | ✅ | ✅ | ✅ |

---

## RF01 - Registro de Productos

### Qué hace
Permite registrar un nuevo producto en el sistema con toda su información: código (SKU), nombre, descripción, precio, categoría, marca, stock mínimo, imagen y ubicación en almacén. El SP crea el producto, le asigna una ubicación física y registra el stock inicial como primer movimiento de entrada.

### SQL que lo soporta

**Tabla de productos (con imagen en Base64):**
```sql
CREATE TABLE Producto(
    Id_Producto INT IDENTITY(1,1) PRIMARY KEY,
    Codigo_Producto VARCHAR(50) NOT NULL UNIQUE,
    Nombre_Producto VARCHAR(120) NOT NULL,
    Descripcion VARCHAR(300),
    Precio DECIMAL(10,2) NOT NULL,
    Stock_Minimo INT NOT NULL,
    Id_Categoria INT NOT NULL,
    Id_Marca INT NULL,
    Imagen VARCHAR(MAX) NULL,                    -- ← Imagen en Base64
    CONSTRAINT CK_Producto_Precio CHECK(Precio > 0),
    CONSTRAINT CK_Producto_StockMinimo CHECK(Stock_Minimo >= 0),
    CONSTRAINT FK_Producto_Categoria FOREIGN KEY(Id_Categoria) REFERENCES Categoria(Id_Categoria),
    CONSTRAINT FK_Producto_Marca FOREIGN KEY(Id_Marca) REFERENCES Marca(Id_Marca)
);
```

**SP de registro (crea producto + inventario + movimiento inicial):**
```sql
CREATE PROCEDURE sp_RegistrarProductoWMS
    @Codigo_Producto VARCHAR(50),
    @Nombre_Producto VARCHAR(120),
    @Descripcion VARCHAR(300),
    @Precio DECIMAL(10,2),
    @Stock_Minimo INT,
    @Id_Categoria INT,
    @Stock_Inicial INT,
    @Id_Ubicacion VARCHAR(20),
    @Id_Usuario INT,
    @Id_Marca INT = NULL,
    @Imagen VARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- VALIDACIONES
        IF EXISTS (SELECT 1 FROM Producto WHERE Codigo_Producto = @Codigo_Producto)
            THROW 51000, 'El codigo de producto ya existe.', 1;

        IF NOT EXISTS (SELECT 1 FROM Categoria WHERE Id_Categoria = @Id_Categoria)
            THROW 51001, 'La categoria especificada no existe.', 1;

        IF @Id_Marca IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Marca WHERE Id_Marca = @Id_Marca)
            THROW 51035, 'La marca especificada no existe.', 1;

        IF NOT EXISTS (SELECT 1 FROM Ubicacion WHERE Codigo_Ubicacion = @Id_Ubicacion)
            THROW 51002, 'La ubicacion especificada no existe.', 1;

        IF @Stock_Inicial < 0
            THROW 51003, 'El stock inicial no puede ser negativo.', 1;

        BEGIN TRANSACTION;

        -- 1. Crear el producto
        INSERT INTO Producto (Codigo_Producto, Nombre_Producto, Descripcion, Precio,
            Stock_Minimo, Id_Categoria, Id_Marca, Imagen)
        VALUES (@Codigo_Producto, @Nombre_Producto, @Descripcion, @Precio,
            @Stock_Minimo, @Id_Categoria, @Id_Marca, @Imagen);

        DECLARE @New_Id_Producto INT = SCOPE_IDENTITY();

        -- 2. Crear registro de inventario en la ubicación
        INSERT INTO Inventario (Stock_Actual, Estado_Stock, Id_Producto, Id_Ubicacion)
        VALUES (@Stock_Inicial, 'Disponible', @New_Id_Producto, @Id_Ubicacion);

        DECLARE @New_Id_Inventario INT = SCOPE_IDENTITY();

        -- 3. Registrar movimiento de entrada inicial (si hay stock)
        IF @Stock_Inicial > 0
        BEGIN
            INSERT INTO Movimiento_Inventario (Observacion, Id_Usuario, Id_Tipo_Movimiento)
            VALUES ('Registro de Stock Inicial del producto ' + @Codigo_Producto, @Id_Usuario, 1);

            DECLARE @New_Id_Movimiento INT = SCOPE_IDENTITY();

            INSERT INTO Detalle_Movimiento (Cantidad, Id_Movimiento_Inventario, Id_Inventario)
            VALUES (@Stock_Inicial, @New_Id_Movimiento, @New_Id_Inventario);
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
```

**SP para crear categorías desde el formulario:**
```sql
CREATE PROCEDURE sp_CrearCategoriaWMS
    @Nombre_Categoria VARCHAR(80)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM Categoria WHERE Nombre_Categoria = @Nombre_Categoria)
            THROW 51034, 'La categoria ya esta registrada.', 1;

        BEGIN TRANSACTION;
        INSERT INTO Categoria (Nombre_Categoria) VALUES (@Nombre_Categoria);
        COMMIT TRANSACTION;

        SELECT SCOPE_IDENTITY() AS Id_Categoria;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
```

**SP para crear marcas desde el formulario:**
```sql
CREATE PROCEDURE sp_CrearMarcaWMS
    @Nombre_Marca VARCHAR(80),
    @Id_Categoria INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Categoria WHERE Id_Categoria = @Id_Categoria)
            THROW 51030, 'La categoria especificada no existe.', 1;

        IF EXISTS (SELECT 1 FROM Marca WHERE Nombre_Marca = @Nombre_Marca AND Id_Categoria = @Id_Categoria)
            THROW 51031, 'La marca ya existe en esta categoria.', 1;

        BEGIN TRANSACTION;
        INSERT INTO Marca (Nombre_Marca, Id_Categoria)
        VALUES (@Nombre_Marca, @Id_Categoria);
        COMMIT TRANSACTION;

        SELECT SCOPE_IDENTITY() AS Id_Marca;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
```

### Flujo de interacción
1. Supervisor/Administrador hace clic en "Nuevo Producto" en la lista de productos
2. Se carga el formulario con categorías y marcas (consultas `SELECT * FROM Categoria` y `sp_ListarMarcasPorCategoriaWMS`)
3. Si la categoría o marca no existe, se crea en el modal con `sp_CrearCategoriaWMS` o `sp_CrearMarcaWMS`
4. Se sube una imagen (Base64) con el componente ImageUploader
5. El SKU se genera automáticamente en el frontend
6. Al enviar, el frontend llama `POST /api/products` con todos los campos
7. Backend ejecuta `sp_RegistrarProductoWMS` que en una sola transacción:
   - Valida que el SKU no exista, que la categoría/ubicación existan
   - Crea el producto con imagen
   - Crea el registro de inventario con la ubicación
   - Si hay stock inicial, registra el primer movimiento de entrada
8. El usuario vuelve a la lista de productos

### Estructura de ubicaciones
Las ubicaciones siguen el formato `Sección-Pasillo-Nivel-Bin` (ej: `A-01-01-01`):
- **Sección**: A, B, C, D, E (zonas del almacén)
- **Pasillo**: 1-7
- **Nivel**: 01-04
- **Bin**: 01-05

---

## RF04 - Registro de Entradas de Inventario

### Qué hace
Registra la entrada de mercadería al almacén. Aumenta el stock del producto en la ubicación especificada y crea un registro de movimiento para auditoría.

### SQL que lo soporta

**Tablas involucradas:**
```sql
-- Tipo de movimiento: 1=Entrada, 2=Salida, 3=Ajuste, 4=Devolución
INSERT INTO Tipo_Movimiento (Descripcion) VALUES ('Entrada'),('Salida'),('Ajuste'),('Devolucion');

-- Inventario: stock actual por producto en cada ubicación
CREATE TABLE Inventario(
    Id_Inventario INT IDENTITY(1,1) PRIMARY KEY,
    Stock_Actual INT NOT NULL,
    Estado_Stock VARCHAR(30) NOT NULL,
    Id_Producto INT NOT NULL,
    Id_Ubicacion VARCHAR(20) NOT NULL,
    CONSTRAINT CK_Inventario_Stock CHECK(Stock_Actual >= 0)
);

-- Movimiento: cabecera del movimiento
CREATE TABLE Movimiento_Inventario(
    Id_Movimiento_Inventario INT IDENTITY(1,1) PRIMARY KEY,
    Fecha_Movimiento DATETIME2 NOT NULL DEFAULT GETDATE(),
    Observacion VARCHAR(300),
    Id_Usuario INT NOT NULL,
    Id_Tipo_Movimiento INT NOT NULL
);

-- Detalle: cantidad afectada en cada inventario
CREATE TABLE Detalle_Movimiento(
    Id_Detalle_Movimiento INT IDENTITY(1,1) PRIMARY KEY,
    Cantidad INT NOT NULL,
    Id_Movimiento_Inventario INT NOT NULL,
    Id_Inventario INT NOT NULL
);
```

**SP de entrada:**
```sql
CREATE PROCEDURE sp_RegistrarEntradaWMS
    @Codigo_Producto VARCHAR(50),
    @Cantidad INT,
    @Codigo_Ubicacion VARCHAR(20),
    @Id_Usuario INT,
    @Observacion VARCHAR(300)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @Id_Producto INT;
        SELECT @Id_Producto = Id_Producto FROM Producto WHERE Codigo_Producto = @Codigo_Producto;

        IF @Id_Producto IS NULL
            THROW 51006, 'El producto no existe.', 1;

        IF NOT EXISTS (SELECT 1 FROM Ubicacion WHERE Codigo_Ubicacion = @Codigo_Ubicacion)
            THROW 51007, 'La ubicacion no existe.', 1;

        IF @Cantidad <= 0
            THROW 51008, 'La cantidad de entrada debe ser mayor a cero.', 1;

        BEGIN TRANSACTION;

        DECLARE @Id_Inventario INT;
        SELECT @Id_Inventario = Id_Inventario
        FROM Inventario
        WHERE Id_Producto = @Id_Producto AND Id_Ubicacion = @Codigo_Ubicacion;

        -- Si no existe inventario en esa ubicación, lo crea
        IF @Id_Inventario IS NULL
        BEGIN
            INSERT INTO Inventario (Stock_Actual, Estado_Stock, Id_Producto, Id_Ubicacion)
            VALUES (@Cantidad, 'Disponible', @Id_Producto, @Codigo_Ubicacion);
            SET @Id_Inventario = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            -- Si ya existe, incrementa el stock
            UPDATE Inventario SET Stock_Actual = Stock_Actual + @Cantidad
            WHERE Id_Inventario = @Id_Inventario;
        END

        -- Registrar el movimiento
        INSERT INTO Movimiento_Inventario (Observacion, Id_Usuario, Id_Tipo_Movimiento)
        VALUES (COALESCE(@Observacion, 'Entrada de mercaderia de producto ' + @Codigo_Producto),
                @Id_Usuario, 1);  -- Tipo 1 = Entrada

        DECLARE @Id_Movimiento INT = SCOPE_IDENTITY();

        INSERT INTO Detalle_Movimiento (Cantidad, Id_Movimiento_Inventario, Id_Inventario)
        VALUES (@Cantidad, @Id_Movimiento, @Id_Inventario);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
```

### Flujo de interacción
1. Supervisor selecciona un producto en la lista (hace clic en la fila)
2. Se abre la página de detalle del producto
3. Hace clic en "Movimiento" → se abre el modal
4. Selecciona "Entrada", cantidad y motivo
5. Frontend llama `POST /api/products/movements` con `{ tipo_movimiento: "Entrada", codigo_producto, cantidad, codigo_ubicacion, observacion }`
6. Backend ejecuta `sp_RegistrarEntradaWMS` que:
   - Valida que el producto y ubicación existan
   - Si el producto ya tiene inventario en esa ubicación → incrementa el stock
   - Si no tiene inventario → crea un nuevo registro
   - Registra el movimiento con tipo "Entrada" (Id=1)
7. Se actualiza el stock mostrado en la página

### Triggers de protección
```sql
-- Impedir stock negativo
CREATE TRIGGER TR_ImpedirStockNegativo
ON Inventario
AFTER UPDATE, INSERT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM inserted WHERE Stock_Actual < 0)
    BEGIN
        RAISERROR ('No se permiten stocks negativos en el inventario.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;

-- Validar que la ubicación exista
CREATE TRIGGER TR_ValidarAsignacionUbicacion
ON Inventario
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM inserted i
        LEFT JOIN Ubicacion u ON i.Id_Ubicacion = u.Codigo_Ubicacion
        WHERE u.Codigo_Ubicacion IS NULL
    )
    BEGIN
        RAISERROR ('El producto debe ser asignado a una ubicacion fisica valida.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
```

---

## RF05 - Registro de Salidas de Inventario

### Qué hace
Registra la salida de mercadería del almacén. Descuenta el stock del producto **solo si hay suficiente stock disponible**. Crea un registro de movimiento para auditoría.

### SQL que lo soporta

**SP de salida:**
```sql
CREATE PROCEDURE sp_RegistrarSalidaWMS
    @Codigo_Producto VARCHAR(50),
    @Cantidad INT,
    @Codigo_Ubicacion VARCHAR(20),
    @Id_Usuario INT,
    @Observacion VARCHAR(300)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @Id_Producto INT;
        SELECT @Id_Producto = Id_Producto FROM Producto WHERE Codigo_Producto = @Codigo_Producto;

        IF @Id_Producto IS NULL
            THROW 51009, 'El producto no existe.', 1;

        IF NOT EXISTS (SELECT 1 FROM Ubicacion WHERE Codigo_Ubicacion = @Codigo_Ubicacion)
            THROW 51010, 'La ubicacion no existe.', 1;

        IF @Cantidad <= 0
            THROW 51011, 'La cantidad de salida debe ser mayor a cero.', 1;

        BEGIN TRANSACTION;

        DECLARE @Id_Inventario INT;
        DECLARE @Stock_Actual INT;
        SELECT @Id_Inventario = Id_Inventario, @Stock_Actual = Stock_Actual
        FROM Inventario
        WHERE Id_Producto = @Id_Producto AND Id_Ubicacion = @Codigo_Ubicacion;

        -- VALIDACIÓN CLAVE: No permitir salida si no hay stock suficiente
        IF @Id_Inventario IS NULL OR @Stock_Actual < @Cantidad
            THROW 51012, 'No hay stock suficiente en la ubicacion indicada.', 1;

        -- Descontar stock
        UPDATE Inventario SET Stock_Actual = Stock_Actual - @Cantidad
        WHERE Id_Inventario = @Id_Inventario;

        -- Registrar el movimiento
        INSERT INTO Movimiento_Inventario (Observacion, Id_Usuario, Id_Tipo_Movimiento)
        VALUES (COALESCE(@Observacion, 'Salida de mercaderia de producto ' + @Codigo_Producto),
                @Id_Usuario, 2);  -- Tipo 2 = Salida

        DECLARE @Id_Movimiento INT = SCOPE_IDENTITY();

        INSERT INTO Detalle_Movimiento (Cantidad, Id_Movimiento_Inventario, Id_Inventario)
        VALUES (@Cantidad, @Id_Movimiento, @Id_Inventario);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
```

**SP de devoluciones (similar a entrada pero con tipo 4):**
```sql
CREATE PROCEDURE sp_RegistrarDevolucionWMS
    @Codigo_Producto VARCHAR(50),
    @Cantidad INT,
    @Codigo_Ubicacion VARCHAR(20),
    @Id_Usuario INT,
    @Observacion VARCHAR(300)
AS
BEGIN
    -- ... validaciones similares ...

    -- Incrementar stock (igual que entrada)
    UPDATE Inventario SET Stock_Actual = Stock_Actual + @Cantidad WHERE Id_Inventario = @Id_Inventario;

    -- Tipo 4 = Devolución
    INSERT INTO Movimiento_Inventario (Observacion, Id_Usuario, Id_Tipo_Movimiento)
    VALUES (COALESCE(@Observacion, 'Devolucion de producto ' + @Codigo_Producto), @Id_Usuario, 4);
END;
```

### Flujo de interacción
1. Mismo flujo que RF04 pero seleccionando "Salida" en el tipo de movimiento
2. La diferencia clave está en la validación SQL: **`sp_RegistrarSalidaWMS` verifica que `@Stock_Actual >= @Cantidad` antes de descontar**
3. Si no hay stock suficiente, el SP lanza un error que llega al frontend como alerta
4. Si hay stock, descuenta y registra el movimiento con tipo "Salida" (Id=2)

### Diferencia entre entrada y salida
| | Entrada (RF04) | Salida (RF05) |
|---|---|---|
| Stock | Se incrementa | Se descuenta |
| Validación stock | Ninguna (siempre puede entrar) | Debe haber stock suficiente |
| Id_Tipo_Movimiento | 1 | 2 |
| Si no existe inventario | Lo crea | Lanza error |

---

## RF07 - Consulta de Inventario en Tiempo Real

### Qué hace
Permite consultar el estado actual del inventario: qué productos hay, cuánto stock tienen, dónde están ubicados, y si están por debajo del mínimo. Todo se actualiza en tiempo real porque consulta directamente la vista materializada.

### SQL que lo soporta

**Vista principal (consultada por el frontend):**
```sql
CREATE VIEW vw_StockTiempoReal AS
SELECT
    p.Id_Producto,
    p.Codigo_Producto,
    p.Nombre_Producto,
    p.Descripcion,
    p.Precio,
    p.Stock_Minimo,
    p.Id_Categoria,
    p.Id_Marca,
    p.Imagen,
    c.Nombre_Categoria,
    m.Nombre_Marca,
    i.Stock_Actual,
    i.Estado_Stock,
    i.Id_Ubicacion AS Codigo_Ubicacion,
    u.Pasillo,
    u.Estante,
    u.Nivel
FROM Inventario i
INNER JOIN Producto p ON i.Id_Producto = p.Id_Producto
INNER JOIN Categoria c ON p.Id_Categoria = c.Id_Categoria
LEFT JOIN Marca m ON p.Id_Marca = m.Id_Marca
INNER JOIN Ubicacion u ON i.Id_Ubicacion = u.Codigo_Ubicacion;
```

**Vista de historial de movimientos:**
```sql
CREATE VIEW vw_HistorialMovimientos AS
SELECT
    mi.Id_Movimiento_Inventario,
    mi.Fecha_Movimiento,
    tm.Descripcion AS Tipo_Movimiento,
    p.Codigo_Producto,
    p.Nombre_Producto,
    dm.Cantidad,
    i.Id_Ubicacion AS Codigo_Ubicacion,
    u.Nombre AS Usuario_Responsable,
    mi.Observacion
FROM Detalle_Movimiento dm
INNER JOIN Movimiento_Inventario mi ON dm.Id_Movimiento_Inventario = mi.Id_Movimiento_Inventario
INNER JOIN Tipo_Movimiento tm ON mi.Id_Tipo_Movimiento = tm.Id_Tipo_Movimiento
INNER JOIN Inventario i ON dm.Id_Inventario = i.Id_Inventario
INNER JOIN Producto p ON i.Id_Producto = p.Id_Producto
INNER JOIN Usuario u ON mi.Id_Usuario = u.Id_Usuario;
```

**Vista de estado de pedidos:**
```sql
CREATE VIEW vw_EstadoActualPedidos AS
SELECT
    p.Id_Pedido,
    p.Fecha_Pedido,
    c.Nombre AS Cliente,
    ep.Descripcion AS Estado_Pedido,
    p.Precio_Total,
    (SELECT COUNT(*) FROM Detalle_Pedido dp WHERE dp.Id_Pedido = p.Id_Pedido) AS Total_Lineas,
    (SELECT SUM(dp.Cantidad) FROM Detalle_Pedido dp WHERE dp.Id_Pedido = p.Id_Pedido) AS Total_Unidades
FROM Pedido p
INNER JOIN Cliente c ON p.Id_Cliente = c.Id_Cliente
INNER JOIN Estado_Pedido ep ON p.Id_Estado_Pedido = ep.Id_Estado_Pedido;
```

**SP de reporte de bajo stock:**
```sql
CREATE PROCEDURE sp_ReporteProductosBajoStock
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        p.Codigo_Producto, p.Nombre_Producto, c.Nombre_Categoria, p.Stock_Minimo,
        COALESCE(SUM(i.Stock_Actual), 0) AS Stock_Total_Actual,
        CASE
            WHEN COALESCE(SUM(i.Stock_Actual), 0) = 0 THEN 'Sin Stock'
            WHEN COALESCE(SUM(i.Stock_Actual), 0) <= p.Stock_Minimo THEN 'Alerta: Bajo Stock'
            ELSE 'Disponible'
        END AS Estado_Alerta
    FROM Producto p
    INNER JOIN Categoria c ON p.Id_Categoria = c.Id_Categoria
    LEFT JOIN Inventario i ON p.Id_Producto = i.Id_Producto
    GROUP BY p.Codigo_Producto, p.Nombre_Producto, c.Nombre_Categoria, p.Stock_Minimo
    HAVING COALESCE(SUM(i.Stock_Actual), 0) <= p.Stock_Minimo
    ORDER BY Stock_Total_Actual ASC;
END;
```

### Flujo de interacción
1. Al abrir la página de Productos, el frontend ejecuta `GET /api/products`
2. Backend ejecuta `SELECT * FROM vw_StockTiempoReal`
3. La vista retorna todos los productos con su stock actual, categoría, marca, precio, ubicación e imagen
4. El frontend calcula el estado en JavaScript:
   - `Stock_Actual === 0` → "Agotado" (rojo)
   - `Stock_Actual <= Stock_Minimo` → "Bajo Stock" (amarillo)
   - `Stock_Actual > Stock_Minimo` → "En Stock" (verde)
5. Al hacer clic en un producto, se carga su detalle con `GET /api/products/sku/{sku}`
6. Los movimientos se registran y el stock se actualiza inmediatamente porque la vista consulta la tabla `Inventario` en tiempo real

### Cálculo de estados en el frontend
```javascript
const stock = Number(p.Stock_Actual) || 0;
const min = Number(p.Stock_Minimo) || 0;
const status = stock === 0 ? "Agotado"
             : stock <= min ? "Bajo Stock"
             : "En Stock";
```

---

## RF13 - Validación de Stock antes de Confirmar Pedido

### Qué hace
Cuando se confirma un pedido (avanza de "Pendiente" a "En Proceso"), el sistema verifica que **todos los productos del pedido tengan stock suficiente**. Si alguno no tiene, rechaza la operación y muestra cuáles productos tienen stock insuficiente.

### SQL que lo soporta

**SP de validación y avance de pedido:**
```sql
CREATE PROCEDURE sp_AvanzarPedidoWMS
    @Id_Pedido INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Pedido WHERE Id_Pedido = @Id_Pedido)
            THROW 51040, 'El pedido no existe.', 1;

        DECLARE @Estado_Actual VARCHAR(50);
        SELECT @Estado_Actual = ep.Descripcion
        FROM Pedido p
        INNER JOIN Estado_Pedido ep ON p.Id_Estado_Pedido = ep.Id_Estado_Pedido
        WHERE p.Id_Pedido = @Id_Pedido;

        IF @Estado_Actual = 'Completado'
            THROW 51041, 'El pedido ya esta completado.', 1;

        IF @Estado_Actual = 'Cancelado'
            THROW 51042, 'El pedido esta cancelado y no puede avanzar.', 1;

        -- ========================================
        -- VALIDACIÓN DE STOCK (solo al pasar de Pendiente a En Proceso)
        -- ========================================
        IF @Estado_Actual = 'Pendiente'
        BEGIN
            DECLARE @ItemsSinStock TABLE (
                Codigo_Producto VARCHAR(50),
                Nombre_Producto VARCHAR(120),
                Cantidad_Solicitada INT,
                Stock_Disponible INT
            );

            -- Buscar items donde el stock disponible es menor a lo solicitado
            INSERT INTO @ItemsSinStock
            SELECT
                pr.Codigo_Producto,
                pr.Nombre_Producto,
                dp.Cantidad AS Cantidad_Solicitada,
                COALESCE(SUM(i.Stock_Actual), 0) AS Stock_Disponible
            FROM Detalle_Pedido dp
            INNER JOIN Producto pr ON dp.Id_Producto = pr.Id_Producto
            LEFT JOIN Inventario i ON pr.Id_Producto = i.Id_Producto
            WHERE dp.Id_Pedido = @Id_Pedido
            GROUP BY pr.Codigo_Producto, pr.Nombre_Producto, dp.Cantidad
            HAVING COALESCE(SUM(i.Stock_Actual), 0) < dp.Cantidad;

            -- Si hay items sin stock, rechazar
            IF EXISTS (SELECT 1 FROM @ItemsSinStock)
            BEGIN
                DECLARE @mensaje NVARCHAR(500) = 'Stock insuficiente para: ';
                SELECT @mensaje = @mensaje + Codigo_Producto + ' (' + Nombre_Producto + ') - Solicitado: ' +
                    CAST(Cantidad_Solicitada AS VARCHAR) + ', Disponible: ' + CAST(Stock_Disponible AS VARCHAR) + '; '
                FROM @ItemsSinStock;
                THROW 51043, @mensaje, 1;
            END
        END

        BEGIN TRANSACTION;

        -- Avanzar al siguiente estado (1→2, 2→3)
        UPDATE Pedido
        SET Id_Estado_Pedido = Id_Estado_Pedido + 1
        WHERE Id_Pedido = @Id_Pedido;

        COMMIT TRANSACTION;

        SELECT p.Id_Pedido, ep.Descripcion AS Nuevo_Estado
        FROM Pedido p
        INNER JOIN Estado_Pedido ep ON p.Id_Estado_Pedido = ep.Id_Estado_Pedido
        WHERE p.Id_Pedido = @Id_Pedido;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
```

**SP para crear pedidos con items (recibe JSON):**
```sql
CREATE PROCEDURE sp_CrearPedidoWMS
    @Id_Cliente INT,
    @Items NVARCHAR(MAX)  -- JSON: [{"Id_Producto":1,"Cantidad":2,"Precio_Unitario":3500.00}, ...]
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Cliente WHERE Id_Cliente = @Id_Cliente)
            THROW 51044, 'El cliente especificado no existe.', 1;

        BEGIN TRANSACTION;

        -- Crear pedido en estado Pendiente (Id_Estado_Pedido = 1)
        INSERT INTO Pedido (Precio_Total, Id_Cliente, Id_Estado_Pedido)
        VALUES (0, @Id_Cliente, 1);

        DECLARE @Nuevo_Pedido INT = SCOPE_IDENTITY();

        -- Insertar items desde JSON usando OPENJSON
        INSERT INTO Detalle_Pedido (Cantidad, Subtotal, Precio_Unitario, Id_Pedido, Id_Producto)
        SELECT
            json_items.Cantidad,
            json_items.Cantidad * json_items.Precio_Unitario AS Subtotal,
            json_items.Precio_Unitario,
            @Nuevo_Pedido,
            json_items.Id_Producto
        FROM OPENJSON(@Items)
        WITH (
            Id_Producto INT '$.Id_Producto',
            Cantidad INT '$.Cantidad',
            Precio_Unitario DECIMAL(10,2) '$.Precio_Unitario'
        ) AS json_items;

        -- Actualizar precio total
        UPDATE Pedido
        SET Precio_Total = (SELECT SUM(Subtotal) FROM Detalle_Pedido WHERE Id_Pedido = @Nuevo_Pedido)
        WHERE Id_Pedido = @Nuevo_Pedido;

        COMMIT TRANSACTION;

        SELECT @Nuevo_Pedido AS Id_Pedido;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
```

### Estados del pedido
```sql
INSERT INTO Estado_Pedido (Descripcion) VALUES
    ('Pendiente'),    -- Id = 1
    ('En Proceso'),   -- Id = 2
    ('Completado'),   -- Id = 3
    ('Cancelado');    -- Id = 4
```

### Flujo de interacción
1. Supervisor crea un pedido seleccionando cliente y productos
2. Frontend llama `POST /api/orders` con `{ clienteId, items: [{Id_Producto, Cantidad, Precio_Unitario}] }`
3. Backend ejecuta `sp_CrearPedidoWMS` que:
   - Valida que el cliente exista
   - Crea el pedido en estado "Pendiente" (Id=1)
   - Inserta los items usando `OPENJSON` (SQL Server parsea el JSON directamente)
   - Calcula el precio total sumando subtotales
4. Para avanzar el pedido, frontend llama `POST /api/orders/{id}/advance`
5. Backend ejecuta `sp_AvanzarPedidoWMS` que:
   - Lee el estado actual del pedido
   - Si está "Pendiente" → **valida stock de cada item** consultando `Inventario`
   - Si hay stock insuficiente → lanza error con mensaje descriptivo
   - Si todo está bien → incrementa el estado (Pendiente→En Proceso)
   - El avance de En Proceso→Completado no valida stock (ya se despachó)
6. El frontend muestra el nuevo estado con los colores:
   - Pendiente = azul
   - En Proceso = morado
   - Completado = verde
   - Cancelado = rojo

### Ejemplo de validación fallida
Si el Pedido 3 tiene 1 taladro Bosch (stock disponible: 5) y solicita 10:
```
Error: Stock insuficiente para: PROD006 (Taladro Bosch GSB13) - Solicitado: 10, Disponible: 5;
```

### Validación SQL paso a paso
```sql
-- 1. Obtener items del pedido y su stock disponible
SELECT
    pr.Codigo_Producto,
    pr.Nombre_Producto,
    dp.Cantidad AS Cantidad_Solicitada,
    COALESCE(SUM(i.Stock_Actual), 0) AS Stock_Disponible
FROM Detalle_Pedido dp
INNER JOIN Producto pr ON dp.Id_Producto = pr.Id_Producto
LEFT JOIN Inventario i ON pr.Id_Producto = i.Id_Producto
WHERE dp.Id_Pedido = 3
GROUP BY pr.Codigo_Producto, pr.Nombre_Producto, dp.Cantidad
HAVING COALESCE(SUM(i.Stock_Actual), 0) < dp.Cantidad;
-- Retorna filas = hay productos sin stock suficiente → RECHAZAR
-- No retorna filas = todo OK → AVANZAR
```

---

## RF16 - Actualización de Productos

### SQL que lo soporta

```sql
CREATE PROCEDURE sp_ActualizarProductoWMS
    @Id_Producto INT,
    @Nombre_Producto VARCHAR(120),
    @Descripcion VARCHAR(300),
    @Precio DECIMAL(10,2),
    @Stock_Minimo INT,
    @Id_Categoria INT,
    @Id_Marca INT = NULL,
    @Imagen VARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Producto WHERE Id_Producto = @Id_Producto)
            THROW 51019, 'El producto a actualizar no existe.', 1;

        IF NOT EXISTS (SELECT 1 FROM Categoria WHERE Id_Categoria = @Id_Categoria)
            THROW 51020, 'La categoria especificada no existe.', 1;

        BEGIN TRANSACTION;
        UPDATE Producto
        SET Nombre_Producto = @Nombre_Producto, Descripcion = @Descripcion,
            Precio = @Precio, Stock_Minimo = @Stock_Minimo, Id_Categoria = @Id_Categoria,
            Id_Marca = @Id_Marca, Imagen = @Imagen
        WHERE Id_Producto = @Id_Producto;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
```

**Trigger de historial de precios (se ejecuta automáticamente al actualizar):**
```sql
CREATE TRIGGER TR_HistorialPrecio
ON Producto
AFTER UPDATE
AS
BEGIN
    INSERT INTO Historial_Precio (Id_Producto, Precio_Anterior, Precio_Nuevo)
    SELECT d.Id_Producto, d.Precio, i.Precio
    FROM deleted d
    INNER JOIN inserted i ON d.Id_Producto = i.Id_Producto
    WHERE d.Precio <> i.Precio;
END;
```

### Flujo
1. Supervisor abre `/products/{sku}/edit`
2. Frontend carga los datos con `GET /api/products/sku/{sku}`
3. Edita campos (nombre, precio, categoría, marca, imagen, etc.)
4. Frontend llama `PUT /api/products/{id}`
5. Backend ejecuta `sp_ActualizarProductoWMS`
6. Si cambió el precio → el trigger `TR_HistorialPrecio` guarda el precio anterior y nuevo en `Historial_Precio`

---

## Triggers - Reglas de Negocio Automáticas

### 1. Impedir stock negativo
```sql
CREATE TRIGGER TR_ImpedirStockNegativo
ON Inventario
AFTER UPDATE, INSERT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM inserted WHERE Stock_Actual < 0)
    BEGIN
        RAISERROR ('No se permiten stocks negativos en el inventario.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
```
**Protege:** Cualquier intento de poner stock por debajo de 0, ya sea por salida, ajuste o error.

### 2. Validar ubicación
```sql
CREATE TRIGGER TR_ValidarAsignacionUbicacion
ON Inventario
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM inserted i
        LEFT JOIN Ubicacion u ON i.Id_Ubicacion = u.Codigo_Ubicacion
        WHERE u.Codigo_Ubicacion IS NULL
    )
    BEGIN
        RAISERROR ('El producto debe ser asignado a una ubicacion fisica valida.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
```
**Protege:** Un producto no puede ser asignado a una ubicación que no existe.

### 3. Auditoría de productos
```sql
CREATE TRIGGER TR_Auditoria_Producto
ON Producto
AFTER INSERT
AS
BEGIN
    INSERT INTO Auditoria_Sistema (Tabla_Afectada, Accion, Descripcion, Id_Usuario)
    SELECT 'Producto', 'INSERT', 'Se registro un nuevo producto.', 1 FROM inserted;
END;
```
**Registra:** Cada producto nuevo queda en la tabla de auditoría.

### 4. Historial de precios
```sql
CREATE TRIGGER TR_HistorialPrecio
ON Producto
AFTER UPDATE
AS
BEGIN
    INSERT INTO Historial_Precio (Id_Producto, Precio_Anterior, Precio_Nuevo)
    SELECT d.Id_Producto, d.Precio, i.Precio
    FROM deleted d
    INNER JOIN inserted i ON d.Id_Producto = i.Id_Producto
    WHERE d.Precio <> i.Precio;
END;
```
**Registra:** Cada cambio de precio queda histórico con fecha.

---

## Resumen de Scripts SQL a Ejecutar

| Orden | Script | Qué crea |
|-------|--------|----------|
| 1 | `T-SQL-LIMPIO.sql` | Tablas, datos semilla, vistas, funciones, SPs base, triggers |
| 2 | `MARCAS.sql` | Tabla Marca, columna Id_Marca en Producto, SPs de marcas |
| 3 | `IMAGEN_SQL.sql` | Columna Imagen, SPs actualizados con imagen, vista mejorada |
| 4 | `PEDIDOS_SP.sql` | SPs de pedidos (avanzar + crear con JSON) |
