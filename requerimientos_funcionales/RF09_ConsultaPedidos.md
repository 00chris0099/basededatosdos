# RF09: Consulta de Estado Actual de los Pedidos

## Descripción
Este requerimiento permite consultar de forma consolidada el estado actual de todos los pedidos ingresados al sistema (Pendiente, En Proceso, Completado, Cancelado). Esto ayuda al administrador y supervisor a monitorear el flujo de picking/packing y despacho, mostrando además el importe total de la venta y el número de líneas y artículos contenidos.

## Código SQL (Vista y Consulta)

```sql
-- Creación de la Vista para Estado de Pedidos
CREATE OR ALTER VIEW vw_EstadoActualPedidos
AS
SELECT 
    p.Id_Pedido,
    p.Fecha_Pedido,
    c.Nombre AS Cliente,
    c.Num_Documento AS Documento_Cliente,
    ep.Descripcion AS Estado_Pedido,
    p.Precio_Total,
    (SELECT COUNT(*) FROM Detalle_Pedido dp WHERE dp.Id_Pedido = p.Id_Pedido) AS Total_Lineas,
    (SELECT SUM(dp.Cantidad) FROM Detalle_Pedido dp WHERE dp.Id_Pedido = p.Id_Pedido) AS Total_Unidades
FROM Pedido p
INNER JOIN Cliente c ON p.Id_Cliente = c.Id_Cliente
INNER JOIN Estado_Pedido ep ON p.Id_Estado_Pedido = ep.Id_Estado_Pedido;
```

## Explicación del Código
1. **Subconsultas de Consolidación**: Se usan subconsultas escalares (`SELECT COUNT(*)...` y `SELECT SUM(...)`) para calcular dinámicamente el número total de líneas (productos diferentes) y de unidades (suma de cantidades) solicitadas por cada pedido.
2. **Relación Cliente-Estado**: Une la tabla `Pedido` con `Cliente` y con el catálogo `Estado_Pedido` para obtener descripciones textuales legibles sobre el progreso logístico.
3. **Optimización**: La vista evita agrupaciones complejas de nivel superior agrupando directamente mediante llaves primarias indexadas, lo que acelera las pantallas de reportes de pedidos.

## Ejemplos de Uso

### 1. Listar el estado general de todos los pedidos
```sql
SELECT * FROM vw_EstadoActualPedidos;
```

### 2. Filtrar únicamente los pedidos que están en estado "Pendiente"
```sql
SELECT Id_Pedido, Fecha_Pedido, Cliente, Precio_Total, Total_Lineas, Total_Unidades
FROM vw_EstadoActualPedidos
WHERE Estado_Pedido = 'Pendiente'
ORDER BY Fecha_Pedido ASC;
```

### 3. Consultar el historial de pedidos de un cliente específico
```sql
SELECT Id_Pedido, Fecha_Pedido, Estado_Pedido, Precio_Total, Total_Unidades
FROM vw_EstadoActualPedidos
WHERE Documento_Cliente = '20111111111'
ORDER BY Fecha_Pedido DESC;
```
