# T-SQL - Puntos Más Importantes

---

## 1. Consultas Básicas (SELECT)

```sql
SELECT columnas FROM tabla
WHERE condicion
ORDER BY columna;
```

### Funciones de Selección
- `SELECT *` - Todas las columnas
- `SELECT DISTINCT` - Valores únicos
- `SELECT TOP 10` - Primeros 10 registros
- `SELECT AS` - Alias de columnas

---

## 2. Filtrado de Datos (WHERE)

| Operador | Descripción |
|----------|-------------|
| `=` | Igual |
| `<>` o `!=` | Diferente |
| `>` `<` `>=` `<=` | Comparación |
| `BETWEEN` | Rango |
| `IN` | Lista de valores |
| `LIKE` | Patrón de texto |
| `IS NULL` / `IS NOT NULL` | Verificar nulos |

### Patrones LIKE
```sql
WHERE nombre LIKE 'J%'    -- Empieza con J
WHERE nombre LIKE '%ez'   -- Termina con ez
WHERE nombre LIKE '_r%'   -- Segunda letra es r
WHERE nombre LIKE '%[aeiou]%'  -- Contiene vocal
```

---

## 3. Funciones de Agrupación

| Función | Descripción |
|---------|-------------|
| `COUNT()` | Contar registros |
| `SUM()` | Suma |
| `AVG()` | Promedio |
| `MAX()` | Máximo |
| `MIN()` | Mínimo |

```sql
SELECT categoria, COUNT(*) as total
FROM productos
GROUP BY categoria
HAVING COUNT(*) > 5;
```

---

## 4. JOINs - Unión de Tablas

```sql
-- INNER JOIN: Registros coincidentes en ambas tablas
SELECT * FROM A INNER JOIN B ON A.id = B.id_a;

-- LEFT JOIN: Todos de A, coincidentes de B
SELECT * FROM A LEFT JOIN B ON A.id = B.id_a;

-- RIGHT JOIN: Todos de B, coincidentes de A
SELECT * FROM A RIGHT JOIN B ON A.id = B.id_a;

-- FULL JOIN: Todos los registros de ambas tablas
SELECT * FROM A FULL JOIN B ON A.id = B.id_a;

-- CROSS JOIN: Producto cartesiano
SELECT * FROM A CROSS JOIN B;
```

---

## 5. Subconsultas

```sql
-- Subconsulta escalar
SELECT nombre FROM empleados
WHERE salario > (SELECT AVG(salario) FROM empleados);

-- Subconsulta con IN
SELECT * FROM clientes
WHERE id IN (SELECT cliente_id FROM pedidos);

-- Subconsulta con EXISTS
SELECT * FROM productos p
WHERE EXISTS (SELECT 1 FROM ventas v WHERE v.producto_id = p.id);
```

---

## 6. Funciones de Fecha

| Función | Retorna |
|---------|---------|
| `GETDATE()` | Fecha y hora actual |
| `SYSDATETIME()` | Precisión alta |
| `DATEADD(d, 30, fecha)` | Sumar 30 días |
| `DATEDIFF(d, fecha1, fecha2)` | Diferencia en días |
| `YEAR(fecha)` / `MONTH()` / `DAY()` | Extraer parte |
| `FORMAT(fecha, 'dd/MM/yyyy')` | Formatear |

---

## 7. Funciones de Texto

| Función | Descripción |
|---------|-------------|
| `LEN()` | Longitud |
| `SUBSTRING()` | Extraer porción |
| `LEFT()` / `RIGHT()` | Primeros/últimos caracteres |
| `UPPER()` / `LOWER()` | Mayúsculas/minúsculas |
| `LTRIM()` / `RTRIM()` | Eliminar espacios |
| `REPLACE()` | Reemplazar texto |
| `CONCAT()` | Concatenar |
| `CHARINDEX()` | Posición de texto |

---

## 8. Variables y Tipos de Datos

```sql
DECLARE @nombre VARCHAR(100) = 'Carlos';
DECLARE @edad INT;
DECLARE @fecha DATE = GETDATE();
DECLARE @monto DECIMAL(10,2) = 1500.50;
DECLARE @activo BIT = 1;

SET @edad = 30;
```

