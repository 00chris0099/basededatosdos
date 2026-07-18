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
  connectionTimeout: 15000,
  requestTimeout: 15000,
};

export const pool = new sql.ConnectionPool(dbConfig);

let connected = false;

pool.connect()
  .then(() => {
    connected = true;
    console.log('Conectado a SQL Server - DB:', dbConfig.database, '- Server:', dbConfig.server);
  })
  .catch((err) => {
    console.error('Error de conexion a SQL Server:', err.message);
    console.error('DB_SERVER:', dbConfig.server, 'DB_PORT:', dbConfig.port);
  });

export function isConnected() { return connected; }
export default pool;
