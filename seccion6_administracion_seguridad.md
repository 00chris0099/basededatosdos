# 6. Administración y Seguridad

El correcto funcionamiento de un Sistema de Gestión de Almacén exige mecanismos robustos que protejan la información, controlen el acceso de los usuarios y garanticen la integridad de los datos ante cualquier eventualidad. En este capítulo se describen los componentes de administración y seguridad implementados en la base de datos `BD_WMS_ECOMMERCE`, sustentados en las 20 tablas, 19 procedimientos almacenados, 10 disparadores y múltiples vistas que conforman el esquema relacional del proyecto WMS Pro.

---

## 6.1 Gestión de usuarios y roles

### 6.1.1 Estructura relacional

La administración de identidades se apoya en dos entidades principales: la tabla `Rol` y la tabla `Usuario`. La primera almacena los perfiles de acceso definidos para el sistema, mientras que la segunda contiene los datos personales y credenciales de cada persona autorizada para operar la plataforma.

**Tabla Rol**

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| Id_Rol | INT IDENTITY(1,1) | PRIMARY KEY |
| Nombre_Rol | VARCHAR(50) | NOT NULL |

**Tabla Usuario**

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| Id_Usuario | INT IDENTITY(1,1) | PRIMARY KEY |
| Nombre | VARCHAR(100) | NOT NULL |
| Contrasena | VARCHAR(255) | NOT NULL |
| Telefono | VARCHAR(15) | NULL |
| Correo | VARCHAR(100) | NOT NULL, UNIQUE |
| Id_Rol | INT | NOT NULL, FK → Rol |

La relación entre ambas tablas se establece mediante la llave foránea `FK_Usuario_Rol`, la cual garantiza que cada usuario esté asociado exclusivamente a un rol válido existente. Esta restricción a nivel de esquema impide la inserción de registros huérfanos y refuerza la consistencia referencial del modelo.

### 6.1.2 Roles definidos en el sistema

El proyecto incorpora tres roles operativos que responden a la estructura organizacional de un almacén de distribución:

| Id_Rol | Nombre_Rol | Descripción de funciones |
|--------|------------|--------------------------|
| 1 | Administrador | Control total sobre productos, categorías, ubicaciones, pedidos, reportes y gestión de usuarios |
| 2 | Supervisor | Registro de productos, movimientos de inventario, visualización de reportes y seguimiento de pedidos |
| 3 | Operario | Consulta de inventario, ejecución de picking, packing y despacho de pedidos asignados |

El plan de evolución del sistema prevé la incorporación de un cuarto perfil denominado **Dueño**, cuyos privilegios equivaldrían a los del Administrador pero orientados exclusivamente a funciones estratégicas como configuración del almacén y gestión de trabajadores.

### 6.1.3 Datos registrados

La inserción inicial de usuarios contempla cinco cuentas activas distribuidas de la siguiente manera:

| Id | Nombre | Correo electrónico | Rol |
|----|--------|--------------------|-----|
| 1 | Juan Pérez | juan.perez@almacen.com | Administrador |
| 2 | María López | maria.lopez@almacen.com | Supervisor |
| 3 | Carlos Ruiz | carlos.ruiz@almacen.com | Operario |
| 4 | Ana Torres | ana.torres@almacen.com | Operario |
| 5 | Luis Gómez | luis.gomez@almacen.com | Supervisor |

La restricción `UNIQUE` aplicada al campo `Correo` asegura la unicidad de cada identificador de acceso, impidiendo la creación de cuentas duplicadas que podrían comprometer la trazabilidad de las acciones realizadas sobre la base de datos.

### 6.1.4 Procedimiento de asignación de roles

Para administrar los cambios de perfil, el sistema dispone del procedimiento `sp_AsignarRolUsuarioWMS`, el cual valida la existencia tanto del usuario como del rol destino antes de ejecutar la modificación. Toda la operación se encapsula dentro de una transacción que se revierte automáticamente si se detecta algún error, protegiendo así la integridad del catálogo de usuarios.

