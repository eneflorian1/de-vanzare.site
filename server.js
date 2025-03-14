const express = require('express');
// Eliminăm încărcarea dotenv
// require('dotenv').config();

const next = require('next');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

// Determină dacă aplicația rulează în producție sau dezvoltare
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Portul pe care va rula serverul
// În cPanel, de obicei trebuie să folosești portul specificat în variabila de mediu PORT
const port = parseInt(process.env.PORT || '3000', 10);

// Afișează informații despre mediul de rulare
console.log('='.repeat(50));
console.log('INFORMAȚII DESPRE MEDIUL DE RULARE:');
console.log('Mediu:', process.env.NODE_ENV || 'development');
console.log('Port:', port);
console.log('Directorul curent:', __dirname);
console.log('='.repeat(50));

// Directorul pentru fișierele statice și încărcări
const staticDir = path.join(__dirname, 'public');
const uploadsDir = path.join(staticDir, 'uploads');

// Asigură-te că directorul pentru încărcări există
if (!fs.existsSync(uploadsDir)) {
  console.log(`Directorul de încărcări nu există. Se creează: ${uploadsDir}`);
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Directorul de încărcări a fost creat cu succes.');
    
    // Setăm permisiunile corecte (755 - proprietarul poate citi/scrie/executa, alții pot citi/executa)
    try {
      fs.chmodSync(uploadsDir, 0o755);
      console.log('Permisiunile directorului au fost setate la 755.');
    } catch (chmodError) {
      console.error('Eroare la setarea permisiunilor (ignorată):', chmodError.message);
    }
  } catch (error) {
    console.error('Eroare la crearea directorului de încărcări:', error);
  }
}

// Funcție pentru a afișa informații despre server
function printServerInfo() {
  const interfaces = require('os').networkInterfaces();
  const addresses = [];
  
  for (const k in interfaces) {
    for (const k2 in interfaces[k]) {
      const address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address);
      }
    }
  }
  
  console.log('='.repeat(50));
  console.log(`Aplicația de-vanzare.site rulează în modul ${dev ? 'DEZVOLTARE' : 'PRODUCȚIE'}`);
  console.log(`Server local: http://localhost:${port}`);
  if (addresses.length > 0) {
    console.log('Adrese IP disponibile:');
    addresses.forEach(addr => console.log(`  http://${addr}:${port}`));
  }
  console.log('='.repeat(50));
}

// Variabilă pentru a ține evidența serverului
let serverInstance = null;

// Gestionarea procesului pentru a asigura o închidere corectă
process.on('SIGTERM', () => {
  console.log('SIGTERM primit. Închidere server...');
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('Server închis cu succes.');
      process.exit(0);
    });
    
    // Forțează închiderea după 10 secunde dacă serverul nu se închide normal
    setTimeout(() => {
      console.log('Forțare închidere server după timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT primit. Închidere server...');
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('Server închis cu succes.');
      process.exit(0);
    });
    
    // Forțează închiderea după 10 secunde dacă serverul nu se închide normal
    setTimeout(() => {
      console.log('Forțare închidere server după timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
});

// Gestionarea erorilor neașteptate
process.on('uncaughtException', (err) => {
  console.error('Eroare neașteptată:', err);
  // Nu oprim serverul pentru erori neașteptate în producție
  if (dev) {
    if (serverInstance) {
      serverInstance.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  }
});

// Gestionarea promisiunilor respinse negestionate
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promisiune respinsă negestionată:', reason);
  // Nu oprim serverul pentru erori în producție
});

// Pregătim aplicația Next.js
console.log('Se inițializează aplicația Next.js...');
app.prepare()
  .then(() => {
    console.log('Aplicația Next.js a fost inițializată cu succes.');
    const server = express();

    // Middleware pentru a înregistra cererile
    server.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
      });
      next();
    });

    // Middleware pentru a gestiona erorile
    server.use((err, req, res, next) => {
      console.error('Eroare middleware:', err);
      if (!res.headersSent) {
        res.status(500).send('Eroare internă server');
      }
    });

    // Verificare stare server - rută simplă pentru a verifica dacă serverul funcționează
    server.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
      });
    });

    // Rută pentru a afișa informații despre server (doar în dezvoltare)
    if (dev) {
      server.get('/debug', (req, res) => {
        const info = {
          nodeVersion: process.version,
          platform: process.platform,
          env: process.env.NODE_ENV,
          port: port,
          cwd: process.cwd(),
          dirname: __dirname,
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime()
        };
        res.status(200).json(info);
      });
    }

    // Servește fișierele statice din directorul public
    server.use('/public', express.static(staticDir, {
      maxAge: dev ? '0' : '30d'
    }));
    
    // Rută specială pentru încărcări
    server.use('/uploads', express.static(uploadsDir, {
      maxAge: dev ? '0' : '30d'
    }));

    // Gestionează toate celelalte cereri cu Next.js
    server.all('*', (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        return handle(req, res, parsedUrl);
      } catch (error) {
        console.error('Eroare la gestionarea cererii:', error);
        if (!res.headersSent) {
          return res.status(500).send('Eroare internă server');
        }
      }
    });

    // Pornește serverul
    // Ascultăm pe toate interfețele (0.0.0.0) pentru a permite accesul din exterior
    serverInstance = server.listen(port, '0.0.0.0', (err) => {
      if (err) {
        console.error('Eroare la pornirea serverului:', err);
        throw err;
      }
      console.log(`Server pornit pe 0.0.0.0:${port}`);
      printServerInfo();
    });

    // Setăm timeout-ul pentru server
    serverInstance.timeout = 120000; // 2 minute
    
    // Gestionăm erorile serverului
    serverInstance.on('error', (error) => {
      console.error('Eroare server:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Portul ${port} este deja în uz. Încercați un alt port.`);
        process.exit(1);
      }
    });
  })
  .catch(err => {
    console.error('Eroare la inițializarea aplicației Next.js:', err);
    console.error('Detalii eroare:', err.stack);
    process.exit(1);
  });