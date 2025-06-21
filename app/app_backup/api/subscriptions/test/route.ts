
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Test subscription API called');
    
    return NextResponse.json({
      status: 'success',
      message: 'Test subscription API working',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test subscription API error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
