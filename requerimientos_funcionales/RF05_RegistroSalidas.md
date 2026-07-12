# RF05: Registro de Salidas de Productos del Inventario

## Descripción
Este requerimiento permite registrar salidas de inventario (despachos, mermas, ajustes de ventas). Para registrar una salida, el sistema debe descontar la cantidad especificada de la ubicación correspondiente. Se valida a nivel de base de datos que exista suficiente stock en la ubicación de origen antes de proceder. Además, se registra el evento en el historial de movimientos (`Movimiento_Inventario` y `Detalle_Movimiento`) para mantener la trazabilidad.

## Código SQL (Procedimiento Almacenado)

```sql
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

        -- Validaciones
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

        -- Verificar disponibilidad de stock en la ubicación
        DECLARE @Id_Inventario INT;
        DECLARE @Stock_Actual INT;
        SELECT @Id_Inventario = Id_Inventario, @Stock_Actual = Stock_Actual
        FROM Inventario 
        WHERE Id_Producto = @Id_Producto AND Id_Ubicacion = @Codigo_Ubicacion;

        -- Validar si hay stock suficiente en la ubicación exacta
        IF @Id_Inventario IS NULL OR @Stock_Actual < @Cantidad
        BEGIN
            THROW 51012, 'No hay stock suficiente en la ubicación indicada.', 1;
        END

        -- Actualizar stock restando la cantidad
        UPDATE Inventario 
        SET Stock_Actual = Stock_Actual - @Cantidad 
        WHERE Id_Inventario = @Id_Inventario;

        -- Registrar Movimiento de Cabecera (Salida = Tipo 2)
        INSERT INTO Movimiento_Inventario (Observacion, Id_Usuario, Id_Tipo_Movimiento)
        VALUES (COALESCE(@Observacion, 'Salida de mercadería de producto ' + @Codigo_Producto), @Id_Usuario, 2);

        DECLARE @Id_Movimiento INT = SCOPE_IDENTITY();

        -- Registrar Detalle de Movimiento
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
```

## Explicación del Código
1. **Validación de Disponibilidad**: El procedimiento verifica en la tabla `Inventario` que la llave compuesta (`Id_Producto`, `Id_Ubicacion`) tenga existencias iguales o superiores a la `@Cantidad` solicitada. Si no hay suficiente stock o no se encuentra el registro, aborta inmediatamente enviando un código de error personalizado.
2. **Resto de Stock**: Se ejecuta un `UPDATE` decrementando el valor de `Stock_Actual`.
3. **Historial del Movimiento**: Inserta en `Movimiento_Inventario` asignando `Id_Tipo_Movimiento = 2` (Salida) y registra el enlace en `Detalle_Movimiento`.

## Ejemplo de Ejecución
```sql
EXEC sp_RegistrarSalidaWMS
    @Codigo_Producto = 'PROD001',
    @Cantidad = 2,
    @Codigo_Ubicacion = 'A101',
    @Id_Usuario = 3, -- 3 = Operario
    @Observacion = 'Salida de mercadería para despacho de Pedido #123';
```
