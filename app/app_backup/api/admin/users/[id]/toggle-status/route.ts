
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../../../lib/db";
import { requireAuth } from "../../../../../../lib/auth";
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth([Role.SUPER_ADMIN]);
    const { id } = params;
    const { isActive } = await request.json();

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent disabling super admin users
    if (targetUser.role === Role.SUPER_ADMIN && !isActive) {
      return NextResponse.json(
        { error: 'Cannot disable super admin users' },
        { status: 403 }
      );
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    return NextResponse.json({ 
      message: `User ${isActive ? 'enabled' : 'disabled'} successfully`,
      user: updatedUser 
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}
