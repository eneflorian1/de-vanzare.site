import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Message request body:', body);
    const { receiverId, listingId, message } = body;

    if (!receiverId || !listingId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sender = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    if (!sender) {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 });
    }

    // Verifică dacă destinatarul și anunțul există
    const [receiver, listing] = await Promise.all([
      prisma.user.findUnique({
        where: { id: receiverId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }),
      // Dacă listingId este 0, înseamnă că este un ID fictiv pentru conversații unde anunțul nu mai există
      listingId !== 0 ? prisma.listing.findUnique({
        where: { id: listingId },
        select: {
          id: true,
          title: true,
          slug: true,
          userId: true
        }
      }) : null
    ]);

    if (!receiver) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 }
      );
    }

    // Verificăm anunțul doar dacă nu este ID-ul fictiv (0)
    if (listingId !== 0 && !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Verifică dacă utilizatorul încearcă să își trimită mesaj sie însuși
    if (sender.id === receiverId) {
      return NextResponse.json(
        { error: 'Cannot send message to yourself' },
        { status: 400 }
      );
    }

    console.log('Creating message from', sender.id, 'to', receiverId);

    const newMessage = await prisma.message.create({
      data: {
        senderId: sender.id,
        receiverId: receiverId,
        listingId: listingId,
        message: message,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    console.log('Message created:', newMessage);

    // Creează o notificare pentru destinatar
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'MESSAGE',
        title: 'Mesaj nou',
        content: `Ai primit un mesaj nou de la ${sender.firstName} ${sender.lastName}`,
        relatedId: newMessage.id,
      },
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}