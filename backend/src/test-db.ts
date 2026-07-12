import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const configs = [
  // Option 1: localhost with default port
  {
    server: 'localhost',
    database: 'master',
    user: 'sa',
    password: 'sa', // try common default password
    options: { encrypt: false, trustServerCertificate: true }
  },
  // Option 2: localhost\SQLEXPRESS with default port
  {
    server: 'localhost\\SQLEXPRESS',
    database: 'master',
    options: { encrypt: false, trustServerCertificate: true }
  },
  // Option 3: localhost without authentication (trusted)
  {
    server: 'localhost',
    database: 'master',
    options: { encrypt: false, trustServerCertificate: true }
  }
];

async function run() {
  for (let i = 0; i < configs.length; i++) {
    console.log(`Intentando conectar con Configuración ${i + 1}...`);
    try {
      const pool = await sql.connect(configs[i]);
      console.log(`¡Conectado exitosamente con Configuración ${i + 1}!`);
      const result = await pool.request().query('SELECT name FROM sys.databases');
      console.log('Bases de datos encontradas:', result.recordset.map(r => r.name));
      await pool.close();
      return;
    } catch (err: any) {
      console.error(`Fallo en Configuración ${i + 1}:`, err.message);
    }
  }
}

run();
