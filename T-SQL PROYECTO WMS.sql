-- CREACION DE BASE DE DATOS

CREATE DATABASE PY_BD_WMS_ECOMMERCE;

USE BD_WMS_ECOMMERCE;


--1. TABLA ROL


CREATE TABLE Rol(
    Id_Rol INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_Rol VARCHAR(50) NOT NULL
);


--2. TABLA USUARIO


CREATE TABLE Usuario(
    Id_Usuario INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Contrasena VARCHAR(255) NOT NULL,
    Telefono VARCHAR(15),
    Correo VARCHAR(100) NOT NULL UNIQUE,
    Id_Rol INT NOT NULL,

    CONSTRAINT FK_Usuario_Rol
        FOREIGN KEY(Id_Rol)
        REFERENCES Rol(Id_Rol)
);


--3. TABLA AUDITORIA_SISTEMA


CREATE TABLE Auditoria_Sistema(
    Id_Auditoria INT IDENTITY(1,1) PRIMARY KEY,
    Tabla_Afectada VARCHAR(100) NOT NULL,
    Accion VARCHAR(20) NOT NULL,
    Descripcion VARCHAR(300),
    Fecha_Auditoria DATETIME2 NOT NULL DEFAULT GETDATE(),
    Id_Usuario INT NULL,

    CONSTRAINT FK_Auditoria_Usuario
        FOREIGN KEY(Id_Usuario)
        REFERENCES Usuario(Id_Usuario)
);


--4. TABLA TIPO_MOVIMIENTO


CREATE TABLE Tipo_Movimiento(
    Id_Tipo_Movimiento INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion VARCHAR(50) NOT NULL
);


--5. TABLA MOVIMIENTO_INVENTARIO


CREATE TABLE Movimiento_Inventario(
    Id_Movimiento_Inventario INT IDENTITY(1,1) PRIMARY KEY,
    Fecha_Movimiento DATETIME2 NOT NULL DEFAULT GETDATE(),
    Observacion VARCHAR(300),

    Id_Usuario INT NOT NULL,
    Id_Tipo_Movimiento INT NOT NULL,

    CONSTRAINT FK_Movimiento_Usuario
        FOREIGN KEY(Id_Usuario)
        REFERENCES Usuario(Id_Usuario),

    CONSTRAINT FK_Movimiento_Tipo
        FOREIGN KEY(Id_Tipo_Movimiento)
        REFERENCES Tipo_Movimiento(Id_Tipo_Movimiento)
);


--6. TABLA CATEGORIA


CREATE TABLE Categoria(
    Id_Categoria INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_Categoria VARCHAR(80) NOT NULL UNIQUE
);


--7. TABLA PRODUCTO


CREATE TABLE Producto(
    Id_Producto INT IDENTITY(1,1) PRIMARY KEY,
    Codigo_Producto VARCHAR(50) NOT NULL UNIQUE,
    Nombre_Producto VARCHAR(120) NOT NULL,
    Descripcion VARCHAR(300),
    Precio DECIMAL(10,2) NOT NULL,
    Stock_Minimo INT NOT NULL,
    Id_Categoria INT NOT NULL,

    CONSTRAINT CK_Producto_Precio
        CHECK(Precio > 0),

    CONSTRAINT CK_Producto_StockMinimo
        CHECK(Stock_Minimo >= 0),

    CONSTRAINT FK_Producto_Categoria
        FOREIGN KEY(Id_Categoria)
        REFERENCES Categoria(Id_Categoria)
);


--8. TABLA UBICACION


CREATE TABLE Ubicacion(

    Codigo_Ubicacion VARCHAR(20) PRIMARY KEY,

    Pasillo VARCHAR(20) NOT NULL,

    Estante VARCHAR(20) NOT NULL,

    Nivel VARCHAR(20) NOT NULL
);


--9. TABLA INVENTARIO


CREATE TABLE Inventario(

    Id_Inventario INT IDENTITY(1,1) PRIMARY KEY,

    Stock_Actual INT NOT NULL,

    Estado_Stock VARCHAR(30) NOT NULL,

    Id_Producto INT NOT NULL,

    Id_Ubicacion VARCHAR(20) NOT NULL,

    CONSTRAINT CK_Inventario_Stock
        CHECK(Stock_Actual >= 0),

    CONSTRAINT FK_Inventario_Producto
        FOREIGN KEY(Id_Producto)
        REFERENCES Producto(Id_Producto),

    CONSTRAINT FK_Inventario_Ubicacion
        FOREIGN KEY(Id_Ubicacion)
        REFERENCES Ubicacion(Codigo_Ubicacion)
);


--10. TABLA DETALLE_MOVIMIENTO


CREATE TABLE Detalle_Movimiento(

    Id_Detalle_Movimiento INT IDENTITY(1,1) PRIMARY KEY,

    Cantidad INT NOT NULL,

    Id_Movimiento_Inventario INT NOT NULL,

    Id_Inventario INT NOT NULL,

    CONSTRAINT CK_DetalleMovimiento_Cantidad
        CHECK(Cantidad > 0),

    CONSTRAINT FK_DetalleMovimiento_Movimiento
        FOREIGN KEY(Id_Movimiento_Inventario)
        REFERENCES Movimiento_Inventario(Id_Movimiento_Inventario),

    CONSTRAINT FK_DetalleMovimiento_Inventario
        FOREIGN KEY(Id_Inventario)
        REFERENCES Inventario(Id_Inventario)
);


--11. TABLA CLIENTE


CREATE TABLE Cliente(
    Id_Cliente INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Num_Documento VARCHAR(20) NOT NULL UNIQUE,
    Telefono VARCHAR(15),
    Correo VARCHAR(100) UNIQUE,
    Direccion VARCHAR(200)
);


--12. TABLA ESTADO_PEDIDO


CREATE TABLE Estado_Pedido(
    Id_Estado_Pedido INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion VARCHAR(50) NOT NULL
);


--13. TABLA PEDIDO


CREATE TABLE Pedido(
    Id_Pedido INT IDENTITY(1,1) PRIMARY KEY,
    Fecha_Pedido DATETIME2 NOT NULL DEFAULT GETDATE(),
    Precio_Total DECIMAL(10,2) NOT NULL,

    Id_Cliente INT NOT NULL,
    Id_Estado_Pedido INT NOT NULL,

    CONSTRAINT CK_Pedido_Precio
        CHECK (Precio_Total >= 0),

    CONSTRAINT FK_Pedido_Cliente
        FOREIGN KEY(Id_Cliente)
        REFERENCES Cliente(Id_Cliente),

    CONSTRAINT FK_Pedido_Estado
        FOREIGN KEY(Id_Estado_Pedido)
        REFERENCES Estado_Pedido(Id_Estado_Pedido)
);


--14. TABLA DETALLE_PEDIDO


CREATE TABLE Detalle_Pedido(
    Id_Detalle_Pedido INT IDENTITY(1,1) PRIMARY KEY,

    Cantidad INT NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    Precio_Unitario DECIMAL(10,2) NOT NULL,

    Id_Pedido INT NOT NULL,
    Id_Producto INT NOT NULL,

    CONSTRAINT CK_DetallePedido_Cantidad
        CHECK(Cantidad > 0),

    CONSTRAINT CK_DetallePedido_Precio
        CHECK(Precio_Unitario > 0),

    CONSTRAINT CK_DetallePedido_Subtotal
        CHECK(Subtotal >= 0),

    CONSTRAINT FK_DetallePedido_Pedido
        FOREIGN KEY(Id_Pedido)
        REFERENCES Pedido(Id_Pedido),

    CONSTRAINT FK_DetallePedido_Producto
        FOREIGN KEY(Id_Producto)
        REFERENCES Producto(Id_Producto)
);


--15. TABLA ESTADO_PICKING


CREATE TABLE Estado_Picking(
    Id_Estado_Picking INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion VARCHAR(50) NOT NULL
);


--16. TABLA PICKING


