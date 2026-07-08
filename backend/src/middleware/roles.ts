import { Response, NextFunction } from 'express';
import { RequestWithUser } from './auth';

export const canManage = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user || (user.role !== 'Administrador' && user.role !== 'Dueño')) {
    return res.status(403).json({ success: false, message: 'Acceso restringido' });
  }
  next();
};

export const canSupervise = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user || (user.role !== 'Administrador' && user.role !== 'Dueño' && user.role !== 'Supervisor')) {
    return res.status(403).json({ success: false, message: 'Acceso restringido' });
  }
  next();
};
