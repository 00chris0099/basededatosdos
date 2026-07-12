# RF10: Reporte de Productos con Bajo Stock

## Descripción
Este requerimiento genera un reporte de alerta temprana sobre los productos cuyas existencias totales acumuladas en todas las ubicaciones del almacén son iguales o menores que su stock mínimo de seguridad parametrizado. Permite al departamento de compras reabastecer oportunamente los productos críticos.

## Código SQL (Procedimiento Almacenado)

```sql
CREATE OR ALTER PROCEDURE sp_ReporteProductosBajoStock
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        p.Codigo_Producto,
        p.Nombre_Producto,
        c.Nombre_Categoria,
        p.Stock_Minimo,
        COALESCE(SUM(i.Stock_Actual), 0) AS Stock_Total_Actual,
        CASE 
            WHEN COALESCE(SUM(i.Stock_Actual), 0) = 0 THEN 'Sin Stock'
            WHEN COALESCE(SUM(i.Stock_Actual), 0) <= p.Stock_Minimo THEN 'Alerta: Bajo Stock'
            ELSE 'Disponible'
        END AS Estado_Alerta
    FROM Producto p
    INNER JOIN Categoria c ON p.Id_Categoria = c.Id_Categoria
    LEFT JOIN Inventario i ON p.Id_Producto = i.Id_Producto
    GROUP BY p.Codigo_Producto, p.Nombre_Producto, c.Nombre_Categoria, p.Stock_Minimo
    HAVING COALESCE(SUM(i.Stock_Actual), 0) <= p.Stock_Minimo
    ORDER BY Stock_Total_Actual ASC;
END;
```

## Explicación del Código
1. **Acumulación de Stock (`SUM` y `LEFT JOIN`)**: Un producto puede almacenarse en múltiples ubicaciones físicas (pasillos/estantes). El procedimiento realiza una suma global (`SUM(i.Stock_Actual)`) de todas las ubicaciones. Se usa `LEFT JOIN` para incluir productos que no tienen ningún registro en la tabla `Inventario` (cuyo stock es por tanto 0).
2. **Función `COALESCE`**: Reemplaza los valores `NULL` resultantes de productos sin stock asignado por un valor `0` para que las comparaciones matemáticas de menor o igual funcionen adecuadamente.
3. **Filtro del Reporte (`HAVING`)**: Dado que estamos agrupando por producto, el filtro del stock mínimo se aplica mediante la cláusula `HAVING`, mostrando únicamente aquellos productos donde la sumatoria de stock sea menor o igual al umbral mínimo.
4. **Clasificación Dinámica (`CASE`)**: Evalúa y clasifica textualmente si el producto está completamente "Sin Stock" o si está en un estado crítico de "Bajo Stock".

## Ejemplo de Ejecución
```sql
EXEC sp_ReporteProductosBajoStock;
```
