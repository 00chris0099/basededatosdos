import { Request, Response } from 'express';
import sql from 'mssql';
import { pool } from '../config/database';

export const getAll = async (req: Request, res: Response) => {
  try {
    const result = await pool.request().query('SELECT * FROM vw_EstadoActualPedidos');
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`
        SELECT p.*, c.Nombre AS cliente, c.Num_Documento, c.Telefono AS Telefono_Cliente,
               ep.Descripcion AS estado
        FROM Pedido p
        INNER JOIN Cliente c ON p.Id_Cliente = c.Id_Cliente
        INNER JOIN Estado_Pedido ep ON p.Id_Estado_Pedido = ep.Id_Estado_Pedido
        WHERE p.Id_Pedido = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    const items = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`
        SELECT dp.*, p.Nombre_Producto, p.Codigo_Producto
        FROM Detalle_Pedido dp
        INNER JOIN Producto p ON dp.Id_Producto = p.Id_Producto
        WHERE dp.Id_Pedido = @id
      `);

    return res.status(200).json({
      success: true,
      data: { ...result.recordset[0], items: items.recordset },
    });
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const addItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { codigo_producto, cantidad } = req.body;

    await pool.request()
      .input('Id_Pedido', sql.Int, parseInt(id))
      .input('Codigo_Producto', sql.VarChar, codigo_producto)
      .input('Cantidad', sql.Int, cantidad)
      .execute('sp_RegistrarDetallePedidoValidado');

    return res.status(201).json({ success: true, message: 'Item agregado al pedido' });
  } catch (error: any) {
    console.error('Error al agregar item:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor' });
  }
};

export const getByEstado = async (req: Request, res: Response) => {
  try {
    const estado = req.query.estado as string | undefined;
    let query = 'SELECT * FROM vw_EstadoActualPedidos';
    const request = pool.request();
    if (estado) {
      query += ' WHERE Estado_Pedido = @estado';
      request.input('estado', sql.VarChar, estado);
    }
    const result = await request.query(query);
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const advanceOrder = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const result = await pool.request()
      .input('Id_Pedido', sql.Int, id)
      .execute('sp_AvanzarPedidoWMS');
    return res.status(200).json({ success: true, message: 'Pedido avanzado exitosamente', data: result.recordset[0] });
  } catch (error: any) {
    console.error('Error al avanzar pedido:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor' });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { status } = req.body;

    const estadoResult = await pool.request()
      .input('Descripcion', sql.VarChar, status)
      .query('SELECT Id_Estado_Pedido FROM Estado_Pedido WHERE Descripcion = @Descripcion');

    if (estadoResult.recordset.length === 0) {
      return res.status(400).json({ success: false, message: 'Estado no válido' });
    }

    const idEstado = estadoResult.recordset[0].Id_Estado_Pedido;

    await pool.request()
      .input('Id_Pedido', sql.Int, id)
      .input('Id_Estado', sql.Int, idEstado)
      .query('UPDATE Pedido SET Id_Estado_Pedido = @Id_Estado WHERE Id_Pedido = @Id_Pedido');

    return res.status(200).json({ success: true, message: 'Estado actualizado exitosamente' });
  } catch (error: any) {
    console.error('Error al actualizar estado:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor' });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { clienteId, items } = req.body;

    if (!clienteId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cliente y al menos un item son requeridos' });
    }

    const itemsJson = JSON.stringify(items);

    const result = await pool.request()
      .input('Id_Cliente', sql.Int, clienteId)
      .input('Items', sql.NVarChar, itemsJson)
      .execute('sp_CrearPedidoWMS');

    const nuevoPedidoId = result.recordset[0]?.Id_Pedido;
    return res.status(201).json({ success: true, message: 'Pedido creado exitosamente', data: { id: nuevoPedidoId } });
  } catch (error: any) {
    console.error('Error al crear pedido:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor' });
  }
};
