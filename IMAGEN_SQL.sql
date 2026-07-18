-- =====================================================
-- SCRIPT: Agregar columna Imagen a Producto
-- Ejecutar en CloudBeaver sobre BD_WMS_ECOMMERCE
-- =====================================================

USE BD_WMS_ECOMMERCE;
GO

-- 1. Agregar columna Imagen (VARCHAR(MAX) para Base64) si no existe
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Producto') AND name = 'Imagen')
    ALTER TABLE Producto ADD Imagen VARCHAR(MAX) NULL;
GO

-- 2. Actualizar sp_RegistrarProductoWMS para aceptar Imagen
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
    @Id_Marca INT = NULL,
    @Imagen VARCHAR(MAX) = NULL
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

        INSERT INTO Producto (Codigo_Producto, Nombre_Producto, Descripcion, Precio, Stock_Minimo, Id_Categoria, Id_Marca, Imagen)
        VALUES (@Codigo_Producto, @Nombre_Producto, @Descripcion, @Precio, @Stock_Minimo, @Id_Categoria, @Id_Marca, @Imagen);

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

-- 3. Actualizar sp_ActualizarProductoWMS para aceptar Imagen
CREATE OR ALTER PROCEDURE sp_ActualizarProductoWMS
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
GO

-- 4. Actualizar vw_StockTiempoReal para incluir todos los campos necesarios
DROP VIEW IF EXISTS vw_StockTiempoReal;
GO
CREATE OR ALTER VIEW vw_StockTiempoReal AS
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
GO

SELECT 'Columna Imagen agregada, SPs actualizados y vista vw_StockTiempoReal mejorada' AS Resultado;
GO