CREATE TABLE Picking(
    Id_Picking INT IDENTITY(1,1) PRIMARY KEY,

    Fecha_Picking DATETIME2 NOT NULL DEFAULT GETDATE(),

    Id_Pedido INT NOT NULL,
    Id_Estado_Picking INT NOT NULL,

    CONSTRAINT FK_Picking_Pedido
        FOREIGN KEY(Id_Pedido)
        REFERENCES Pedido(Id_Pedido),

    CONSTRAINT FK_Picking_Estado
        FOREIGN KEY(Id_Estado_Picking)
        REFERENCES Estado_Picking(Id_Estado_Picking)
);


--17. TABLA ESTADO_PACKING


CREATE TABLE Estado_Packing(
    Id_Estado_Packing INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion VARCHAR(50) NOT NULL
);


--18. TABLA PACKING


CREATE TABLE Packing(
    Id_Packing INT IDENTITY(1,1) PRIMARY KEY,

    Fecha_Packing DATETIME2 NOT NULL DEFAULT GETDATE(),

    Id_Picking INT NOT NULL,
    Id_Estado_Packing INT NOT NULL,

    CONSTRAINT FK_Packing_Picking
        FOREIGN KEY(Id_Picking)
        REFERENCES Picking(Id_Picking),

    CONSTRAINT FK_Packing_Estado
        FOREIGN KEY(Id_Estado_Packing)
        REFERENCES Estado_Packing(Id_Estado_Packing)
);


--19. TABLA ESTADO_DESPACHO


CREATE TABLE Estado_Despacho(
    Id_Estado_Despacho INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion VARCHAR(50) NOT NULL
);


--20. TABLA DESPACHO


CREATE TABLE Despacho(
    Id_Despacho INT IDENTITY(1,1) PRIMARY KEY,

    Direccion_Envio VARCHAR(250) NOT NULL,
    Fecha_Despacho DATETIME2 NOT NULL DEFAULT GETDATE(),

    Id_Packing INT NOT NULL,
    Id_Estado_Despacho INT NOT NULL,

    CONSTRAINT FK_Despacho_Packing
        FOREIGN KEY(Id_Packing)
        REFERENCES Packing(Id_Packing),

    CONSTRAINT FK_Despacho_Estado
        FOREIGN KEY(Id_Estado_Despacho)
        REFERENCES Estado_Despacho(Id_Estado_Despacho)
);

--INSERCION DE DATOS 


INSERT INTO Rol (Nombre_Rol)
VALUES
('Administrador'),
('Supervisor'),
('Operario');


INSERT INTO Usuario
(Nombre, Contrasena, Telefono, Correo, Id_Rol)
VALUES
('Juan Pérez','Admin2025#','987654321','juan.perez@almacen.com',1),
('María López','Super2025#','912345678','maria.lopez@almacen.com',2),
('Carlos Ruiz','Oper2025#','998877665','carlos.ruiz@almacen.com',3),
('Ana Torres','Oper2025#','956321478','ana.torres@almacen.com',3),
('Luis Gómez','Super2025#','945123789','luis.gomez@almacen.com',2);



INSERT INTO Tipo_Movimiento (Descripcion)
VALUES
('Entrada'),
('Salida'),
('Ajuste');

INSERT INTO Categoria (Nombre_Categoria)
VALUES
('Electrónica'),
('Oficina'),
('Herramientas'),
('Accesorios'),
('Limpieza');

INSERT INTO Ubicacion
(Codigo_Ubicacion,Pasillo,Estante,Nivel)
VALUES
('A101','A','01','1'),
('A102','A','01','2'),
('A201','A','02','1'),
('B101','B','01','1'),
('C101','C','01','1');

INSERT INTO Cliente
(Nombre,Num_Documento,Telefono,Correo,Direccion)
VALUES
('Empresa ABC SAC','20111111111','987111111','ventas@abc.com','Av. Perú 1500'),
('Tecnología Perú SAC','20456789123','987222222','compras@tecperu.com','Av. Arequipa 250'),
('Comercial Los Andes','20567891234','987333333','contacto@andes.com','Jr. Lima 540'),
('Importadora Global','20678912345','987444444','ventas@global.com','Av. Colonial 780'),
('Distribuidora Norte','20789123456','987555555','info@norte.com','Av. Universitaria 1200');

INSERT INTO Estado_Pedido (Descripcion)
VALUES
('Pendiente'),
('En Proceso'),
('Completado'),
('Cancelado');

INSERT INTO Estado_Picking (Descripcion)
VALUES
('Pendiente'),
('En Proceso'),
('Finalizado');

INSERT INTO Estado_Packing (Descripcion)
VALUES
('Pendiente'),
('Empacado'),
('Finalizado');

INSERT INTO Estado_Despacho (Descripcion)
VALUES
('Pendiente'),
('En Ruta'),
('Entregado');

INSERT INTO Producto
(Codigo_Producto,Nombre_Producto,Descripcion,Precio,Stock_Minimo,Id_Categoria)
VALUES
('PROD001','Laptop Dell Inspiron','Laptop Core i7 16GB RAM',3500.00,10,1),
('PROD002','Monitor LG 24"','Monitor LED Full HD',750.00,8,1),
('PROD003','Teclado Logitech K120','Teclado USB',60.00,20,4),
('PROD004','Mouse Logitech M170','Mouse inalámbrico',55.00,20,4),
('PROD005','Impresora Epson L3250','Impresora multifuncional',950.00,5,2),
('PROD006','Taladro Bosch GSB13','Taladro percutor',420.00,6,3),
('PROD007','Martillo Stanley','Martillo de acero',45.00,15,3),
('PROD008','Escoba Industrial','Escoba de cerdas resistentes',35.00,10,5);

INSERT INTO Inventario
(Stock_Actual,Estado_Stock,Id_Producto,Id_Ubicacion)
VALUES
(30,'Disponible',1,'A101'),
(18,'Disponible',2,'A102'),
(80,'Disponible',3,'A201'),
(65,'Disponible',4,'A201'),
(10,'Disponible',5,'B101'),
(25,'Disponible',6,'B101'),
(40,'Disponible',7,'C101'),
(12,'Disponible',8,'C101');

INSERT INTO Movimiento_Inventario
(Observacion,Id_Usuario,Id_Tipo_Movimiento)
VALUES
('Ingreso inicial de productos',1,1),
('Venta de productos',3,2),
('Corrección de inventario',2,3),
('Ingreso por compra',1,1),
('Salida por despacho',4,2);

INSERT INTO Pedido
(Precio_Total,Id_Cliente,Id_Estado_Pedido)
VALUES
(7060.00,1,3),
(950.00,2,2),
(475.00,3,1),
(165.00,4,1),
(420.00,5,2);

INSERT INTO Picking
(Id_Pedido,Id_Estado_Picking)
VALUES
(1,3),
(2,2),
(3,1),
(4,1),
(5,2);

INSERT INTO Packing
(Id_Picking,Id_Estado_Packing)
VALUES
(1,3),
(2,2),
(3,1),
(4,1),
(5,2);

INSERT INTO Despacho
(Direccion_Envio,Id_Packing,Id_Estado_Despacho)
VALUES
('Av. Perú 1500',1,3),
('Av. Arequipa 250',2,2),
('Jr. Lima 540',3,1),
('Av. Colonial 780',4,1),
('Av. Universitaria 1200',5,2);

INSERT INTO Detalle_Movimiento
(Cantidad,Id_Movimiento_Inventario,Id_Inventario)
VALUES
(30,1,1),
(2,2,1),
(5,3,5),
(20,4,6),
(4,5,2);

INSERT INTO Detalle_Pedido
(Cantidad,Subtotal,Precio_Unitario,Id_Pedido,Id_Producto)
VALUES
(2,7000.00,3500.00,1,1),
(1,60.00,60.00,1,3),
(1,950.00,950.00,2,5),
(1,420.00,420.00,3,6),
(1,55.00,55.00,3,4),
(3,165.00,55.00,4,4),
(1,420.00,420.00,5,6);

