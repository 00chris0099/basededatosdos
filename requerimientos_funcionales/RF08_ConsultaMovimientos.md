# RF08: Consulta del Historial de Movimientos de Inventario

## Descripción
Este requerimiento permite consultar el historial completo de los movimientos de inventario registrados en el sistema (Entradas, Salidas, Ajustes y Devoluciones). La vista consolidada permite realizar auditorías de stock, entender quién registró un movimiento, en qué fecha, qué cantidad se afectó y bajo qué observaciones.

## Código SQL (Vista y Consulta)

```sql
-- Creación de la Vista para Historial de Movimientos
CREATE OR ALTER VIEW vw_HistorialMovimientos
AS
SELECT 
    mi.Id_Movimiento_Inventario,
    mi.Fecha_Movimiento,
    tm.Descripcion AS Tipo_Movimiento,
    p.Codigo_Producto,
    p.Nombre_Producto,
    dm.Cantidad,
    i.Id_Ubicacion AS Codigo_Ubicacion,
    u.Nombre AS Usuario_Responsable,
    mi.Observacion
FROM Detalle_Movimiento dm
INNER JOIN Movimiento_Inventario mi ON dm.Id_Movimiento_Inventario = mi.Id_Movimiento_Inventario
INNER JOIN Tipo_Movimiento tm ON mi.Id_Tipo_Movimiento = tm.Id_Tipo_Movimiento
INNER JOIN Inventario i ON dm.Id_Inventario = i.Id_Inventario
INNER JOIN Producto p ON i.Id_Producto = p.Id_Producto
INNER JOIN Usuario u ON mi.Id_Usuario = u.Id_Usuario;
```

## Explicación del Código
1. **Unión de Cabecera y Detalle**: Combina la tabla de transacciones de inventario cabecera (`Movimiento_Inventario`) con su respectivo desglose físico (`Detalle_Movimiento`), obteniendo las unidades específicas afectadas.
2. **Identificación de Responsables**: Vincula la tabla `Usuario` para mostrar el nombre del operario o supervisor que ordenó y grabó el movimiento físico en el sistema.
3. **Tipo de Movimiento Legible**: Traduce el ID numérico del movimiento a su descripción correspondiente ('Entrada', 'Salida', 'Ajuste', 'Devolución') mediante un JOIN con `Tipo_Movimiento`.

## Ejemplos de Uso

### 1. Obtener la bitácora completa de movimientos ordenada por fecha reciente
```sql
SELECT * 
FROM vw_HistorialMovimientos
ORDER BY Fecha_Movimiento DESC;
```

### 2. Buscar todos los movimientos de un producto específico
```sql
SELECT Fecha_Movimiento, Tipo_Movimiento, Cantidad, Codigo_Ubicacion, Usuario_Responsable, Observacion
FROM vw_HistorialMovimientos
WHERE Codigo_Producto = 'PROD001'
ORDER BY Fecha_Movimiento DESC;
```

### 3. Consultar los movimientos realizados por un usuario específico
```sql
SELECT Tipo_Movimiento, Codigo_Producto, Nombre_Producto, Cantidad, Fecha_Movimiento, Observacion
FROM vw_HistorialMovimientos
WHERE Usuario_Responsable = 'Juan Pérez'
ORDER BY Fecha_Movimiento DESC;
```
