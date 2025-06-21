
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../lib/db";
import { verifyPassword, createSession, setAuthCookie } from "../../../../lib/auth";
import { loginSchema } from "../../../../lib/validations";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🔵 [LOGIN-API] Login attempt started');
  
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('🔵 [LOGIN-API] Request body parsed successfully');
    } catch (parseError) {
      console.error('🔴 [LOGIN-API] Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate input data
    let validatedData;
    try {
      validatedData = loginSchema.parse(body);
      console.log('🔵 [LOGIN-API] Input validation successful for email:', validatedData.email);
    } catch (validationError) {
      console.error('🔴 [LOGIN-API] Input validation failed:', validationError);
      return NextResponse.json(
        { error: 'Invalid email or password format' },
        { status: 400 }
      );
    }

    const { email, password } = validatedData;

    // Find user by email
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      console.log('🔵 [LOGIN-API] Database query completed, user found:', !!user);
    } catch (dbError) {
      console.error('🔴 [LOGIN-API] Database error during user lookup:', dbError);
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    if (!user) {
      console.log('🔴 [LOGIN-API] User not found for email:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    let isValidPassword;
    try {
      isValidPassword = await verifyPassword(password, user.password);
      console.log('🔵 [LOGIN-API] Password verification completed:', isValidPassword);
    } catch (passwordError) {
      console.error('🔴 [LOGIN-API] Password verification error:', passwordError);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }

    if (!isValidPassword) {
      console.log('🔴 [LOGIN-API] Invalid password for user:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('🔴 [LOGIN-API] Inactive user attempted login:', email);
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 401 }
      );
    }

    // Create session
    let token;
    try {
      token = await createSession(user.id);
      console.log('🔵 [LOGIN-API] Session created successfully');
    } catch (sessionError) {
      console.error('🔴 [LOGIN-API] Session creation error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Create response with user data
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    console.log('🟢 [LOGIN-API] Login successful for user:', email);

    const response = NextResponse.json({ user: userData });

    // Set authentication cookie
    try {
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      console.log('🔵 [LOGIN-API] Auth cookie set successfully');
    } catch (cookieError) {
      console.error('🔴 [LOGIN-API] Cookie setting error:', cookieError);
      // Still return success since the main login worked
    }

    return response;

  } catch (error) {
    console.error('🔴 [LOGIN-API] Unexpected error during login:', error);
    console.error('🔴 [LOGIN-API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Ensure we always return JSON, never HTML
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
