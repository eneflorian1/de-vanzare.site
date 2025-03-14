/**
 * Script pentru generarea unui secret sigur pentru NextAuth
 * Rulați acest script pentru a genera un secret aleatoriu pentru NEXTAUTH_SECRET
 */

const crypto = require('crypto');

// Generează un string aleatoriu de 32 de caractere (256 biți) în format base64
function generateSecureSecret() {
  return crypto.randomBytes(32).toString('base64');
}

// Generează un secret sigur
const secret = generateSecureSecret();

console.log('='.repeat(50));
console.log('GENERATOR DE SECRET PENTRU NEXTAUTH');
console.log('='.repeat(50));
console.log('\nSecret generat:');
console.log('\n' + secret + '\n');
console.log('Adăugați acest secret în fișierul .env:');
console.log('\nNEXTAUTH_SECRET="' + secret + '"\n');
console.log('='.repeat(50)); 