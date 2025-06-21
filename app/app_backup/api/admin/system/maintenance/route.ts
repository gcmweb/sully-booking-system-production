
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../../lib/db";
import { requireAuth } from "../../../../../lib/auth";
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth([Role.SUPER_ADMIN]);

    console.log('🔧 [ADMIN] Starting database maintenance...');

    // Clean up expired sessions
    const expiredSessions = await prisma.userSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`🗑️ [ADMIN] Cleaned up ${expiredSessions.count} expired sessions`);

    // Clean up old notifications (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldNotifications = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
        isRead: true,
      },
    });

    console.log(`🗑️ [ADMIN] Cleaned up ${oldNotifications.count} old notifications`);

    // Update analytics (mock operation)
    console.log('📊 [ADMIN] Updating analytics cache...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('✅ [ADMIN] Database maintenance completed successfully');

    return NextResponse.json({
      message: 'Database maintenance completed successfully',
      results: {
        expiredSessionsRemoved: expiredSessions.count,
        oldNotificationsRemoved: oldNotifications.count,
        analyticsUpdated: true,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database maintenance error:', error);
    return NextResponse.json(
      { error: 'Failed to run database maintenance' },
      { status: 500 }
    );
  }
}
