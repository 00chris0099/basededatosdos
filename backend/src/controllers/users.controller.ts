import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import sql from 'mssql';
import { pool } from '../config/database';
import { RequestWithUser } from '../middleware/auth';

export const getAll = async (req: Request, res: Response) => {
  try {
    const result = await pool.request().query(`
      SELECT * FROM vw_Usuarios
    `);
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`
        SELECT u.id_usuario, u.Nombre, u.Correo, u.Telefono, u.Estado,
               r.Nombre_Rol AS role
        FROM Usuario u
        INNER JOIN Rol u.Rol = r.id_rol
        WHERE u.id_usuario = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    return res.status(200).json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { nombre, correo, telefono, password, rol } = req.body;

    if (!nombre || !correo || !password || !rol) {
      return res.status(400).json({ success: false, message: 'Nombre, correo, contraseña y rol son requeridos' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.request()
      .input('Nombre', sql.VarChar, nombre)
      .input('Correo', sql.VarChar, correo)
      .input('Telefono', sql.VarChar, telefono || '')
      .input('Contrasena', sql.VarChar, hashedPassword)
      .input('Rol', sql.Int, rol)
      .query(`
        INSERT INTO Usuario (Nombre, Correo, Telefono, Contrasena, Rol, Estado)
        VALUES (@Nombre, @Correo, @Telefono, @Contrasena, @Rol, 1)
      `);

    return res.status(201).json({ success: true, message: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, correo, telefono, rol } = req.body;

    await pool.request()
      .input('id', sql.Int, parseInt(id))
      .input('Nombre', sql.VarChar, nombre)
      .input('Correo', sql.VarChar, correo)
      .input('Telefono', sql.VarChar, telefono || '')
      .input('Rol', sql.Int, rol)
      .query(`
        UPDATE Usuario
        SET Nombre = @Nombre, Correo = @Correo, Telefono = @Telefono, Rol = @Rol
        WHERE id_usuario = @id
      `);

    return res.status(200).json({ success: true, message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const deactivate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`
        UPDATE Usuario SET Estado = 0 WHERE id_usuario = @id
      `);

    return res.status(200).json({ success: true, message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
