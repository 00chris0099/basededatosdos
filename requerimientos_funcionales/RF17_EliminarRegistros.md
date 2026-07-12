# RF17: Eliminación Segura de Registros Obsoletos o Incorrectos

## Descripción
Este requerimiento permite la depuración y eliminación de registros del sistema (borrado de productos o categorías obsoletas). Para resguardar la consistencia e integridad referencial de la base de datos, el sistema impide la eliminación de registros principales si existen transacciones históricas de inventario o pedidos asociadas a ellos.

## Código SQL (Procedimientos de Eliminación Segura)

```sql
-- 1. Eliminación Segura de Productos
CREATE OR ALTER PROCEDURE sp_EliminarProductoWMS
    @Id_Producto INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Validar si el producto existe
        IF NOT EXISTS (SELECT 1 FROM Producto WHERE Id_Producto = @Id_Producto)
        BEGIN
            THROW 51023, 'El producto no existe.', 1;
        END

        -- Validar si el producto posee existencias activas en stock
        IF EXISTS (SELECT 1 FROM Inventario WHERE Id_Producto = @Id_Producto AND Stock_Actual > 0)
        BEGIN
            THROW 51024, 'No se puede eliminar el producto porque tiene existencias activas en stock.', 1;
        END

        -- Validar si tiene pedidos asociados
        IF EXISTS (SELECT 1 FROM Detalle_Pedido WHERE Id_Producto = @Id_Producto)
        BEGIN
            THROW 51024, 'No se puede eliminar el producto porque está asociado a pedidos históricos.', 1;
        END

        BEGIN TRANSACTION;
        -- Eliminar los registros de stock en cero asignados al producto
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

-- 2. Eliminación Segura de Categorías
CREATE OR ALTER PROCEDURE sp_EliminarCategoriaWMS
    @Id_Categoria INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Validar existencia
        IF NOT EXISTS (SELECT 1 FROM Categoria WHERE Id_Categoria = @Id_Categoria)
        BEGIN
            THROW 51025, 'La categoría no existe.', 1;
        END

        -- Validar si tiene productos vinculados
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
```

## Explicación del Código
1. **Validaciones de Restricciones del Negocio**:
   - `sp_EliminarProductoWMS`: Verifica si existen registros de stock mayor a 0 o pedidos históricos en `Detalle_Pedido`. Si los hay, bloquea la acción para no violar la integridad referencial.
   - `sp_EliminarCategoriaWMS`: Verifica que la categoría no contenga productos asociados. Si existen productos en ella, rechaza la eliminación.
2. **Borrado en Cascada Controlado**: Si el producto tiene registros de inventario con cantidad `0` (ubicaciones asignadas vacías), el procedimiento los limpia en la tabla `Inventario` antes de eliminar al `Producto` padre, evitando errores de clave foránea.

## Ejemplos de Ejecución

### 1. Intento de eliminación fallido (Producto con stock o histórico)
```sql
EXEC sp_EliminarProductoWMS @Id_Producto = 1;
-- Retornará error indicando la existencia de histórico o existencias activas.
```

### 2. Eliminación de categoría sin dependencias
```sql
EXEC sp_EliminarCategoriaWMS @Id_Categoria = 6; -- Categoría vacía recién creada
```
