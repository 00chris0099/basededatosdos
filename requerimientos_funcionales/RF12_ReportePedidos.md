# RF12: Reportes de Pedidos Procesados y Pendientes

## Descripción
Este requerimiento permite generar un reporte analítico de los pedidos registrados en el almacén. El usuario puede filtrar y agrupar los pedidos según su estado de procesamiento (ej. pedidos 'Pendientes' para priorizar el picking o pedidos 'Completados' para verificar entregas).

## Código SQL (Procedimiento Almacenado)

```sql
CREATE OR ALTER PROCEDURE sp_ReportePedidosPorEstado
    @Id_Estado_Pedido INT = NULL -- NULL para listar todos los estados
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        p.Id_Pedido,
        p.Fecha_Pedido,
        c.Nombre AS Cliente,
        ep.Descripcion AS Estado_Pedido,
        p.Precio_Total,
        COUNT(dp.Id_Detalle_Pedido) AS Cantidad_Items,
        SUM(dp.Cantidad) AS Total_Articulos
    FROM Pedido p
    INNER JOIN Cliente c ON p.Id_Cliente = c.Id_Cliente
    INNER JOIN Estado_Pedido ep ON p.Id_Estado_Pedido = ep.Id_Estado_Pedido
    LEFT JOIN Detalle_Pedido dp ON p.Id_Pedido = dp.Id_Pedido
    WHERE (@Id_Estado_Pedido IS NULL OR p.Id_Estado_Pedido = @Id_Estado_Pedido)
    GROUP BY p.Id_Pedido, p.Fecha_Pedido, c.Nombre, ep.Descripcion, p.Precio_Total
    ORDER BY p.Fecha_Pedido DESC;
END;
```

## Explicación del Código
1. **Agrupación y Métricas**: Utiliza la cláusula `GROUP BY` junto con funciones de agregación (`COUNT` y `SUM`) para resumir de forma ejecutiva cuántos renglones tiene cada orden y cuántos productos físicos individuales se comprometieron.
2. **Parámetro Dinámico**: Permite filtrar las órdenes de compra por su estado logístico o listarlas todas si no se especifica el parámetro.
3. **LEFT JOIN con Detalle**: Asegura que se muestren pedidos en el reporte incluso si por algún motivo no tienen detalles registrados (por ejemplo, pedidos recién creados en estado de borrador).

## Ejemplos de Ejecución

### 1. Consultar todos los pedidos pendientes (Estado_Pedido ID = 1)
```sql
EXEC sp_ReportePedidosPorEstado @Id_Estado_Pedido = 1;
```

### 2. Generar el reporte general de pedidos sin distinción de su estado
```sql
EXEC sp_ReportePedidosPorEstado;
```
