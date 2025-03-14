import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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

    const [
      revenueStats,
      newUsers,
      categoryDistribution,
      recentActivity,
      dailyRevenue
    ] = await Promise.all([
      // Venit total și conversie
      prisma.payment.aggregate({
        _sum: {
          amount: true
        },
        where: {
          createdAt: dateFilter,
          status: 'COMPLETED'
        }
      }),

      // Utilizatori noi
      prisma.user.count({
        where: {
          createdAt: dateFilter
        }
      }),

      // Distribuție categorii
      prisma.category.findMany({
        select: {
          name: true,
          _count: {
            select: {
              listings: {
                where: {
                  status: 'ACTIVE'
                }
              }
            }
          }
        }
      }),

      // Activitate recentă
      prisma.listing.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        where: {
          createdAt: dateFilter
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }),

      // Venituri zilnice pentru grafic
      prisma.$queryRaw`
        SELECT 
          DATE(createdAt) as date,
          SUM(amount) as revenue
        FROM Payment
        WHERE createdAt >= ${dateFilter.gte}
          AND status = 'COMPLETED'
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `
    ]);

    // Calculăm rata de conversie (plăți finalizate / total plăți)
    const totalPayments = await prisma.payment.count({
      where: {
        createdAt: dateFilter
      }
    });

    const completedPayments = await prisma.payment.count({
      where: {
        createdAt: dateFilter,
        status: 'COMPLETED'
      }
    });

    const conversionRate = totalPayments > 0 
      ? (completedPayments / totalPayments) * 100 
      : 0;

    // Formatăm distribuția categoriilor
    const formattedCategories = categoryDistribution.map(cat => ({
      name: cat.name,
      value: cat._count.listings
    }));

    // Calculăm procentele pentru categorii
    const totalListings = formattedCategories.reduce((sum, cat) => sum + cat.value, 0);
    const categoriesWithPercentages = formattedCategories.map(cat => ({
      ...cat,
      percentage: totalListings > 0 
        ? (cat.value / totalListings) * 100 
        : 0
    }));

    return NextResponse.json({
      stats: {
        revenue: {
          value: revenueStats._sum.amount || 0,
          change: '+12.5%' // În viitor, se poate calcula schimbarea procentuală
        },
        newUsers: {
          value: newUsers,
          change: '+8.2%'
        },
        conversion: {
          value: conversionRate.toFixed(1),
          change: '-2.4%'
        }
      },
      categoryDistribution: categoriesWithPercentages,
      recentActivity: recentActivity.map(activity => ({
        action: 'Anunț nou adăugat',
        user: `${activity.user.firstName} ${activity.user.lastName}`,
        date: activity.createdAt,
        details: activity.title
      })),
      dailyRevenue: dailyRevenue.map(day => ({
        date: day.date,
        revenue: parseFloat(day.revenue)
      }))
    });
  } catch (error) {
    console.error('Error in GET /api/admin/reports:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}