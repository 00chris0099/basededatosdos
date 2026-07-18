-- =====================================================
-- SCRIPT LIMPIO - WMS ECOMMERCE
-- Ejecutar completo en CloudBeaver
-- =====================================================

-- 1. CREAR BASE DE DATOS
-- Ejecutar esta linea primero de forma separada si la BD no existe:
-- CREATE DATABASE BD_WMS_ECOMMERCE;

USE BD_WMS_ECOMMERCE;
GO

-- 2. BORRAR OBJETOS EXISTENTES (si existieran)
DROP TRIGGER IF EXISTS TR_HistorialPrecio;
DROP TRIGGER IF EXISTS TR_Auditoria_Producto;
DROP TRIGGER IF EXISTS TR_NoEliminarCategoria;
DROP TRIGGER IF EXISTS TR_ValidarStockPedido;
DROP TRIGGER IF EXISTS TR_ImpedirStockNegativo;
DROP TRIGGER IF EXISTS TR_ValidarAsignacionUbicacion;
GO

DROP TABLE IF EXISTS Despacho;
DROP TABLE IF EXISTS Packing;
DROP TABLE IF EXISTS Picking;
DROP TABLE IF EXISTS Detalle_Pedido;
DROP TABLE IF EXISTS Pedido;
DROP TABLE IF EXISTS Detalle_Movimiento;
DROP TABLE IF EXISTS Movimiento_Inventario;
DROP TABLE IF EXISTS Inventario;
DROP TABLE IF EXISTS Historial_Precio;
DROP TABLE IF EXISTS Auditoria_Sistema;
DROP TABLE IF EXISTS Producto;
DROP TABLE IF EXISTS Cliente;
DROP TABLE IF EXISTS Ubicacion;
DROP TABLE IF EXISTS Marca;
DROP TABLE IF EXISTS Categoria;
DROP TABLE IF EXISTS Usuario;
DROP TABLE IF EXISTS Rol;
DROP TABLE IF EXISTS Tipo_Movimiento;
DROP TABLE IF EXISTS Estado_Pedido;
DROP TABLE IF EXISTS Estado_Picking;
DROP TABLE IF EXISTS Estado_Packing;
DROP TABLE IF EXISTS Estado_Despacho;
GO

-- =====================================================
-- 3. CREAR TABLAS
-- =====================================================

CREATE TABLE Rol(
    Id_Rol INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_Rol VARCHAR(50) NOT NULL
);
GO

CREATE TABLE Usuario(
    Id_Usuario INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Contrasena VARCHAR(255) NOT NULL,
    Telefono VARCHAR(15),
    Correo VARCHAR(100) NOT NULL UNIQUE,
    Id_Rol INT NOT NULL,
    CONSTRAINT FK_Usuario_Rol FOREIGN KEY(Id_Rol) REFERENCES Rol(Id_Rol)
);
GO

CREATE TABLE Auditoria_Sistema(
    Id_Auditoria INT IDENTITY(1,1) PRIMARY KEY,
    Tabla_Afectada VARCHAR(100) NOT NULL,
    Accion VARCHAR(20) NOT NULL,
    Descripcion VARCHAR(300),
    Fecha_Auditoria DATETIME2 NOT NULL DEFAULT GETDATE(),
    Id_Usuario INT NULL,
    CONSTRAINT FK_Auditoria_Usuario FOREIGN KEY(Id_Usuario) REFERENCES Usuario(Id_Usuario)
);
GO

CREATE TABLE Tipo_Movimiento(
    Id_Tipo_Movimiento INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion VARCHAR(50) NOT NULL
);
GO

CREATE TABLE Movimiento_Inventario(
    Id_Movimiento_Inventario INT IDENTITY(1,1) PRIMARY KEY,
    Fecha_Movimiento DATETIME2 NOT NULL DEFAULT GETDATE(),
    Observacion VARCHAR(300),
    Id_Usuario INT NOT NULL,
    Id_Tipo_Movimiento INT NOT NULL,
    CONSTRAINT FK_Movimiento_Usuario FOREIGN KEY(Id_Usuario) REFERENCES Usuario(Id_Usuario),
    CONSTRAINT FK_Movimiento_Tipo FOREIGN KEY(Id_Tipo_Movimiento) REFERENCES Tipo_Movimiento(Id_Tipo_Movimiento)
);
GO

CREATE TABLE Categoria(
    Id_Categoria INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_Categoria VARCHAR(80) NOT NULL UNIQUE
);
GO

CREATE TABLE Marca(
    Id_Marca INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_Marca VARCHAR(80) NOT NULL,
    Id_Categoria INT NOT NULL,
    CONSTRAINT UQ_Marca_Nombre_Categoria UNIQUE (Nombre_Marca, Id_Categoria),
    CONSTRAINT FK_Marca_Categoria FOREIGN KEY(Id_Categoria) REFERENCES Categoria(Id_Categoria)
);
GO

CREATE TABLE Producto(
    Id_Producto INT IDENTITY(1,1) PRIMARY KEY,
    Codigo_Producto VARCHAR(50) NOT NULL UNIQUE,
    Nombre_Producto VARCHAR(120) NOT NULL,
    Descripcion VARCHAR(300),
    Precio DECIMAL(10,2) NOT NULL,
    Stock_Minimo INT NOT NULL,
    Id_Categoria INT NOT NULL,
    Id_Marca INT NULL,
    CONSTRAINT CK_Producto_Precio CHECK(Precio > 0),
    CONSTRAINT CK_Producto_StockMinimo CHECK(Stock_Minimo >= 0),
    CONSTRAINT FK_Producto_Categoria FOREIGN KEY(Id_Categoria) REFERENCES Categoria(Id_Categoria),
    CONSTRAINT FK_Producto_Marca FOREIGN KEY(Id_Marca) REFERENCES Marca(Id_Marca)
);
GO

