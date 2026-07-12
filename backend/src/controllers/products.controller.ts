import { Request, Response } from 'express';
import sql from 'mssql';
import { pool } from '../config/database';
import { RequestWithUser } from '../middleware/auth';

export const getAll = async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query;
    let query = `
      SELECT p.Id_Producto, p.Nombre_Producto, p.Descripcion, p.Precio, p.Stock_Minimo,
             c.Nombre_Categoria, i.Stock_Actual, i.Estado_Stock, u.Codigo_Ubicacion
      FROM Producto p
      INNER JOIN Categoria c ON p.Id_Categoria = c.Id_Categoria
      LEFT JOIN Inventario i ON p.Id_Producto = i.Id_Producto
      LEFT JOIN Ubicacion u ON i.Id_Ubicacion = u.Codigo_Ubicacion
    `;
    const conditions: string[] = [];
    const request = pool.request();
    if (search) {
      conditions.push('p.Nombre_Producto LIKE @search');
      request.input('search', sql.VarChar, `%${search}%`);
    }
    if (category) {
      conditions.push('p.Id_Categoria = @category');
      request.input('category', sql.Int, parseInt(category as string));
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    const result = await request.query(query);
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id as string))
      .query(`
        SELECT p.Id_Producto, p.Nombre_Producto, p.Descripcion, p.Precio, p.Stock_Minimo,
               c.Nombre_Categoria, i.Stock_Actual, i.Estado_Stock, u.Codigo_Ubicacion
        FROM Producto p
        INNER JOIN Categoria c ON p.Id_Categoria = c.Id_Categoria
        LEFT JOIN Inventario i ON p.Id_Producto = i.Id_Producto
        LEFT JOIN Ubicacion u ON i.Id_Ubicacion = u.Codigo_Ubicacion
        WHERE p.Id_Producto = @id
      `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    return res.status(200).json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, precio, categoria, stockInicial, ubicacion } = req.body;
    if (!nombre || !precio || !categoria) {
      return res.status(400).json({ success: false, message: 'Nombre, precio y categoría son requeridos' });
    }
    const productResult = await pool.request()
      .input('Nombre_Producto', sql.VarChar, nombre)
      .input('Descripcion', sql.VarChar, descripcion || '')
      .input('Precio', sql.Decimal(10, 2), precio)
      .input('Stock_Minimo', sql.Int, 0)
      .input('Id_Categoria', sql.Int, categoria)
      .query(`
        INSERT INTO Producto (Nombre_Producto, Descripcion, Precio, Stock_Minimo, Id_Categoria)
        OUTPUT INSERTED.Id_Producto
        VALUES (@Nombre_Producto, @Descripcion, @Precio, @Stock_Minimo, @Id_Categoria)
      `);
    const productId = productResult.recordset[0].Id_Producto;
    if (ubicacion) {
      await pool.request()
        .input('Id_Producto', sql.Int, productId)
        .input('Stock_Actual', sql.Int, stockInicial || 0)
        .input('Estado_Stock', sql.VarChar, 'Disponible')
        .input('Id_Ubicacion', sql.VarChar, ubicacion)
        .query(`
          INSERT INTO Inventario (Stock_Actual, Estado_Stock, Id_Producto, Id_Ubicacion)
          VALUES (@Stock_Actual, @Estado_Stock, @Id_Producto, @Id_Ubicacion)
        `);
    }
    return res.status(201).json({ success: true, message: 'Producto creado exitosamente', data: { id: productId } });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoria } = req.body;
    await pool.request()
      .input('id', sql.Int, parseInt(id as string))
      .input('Nombre_Producto', sql.VarChar, nombre)
      .input('Descripcion', sql.VarChar, descripcion || '')
      .input('Precio', sql.Decimal(10, 2), precio)
      .input('Id_Categoria', sql.Int, categoria)
      .query(`
        UPDATE Producto
        SET Nombre_Producto = @Nombre_Producto, Descripcion = @Descripcion,
            Precio = @Precio, Id_Categoria = @Id_Categoria
        WHERE Id_Producto = @id
      `);
    return res.status(200).json({ success: true, message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.request()
      .input('id', sql.Int, parseInt(id as string))
      .query(`
        DELETE FROM Inventario WHERE Id_Producto = @id;
        DELETE FROM Producto WHERE Id_Producto = @id
      `);
    return res.status(200).json({ success: true, message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const addMovement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tipo_movimiento, cantidad, detalle } = req.body;
    const userId = (req as RequestWithUser).user?.userId;
    if (!tipo_movimiento || !cantidad) {
      return res.status(400).json({ success: false, message: 'Tipo de movimiento y cantidad son requeridos' });
    }
    const tipoResult = await pool.request()
      .input('Descripcion', sql.VarChar, tipo_movimiento)
      .query('SELECT Id_Tipo_Movimiento FROM Tipo_Movimiento WHERE Descripcion = @Descripcion');
    const tipoId = tipoResult.recordset[0]?.Id_Tipo_Movimiento;
    if (!tipoId) {
      return res.status(400).json({ success: false, message: 'Tipo de movimiento no válido' });
    }
    const invResult = await pool.request()
      .input('Id_Producto', sql.Int, parseInt(id as string))
      .query('SELECT Id_Inventario, Stock_Actual FROM Inventario WHERE Id_Producto = @Id_Producto');
    const inv = invResult.recordset[0];
    if (!inv) {
      return res.status(400).json({ success: false, message: 'Producto sin inventario asociado' });
    }
    await pool.request()
      .input('Observacion', sql.VarChar, detalle || 'Movimiento')
      .input('Id_Usuario', sql.Int, userId || 1)
      .input('Id_Tipo_Movimiento', sql.Int, tipoId)
      .query(`
        INSERT INTO Movimiento_Inventario (Observacion, Id_Usuario, Id_Tipo_Movimiento)
        VALUES (@Observacion, @Id_Usuario, @Id_Tipo_Movimiento)
      `);
    await pool.request()
      .input('Cantidad', sql.Int, cantidad)
      .input('Id_Movimiento_Inventario', sql.Int, 1)
      .input('Id_Inventario', sql.Int, inv.Id_Inventario)
      .query(`
        INSERT INTO Detalle_Movimiento (Cantidad, Id_Movimiento_Inventario, Id_Inventario)
        VALUES (@Cantidad, @Id_Movimiento_Inventario, @Id_Inventario)
      `);
    const newStock = tipo_movimiento === 'Entrada' ? inv.Stock_Actual + cantidad : inv.Stock_Actual - cantidad;
    await pool.request()
      .input('Id_Inventario', sql.Int, inv.Id_Inventario)
      .input('Stock_Actual', sql.Int, Math.max(0, newStock))
      .query('UPDATE Inventario SET Stock_Actual = @Stock_Actual WHERE Id_Inventario = @Id_Inventario');
    return res.status(201).json({ success: true, message: 'Movimiento registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar movimiento:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