### 6.1.5 Autenticación de acceso

El procedimiento `sp_AutenticarUsuarioWMS` implementa la verificación de credenciales mediante la comparación del correo electrónico y la contraseña ingresados contra los valores almacenados en la tabla `Usuario`. Este mecanismo, junto con la integración del middleware JWT en el backend Node.js, constituye la primera línea de defensa del sistema. El payload del token emitido incluye el identificador del usuario, su correo, nombre y rol asignado, con una vigencia de 24 horas.

---

## 6.2 Permisos y seguridad

### 6.2.1 Control de acceso por capas

La estrategia de seguridad implementada en WMS Pro opera en tres niveles complementarios que se refuerzan mutuamente:

**Nivel 1 — Autenticación:** El endpoint `/api/auth/login` recibe las credenciales del usuario, valida su existencia en la tabla `Usuario` y emite un token JWT firmado con una clave secreta definida en las variables de entorno. Este token debe incluirse en el encabezado `Authorization` de cada petición subsiguiente.

**Nivel 2 — Autorización por rol:** El middleware `roleGuard.js` intercepta cada solicitud y extrae el campo `role` del token decodificado. Si el rol del usuario no se encuentra dentro de la lista de roles permitidos para ese endpoint, la petición se rechaza con un código HTTP 403 (Acceso Denegado).

**Nivel 3 — Restricciones a nivel de base de datos:** Las vistas y procedimientos almacenados implementan filtros adicionales que protegen datos sensibles. Por ejemplo, la vista `vw_Usuarios` excluye deliberadamente el campo `Contrasena` del resultado, exponiendo únicamente el identificador, nombre, teléfono, correo y rol del usuario:

```sql
CREATE VIEW vw_Usuarios AS
SELECT
    u.Id_Usuario,
    u.Nombre,
    u.Telefono,
    u.Correo,
    r.Nombre_Rol
FROM Usuario u
INNER JOIN Rol r ON u.Id_Rol = r.Id_Rol;
```

### 6.2.2 Matriz de permisos por rol

Las operaciones disponibles en la API REST se distribuyen entre los roles según la siguiente matriz:

| Operación | Dueño | Administrador | Supervisor | Operario |
|-----------|-------|---------------|------------|----------|
| Consultar inventario | Si | Si | Si | Si |
| Registrar productos | Si | Si | Si | No |
| Modificar productos | Si | Si | Si | No |
| Eliminar productos | Si | Si | No | No |
| Crear ubicaciones | Si | Si | No | No |
| Registrar movimientos de stock | Si | Si | Si | No |
| Gestionar pedidos | Si | Si | Si | Si |
| Ejecutar picking | Si | Si | Si | Si |
| Confirmar packing | Si | Si | Si | Si |
| Visualizar reportes | Si | Si | Si | No |
| Administrar usuarios | Si | Si | No | No |
| Configurar almacén | Si | Si | No | No |

### 6.2.3 Triggers de protección de integridad

El esquema de la base de datos incluye siete disparadores que refuerzan las reglas de negocio a nivel transaccional:

| Trigger | Tabla | Evento | Función |
|---------|-------|--------|---------|
| TR_Auditoria_Producto | Producto | AFTER INSERT | Registra cada inserción de producto en la tabla `Auditoria_Sistema` |
| TR_ValidarStockPedido | Detalle_Pedido | INSTEAD OF INSERT | Verifica que la cantidad solicitada no exceda el stock disponible antes de permitir el registro |
| TR_HistorialPrecio | Producto | AFTER UPDATE | Almacena en la tabla `Historial_Precio` los cambios de valor unitario de cada producto |
| TR_NoEliminarCategoria | Categoria | INSTEAD OF DELETE | Impide la eliminación de categorías que tengan productos asociados |
| TR_ImpedirStockNegativo | Inventario | AFTER UPDATE, INSERT | Rechaza cualquier operación que genere valores negativos en el campo `Stock_Actual` |
| TR_ValidarAsignacionUbicacion | Inventario | AFTER INSERT, UPDATE | Valida que toda entrada de inventario apunte a una ubicación física existente |
| TR_ValidarStockPedido (INSTEAD OF) | Detalle_Pedido | INSTEAD OF INSERT | Bloquea pedidos cuya cantidad supere el stock registrado en inventario |

