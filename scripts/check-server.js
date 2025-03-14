/**
 * Script pentru verificarea stării serverului și a serviciilor necesare
 * Rulați acest script pentru a verifica dacă toate serviciile necesare sunt disponibile
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mysql = require('mysql2');
const dotenv = require('dotenv');

// Încărcăm variabilele de mediu
dotenv.config();

console.log('='.repeat(50));
console.log('VERIFICARE SERVER DE-VANZARE.SITE');
console.log('='.repeat(50));

// Funcție pentru a verifica dacă un program este instalat
function checkCommand(command, name) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    console.log(`✅ ${name} este instalat`);
    return true;
  } catch (error) {
    console.log(`❌ ${name} nu este instalat sau nu este disponibil în PATH`);
    return false;
  }
}

// Verificăm Node.js
const nodeVersion = process.version;
console.log(`✅ Node.js este instalat (versiunea ${nodeVersion})`);

// Verificăm npm
checkCommand('npm', 'npm');

// Verificăm directoarele importante
const dirs = [
  { path: path.join(__dirname, '..', 'public'), name: 'public' },
  { path: path.join(__dirname, '..', 'public', 'uploads'), name: 'uploads' },
  { path: path.join(__dirname, '..', '.next'), name: '.next' }
];

console.log('\nVerificarea directoarelor:');
dirs.forEach(dir => {
  if (fs.existsSync(dir.path)) {
    console.log(`✅ Directorul ${dir.name} există`);
    
    // Verificăm permisiunile pentru directorul uploads
    if (dir.name === 'uploads') {
      try {
        const stats = fs.statSync(dir.path);
        const permissions = stats.mode & 0o777;
        console.log(`   Permisiuni: ${permissions.toString(8)}`);
        
        if (permissions < 0o755) {
          console.log(`⚠️  Avertisment: Directorul uploads are permisiuni insuficiente. Recomandat: 755`);
        }
      } catch (error) {
        console.log(`❌ Eroare la verificarea permisiunilor: ${error.message}`);
      }
    }
  } else {
    console.log(`❌ Directorul ${dir.name} nu există`);
  }
});

// Verificăm fișierele importante
const files = [
  { path: path.join(__dirname, '..', '.env'), name: '.env' },
  { path: path.join(__dirname, '..', 'server.js'), name: 'server.js' },
  { path: path.join(__dirname, '..', '.htaccess'), name: '.htaccess' }
];

console.log('\nVerificarea fișierelor:');
files.forEach(file => {
  if (fs.existsSync(file.path)) {
    console.log(`✅ Fișierul ${file.name} există`);
  } else {
    console.log(`❌ Fișierul ${file.name} nu există`);
  }
});

// Verificăm conexiunea la baza de date
console.log('\nVerificarea conexiunii la baza de date:');
if (process.env.DATABASE_URL) {
  // Extragem informațiile de conectare din DATABASE_URL
  let dbConfig = {};
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    dbConfig = {
      host: dbUrl.hostname,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.substring(1),
      port: dbUrl.port || 3306
    };
    
    const connection = mysql.createConnection(dbConfig);
    
    connection.connect((err) => {
      if (err) {
        console.log(`❌ Nu s-a putut conecta la baza de date: ${err.message}`);
      } else {
        console.log('✅ Conexiunea la baza de date a fost stabilită cu succes');
        
        // Verificăm dacă tabelele există
        connection.query('SHOW TABLES', (err, results) => {
          if (err) {
            console.log(`❌ Eroare la verificarea tabelelor: ${err.message}`);
          } else {
            console.log(`✅ Baza de date conține ${results.length} tabele`);
          }
          connection.end();
        });
      }
    });
  } catch (error) {
    console.log(`❌ Eroare la parsarea DATABASE_URL: ${error.message}`);
  }
} else {
  console.log('❌ Variabila de mediu DATABASE_URL nu este definită');
}

// Verificăm portul
console.log('\nVerificarea portului:');
const port = process.env.PORT || 3000;
console.log(`ℹ️ Aplicația va rula pe portul ${port}`);

// Verificăm variabilele de mediu importante
console.log('\nVerificarea variabilelor de mediu:');
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName} este definit`);
  } else {
    console.log(`❌ ${varName} nu este definit`);
  }
});

console.log('\nVerificarea completă. Verificați erorile de mai sus, dacă există.');
console.log('='.repeat(50)); 