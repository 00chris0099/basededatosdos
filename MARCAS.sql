-- =====================================================
-- SCRIPT: Agregar tabla Marca y modificar Producto
-- Ejecutar en CloudBeaver sobre BD_WMS_ECOMMERCE
-- =====================================================

USE BD_WMS_ECOMMERCE;
GO

-- 1. BORRAR OBJETOS RELACIONADOS (si existieran)
DROP PROCEDURE IF EXISTS sp_CrearMarcaWMS;
DROP PROCEDURE IF EXISTS sp_ListarMarcasWMS;
DROP PROCEDURE IF EXISTS sp_ListarMarcasPorCategoriaWMS;
DROP PROCEDURE IF EXISTS sp_EliminarMarcaWMS;
DROP PROCEDURE IF EXISTS sp_CrearCategoriaWMS;
GO

-- 2. BORRAR FK y columna de Producto (si existieran)
ALTER TABLE Producto DROP CONSTRAINT IF EXISTS FK_Producto_Marca;
ALTER TABLE Producto DROP COLUMN IF EXISTS Id_Marca;
GO

-- 3. BORRAR tabla Marca (si existiera)
DROP TABLE IF EXISTS Marca;
GO

-- 4. CREAR TABLA MARCA
CREATE TABLE Marca (
    Id_Marca INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_Marca VARCHAR(80) NOT NULL,
    Id_Categoria INT NOT NULL,
    CONSTRAINT UQ_Marca_Nombre_Categoria UNIQUE (Nombre_Marca, Id_Categoria),
    CONSTRAINT FK_Marca_Categoria FOREIGN KEY (Id_Categoria) REFERENCES Categoria(Id_Categoria)
);
GO

-- 5. AGREGAR COLUMNA Id_Marca A PRODUCTO
ALTER TABLE Producto ADD Id_Marca INT NULL;
GO

ALTER TABLE Producto ADD CONSTRAINT FK_Producto_Marca
    FOREIGN KEY (Id_Marca) REFERENCES Marca(Id_Marca);
GO

-- =====================================================
-- 6. STORED PROCEDURES
-- =====================================================

-- SP: Crear Marca
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

-- SP: Listar todas las marcas (con categoría)
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

-- SP: Listar marcas por categoría
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

-- SP: Eliminar Marca
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

-- SP: Crear Categoría
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
-- 7. MODIFICAR sp_RegistrarProductoWMS para aceptar Id_Marca
-- =====================================================

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

-- =====================================================
-- 8. DATOS SEMILLA - MARCAS POR CATEGORIA
-- =====================================================
-- Categoria 1 = Electronica
-- Categoria 2 = Oficina
-- Categoria 3 = Herramientas
-- Categoria 4 = Accesorios
-- Categoria 5 = Limpieza

INSERT INTO Marca (Nombre_Marca, Id_Categoria) VALUES
-- Electronica (1)
('Samsung', 1),
('LG', 1),
('Sony', 1),
('Apple', 1),
('Xiaomi', 1),
('Lenovo', 1),
('Dell', 1),
('HP', 1),

-- Oficina (2)
('Epson', 2),
('Brother', 2),
('Canon', 2),
('Xerox', 2),
('3M', 2),
('Pilot', 2),

-- Herramientas (3)
('Bosch', 3),
('DeWalt', 3),
('Makita', 3),
('Black+Decker', 3),
('Stanley', 3),
('Milwaukee', 3),
('Ingco', 3),

-- Accesorios (4)
('Logitech', 4),
('Baseus', 4),
('Anker', 4),
('Kingston', 4),
('SanDisk', 4),
('Corsair', 4),

-- Limpieza (5)
('Oxi', 5),
('Fabuloso', 5),
('Clorox', 5),
('Ajax', 5),
('Pinol', 5);
GO

SELECT 'Script MARCAS.sql ejecutado exitosamente' AS Resultado;
GO