Estos mecanismos complementan las restricciones `CHECK` definidas en la creación de las tablas, como `CK_Producto_Precio` (precio mayor a cero), `CK_Inventario_Stock` (stock no negativo) y `CK_DetalleMovimiento_Cantidad` (cantidad mayor a cero).

### 6.2.4 Registro de auditoría

La tabla `Auditoria_Sistema` captura cada acción relevante realizada sobre los datos, almacenando la tabla afectada, el tipo de operación (INSERT, UPDATE, DELETE), una descripción del evento, la fecha y hora del registro, y el identificador del usuario responsable. Este registro se alimenta automáticamente mediante el trigger `TR_Auditoria_Producto` cada vez que se incorpora un nuevo producto al catálogo, proporcionando una trazabilidad completa de las modificaciones realizadas.

### 6.2.5 Historial de cambios de precio

Para garantizar la transparencia en las variaciones de costos, la tabla `Historial_Precio` almacena los valores anteriores y nuevos de cada modificación de precio, junto con la fecha del cambio y el producto afectado. Esta información se captura de forma automática mediante el trigger `TR_HistorialPrecio`, activado después de cada operación de actualización sobre la tabla `Producto`.

---

## 6.3 Backups y recuperación

### 6.3.1 Estrategia de respaldo

Aunque la base de datos `BD_WMS_ECOMMERCE` opera en un entorno de desarrollo académico, la documentación del proyecto contempla una estrategia de backups alineada con las mejores prácticas de administración de bases de datos SQL Server. Los respaldos se clasifican en tres categorías según el alcance de la información capturada:

**Backup completo:** Copia la totalidad de la base de datos en cada ejecución, incluyendo archivos de datos (.mdf) y registros de transacciones (.ldf). Si bien consume mayor espacio en disco, ofrece la ventaja de una recuperación más sencilla ya que requiere únicamente la restauración de un solo archivo.

**Backup incremental:** Registra exclusivamente los cambios efectuados desde el último respaldo completo o incremental previo. Este método reduce considerablemente el volumen de datos transferidos, aunque el proceso de restauración demanda la reconstrucción secuencial a partir de múltiples segmentos.

**Backup diferencial:** Captura todas las modificaciones realizadas desde la última copia completa, equilibrando el costo de almacenamiento con la rapidez del proceso de recuperación.

### 6.3.2 Recuperación ante fallos

Los procedimientos almacenados del sistema incorporan bloques `TRY...CATCH` que gestionan automáticamente los errores durante la ejecución de transacciones. Cuando se detecta una anomalía, la instrucción `ROLLBACK TRANSACTION` revierte todos los cambios parciales realizados, devolviendo la base de datos a un estado consistente. A continuación se presenta la estructura patrón utilizada en los 19 procedimientos almacenados implementados:

```sql
BEGIN TRY
    BEGIN TRANSACTION;
    -- Operaciones sobre la base de datos
    COMMIT TRANSACTION;
    PRINT 'Operación exitosa.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH
```

Este patrón se aplica de manera consistente en todos los procedimientos de注册 (registro), actualización y eliminación de datos, incluyendo:

- `sp_RegistrarProductoWMS` — Registro de productos con stock inicial
- `sp_RegistrarEntradaWMS` — Entradas de mercadería al inventario
- `sp_RegistrarSalidaWMS` — Salidas de productos del almacén
- `sp_RegistrarDevolucionWMS` — Devoluciones de mercadería
- `sp_RegistrarDetallePedidoValidado` — Inclusión de ítems en pedidos con validación de stock
- `sp_ActualizarProductoWMS` — Modificación de datos de productos
- `sp_EliminarProductoWMS` — Borrado seguro de productos
- `sp_ActualizarCategoriaWMS` y `sp_EliminarCategoriaWMS` — Gestión del catálogo de categorías
- `sp_ActualizarUbicacionWMS` — Modificación de ubicaciones físicas

