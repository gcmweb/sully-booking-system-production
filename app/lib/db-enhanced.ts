import { PrismaClient } from '@prisma/client'
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Enhanced Prisma client with better error handling and logging
function createPrismaClient() {
  logger.info('Initializing Prisma client', {
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
  });

  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL environment variable is not set');
    throw new Error('DATABASE_URL environment variable is required');
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn', 'info'] 
      : ['error', 'warn'],
    errorFormat: 'pretty',
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Enhanced database operation wrapper with retry logic
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  operationName: string = 'database operation'
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.debug(`Attempting ${operationName}`, { attempt, maxRetries });
      const result = await operation();
      
      if (attempt > 1) {
        logger.info(`${operationName} succeeded on retry`, { attempt });
      }
      
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      logger.warn(`${operationName} failed on attempt ${attempt}`, {
        attempt,
        maxRetries,
        error: lastError.message,
      });

      // Don't retry on certain types of errors
      if (
        lastError.message.includes('authentication failed') ||
        lastError.message.includes('database') && lastError.message.includes('does not exist') ||
        lastError.message.includes('Environment variable not found')
      ) {
        logger.error(`${operationName} failed with non-retryable error`, lastError);
        throw lastError;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s...
        logger.debug(`Waiting ${delay}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  logger.error(`${operationName} failed after ${maxRetries} attempts`, lastError);
  throw lastError;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  logger.info('Application shutting down, disconnecting from database...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});