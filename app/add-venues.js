
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addSampleVenues() {
  try {
    // First, let's check if we have any venues
    const existingVenues = await prisma.venue.findMany();
    console.log(`Found ${existingVenues.length} existing venues`);

    if (existingVenues.length === 0) {
      // Create sample venues with header images
      const venues = [
        {
          name: "The Golden Spoon",
          slug: "the-golden-spoon",
          description: "An elegant fine dining restaurant offering contemporary cuisine with a focus on locally sourced ingredients.",
          address: "123 Main Street",
          city: "New York",
          phone: "+1-555-0123",
          email: "info@goldenspoon.com",
          cuisine: "Contemporary American",
          venueType: "FINE_DINING",
          capacity: 80,
          headerImageUrl: "https://images.pexels.com/photos/29033148/pexels-photo-29033148.jpeg?cs=srgb&dl=pexels-szymon-shields-1503561-29033148.jpg&fm=jpg",
          logoUrl: "https://i.pinimg.com/736x/66/88/fd/6688fdcb00219fe3978b7487a85488ed.jpg",
          isActive: true,
          ownerId: null // We'll need to create a user first
        },
        {
          name: "Brew & Bean Cafe",
          slug: "brew-bean-cafe",
          description: "A cozy neighborhood cafe serving artisanal coffee, fresh pastries, and light meals in a warm, welcoming atmosphere.",
          address: "456 Oak Avenue",
          city: "San Francisco",
          phone: "+1-555-0456",
          email: "hello@brewbean.com",
          cuisine: "Coffee & Light Bites",
          venueType: "CAFE",
          capacity: 40,
          headerImageUrl: "https://i.pinimg.com/originals/51/7c/c8/517cc8a781f778d4ef099cb026dd4667.jpg",
          logoUrl: "https://i.pinimg.com/originals/dc/02/5d/dc025d5335326eb8e16657f398e5a247.jpg",
          isActive: true,
          ownerId: null
        },
        {
          name: "Sunset Rooftop Bar",
          slug: "sunset-rooftop-bar",
          description: "Experience breathtaking city views while enjoying craft cocktails and small plates at our rooftop bar.",
          address: "789 High Street",
          city: "Los Angeles",
          phone: "+1-555-0789",
          email: "reservations@sunsetbar.com",
          cuisine: "Cocktails & Small Plates",
          venueType: "BAR",
          capacity: 120,
          headerImageUrl: "https://i.pinimg.com/originals/89/ac/69/89ac69e1017a40342265343239592581.jpg",
          logoUrl: "https://static.vecteezy.com/system/resources/previews/021/813/156/original/sunset-bar-logo-design-template-with-glass-cocktail-and-sunset-perfect-for-business-company-mobile-app-restaurant-etc-free-vector.jpg",
          isActive: true,
          ownerId: null
        },
        {
          name: "Mama's Italian Kitchen",
          slug: "mamas-italian-kitchen",
          description: "Authentic Italian cuisine served in a family-friendly atmosphere with traditional recipes passed down through generations.",
          address: "321 Little Italy Street",
          city: "Chicago",
          phone: "+1-555-0321",
          email: "ciao@mamasitalian.com",
          cuisine: "Italian",
          venueType: "RESTAURANT",
          capacity: 60,
          headerImageUrl: "https://i.pinimg.com/originals/71/c3/4f/71c34f2a409083813937d845b0366819.jpg",
          logoUrl: "https://i.pinimg.com/originals/34/aa/9b/34aa9b50b9b6f57b730cda8b37893a18.jpg",
          isActive: true,
          ownerId: null
        }
      ];

      // First create a sample user to be the owner
      const sampleUser = await prisma.user.create({
        data: {
          email: "owner@example.com",
          name: "Sample Owner",
          role: "VENUE_OWNER",
          hashedPassword: "$2a$10$example.hash.here" // This is just a placeholder
        }
      });

      // Now create venues with the owner
      for (const venueData of venues) {
        const venue = await prisma.venue.create({
          data: {
            ...venueData,
            ownerId: sampleUser.id
          }
        });
        console.log(`Created venue: ${venue.name}`);
      }

      console.log('Sample venues created successfully!');
    } else {
      // Update existing venues with header images if they don't have them
      const headerImages = [
        "https://i.pinimg.com/originals/c7/b9/c2/c7b9c2b360d9b6b1639ce5a89e5ad1a8.jpg",
        "https://i.pinimg.com/originals/5d/fc/43/5dfc438a023f62872b44804454fe8b5b.jpg",
        "https://i.pinimg.com/originals/6f/31/0f/6f310f3dc9d512158e35041fe4f956cc.png",
        "https://i.pinimg.com/originals/22/c4/f5/22c4f5115b7d08821b7e61597a0026ca.jpg"
      ];

      for (let i = 0; i < existingVenues.length && i < headerImages.length; i++) {
        if (!existingVenues[i].headerImageUrl) {
          await prisma.venue.update({
            where: { id: existingVenues[i].id },
            data: { headerImageUrl: headerImages[i] }
          });
          console.log(`Updated ${existingVenues[i].name} with header image`);
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleVenues();