CREATE TABLE Ubicacion(
    Codigo_Ubicacion VARCHAR(20) PRIMARY KEY,
    Pasillo VARCHAR(20) NOT NULL,
    Estante VARCHAR(20) NOT NULL,
    Nivel VARCHAR(20) NOT NULL
);
GO

CREATE TABLE Inventario(
    Id_Inventario INT IDENTITY(1,1) PRIMARY KEY,
    Stock_Actual INT NOT NULL,
    Estado_Stock VARCHAR(30) NOT NULL,
    Id_Producto INT NOT NULL,
    Id_Ubicacion VARCHAR(20) NOT NULL,
    CONSTRAINT CK_Inventario_Stock CHECK(Stock_Actual >= 0),
    CONSTRAINT FK_Inventario_Producto FOREIGN KEY(Id_Producto) REFERENCES Producto(Id_Producto),
    CONSTRAINT FK_Inventario_Ubicacion FOREIGN KEY(Id_Ubicacion) REFERENCES Ubicacion(Codigo_Ubicacion)
);
GO

CREATE TABLE Detalle_Movimiento(
    Id_Detalle_Movimiento INT IDENTITY(1,1) PRIMARY KEY,
    Cantidad INT NOT NULL,
    Id_Movimiento_Inventario INT NOT NULL,
    Id_Inventario INT NOT NULL,
    CONSTRAINT CK_DetalleMovimiento_Cantidad CHECK(Cantidad > 0),
    CONSTRAINT FK_DetalleMovimiento_Movimiento FOREIGN KEY(Id_Movimiento_Inventario) REFERENCES Movimiento_Inventario(Id_Movimiento_Inventario),
    CONSTRAINT FK_DetalleMovimiento_Inventario FOREIGN KEY(Id_Inventario) REFERENCES Inventario(Id_Inventario)
);
GO

CREATE TABLE Cliente(
    Id_Cliente INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Num_Documento VARCHAR(20) NOT NULL UNIQUE,
    Telefono VARCHAR(15),
    Correo VARCHAR(100) UNIQUE,
    Direccion VARCHAR(200)
);
GO

CREATE TABLE Estado_Pedido(
    Id_Estado_Pedido INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion VARCHAR(50) NOT NULL
);
GO

CREATE TABLE Pedido(
    Id_Pedido INT IDENTITY(1,1) PRIMARY KEY,
    Fecha_Pedido DATETIME2 NOT NULL DEFAULT GETDATE(),
    Precio_Total DECIMAL(10,2) NOT NULL,
    Id_Cliente INT NOT NULL,
    Id_Estado_Pedido INT NOT NULL,
    CONSTRAINT CK_Pedido_Precio CHECK (Precio_Total >= 0),
    CONSTRAINT FK_Pedido_Cliente FOREIGN KEY(Id_Cliente) REFERENCES Cliente(Id_Cliente),
    CONSTRAINT FK_Pedido_Estado FOREIGN KEY(Id_Estado_Pedido) REFERENCES Estado_Pedido(Id_Estado_Pedido)
);
GO

CREATE TABLE Detalle_Pedido(
    Id_Detalle_Pedido INT IDENTITY(1,1) PRIMARY KEY,
    Cantidad INT NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    Precio_Unitario DECIMAL(10,2) NOT NULL,
    Id_Pedido INT NOT NULL,
    Id_Producto INT NOT NULL,
    CONSTRAINT CK_DetallePedido_Cantidad CHECK(Cantidad > 0),
    CONSTRAINT CK_DetallePedido_Precio CHECK(Precio_Unitario > 0),
    CONSTRAINT CK_DetallePedido_Subtotal CHECK(Subtotal >= 0),
    CONSTRAINT FK_DetallePedido_Pedido FOREIGN KEY(Id_Pedido) REFERENCES Pedido(Id_Pedido),
    CONSTRAINT FK_DetallePedido_Producto FOREIGN KEY(Id_Producto) REFERENCES Producto(Id_Producto)
);
GO

CREATE TABLE Estado_Picking(
    Id_Estado_Picking INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion VARCHAR(50) NOT NULL
);
GO

CREATE TABLE Picking(
    Id_Picking INT IDENTITY(1,1) PRIMARY KEY,
    Fecha_Picking DATETIME2 NOT NULL DEFAULT GETDATE(),
    Id_Pedido INT NOT NULL,
    Id_Estado_Picking INT NOT NULL,
    CONSTRAINT FK_Picking_Pedido FOREIGN KEY(Id_Pedido) REFERENCES Pedido(Id_Pedido),
    CONSTRAINT FK_Picking_Estado FOREIGN KEY(Id_Estado_Picking) REFERENCES Estado_Picking(Id_Estado_Picking)
);
GO

CREATE TABLE Estado_Packing(
    Id_Estado_Packing INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion VARCHAR(50) NOT NULL
);
GO

