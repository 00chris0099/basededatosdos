import { Request, Response } from 'express';

interface WarehouseConfig {
  sections: string[];
  aisles: string[];
  levels: string[];
  bins: string[];
}

const warehouseConfig: WarehouseConfig = {
  sections: ['A', 'B', 'C', 'D', 'E'],
  aisles: ['1', '2', '3', '4', '5', '6', '7'],
  levels: ['01', '02', '03', '04', '05', '06'],
  bins: ['01', '02', '03', '04'],
};

export const get = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ success: true, data: warehouseConfig });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { type, value } = req.body;
    if (!type || !value) {
      return res.status(400).json({ success: false, message: 'El tipo y el valor son requeridos' });
    }
    if (type === 'section') {
      if (!warehouseConfig.sections.includes(value)) {
        warehouseConfig.sections.push(value);
      }
    } else if (type === 'aisle') {
      if (!warehouseConfig.aisles.includes(value)) {
        warehouseConfig.aisles.push(value);
      }
    } else if (type === 'level') {
      if (!warehouseConfig.levels.includes(value)) {
        warehouseConfig.levels.push(value);
      }
    } else if (type === 'bin') {
      if (!warehouseConfig.bins.includes(value)) {
        warehouseConfig.bins.push(value);
      }
    } else {
      return res.status(400).json({ success: false, message: 'Tipo no válido. Use: section, aisle, level, bin' });
    }
    return res.status(200).json({ success: true, data: warehouseConfig });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