--5.5.1 Consulta 1. SELECT

SELECT
    P.Id_Producto,
    P.Nombre_Producto,
    C.Nombre_Categoria,
    P.Precio,
    P.Stock_Minimo
FROM Producto P
INNER JOIN Categoria C
ON P.Id_Categoria = C.Id_Categoria;

--5.5.1 Consulta 2. SELECT

SELECT
    Pe.Id_Pedido,
    C.Nombre AS Cliente,
    Pe.Fecha_Pedido,
    Pe.Precio_Total,
    EP.Descripcion AS Estado
FROM Pedido Pe
INNER JOIN Cliente C
ON Pe.Id_Cliente = C.Id_Cliente
INNER JOIN Estado_Pedido EP
ON Pe.Id_Estado_Pedido = EP.Id_Estado_Pedido;

--5.5.1 Consulta 3. INSERT

INSERT INTO Cliente
(
    Nombre,
    Num_Documento,
    Telefono,
    Correo,
    Direccion
)
VALUES
(
    'Importaciones Pacífico SAC',
    '20876543210',
    '987654999',
    'contacto@pacifico.com',
    'Av. Argentina 456'
);

SELECT * FROM Cliente

--5.5.1 Consulta 4. INSERT

INSERT INTO Producto
(
    Codigo_Producto,
    Nombre_Producto,
    Descripcion,
    Precio,
    Stock_Minimo,
    Id_Categoria
)
VALUES
(
    'PROD009',
    'Disco SSD Kingston 1TB',
    'Unidad de almacenamiento SSD',
    320.00,
    8,
    1
);

SELECT * FROM Producto

--5.5.1 Consulta 5. UPDATE

UPDATE Producto
SET Precio = 340.00
WHERE Id_Producto = 1;

SELECT * FROM Producto

--5.5.1 Consulta 6. UPDATE

UPDATE Pedido
SET Id_Estado_Pedido = 3
WHERE Id_Pedido = 2;

SELECT * FROM Pedido

--5.5.1 Consulta 7. DELETE

DELETE FROM Cliente
WHERE Num_Documento = '20987654321';

SELECT * FROM Cliente


--5.5.1 Consulta 8. DELETE

DELETE FROM Producto
WHERE Nombre_Producto = 'Memoria USB Kingston 64GB';

SELECT * FROM Producto

--5.5.2 Consulta 1. Mostrar los movimientos de inventario realizados por cada usuario

SELECT
    MI.Id_Movimiento_Inventario,
    MI.Fecha_Movimiento,
    U.Nombre AS Usuario,
    TM.Descripcion AS Tipo_Movimiento,
    MI.Observacion
FROM Movimiento_Inventario MI
INNER JOIN Usuario U
    ON MI.Id_Usuario = U.Id_Usuario
INNER JOIN Tipo_Movimiento TM
    ON MI.Id_Tipo_Movimiento = TM.Id_Tipo_Movimiento;

--5.5.2 Consulta 2. Mostrar el inventario con la ubicación de cada producto

SELECT
    I.Id_Inventario,
    P.Nombre_Producto,
    I.Stock_Actual,
    I.Estado_Stock,
    U.Codigo_Ubicacion,
    U.Pasillo,
    U.Estante,
    U.Nivel
FROM Inventario I
INNER JOIN Producto P
    ON I.Id_Producto = P.Id_Producto
INNER JOIN Ubicacion U
    ON I.Id_Ubicacion = U.Codigo_Ubicacion;

--5.5.2 Consulta 3. Mostrar el detalle de los pedidos con los productos solicitados

SELECT
    Pe.Id_Pedido,
    C.Nombre AS Cliente,
    P.Nombre_Producto,
    DP.Cantidad,
    DP.Precio_Unitario,
    DP.Subtotal
FROM Detalle_Pedido DP
INNER JOIN Pedido Pe
    ON DP.Id_Pedido = Pe.Id_Pedido
INNER JOIN Cliente C
    ON Pe.Id_Cliente = C.Id_Cliente
INNER JOIN Producto P
    ON DP.Id_Producto = P.Id_Producto
ORDER BY Pe.Id_Pedido;

--5.5.2 Consulta 4. Mostrar el proceso completo del pedido (Picking, Packing y Despacho)

SELECT
    Pe.Id_Pedido,
    C.Nombre AS Cliente,
    EP.Descripcion AS Estado_Pedido,
    EPI.Descripcion AS Estado_Picking,
    EPA.Descripcion AS Estado_Packing,
    ED.Descripcion AS Estado_Despacho,
    D.Fecha_Despacho
FROM Pedido Pe
INNER JOIN Cliente C
    ON Pe.Id_Cliente = C.Id_Cliente
INNER JOIN Estado_Pedido EP
    ON Pe.Id_Estado_Pedido = EP.Id_Estado_Pedido
INNER JOIN Picking Pi
    ON Pe.Id_Pedido = Pi.Id_Pedido
INNER JOIN Estado_Picking EPI
    ON Pi.Id_Estado_Picking = EPI.Id_Estado_Picking
INNER JOIN Packing Pa
    ON Pi.Id_Picking = Pa.Id_Picking
INNER JOIN Estado_Packing EPA
    ON Pa.Id_Estado_Packing = EPA.Id_Estado_Packing
INNER JOIN Despacho D
    ON Pa.Id_Packing = D.Id_Packing
INNER JOIN Estado_Despacho ED
    ON D.Id_Estado_Despacho = ED.Id_Estado_Despacho;

--5.5.3 Consulta 1: Categorías con más de 2 productos registrados

SELECT
    c.Nombre_Categoria,
    COUNT(p.Id_Producto) AS Total_Productos
FROM Categoria c
INNER JOIN Producto p
    ON c.Id_Categoria = p.Id_Categoria
GROUP BY c.Nombre_Categoria
HAVING COUNT(p.Id_Producto) > 2;

--5.5.3 Consulta 2: Clientes cuyo monto total de compras supera los S/ 1000

SELECT
    c.Id_Cliente,
    c.Nombre,
    SUM(p.Precio_Total) AS Total_Comprado
FROM Cliente c
INNER JOIN Pedido p
    ON c.Id_Cliente = p.Id_Cliente
GROUP BY
    c.Id_Cliente,
    c.Nombre
HAVING SUM(p.Precio_Total) > 1000;

--5.5.3 Consulta 3: Productos cuya cantidad vendida supera las 3 unidades

SELECT
    pr.Nombre_Producto,
    SUM(dp.Cantidad) AS Total_Vendido
FROM Producto pr
INNER JOIN Detalle_Pedido dp
    ON pr.Id_Producto = dp.Id_Producto
GROUP BY
    pr.Nombre_Producto
HAVING SUM(dp.Cantidad) > 3;

--5.5.4 Consulta 1: Productos cuyo stock actual es menor al promedio del inventario.

SELECT
    p.Nombre_Producto,
    i.Stock_Actual
FROM Producto p
INNER JOIN Inventario i
    ON p.Id_Producto = i.Id_Producto
WHERE i.Stock_Actual < (
    SELECT AVG(Stock_Actual)
    FROM Inventario
);

--5.5.4 Consulta 2: Clientes que realizaron pedidos con un importe mayor al promedio.

SELECT
    c.Nombre,
    p.Id_Pedido,
    p.Precio_Total
FROM Cliente c
INNER JOIN Pedido p
    ON c.Id_Cliente = p.Id_Cliente
WHERE p.Precio_Total > (
    SELECT AVG(Precio_Total)
    FROM Pedido
);

--5.5.4 Consulta 3: Productos que nunca han sido solicitados en un pedido.

SELECT
    Nombre_Producto
FROM Producto
WHERE Id_Producto NOT IN (
    SELECT Id_Producto
    FROM Detalle_Pedido
);

--5.5.5 Consulta 1: Total de ventas por cliente.

SELECT
    c.Nombre,
    SUM(p.Precio_Total) AS Total_Compras
