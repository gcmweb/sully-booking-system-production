
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from "../../../../../lib/auth";
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Mock system settings - in a real app, these would be stored in database
let systemSettings = {
  siteName: 'Sully Booking System',
  siteDescription: 'Professional venue booking and management platform',
  supportEmail: 'support@sully.com',
  maintenanceMode: false,
  allowRegistrations: true,
  requireEmailVerification: true,
  maxVenuesPerUser: 5,
  defaultSubscriptionPlan: 'FREE',
  systemNotifications: true,
};

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth([Role.SUPER_ADMIN]);

    return NextResponse.json({
      settings: systemSettings,
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth([Role.SUPER_ADMIN]);
    const { settings } = await request.json();

    // Validate settings
    if (!settings.siteName || !settings.supportEmail) {
      return NextResponse.json(
        { error: 'Site name and support email are required' },
        { status: 400 }
      );
    }

    // Update settings (in a real app, save to database)
    systemSettings = { ...systemSettings, ...settings };

    return NextResponse.json({
      message: 'System settings updated successfully',
      settings: systemSettings,
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update system settings' },
      { status: 500 }
    );
  }
}
