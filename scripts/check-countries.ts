import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const count = await p.countryProfile.count();
  console.log('Country profiles in DB:', count);
  const sample = await p.countryProfile.findMany({ select: { code: true, name: true, region: true }, take: 5 });
  console.log('Sample:', JSON.stringify(sample, null, 2));
  await p.$disconnect();
}
main().catch(e => { console.error(e.message); p.$disconnect(); });
