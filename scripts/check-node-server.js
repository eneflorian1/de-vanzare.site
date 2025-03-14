const http = require('http');

// Funcție pentru a verifica dacă serverul Node.js rulează
function checkNodeServer(host = '127.0.0.1', port = 3000, path = '/health') {
  return new Promise((resolve, reject) => {
    console.log(`Verificare server Node.js la http://${host}:${port}${path}...`);
    
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000 // 5 secunde timeout
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            console.log('Server Node.js rulează corect!');
            console.log('Răspuns:', response);
            resolve(response);
          } catch (error) {
            console.log('Server Node.js rulează, dar răspunsul nu este valid JSON.');
            console.log('Răspuns:', data);
            resolve({ status: 'running', response: data });
          }
        } else {
          console.error(`Server Node.js a răspuns cu statusul ${res.statusCode}`);
          console.error('Răspuns:', data);
          reject(new Error(`Status code: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Eroare la conectarea la serverul Node.js:', error.message);
      reject(error);
    });
    
    req.on('timeout', () => {
      console.error('Timeout la conectarea la serverul Node.js');
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

// Verifică dacă serverul rulează
checkNodeServer()
  .then(response => {
    console.log('Verificare completă cu succes!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Verificare eșuată:', error.message);
    console.log('\nSugestii pentru rezolvarea problemei:');
    console.log('1. Asigură-te că serverul Node.js rulează: node server.js');
    console.log('2. Verifică dacă portul 3000 este disponibil și nu este blocat de firewall');
    console.log('3. Verifică jurnalele de erori pentru a identifica problema');
    console.log('4. Asigură-te că modulul mod_proxy este activat în Apache');
    console.log('5. Verifică configurația .htaccess pentru a te asigura că redirecționarea este corectă');
    process.exit(1);
  }); 