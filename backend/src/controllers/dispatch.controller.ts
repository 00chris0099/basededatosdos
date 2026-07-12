import { Request, Response } from 'express';
import sql from 'mssql';
import { pool } from '../config/database';

export const getAll = async (req: Request, res: Response) => {
  try {
    const result = await pool.request().query(`
      SELECT d.Id_Despacho, d.Direccion_Envio, d.Fecha_Despacho,
             pk.Id_Packing, p.Id_Pedido, c.Nombre AS cliente,
             ed.Descripcion AS estado_despacho
      FROM Despacho d
      INNER JOIN Packing pk ON d.Id_Packing = pk.Id_Packing
      INNER JOIN Picking pi ON pk.Id_Picking = pi.Id_Picking
      INNER JOIN Pedido p ON pi.Id_Pedido = p.Id_Pedido
      INNER JOIN Cliente c ON p.Id_Cliente = c.Id_Cliente
      INNER JOIN Estado_Despacho ed ON d.Id_Estado_Despacho = ed.Id_Estado_Despacho
    `);
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener despachos:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id as string))
      .query(`
        SELECT d.Id_Despacho, d.Direccion_Envio, d.Fecha_Despacho,
               pk.Id_Packing, p.Id_Pedido, c.Nombre AS cliente,
               ed.Descripcion AS estado_despacho
        FROM Despacho d
        INNER JOIN Packing pk ON d.Id_Packing = pk.Id_Packing
        INNER JOIN Picking pi ON pk.Id_Picking = pi.Id_Picking
        INNER JOIN Pedido p ON pi.Id_Pedido = p.Id_Pedido
        INNER JOIN Cliente c ON p.Id_Cliente = c.Id_Cliente
        INNER JOIN Estado_Despacho ed ON d.Id_Estado_Despacho = ed.Id_Estado_Despacho
        WHERE d.Id_Despacho = @id
      `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Despacho no encontrado' });
    }
    return res.status(200).json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('Error al obtener despacho:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Despacho WHERE Id_Estado_Despacho = 1) AS pendiente,
        (SELECT COUNT(*) FROM Despacho WHERE Id_Estado_Despacho = 2) AS en_ruta,
        (SELECT COUNT(*) FROM Despacho WHERE Id_Estado_Despacho = 3) AS entregado
    `);
    return res.status(200).json({ success: true, data: stats.recordset[0] });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { packingId, direccionEnvio } = req.body;
    if (!packingId || !direccionEnvio) {
      return res.status(400).json({ success: false, message: 'El ID del packing y la dirección son requeridos' });
    }
    const existing = await pool.request()
      .input('Id_Packing', sql.Int, parseInt(packingId as string))
      .query('SELECT Id_Despacho FROM Despacho WHERE Id_Packing = @Id_Packing');
    if (existing.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya existe un despacho para este packing' });
    }
    await pool.request()
      .input('Id_Packing', sql.Int, parseInt(packingId as string))
      .input('Direccion_Envio', sql.VarChar, direccionEnvio)
      .input('Id_Estado_Despacho', sql.Int, 1)
      .query(`
        INSERT INTO Despacho (Id_Packing, Direccion_Envio, Id_Estado_Despacho)
        VALUES (@Id_Packing, @Direccion_Envio, @Id_Estado_Despacho)
      `);
    return res.status(201).json({ success: true, message: 'Despacho creado exitosamente' });
  } catch (error) {
    console.error('Error al crear despacho:', error);
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
      .query('SELECT Id_Estado_Despacho FROM Estado_Despacho WHERE Descripcion = @Descripcion');
    const estadoId = estadoResult.recordset[0]?.Id_Estado_Despacho;
    if (!estadoId) {
      return res.status(400).json({ success: false, message: 'Estado no válido' });
    }
    await pool.request()
      .input('id', sql.Int, parseInt(id as string))
      .input('Id_Estado_Despacho', sql.Int, estadoId)
      .query('UPDATE Despacho SET Id_Estado_Despacho = @Id_Estado_Despacho WHERE Id_Despacho = @id');
    return res.status(200).json({ success: true, message: 'Estado del despacho actualizado' });
  } catch (error) {
    console.error('Error al actualizar despacho:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
