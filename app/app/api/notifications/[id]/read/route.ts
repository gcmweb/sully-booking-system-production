
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from "../../../../../lib/auth";
import { markNotificationAsRead } from "../../../../../lib/notifications";
import { prisma } from "../../../../../lib/db";

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification || notification.userId !== user.id) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    await markNotificationAsRead(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
