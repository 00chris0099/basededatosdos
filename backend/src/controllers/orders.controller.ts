import { Request, Response } from 'express';
import sql from 'mssql';
import { pool } from '../config/database';

export const getAll = async (req: Request, res: Response) => {
  try {
    const result = await pool.request().query(`
      SELECT p.Id_Pedido, p.Fecha_Pedido, p.Precio_Total,
             c.Nombre AS cliente, ep.Descripcion AS estado
      FROM Pedido p
      INNER JOIN Cliente c ON p.Id_Cliente = c.Id_Cliente
      INNER JOIN Estado_Pedido ep ON p.Id_Estado_Pedido = ep.Id_Estado_Pedido
    `);
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id as string))
      .query(`
        SELECT p.Id_Pedido, p.Fecha_Pedido, p.Precio_Total,
               c.Nombre AS cliente, ep.Descripcion AS estado
        FROM Pedido p
        INNER JOIN Cliente c ON p.Id_Cliente = c.Id_Cliente
        INNER JOIN Estado_Pedido ep ON p.Id_Estado_Pedido = ep.Id_Estado_Pedido
        WHERE p.Id_Pedido = @id
      `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }
    return res.status(200).json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
