import { Request, Response } from 'express';
import sql from 'mssql';
import { pool } from '../config/database';

export const getAll = async (req: Request, res: Response) => {
  try {
    const result = await pool.request().query(`
      SELECT u.Codigo_Ubicacion, u.Pasillo, u.Estante, u.Nivel,
             i.Stock_Actual, i.Estado_Stock
      FROM Ubicacion u
      LEFT JOIN Inventario i ON u.Codigo_Ubicacion = i.Id_Ubicacion
    `);
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener ubicaciones:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { codigo, pasillo, estante, nivel } = req.body;
    if (!codigo || !pasillo || !estante || !nivel) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }
    await pool.request()
      .input('Codigo_Ubicacion', sql.VarChar, codigo)
      .input('Pasillo', sql.VarChar, pasillo)
      .input('Estante', sql.VarChar, estante)
      .input('Nivel', sql.VarChar, nivel)
      .query('INSERT INTO Ubicacion (Codigo_Ubicacion, Pasillo, Estante, Nivel) VALUES (@Codigo_Ubicacion, @Pasillo, @Estante, @Nivel)');
    return res.status(201).json({ success: true, message: 'Ubicación creada exitosamente' });
  } catch (error) {
    console.error('Error al crear ubicación:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
