import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: sql.config = {
  server: process.env.DB_SERVER || 'sqlserver',
  port: parseInt(process.env.DB_PORT || '1433'),
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'Mineria99*',
  database: process.env.DB_DATABASE || 'BD_WMS_ECOMMERCE',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    min: 0,
    max: 10,
  },
};

export const pool = new sql.ConnectionPool(dbConfig);

pool.connect()
  .then(() => console.log('Conectado a SQL Server'))
  .catch((err) => console.error('Error de conexión a SQL Server:', err));

export default pool;
