# RF03: Registro de Ubicaciones Físicas

## Descripción
Este requerimiento permite registrar ubicaciones físicas (pasillos, estantes y niveles) dentro del almacén para garantizar el control y rastreo de la mercadería. El sistema genera dinámicamente el código único de ubicación concatenando el pasillo, estante y nivel (por ejemplo: Pasillo A, Estante 01, Nivel 1 se registra como `A011`).

## Código SQL (Procedimiento Almacenado)

```sql
CREATE OR ALTER PROCEDURE sp_RegistrarUbicacionWMS
    @Pasillo VARCHAR(20),
    @Estante VARCHAR(20),
    @Nivel VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Formatear Código de ubicación
        DECLARE @Codigo_Ubicacion VARCHAR(20) = UPPER(@Pasillo) + @Estante + @Nivel;

        -- Validar si la ubicación ya existe
        IF EXISTS (SELECT 1 FROM Ubicacion WHERE Codigo_Ubicacion = @Codigo_Ubicacion)
        BEGIN
            THROW 51005, 'La ubicación ya existe en el almacén.', 1;
        END

        BEGIN TRANSACTION;

        -- Registrar ubicación
        INSERT INTO Ubicacion (Codigo_Ubicacion, Pasillo, Estante, Nivel)
        VALUES (@Codigo_Ubicacion, UPPER(@Pasillo), @Estante, @Nivel);

        COMMIT TRANSACTION;
        PRINT 'Ubicación registrada correctamente: ' + @Codigo_Ubicacion;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
```

## Explicación del Código
1. **Composición de Clave Primaria**: La clave de la ubicación (`Codigo_Ubicacion`) no es un entero secuencial, sino una clave estructurada que representa la posición en el almacén. Se construye uniendo el `Pasillo` en mayúsculas, el `Estante` y el `Nivel`.
2. **Validación**: Se asegura que no se registren ubicaciones redundantes con el mismo identificador espacial.
3. **Manejo de Transacciones**: En el caso de que la inserción de la ubicación sea parte de un proceso mayor de importación o reconfiguración del layout, la transacción garantiza que el cambio se concrete en su totalidad.

## Ejemplo de Ejecución
```sql
EXEC sp_RegistrarUbicacionWMS
    @Pasillo = 'D',
    @Estante = '02',
    @Nivel = '3';
-- Esto registrará una ubicación con código 'D023'
```
