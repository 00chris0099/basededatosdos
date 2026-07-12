const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=master;Trusted_Connection=Yes;Driver={ODBC Driver 18 for SQL Server};TrustServerCertificate=Yes;";

console.log("Intentando conectar nativamente con msnodesqlv8...");
sql.query(connectionString, "SELECT name FROM sys.databases", (err, rows) => {
  if (err) {
    console.error("Error nativo:");
    console.error(err);
  } else {
    console.log("¡Conexión nativa exitosa!");
    console.log("Bases de datos:", rows.map(r => r.name));
  }
});