CREATE TABLE Packing(
    Id_Packing INT IDENTITY(1,1) PRIMARY KEY,
    Fecha_Packing DATETIME2 NOT NULL DEFAULT GETDATE(),
    Id_Picking INT NOT NULL,
    Id_Estado_Packing INT NOT NULL,
    CONSTRAINT FK_Packing_Picking FOREIGN KEY(Id_Picking) REFERENCES Picking(Id_Picking),
    CONSTRAINT FK_Packing_Estado FOREIGN KEY(Id_Estado_Packing) REFERENCES Estado_Packing(Id_Estado_Packing)
);
GO

CREATE TABLE Estado_Despacho(
    Id_Estado_Despacho INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion VARCHAR(50) NOT NULL
);
GO

CREATE TABLE Despacho(
    Id_Despacho INT IDENTITY(1,1) PRIMARY KEY,
    Direccion_Envio VARCHAR(250) NOT NULL,
    Fecha_Despacho DATETIME2 NOT NULL DEFAULT GETDATE(),
    Id_Packing INT NOT NULL,
    Id_Estado_Despacho INT NOT NULL,
    CONSTRAINT FK_Despacho_Packing FOREIGN KEY(Id_Packing) REFERENCES Packing(Id_Packing),
    CONSTRAINT FK_Despacho_Estado FOREIGN KEY(Id_Estado_Despacho) REFERENCES Estado_Despacho(Id_Estado_Despacho)
);
GO

CREATE TABLE Historial_Precio(
    Id_Historial INT IDENTITY PRIMARY KEY,
    Id_Producto INT,
    Precio_Anterior DECIMAL(10,2),
    Precio_Nuevo DECIMAL(10,2),
    Fecha DATETIME DEFAULT GETDATE()
);
GO

-- =====================================================
-- 4. INSERTAR DATOS INICIALES
-- =====================================================

INSERT INTO Rol (Nombre_Rol) VALUES ('Administrador'),('Supervisor'),('Operario');
GO

INSERT INTO Usuario (Nombre, Contrasena, Telefono, Correo, Id_Rol)
VALUES
('Juan Perez','Admin2025#','987654321','juan.perez@almacen.com',1),
('Maria Lopez','Super2025#','912345678','maria.lopez@almacen.com',2),
('Carlos Ruiz','Oper2025#','998877665','carlos.ruiz@almacen.com',3),
('Ana Torres','Oper2025#','956321478','ana.torres@almacen.com',3),
('Luis Gomez','Super2025#','945123789','luis.gomez@almacen.com',2);
GO

INSERT INTO Tipo_Movimiento (Descripcion) VALUES ('Entrada'),('Salida'),('Ajuste'),('Devolucion');
GO

INSERT INTO Categoria (Nombre_Categoria) VALUES ('Electronica'),('Oficina'),('Herramientas'),('Accesorios'),('Limpieza');
GO

INSERT INTO Marca (Nombre_Marca, Id_Categoria) VALUES
('Samsung',1),('LG',1),('Sony',1),('Apple',1),('Xiaomi',1),('Lenovo',1),('Dell',1),('HP',1),
('Epson',2),('Brother',2),('Canon',2),('Xerox',2),('3M',2),('Pilot',2),
('Bosch',3),('DeWalt',3),('Makita',3),('Black+Decker',3),('Stanley',3),('Milwaukee',3),('Ingco',3),
('Logitech',4),('Baseus',4),('Anker',4),('Kingston',4),('SanDisk',4),('Corsair',4),
('Oxi',5),('Fabuloso',5),('Clorox',5),('Ajax',5),('Pinol',5);
GO

INSERT INTO Ubicacion (Codigo_Ubicacion,Pasillo,Estante,Nivel)
VALUES ('A101','A','01','1'),('A102','A','01','2'),('A201','A','02','1'),('B101','B','01','1'),('C101','C','01','1');
GO

INSERT INTO Cliente (Nombre,Num_Documento,Telefono,Correo,Direccion)
VALUES
('Empresa ABC SAC','20111111111','987111111','ventas@abc.com','Av. Peru 1500'),
('Tecnologia Peru SAC','20456789123','987222222','compras@tecperu.com','Av. Arequipa 250'),
('Comercial Los Andes','20567891234','987333333','contacto@andes.com','Jr. Lima 540'),
('Importadora Global','20678912345','987444444','ventas@global.com','Av. Colonial 780'),
('Distribuidora Norte','20789123456','987555555','info@norte.com','Av. Universitaria 1200');
GO

INSERT INTO Estado_Pedido (Descripcion) VALUES ('Pendiente'),('En Proceso'),('Completado'),('Cancelado');
GO

INSERT INTO Estado_Picking (Descripcion) VALUES ('Pendiente'),('En Proceso'),('Finalizado');
GO

INSERT INTO Estado_Packing (Descripcion) VALUES ('Pendiente'),('Empacado'),('Finalizado');
GO

INSERT INTO Estado_Despacho (Descripcion) VALUES ('Pendiente'),('En Ruta'),('Entregado');
GO

INSERT INTO Producto (Codigo_Producto,Nombre_Producto,Descripcion,Precio,Stock_Minimo,Id_Categoria)
VALUES
('PROD001','Laptop Dell Inspiron','Laptop Core i7 16GB RAM',3500.00,10,1),
('PROD002','Monitor LG 24','Monitor LED Full HD',750.00,8,1),
('PROD003','Teclado Logitech K120','Teclado USB',60.00,20,4),
('PROD004','Mouse Logitech M170','Mouse inalambrico',55.00,20,4),
('PROD005','Impresora Epson L3250','Impresora multifuncional',950.00,5,2),
('PROD006','Taladro Bosch GSB13','Taladro percutor',420.00,6,3),
('PROD007','Martillo Stanley','Martillo de acero',45.00,15,3),
('PROD008','Escoba Industrial','Escoba de cerdas resistentes',35.00,10,5);
GO

