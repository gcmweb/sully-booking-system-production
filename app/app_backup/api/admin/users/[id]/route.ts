
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../../lib/db";
import { requireAuth } from "../../../../../lib/auth";
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth([Role.SUPER_ADMIN]);
    const { id } = params;

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            venues: true,
            bookings: true,
            notifications: true,
          },
        },
        venues: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            createdAt: true,
          },
        },
        bookings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            date: true,
            status: true,
            venue: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: targetUser });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth([Role.SUPER_ADMIN]);
    const { id } = params;

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

    // Prevent deleting super admin users
    if (targetUser.role === Role.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Cannot delete super admin users' },
        { status: 403 }
      );
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
