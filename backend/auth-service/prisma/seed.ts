import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed process...');

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {}, // If user exists, don't update anything
    create: {
      username: 'admin',
      email: 'admin@nomanstop.com', // Required now!
      password: 'admin_password123', // Your test password
    },
  });

  const testUser = await prisma.user.upsert({
    where: { username: 'john_doe' },
    update: {},
    create: {
      username: 'john_doe',
      email: 'john@nomanstop.com', // Required now!
      password: 'secretpassword',
    },
  });

  console.log('Database seeded successfully!');
  console.log('Created test users:', admin.username, testUser.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