FROM Cliente c
INNER JOIN Pedido p
    ON c.Id_Cliente = p.Id_Cliente
GROUP BY c.Nombre;

--5.5.5 Consulta 2: Cantidad de productos por categoría.

SELECT
    c.Nombre_Categoria,
    COUNT(p.Id_Producto) AS Cantidad_Productos
FROM Categoria c
INNER JOIN Producto p
    ON c.Id_Categoria = p.Id_Categoria
GROUP BY c.Nombre_Categoria;

--5.5.5 Consulta 3: Precio promedio de los productos por categoría.

SELECT
    c.Nombre_Categoria,
    AVG(p.Precio) AS Precio_Promedio
FROM Categoria c
INNER JOIN Producto p
    ON c.Id_Categoria = p.Id_Categoria
GROUP BY c.Nombre_Categoria;

--5.5.5 Consulta 4: Stock máximo y mínimo por categoría.

SELECT
    c.Nombre_Categoria,
    MAX(i.Stock_Actual) AS Stock_Maximo,
    MIN(i.Stock_Actual) AS Stock_Minimo
FROM Categoria c
INNER JOIN Producto p
    ON c.Id_Categoria = p.Id_Categoria
INNER JOIN Inventario i
    ON p.Id_Producto = i.Id_Producto
GROUP BY c.Nombre_Categoria;

--5.5.6 CASE 1: Clasificar el nivel de stock de los productos.

SELECT
    p.Nombre_Producto,
    i.Stock_Actual,
    CASE
        WHEN i.Stock_Actual <= p.Stock_Minimo THEN 'Stock Crítico'
        WHEN i.Stock_Actual <= p.Stock_Minimo + 10 THEN 'Stock Bajo'
        ELSE 'Stock Disponible'
    END AS Estado
FROM Producto p
INNER JOIN Inventario i
    ON p.Id_Producto = i.Id_Producto;

--5.5.6 CASE 2: Clasificar los pedidos según su valor.

SELECT
    Id_Pedido,
    Precio_Total,
    CASE
        WHEN Precio_Total < 500 THEN 'Pedido Pequeño'
        WHEN Precio_Total BETWEEN 500 AND 2000 THEN 'Pedido Mediano'
        ELSE 'Pedido Grande'
    END AS Clasificacion
FROM Pedido;

--5.5.6 CTE 1: Mostrar los productos con stock bajo.

WITH Stock_Bajo AS
(
    SELECT
        p.Nombre_Producto,
        i.Stock_Actual,
        p.Stock_Minimo
    FROM Producto p
    INNER JOIN Inventario i
        ON p.Id_Producto = i.Id_Producto
)

SELECT *
FROM Stock_Bajo
WHERE Stock_Actual <= Stock_Minimo;

--5.5.6 CTE 2: Mostrar un resumen de los pedidos con importe mayor a S/500.

WITH Resumen_Pedidos AS
(
    SELECT
        p.Id_Pedido,
        c.Nombre,
        p.Precio_Total
    FROM Pedido p
    INNER JOIN Cliente c
        ON p.Id_Cliente = c.Id_Cliente
)

SELECT *
FROM Resumen_Pedidos
WHERE Precio_Total > 500;


--5.6.1 Vista 1: Reporte general de inventario.

CREATE VIEW vw_ReporteInventario
AS
SELECT
    p.Nombre_Producto,
    c.Nombre_Categoria,
    i.Stock_Actual,
    p.Stock_Minimo,
    u.Codigo_Ubicacion
FROM Producto p
INNER JOIN Categoria c
    ON p.Id_Categoria = c.Id_Categoria
INNER JOIN Inventario i
    ON p.Id_Producto = i.Id_Producto
INNER JOIN Ubicacion u
    ON i.Id_Ubicacion = u.Codigo_Ubicacion;

SELECT * FROM vw_ReporteInventario

--5.6.1 Vista 2: Reporte general de pedidos.


CREATE VIEW vw_ReportePedidos
AS
SELECT
    p.Id_Pedido,
    c.Nombre AS Cliente,
    ep.Descripcion AS Estado,
    p.Precio_Total,
    p.Fecha_Pedido
FROM Pedido p
INNER JOIN Cliente c
    ON p.Id_Cliente = c.Id_Cliente
INNER JOIN Estado_Pedido ep
    ON p.Id_Estado_Pedido = ep.Id_Estado_Pedido;

SELECT * FROM vw_ReportePedidos

--5.6.1 Vista 3: Reporte general de productos.

CREATE VIEW vw_ReporteProductos
AS
SELECT
    p.Nombre_Producto,
    c.Nombre_Categoria,
    p.Precio,
    p.Stock_Minimo
FROM Producto p
INNER JOIN Categoria c
    ON p.Id_Categoria = c.Id_Categoria;

SELECT * FROM vw_ReporteProductos

--5.6.2 Vista 1: Mostrar usuarios sin visualizar la contraseña.

CREATE VIEW vw_Usuarios
AS
SELECT
    u.Id_Usuario,
    u.Nombre,
    u.Telefono,
    u.Correo,
    r.Nombre_Rol
FROM Usuario u
INNER JOIN Rol r
    ON u.Id_Rol = r.Id_Rol;

SELECT * FROM vw_Usuarios

--5.6.2 Vista 2: Mostrar la información básica de los clientes.

CREATE VIEW vw_Clientes
AS
SELECT
    Id_Cliente,
    Nombre,
    Telefono,
    Correo
FROM Cliente;

SELECT * FROM vw_Clientes

--5.6.3 Vista 1: Vista actualizable de productos.

CREATE VIEW vw_ProductoActualizable
AS
SELECT
    Id_Producto,
    Nombre_Producto,
    Descripcion,
    Precio,
    Stock_Minimo,
    Id_Categoria
FROM Producto;

UPDATE vw_ProductoActualizable
SET Precio = 3800
WHERE Id_Producto = 1;

SELECT * FROM vw_ProductoActualizable

--5.6.3 Vista 2: Vista actualizable de categorías.

CREATE VIEW vw_CategoriaActualizable
AS
SELECT
    Id_Categoria,
    Nombre_Categoria
FROM Categoria;

UPDATE vw_CategoriaActualizable
SET Nombre_Categoria = 'Equipos Electrónicos'
WHERE Id_Categoria = 1;

SELECT * FROM vw_CategoriaActualizable

--5.7.2 Índice Nonclustered 1: Búsqueda de productos por nombre.

CREATE NONCLUSTERED INDEX IX_Producto_Nombre
ON Producto(Nombre_Producto);

--5.7.2 Índice Nonclustered 2: Búsqueda de clientes por número de documento.

CREATE NONCLUSTERED INDEX IX_Cliente_Documento
ON Cliente(Num_Documento);

--5.7.2 Índice Nonclustered 3: Búsqueda de pedidos por fecha.

CREATE NONCLUSTERED INDEX IX_Pedido_Fecha
ON Pedido(Fecha_Pedido);


--5.7.3 Consulta 1: Optimización de búsqueda de productos por nombre.

SELECT *
FROM Producto
WHERE Nombre_Producto='Laptop Dell Inspiron';


--5.7.3 Consulta 2: Optimización de búsqueda de pedidos por fecha.

SELECT *
FROM Pedido
WHERE Fecha_Pedido='2026-07-08';

--5.8.1 Procedimiento 1: Registrar un nuevo cliente.

CREATE PROCEDURE sp_RegistrarCliente
    @Nombre VARCHAR(100),
    @Documento VARCHAR(20),
    @Telefono VARCHAR(15),
    @Correo VARCHAR(100),
    @Direccion VARCHAR(200)
AS
BEGIN

INSERT INTO Cliente
(
Nombre,
Num_Documento,
Telefono,
Correo,
Direccion
)
VALUES
(
@Nombre,
@Documento,
@Telefono,
@Correo,
@Direccion
);

END;

