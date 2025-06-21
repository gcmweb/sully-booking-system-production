
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from "../../../lib/auth";
import { getUserNotifications, markNotificationAsRead } from "../../../lib/notifications";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const notifications = await getUserNotifications(user.id, limit);

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
