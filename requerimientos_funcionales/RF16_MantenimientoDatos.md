# RF16: Mantenimiento de Datos (Actualización de Productos, Categorías y Ubicaciones)

## Descripción
Este requerimiento comprende las operaciones CRUD básicas de actualización de información maestra en el sistema WMS. Para garantizar la seguridad del negocio y la trazabilidad, las actualizaciones de productos, categorías y ubicaciones físicas se ejecutan a través de procedimientos almacenados que validan la integridad referencial antes de guardar.

## Código SQL (Procedimientos de Mantenimiento/Edición)

```sql
-- 1. Actualizar Información de Productos
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
        -- Validar si el producto existe
        IF NOT EXISTS (SELECT 1 FROM Producto WHERE Id_Producto = @Id_Producto)
        BEGIN
            THROW 51019, 'El producto a actualizar no existe.', 1;
        END

        -- Validar que la categoría exista
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

-- 2. Actualizar Información de Categorías
CREATE OR ALTER PROCEDURE sp_ActualizarCategoriaWMS
    @Id_Categoria INT,
    @Nombre_Categoria VARCHAR(80)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Validar si la categoría existe
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

-- 3. Actualizar Información Física de Ubicaciones
CREATE OR ALTER PROCEDURE sp_ActualizarUbicacionWMS
    @Codigo_Ubicacion VARCHAR(20),
    @Pasillo VARCHAR(20),
    @Estante VARCHAR(20),
    @Nivel VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Validar si la ubicación existe
        IF NOT EXISTS (SELECT 1 FROM Ubicacion WHERE Codigo_Ubicacion = @Codigo_Ubicacion)
        BEGIN
            THROW 51022, 'La ubicación a actualizar no existe.', 1;
        END

        BEGIN TRANSACTION;
        -- Actualizar los parámetros espaciales asignados a ese código de ubicación
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
```

## Explicación del Código
1. **Validación de Identificadores Primarios**: Cada procedimiento verifica que la llave primaria (`Id_Producto`, `Id_Categoria`, `Codigo_Ubicacion`) exista antes de intentar hacer el `UPDATE`. De lo contrario, lanza una excepción y evita ejecuciones infructuosas.
2. **Encapsulamiento de Transacciones**: Aísla los cambios de datos en transacciones atómicas para prevenir actualizaciones parciales corruptas en el servidor de base de datos.

## Ejemplos de Ejecución

### 1. Actualizar datos de un producto (Ej. Producto ID = 1)
```sql
EXEC sp_ActualizarProductoWMS
    @Id_Producto = 1,
    @Nombre_Producto = 'Laptop Dell Inspiron 15 Plus',
    @Descripcion = 'Laptop Core i7 16GB RAM SSD 512GB',
    @Precio = 3850.00,
    @Stock_Minimo = 12,
    @Id_Categoria = 1;
```

### 2. Actualizar el nombre de una categoría (Ej. Categoría ID = 2)
```sql
EXEC sp_ActualizarCategoriaWMS
    @Id_Categoria = 2,
    @Nombre_Categoria = 'Oficina y Papelería';
```
