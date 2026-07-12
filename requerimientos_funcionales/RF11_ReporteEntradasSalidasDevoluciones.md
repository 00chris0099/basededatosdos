# RF11: Reportes de Entradas, Salidas y Devoluciones de Productos

## Descripción
Este requerimiento permite generar un reporte histórico de movimientos físicos de almacén dentro de un rango de fechas. Permite filtrar opcionalmente por un tipo de movimiento específico (Entrada, Salida, Ajuste, Devolución), sirviendo como auditoría del flujo diario del inventario.

## Código SQL (Procedimiento Almacenado)

```sql
CREATE OR ALTER PROCEDURE sp_ReporteMovimientosPorRango
    @FechaInicio DATETIME2,
    @FechaFin DATETIME2,
    @Id_Tipo_Movimiento INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        mi.Id_Movimiento_Inventario,
        mi.Fecha_Movimiento,
        tm.Descripcion AS Tipo_Movimiento,
        p.Codigo_Producto,
        p.Nombre_Producto,
        dm.Cantidad,
        i.Id_Ubicacion AS Codigo_Ubicacion,
        u.Nombre AS Usuario,
        mi.Observacion
    FROM Detalle_Movimiento dm
    INNER JOIN Movimiento_Inventario mi ON dm.Id_Movimiento_Inventario = mi.Id_Movimiento_Inventario
    INNER JOIN Tipo_Movimiento tm ON mi.Id_Tipo_Movimiento = tm.Id_Tipo_Movimiento
    INNER JOIN Inventario i ON dm.Id_Inventario = i.Id_Inventario
    INNER JOIN Producto p ON i.Id_Producto = p.Id_Producto
    INNER JOIN Usuario u ON mi.Id_Usuario = u.Id_Usuario
    WHERE mi.Fecha_Movimiento BETWEEN @FechaInicio AND @FechaFin
      AND (@Id_Tipo_Movimiento IS NULL OR mi.Id_Tipo_Movimiento = @Id_Tipo_Movimiento)
    ORDER BY mi.Fecha_Movimiento DESC;
END;
```

## Explicación del Código
1. **Filtros Temporales**: Aplica el filtro `BETWEEN` en la fecha del movimiento para limitar el universo de datos consultados a un rango específico de interés (por ejemplo, el mes actual, el día de hoy, etc.).
2. **Parámetro Opcional**: El parámetro `@Id_Tipo_Movimiento` cuenta con un valor predeterminado de `NULL`. Mediante la expresión condicional `(@Id_Tipo_Movimiento IS NULL OR mi.Id_Tipo_Movimiento = @Id_Tipo_Movimiento)`, la consulta retornará todos los movimientos si no se indica un filtro, o filtrará por el tipo exacto si el parámetro es provisto.
3. **Ordenamiento**: Muestra los movimientos en orden cronológico inverso (el más reciente primero) para facilitar la auditoría visual.

## Ejemplos de Ejecución

### 1. Consultar todos los movimientos ocurridos en la primera quincena de julio de 2026
```sql
EXEC sp_ReporteMovimientosPorRango
    @FechaInicio = '2026-07-01 00:00:00',
    @FechaFin = '2026-07-15 23:59:59';
```

### 2. Consultar únicamente las "Salidas" (ID = 2) de un rango específico
```sql
EXEC sp_ReporteMovimientosPorRango
    @FechaInicio = '2026-07-01 00:00:00',
    @FechaFin = '2026-07-15 23:59:59',
    @Id_Tipo_Movimiento = 2; -- 2 = Salida
```
