import { colors } from '../theme/colors';

const greenSet = ['Entregado', 'En Stock', 'Entrada', 'Disponible', 'Finalizado'];
const redSet = ['Cancelado', 'Agotado', 'Alta', 'Salida', 'Stock Crítico'];
const amberSet = [
  'Bajo Stock',
  'Media',
  'Ajuste',
  'Packing',
  'Empacado',
  'Stock Bajo',
];
const blueSet = ['Pendiente', 'Listo para Despacho', 'Baja'];
const purpleSet = ['Picking', 'En Ruta', 'En Proceso'];

export function getBadgeColor(status: string): string {
  if (greenSet.includes(status)) return colors.green;
  if (redSet.includes(status)) return colors.red;
  if (amberSet.includes(status)) return colors.amber;
  if (blueSet.includes(status)) return colors.blue;
  if (purpleSet.includes(status)) return colors.purple;
  return colors.blue;
}
