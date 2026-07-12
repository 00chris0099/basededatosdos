# RF06: Registro de Devoluciones de Productos y Actualización del Stock

## Descripción
Este requerimiento permite registrar la devolución de productos vendidos o despachados de vuelta al almacén. Al registrar una devolución, el sistema incrementa el stock actual en la ubicación seleccionada y registra la transacción en el historial de movimientos bajo el tipo **Devolución** (Id_Tipo_Movimiento = 4), asegurando que el stock regrese a estar disponible para futuras transacciones.

## Código SQL (Procedimiento Almacenado)

```sql
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

        -- Validaciones
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

        -- Buscar si el producto ya tiene un registro en esa ubicación
        DECLARE @Id_Inventario INT;
        SELECT @Id_Inventario = Id_Inventario 
        FROM Inventario 
        WHERE Id_Producto = @Id_Producto AND Id_Ubicacion = @Codigo_Ubicacion;

        IF @Id_Inventario IS NULL
        BEGIN
            -- Si no existe, crear la asignación en inventario con el stock de la devolución
            INSERT INTO Inventario (Stock_Actual, Estado_Stock, Id_Producto, Id_Ubicacion)
            VALUES (@Cantidad, 'Disponible', @Id_Producto, @Codigo_Ubicacion);
            SET @Id_Inventario = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            -- Si existe, incrementar el stock con la cantidad devuelta
            UPDATE Inventario 
            SET Stock_Actual = Stock_Actual + @Cantidad 
            WHERE Id_Inventario = @Id_Inventario;
        END

        -- Registrar Movimiento de Cabecera (Devolución = Tipo 4)
        INSERT INTO Movimiento_Inventario (Observacion, Id_Usuario, Id_Tipo_Movimiento)
        VALUES (COALESCE(@Observacion, 'Devolución de producto ' + @Codigo_Producto), @Id_Usuario, 4);

        DECLARE @Id_Movimiento INT = SCOPE_IDENTITY();

        -- Registrar Detalle de Movimiento
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
```

## Explicación del Código
1. **Verificación Inicial**: Asegura la validez física del producto y la ubicación física en la base de datos.
2. **Tipo de Movimiento Especial**: Utiliza la constante `Id_Tipo_Movimiento = 4`, que corresponde a "Devolución". El script de migración comprueba y crea automáticamente este tipo en la tabla catalogaria `Tipo_Movimiento` si no existiera previamente.
3. **Manejo de Stock (`UPSERT`)**:
   - Incrementa el stock si el producto ya estaba registrado en esa ubicación.
   - Crea un registro de inventario si el producto se está guardando en una ubicación nueva producto de la devolución.

## Ejemplo de Ejecución
```sql
EXEC sp_RegistrarDevolucionWMS
    @Codigo_Producto = 'PROD001',
    @Cantidad = 1,
    @Codigo_Ubicacion = 'A101',
    @Id_Usuario = 2, -- 2 = Supervisor
    @Observacion = 'Devolución por parte del cliente por insatisfacción con el empaque';
```
