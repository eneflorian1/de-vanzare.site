import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { 
  generateValidationToken, 
  generateValidationLink, 
  createListingValidationEmail, 
  sendEmail 
} from '@/lib/email';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Received data:', data);
    console.log('Received data for images:', data.images); // Pentru debugging

    // Verificăm sesiunea pentru a vedea dacă utilizatorul este autentificat
    const session = await getServerSession(authOptions);
    const isAuthenticated = !!session?.user?.email;

    // Verificăm dacă categoria există
    const category = await prisma.category.findUnique({
      where: { id: parseInt(data.categoryId) }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria nu există' },
        { status: 400 }
      );
    }

    // Creează sau găsește utilizatorul
    let user;
    try {
      // Verificăm mai întâi dacă utilizatorul există
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        // Dacă utilizatorul există, doar actualizăm lastLogin
        user = await prisma.user.update({
          where: { email: data.email },
          data: { 
            lastLogin: new Date(),
            updatedAt: new Date()
          }
        });
        console.log('Updated existing user:', user);
      } else {
        // Dacă utilizatorul nu există, îl creăm
        const hashedPassword = await bcrypt.hash('temporary123', 10);
        const now = new Date(); // Creăm o singură dată pentru ambele câmpuri
        
        // Creăm utilizatorul fără relații
        user = await prisma.user.create({
          data: {
            email: data.email,
            phone: data.phone || '',
            hashedPassword: hashedPassword,
            firstName: '',
            lastName: '',
            role: 'USER',
            status: 'ACTIVE',
            createdAt: now,
            updatedAt: now,
            emailVerified: false,
            phoneVerified: false,
            notifyEmail: true,
            notifyPhone: false
          }
        });
        
        // Apoi creăm setările pentru utilizator folosind SQL raw
        await prisma.$executeRaw`
          INSERT INTO usersettings (
            userId, 
            emailNotifications, 
            pushNotifications, 
            newsletterSubscription, 
            language, 
            theme, 
            currencyPreference, 
            createdAt,
            updatedAt
          ) 
          VALUES (
            ${user.id}, 
            true, 
            true, 
            false, 
            'ro', 
            'light', 
            'RON', 
            ${now}, 
            ${now}
          )
        `;
        
        console.log('Created new user with settings:', user.id);
      }
    } catch (error) {
      console.error('Detailed error creating user:', error);
      throw new Error('Eroare la crearea utilizatorului');
    }

    // Creează sau găsește locația
    let location;
    try {
      const now = new Date();
      location = await prisma.location.upsert({
        where: {
          county_city: {
            county: data.county,
            city: data.city
          }
        },
        update: {
          updatedAt: now // Actualizăm data de modificare chiar dacă există deja
        },
        create: {
          county: data.county,
          city: data.city,
          updatedAt: now // Adăugăm câmpul updatedAt care este obligatoriu
        }
      });
    } catch (error) {
      console.error('Error creating location:', error);
      throw new Error('Eroare la crearea locației');
    }

    // Generează slug-ul
    const slug = await generateSlug(data.title);

    // Pregătim datele pentru imagini
    console.log('Processing images data:', JSON.stringify(data.images, null, 2));
    
    const defaultImageUrl = '/images/default-listing.jpg';
    
    // Creează anunțul
    try {
      const now = new Date();
      const listing = await prisma.listing.create({
        data: {
          title: data.title,
          description: data.description,
          price: parseFloat(data.price),
          currency: data.currency,
          condition: data.condition,
          negotiable: data.negotiable,
          status: 'ACTIVE',
          slug: slug,
          categoryId: parseInt(data.categoryId),
          locationId: location.id,
          userId: user.id,
          updatedAt: now
        },
        include: {
          category: true,
          location: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        }
      });

      // Salvăm imaginile în baza de date
      const imagesForListing = data.images && data.images.length > 0
        ? data.images.map((img: any) => {
            console.log('Procesare imagine în backend:', JSON.stringify(img, null, 2));
            
            // Verificăm câmpurile disponibile în obiectul imagine și alegem cel corect
            let imageUrl = img.imageUrl || img.url || defaultImageUrl;
            console.log('URL imagine identificat:', imageUrl);
            
            // Verificăm dacă URL-ul este valid
            if (!imageUrl || imageUrl === '') {
              console.log('URL imagine invalid sau gol, folosim default');
              imageUrl = defaultImageUrl;
            } else if (imageUrl.startsWith('blob:')) {
              console.log('Am detectat un URL blob care nu a fost procesat corect în frontend');
              imageUrl = defaultImageUrl;
            }
            
            // Asigurăm că URL-ul începe cu /
            if (imageUrl !== defaultImageUrl && !imageUrl.startsWith('/')) {
              imageUrl = `/${imageUrl}`;
              console.log('URL imagine corectat:', imageUrl);
            }
            
            return {
              listingId: listing.id,
              imageUrl: imageUrl,
              order: typeof img.order === 'number' ? img.order : 0,
              isPrimary: Boolean(img.isPrimary !== undefined ? img.isPrimary : img.order === 0),
              createdAt: now,
              updatedAt: now
            };
          })
        : [{
            listingId: listing.id,
            imageUrl: defaultImageUrl,
            order: 0,
            isPrimary: true,
            createdAt: now,
            updatedAt: now
          }];

      console.log('Imagini pregătite pentru salvare:', JSON.stringify(imagesForListing, null, 2));

      // Salvăm imaginile folosind SQL raw pentru a evita problemele cu Prisma
      for (const imageData of imagesForListing) {
        await prisma.$executeRaw`
          INSERT INTO image (listingId, imageUrl, \`order\`, isPrimary, createdAt, updatedAt)
          VALUES (
            ${imageData.listingId},
            ${imageData.imageUrl},
            ${imageData.order},
            ${imageData.isPrimary},
            ${imageData.createdAt},
            ${imageData.updatedAt}
          )
        `;
      }

      console.log('Created listing:', JSON.stringify(listing, null, 2));

      // Creează validarea pentru anunț
      const validationToken = crypto.randomBytes(32).toString('hex');
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 24);

      try {
        await prisma.$executeRaw`
          INSERT INTO listingvalidation (listingId, token, createdAt, expiresAt, validated)
          VALUES (${listing.id}, ${validationToken}, NOW(), ${expirationDate}, false)
        `;
      } catch (validationError) {
        console.error('Error creating listing validation:', validationError);
      }

      // Generăm link-ul de validare
      const validationLink = generateValidationLink(listing.id, validationToken);
      
      // Verificăm dacă utilizatorul este autentificat
      // Dacă este autentificat, nu mai trimitem email
      if (!isAuthenticated) {
        // Creăm emailul de validare doar dacă utilizatorul nu este autentificat
        const mailOptions = createListingValidationEmail(
          data.email,
          data.title,
          validationLink
        );
        
        // Trimitem emailul
        const emailResult = await sendEmail(mailOptions);
        
        if (!emailResult.success) {
          console.error('Failed to send validation email:', emailResult.error);
        }
      } else {
        console.log('User is authenticated, skipping validation email');
        
        // Pentru utilizatorii autentificați, marcăm anunțul ca validat automat
        try {
          await prisma.listingvalidation.update({
            where: { token: validationToken },
            data: { validated: true }
          });
          
          // Actualizăm și statusul anunțului la ACTIVE în loc de PENDING
          await prisma.listing.update({
            where: { id: listing.id },
            data: { status: 'ACTIVE' }
          });
        } catch (validationError) {
          console.error('Error updating listing validation status:', validationError);
        }
      }

      return NextResponse.json({
        ...listing,
        message: isAuthenticated 
          ? 'Anunțul a fost creat și publicat cu succes.' 
          : 'Anunțul a fost creat cu succes și este în așteptare pentru validare. Un email de confirmare a fost trimis la adresa ta de email.'
      });
    } catch (error) {
      console.error('Detailed error creating listing:', error);
      // Save the error details for better diagnostics
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        if ('code' in error) {
          console.error('Prisma error code:', (error as any).code);
        }
      }
      
      // Return a more informative error response instead of throwing
      return NextResponse.json(
        { 
          error: 'Failed to create listing', 
          details: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function generateSlug(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const existingListing = await prisma.listing.findUnique({
    where: { slug: baseSlug }
  });

  if (!existingListing) {
    return baseSlug;
  }

  return `${baseSlug}-${Date.now()}`;
}