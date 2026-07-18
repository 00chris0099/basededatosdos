import { Request, Response } from 'express';
import sql from 'mssql';
import { pool } from '../config/database';
import { RequestWithUser } from '../middleware/auth';

export const getAll = async (req: Request, res: Response) => {
  try {
    const result = await pool.request().query('SELECT * FROM vw_StockTiempoReal');
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getBySku = async (req: Request, res: Response) => {
  try {
    const sku = req.params.sku as string;
    const result = await pool.request()
      .input('Codigo', sql.VarChar, sku)
      .query('SELECT * FROM vw_StockTiempoReal WHERE Codigo_Producto = @Codigo');
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    return res.status(200).json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query('SELECT * FROM vw_StockTiempoReal WHERE Codigo_Producto = @id');
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
    const { codigo, nombre, descripcion, precio, stockMinimo, categoria, stockInicial, ubicacion, idMarca } = req.body;
    const userId = (req as RequestWithUser).user?.userId || 1;

    await pool.request()
      .input('Codigo_Producto', sql.VarChar, codigo)
      .input('Nombre_Producto', sql.VarChar, nombre)
      .input('Descripcion', sql.VarChar, descripcion || '')
      .input('Precio', sql.Decimal(10, 2), precio)
      .input('Stock_Minimo', sql.Int, stockMinimo || 0)
      .input('Id_Categoria', sql.Int, categoria)
      .input('Stock_Inicial', sql.Int, stockInicial || 0)
      .input('Id_Ubicacion', sql.VarChar, ubicacion || 'A101')
      .input('Id_Usuario', sql.Int, userId)
      .input('Id_Marca', sql.Int, idMarca || null)
      .execute('sp_RegistrarProductoWMS');

    return res.status(201).json({ success: true, message: 'Producto creado exitosamente' });
  } catch (error: any) {
    console.error('Error al crear producto:', error);
    const msg = error.message || 'Error interno del servidor';
    return res.status(500).json({ success: false, message: msg });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { nombre, descripcion, precio, stockMinimo, categoria } = req.body;

    await pool.request()
      .input('Id_Producto', sql.Int, parseInt(id))
      .input('Nombre_Producto', sql.VarChar, nombre)
      .input('Descripcion', sql.VarChar, descripcion || '')
      .input('Precio', sql.Decimal(10, 2), precio)
      .input('Stock_Minimo', sql.Int, stockMinimo || 0)
      .input('Id_Categoria', sql.Int, categoria)
      .execute('sp_ActualizarProductoWMS');

    return res.status(200).json({ success: true, message: 'Producto actualizado exitosamente' });
  } catch (error: any) {
    console.error('Error al actualizar producto:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await pool.request()
      .input('Id_Producto', sql.Int, parseInt(id))
      .execute('sp_EliminarProductoWMS');
    return res.status(200).json({ success: true, message: 'Producto eliminado exitosamente' });
  } catch (error: any) {
    console.error('Error al eliminar producto:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor' });
  }
};

export const addMovement = async (req: Request, res: Response) => {
  try {
    const { tipo_movimiento, cantidad, codigo_producto, codigo_ubicacion, observacion } = req.body;
    const userId = (req as RequestWithUser).user?.userId || 1;

    if (tipo_movimiento === 'Entrada') {
      await pool.request()
        .input('Codigo_Producto', sql.VarChar, codigo_producto)
        .input('Cantidad', sql.Int, cantidad)
        .input('Codigo_Ubicacion', sql.VarChar, codigo_ubicacion)
        .input('Id_Usuario', sql.Int, userId)
        .input('Observacion', sql.VarChar, observacion || '')
        .execute('sp_RegistrarEntradaWMS');
    } else if (tipo_movimiento === 'Salida') {
      await pool.request()
        .input('Codigo_Producto', sql.VarChar, codigo_producto)
        .input('Cantidad', sql.Int, cantidad)
        .input('Codigo_Ubicacion', sql.VarChar, codigo_ubicacion)
        .input('Id_Usuario', sql.Int, userId)
        .input('Observacion', sql.VarChar, observacion || '')
        .execute('sp_RegistrarSalidaWMS');
    } else if (tipo_movimiento === 'Devolucion') {
      await pool.request()
        .input('Codigo_Producto', sql.VarChar, codigo_producto)
        .input('Cantidad', sql.Int, cantidad)
        .input('Codigo_Ubicacion', sql.VarChar, codigo_ubicacion)
        .input('Id_Usuario', sql.Int, userId)
        .input('Observacion', sql.VarChar, observacion || '')
        .execute('sp_RegistrarDevolucionWMS');
    } else {
      return res.status(400).json({ success: false, message: 'Tipo de movimiento no válido' });
    }

    return res.status(201).json({ success: true, message: 'Movimiento registrado exitosamente' });
  } catch (error: any) {
    console.error('Error al registrar movimiento:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor' });
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const result = await pool.request().query('SELECT * FROM Categoria');
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getLocations = async (_req: Request, res: Response) => {
  try {
    const result = await pool.request().query('SELECT * FROM Ubicacion');
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener ubicaciones:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ success: false, message: 'Nombre es requerido' });
    }
    const result = await pool.request()
      .input('Nombre_Categoria', sql.VarChar, nombre)
      .execute('sp_CrearCategoriaWMS');
    const newId = result.recordset[0]?.Id_Categoria;
    return res.status(201).json({ success: true, message: 'Categoría creada exitosamente', data: { id: newId, nombre } });
  } catch (error: any) {
    console.error('Error al crear categoría:', error);
    const msg = error.message || 'Error interno del servidor';
    return res.status(500).json({ success: false, message: msg });
  }
};