### 6.3.3 Validaciones previas a la operación

Cada procedimiento incluye validaciones que verifican la existencia de las entidades involucradas antes de ejecutar la transacción. Por ejemplo, `sp_RegistrarProductoWMS` comprueba que el código del producto no esté duplicado, que la categoría especificada exista, que la ubicación sea válida y que el stock inicial no sea negativo. Si cualquiera de estas condiciones no se cumple, se genera un error personalizado mediante `THROW` con un código y mensaje descriptivo, evitando así la contaminación de la base de datos con registros inconsistentes.

### 6.3.4 Recuperación de inventario

El procedimiento `sp_RegistrarSalidaWMS` incorpora una validación específica que impide la salida de productos cuando el stock disponible es insuficiente. Si la cantidad solicitada supera el inventario registrado en la ubicación indicada, se genera el error 51012 con el mensaje "No hay stock suficiente en la ubicación indicada", protegiendo así la integridad del inventario físico contra sobrepagos o mermas no autorizadas.

De manera similar, el trigger `TR_ImpedirStockNegativo` opera como una barrera adicional que rechaza cualquier operación de actualización o inserción en la tabla `Inventario` que genere valores negativos en el campo `Stock_Actual`, complementando la restricción `CHECK` definida a nivel de esquema.

---

## 6.4 Control de transacciones

### 6.4.1 Propiedades ACID en la implementación

El sistema WMS Pro implementa las cuatro propiedades fundamentales de las transacciones de bases de datos a través de los mecanismos nativos de SQL Server:

**Atomicidad:** Cada procedimiento almacenado encapsula sus operaciones dentro de bloques `BEGIN TRANSACTION` / `COMMIT TRANSACTION`. Si se produce un error durante la ejecución, la cláusula `ROLLBACK` revierte todos los cambios parciales, garantizando que la base de datos nunca quede en un estado intermedio. Por ejemplo, el procedimiento `sp_RegistrarProductoWMS` inserta simultáneamente un registro en la tabla `Producto`, otro en la tabla `Inventario` y, de ser necesario, registros en `Movimiento_Inventario` y `Detalle_Movimiento`. Si cualquiera de estas inserciones falla, todas se deshacen.

**Consistencia:** Las restricciones de integridad referencial (llaves foráneas) y las restricciones `CHECK` aseguran que cada transacción lleve la base de datos de un estado válido a otro estado igualmente válido. Las validaciones previas a la ejecución —como la comprobación de existencia de categorías, ubicaciones y productos— previenen la introducción de datos que violarían las reglas de negocio.

**Aislamiento:** SQL Server gestiona automáticamente los niveles de aislamiento mediante su motor de concurrencia. Los bloques de transacción implementados en los procedimientos protegen las operaciones críticas contra interferencias entre sesiones concurrentes, asegurando que las lecturas y escrituras sobre tablas compartidas como `Inventario`, `Producto` y `Pedido` se ejecuten de manera serializable cuando es necesario.

**Durabilidad:** Una vez que un procedimiento ejecuta `COMMIT TRANSACTION`, los cambios quedan registrados de forma permanente en los archivos de la base de datos. SQL Server garantiza esta durabilidad mediante el registro previo en el log de transacciones (*write-ahead logging*), asegurando que los datos persistan incluso ante fallos del sistema.

### 6.4.2 Procedimientos con manejo transaccional

El proyecto contiene 19 procedimientos almacenados que implementan el patrón de transacciones con manejo de errores. Los más representativos incluyen:

**Registro completo de producto con stock inicial (`sp_RegistrarProductoWMS`):** Este procedimiento ejecuta una transacción compuesta por cuatro operaciones: inserción del producto en la tabla `Producto`, creación del registro de inventario en la tabla `Inventario`, y condicionalmente el registro de un movimiento de entrada y su detalle. La transacción solo se confirma si las cuatro operaciones se completan exitosamente.

