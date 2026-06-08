import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SEED_USERS = [
  { username: 'admin', email: 'admin@nomanstop.com', password: 'admin_password123' },
  { username: 'john_doe', email: 'john@nomanstop.com', password: 'secretpassword' },
  { username: 'noman', email: 'noman@nomanstop.com', password: 'password123' },
  { username: 'alex', email: 'alex@nomanstop.com', password: 'password123' },
  { username: 'sara', email: 'sara@nomanstop.com', password: 'password123' },
  { username: 'mike', email: 'mike@nomanstop.com', password: 'password123' },
  { username: 'jenny', email: 'jenny@nomanstop.com', password: 'password123' },
  { username: 'john', email: 'john.personal@nomanstop.com', password: 'password123' },
] as const;

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

async function main() {
  console.log('Starting seed process...');

  const created: string[] = [];

  for (const seedUser of SEED_USERS) {
    const hashedPassword = await hashPassword(seedUser.password);

    await prisma.user.upsert({
      where: { username: seedUser.username },
      update: { password: hashedPassword },
      create: {
        username: seedUser.username,
        email: seedUser.email,
        password: hashedPassword,
        interests: [],
      },
    });

    created.push(seedUser.username);
  }

  console.log('Database seeded successfully!');
  console.log('Created/updated test users:', created.join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