### Tipos Principales
- `INT` - Entero (0 a 2,147,483,647)
- `BIGINT` - Entero grande
- `DECIMAL(p,s)` - Número decimal
- `VARCHAR(n)` - Texto variable
- `NVARCHAR(n)` - Texto Unicode
- `DATE` / `DATETIME` / `SMALLDATETIME` - Fechas
- `BIT` - Verdadero/Falso (0/1)
- `MONEY` - Moneda
- `UNIQUEIDENTIFIER` - GUID

---

## 9. Tablas Temporales

```sql
-- Tabla temporal local
CREATE TABLE #temp (
    id INT,
    nombre VARCHAR(100)
);

-- Tabla temporal global
CREATE TABLE ##temp_global (
    id INT,
    nombre VARCHAR(100)
);

-- Tabla variable
DECLARE @tabla TABLE (
    id INT,
    nombre VARCHAR(100)
);
```

---

## 10. Stored Procedures

```sql
-- Crear procedimiento
CREATE PROCEDURE sp_obtener_clientes
    @estado VARCHAR(20) = 'Activo',
    @limite INT = 100
AS
BEGIN
    SELECT TOP (@limite) *
    FROM clientes
    WHERE estado = @estado;
END;

-- Ejecutar
EXEC sp_obtener_clientes @estado = 'Activo', @limite = 50;
```

### Parámetros
- `@parametro` - Parámetro de entrada
- `@parametro OUTPUT` - Parámetro de salida
- Valores por defecto: `@parametro = 'valor'`

---

## 11. Funciones

### Función Escalar
```sql
CREATE FUNCTION fn_calcular_iva (@monto DECIMAL(10,2))
RETURNS DECIMAL(10,2)
AS
BEGIN
    RETURN @monto * 0.16;
END;
-- Uso: SELECT dbo.fn_calcular_iva(1000);
```

### Función de Tabla
```sql
CREATE FUNCTION fn_clientes_activos ()
RETURNS TABLE
AS
RETURN (
    SELECT id, nombre FROM clientes WHERE activo = 1
);
-- Uso: SELECT * FROM dbo.fn_clientes_activos();
```

---

## 12. Triggers

```sql
CREATE TRIGGER trg_after_insert
ON productos
AFTER INSERT
AS
BEGIN
    INSERT INTO log_cambios (tabla, accion, fecha)
    VALUES ('productos', 'INSERT', GETDATE());
END;
```

### Tipos
- `AFTER` - Después del evento
- `INSTEAD OF` - En lugar del evento
- `INSERTED` - Tabla con datos nuevos
- `DELETED` - Tabla con datos eliminados

---

## 13. Transacciones

```sql
BEGIN TRANSACTION;

UPDATE cuentas SET saldo = saldo - 1000 WHERE id = 1;
UPDATE cuentas SET saldo = saldo + 1000 WHERE id = 2;

-- Si todo OK
COMMIT TRANSACTION;

-- Si hay error
-- ROLLBACK TRANSACTION;
```

### SAVEPOINT
```sql
BEGIN TRANSACTION;
SAVE TRANSACTION punto1;
-- ...
ROLLBACK TRANSACTION punto1;
```

---

## 14. Manejo de Errores (TRY...CATCH)

```sql
BEGIN TRY
    BEGIN TRANSACTION;
    INSERT INTO tabla (col) VALUES (1);
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    SELECT
        ERROR_NUMBER() AS Error,
        ERROR_MESSAGE() AS Mensaje,
        ERROR_LINE() AS Linea,
        ERROR_PROCEDURE() AS Procedimiento;
END CATCH;
```

---

## 15. CTEs (Common Table Expressions)

```sql
WITH CTE_Ventas AS (
    SELECT cliente_id, SUM(monto) as total
    FROM ventas
    GROUP BY cliente_id
)
SELECT c.nombre, v.total
FROM clientes c
INNER JOIN CTE_Ventas v ON c.id = v.cliente_id;
```

### CTE Recursiva
```sql
WITH jerarquia AS (
    SELECT id, nombre, id_jefe, 0 AS nivel
    FROM empleados
    WHERE id_jefe IS NULL

    UNION ALL

    SELECT e.id, e.nombre, e.id_jefe, j.nivel + 1
    FROM empleados e
    INNER JOIN jerarquia j ON e.id_jefe = j.id
)
SELECT * FROM jerarquia;
```

---

## 16. Funciones de Ventana (Window Functions)

