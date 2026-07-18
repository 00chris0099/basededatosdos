-- =====================================================
-- SCRIPT: SPs para Pedidos (RF13)
-- Ejecutar en CloudBeaver sobre BD_WMS_ECOMMERCE
-- Solo crea los SPs nuevos, no toca tablas existentes
-- =====================================================

USE BD_WMS_ECOMMERCE;
GO

-- Borrar si existieran
DROP PROCEDURE IF EXISTS sp_AvanzarPedidoWMS;
DROP PROCEDURE IF EXISTS sp_CrearPedidoWMS;
GO

-- =====================================================
-- SP: Avanzar pedido con validación de stock
-- =====================================================
CREATE OR ALTER PROCEDURE sp_AvanzarPedidoWMS
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

        -- Validar stock para cada item del pedido (solo si esta Pendiente)
        IF @Estado_Actual = 'Pendiente'
        BEGIN
            DECLARE @ItemsSinStock TABLE (
                Codigo_Producto VARCHAR(50),
                Nombre_Producto VARCHAR(120),
                Cantidad_Solicitada INT,
                Stock_Disponible INT
            );

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

        -- Avanzar al siguiente estado
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
GO

-- =====================================================
-- SP: Crear pedido nuevo con items
-- =====================================================
CREATE OR ALTER PROCEDURE sp_CrearPedidoWMS
    @Id_Cliente INT,
    @Items NVARCHAR(MAX)  -- JSON: [{"Id_Producto":1,"Cantidad":2,"Precio_Unitario":3500.00}, ...]
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Cliente WHERE Id_Cliente = @Id_Cliente)
            THROW 51044, 'El cliente especificado no existe.', 1;

        IF @Items IS NULL OR @Items = ''
            THROW 51045, 'El pedido debe tener al menos un item.', 1;

        BEGIN TRANSACTION;

        -- Crear pedido
        INSERT INTO Pedido (Precio_Total, Id_Cliente, Id_Estado_Pedido)
        VALUES (0, @Id_Cliente, 1);  -- Estado 1 = Pendiente

        DECLARE @Nuevo_Pedido INT = SCOPE_IDENTITY();

        -- Insertar items desde JSON
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
GO

SELECT 'SPs de pedidos creados exitosamente' AS Resultado;
GO
