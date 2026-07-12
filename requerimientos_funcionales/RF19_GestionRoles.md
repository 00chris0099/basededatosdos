# RF19: Gestión de Roles de Acceso (Administrador, Supervisor y Operario)

## Descripción
Este requerimiento define el control de acceso y asignación de permisos según el rol de cada usuario en el sistema. El sistema clasifica a los usuarios en tres roles predefinidos:
- **Administrador**: Acceso total al catálogo, ubicaciones, pedidos, reportes y configuración.
- **Supervisor**: Control operativo, registro de productos y visualización de reportes, sin permisos de administración de usuarios.
- **Operario**: Ejecución de almacén (picking, packing, despacho, visualización de ubicaciones).

## Código SQL (Procedimiento de Asignación y Control)

```sql
-- 1. Procedimiento para asignar o cambiar el rol de un usuario
CREATE OR ALTER PROCEDURE sp_AsignarRolUsuarioWMS
    @Id_Usuario INT,
    @Id_Rol INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Validar si el usuario existe
        IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Id_Usuario = @Id_Usuario)
        BEGIN
            THROW 51027, 'El usuario especificado no existe.', 1;
        END

        -- Validar si el rol existe
        IF NOT EXISTS (SELECT 1 FROM Rol WHERE Id_Rol = @Id_Rol)
        BEGIN
            THROW 51028, 'El rol especificado no existe.', 1;
        END

        BEGIN TRANSACTION;
        
        -- Modificar el rol
        UPDATE Usuario
        SET Id_Rol = @Id_Rol
        WHERE Id_Usuario = @Id_Usuario;

        COMMIT TRANSACTION;
        PRINT 'Rol de usuario actualizado correctamente.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 2. Vista de Auditoría de Usuarios y Roles (oculta contraseñas)
CREATE OR ALTER VIEW vw_UsuariosConRoles
AS
SELECT 
    u.Id_Usuario,
    u.Nombre,
    u.Correo,
    u.Telefono,
    r.Id_Rol,
    r.Nombre_Rol AS Rol
FROM Usuario u
INNER JOIN Rol r ON u.Id_Rol = r.Id_Rol;
GO
```

### Ejemplo de Lógica de Restricción en la Aplicación (o Backend)
Para aplicar políticas de seguridad a nivel de base de datos, se puede evaluar el rol del usuario que realiza la operación antes de permitir cambios en datos maestros. Ejemplo en un procedimiento de eliminación:

```sql
CREATE OR ALTER PROCEDURE sp_EliminarProductoConSeguridadWMS
    @Id_Producto INT,
    @Id_Usuario_Ejecuta INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Obtener el rol del usuario que intenta eliminar
    DECLARE @Rol VARCHAR(50);
    SELECT @Rol = r.Nombre_Rol 
    FROM Usuario u
    INNER JOIN Rol r ON u.Id_Rol = r.Id_Rol
    WHERE u.Id_Usuario = @Id_Usuario_Ejecuta;

    -- Validar que solo el "Administrador" (o "Dueño") pueda borrar productos
    IF @Rol <> 'Administrador'
    BEGIN
        RAISERROR ('Acceso Denegado: Su rol (%s) no cuenta con permisos para eliminar productos.', 16, 1, @Rol);
        RETURN;
    END

    -- Proceder con la eliminación segura
    EXEC sp_EliminarProductoWMS @Id_Producto = @Id_Producto;
END;
```

## Explicación del Código
1. **Asignación Segura**: `sp_AsignarRolUsuarioWMS` actualiza la llave foránea `Id_Rol` en la tabla `Usuario` tras verificar que ambos registros sean válidos.
2. **Vista Segura de Usuarios**: La vista `vw_UsuariosConRoles` permite a las interfaces administrativas listar los usuarios y sus roles asignados sin comprometer la seguridad (no incluye el campo `Contrasena`).
3. **Seguridad a Nivel de Datos**: El procedimiento `sp_EliminarProductoConSeguridadWMS` ejemplifica cómo la base de datos puede auto-validar los roles de usuario para restringir ejecuciones de operaciones peligrosas.

## Ejemplos de Ejecución

### 1. Asignar rol de Supervisor (ID = 2) a un usuario (ID = 3)
```sql
EXEC sp_AsignarRolUsuarioWMS
    @Id_Usuario = 3,
    @Id_Rol = 2;
```

### 2. Intento de eliminación de producto por parte de un Operario (ID = 4)
```sql
EXEC sp_EliminarProductoConSeguridadWMS
    @Id_Producto = 2,
    @Id_Usuario_Ejecuta = 4; -- Usuario con rol Operario
-- Resultado: Lanzará error de acceso denegado.
```
