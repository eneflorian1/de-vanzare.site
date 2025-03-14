const fs = require('fs');
const path = require('path');

// Calea către fișierul .env
const envPath = path.join(__dirname, '..', '.env');

// Citește conținutul fișierului .env
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Fișierul .env a fost citit cu succes.');
} catch (error) {
  console.error('Eroare la citirea fișierului .env:', error);
  process.exit(1);
}

// Verifică dacă DATABASE_URL există în fișier
const dbUrlRegex = /DATABASE_URL=["'](.+)["']/;
const match = envContent.match(dbUrlRegex);

if (match) {
  console.log('DATABASE_URL găsit în fișierul .env:', match[1]);
  
  // Setează variabila de mediu pentru procesul curent
  process.env.DATABASE_URL = match[1];
  console.log('Variabila de mediu DATABASE_URL a fost setată pentru procesul curent.');
  
  // Afișează instrucțiuni pentru a seta variabila de mediu permanent
  console.log('\nPentru a seta variabila de mediu permanent, rulați următoarea comandă:');
  console.log(`export DATABASE_URL="${match[1]}"`);
  console.log('\nSau adăugați această linie în fișierul ~/.bashrc sau ~/.profile:');
  console.log(`export DATABASE_URL="${match[1]}"`);
} else {
  console.error('DATABASE_URL nu a fost găsit în fișierul .env.');
  process.exit(1);
}

// Verifică dacă variabila de mediu a fost setată corect
console.log('\nVerificare variabilă de mediu:');
console.log('DATABASE_URL din process.env:', process.env.DATABASE_URL); 