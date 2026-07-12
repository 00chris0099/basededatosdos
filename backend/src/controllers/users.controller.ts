import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import sql from 'mssql';
import { pool } from '../config/database';
import { RequestWithUser } from '../middleware/auth';

export const getAll = async (req: Request, res: Response) => {
  try {
    const result = await pool.request().query(`
      SELECT u.Id_Usuario, u.Nombre, u.Correo, u.Telefono, r.Nombre_Rol AS role
      FROM Usuario u
      INNER JOIN Rol r ON u.Id_Rol = r.Id_Rol
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
      .input('id', sql.Int, parseInt(id as string))
      .query(`
        SELECT u.Id_Usuario, u.Nombre, u.Correo, u.Telefono, r.Nombre_Rol AS role
        FROM Usuario u
        INNER JOIN Rol r ON u.Id_Rol = r.Id_Rol
        WHERE u.Id_Usuario = @id
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
    const roleResult = await pool.request()
      .input('Nombre_Rol', sql.VarChar, rol)
      .query('SELECT Id_Rol FROM Rol WHERE Nombre_Rol = @Nombre_Rol');
    const roleId = roleResult.recordset[0]?.Id_Rol;
    if (!roleId) {
      return res.status(400).json({ success: false, message: 'Rol no válido' });
    }
    await pool.request()
      .input('Nombre', sql.VarChar, nombre)
      .input('Correo', sql.VarChar, correo)
      .input('Telefono', sql.VarChar, telefono || '')
      .input('Contrasena', sql.VarChar, hashedPassword)
      .input('Id_Rol', sql.Int, roleId)
      .query(`
        INSERT INTO Usuario (Nombre, Correo, Telefono, Contrasena, Id_Rol)
        VALUES (@Nombre, @Correo, @Telefono, @Contrasena, @Id_Rol)
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
    let roleId: number | undefined;
    if (rol) {
      const roleResult = await pool.request()
        .input('Nombre_Rol', sql.VarChar, rol)
        .query('SELECT Id_Rol FROM Rol WHERE Nombre_Rol = @Nombre_Rol');
      roleId = roleResult.recordset[0]?.Id_Rol;
    }
    await pool.request()
      .input('id', sql.Int, parseInt(id as string))
      .input('Nombre', sql.VarChar, nombre)
      .input('Correo', sql.VarChar, correo)
      .input('Telefono', sql.VarChar, telefono || '')
      .input('Id_Rol', sql.Int, roleId || 0)
      .query(`
        UPDATE Usuario
        SET Nombre = @Nombre, Correo = @Correo, Telefono = @Telefono,
            Id_Rol = CASE WHEN @Id_Rol > 0 THEN @Id_Rol ELSE Id_Rol END
        WHERE Id_Usuario = @id
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
      .input('id', sql.Int, parseInt(id as string))
      .query('DELETE FROM Usuario WHERE Id_Usuario = @id');
    return res.status(200).json({ success: true, message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
