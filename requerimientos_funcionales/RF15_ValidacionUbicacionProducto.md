# RF15: Validación de Asignación de Ubicación Física a cada Producto

## Descripción
Este requerimiento establece que cada producto registrado en el inventario debe estar obligatoriamente asignado a una ubicación física válida dentro del almacén (es decir, debe contar con un código de pasillo, estante y nivel existente en la tabla `Ubicacion`). Esto evita la existencia de "stock fantasma" que no pueda ser ubicado por los operarios durante el picking.

## Implementación SQL (Integridad Referencial y Trigger)

El cumplimiento de este requerimiento se garantiza a través de dos mecanismos complementarios:

### 1. Integridad Referencial Física (Foreign Key y Not Null)
El diseño físico de la tabla `Inventario` exige que la columna `Id_Ubicacion` sea obligatoria (`NOT NULL`) y posea una llave foránea (`FOREIGN KEY`) hacia la tabla de ubicaciones autorizadas:

```sql
CREATE TABLE Inventario(
    Id_Inventario INT IDENTITY(1,1) PRIMARY KEY,
    Stock_Actual INT NOT NULL,
    Estado_Stock VARCHAR(30) NOT NULL,
    Id_Producto INT NOT NULL,
    Id_Ubicacion VARCHAR(20) NOT NULL, -- Obliga a indicar una ubicación
    
    -- Restricción de Llave Foránea
    CONSTRAINT FK_Inventario_Ubicacion
        FOREIGN KEY(Id_Ubicacion)
        REFERENCES Ubicacion(Codigo_Ubicacion)
);
```

### 2. Trigger de Validación de Coordenadas Físicas
Adicionalmente, se cuenta con un trigger que actúa tras cualquier intento de inserción o modificación en el inventario para asegurar que el código de la ubicación se corresponda a un espacio físico activo y registrado:

```sql
CREATE OR ALTER TRIGGER TR_ValidarAsignacionUbicacion
ON Inventario
AFTER INSERT, UPDATE
AS
BEGIN
    -- Validar si la ubicación insertada/modificada existe en la tabla maestra de Ubicaciones
    IF EXISTS (
        SELECT 1 
        FROM inserted i
        LEFT JOIN Ubicacion u ON i.Id_Ubicacion = u.Codigo_Ubicacion
        WHERE u.Codigo_Ubicacion IS NULL
    )
    BEGIN
        RAISERROR ('Infracción: El producto debe ser asignado a una ubicación física válida y existente dentro del almacén.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
```

## Explicación del Código
1. **Columna Obligatoria (`NOT NULL`)**: A nivel de definición de tabla, se impide que un registro de stock se cree sin una ubicación.
2. **Llave Foránea (`FK`)**: Impide insertar códigos aleatorios que no existan previamente en la tabla `Ubicacion`.
3. **Trigger de Seguridad**: Actúa como cortafuegos transaccional. Si por algún motivo se intenta saltar la verificación referencial (por ejemplo, durante cargas masivas de datos con desactivación temporal de llaves), el trigger intercepta la inserción y deshace la transacción entera.

## Ejemplo de Prueba de Infracción

### Intento de asignación a ubicación inexistente
```sql
-- La ubicación 'Z999' no existe en el catálogo maestro
INSERT INTO Inventario (Stock_Actual, Estado_Stock, Id_Producto, Id_Ubicacion)
VALUES (10, 'Disponible', 1, 'Z999');

-- Resultado esperado:
-- SQL Server arrojará un error de violación de Llave Foránea (FK_Inventario_Ubicacion)
-- y el Trigger impedirá la finalización de la transacción.
```
