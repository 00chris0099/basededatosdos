# RF01: Registro de Productos con Código, Nombre, Descripción, Categoría y Stock Inicial

## Descripción
Este requerimiento permite registrar un nuevo producto en el catálogo del WMS. Al registrar el producto, se le asigna un código único (SKU) y se asocia a una categoría existente. Además, se registra el stock inicial del producto en una ubicación física del almacén y se crea automáticamente un movimiento de tipo **Entrada** para registrar el historial.

## Código SQL (Procedimiento Almacenado)

```sql
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
        -- Validar si el código ya existe
        IF EXISTS (SELECT 1 FROM Producto WHERE Codigo_Producto = @Codigo_Producto)
        BEGIN
            THROW 51000, 'El código de producto ya existe.', 1;
        END

        -- Validar si la categoría existe
        IF NOT EXISTS (SELECT 1 FROM Categoria WHERE Id_Categoria = @Id_Categoria)
        BEGIN
            THROW 51001, 'La categoría especificada no existe.', 1;
        END

        -- Validar si la ubicación física existe
        IF NOT EXISTS (SELECT 1 FROM Ubicacion WHERE Codigo_Ubicacion = @Id_Ubicacion)
        BEGIN
            THROW 51002, 'La ubicación especificada no existe.', 1;
        END

        -- Validar que el stock inicial no sea negativo
        IF @Stock_Inicial < 0
        BEGIN
            THROW 51003, 'El stock inicial no puede ser negativo.', 1;
        END

        BEGIN TRANSACTION;

        -- 1. Insertar el producto
        INSERT INTO Producto (Codigo_Producto, Nombre_Producto, Descripcion, Precio, Stock_Minimo, Id_Categoria)
        VALUES (@Codigo_Producto, @Nombre_Producto, @Descripcion, @Precio, @Stock_Minimo, @Id_Categoria);

        DECLARE @New_Id_Producto INT = SCOPE_IDENTITY();

        -- 2. Registrar el stock en el inventario asociado a la ubicación
        INSERT INTO Inventario (Stock_Actual, Estado_Stock, Id_Producto, Id_Ubicacion)
        VALUES (@Stock_Inicial, 'Disponible', @New_Id_Producto, @Id_Ubicacion);

        DECLARE @New_Id_Inventario INT = SCOPE_IDENTITY();

        -- 3. Si el stock inicial es mayor a 0, registrar la entrada en el historial
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
        -- Deshacer transacción si hay error
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
```

## Explicación del Código
1. **Validaciones Previas**: Antes de realizar cualquier cambio, se valida que el código del producto sea único, que la categoría y la ubicación existan en la base de datos, y que el stock inicial no sea negativo.
2. **Transaccionalidad (`BEGIN TRANSACTION`)**: Se usa una transacción para garantizar que si falla el registro en el inventario o en el movimiento de entrada, se deshaga la inserción del producto (`ROLLBACK`), manteniendo la base de datos en un estado consistente.
3. **`SCOPE_IDENTITY()`**: Se recupera el ID autogenerado del producto recién insertado para poder registrar el stock inicial en la tabla `Inventario` y relacionar el detalle de movimiento.

## Ejemplo de Ejecución
```sql
EXEC sp_RegistrarProductoWMS
    @Codigo_Producto = 'PROD020',
    @Nombre_Producto = 'Audífonos Sony WH-1000XM4',
    @Descripcion = 'Audífonos inalámbricos con cancelación de ruido',
    @Precio = 1200.00,
    @Stock_Minimo = 5,
    @Id_Categoria = 1,          -- 1 = Electrónica
    @Stock_Inicial = 15,
    @Id_Ubicacion = 'A101',      -- Ubicación en Pasillo A, Estante 01, Nivel 1
    @Id_Usuario = 1;            -- 1 = Usuario Administrador
```