```sql
-- Row Number
SELECT *, ROW_NUMBER() OVER (ORDER BY salario DESC) as rn
FROM empleados;

-- RANK con empates
SELECT *, RANK() OVER (ORDER BY salario DESC) as rnk
FROM empleados;

-- Partition By (GROUP BY por ventana)
SELECT *,
    SUM(venta) OVER (PARTITION BY region ORDER BY fecha) as acumulado
FROM ventas;

-- LAG/LEAD (anterior/siguiente)
SELECT *,
    LAG(salario, 1) OVER (ORDER BY fecha) as salario_anterior,
    LEAD(salario, 1) OVER (ORDER BY fecha) as salario_siguiente
FROM historial;
```

---

## 17. MERGE (Upsert)

```sql
MERGE INTO destino AS D
USING origen AS O ON D.id = O.id
WHEN MATCHED THEN
    UPDATE SET D.nombre = O.nombre, D.monto = O.monto
WHEN NOT MATCHED THEN
    INSERT (id, nombre, monto) VALUES (O.id, O.nombre, O.monto)
WHEN NOT MATCHED BY SOURCE THEN
    DELETE;
```

---

## 18. Paginación

```sql
-- Método OFFSET-FETCH (recomendado)
SELECT *
FROM productos
ORDER BY id
OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY;

-- Página 3 con 10 registros por página
```

---

## 19. PIVOT y UNPIVOT

```sql
-- PIVOT: Filas a columnas
SELECT *
FROM (
    SELECT producto, mes, ventas
    FROM ventas_mensuales
) AS src
PIVOT (
    SUM(ventas)
    FOR mes IN ([Enero], [Febrero], [Marzo])
) AS pvt;

-- UNPIVOT: Columnas a filas
SELECT *
FROM ventas_pivot
UNPIVOT (
    ventas FOR mes IN ([Enero], [Febrero], [Marzo])
) AS unpvt;
```

---

## 20. Índices

```sql
-- Índice clustered (uno por tabla)
CREATE CLUSTERED INDEX IX_tabla_id ON tabla(id);

-- Índice non-clustered (múltiples)
CREATE NONCLUSTERED INDEX IX_tabla_nombre ON tabla(nombre);

-- Índice con columnas incluidas
CREATE INDEX IX_ventas ON ventas(fecha)
INCLUDE (monto, cliente_id);
```

---

## 21. Vistas

```sql
CREATE VIEW vw_clientes_activos AS
SELECT id, nombre, email
FROM clientes
WHERE activo = 1;

-- Vista materializada
SELECT * INTO vista FROM vw_clientes_activos;
```

---

## 22. Expresiones Comunes

### CASE
```sql
SELECT
    CASE estado
        WHEN 1 THEN 'Activo'
        WHEN 2 THEN 'Inactivo'
        ELSE 'Desconocido'
    END AS estado_texto
FROM usuarios;
```

### IIF (atajo de CASE)
```sql
SELECT IIF(edad >= 18, 'Mayor', 'Menor') AS categoria
FROM personas;
```

### COALESCE y NULLIF
```sql
-- COALESCE: Primer valor no NULL
SELECT COALESCE(alias, nombre, 'Sin nombre') FROM usuarios;

-- NULLIF: Retorna NULL si son iguales
SELECT nombre, NULLIF(saldo, 0) as saldo FROM cuentas;
```

---

## 23. Rendimiento y Buenas Prácticas

| ❌ Evitar | ✅ Usar |
|-----------|---------|
| `SELECT *` | Seleccionar columnas específicas |
| `NOLOCK` sin necesidad | Transacciones apropiadas |
| Subconsultas en WHERE | JOINs o CTEs |
| Funciones en columnas WHERE | Columnas calculadas o índices |
| Cursor | WHILE o manipulación por lotes |
| `VARCHAR(MAX)` innecesario | Tamaño adecuado del campo |

---

## Resumen Rápido de Comandos

| Comando | Uso |
|---------|-----|
| `SELECT` | Consultar datos |
| `INSERT` | Insertar datos |
| `UPDATE` | Actualizar datos |
| `DELETE` | Eliminar datos |
| `MERGE` | Upsert |
| `CREATE TABLE` | Crear tabla |
| `ALTER TABLE` | Modificar tabla |
| `DROP TABLE` | Eliminar tabla |
| `CREATE INDEX` | Crear índice |
| `EXEC` | Ejecutar SP |

---

*Última actualización: Julio 2026*
