# RF07: Consulta de Disponibilidad de Stock en Tiempo Real

## Descripción
Este requerimiento permite al personal del almacén (administradores, supervisores y operarios) consultar el stock actual y disponible de cualquier producto en tiempo real, desglosado por su ubicación física (pasillo, estante y nivel) y categoría. Para ello, se expone una vista optimizada que recopila la información física y relacional.

## Código SQL (Vista y Consulta)

```sql
-- Creación de la Vista para stock en tiempo real
CREATE OR ALTER VIEW vw_StockTiempoReal
AS
SELECT 
    p.Codigo_Producto,
    p.Nombre_Producto,
    c.Nombre_Categoria,
    i.Stock_Actual,
    p.Stock_Minimo,
    i.Estado_Stock,
    i.Id_Ubicacion AS Codigo_Ubicacion,
    u.Pasillo,
    u.Estante,
    u.Nivel
FROM Inventario i
INNER JOIN Producto p ON i.Id_Producto = p.Id_Producto
INNER JOIN Categoria c ON p.Id_Categoria = c.Id_Categoria
INNER JOIN Ubicacion u ON i.Id_Ubicacion = u.Codigo_Ubicacion;
```

## Explicación del Código
1. **Unión de Tablas (INNER JOIN)**: La vista consolida la información uniendo la tabla `Inventario` (que contiene las existencias actuales) con `Producto` (para nombres y SKU), `Categoria` (para la clasificación) y `Ubicacion` (para conocer la coordenada física exacta del estante).
2. **Abstracción de Datos**: Permite a los desarrolladores de la aplicación web o móvil consultar datos consolidados con un simple `SELECT` sobre la vista, ocultando la complejidad del JOIN relacional.
3. **Eficiencia en Búsquedas**: Al utilizar índices sobre `Id_Producto` e `Id_Ubicacion`, SQL Server procesa la vista de manera inmediata, logrando tiempos de respuesta de milisegundos en inventarios grandes.

## Ejemplos de Uso

### 1. Consultar todo el stock disponible en el almacén
```sql
SELECT * FROM vw_StockTiempoReal;
```

### 2. Buscar stock de un producto específico por su código
```sql
SELECT * 
FROM vw_StockTiempoReal
WHERE Codigo_Producto = 'PROD001';
```

### 3. Consultar productos almacenados en un pasillo en particular
```sql
SELECT Codigo_Producto, Nombre_Producto, Stock_Actual, Codigo_Ubicacion
FROM vw_StockTiempoReal
WHERE Pasillo = 'A';
```
