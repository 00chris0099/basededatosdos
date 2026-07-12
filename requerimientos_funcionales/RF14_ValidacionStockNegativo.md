# RF14: Prevención de Cantidades Negativas en el Inventario

## Descripción
Este requerimiento establece una regla estricta sobre el inventario: bajo ninguna circunstancia se permite tener existencias negativas en stock (`Stock_Actual < 0`) ni registrar cantidades de movimientos nulas o negativas (`Cantidad <= 0`). Esto resguarda la integridad física del inventario del almacén contra errores humanos o lógicos de la aplicación.

## Implementación SQL (Constraints y Triggers)

Para lograr esta protección multinivel, el sistema utiliza dos herramientas de SQL Server:

### 1. Restricciones CHECK a Nivel de Tabla (Constraints)
Estas restricciones se evalúan a nivel de motor de datos en microsegundos y rechazan automáticamente cualquier operación física (`INSERT`/`UPDATE`) que vulnere las reglas matemáticas.

```sql
-- Restricción en la tabla de Inventario para no permitir existencias menores a cero
ALTER TABLE Inventario 
ADD CONSTRAINT CK_Inventario_Stock CHECK (Stock_Actual >= 0);

-- Restricción en el detalle de movimientos para no permitir cantidades menores o iguales a cero
ALTER TABLE Detalle_Movimiento 
ADD CONSTRAINT CK_DetalleMovimiento_Cantidad CHECK (Cantidad > 0);

-- Restricción en los ítems de pedido para no permitir cantidades menores o iguales a cero
ALTER TABLE Detalle_Pedido 
ADD CONSTRAINT CK_DetallePedido_Cantidad CHECK (Cantidad > 0);
```

### 2. Trigger Transaccional para Control de Updates masivos
Para evitar que procesos masivos evadan el control o dejen la base de datos bloqueada temporalmente, se implementa un Trigger que inspecciona el lote modificado y revierte la transacción si encuentra inconsistencias.

```sql
CREATE OR ALTER TRIGGER TR_ImpedirStockNegativo
ON Inventario
AFTER UPDATE, INSERT
AS
BEGIN
    -- Si algún registro afectado tiene stock negativo, revertir la transacción entera
    IF EXISTS (SELECT 1 FROM inserted WHERE Stock_Actual < 0)
    BEGIN
        RAISERROR ('Inconsistencia detectada: No se permiten stocks negativos en el inventario.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
```

## Explicación del Código
1. **Doble Capa de Seguridad**: Las restricciones `CHECK` protegen la estructura de la base de datos de manera atómica, mientras que el trigger `TR_ImpedirStockNegativo` actúa a nivel de transacción, revirtiendo la operación completa (`ROLLBACK`) si un lote masivo generó existencias negativas.
2. **Reversión Automática**: El uso de `ROLLBACK TRANSACTION` limpia el buffer de base de datos impidiendo que la transacción se escriba en los archivos de datos (`.mdf`).

## Ejemplos de Prueba de Infracción

### Prueba 1: Intentar actualizar a stock negativo (Falla por Check/Trigger)
```sql
UPDATE Inventario 
SET Stock_Actual = -5 
WHERE Id_Inventario = 1;
-- SQL Server arrojará un error de violación de restricción CK_Inventario_Stock y abortará.
```

### Prueba 2: Intentar registrar un detalle de movimiento con cantidad negativa (Falla por Check)
```sql
INSERT INTO Detalle_Movimiento (Cantidad, Id_Movimiento_Inventario, Id_Inventario)
VALUES (-10, 1, 1);
-- Bloqueado por CK_DetalleMovimiento_Cantidad.
```
