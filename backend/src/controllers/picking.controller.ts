import { Request, Response } from 'express';
import sql from 'mssql';
import { pool } from '../config/database';

export const getAll = async (req: Request, res: Response) => {
  try {
    const result = await pool.request().query(`
      SELECT pi.Id_Picking, pi.Fecha_Picking,
             p.Id_Pedido, c.Nombre AS cliente, ep.Descripcion AS estado_pedido,
             epk.Descripcion AS estado_picking
      FROM Picking pi
      INNER JOIN Pedido p ON pi.Id_Pedido = p.Id_Pedido
      INNER JOIN Cliente c ON p.Id_Cliente = c.Id_Cliente
      INNER JOIN Estado_Pedido ep ON p.Id_Estado_Pedido = ep.Id_Estado_Pedido
      INNER JOIN Estado_Picking epk ON pi.Id_Estado_Picking = epk.Id_Estado_Picking
    `);
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener pickings:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id as string))
      .query(`
        SELECT pi.Id_Picking, pi.Fecha_Picking,
               p.Id_Pedido, c.Nombre AS cliente, ep.Descripcion AS estado_pedido,
               epk.Descripcion AS estado_picking
        FROM Picking pi
        INNER JOIN Pedido p ON pi.Id_Pedido = p.Id_Pedido
        INNER JOIN Cliente c ON p.Id_Cliente = c.Id_Cliente
        INNER JOIN Estado_Pedido ep ON p.Id_Estado_Pedido = ep.Id_Estado_Pedido
        INNER JOIN Estado_Picking epk ON pi.Id_Estado_Picking = epk.Id_Estado_Picking
        WHERE pi.Id_Picking = @id
      `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Picking no encontrado' });
    }
    return res.status(200).json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('Error al obtener picking:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getByOrderId = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const result = await pool.request()
      .input('orderId', sql.Int, parseInt(orderId as string))
      .query(`
        SELECT pi.Id_Picking, pi.Fecha_Picking, epk.Descripcion AS estado_picking
        FROM Picking pi
        INNER JOIN Estado_Picking epk ON pi.Id_Estado_Picking = epk.Id_Estado_Picking
        WHERE pi.Id_Pedido = @orderId
      `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Picking no encontrado para este pedido' });
    }
    return res.status(200).json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('Error al obtener picking por pedido:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { pedidoId } = req.body;
    if (!pedidoId) {
      return res.status(400).json({ success: false, message: 'El ID del pedido es requerido' });
    }
    const existing = await pool.request()
      .input('Id_Pedido', sql.Int, parseInt(pedidoId as string))
      .query('SELECT Id_Picking FROM Picking WHERE Id_Pedido = @Id_Pedido');
    if (existing.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya existe un picking para este pedido' });
    }
    await pool.request()
      .input('Id_Pedido', sql.Int, parseInt(pedidoId as string))
      .input('Id_Estado_Picking', sql.Int, 1)
      .query(`
        INSERT INTO Picking (Id_Pedido, Id_Estado_Picking)
        VALUES (@Id_Pedido, @Id_Estado_Picking)
      `);
    return res.status(201).json({ success: true, message: 'Picking creado exitosamente' });
  } catch (error) {
    console.error('Error al crear picking:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    if (!estado) {
      return res.status(400).json({ success: false, message: 'El estado es requerido' });
    }
    const estadoResult = await pool.request()
      .input('Descripcion', sql.VarChar, estado)
      .query('SELECT Id_Estado_Picking FROM Estado_Picking WHERE Descripcion = @Descripcion');
    const estadoId = estadoResult.recordset[0]?.Id_Estado_Picking;
    if (!estadoId) {
      return res.status(400).json({ success: false, message: 'Estado no válido' });
    }
    await pool.request()
      .input('id', sql.Int, parseInt(id as string))
      .input('Id_Estado_Picking', sql.Int, estadoId)
      .query('UPDATE Picking SET Id_Estado_Picking = @Id_Estado_Picking WHERE Id_Picking = @id');
    return res.status(200).json({ success: true, message: 'Estado del picking actualizado' });
  } catch (error) {
    console.error('Error al actualizar picking:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getPendingOrders = async (req: Request, res: Response) => {
  try {
    const result = await pool.request().query(`
      SELECT p.Id_Pedido, p.Fecha_Pedido, p.Precio_Total,
             c.Nombre AS cliente, ep.Descripcion AS estado
      FROM Pedido p
      INNER JOIN Cliente c ON p.Id_Cliente = c.Id_Cliente
      INNER JOIN Estado_Pedido ep ON p.Id_Estado_Pedido = ep.Id_Estado_Pedido
      WHERE NOT EXISTS (SELECT 1 FROM Picking pi WHERE pi.Id_Pedido = p.Id_Pedido)
    `);
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener pedidos pendientes:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