INSERT INTO Inventario (Stock_Actual,Estado_Stock,Id_Producto,Id_Ubicacion)
VALUES
(30,'Disponible',1,'A101'),
(18,'Disponible',2,'A102'),
(80,'Disponible',3,'A201'),
(65,'Disponible',4,'A201'),
(10,'Disponible',5,'B101'),
(25,'Disponible',6,'B101'),
(40,'Disponible',7,'C101'),
(12,'Disponible',8,'C101');
GO

INSERT INTO Movimiento_Inventario (Observacion,Id_Usuario,Id_Tipo_Movimiento)
VALUES
('Ingreso inicial de productos',1,1),
('Venta de productos',3,2),
('Correccion de inventario',2,3),
('Ingreso por compra',1,1),
('Salida por despacho',4,2);
GO

INSERT INTO Pedido (Precio_Total,Id_Cliente,Id_Estado_Pedido)
VALUES (7060.00,1,3),(950.00,2,2),(475.00,3,1),(165.00,4,1),(420.00,5,2);
GO

INSERT INTO Picking (Id_Pedido,Id_Estado_Picking) VALUES (1,3),(2,2),(3,1),(4,1),(5,2);
GO

INSERT INTO Packing (Id_Picking,Id_Estado_Packing) VALUES (1,3),(2,2),(3,1),(4,1),(5,2);
GO

INSERT INTO Despacho (Direccion_Envio,Id_Packing,Id_Estado_Despacho)
VALUES ('Av. Peru 1500',1,3),('Av. Arequipa 250',2,2),('Jr. Lima 540',3,1),('Av. Colonial 780',4,1),('Av. Universitaria 1200',5,2);
GO

INSERT INTO Detalle_Movimiento (Cantidad,Id_Movimiento_Inventario,Id_Inventario)
VALUES (30,1,1),(2,2,1),(5,3,5),(20,4,6),(4,5,2);
GO

INSERT INTO Detalle_Pedido (Cantidad,Subtotal,Precio_Unitario,Id_Pedido,Id_Producto)
VALUES (2,7000.00,3500.00,1,1),(1,60.00,60.00,1,3),(1,950.00,950.00,2,5),(1,420.00,420.00,3,6),(1,55.00,55.00,3,4),(3,165.00,55.00,4,4),(1,420.00,420.00,5,6);
GO

-- =====================================================
-- 5. BORRAR Y CREAR VISTAS
-- =====================================================

DROP VIEW IF EXISTS vw_ReporteInventario;
DROP VIEW IF EXISTS vw_ReportePedidos;
DROP VIEW IF EXISTS vw_ReporteProductos;
DROP VIEW IF EXISTS vw_Usuarios;
DROP VIEW IF EXISTS vw_Clientes;
DROP VIEW IF EXISTS vw_ProductoActualizable;
DROP VIEW IF EXISTS vw_CategoriaActualizable;
DROP VIEW IF EXISTS vw_StockTiempoReal;
DROP VIEW IF EXISTS vw_HistorialMovimientos;
DROP VIEW IF EXISTS vw_EstadoActualPedidos;
GO

CREATE OR ALTER VIEW vw_ReporteInventario AS
SELECT p.Nombre_Producto, c.Nombre_Categoria, i.Stock_Actual, p.Stock_Minimo, u.Codigo_Ubicacion
FROM Producto p
INNER JOIN Categoria c ON p.Id_Categoria = c.Id_Categoria
INNER JOIN Inventario i ON p.Id_Producto = i.Id_Producto
INNER JOIN Ubicacion u ON i.Id_Ubicacion = u.Codigo_Ubicacion;
GO

CREATE OR ALTER VIEW vw_ReportePedidos AS
SELECT p.Id_Pedido, c.Nombre AS Cliente, ep.Descripcion AS Estado, p.Precio_Total, p.Fecha_Pedido
FROM Pedido p
INNER JOIN Cliente c ON p.Id_Cliente = c.Id_Cliente
INNER JOIN Estado_Pedido ep ON p.Id_Estado_Pedido = ep.Id_Estado_Pedido;
GO

CREATE OR ALTER VIEW vw_ReporteProductos AS
SELECT p.Nombre_Producto, c.Nombre_Categoria, p.Precio, p.Stock_Minimo
FROM Producto p
INNER JOIN Categoria c ON p.Id_Categoria = c.Id_Categoria;
GO

CREATE OR ALTER VIEW vw_Usuarios AS
SELECT u.Id_Usuario, u.Nombre, u.Telefono, u.Correo, r.Nombre_Rol
FROM Usuario u
INNER JOIN Rol r ON u.Id_Rol = r.Id_Rol;
GO

CREATE OR ALTER VIEW vw_Clientes AS
SELECT Id_Cliente, Nombre, Telefono, Correo FROM Cliente;
GO

CREATE OR ALTER VIEW vw_ProductoActualizable AS
SELECT Id_Producto, Nombre_Producto, Descripcion, Precio, Stock_Minimo, Id_Categoria FROM Producto;
GO

CREATE OR ALTER VIEW vw_CategoriaActualizable AS
SELECT Id_Categoria, Nombre_Categoria FROM Categoria;
GO

-- =====================================================
-- 6. VISTAS WMS (RF-07, RF-08, RF-09)
-- =====================================================

