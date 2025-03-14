const { execSync } = require('child_process');
const path = require('path');

console.log('Inițializare bază de date...');

try {
  // Rulează prisma db push pentru a crea tabelele
  console.log('Executare db push...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  // Rulează seed script pentru a popula datele inițiale
  console.log('Populare date inițiale...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
  
  console.log('Baza de date a fost inițializată cu succes!');
} catch (error) {
  console.error('Eroare la inițializarea bazei de date:', error.message);
  process.exit(1);
}