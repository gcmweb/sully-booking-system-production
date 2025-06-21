
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from "../../../../../lib/auth";
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth([Role.SUPER_ADMIN]);

    // Mock cache clearing - in a real app, this would clear Redis/memory cache
    console.log('🧹 [ADMIN] Clearing system cache...');
    
    // Simulate cache clearing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✅ [ADMIN] System cache cleared successfully');

    return NextResponse.json({
      message: 'System cache cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    return NextResponse.json(
      { error: 'Failed to clear system cache' },
      { status: 500 }
    );
  }
}