CREATE OR ALTER VIEW vw_StockTiempoReal AS
SELECT
    p.Codigo_Producto,
    p.Nombre_Producto,
    c.Nombre_Categoria,
    i.Stock_Actual,
    p.Stock_Minimo,
    i.Estado_Stock,
    i.Id_Ubicacion AS Codigo_Ubicacion,
    u.Pasillo,
    u.Estante,
    u.Nivel
FROM Inventario i
INNER JOIN Producto p ON i.Id_Producto = p.Id_Producto
INNER JOIN Categoria c ON p.Id_Categoria = c.Id_Categoria
INNER JOIN Ubicacion u ON i.Id_Ubicacion = u.Codigo_Ubicacion;
GO

CREATE OR ALTER VIEW vw_HistorialMovimientos AS
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
GO

CREATE OR ALTER VIEW vw_EstadoActualPedidos AS
SELECT
    p.Id_Pedido,
    p.Fecha_Pedido,
    c.Nombre AS Cliente,
    c.Num_Documento AS Documento_Cliente,
    ep.Descripcion AS Estado_Pedido,
    p.Precio_Total,
    (SELECT COUNT(*) FROM Detalle_Pedido dp WHERE dp.Id_Pedido = p.Id_Pedido) AS Total_Lineas,
    (SELECT SUM(dp.Cantidad) FROM Detalle_Pedido dp WHERE dp.Id_Pedido = p.Id_Pedido) AS Total_Unidades
FROM Pedido p
INNER JOIN Cliente c ON p.Id_Cliente = c.Id_Cliente
INNER JOIN Estado_Pedido ep ON p.Id_Estado_Pedido = ep.Id_Estado_Pedido;
GO

-- =====================================================
-- 7. INDICES
-- =====================================================

CREATE NONCLUSTERED INDEX IX_Producto_Nombre ON Producto(Nombre_Producto);
GO
CREATE NONCLUSTERED INDEX IX_Cliente_Documento ON Cliente(Num_Documento);
GO
CREATE NONCLUSTERED INDEX IX_Pedido_Fecha ON Pedido(Fecha_Pedido);
GO

-- =====================================================
-- 8. BORRAR Y CREAR FUNCIONES
-- =====================================================

DROP FUNCTION IF EXISTS fn_CalcularSubtotal;
DROP FUNCTION IF EXISTS fn_EstadoStock;
DROP FUNCTION IF EXISTS fn_ProductosCategoria;
DROP FUNCTION IF EXISTS fn_PedidosCliente;
GO

CREATE FUNCTION fn_CalcularSubtotal(@Cantidad INT, @Precio DECIMAL(10,2))
RETURNS DECIMAL(10,2)
AS
BEGIN
    RETURN @Cantidad * @Precio
END;
GO

CREATE FUNCTION fn_EstadoStock(@StockActual INT, @StockMinimo INT)
RETURNS VARCHAR(30)
AS
BEGIN
    DECLARE @Estado VARCHAR(30)
    IF @StockActual <= @StockMinimo
        SET @Estado = 'Stock Critico'
    ELSE
        SET @Estado = 'Disponible'
    RETURN @Estado
END;
GO

CREATE FUNCTION fn_ProductosCategoria(@IdCategoria INT)
RETURNS TABLE
AS
RETURN (SELECT Nombre_Producto, Precio FROM Producto WHERE Id_Categoria = @IdCategoria);
GO

CREATE FUNCTION fn_PedidosCliente(@IdCliente INT)
RETURNS TABLE
AS
RETURN (SELECT Id_Pedido, Fecha_Pedido, Precio_Total FROM Pedido WHERE Id_Cliente = @IdCliente);
GO

-- =====================================================
-- 9. BORRAR Y CREAR PROCEDIMIENTOS ALMACENADOS
-- =====================================================

DROP PROCEDURE IF EXISTS sp_RegistrarProductoWMS;
DROP PROCEDURE IF EXISTS sp_RegistrarCategoriaWMS;
DROP PROCEDURE IF EXISTS sp_RegistrarUbicacionWMS;
DROP PROCEDURE IF EXISTS sp_RegistrarEntradaWMS;
DROP PROCEDURE IF EXISTS sp_RegistrarSalidaWMS;
DROP PROCEDURE IF EXISTS sp_RegistrarDevolucionWMS;
DROP PROCEDURE IF EXISTS sp_ReporteProductosBajoStock;
DROP PROCEDURE IF EXISTS sp_ReporteMovimientosPorRango;
DROP PROCEDURE IF EXISTS sp_ReportePedidosPorEstado;
DROP PROCEDURE IF EXISTS sp_RegistrarDetallePedidoValidado;
DROP PROCEDURE IF EXISTS sp_ActualizarProductoWMS;
DROP PROCEDURE IF EXISTS sp_ActualizarCategoriaWMS;
DROP PROCEDURE IF EXISTS sp_ActualizarUbicacionWMS;
DROP PROCEDURE IF EXISTS sp_EliminarProductoWMS;
DROP PROCEDURE IF EXISTS sp_EliminarCategoriaWMS;
DROP PROCEDURE IF EXISTS sp_AutenticarUsuarioWMS;
DROP PROCEDURE IF EXISTS sp_AsignarRolUsuarioWMS;
DROP PROCEDURE IF EXISTS sp_CrearMarcaWMS;
DROP PROCEDURE IF EXISTS sp_ListarMarcasWMS;
DROP PROCEDURE IF EXISTS sp_ListarMarcasPorCategoriaWMS;
DROP PROCEDURE IF EXISTS sp_EliminarMarcaWMS;
DROP PROCEDURE IF EXISTS sp_CrearCategoriaWMS;
GO

