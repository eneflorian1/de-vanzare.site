import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: { contactId: string } }
) {
  try {
    console.log('Starting delete conversation process');
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session found:', session.user.email);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.log('User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User found:', user.id);
    const contactId = parseInt(params.contactId);
    console.log('Contact ID:', contactId);

    if (isNaN(contactId)) {
      return NextResponse.json(
        { error: 'Invalid contact ID' },
        { status: 400 }
      );
    }

    // Actualizăm mesajele trimise
    const sentUpdate = await prisma.message.updateMany({
      where: {
        senderId: user.id,
        receiverId: contactId,
      },
      data: {
        deletedForSender: true,
      },
    });
    console.log('Sent messages updated:', sentUpdate);

    // Actualizăm mesajele primite
    const receivedUpdate = await prisma.message.updateMany({
      where: {
        senderId: contactId,
        receiverId: user.id,
      },
      data: {
        deletedForReceiver: true,
      },
    });
    console.log('Received messages updated:', receivedUpdate);

    // Ștergem notificările
    const notificationsDeleted = await prisma.notification.deleteMany({
      where: {
        userId: user.id,
        type: 'MESSAGE',
      },
    });
    console.log('Notifications deleted:', notificationsDeleted);

    return NextResponse.json({ 
      success: true, 
      message: 'Conversation deleted successfully',
      updates: {
        sentMessages: sentUpdate,
        receivedMessages: receivedUpdate,
        notifications: notificationsDeleted
      }
    });
  } catch (error) {
    console.error('Error in DELETE conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 