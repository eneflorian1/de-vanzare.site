import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Creează utilizatorul admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      hashedPassword: await bcrypt.hash('Admin123!', 10),
      firstName: 'Admin',
      lastName: 'System',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true
    }
  });

  console.log('Admin user created:', adminUser);

  // Creăm categoriile principale
  const categories = [
    { name: 'Auto', slug: 'auto', iconName: 'car' },
    { name: 'Imobiliare', slug: 'imobiliare', iconName: 'home' },
    { name: 'Electronice', slug: 'electronice', iconName: 'smartphone' },
    // Adaugă mai multe categorii după necesitate
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
        iconName: category.iconName,
        isActive: true
      }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });