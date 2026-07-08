export function money(n: number): string {
  return (
    'S/ ' +
    new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2 }).format(n)
  );
}
