
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../lib/db";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (token) {
      // Delete session from database
      await prisma.userSession.deleteMany({
        where: { token },
      });
    }

    // Clear cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete('auth-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
