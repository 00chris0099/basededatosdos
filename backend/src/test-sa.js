const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'Password123!',
  server: 'localhost',
  database: 'master',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function test() {
  console.log('Intentando conectar con sa / Password123!...');
  try {
    const pool = await sql.connect(config);
    console.log('¡Conectado con éxito con sa!');
    const result = await pool.request().query('SELECT name FROM sys.databases');
    console.log('Bases de datos:', result.recordset.map(r => r.name));
    await pool.close();
  } catch (err) {
    console.error('Error de conexión:', err.message);
  }
}

test();