-- RF-01: Registro de productos
CREATE OR ALTER PROCEDURE sp_RegistrarProductoWMS
    @Codigo_Producto VARCHAR(50),
    @Nombre_Producto VARCHAR(120),
    @Descripcion VARCHAR(300),
    @Precio DECIMAL(10,2),
    @Stock_Minimo INT,
    @Id_Categoria INT,
    @Stock_Inicial INT,
    @Id_Ubicacion VARCHAR(20),
    @Id_Usuario INT,
    @Id_Marca INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
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

        INSERT INTO Producto (Codigo_Producto, Nombre_Producto, Descripcion, Precio, Stock_Minimo, Id_Categoria, Id_Marca)
        VALUES (@Codigo_Producto, @Nombre_Producto, @Descripcion, @Precio, @Stock_Minimo, @Id_Categoria, @Id_Marca);

        DECLARE @New_Id_Producto INT = SCOPE_IDENTITY();

        INSERT INTO Inventario (Stock_Actual, Estado_Stock, Id_Producto, Id_Ubicacion)
        VALUES (@Stock_Inicial, 'Disponible', @New_Id_Producto, @Id_Ubicacion);

        DECLARE @New_Id_Inventario INT = SCOPE_IDENTITY();

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
GO

-- RF-02: Registro de categorias
CREATE OR ALTER PROCEDURE sp_RegistrarCategoriaWMS
    @Nombre_Categoria VARCHAR(80)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM Categoria WHERE Nombre_Categoria = @Nombre_Categoria)
            THROW 51004, 'La categoria ya esta registrada.', 1;

        BEGIN TRANSACTION;
        INSERT INTO Categoria (Nombre_Categoria) VALUES (@Nombre_Categoria);
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- RF-03: Registro de ubicaciones
CREATE OR ALTER PROCEDURE sp_RegistrarUbicacionWMS
    @Pasillo VARCHAR(20),
    @Estante VARCHAR(20),
    @Nivel VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @Codigo_Ubicacion VARCHAR(20) = UPPER(@Pasillo) + @Estante + @Nivel;

        IF EXISTS (SELECT 1 FROM Ubicacion WHERE Codigo_Ubicacion = @Codigo_Ubicacion)
            THROW 51005, 'La ubicacion ya existe en el almacen.', 1;

        BEGIN TRANSACTION;
        INSERT INTO Ubicacion (Codigo_Ubicacion, Pasillo, Estante, Nivel)
        VALUES (@Codigo_Ubicacion, UPPER(@Pasillo), @Estante, @Nivel);
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- RF-04: Registro de entradas
CREATE OR ALTER PROCEDURE sp_RegistrarEntradaWMS
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

        IF @Id_Inventario IS NULL
        BEGIN
            INSERT INTO Inventario (Stock_Actual, Estado_Stock, Id_Producto, Id_Ubicacion)
            VALUES (@Cantidad, 'Disponible', @Id_Producto, @Codigo_Ubicacion);
            SET @Id_Inventario = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            UPDATE Inventario SET Stock_Actual = Stock_Actual + @Cantidad WHERE Id_Inventario = @Id_Inventario;
        END

        INSERT INTO Movimiento_Inventario (Observacion, Id_Usuario, Id_Tipo_Movimiento)
        VALUES (COALESCE(@Observacion, 'Entrada de mercaderia de producto ' + @Codigo_Producto), @Id_Usuario, 1);

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
GO

-- RF-05: Registro de salidas
CREATE OR ALTER PROCEDURE sp_RegistrarSalidaWMS
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

        IF @Id_Inventario IS NULL OR @Stock_Actual < @Cantidad
            THROW 51012, 'No hay stock suficiente en la ubicacion indicada.', 1;

        UPDATE Inventario SET Stock_Actual = Stock_Actual - @Cantidad WHERE Id_Inventario = @Id_Inventario;

        INSERT INTO Movimiento_Inventario (Observacion, Id_Usuario, Id_Tipo_Movimiento)
        VALUES (COALESCE(@Observacion, 'Salida de mercaderia de producto ' + @Codigo_Producto), @Id_Usuario, 2);

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
GO

-- RF-06: Registro de devoluciones
CREATE OR ALTER PROCEDURE sp_RegistrarDevolucionWMS
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
            THROW 51013, 'El producto no existe.', 1;

        IF NOT EXISTS (SELECT 1 FROM Ubicacion WHERE Codigo_Ubicacion = @Codigo_Ubicacion)
            THROW 51014, 'La ubicacion no existe.', 1;

        IF @Cantidad <= 0
            THROW 51015, 'La cantidad de devolucion debe ser mayor a cero.', 1;

        BEGIN TRANSACTION;

        DECLARE @Id_Inventario INT;
        SELECT @Id_Inventario = Id_Inventario
        FROM Inventario
        WHERE Id_Producto = @Id_Producto AND Id_Ubicacion = @Codigo_Ubicacion;

        IF @Id_Inventario IS NULL
        BEGIN
            INSERT INTO Inventario (Stock_Actual, Estado_Stock, Id_Producto, Id_Ubicacion)
            VALUES (@Cantidad, 'Disponible', @Id_Producto, @Codigo_Ubicacion);
            SET @Id_Inventario = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            UPDATE Inventario SET Stock_Actual = Stock_Actual + @Cantidad WHERE Id_Inventario = @Id_Inventario;
        END

        INSERT INTO Movimiento_Inventario (Observacion, Id_Usuario, Id_Tipo_Movimiento)
        VALUES (COALESCE(@Observacion, 'Devolucion de producto ' + @Codigo_Producto), @Id_Usuario, 4);

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
GO

