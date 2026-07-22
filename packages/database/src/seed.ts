import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'admin@reid.dev' },
    update: {},
    create: {
      email: 'admin@reid.dev',
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
