import { Request, Response } from 'express';

interface Incident {
  orderId: string;
  msg: string;
  user: string;
  date: string;
}

const incidents: Incident[] = [];

export const getAll = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ success: true, data: incidents });
  } catch (error) {
    console.error('Error al obtener incidencias:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { orderId, message, user } = req.body;
    if (!orderId || !message) {
      return res.status(400).json({ success: false, message: 'El ID del pedido y el mensaje son requeridos' });
    }
    const incident: Incident = {
      orderId,
      msg: message,
      user: user || 'Sistema',
      date: new Date().toLocaleString('es-PE'),
    };
    incidents.unshift(incident);
    return res.status(201).json({ success: true, message: 'Incidencia registrada' });
  } catch (error) {
    console.error('Error al crear incidencia:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