-- RF-10: Reporte bajo stock
CREATE OR ALTER PROCEDURE sp_ReporteProductosBajoStock
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
GO

-- RF-11: Reporte movimientos por rango
CREATE OR ALTER PROCEDURE sp_ReporteMovimientosPorRango
    @FechaInicio DATETIME2,
    @FechaFin DATETIME2,
    @Id_Tipo_Movimiento INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        mi.Id_Movimiento_Inventario, mi.Fecha_Movimiento, tm.Descripcion AS Tipo_Movimiento,
        p.Codigo_Producto, p.Nombre_Producto, dm.Cantidad,
        i.Id_Ubicacion AS Codigo_Ubicacion, u.Nombre AS Usuario, mi.Observacion
    FROM Detalle_Movimiento dm
    INNER JOIN Movimiento_Inventario mi ON dm.Id_Movimiento_Inventario = mi.Id_Movimiento_Inventario
    INNER JOIN Tipo_Movimiento tm ON mi.Id_Tipo_Movimiento = tm.Id_Tipo_Movimiento
    INNER JOIN Inventario i ON dm.Id_Inventario = i.Id_Inventario
    INNER JOIN Producto p ON i.Id_Producto = p.Id_Producto
    INNER JOIN Usuario u ON mi.Id_Usuario = u.Id_Usuario
    WHERE mi.Fecha_Movimiento BETWEEN @FechaInicio AND @FechaFin
      AND (@Id_Tipo_Movimiento IS NULL OR mi.Id_Tipo_Movimiento = @Id_Tipo_Movimiento)
    ORDER BY mi.Fecha_Movimiento DESC;
END;
GO

-- RF-12: Reporte pedidos por estado
CREATE OR ALTER PROCEDURE sp_ReportePedidosPorEstado
    @Id_Estado_Pedido INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        p.Id_Pedido, p.Fecha_Pedido, c.Nombre AS Cliente,
        ep.Descripcion AS Estado_Pedido, p.Precio_Total,
        COUNT(dp.Id_Detalle_Pedido) AS Cantidad_Items,
        SUM(dp.Cantidad) AS Total_Articulos
    FROM Pedido p
    INNER JOIN Cliente c ON p.Id_Cliente = c.Id_Cliente
    INNER JOIN Estado_Pedido ep ON p.Id_Estado_Pedido = ep.Id_Estado_Pedido
    LEFT JOIN Detalle_Pedido dp ON p.Id_Pedido = dp.Id_Pedido
    WHERE (@Id_Estado_Pedido IS NULL OR p.Id_Estado_Pedido = @Id_Estado_Pedido)
    GROUP BY p.Id_Pedido, p.Fecha_Pedido, c.Nombre, ep.Descripcion, p.Precio_Total
    ORDER BY p.Fecha_Pedido DESC;
END;
GO

-- RF-13: Validar stock antes de confirmar pedido
CREATE OR ALTER PROCEDURE sp_RegistrarDetallePedidoValidado
    @Id_Pedido INT,
    @Codigo_Producto VARCHAR(50),
    @Cantidad INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @Id_Producto INT;
        DECLARE @Precio_Unitario DECIMAL(10,2);
        SELECT @Id_Producto = Id_Producto, @Precio_Unitario = Precio
        FROM Producto WHERE Codigo_Producto = @Codigo_Producto;

        IF @Id_Producto IS NULL
            THROW 51016, 'El producto especificado no existe.', 1;

        IF @Cantidad <= 0
            THROW 51017, 'La cantidad solicitada debe ser mayor a cero.', 1;

        DECLARE @Stock_Disponible INT;
        SELECT @Stock_Disponible = COALESCE(SUM(Stock_Actual), 0)
        FROM Inventario WHERE Id_Producto = @Id_Producto;

        IF @Stock_Disponible < @Cantidad
            THROW 51018, 'Stock insuficiente para confirmar este producto en el pedido.', 1;

        BEGIN TRANSACTION;

        DECLARE @Subtotal DECIMAL(10,2) = @Cantidad * @Precio_Unitario;

        INSERT INTO Detalle_Pedido (Cantidad, Subtotal, Precio_Unitario, Id_Pedido, Id_Producto)
        VALUES (@Cantidad, @Subtotal, @Precio_Unitario, @Id_Pedido, @Id_Producto);

        UPDATE Pedido SET Precio_Total = Precio_Total + @Subtotal WHERE Id_Pedido = @Id_Pedido;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- RF-16: Actualizar producto
CREATE OR ALTER PROCEDURE sp_ActualizarProductoWMS
    @Id_Producto INT,
    @Nombre_Producto VARCHAR(120),
    @Descripcion VARCHAR(300),
    @Precio DECIMAL(10,2),
    @Stock_Minimo INT,
    @Id_Categoria INT
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
            Precio = @Precio, Stock_Minimo = @Stock_Minimo, Id_Categoria = @Id_Categoria
        WHERE Id_Producto = @Id_Producto;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- RF-16: Actualizar categoria
