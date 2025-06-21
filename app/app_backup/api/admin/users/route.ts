
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/auth";
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await requireAuth([Role.SUPER_ADMIN]);
    
    console.log('🔵 [ADMIN-USERS] Fetching users for admin:', user.email);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');

    let whereClause: any = {};
    if (role) {
      whereClause.role = role;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
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
        _count: {
          select: {
            venues: true,
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.user.count({ where: whereClause });

    const response = {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    console.log('🟢 [ADMIN-USERS] Successfully fetched', users.length, 'users');
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('🔴 [ADMIN-USERS] Error fetching users:', error);
    
    // Handle authentication/authorization errors with proper status codes
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      );
    }

    if (error.message === 'Account is inactive') {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Handle database errors
    if (error.code && error.code.startsWith('P')) {
      console.error('🔴 [ADMIN-USERS] Database error:', error.code, error.message);
      return NextResponse.json(
        { error: 'Database error occurred while fetching users' },
        { status: 500 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
