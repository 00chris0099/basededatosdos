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
        SELECT u.*, r.Nombre_Rol
        FROM Usuario u
        INNER JOIN Rol u.Rol = r.id_rol
        WHERE u.Correo = @Correo AND u.Estado = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
    }

    const user = result.recordset[0];
    const validPassword = await bcrypt.compare(password, user.Contrasena);

    if (!validPassword) {
      return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
    }

    const payload: JwtPayload = {
      userId: user.id_usuario,
      email: user.Correo,
      role: user.Nombre_Rol,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' });

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id_usuario,
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