EXEC sp_RegistrarCliente
    @Nombre = 'Importaciones Lima SAC',
    @Documento = '20888888888',
    @Telefono = '987123456',
    @Correo = 'ventas@importlima.com',
    @Direccion = 'Av. Argentina 1500';

SELECT *
FROM Cliente
WHERE Num_Documento = '20888888888';

--5.8.1 Procedimiento 2: Registrar una nueva categoría.

CREATE PROCEDURE sp_RegistrarCategoria

@NombreCategoria VARCHAR(80)

AS
BEGIN

INSERT INTO Categoria
VALUES(@NombreCategoria);

END;

EXEC sp_RegistrarCategoria
    @NombreCategoria = 'Redes';

SELECT *
FROM Categoria
WHERE Nombre_Categoria = 'Redes';


--5.8.2 Procedimiento 1: Registrar cliente validando documento duplicado.

CREATE PROCEDURE sp_RegistrarClienteValidado

@Nombre VARCHAR(100),
@Documento VARCHAR(20),
@Telefono VARCHAR(15),
@Correo VARCHAR(100),
@Direccion VARCHAR(200)

AS

BEGIN

IF EXISTS
(
SELECT *
FROM Cliente
WHERE Num_Documento=@Documento
)

BEGIN

PRINT 'El cliente ya existe.'

END

ELSE

BEGIN

INSERT INTO Cliente
VALUES
(
@Nombre,
@Documento,
@Telefono,
@Correo,
@Direccion
)

END

END;

EXEC sp_RegistrarClienteValidado
    @Nombre = 'Cliente Duplicado',
    @Documento = '20111111111',
    @Telefono = '999888777',
    @Correo = 'duplicado@correo.com',
    @Direccion = 'Lima';



--5.8.2 Procedimiento 2: Registrar categoría validando nombre duplicado.

CREATE PROCEDURE sp_RegistrarCategoriaValidada

@Categoria VARCHAR(80)

AS

BEGIN

IF EXISTS
(
SELECT *
FROM Categoria
WHERE Nombre_Categoria=@Categoria
)

PRINT 'La categoría ya existe.'

ELSE

INSERT INTO Categoria
VALUES(@Categoria)

END;

EXEC sp_RegistrarCategoriaValidada
    @Categoria = 'Electrónica';


--5.8.3 Procedimiento 1: Buscar cliente por número de documento.

CREATE PROCEDURE sp_BuscarCliente

@Documento VARCHAR(20)

AS

BEGIN

SELECT *

FROM Cliente

WHERE Num_Documento=@Documento

END;

EXEC sp_BuscarCliente
    @Documento = '20111111111';

--5.8.3 Procedimiento 2: Buscar productos por categoría.

CREATE PROCEDURE sp_ProductosCategoria

@IdCategoria INT

AS

BEGIN

SELECT *

FROM Producto

WHERE Id_Categoria=@IdCategoria

END;

EXEC sp_ProductosCategoria
    @IdCategoria = 1;

--5.8.4 Procedimiento 1: Registrar un producto utilizando TRY...CATCH y transacciones.

CREATE PROCEDURE sp_InsertarProducto
    @Codigo VARCHAR(50),
    @Nombre VARCHAR(120),
    @Descripcion VARCHAR(300),
    @Precio DECIMAL(10,2),
    @StockMinimo INT,
    @IdCategoria INT
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION
            INSERT INTO Producto
            (
                Codigo_Producto,
                Nombre_Producto,
                Descripcion,
                Precio,
                Stock_Minimo,
                Id_Categoria
            )
            VALUES
            (
                @Codigo,
                @Nombre,
                @Descripcion,
                @Precio,
                @StockMinimo,
                @IdCategoria
            )
        COMMIT TRANSACTION
        PRINT 'Producto registrado correctamente.'
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION
        PRINT ERROR_MESSAGE()
    END CATCH
END;

EXEC sp_InsertarProducto
    @Codigo = 'PROD_ERR',
    @Nombre = 'Producto Error',
    @Descripcion = 'Prueba',
    @Precio = 100,
    @StockMinimo = 5,
    @IdCategoria = 999;

--5.9.1 Función Escalar 1: Calcular el subtotal de una venta.

CREATE FUNCTION fn_CalcularSubtotal

(
@Cantidad INT,
@Precio DECIMAL(10,2)
)

RETURNS DECIMAL(10,2)

AS

BEGIN

RETURN @Cantidad*@Precio

END;
----------------------------------------------------------------------------------
SELECT dbo.fn_CalcularSubtotal(5,420);

--5.9.1 Función Escalar 2: Obtener el estado del stock de un producto.

CREATE FUNCTION fn_EstadoStock

(
@StockActual INT,
@StockMinimo INT
)

RETURNS VARCHAR(30)

AS

BEGIN

DECLARE @Estado VARCHAR(30)

IF @StockActual<=@StockMinimo
SET @Estado='Stock Crítico'

ELSE
SET @Estado='Disponible'

RETURN @Estado

END;
----------------------------------------------------------------------------------
SELECT
Nombre_Producto,
dbo.fn_EstadoStock
(
i.Stock_Actual,
p.Stock_Minimo
)

FROM Producto p

INNER JOIN Inventario i

ON p.Id_Producto=i.Id_Producto;

--5.9.2 Función Tipo Tabla 1: Listar productos por categoría.

CREATE FUNCTION fn_ProductosCategoria

(
@IdCategoria INT
)

RETURNS TABLE

AS

RETURN

(
SELECT

Nombre_Producto,
Precio

FROM Producto

WHERE Id_Categoria=@IdCategoria

);

SELECT *
FROM dbo.fn_ProductosCategoria(1);

--5.9.2 Función Tipo Tabla 2: Listar pedidos realizados por un cliente.

CREATE FUNCTION fn_PedidosCliente

(
@IdCliente INT
)

RETURNS TABLE

AS

RETURN

(

SELECT

Id_Pedido,
Fecha_Pedido,
Precio_Total

FROM Pedido

WHERE Id_Cliente=@IdCliente

);

SELECT *
FROM dbo.fn_PedidosCliente(1);

--5.10.1 Trigger 1: Registrar en auditoría la inserción de un nuevo producto.

CREATE TRIGGER TR_Auditoria_Producto
ON Producto
AFTER INSERT
AS
BEGIN

INSERT INTO Auditoria_Sistema
(
Tabla_Afectada,
Accion,
Descripcion,
Id_Usuario
)

SELECT
'Producto',
'INSERT',
'Se registró un nuevo producto.',
1
FROM inserted;

END;
-------------------------------------------------
INSERT INTO Producto
(
    Codigo_Producto,
    Nombre_Producto,
    Descripcion,
    Precio,
    Stock_Minimo,
    Id_Categoria
)
VALUES
(
    'PROD010',
    'Disco SSD Kingston 1TB',
    'SSD NVMe',
    320.00,
    5,
    1
);
-----------------------------------------------
SELECT *
FROM Auditoria_Sistema;


--5.10.2 Trigger 1: Validar automáticamente el stock disponible antes de registrar un detalle de pedido.

CREATE TRIGGER TR_ValidarStockPedido
ON Detalle_Pedido
INSTEAD OF INSERT
AS
BEGIN

    IF EXISTS
    (
        SELECT 1
        FROM inserted i
        INNER JOIN Inventario inv
            ON i.Id_Producto = inv.Id_Producto
        WHERE i.Cantidad > inv.Stock_Actual
    )
    BEGIN
        RAISERROR('No hay suficiente stock para registrar el pedido.',16,1);
        RETURN;
    END;

    INSERT INTO Detalle_Pedido
    (
        Cantidad,
        Subtotal,
        Precio_Unitario,
        Id_Pedido,
        Id_Producto
    )
    SELECT
        Cantidad,
        Subtotal,
        Precio_Unitario,
        Id_Pedido,
        Id_Producto
    FROM inserted;

END;

-----------------------------------------------------------------------------
INSERT INTO Detalle_Pedido
(
Cantidad,
Subtotal,
Precio_Unitario,
Id_Pedido,
Id_Producto
)

