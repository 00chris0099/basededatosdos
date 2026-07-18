import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sql from 'mssql';
import { pool } from '../config/database';
import { JwtPayload } from '../types';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Correo y contraseña son requeridos' });
    }
    const result = await pool.request()
      .input('Correo', sql.VarChar, email)
      .query(`
        SELECT u.Id_Usuario, u.Nombre, u.Contrasena, u.Correo, u.Telefono, r.Nombre_Rol
        FROM Usuario u
        INNER JOIN Rol r ON u.Id_Rol = r.Id_Rol
        WHERE u.Correo = @Correo
      `);

    if (result.recordset.length === 0) {
      return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
    }

    const user = result.recordset[0];

    let validPassword = false;
    if (user.Contrasena.startsWith('$2a$') || user.Contrasena.startsWith('$2b$')) {
      validPassword = await bcrypt.compare(password, user.Contrasena);
    } else {
      validPassword = password === user.Contrasena;
    }

    if (!validPassword) {
      return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
    }

    const payload: JwtPayload = { userId: user.Id_Usuario, email: user.Correo, role: user.Nombre_Rol };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' });

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.Id_Usuario,
          name: user.Nombre,
          email: user.Correo,
          role: user.Nombre_Rol,
          phone: user.Telefono,
        },
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token no proporcionado' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const result = await pool.request()
      .input('Id', sql.Int, decoded.userId)
      .query(`
        SELECT u.Id_Usuario, u.Nombre, u.Correo, u.Telefono, r.Nombre_Rol
        FROM Usuario u
        INNER JOIN Rol r ON u.Id_Rol = r.Id_Rol
        WHERE u.Id_Usuario = @Id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const user = result.recordset[0];
    return res.status(200).json({
      success: true,
      data: {
        id: user.Id_Usuario,
        name: user.Nombre,
        email: user.Correo,
        role: user.Nombre_Rol,
        phone: user.Telefono,
      },
    });
  } catch (error) {
    console.error('Error en getMe:', error);
    return res.status(500).json({ success: false, message: 'Token inválido' });
  }
};
