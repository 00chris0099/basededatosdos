const sql = require('mssql/msnodesqlv8');

const config = {
  server: 'localhost\\SQLEXPRESS',
  database: 'master',
  options: {
    trustedConnection: true
  }
};

async function test() {
  console.log('Intentando conectar con msnodesqlv8...');
  try {
    const pool = await sql.connect(config);
    console.log('¡Conectado con éxito usando msnodesqlv8!');
    const result = await pool.request().query('SELECT name FROM sys.databases');
    console.log('Bases de datos:', result.recordset.map(r => r.name));
    await pool.close();
  } catch (err) {
    console.error('Error de conexión detallado:', err);
    if (err.originalError) {
      console.error('Original Error:', err.originalError);
      console.dir(err.originalError, { depth: null });
    } else {
      console.log('Error keys:', Object.keys(err));
      console.log('Stringified:', JSON.stringify(err));
    }
  }
}

test();
