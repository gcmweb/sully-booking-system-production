
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    let whereClause: any = {};

    if (email) {
      whereClause.customerEmail = email;
    } else if (phone) {
      whereClause.customerPhone = phone;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            phone: true,
            email: true,
          },
        },
        table: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Get customer bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
