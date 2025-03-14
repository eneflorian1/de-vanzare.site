require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

console.log('Încărcare variabile de mediu din .env...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error('Variabila DATABASE_URL nu este setată în fișierul .env!');
  process.exit(1);
}

try {
  console.log('Rulare script seed-categories.js...');
  execSync('node scripts/seed-categories.js', { stdio: 'inherit' });
  console.log('Script seed-categories.js rulat cu succes!');
} catch (error) {
  console.error('Eroare la rularea scriptului seed-categories.js:', error);
  process.exit(1);
} 