import sql from 'mssql/msnodesqlv8';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DB_CONNECTION_STRING || 'Driver={ODBC Driver 18 for SQL Server};Server=.\\SQLEXPRESS;Database=BD_WMS_ECOMMERCE;Trusted_Connection=yes;TrustServerCertificate=yes;';

export const pool = new sql.ConnectionPool({
  connectionString
} as any);

pool.connect()
  .then(() => console.log('Conectado a SQL Server (Integrated Security)'))
  .catch((err) => console.error('Error de conexión a SQL Server:', err));

