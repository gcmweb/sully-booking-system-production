import { NextRequest, NextResponse } from 'next/server';
import { testDatabaseConnection } from '../../../lib/db-connection-test';

export const dynamic = 'force-dynamic';

// GET /api/__test-db - Database connection test endpoint
export async function GET() {
  try {
    console.log('=== Database Test Endpoint Called ===');
    const testResult = await testDatabaseConnection();
    
    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Database connection test passed',
        data: testResult,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Database connection test failed',
        error: testResult.error,
        environment: testResult.environment,
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Database test endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database test endpoint failed',
      error: {
        type: 'ENDPOINT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}