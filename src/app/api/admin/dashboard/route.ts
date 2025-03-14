import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [
      userCount,
      activeListings,
      totalRevenue,
      recentActivities
    ] = await Promise.all([
      // Total utilizatori activi
      prisma.user.count({
        where: { status: 'ACTIVE' }
      }),
      
      // Anunțuri active
      prisma.listing.count({
        where: { status: 'ACTIVE' }
      }),
      
      // Venituri totale
      prisma.payment.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      }),
      
      // Activități recente
      prisma.listing.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      })
    ]);

    // Conversia BigInt în număr pentru a putea fi serializat
    const revenue = totalRevenue._sum.amount ? Number(totalRevenue._sum.amount) : 0;

    // Generate mock data for charts
    const mockChartData = {
      listings: [
        { name: 'Ian', active: 65, total: 80 },
        { name: 'Feb', active: 75, total: 90 },
        { name: 'Mar', active: 85, total: 100 }
      ],
      categories: [
        { name: 'Auto', value: 35 },
        { name: 'Imobiliare', value: 25 },
        { name: 'Electronice', value: 20 },
        { name: 'Altele', value: 20 }
      ],
      users: [
        { name: 'Ian', total: 120 },
        { name: 'Feb', total: 150 },
        { name: 'Mar', total: 180 }
      ]
    };

    // Format recent activities
    const formattedActivities = recentActivities.map(activity => ({
      type: 'new_listing',
      message: `Nou anunț adăugat: "${activity.title}"`,
      time: activity.createdAt.toISOString(),
      user: `${activity.user.firstName} ${activity.user.lastName}`.trim() || 'Utilizator necunoscut'
    }));

    return NextResponse.json({
      stats: {
        users: userCount,
        listings: activeListings,
        revenue: revenue,
        views: 45200 // Mock data pentru vizualizări
      },
      recentActivities: formattedActivities,
      chartData: mockChartData
    });
  } catch (error) {
    console.error('Error in GET /api/admin/dashboard:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}