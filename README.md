# WMS Pro - Versión mejorada con roles, estados y layout controlado

Esta versión mantiene la estética del proyecto original, pero agrega navegación funcional, datos demo, control de roles, SKU automático, estados de pedidos modificables y límites reales para la ubicación del almacén.

## Cómo abrir

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Ejecuta `login.html` con Live Server.
3. Inicia sesión con uno de los usuarios de prueba.
4. Los datos se guardan en `localStorage`, por eso puedes probar registros, cambios de estado, productos, usuarios y pedidos sin base de datos todavía.

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Dueño | dueno@wmspro.com | 123456 |
| Administrador | admin@wmspro.com | 123456 |
| Supervisor | supervisor@wmspro.com | 123456 |
| Operario | operario@wmspro.com | 123456 |

> Los usuarios de prueba solo aparecen en este README. El login no muestra credenciales.

## Qué puede hacer cada rol

### Dueño

El Dueño tiene acceso completo al sistema. Puede revisar el dashboard general, controlar productos, ubicaciones, pedidos, picking, packing, despacho, reportes, usuarios y configuración. También puede borrar pedidos para pruebas, crear usuarios, editar su perfil y verificar el resumen general de la cuenta.

### Administrador

El Administrador gestiona la operación completa del WMS. Puede registrar productos, revisar ubicaciones, cambiar estados de pedidos, borrar pedidos de prueba, administrar usuarios, revisar reportes, validar incidencias y controlar el flujo del almacén. Es el rol recomendado para supervisar la aplicación durante una demostración académica.

### Supervisor

El Supervisor controla la operación diaria. Puede registrar productos, consultar stock, revisar ubicaciones, cambiar estados de pedidos, ver picking, packing, despacho y reportes. No administra usuarios ni elimina pedidos, porque esas acciones quedan reservadas para Dueño y Administrador.

### Operario

El Operario está enfocado en la ejecución del almacén. Maneja principalmente pedidos asignados, picking, escaneo simulado de items, reporte de incidencias, packing y despacho. También puede consultar productos y ubicaciones para saber dónde se encuentra cada item, pero no puede crear usuarios ni borrar pedidos.

## Flujo de estados del paquete

Cada pedido puede cambiar de estado desde el módulo **Pedidos** o desde la ventana de detalle del pedido:

1. Pendiente
2. Picking
3. Packing
4. Listo para Despacho
5. En Ruta
6. Entregado
7. Cancelado

También se agregó un botón **Avanzar** para mover el pedido al siguiente estado de forma rápida durante las pruebas.

## Layout del almacén

Por defecto, el sistema trabaja con límites controlados:

- Secciones disponibles: A, B, C, D y E.
- Pasillos disponibles: 1 al 7.
- Niveles disponibles: 01 al 06.
- Bins disponibles: 01 al 04.

En el módulo **Ubicaciones** se agregó una opción para abrir una nueva sección o un nuevo pasillo si el almacén crece. Por ejemplo, puedes agregar la sección F o el pasillo 8.

## Mejoras importantes

- SKU automático único para evitar duplicados.
- Registro de múltiples productos funcionando.
- Carga de imagen de producto.
- Validación de stock mínimo, máximo y capacidad del bin.
- Ubicación con sección, pasillo, nivel y bin.
- Mapa visual de ubicaciones con alerta de estantes llenos.
- Opción para ampliar el layout del almacén.
- Estados de pedido modificables.
- Botón para avanzar el estado del paquete.
- Borrado de pedidos solo para Dueño y Administrador.
- Picking con escaneo simulado de SKU.
- Packing con checklist y envío a “Listo para Despacho”.
- Dispatch con seguimiento de paquetes.
- Incidencias por pedido.
- Reportes con métricas demo.
- Perfil editable con foto, nombre, correo y DNI.
- Usuarios y roles administrables.

## Preparado para SQL Server

Los datos están modelados en JavaScript con objetos similares a tablas relacionales:

- Usuarios
- Roles
- Productos
- Ubicaciones
- Pedidos
- DetallePedido
- MovimientosInventario
- Incidencias
- Configuración de almacén

Cuando conectes SQL Server, la idea es reemplazar las funciones que leen y escriben en `localStorage` por llamadas a una API REST con Node.js + SQL Server.
