import sql from 'mssql/msnodesqlv8';

const config = {
  connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=.\\SQLEXPRESS;Database=master;Trusted_Connection=yes;'
};

async function test() {
  console.log('Intentando conectar con msnodesqlv8...');
  try {
    const pool = await sql.connect(config);
    console.log('¡Conectado con éxito usando msnodesqlv8!');
    const result = await pool.request().query('SELECT name FROM sys.databases');
    console.log('Bases de datos:', result.recordset.map(r => r.name));
    await pool.close();
  } catch (err: any) {
    console.error('Error de conexión:', err.message);
  }
}

test();
