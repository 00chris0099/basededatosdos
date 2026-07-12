import { Request, Response } from 'express';
import { pool } from '../config/database';

export const getKpis = async (req: Request, res: Response) => {
  try {
    const products = await pool.request().query('SELECT COUNT(*) as total FROM Producto');
    const orders = await pool.request().query('SELECT COUNT(*) as total FROM Pedido');
    const inventory = await pool.request().query('SELECT ISNULL(SUM(Stock_Actual), 0) as total FROM Inventario');
    return res.status(200).json({
      success: true,
      data: {
        totalProducts: products.recordset[0].total,
        totalOrders: orders.recordset[0].total,
        totalStock: inventory.recordset[0].total,
      },
    });
  } catch (error) {
    console.error('Error al obtener KPIs:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
