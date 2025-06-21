
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../../lib/db";
import { requireAuth } from "../../../../../lib/auth";
import { tableSchema } from "../../../../../lib/validations";
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id: venueId } = params;

    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (user.role !== Role.SUPER_ADMIN && venue.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const tables = await prisma.table.findMany({
      where: { venueId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Get tables error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id: venueId } = params;
    const body = await request.json();
    const tableData = tableSchema.parse(body);

    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (user.role !== Role.SUPER_ADMIN && venue.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const table = await prisma.table.create({
      data: {
        ...tableData,
        venueId,
      },
    });

    return NextResponse.json({ table });
  } catch (error) {
    console.error('Create table error:', error);
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    );
  }
}