CREATE OR ALTER PROCEDURE sp_ActualizarCategoriaWMS
    @Id_Categoria INT,
    @Nombre_Categoria VARCHAR(80)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Categoria WHERE Id_Categoria = @Id_Categoria)
            THROW 51021, 'La categoria a actualizar no existe.', 1;

        BEGIN TRANSACTION;
        UPDATE Categoria SET Nombre_Categoria = @Nombre_Categoria WHERE Id_Categoria = @Id_Categoria;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- RF-16: Actualizar ubicacion
CREATE OR ALTER PROCEDURE sp_ActualizarUbicacionWMS
    @Codigo_Ubicacion VARCHAR(20),
    @Pasillo VARCHAR(20),
    @Estante VARCHAR(20),
    @Nivel VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Ubicacion WHERE Codigo_Ubicacion = @Codigo_Ubicacion)
            THROW 51022, 'La ubicacion a actualizar no existe.', 1;

        BEGIN TRANSACTION;
        UPDATE Ubicacion
        SET Pasillo = UPPER(@Pasillo), Estante = @Estante, Nivel = @Nivel
        WHERE Codigo_Ubicacion = @Codigo_Ubicacion;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- RF-17: Eliminar producto
CREATE OR ALTER PROCEDURE sp_EliminarProductoWMS
    @Id_Producto INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Producto WHERE Id_Producto = @Id_Producto)
            THROW 51023, 'El producto no existe.', 1;

        IF EXISTS (SELECT 1 FROM Inventario WHERE Id_Producto = @Id_Producto AND Stock_Actual > 0)
            THROW 51024, 'No se puede eliminar el producto porque tiene existencias en stock.', 1;

        BEGIN TRANSACTION;
        DELETE FROM Inventario WHERE Id_Producto = @Id_Producto;
        DELETE FROM Producto WHERE Id_Producto = @Id_Producto;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- RF-17: Eliminar categoria
CREATE OR ALTER PROCEDURE sp_EliminarCategoriaWMS
    @Id_Categoria INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Categoria WHERE Id_Categoria = @Id_Categoria)
            THROW 51025, 'La categoria no existe.', 1;

        IF EXISTS (SELECT 1 FROM Producto WHERE Id_Categoria = @Id_Categoria)
            THROW 51026, 'No se puede eliminar la categoria porque tiene productos asociados.', 1;

        BEGIN TRANSACTION;
        DELETE FROM Categoria WHERE Id_Categoria = @Id_Categoria;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- RF-18: Autenticar usuario
CREATE OR ALTER PROCEDURE sp_AutenticarUsuarioWMS
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
GO

-- RF-19: Asignar rol
CREATE OR ALTER PROCEDURE sp_AsignarRolUsuarioWMS
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
GO

-- =====================================================
-- MARCAS: SPs
-- =====================================================

CREATE OR ALTER PROCEDURE sp_CrearMarcaWMS
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
GO

CREATE OR ALTER PROCEDURE sp_ListarMarcasWMS
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        m.Id_Marca,
        m.Nombre_Marca,
        m.Id_Categoria,
        c.Nombre_Categoria
    FROM Marca m
    INNER JOIN Categoria c ON m.Id_Categoria = c.Id_Categoria
    ORDER BY c.Nombre_Categoria, m.Nombre_Marca;
END;
GO

CREATE OR ALTER PROCEDURE sp_ListarMarcasPorCategoriaWMS
    @Id_Categoria INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        m.Id_Marca,
        m.Nombre_Marca,
        m.Id_Categoria,
        c.Nombre_Categoria
    FROM Marca m
    INNER JOIN Categoria c ON m.Id_Categoria = c.Id_Categoria
    WHERE m.Id_Categoria = @Id_Categoria
    ORDER BY m.Nombre_Marca;
END;
GO

CREATE OR ALTER PROCEDURE sp_EliminarMarcaWMS
    @Id_Marca INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Marca WHERE Id_Marca = @Id_Marca)
            THROW 51032, 'La marca no existe.', 1;

        IF EXISTS (SELECT 1 FROM Producto WHERE Id_Marca = @Id_Marca)
            THROW 51033, 'No se puede eliminar la marca porque tiene productos asociados.', 1;

        BEGIN TRANSACTION;
        DELETE FROM Marca WHERE Id_Marca = @Id_Marca;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE sp_CrearCategoriaWMS
    @Nombre_Categoria VARCHAR(80)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM Categoria WHERE Nombre_Categoria = @Nombre_Categoria)
            THROW 51034, 'La categoria ya esta registrada.', 1;

        BEGIN TRANSACTION;
        INSERT INTO Categoria (Nombre_Categoria)
        VALUES (@Nombre_Categoria);
        COMMIT TRANSACTION;

        SELECT SCOPE_IDENTITY() AS Id_Categoria;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- =====================================================
-- 10. TRIGGERS
-- =====================================================

CREATE OR ALTER TRIGGER TR_Auditoria_Producto
ON Producto
AFTER INSERT
AS
BEGIN
    INSERT INTO Auditoria_Sistema (Tabla_Afectada, Accion, Descripcion, Id_Usuario)
    SELECT 'Producto', 'INSERT', 'Se registro un nuevo producto.', 1 FROM inserted;
END;
GO

CREATE OR ALTER TRIGGER TR_HistorialPrecio
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
GO

CREATE OR ALTER TRIGGER TR_ImpedirStockNegativo
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
GO

CREATE OR ALTER TRIGGER TR_ValidarAsignacionUbicacion
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
        RAISERROR ('El producto debe ser asignado a una ubicacion fisica valida dentro del almacen.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

PRINT 'Script ejecutado correctamente. Base de datos BD_WMS_ECOMMERCE lista.';
GO
