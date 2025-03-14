const { PrismaClient } = require('@prisma/client');

// Afișează variabila de mediu DATABASE_URL
console.log('DATABASE_URL din env:', process.env.DATABASE_URL);

// Creează un client Prisma cu configurare explicită
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://xecpyncm_root:12wq3er412wq3er4@localhost:3306/xecpyncm_devanzare"
    }
  }
});

async function testConnection() {
  try {
    console.log('Testare conexiune la baza de date...');
    
    // Încearcă să execute o interogare simplă
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Conexiune reușită!', result);
    
    // Încearcă să numere categoriile
    const categoriesCount = await prisma.category.count();
    console.log(`Număr de categorii în baza de date: ${categoriesCount}`);
    
    return true;
  } catch (error) {
    console.error('Eroare la conectarea la baza de date:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then(success => {
    console.log('Test finalizat cu', success ? 'succes' : 'eroare');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Eroare neașteptată:', error);
    process.exit(1);
  }); 