VALUES
(
100,
350000,
3500,
1,
1
);


--5.10.3 Trigger 1: Registrar el historial de cambios del precio de un producto.


CREATE TABLE Historial_Precio

(
Id_Historial INT IDENTITY PRIMARY KEY,

Id_Producto INT,

Precio_Anterior DECIMAL(10,2),

Precio_Nuevo DECIMAL(10,2),

Fecha DATETIME DEFAULT GETDATE()

);
------------------------------------------------------------------
CREATE TRIGGER TR_HistorialPrecio
ON Producto
AFTER UPDATE
AS
BEGIN

INSERT INTO Historial_Precio
(
Id_Producto,
Precio_Anterior,
Precio_Nuevo
)

SELECT

d.Id_Producto,
d.Precio,
i.Precio

FROM deleted d

INNER JOIN inserted i

ON d.Id_Producto=i.Id_Producto

WHERE d.Precio<>i.Precio;

END;
--------------------------------------------------
UPDATE Producto

SET Precio=3600

WHERE Id_Producto=1;
-------------------------------------------------
SELECT *
FROM Historial_Precio;


--5.10.4 Trigger 1: Impedir la eliminación de categorías que tengan productos asociados.

CREATE TRIGGER TR_NoEliminarCategoria
ON Categoria
INSTEAD OF DELETE
AS
BEGIN

IF EXISTS
(
SELECT *

FROM Producto p

INNER JOIN deleted d

ON p.Id_Categoria=d.Id_Categoria
)

BEGIN

RAISERROR
(
'No se puede eliminar la categoría porque tiene productos asociados.',
16,
1
);

RETURN;

END

DELETE FROM Categoria

WHERE Id_Categoria IN
(
SELECT Id_Categoria
FROM deleted
);

END;
-----------------------------------------------------------
DELETE FROM Categoria
WHERE Id_Categoria=1;

-- ==============================================================================
-- IMPLEMENTACIÓN DE REQUERIMIENTOS FUNCIONALES
-- CODIGO ADICIONAL: PROCEDIMIENTOS ALMACENADOS, VISTAS Y TRIGGERS AVANZADOS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- RF-01: REGISTRO DE PRODUCTOS CON CÓDIGO, NOMBRE, DESCRIPCIÓN, CATEGORÍA Y STOCK INICIAL
-- ------------------------------------------------------------------------------
GO
CREATE OR ALTER PROCEDURE sp_RegistrarProductoWMS
    @Codigo_Producto VARCHAR(50),
    @Nombre_Producto VARCHAR(120),
    @Descripcion VARCHAR(300),
    @Precio DECIMAL(10,2),
    @Stock_Minimo INT,
    @Id_Categoria INT,
    @Stock_Inicial INT,
    @Id_Ubicacion VARCHAR(20),
    @Id_Usuario INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM Producto WHERE Codigo_Producto = @Codigo_Producto)
        BEGIN
            THROW 51000, 'El código de producto ya existe.', 1;
        END

        IF NOT EXISTS (SELECT 1 FROM Categoria WHERE Id_Categoria = @Id_Categoria)
        BEGIN
            THROW 51001, 'La categoría especificada no existe.', 1;
        END

        IF NOT EXISTS (SELECT 1 FROM Ubicacion WHERE Codigo_Ubicacion = @Id_Ubicacion)
        BEGIN
            THROW 51002, 'La ubicación especificada no existe.', 1;
        END

        IF @Stock_Inicial < 0
        BEGIN
            THROW 51003, 'El stock inicial no puede ser negativo.', 1;
        END

        BEGIN TRANSACTION;

        INSERT INTO Producto (Codigo_Producto, Nombre_Producto, Descripcion, Precio, Stock_Minimo, Id_Categoria)
        VALUES (@Codigo_Producto, @Nombre_Producto, @Descripcion, @Precio, @Stock_Minimo, @Id_Categoria);

        DECLARE @New_Id_Producto INT = SCOPE_IDENTITY();

        INSERT INTO Inventario (Stock_Actual, Estado_Stock, Id_Producto, Id_Ubicacion)
        VALUES (@Stock_Inicial, 'Disponible', @New_Id_Producto, @Id_Ubicacion);

        DECLARE @New_Id_Inventario INT = SCOPE_IDENTITY();

        -- Si hay stock inicial mayor a 0, se registra un movimiento de entrada
        IF @Stock_Inicial > 0
        BEGIN
            INSERT INTO Movimiento_Inventario (Observacion, Id_Usuario, Id_Tipo_Movimiento)
            VALUES ('Registro de Stock Inicial del producto ' + @Codigo_Producto, @Id_Usuario, 1); -- 1 = Entrada

            DECLARE @New_Id_Movimiento INT = SCOPE_IDENTITY();

            INSERT INTO Detalle_Movimiento (Cantidad, Id_Movimiento_Inventario, Id_Inventario)
            VALUES (@Stock_Inicial, @New_Id_Movimiento, @New_Id_Inventario);
        END

        COMMIT TRANSACTION;
        PRINT 'Producto y Stock Inicial registrados correctamente.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ------------------------------------------------------------------------------
-- RF-02: REGISTRO DE CATEGORÍAS
-- ------------------------------------------------------------------------------
GO
CREATE OR ALTER PROCEDURE sp_RegistrarCategoriaWMS
    @Nombre_Categoria VARCHAR(80)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM Categoria WHERE Nombre_Categoria = @Nombre_Categoria)
        BEGIN
            THROW 51004, 'La categoría ya está registrada.', 1;
        END

        BEGIN TRANSACTION;
        INSERT INTO Categoria (Nombre_Categoria)
        VALUES (@Nombre_Categoria);
        COMMIT TRANSACTION;
        PRINT 'Categoría registrada correctamente.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ------------------------------------------------------------------------------
-- RF-03: REGISTRO DE UBICACIONES FÍSICAS (PASILLOS, ESTANTES, NIVELES)
-- ------------------------------------------------------------------------------
GO
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
        BEGIN
            THROW 51005, 'La ubicación ya existe en el almacén.', 1;
        END

        BEGIN TRANSACTION;
        INSERT INTO Ubicacion (Codigo_Ubicacion, Pasillo, Estante, Nivel)
        VALUES (@Codigo_Ubicacion, UPPER(@Pasillo), @Estante, @Nivel);
        COMMIT TRANSACTION;
        PRINT 'Ubicación registrada correctamente: ' + @Codigo_Ubicacion;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ------------------------------------------------------------------------------
-- RF-04: REGISTRO DE ENTRADAS DE PRODUCTOS AL INVENTARIO
-- ------------------------------------------------------------------------------
GO
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
        BEGIN
            THROW 51006, 'El producto no existe.', 1;
        END

        IF NOT EXISTS (SELECT 1 FROM Ubicacion WHERE Codigo_Ubicacion = @Codigo_Ubicacion)
        BEGIN
            THROW 51007, 'La ubicación no existe.', 1;
        END

        IF @Cantidad <= 0
        BEGIN
            THROW 51008, 'La cantidad de entrada debe ser mayor a cero.', 1;
        END

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
            UPDATE Inventario 
            SET Stock_Actual = Stock_Actual + @Cantidad 
            WHERE Id_Inventario = @Id_Inventario;
        END

        -- Registrar Movimiento de Inventario
        INSERT INTO Movimiento_Inventario (Observacion, Id_Usuario, Id_Tipo_Movimiento)
        VALUES (COALESCE(@Observacion, 'Entrada de mercadería de producto ' + @Codigo_Producto), @Id_Usuario, 1); -- 1 = Entrada

        DECLARE @Id_Movimiento INT = SCOPE_IDENTITY();

        INSERT INTO Detalle_Movimiento (Cantidad, Id_Movimiento_Inventario, Id_Inventario)
        VALUES (@Cantidad, @Id_Movimiento, @Id_Inventario);

        COMMIT TRANSACTION;
        PRINT 'Entrada registrada y stock actualizado.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ------------------------------------------------------------------------------
