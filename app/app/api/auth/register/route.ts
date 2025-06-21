
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../lib/db";
import { hashPassword, createSession } from "../../../../lib/auth";
import { registerSchema } from "../../../../lib/validations";
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🔵 [AUTH] Registration attempt started');
  
  try {
    // Parse JSON body with error handling
    let body;
    try {
      body = await request.json();
      console.log('🔵 [AUTH] Request body parsed:', { ...body, password: '[REDACTED]' });
    } catch (error) {
      console.error('🔴 [AUTH] JSON parsing error:', error);
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    // Validate request body
    let validatedData;
    try {
      validatedData = registerSchema.parse(body);
      console.log('🔵 [AUTH] Data validation successful');
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('🔴 [AUTH] Validation error:', error.errors);
        return NextResponse.json(
          { error: 'Invalid request data', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

    const { email, password, firstName, lastName, phone } = validatedData;

    // Check if user already exists
    console.log('🔵 [AUTH] Checking for existing user:', email.toLowerCase());
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.log('🔴 [AUTH] User already exists:', email.toLowerCase());
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    console.log('🔵 [AUTH] Hashing password');
    const hashedPassword = await hashPassword(password);

    // Create user
    console.log('🔵 [AUTH] Creating user in database');
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone,
      },
    });
    console.log('🔵 [AUTH] User created successfully:', user.id);

    // Create session
    console.log('🔵 [AUTH] Creating session');
    const token = await createSession(user.id);
    console.log('🔵 [AUTH] Session created successfully');

    // Set cookie and return response
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('🟢 [AUTH] Registration completed successfully');
    return response;
  } catch (error: any) {
    console.error('🔴 [AUTH] Registration error:', error);
    console.error('🔴 [AUTH] Error stack:', error.stack);
    
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Generic server error
    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
}
