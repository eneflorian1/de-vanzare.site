const fs = require('fs');
const path = require('path');

// Definim calea către directorul de încărcări
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

// Verificăm dacă directorul există
if (!fs.existsSync(uploadsDir)) {
  console.log(`Directorul de încărcări nu există. Se creează: ${uploadsDir}`);
  
  try {
    // Creăm directorul recursiv (inclusiv directoarele părinte dacă nu există)
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Directorul de încărcări a fost creat cu succes.');
    
    // Setăm permisiunile corecte (755 - proprietarul poate citi/scrie/executa, alții pot citi/executa)
    fs.chmodSync(uploadsDir, 0o755);
    console.log('Permisiunile directorului au fost setate la 755.');
  } catch (error) {
    console.error('Eroare la crearea directorului de încărcări:', error);
    process.exit(1);
  }
} else {
  console.log(`Directorul de încărcări există deja: ${uploadsDir}`);
  
  // Verificăm permisiunile
  try {
    const stats = fs.statSync(uploadsDir);
    const currentPermissions = stats.mode & 0o777; // Extragem permisiunile
    
    if (currentPermissions !== 0o755) {
      console.log(`Permisiunile curente sunt ${currentPermissions.toString(8)}. Se actualizează la 755.`);
      fs.chmodSync(uploadsDir, 0o755);
      console.log('Permisiunile directorului au fost actualizate la 755.');
    } else {
      console.log('Permisiunile directorului sunt deja setate corect (755).');
    }
  } catch (error) {
    console.error('Eroare la verificarea/actualizarea permisiunilor:', error);
  }
}

console.log('Verificarea directorului de încărcări a fost finalizată.'); 