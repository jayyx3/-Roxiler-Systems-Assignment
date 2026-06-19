import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

async function main() {
  console.log('Starting database seeding...');

  // 1. Clear existing data
  console.log('Cleaning up existing database records...');
  await prisma.rating.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash('Password123!', salt);

  // 2. Create System Admin (name must be >= 20 characters)
  console.log('Seeding System Admin...');
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Account', // 28 chars
      email: 'admin@example.com',
      password: commonPasswordHash,
      address: '123 Tech HQ Avenue, Silicon Valley, CA 94025',
      role: 'SYSTEM_ADMIN',
    },
  });
  console.log(`Admin created: ${admin.email}`);

  // 3. Create 5 Normal Users (names must be >= 20 characters)
  console.log('Seeding Normal Users...');
  const normalUsersData = [
    {
      name: 'Alexander Hamilton Junior', // 25 chars
      email: 'alexander@example.com',
      password: commonPasswordHash,
      address: '12 Grange Road, New York, NY 10001',
      role: 'NORMAL_USER',
    },
    {
      name: 'William Shakespeare Senior', // 26 chars
      email: 'william@example.com',
      password: commonPasswordHash,
      address: 'Stratford-upon-Avon, Warwickshire, UK',
      role: 'NORMAL_USER',
    },
    {
      name: 'Elizabeth Bennett Bennet', // 24 chars
      email: 'elizabeth@example.com',
      password: commonPasswordHash,
      address: 'Longbourn House, Hertfordshire, UK',
      role: 'NORMAL_USER',
    },
    {
      name: 'Christopher Robin Robin', // 23 chars
      email: 'christopher@example.com',
      password: commonPasswordHash,
      address: 'Hundred Acre Wood, East Sussex, UK',
      role: 'NORMAL_USER',
    },
    {
      name: 'Jonathan Joestar Joestar', // 24 chars
      email: 'jonathan@example.com',
      password: commonPasswordHash,
      address: 'Joestar Mansion, Liverpool, UK',
      role: 'NORMAL_USER',
    },
  ];

  const normalUsers = [];
  for (const userData of normalUsersData) {
    const user = await prisma.user.create({ data: userData });
    normalUsers.push(user);
    console.log(`Normal User created: ${user.email}`);
  }

  // 4. Create 5 Store Owners (names must be >= 20 characters)
  console.log('Seeding Store Owners...');
  const storeOwnersData = [
    {
      name: 'Store Owner Number One', // 22 chars
      email: 'owner1@example.com',
      password: commonPasswordHash,
      address: 'Suite 101, Commercial Complex, Sector 5, India',
      role: 'STORE_OWNER',
    },
    {
      name: 'Store Owner Number Two', // 22 chars
      email: 'owner2@example.com',
      password: commonPasswordHash,
      address: 'G-24, Downtown Galleria, Main Street, Canada',
      role: 'STORE_OWNER',
    },
    {
      name: 'Store Owner Number Three', // 24 chars
      email: 'owner3@example.com',
      password: commonPasswordHash,
      address: '7B Market Square, London, United Kingdom',
      role: 'STORE_OWNER',
    },
    {
      name: 'Store Owner Number Four', // 23 chars
      email: 'owner4@example.com',
      password: commonPasswordHash,
      address: 'Level 2, Premium Office Tower, Sydney, Australia',
      role: 'STORE_OWNER',
    },
    {
      name: 'Store Owner Number Five', // 23 chars
      email: 'owner5@example.com',
      password: commonPasswordHash,
      address: 'Block C, Business Hub, Cape Town, South Africa',
      role: 'STORE_OWNER',
    },
  ];

  const storeOwners = [];
  for (const ownerData of storeOwnersData) {
    const user = await prisma.user.create({ data: ownerData });
    storeOwners.push(user);
    console.log(`Store Owner created: ${user.email}`);
  }

  // 5. Create 5 Stores linked to Store Owners (names must be >= 20 characters)
  console.log('Seeding Stores...');
  const storesData = [
    {
      name: 'The Grand Boutique Store', // 24 chars
      email: 'boutique@store.com',
      address: '101 Fashion Boulevard, Paris, France',
      ownerId: storeOwners[0].id,
    },
    {
      name: 'Premium Gourmet Supermarket', // 27 chars
      email: 'gourmet@store.com',
      address: '55 Foodie Plaza, Rome, Italy',
      ownerId: storeOwners[1].id,
    },
    {
      name: 'Elegant Fashion Emporium', // 24 chars
      email: 'fashion@store.com',
      address: '22 Couture Avenue, Milan, Italy',
      ownerId: storeOwners[2].id,
    },
    {
      name: 'Modern Electronics Center', // 25 chars
      email: 'electronics@store.com',
      address: '88 Tech Park Drive, Tokyo, Japan',
      ownerId: storeOwners[3].id,
    },
    {
      name: 'Organic Fresh Food Corner', // 25 chars
      email: 'organic@store.com',
      address: '33 Greenfield Lane, Berlin, Germany',
      ownerId: storeOwners[4].id,
    },
  ];

  const stores = [];
  for (const storeData of storesData) {
    const store = await prisma.store.create({ data: storeData });
    stores.push(store);
    console.log(`Store created: ${store.name}`);
  }

  // 6. Seed Ratings (Random ratings from normal users)
  console.log('Seeding Ratings...');
  // Let's seed random ratings from users to stores (avoiding duplicates)
  // Store 1: Alexander(5), William(4), Elizabeth(3)
  // Store 2: William(5), Elizabeth(4), Christopher(2)
  // Store 3: Elizabeth(5), Christopher(4), Jonathan(3)
  // Store 4: Christopher(5), Jonathan(4), Alexander(2)
  // Store 5: Jonathan(5), Alexander(4), William(3)
  const ratingsSeed = [
    { userId: normalUsers[0].id, storeId: stores[0].id, rating: 5 },
    { userId: normalUsers[1].id, storeId: stores[0].id, rating: 4 },
    { userId: normalUsers[2].id, storeId: stores[0].id, rating: 3 },

    { userId: normalUsers[1].id, storeId: stores[1].id, rating: 5 },
    { userId: normalUsers[2].id, storeId: stores[1].id, rating: 4 },
    { userId: normalUsers[3].id, storeId: stores[1].id, rating: 2 },

    { userId: normalUsers[2].id, storeId: stores[2].id, rating: 5 },
    { userId: normalUsers[3].id, storeId: stores[2].id, rating: 4 },
    { userId: normalUsers[4].id, storeId: stores[2].id, rating: 3 },

    { userId: normalUsers[3].id, storeId: stores[3].id, rating: 5 },
    { userId: normalUsers[4].id, storeId: stores[3].id, rating: 4 },
    { userId: normalUsers[0].id, storeId: stores[3].id, rating: 2 },

    { userId: normalUsers[4].id, storeId: stores[4].id, rating: 5 },
    { userId: normalUsers[0].id, storeId: stores[4].id, rating: 4 },
    { userId: normalUsers[1].id, storeId: stores[4].id, rating: 3 },
  ];

  for (const ratingData of ratingsSeed) {
    await prisma.rating.create({ data: ratingData });
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
