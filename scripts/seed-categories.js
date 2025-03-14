// scripts/seed-categories.js
const { PrismaClient } = require('@prisma/client');
// Creează un client Prisma cu configurare explicită
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://xecpyncm_root:12wq3er412wq3er4@localhost:3306/xecpyncm_devanzare"
    }
  }
});
const { categoriesStructure } = require('./categories');

async function main() {
  console.log('Starting category seeding...');
  
  try {
    // Check if there are listings in the database
    const listingsCount = await prisma.listing.count();
    
    if (listingsCount > 0) {
      console.log(`There are ${listingsCount} listings in the database. Cannot delete existing categories.`);
      console.log('We will add new categories only if they don\'t exist yet.');
      
      // For each category in our structure, check if it exists and create it if not
      for (const [index, category] of categoriesStructure.entries()) {
        // Check if the main category exists
        let mainCategory = await prisma.category.findFirst({
          where: { slug: category.slug }
        });
        
        // If it doesn't exist, create it
        if (!mainCategory) {
          mainCategory = await prisma.category.create({
            data: {
              name: category.name,
              slug: category.slug,
              description: `Anunțuri din categoria ${category.name}`,
              iconName: category.iconName || null,
              order: index + 1,
              isActive: true
            }
          });
          console.log(`Created main category: ${category.name} (ID: ${mainCategory.id})`);
        } else {
          console.log(`Main category ${category.name} already exists. Skipping.`);
        }
        
        // For each subcategory, check if it exists and create it if not
        if (category.subcategories && category.subcategories.length > 0) {
          for (const [subIndex, subcat] of category.subcategories.entries()) {
            // Check if the subcategory exists
            const existingSubcategory = await prisma.category.findFirst({
              where: { slug: subcat.slug }
            });
            
            // If it doesn't exist, create it
            if (!existingSubcategory) {
              const subcategory = await prisma.category.create({
                data: {
                  name: subcat.name,
                  slug: subcat.slug,
                  parentId: mainCategory.id,
                  description: `Anunțuri din subcategoria ${subcat.name}`,
                  order: subIndex + 1,
                  isActive: true
                }
              });
              console.log(`  - Created subcategory: ${subcat.name} (ID: ${subcategory.id})`);
            } else {
              console.log(`  - Subcategory ${subcat.name} already exists. Skipping.`);
            }
          }
        }
      }
    } else {
      // No listings in the database, safe to delete all categories and start fresh
      console.log('No listings found in the database. Proceeding with removing existing categories...');
      
      // Delete in reverse order (children first, then parents)
      await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS=0;`;
      await prisma.category.deleteMany({
        where: {
          NOT: {
            parentId: null
          }
        }
      });
      
      await prisma.category.deleteMany({
        where: {
          parentId: null
        }
      });
      await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS=1;`;
      
      console.log('Cleared existing categories');
      
      // Now seed the categories
      for (const [index, category] of categoriesStructure.entries()) {
        // Create main category
        const mainCategory = await prisma.category.create({
          data: {
            name: category.name,
            slug: category.slug,
            description: `Anunțuri din categoria ${category.name}`,
            iconName: category.iconName || null,
            order: index + 1,
            isActive: true
          }
        });
        
        console.log(`Created main category: ${category.name} (ID: ${mainCategory.id})`);
        
        // Create subcategories
        if (category.subcategories && category.subcategories.length > 0) {
          for (const [subIndex, subcat] of category.subcategories.entries()) {
            const subcategory = await prisma.category.create({
              data: {
                name: subcat.name,
                slug: subcat.slug,
                parentId: mainCategory.id,
                description: `Anunțuri din subcategoria ${subcat.name}`,
                order: subIndex + 1,
                isActive: true
              }
            });
            
            console.log(`  - Created subcategory: ${subcat.name} (ID: ${subcategory.id})`);
          }
        }
      }
    }
    
    console.log('Category seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
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