**Registro de salidas con validación de stock (`sp_RegistrarSalidaWMS`):** Antes de ejecutar la transacción, el procedimiento consulta el stock disponible y lo compara con la cantidad solicitada. Si la cantidad supera el stock, se genera un error y la transacción nunca se inicia. De lo contrario, se actualiza el inventario y se registra el movimiento correspondiente.

**Inclusión validada de ítems en pedidos (`sp_RegistrarDetallePedidoValidado`):** Este procedimiento suma el stock disponible de todas las ubicaciones de un producto y lo compara con la cantidad solicitada. Si la demanda supera la oferta global, se rechaza la operación. En caso contrario, se inserta el detalle del pedido, se actualiza el precio total del pedido y ambas operaciones se confirman conjuntamente.

### 6.4.3 Triggers y control de integridad

Los siete disparadores implementados refuerzan el control transaccional a nivel de fila:

- `TR_Auditoria_Producto` ejecuta una inserción en la tabla de auditoría después de cada nuevo registro de producto, registrando automáticamente la acción y el usuario responsable.
- `TR_HistorialPrecio` captura los valores anterior y nuevo del precio después de cada actualización, creando un registro completo de variaciones de costos.
- `TR_ValidarStockPedido` intercepta las inserciones en `Detalle_Pedido` y verifica contra la tabla `Inventario` que la cantidad solicitada no exceda el stock disponible, emitiendo un error si la validación falla.
- `TR_NoEliminarCategoria` impide la eliminación de categorías que contengan productos asociados, preservando la integridad referencial del catálogo.
- `TR_ImpedirStockNegativo` actúa como una segunda línea de defensa que complementa la restricción `CHECK` de la tabla `Inventario`, rechazando cualquier operación que intente registrar un valor negativo de stock.
- `TR_ValidarAsignacionUbicacion` verifica que cada registro de inventario apunte a una ubicación física válida dentro del almacén.

### 6.4.4 Vistas para consulta consistente

El sistema incorpora siete vistas que encapsulan consultas complejas y garantizan acceso consistente a los datos:

| Vista | Propósito |
|-------|-----------|
| vw_ReporteInventario | Consolidado de productos con su categoría, stock, mínimo y ubicación |
| vw_ReportePedidos | Listado de pedidos con cliente, estado, monto y fecha |
| vw_ReporteProductos | Catálogo simplificado de productos con categoría y precio |
| vw_Usuarios | Información de usuarios sin exponer contraseñas |
| vw_Clientes | Datos básicos de clientes para formularios de pedido |
| vw_StockTiempoReal | Disponibilidad de inventario con código de ubicación desglosado |
| vw_HistorialMovimientos | Registro completo de entradas, salidas y ajustes con usuario responsable |
| vw_EstadoActualPedidos | Estado del flujo completo de cada pedido (picking, packing, despacho) |

Estas vistas protegen la integridad de los datos al centralizar la lógica de acceso y evitar que los usuarios finales realicen consultas directas sobre las tablas base, reduciendo el riesgo de errores humanos y consultas mal formadas.

### 6.4.5 Índices para optimización

Para mejorar el rendimiento de las consultas frecuentes, el sistema incorpora tres índices nonclustered sobre las columnas de búsqueda más utilizadas:

```sql
CREATE NONCLUSTERED INDEX IX_Producto_Nombre ON Producto(Nombre_Producto);
CREATE NONCLUSTERED INDEX IX_Cliente_Documento ON Cliente(Num_Documento);
CREATE NONCLUSTERED INDEX IX_Pedido_Fecha ON Pedido(Fecha_Pedido);
```

Estos índices aceleran las operaciones de búsqueda por nombre de producto, número de documento de cliente y fecha de pedido, reduciendo los tiempos de respuesta en las consultas de reportes y seguimiento de operaciones diarias del almacén.
