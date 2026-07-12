# RF13: Validación de Disponibilidad de Stock antes de Confirmar un Pedido

## Descripción
Este requerimiento del negocio asegura que no se confirmen ventas o pedidos de productos de los cuales no haya suficiente stock físico en las ubicaciones del almacén. Esta validación evita promesas de venta incumplidas y descuadres de stock en el sistema de comercio electrónico.

## Código SQL (Procedimiento Almacenado de Registro Validado)

```sql
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
        
        -- Obtener ID y precio actual del producto
        SELECT @Id_Producto = Id_Producto, @Precio_Unitario = Precio 
        FROM Producto 
        WHERE Codigo_Producto = @Codigo_Producto;

        -- Validar existencia del producto
        IF @Id_Producto IS NULL
        BEGIN
            THROW 51016, 'El producto especificado no existe.', 1;
        END

        -- Validar cantidad lógica
        IF @Cantidad <= 0
        BEGIN
            THROW 51017, 'La cantidad solicitada debe ser mayor a cero.', 1;
        END

        -- VALIDACIÓN CRÍTICA: Obtener el stock disponible acumulado en el inventario físico
        DECLARE @Stock_Disponible INT;
        SELECT @Stock_Disponible = COALESCE(SUM(Stock_Actual), 0)
        FROM Inventario
        WHERE Id_Producto = @Id_Producto;

        -- Comparar existencias con la cantidad solicitada
        IF @Stock_Disponible < @Cantidad
        BEGIN
            THROW 51018, 'Stock insuficiente para confirmar este producto en el pedido.', 1;
        END

        -- Si pasa la validación, insertar de forma segura en transacción
        BEGIN TRANSACTION;

        DECLARE @Subtotal DECIMAL(10,2) = @Cantidad * @Precio_Unitario;

        -- 1. Insertar el renglón del detalle del pedido
        INSERT INTO Detalle_Pedido (Cantidad, Subtotal, Precio_Unitario, Id_Pedido, Id_Producto)
        VALUES (@Cantidad, @Subtotal, @Precio_Unitario, @Id_Pedido, @Id_Producto);

        -- 2. Incrementar el total consolidado de la cabecera del pedido
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
```

## Explicación del Código
1. **Validación Preventiva**: Antes de iniciar una transacción o escribir en disco, el procedimiento calcula el stock global disponible del producto mediante un `SUM(Stock_Actual)`. Si la cantidad solicitada excede la disponible, la consulta es rechazada inmediatamente con un error de nivel 16 mediante `THROW`.
2. **Consistencia Transaccional**: La inserción del detalle y la actualización del monto de la cabecera del pedido se realizan dentro de una misma transacción. Si falla cualquiera de estas operaciones, todo se revierte a su estado anterior.

## Ejemplo de Ejecución

### 1. Intento de compra exitoso (Stock disponible)
```sql
-- Supongamos que el producto PROD001 tiene 30 unidades en inventario
EXEC sp_RegistrarDetallePedidoValidado
    @Id_Pedido = 3,
    @Codigo_Producto = 'PROD001',
    @Cantidad = 2; -- Pasa validación exitosamente
```

### 2. Intento de compra fallido (Exceso de stock)
```sql
-- Intentamos pedir 500 unidades
EXEC sp_RegistrarDetallePedidoValidado
    @Id_Pedido = 3,
    @Codigo_Producto = 'PROD001',
    @Cantidad = 500; -- Lanzará excepción: 'Stock insuficiente para confirmar...'
```
