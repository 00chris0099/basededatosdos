import { Request, Response } from 'express';
import sql from 'mssql';
import { pool } from '../config/database';

export const getAllBrands = async (_req: Request, res: Response) => {
  try {
    const result = await pool.request().execute('sp_ListarMarcasWMS');
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getBrandsByCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = parseInt(req.params.categoryId as string);
    const result = await pool.request()
      .input('Id_Categoria', sql.Int, categoryId)
      .execute('sp_ListarMarcasPorCategoriaWMS');
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener marcas por categoría:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const { nombre, categoriaId } = req.body;
    if (!nombre || !categoriaId) {
      return res.status(400).json({ success: false, message: 'Nombre y categoría son requeridos' });
    }
    const result = await pool.request()
      .input('Nombre_Marca', sql.VarChar, nombre)
      .input('Id_Categoria', sql.Int, categoriaId)
      .execute('sp_CrearMarcaWMS');
    const newId = result.recordset[0]?.Id_Marca;
    return res.status(201).json({ success: true, message: 'Marca creada exitosamente', data: { id: newId, nombre, categoriaId } });
  } catch (error: any) {
    console.error('Error al crear marca:', error);
    const msg = error.message || 'Error interno del servidor';
    return res.status(500).json({ success: false, message: msg });
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await pool.request()
      .input('Id_Marca', sql.Int, id)
      .execute('sp_EliminarMarcaWMS');
    return res.status(200).json({ success: true, message: 'Marca eliminada exitosamente' });
  } catch (error: any) {
    console.error('Error al eliminar marca:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor' });
  }
};
