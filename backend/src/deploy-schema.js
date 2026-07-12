const sql = require('msnodesqlv8');
const fs = require('fs');
const path = require('path');

const connectionString = "server=.\\SQLEXPRESS;Database=master;Trusted_Connection=Yes;Driver={ODBC Driver 18 for SQL Server};TrustServerCertificate=Yes;";
const targetDb = "BD_WMS_ECOMMERCE";

function runQuery(connStr, query) {
  return new Promise((resolve, reject) => {
    sql.query(connStr, query, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function deploy() {
  try {
    console.log("1. Re-creando la base de datos para una instalación limpia...");
    await runQuery(connectionString, `
      IF EXISTS (SELECT name FROM sys.databases WHERE name = '${targetDb}')
      BEGIN
        ALTER DATABASE ${targetDb} SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
        DROP DATABASE ${targetDb};
      END
    `);
    await runQuery(connectionString, `CREATE DATABASE ${targetDb}`);
    console.log(`Base de datos ${targetDb} creada.`);

    const targetConnStr = connectionString.replace("Database=master", `Database=${targetDb}`);

    // Read the SQL script
    const sqlPath = path.join(__dirname, "..", "..", "T-SQL PROYECTO WMS.sql");
    let sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Clean up CREATE DATABASE / USE statements from script content
    sqlContent = sqlContent.replace(/^\s*CREATE\s+DATABASE\s+PY_BD_WMS_ECOMMERCE\s*;?/gim, "");
    sqlContent = sqlContent.replace(/^\s*USE\s+BD_WMS_ECOMMERCE\s*;?/gim, "");

    const lines = sqlContent.split(/\r?\n/);
    let batches = [];
    let currentBatch = [];
    let insideBlock = false; // 'routine' or 'view'
    let nestingLevel = 0;
    let hasBegun = false;

    for (let line of lines) {
      const trimmed = line.trim();
      const upper = trimmed.toUpperCase();

      if (!insideBlock) {
        const isRoutine = 
          upper.startsWith("CREATE PROCEDURE") ||
          upper.startsWith("CREATE OR ALTER PROCEDURE") ||
          upper.startsWith("CREATE FUNCTION") ||
          upper.startsWith("CREATE OR ALTER FUNCTION") ||
          upper.startsWith("CREATE TRIGGER") ||
          upper.startsWith("CREATE OR ALTER TRIGGER");
        
        const isView = 
          upper.startsWith("CREATE VIEW") ||
          upper.startsWith("CREATE OR ALTER VIEW");

        if (isRoutine) {
          if (currentBatch.length > 0) {
            batches.push(currentBatch.join("\n"));
            currentBatch = [];
          }
          // Check if this is an inline table-valued function which has no BEGIN/END
          // Lookahead on the next few lines, or we can check later. Actually, we can check if it contains RETURNS TABLE
          // as we parse the routine. But for now, we can check if the definition line or nearby lines contain RETURNS TABLE.
          // Since we read line-by-line, we can set state to 'routine' and then transition to 'table-function' if we see RETURNS TABLE.
          insideBlock = 'routine';
          nestingLevel = 0;
          hasBegun = false;
        } else if (isView) {
          if (currentBatch.length > 0) {
            batches.push(currentBatch.join("\n"));
            currentBatch = [];
          }
          insideBlock = 'view';
        }
      }

      currentBatch.push(line);

      // Check for block end
      if (insideBlock === 'routine') {
        if (upper.includes("RETURNS TABLE")) {
          insideBlock = 'table-function';
        } else if (!trimmed.startsWith("--")) {
          const codeOnly = trimmed.split("--")[0].toUpperCase();
          const beginCount = (codeOnly.match(/\bBEGIN\b(?!\s+(TRANSACTION|TRAN)\b)/g) || []).length;
          const endCount = (codeOnly.match(/\bEND\b/g) || []).length;

          if (beginCount > 0) {
            hasBegun = true;
            nestingLevel += beginCount;
          }
          if (endCount > 0) {
            nestingLevel -= endCount;
          }

          if (hasBegun && nestingLevel <= 0) {
            batches.push(currentBatch.join("\n"));
            currentBatch = [];
            insideBlock = false;
          }
        }
      } else if (insideBlock === 'table-function') {
        if (trimmed === ");" || trimmed.endsWith(");")) {
          batches.push(currentBatch.join("\n"));
          currentBatch = [];
          insideBlock = false;
        }
      } else if (insideBlock === 'view') {
        // A view ends with a semicolon or when the next block is a known query
        if (trimmed.endsWith(";")) {
          batches.push(currentBatch.join("\n"));
          currentBatch = [];
          insideBlock = false;
        }
      }
    }
    if (currentBatch.length > 0) {
      batches.push(currentBatch.join("\n"));
    }

    console.log(`2. Ejecutando ${batches.length} lotes de comandos SQL...`);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i].trim();
      if (!batch) continue;

      try {
        await runQuery(targetConnStr, batch);
        successCount++;
      } catch (err) {
        failCount++;
        console.warn(`\n[Lote ${i + 1} FALLIDO] Error:`, err.message);
        const snippet = batch.substring(0, 300) + "...";
        console.warn("Código del lote fallido:\n", snippet);
      }
    }

    console.log(`\nDespliegue finalizado. Lotes exitosos: ${successCount}, Lotes fallidos: ${failCount}`);
  } catch (err) {
    console.error("Fallo general en la migración:", err);
  }
}

deploy();
