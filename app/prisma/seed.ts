
import { PrismaClient, Role, VenueType, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Create SUPER_ADMIN user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sully.com' },
    update: {},
    create: {
      email: 'admin@sully.com',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
      emailVerified: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: hashedPassword,
      role: Role.VENUE_OWNER,
    },
  });

  // Create test venues
  const venue1 = await prisma.venue.upsert({
    where: { slug: 'status-test-venue' },
    update: {},
    create: {
      name: 'Status Test Venue',
      slug: 'status-test-venue',
      description: 'A test restaurant for status testing',
      address: '123 Test Street',
      city: 'Test City',
      zipCode: 'TE1 2ST',
      phone: '+44 1234 567890',
      email: 'venue1@test.com',
      ownerId: user.id,
      isActive: true,
    },
  });

  const venue2 = await prisma.venue.upsert({
    where: { slug: 'the-golden-spoon' },
    update: {},
    create: {
      name: 'The Golden Spoon',
      slug: 'the-golden-spoon',
      description: 'Fine dining restaurant',
      address: '456 Golden Avenue',
      city: 'Golden City',
      state: 'Golden State',
      zipCode: 'GC2 3RD',
      phone: '+44 9876 543210',
      email: 'venue2@test.com',
      ownerId: user.id,
      isActive: true,
    },
  });

  const venue3 = await prisma.venue.upsert({
    where: { slug: 'updated-test-restaurant' },
    update: {},
    create: {
      name: 'Updated Test Restaurant',
      slug: 'updated-test-restaurant',
      description: 'Updated test restaurant',
      address: '789 Updated Street',
      city: 'Updated City',
      state: 'Updated State',
      zipCode: 'UP3 4TH',
      phone: '+44 5555 123456',
      email: 'venue3@test.com',
      ownerId: user.id,
      isActive: true,
    },
  });

  // Create subscriptions for venues
  await prisma.subscription.upsert({
    where: { id: 'subscription-0' },
    update: {},
    create: {
      id: 'subscription-0',
      userId: user.id,
      status: 'active',
      planType: 'starter',
      amount: 0,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  await prisma.subscription.upsert({
    where: { id: 'subscription-1' },
    update: {},
    create: {
      id: 'subscription-1',
      userId: user.id,
      status: 'active',
      planType: 'professional',
      amount: 49.99,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.subscription.upsert({
    where: { id: 'subscription-2' },
    update: {},
    create: {
      id: 'subscription-2',
      userId: user.id,
      status: 'active',
      planType: 'starter',
      amount: 29.99,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Create a test widget
  await prisma.bookingWidget.upsert({
    where: { id: 'test-widget-id' },
    update: {},
    create: {
      id: 'test-widget-id',
      name: 'Main Website Widget',
      venueId: venue1.id,
      isActive: true,
      embedCode: `<iframe src="http://localhost:3000/api/widgets/test-widget-id/embed" width="100%" height="600" frameborder="0"></iframe>`,
      theme: 'light',
      primaryColor: '#3b82f6',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
