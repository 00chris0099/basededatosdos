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
