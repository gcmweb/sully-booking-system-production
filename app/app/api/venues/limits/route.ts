
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from "../../../../lib/auth";
import { checkVenueCreationLimits } from "../../../../lib/subscription";
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Super admins have no limits
    if (user.role === Role.SUPER_ADMIN) {
      return NextResponse.json({
        success: true,
        canCreateVenue: true,
        venuesUsed: 0,
        venuesLimit: null,
        plan: 'SUPER_ADMIN',
        message: 'Super admin - no limits'
      });
    }
    
    const venueCheck = await checkVenueCreationLimits(user.id);
    
    return NextResponse.json({
      success: true,
      ...venueCheck
    });
  } catch (error: any) {
    console.error('Check venue limits error:', error);
    
    // Handle authentication errors
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (error.message === 'Account is inactive') {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to check venue limits' },
      { status: 500 }
    );
  }
}
