import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'luna';

    let dateFilter = {};
    switch (period) {
      case 'azi':
        dateFilter = {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        };
        break;
      case 'saptamana':
        dateFilter = {
          gte: new Date(new Date().setDate(new Date().getDate() - 7))
        };
        break;
      case 'luna':
        dateFilter = {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
        };
        break;
      case 'an':
        dateFilter = {
          gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        };
        break;
    }

    // Fetch data
    const [listings, users, payments, categories] = await Promise.all([
      // Anunțuri
      prisma.listing.findMany({
        where: {
          createdAt: dateFilter
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          category: true
        }
      }),

      // Utilizatori
      prisma.user.findMany({
        where: {
          createdAt: dateFilter
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          status: true
        }
      }),

      // Plăți
      prisma.payment.findMany({
        where: {
          createdAt: dateFilter
        },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),

      // Statistici categorii
      prisma.category.findMany({
        include: {
          _count: {
            select: {
              listings: {
                where: {
                  createdAt: dateFilter
                }
              }
            }
          }
        }
      })
    ]);

    // Format data for Excel
    const listingsSheet = listings.map(listing => ({
      'ID': listing.id,
      'Titlu': listing.title,
      'Categorie': listing.category.name,
      'Preț': listing.price,
      'Status': listing.status,
      'Utilizator': `${listing.user.firstName} ${listing.user.lastName}`,
      'Email Utilizator': listing.user.email,
      'Data Publicării': listing.createdAt
    }));

    const usersSheet = users.map(user => ({
      'ID': user.id,
      'Email': user.email,
      'Nume': user.firstName,
      'Prenume': user.lastName,
      'Status': user.status,
      'Data Înregistrării': user.createdAt
    }));

    const paymentsSheet = payments.map(payment => ({
      'ID': payment.id,
      'Sumă': payment.amount,
      'Status': payment.status,
      'Tip': payment.paymentType,
      'Utilizator': `${payment.user.firstName} ${payment.user.lastName}`,
      'Email': payment.user.email,
      'Data': payment.createdAt
    }));

    const categoriesSheet = categories.map(category => ({
      'Categorie': category.name,
      'Anunțuri Active': category._count.listings
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add sheets
    XLSX.utils.book_append_sheet(
      wb, 
      XLSX.utils.json_to_sheet(listingsSheet), 
      'Anunțuri'
    );
    XLSX.utils.book_append_sheet(
      wb, 
      XLSX.utils.json_to_sheet(usersSheet), 
      'Utilizatori'
    );
    XLSX.utils.book_append_sheet(
      wb, 
      XLSX.utils.json_to_sheet(paymentsSheet), 
      'Plăți'
    );
    XLSX.utils.book_append_sheet(
      wb, 
      XLSX.utils.json_to_sheet(categoriesSheet), 
      'Categorii'
    );

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return response
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="raport-${period}-${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    });
  } catch (error) {
    console.error('Error in GET /api/admin/reports/export:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}