-- RF-05: REGISTRO DE SALIDAS DE PRODUCTOS DEL INVENTARIO
-- ------------------------------------------------------------------------------
GO
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
        BEGIN
            THROW 51009, 'El producto no existe.', 1;
        END

        IF NOT EXISTS (SELECT 1 FROM Ubicacion WHERE Codigo_Ubicacion = @Codigo_Ubicacion)
        BEGIN
            THROW 51010, 'La ubicación no existe.', 1;
        END

        IF @Cantidad <= 0
        BEGIN
            THROW 51011, 'La cantidad de salida debe ser mayor a cero.', 1;
        END

        BEGIN TRANSACTION;

        DECLARE @Id_Inventario INT;
        DECLARE @Stock_Actual INT;
        SELECT @Id_Inventario = Id_Inventario, @Stock_Actual = Stock_Actual
        FROM Inventario 
        WHERE Id_Producto = @Id_Producto AND Id_Ubicacion = @Codigo_Ubicacion;

        IF @Id_Inventario IS NULL OR @Stock_Actual < @Cantidad
        BEGIN
            THROW 51012, 'No hay stock suficiente en la ubicación indicada.', 1;
        END

        UPDATE Inventario 
        SET Stock_Actual = Stock_Actual - @Cantidad 
        WHERE Id_Inventario = @Id_Inventario;

        -- Registrar Movimiento de Inventario
        INSERT INTO Movimiento_Inventario (Observacion, Id_Usuario, Id_Tipo_Movimiento)
        VALUES (COALESCE(@Observacion, 'Salida de mercadería de producto ' + @Codigo_Producto), @Id_Usuario, 2); -- 2 = Salida

        DECLARE @Id_Movimiento INT = SCOPE_IDENTITY();

        INSERT INTO Detalle_Movimiento (Cantidad, Id_Movimiento_Inventario, Id_Inventario)
        VALUES (@Cantidad, @Id_Movimiento, @Id_Inventario);

        COMMIT TRANSACTION;
        PRINT 'Salida registrada y stock actualizado.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ------------------------------------------------------------------------------
-- RF-06: REGISTRO DE DEVOLUCIONES DE PRODUCTOS Y ACTUALIZAR EL STOCK
-- ------------------------------------------------------------------------------
GO
IF NOT EXISTS (SELECT 1 FROM Tipo_Movimiento WHERE Id_Tipo_Movimiento = 4)
BEGIN
    SET IDENTITY_INSERT Tipo_Movimiento ON;
    INSERT INTO Tipo_Movimiento (Id_Tipo_Movimiento, Descripcion) VALUES (4, 'Devolución');
    SET IDENTITY_INSERT Tipo_Movimiento OFF;
END
GO
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
        BEGIN
            THROW 51013, 'El producto no existe.', 1;
        END

        IF NOT EXISTS (SELECT 1 FROM Ubicacion WHERE Codigo_Ubicacion = @Codigo_Ubicacion)
        BEGIN
            THROW 51014, 'La ubicación no existe.', 1;
        END

        IF @Cantidad <= 0
        BEGIN
            THROW 51015, 'La cantidad de devolución debe ser mayor a cero.', 1;
        END

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
            UPDATE Inventario 
            SET Stock_Actual = Stock_Actual + @Cantidad 
            WHERE Id_Inventario = @Id_Inventario;
        END

        -- Registrar Movimiento de Inventario
        INSERT INTO Movimiento_Inventario (Observacion, Id_Usuario, Id_Tipo_Movimiento)
        VALUES (COALESCE(@Observacion, 'Devolución de producto ' + @Codigo_Producto), @Id_Usuario, 4); -- 4 = Devolución

        DECLARE @Id_Movimiento INT = SCOPE_IDENTITY();

        INSERT INTO Detalle_Movimiento (Cantidad, Id_Movimiento_Inventario, Id_Inventario)
        VALUES (@Cantidad, @Id_Movimiento, @Id_Inventario);

        COMMIT TRANSACTION;
        PRINT 'Devolución registrada e inventario actualizado.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ------------------------------------------------------------------------------
-- RF-07: CONSULTA DISPONIBILIDAD DE STOCK EN TIEMPO REAL (VISTA)
-- ------------------------------------------------------------------------------
GO
CREATE OR ALTER VIEW vw_StockTiempoReal
AS
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

-- ------------------------------------------------------------------------------
-- RF-08: CONSULTA DEL HISTORIAL DE MOVIMIENTOS DE INVENTARIO (VISTA)
-- ------------------------------------------------------------------------------
GO
CREATE OR ALTER VIEW vw_HistorialMovimientos
AS
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

-- ------------------------------------------------------------------------------
-- RF-09: CONSULTA DEL ESTADO ACTUAL DE LOS PEDIDOS (VISTA)
-- ------------------------------------------------------------------------------
GO
CREATE OR ALTER VIEW vw_EstadoActualPedidos
AS
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

-- ------------------------------------------------------------------------------
-- RF-10: REPORTE DE PRODUCTOS CON BAJO STOCK
-- ------------------------------------------------------------------------------
GO
CREATE OR ALTER PROCEDURE sp_ReporteProductosBajoStock
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        p.Codigo_Producto,
        p.Nombre_Producto,
        c.Nombre_Categoria,
        p.Stock_Minimo,
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

-- ------------------------------------------------------------------------------
-- RF-11: REPORTE DE ENTRADAS, SALIDAS Y DEVOLUCIONES DE PRODUCTOS
-- ------------------------------------------------------------------------------
GO
CREATE OR ALTER PROCEDURE sp_ReporteMovimientosPorRango
    @FechaInicio DATETIME2,
    @FechaFin DATETIME2,
    @Id_Tipo_Movimiento INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        mi.Id_Movimiento_Inventario,
        mi.Fecha_Movimiento,
        tm.Descripcion AS Tipo_Movimiento,
        p.Codigo_Producto,
        p.Nombre_Producto,
        dm.Cantidad,
        i.Id_Ubicacion AS Codigo_Ubicacion,
        u.Nombre AS Usuario,
        mi.Observacion
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

-- ------------------------------------------------------------------------------
-- RF-12: REPORTE DE PEDIDOS PROCESADOS Y PENDIENTES
-- ------------------------------------------------------------------------------
GO
CREATE OR ALTER PROCEDURE sp_ReportePedidosPorEstado
    @Id_Estado_Pedido INT = NULL -- NULL para listar todos
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        p.Id_Pedido,
        p.Fecha_Pedido,
        c.Nombre AS Cliente,
        ep.Descripcion AS Estado_Pedido,
        p.Precio_Total,
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

-- ------------------------------------------------------------------------------
-- RF-13: VALIDAR LA DISPONIBILIDAD DE STOCK ANTES DE CONFIRMAR UN PEDIDO
-- ------------------------------------------------------------------------------
GO
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
        FROM Producto 
        WHERE Codigo_Producto = @Codigo_Producto;

        IF @Id_Producto IS NULL
        BEGIN
            THROW 51016, 'El producto especificado no existe.', 1;
        END

        IF @Cantidad <= 0
        BEGIN
            THROW 51017, 'La cantidad solicitada debe ser mayor a cero.', 1;
        END

        -- Validar el stock actual total disponible en inventario
        DECLARE @Stock_Disponible INT;
        SELECT @Stock_Disponible = COALESCE(SUM(Stock_Actual), 0)
        FROM Inventario
        WHERE Id_Producto = @Id_Producto;

        IF @Stock_Disponible < @Cantidad
        BEGIN
            THROW 51018, 'Stock insuficiente para confirmar este producto en el pedido.', 1;
        END

        BEGIN TRANSACTION;

        DECLARE @Subtotal DECIMAL(10,2) = @Cantidad * @Precio_Unitario;

        -- Insertar el detalle
        INSERT INTO Detalle_Pedido (Cantidad, Subtotal, Precio_Unitario, Id_Pedido, Id_Producto)
        VALUES (@Cantidad, @Subtotal, @Precio_Unitario, @Id_Pedido, @Id_Producto);

        -- Actualizar el total del pedido
        UPDATE Pedido
        SET Precio_Total = Precio_Total + @Subtotal
        WHERE Id_Pedido = @Id_Pedido;

        COMMIT TRANSACTION;
        PRINT 'Item registrado y stock validado correctamente.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ------------------------------------------------------------------------------
