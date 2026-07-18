import { Request, Response } from 'express';
import sql from 'mssql';
import { pool } from '../config/database';

export const getStock = async (_req: Request, res: Response) => {
  try {
    const result = await pool.request().query('SELECT * FROM vw_StockTiempoReal');
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener stock:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getStockByProduct = async (req: Request, res: Response) => {
  try {
    const sku = req.params.sku as string;
    const result = await pool.request()
      .input('Codigo', sql.VarChar, sku)
      .query('SELECT * FROM vw_StockTiempoReal WHERE Codigo_Producto = @Codigo');
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener stock:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getHistory = async (_req: Request, res: Response) => {
  try {
    const result = await pool.request().query('SELECT * FROM vw_HistorialMovimientos');
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getLowStock = async (_req: Request, res: Response) => {
  try {
    await pool.request().execute('sp_ReporteProductosBajoStock');
    const result = await pool.request().query(`
      SELECT p.Codigo_Producto, p.Nombre_Producto, c.Nombre_Categoria,
             p.Stock_Minimo, COALESCE(SUM(i.Stock_Actual), 0) AS Stock_Total_Actual
      FROM Producto p
      INNER JOIN Categoria c ON p.Id_Categoria = c.Id_Categoria
      LEFT JOIN Inventario i ON p.Id_Producto = i.Id_Producto
      GROUP BY p.Codigo_Producto, p.Nombre_Producto, c.Nombre_Categoria, p.Stock_Minimo
      HAVING COALESCE(SUM(i.Stock_Actual), 0) <= p.Stock_Minimo
      ORDER BY Stock_Total_Actual ASC
    `);
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener bajo stock:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
