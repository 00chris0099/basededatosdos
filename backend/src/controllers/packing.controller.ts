import { Request, Response } from 'express';
import sql from 'mssql';
import { pool } from '../config/database';

export const getAll = async (req: Request, res: Response) => {
  try {
    const result = await pool.request().query(`
      SELECT pk.Id_Packing, pk.Fecha_Packing,
             pi.Id_Picking, p.Id_Pedido, c.Nombre AS cliente,
             epk.Descripcion AS estado_picking,
             epk2.Descripcion AS estado_packing
      FROM Packing pk
      INNER JOIN Picking pi ON pk.Id_Picking = pi.Id_Picking
      INNER JOIN Pedido p ON pi.Id_Pedido = p.Id_Pedido
      INNER JOIN Cliente c ON p.Id_Cliente = c.Id_Cliente
      INNER JOIN Estado_Picking epk ON pi.Id_Estado_Picking = epk.Id_Estado_Picking
      INNER JOIN Estado_Packing epk2 ON pk.Id_Estado_Packing = epk2.Id_Estado_Packing
    `);
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener packings:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id as string))
      .query(`
        SELECT pk.Id_Packing, pk.Fecha_Packing,
               pi.Id_Picking, p.Id_Pedido, c.Nombre AS cliente,
               epk.Descripcion AS estado_picking,
               epk2.Descripcion AS estado_packing
        FROM Packing pk
        INNER JOIN Picking pi ON pk.Id_Picking = pi.Id_Picking
        INNER JOIN Pedido p ON pi.Id_Pedido = p.Id_Pedido
        INNER JOIN Cliente c ON p.Id_Cliente = c.Id_Cliente
        INNER JOIN Estado_Picking epk ON pi.Id_Estado_Picking = epk.Id_Estado_Picking
        INNER JOIN Estado_Packing epk2 ON pk.Id_Estado_Packing = epk2.Id_Estado_Packing
        WHERE pk.Id_Packing = @id
      `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Packing no encontrado' });
    }
    return res.status(200).json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('Error al obtener packing:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getByPickingId = async (req: Request, res: Response) => {
  try {
    const { pickingId } = req.params;
    const result = await pool.request()
      .input('pickingId', sql.Int, parseInt(pickingId as string))
      .query(`
        SELECT pk.Id_Packing, pk.Fecha_Packing, epk.Descripcion AS estado_packing
        FROM Packing pk
        INNER JOIN Estado_Packing epk ON pk.Id_Estado_Packing = epk.Id_Estado_Packing
        WHERE pk.Id_Picking = @pickingId
      `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Packing no encontrado para este picking' });
    }
    return res.status(200).json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('Error al obtener packing por picking:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { pickingId } = req.body;
    if (!pickingId) {
      return res.status(400).json({ success: false, message: 'El ID del picking es requerido' });
    }
    const existing = await pool.request()
      .input('Id_Picking', sql.Int, parseInt(pickingId as string))
      .query('SELECT Id_Packing FROM Packing WHERE Id_Picking = @Id_Picking');
    if (existing.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya existe un packing para este picking' });
    }
    await pool.request()
      .input('Id_Picking', sql.Int, parseInt(pickingId as string))
      .input('Id_Estado_Packing', sql.Int, 1)
      .query(`
        INSERT INTO Packing (Id_Picking, Id_Estado_Packing)
        VALUES (@Id_Picking, @Id_Estado_Packing)
      `);
    return res.status(201).json({ success: true, message: 'Packing creado exitosamente' });
  } catch (error) {
    console.error('Error al crear packing:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const confirm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const packing = await pool.request()
      .input('id', sql.Int, parseInt(id as string))
      .query('SELECT Id_Estado_Packing FROM Packing WHERE Id_Packing = @id');
    if (packing.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Packing no encontrado' });
    }
    await pool.request()
      .input('id', sql.Int, parseInt(id as string))
      .input('Id_Estado_Packing', sql.Int, 3)
      .query('UPDATE Packing SET Id_Estado_Packing = @Id_Estado_Packing WHERE Id_Packing = @id');
    return res.status(200).json({ success: true, message: 'Empaque confirmado' });
  } catch (error) {
    console.error('Error al confirmar packing:', error);
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
      .query('SELECT Id_Estado_Packing FROM Estado_Packing WHERE Descripcion = @Descripcion');
    const estadoId = estadoResult.recordset[0]?.Id_Estado_Packing;
    if (!estadoId) {
      return res.status(400).json({ success: false, message: 'Estado no válido' });
    }
    await pool.request()
      .input('id', sql.Int, parseInt(id as string))
      .input('Id_Estado_Packing', sql.Int, estadoId)
      .query('UPDATE Packing SET Id_Estado_Packing = @Id_Estado_Packing WHERE Id_Packing = @id');
    return res.status(200).json({ success: true, message: 'Estado del packing actualizado' });
  } catch (error) {
    console.error('Error al actualizar packing:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
