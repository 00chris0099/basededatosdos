# RF02: Registro de Categorías de Productos

## Descripción
Este requerimiento permite registrar nuevas categorías en el sistema para clasificar adecuadamente los productos. Para mantener la integridad de los datos, el sistema evita que se registren categorías duplicadas comparando el nombre de la categoría.

## Código SQL (Procedimiento Almacenado)

```sql
CREATE OR ALTER PROCEDURE sp_RegistrarCategoriaWMS
    @Nombre_Categoria VARCHAR(80)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Validar si el nombre de categoría ya existe (insensible a mayúsculas/minúsculas por defecto en SQL Server)
        IF EXISTS (SELECT 1 FROM Categoria WHERE Nombre_Categoria = @Nombre_Categoria)
        BEGIN
            THROW 51004, 'La categoría ya está registrada.', 1;
        END

        BEGIN TRANSACTION;

        -- Insertar la categoría
        INSERT INTO Categoria (Nombre_Categoria)
        VALUES (@Nombre_Categoria);

        COMMIT TRANSACTION;
        PRINT 'Categoría registrada correctamente.';
    END TRY
    BEGIN CATCH
        -- Si hay una transacción activa, deshacerla
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
```

## Explicación del Código
1. **Validación de Duplicidad**: Antes de insertar la nueva categoría, se realiza una búsqueda en la tabla `Categoria` filtrando por el nombre proporcionado. Si la categoría ya existe, se lanza una excepción personalizada y se detiene la ejecución.
2. **Uso de Transacciones**: A pesar de ser una inserción simple, la transacción asegura la integridad de la base de datos y permite un manejo robusto de errores mediante `BEGIN TRANSACTION` y `COMMIT TRANSACTION`.
3. **Manejo de Errores (`TRY...CATCH`)**: Si ocurre un error inesperado de base de datos, el bloque `CATCH` capturará el error, deshará la transacción si existiera y propagará el mensaje mediante `THROW`.

## Ejemplo de Ejecución
```sql
EXEC sp_RegistrarCategoriaWMS 
    @Nombre_Categoria = 'Iluminación';
```