-- RF-14: IMPEDIR REGISTRAR CANTIDADES NEGATIVAS EN EL INVENTARIO
-- ------------------------------------------------------------------------------
-- Nota: La restricción ya existe a nivel físico en la definición de la tabla:
-- ALTER TABLE Inventario ADD CONSTRAINT CK_Inventario_Stock CHECK(Stock_Actual >= 0);
-- Sin embargo, implementaremos un trigger para reforzar a nivel transaccional:
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
        RETURN;
    END
END;
GO

-- ------------------------------------------------------------------------------
-- RF-15: VALIDAR QUE CADA PRODUCTO ESTÉ ASIGNADO A UNA UBICACIÓN DEL ALMACÉN
-- ------------------------------------------------------------------------------
-- Nota: La restricción se da a nivel físico debido a que Id_Ubicacion es VARCHAR(20) NOT NULL en Inventario
-- y tiene una FK hacia Ubicacion(Codigo_Ubicacion). 
-- Para agregar lógica adicional, creamos un trigger que valida asignaciones en Inventario.
GO
CREATE OR ALTER TRIGGER TR_ValidarAsignacionUbicacion
ON Inventario
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM inserted i
        LEFT JOIN Ubicacion u ON i.Id_Ubicacion = u.Codigo_Ubicacion
        WHERE u.Codigo_Ubicacion IS NULL
    )
    BEGIN
        RAISERROR ('El producto debe ser asignado a una ubicación física válida dentro del almacén.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- ------------------------------------------------------------------------------
-- RF-16: MANTENIMIENTO DE DATOS (ACTUALIZACIONES)
-- ------------------------------------------------------------------------------
GO
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
        BEGIN
            THROW 51019, 'El producto a actualizar no existe.', 1;
        END

        IF NOT EXISTS (SELECT 1 FROM Categoria WHERE Id_Categoria = @Id_Categoria)
        BEGIN
            THROW 51020, 'La categoría especificada no existe.', 1;
        END

        BEGIN TRANSACTION;
        UPDATE Producto
        SET Nombre_Producto = @Nombre_Producto,
            Descripcion = @Descripcion,
            Precio = @Precio,
            Stock_Minimo = @Stock_Minimo,
            Id_Categoria = @Id_Categoria
        WHERE Id_Producto = @Id_Producto;
        COMMIT TRANSACTION;
        PRINT 'Producto actualizado correctamente.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE sp_ActualizarCategoriaWMS
    @Id_Categoria INT,
    @Nombre_Categoria VARCHAR(80)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Categoria WHERE Id_Categoria = @Id_Categoria)
        BEGIN
            THROW 51021, 'La categoría a actualizar no existe.', 1;
        END

        BEGIN TRANSACTION;
        UPDATE Categoria
        SET Nombre_Categoria = @Nombre_Categoria
        WHERE Id_Categoria = @Id_Categoria;
        COMMIT TRANSACTION;
        PRINT 'Categoría actualizada correctamente.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

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
        BEGIN
            THROW 51022, 'La ubicación a actualizar no existe.', 1;
        END

        BEGIN TRANSACTION;
        -- Si cambia el pasillo, estante o nivel, cambiamos el código primario de ubicación
        -- Nota: debido a llaves foráneas, esto requiere ON UPDATE CASCADE o manejo manual.
        -- Como la tabla tiene FK en Inventario, actualizaremos los campos físicos.
        UPDATE Ubicacion
        SET Pasillo = UPPER(@Pasillo),
            Estante = @Estante,
            Nivel = @Nivel
        WHERE Codigo_Ubicacion = @Codigo_Ubicacion;
        COMMIT TRANSACTION;
        PRINT 'Información física de ubicación actualizada.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ------------------------------------------------------------------------------
-- RF-17: ELIMINAR REGISTROS OBSOLETOS O INCORRECTOS (BORRADO SEGURO)
-- ------------------------------------------------------------------------------
GO
CREATE OR ALTER PROCEDURE sp_EliminarProductoWMS
    @Id_Producto INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Producto WHERE Id_Producto = @Id_Producto)
        BEGIN
            THROW 51023, 'El producto no existe.', 1;
        END

        -- Validar si tiene stock asociado o movimientos
        IF EXISTS (SELECT 1 FROM Inventario WHERE Id_Producto = @Id_Producto AND Stock_Actual > 0)
        BEGIN
            THROW 51024, 'No se puede eliminar el producto porque tiene existencias en stock.', 1;
        END

        BEGIN TRANSACTION;
        -- Eliminar dependencias inactivas en inventario con stock 0
        DELETE FROM Inventario WHERE Id_Producto = @Id_Producto;
        -- Eliminar el producto
        DELETE FROM Producto WHERE Id_Producto = @Id_Producto;
        COMMIT TRANSACTION;
        PRINT 'Producto eliminado correctamente.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE sp_EliminarCategoriaWMS
    @Id_Categoria INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Categoria WHERE Id_Categoria = @Id_Categoria)
        BEGIN
            THROW 51025, 'La categoría no existe.', 1;
        END

        IF EXISTS (SELECT 1 FROM Producto WHERE Id_Categoria = @Id_Categoria)
        BEGIN
            THROW 51026, 'No se puede eliminar la categoría porque tiene productos asociados.', 1;
        END

        BEGIN TRANSACTION;
        DELETE FROM Categoria WHERE Id_Categoria = @Id_Categoria;
        COMMIT TRANSACTION;
        PRINT 'Categoría eliminada correctamente.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ------------------------------------------------------------------------------
-- RF-18: AUTENTICACIÓN DE USUARIOS MEDIANTE USUARIO Y CONTRASEÑA
-- ------------------------------------------------------------------------------
GO
CREATE OR ALTER PROCEDURE sp_AutenticarUsuarioWMS
    @Correo VARCHAR(100),
    @Contrasena VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    -- Para esta implementación académica y demo:
    -- Buscamos el usuario por su correo y verificamos si coincide su contraseña en texto plano o hash.
    SELECT 
        u.Id_Usuario,
        u.Nombre,
        u.Correo,
        r.Nombre_Rol AS Rol
    FROM Usuario u
    INNER JOIN Rol r ON u.Id_Rol = r.Id_Rol
    WHERE u.Correo = @Correo 
      AND u.Contrasena = @Contrasena;
      
    IF @@ROWCOUNT = 0
    BEGIN
        PRINT 'Credenciales de acceso incorrectas.';
    END
    ELSE
    BEGIN
        PRINT 'Autenticación exitosa.';
    END
END;
GO

-- ------------------------------------------------------------------------------
-- RF-19: GESTIONAR ROLES DE ACCESO (ADMINISTRADOR, SUPERVISOR, OPERARIO)
-- ------------------------------------------------------------------------------
GO
CREATE OR ALTER PROCEDURE sp_AsignarRolUsuarioWMS
    @Id_Usuario INT,
    @Id_Rol INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Id_Usuario = @Id_Usuario)
        BEGIN
            THROW 51027, 'El usuario no existe.', 1;
        END

        IF NOT EXISTS (SELECT 1 FROM Rol WHERE Id_Rol = @Id_Rol)
        BEGIN
            THROW 51028, 'El rol especificado no existe.', 1;
        END

        BEGIN TRANSACTION;
        UPDATE Usuario
        SET Id_Rol = @Id_Rol
        WHERE Id_Usuario = @Id_Usuario;
        COMMIT TRANSACTION;
        PRINT 'Rol de usuario actualizado correctamente.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

