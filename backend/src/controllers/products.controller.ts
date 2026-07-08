import { Request, Response } from 'express';
import sql from 'mssql';
import { pool } from '../config/database';
import { RequestWithUser } from '../middleware/auth';

export const getAll = async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query;
    let query = `
      SELECT p.*, c.Nombre_Categoria, i.Cantidad_Existente, i.Ubicacion
      FROM Producto p
      INNER JOIN Categoria c ON p.Categoria = c.id_categoria
      INNER JOIN Inventario i ON p.id_producto = i.Producto
    `;
    const conditions: string[] = [];
    const request = pool.request();

    if (search) {
      conditions.push('p.Nombre_Producto LIKE @search');
      request.input('search', sql.VarChar, `%${search}%`);
    }
    if (category) {
      conditions.push('p.Categoria = @category');
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
      .input('id', sql.Int, parseInt(id))
      .query(`
        SELECT p.*, c.Nombre_Categoria, i.Cantidad_Existente, i.Ubicacion, i.SKU
        FROM Producto p
        INNER JOIN Categoria c ON p.Categoria = c.id_categoria
        INNER JOIN Inventario i ON p.id_producto = i.Producto
        WHERE p.id_producto = @id
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

    const sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const productResult = await pool.request()
      .input('Nombre_Producto', sql.VarChar, nombre)
      .input('Descripcion', sql.VarChar, descripcion || '')
      .input('Precio', sql.Decimal(10, 2), precio)
      .input('Categoria', sql.Int, categoria)
      .query(`
        INSERT INTO Producto (Nombre_Producto, Descripcion, Precio, Categoria)
        OUTPUT INSERTED.id_producto
        VALUES (@Nombre_Producto, @Descripcion, @Precio, @Categoria)
      `);

    const productId = productResult.recordset[0].id_producto;

    await pool.request()
      .input('Producto', sql.Int, productId)
      .input('SKU', sql.VarChar, sku)
      .input('Cantidad_Existente', sql.Int, stockInicial || 0)
      .input('Ubicacion', sql.VarChar, ubicacion || '')
      .query(`
        INSERT INTO Inventario (Producto, SKU, Cantidad_Existente, Ubicacion)
        VALUES (@Producto, @SKU, @Cantidad_Existente, @Ubicacion)
      `);

    return res.status(201).json({ success: true, message: 'Producto creado exitosamente', data: { id: productId, sku } });
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
      .input('id', sql.Int, parseInt(id))
      .input('Nombre_Producto', sql.VarChar, nombre)
      .input('Descripcion', sql.VarChar, descripcion || '')
      .input('Precio', sql.Decimal(10, 2), precio)
      .input('Categoria', sql.Int, categoria)
      .query(`
        UPDATE Producto
        SET Nombre_Producto = @Nombre_Producto, Descripcion = @Descripcion,
            Precio = @Precio, Categoria = @Categoria
        WHERE id_producto = @id
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
      .input('id', sql.Int, parseInt(id))
      .query(`
        DELETE FROM Inventario WHERE Producto = @id;
        DELETE FROM Producto WHERE id_producto = @id
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

    await pool.request()
      .input('Producto', sql.Int, parseInt(id))
      .input('Tipo_Movimiento', sql.VarChar, tipo_movimiento)
      .input('Cantidad', sql.Int, cantidad)
      .input('Usuario', sql.Int, userId)
      .query(`
        INSERT INTO Movimiento_Inventario (Producto, Tipo_Movimiento, Cantidad, Fecha_Movimiento, Usuario)
        VALUES (@Producto, @Tipo_Movimiento, @Cantidad, GETDATE(), @Usuario)
      `);

    const inventoryResult = await pool.request()
      .input('Producto', sql.Int, parseInt(id))
      .query(`SELECT Cantidad_Existente FROM Inventario WHERE Producto = @Producto`);

    const currentStock = inventoryResult.recordset[0]?.Cantidad_Existente || 0;
    const newStock = tipo_movimiento === 'Entrada'
      ? currentStock + cantidad
      : currentStock - cantidad;

    await pool.request()
      .input('Producto', sql.Int, parseInt(id))
      .input('Cantidad', sql.Int, newStock)
      .query(`
        UPDATE Inventario SET Cantidad_Existente = @Cantidad WHERE Producto = @Producto
      `);

    return res.status(201).json({ success: true, message: 'Movimiento registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar movimiento:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
