
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from './db';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'sully-booking-system-secret-key';
const JWT_EXPIRES_IN = '7d';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken({ userId });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.userSession.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function getSession(): Promise<AuthUser | null> {
  console.log('🔵 [AUTH-LIB] Getting session');
  
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    console.log('🔵 [AUTH-LIB] Token from cookies:', token ? `Token found (${token.substring(0, 20)}...)` : 'No token found');

    if (!token) {
      console.log('🔵 [AUTH-LIB] No auth token found in cookies');
      return null;
    }

    console.log('🔵 [AUTH-LIB] Looking up session in database');
    const session = await prisma.userSession.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      console.log('🔴 [AUTH-LIB] No session found in database for token');
      return null;
    }

    console.log('🔵 [AUTH-LIB] Session found, checking expiration');
    if (session.expiresAt < new Date()) {
      console.log('🔴 [AUTH-LIB] Session expired, deleting');
      await prisma.userSession.delete({ where: { id: session.id } });
      return null;
    }

    console.log('🟢 [AUTH-LIB] Valid session found for user:', session.user.email);
    return {
      id: session.user.id,
      email: session.user.email,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      role: session.user.role,
      isActive: session.user.isActive,
    };
  } catch (error: any) {
    console.error('🔴 [AUTH-LIB] Session error:', error);
    console.error('🔴 [AUTH-LIB] Error stack:', error?.stack);
    return null;
  }
}

export async function requireAuth(allowedRoles?: Role[]): Promise<AuthUser> {
  const user = await getSession();
  
  if (!user) {
    throw new Error('Authentication required');
  }

  if (!user.isActive) {
    throw new Error('Account is inactive');
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }

  return user;
}

export async function logout(): Promise<void> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (token) {
      await prisma.userSession.deleteMany({
        where: { token },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
}

export function setAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export function clearAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete('auth-token');
}

export async function getUserFromToken(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const session = await prisma.userSession.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      return null;
    }

    if (session.expiresAt < new Date()) {
      // Session expired, clean it up
      await prisma.userSession.delete({
        where: { id: session.id },
      });
      return null;
    }

    if (!session.user.isActive) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      role: session.user.role,
      isActive: session.user.isActive,
    };
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}
