# RF04: Registro de Entradas de Productos al Inventario

## Descripción
Este requerimiento permite registrar el ingreso de mercadería al almacén. Al registrar una entrada, el sistema incrementa el stock actual del producto en la ubicación física correspondiente. Si el producto no contaba con stock previo en dicha ubicación, se crea el registro correspondiente. Asimismo, el sistema registra el evento en la bitácora de movimientos del inventario (`Movimiento_Inventario` y `Detalle_Movimiento`) para mantener la trazabilidad.

## Código SQL (Procedimiento Almacenado)

```sql
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

        -- Validaciones
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

        -- Buscar si el producto ya tiene un registro en esa ubicación
        DECLARE @Id_Inventario INT;
        SELECT @Id_Inventario = Id_Inventario 
        FROM Inventario 
        WHERE Id_Producto = @Id_Producto AND Id_Ubicacion = @Codigo_Ubicacion;

        IF @Id_Inventario IS NULL
        BEGIN
            -- Si no existe, crear la asignación de inventario en la ubicación
            INSERT INTO Inventario (Stock_Actual, Estado_Stock, Id_Producto, Id_Ubicacion)
            VALUES (@Cantidad, 'Disponible', @Id_Producto, @Codigo_Ubicacion);
            SET @Id_Inventario = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            -- Si ya existe, incrementar el stock
            UPDATE Inventario 
            SET Stock_Actual = Stock_Actual + @Cantidad 
            WHERE Id_Inventario = @Id_Inventario;
        END

        -- Registrar Movimiento de Cabecera (Entrada = Tipo 1)
        INSERT INTO Movimiento_Inventario (Observacion, Id_Usuario, Id_Tipo_Movimiento)
        VALUES (COALESCE(@Observacion, 'Entrada de mercadería de producto ' + @Codigo_Producto), @Id_Usuario, 1);

        DECLARE @Id_Movimiento INT = SCOPE_IDENTITY();

        -- Registrar Detalle de Movimiento
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
```

## Explicación del Código
1. **Validaciones**: Se verifica que el código del producto y la ubicación ingresada existan, y que la cantidad ingresada sea estrictamente mayor que cero.
2. **Estructura Condicional (`UPSERT`)**: El procedimiento valida mediante un `SELECT` si el producto tiene asignado espacio en la ubicación descrita:
   - Si no existe, crea una nueva entrada en `Inventario`.
   - Si existe, realiza una actualización (`UPDATE`) sumando la nueva cantidad al stock disponible.
3. **Auditoría e Historial**: Se crea un registro en `Movimiento_Inventario` con `Id_Tipo_Movimiento = 1` (que corresponde a 'Entrada' en la parametrización) y se asocia el detalle en `Detalle_Movimiento` ligándolo a la llave primaria de la tabla `Inventario`.

## Ejemplo de Ejecución
```sql
EXEC sp_RegistrarEntradaWMS
    @Codigo_Producto = 'PROD001',
    @Cantidad = 10,
    @Codigo_Ubicacion = 'A101',
    @Id_Usuario = 1,
    @Observacion = 'Ingreso de laptops por orden de compra OC-450';
```
