
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

    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        subscription: true,
        _count: {
          select: {
            bookings: true,
            tables: true,
            events: true,
            images: true,
          },
        },
        bookings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            date: true,
            status: true,
            customerName: true,
            customerEmail: true,
            partySize: true,
          },
        },
        tables: {
          select: {
            id: true,
            name: true,
            capacity: true,
            isActive: true,
          },
        },
        events: {
          take: 5,
          orderBy: { date: 'desc' },
          select: {
            id: true,
            name: true,
            date: true,
            capacity: true,
            isActive: true,
          },
        },
      },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ venue });
  } catch (error) {
    console.error('Get venue error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venue' },
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

    // Check if venue exists
    const venue = await prisma.venue.findUnique({
      where: { id },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Delete venue (cascade will handle related records)
    await prisma.venue.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('Delete venue error:', error);
    return NextResponse.json(
      { error: 'Failed to delete venue' },
      { status: 500 }
    );
  }
}
