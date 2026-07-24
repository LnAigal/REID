import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'Seed requires SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables',
    );
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'REID Admin',
      password: hashedPassword,
      emailVerified: true,
    },
  });

  console.log(`Created user: ${user.email}`);

  const domain = await prisma.domain.upsert({
    where: { name: 'reid.dev' },
    update: {},
    create: {
      name: 'reid.dev',
      status: 'VERIFIED',
      verificationToken: 'seed-verification-token',
      verifiedAt: new Date(),
      userId: user.id,
      records: {
        create: [
          { type: 'TXT', name: 'reid.dev', value: 'v=spf1 include:reid.dev ~all' },
          { type: 'CNAME', name: 'reid._domainkey.reid.dev', value: 'dkim.reid.dev' },
          { type: 'TXT', name: '_dmarc.reid.dev', value: 'v=DMARC1; p=quarantine;' },
        ],
      },
    },
  });

  console.log(`Created domain: ${domain.name}`);

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
