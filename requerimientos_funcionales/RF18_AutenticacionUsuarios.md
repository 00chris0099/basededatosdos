# RF18: Autenticación de Usuarios mediante Usuario y Contraseña

## Descripción
Este requerimiento permite validar las credenciales de un usuario (correo electrónico y contraseña) para permitirle el acceso al sistema WMS. A nivel de base de datos, el procedimiento compara los parámetros de entrada y devuelve la información básica del usuario junto con su rol si la autenticación es correcta.

## Código SQL (Procedimiento Almacenado de Login)

```sql
CREATE OR ALTER PROCEDURE sp_AutenticarUsuarioWMS
    @Correo VARCHAR(100),
    @Contrasena VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- Consultar el usuario y su rol si las credenciales coinciden
    SELECT 
        u.Id_Usuario,
        u.Nombre,
        u.Correo,
        r.Nombre_Rol AS Rol
    FROM Usuario u
    INNER JOIN Rol r ON u.Id_Rol = r.Id_Rol
    WHERE u.Correo = @Correo 
      AND u.Contrasena = @Contrasena;
      
    -- Validar si se encontró algún registro
    IF @@ROWCOUNT = 0
    BEGIN
        PRINT 'Credenciales de acceso incorrectas.';
    END
    ELSE
    BEGIN
        PRINT 'Autenticación exitosa.';
    END
END;
```

### Variante Avanzada: Uso de Encriptación SHA-2 256 bits (Recomendada)
Para entornos de producción reales, las contraseñas no deben almacenarse en texto plano. SQL Server provee la función `HASHBYTES` para almacenar y comparar contraseñas de forma segura:

```sql
-- Ejemplo de inserción encriptada:
-- INSERT INTO Usuario (Nombre, Contrasena, Correo, Id_Rol)
-- VALUES ('Usuario Seguro', CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', 'MiClaveSecreta123'), 2), 'seguro@wms.com', 1);

-- Procedimiento de Login usando Hash SHA2_256:
CREATE OR ALTER PROCEDURE sp_AutenticarUsuarioSeguroWMS
    @Correo VARCHAR(100),
    @Contrasena VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- Encriptar la contraseña de entrada para compararla con el hash almacenado
    DECLARE @HashContrasena VARCHAR(64) = CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', @Contrasena), 2);

    SELECT 
        u.Id_Usuario,
        u.Nombre,
        u.Correo,
        r.Nombre_Rol AS Rol
    FROM Usuario u
    INNER JOIN Rol r ON u.Id_Rol = r.Id_Rol
    WHERE u.Correo = @Correo 
      AND u.Contrasena = @HashContrasena;
END;
```

## Explicación del Código
1. **Validación de Credenciales**: Filtra los registros de `Usuario` buscando una coincidencia exacta de `Correo` y `Contrasena`.
2. **Obtención del Rol**: Realiza un `INNER JOIN` con la tabla `Rol` para retornar el nombre legible del rol, el cual será utilizado por la aplicación cliente para mostrar las opciones del menú correspondientes a sus permisos.
3. **Control de Filas (`@@ROWCOUNT`)**: Si la consulta no retorna filas, se detecta que las credenciales son inválidas y se imprime un mensaje de alerta.

## Ejemplos de Ejecución

### 1. Autenticación exitosa (Credenciales correctas)
```sql
EXEC sp_AutenticarUsuarioWMS
    @Correo = 'juan.perez@almacen.com',
    @Contrasena = 'Admin2025#';
-- Retornará: Juan Pérez con Rol 'Administrador'
```

### 2. Autenticación fallida (Contraseña incorrecta)
```sql
EXEC sp_AutenticarUsuarioWMS
    @Correo = 'juan.perez@almacen.com',
    @Contrasena = 'ClaveEquivocada';
-- No retornará registros e imprimirá 'Credenciales de acceso incorrectas.'
```
