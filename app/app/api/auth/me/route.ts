
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from "../../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('🔵 [AUTH-BACKEND] Auth check request received');
  console.log('🔵 [AUTH-BACKEND] Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    const user = await getSession();
    console.log('🔵 [AUTH-BACKEND] Session check result:', user ? `User found: ${user.email}` : 'No user session');

    // Return 200 with user: null for unauthenticated users
    // This is not an error state, just means user is not logged in
    const response = NextResponse.json({ user: user || null });
    console.log('🟢 [AUTH-BACKEND] Auth check completed successfully');
    return response;
  } catch (error: any) {
    console.error('🔴 [AUTH-BACKEND] Auth check error:', error);
    console.error('🔴 [AUTH-BACKEND] Error stack:', error?.stack);
    return NextResponse.json(
      { error: 'Authentication check failed' },
      { status: 500 }
    );
  }
}
