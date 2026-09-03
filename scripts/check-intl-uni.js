const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  const unis = await p.university.findMany({
    where: { country: { not: 'Pakistan' } },
    select: { id: true, name: true, country: true, city: true, closingMerit: true, admissionDates: true, examSystem: true },
    orderBy: { name: 'asc' },
  });
  console.log(`International universities: ${unis.length}`);
  console.log(`With knowledge fields: ${unis.filter(u => u.closingMerit).length}\n`);
  unis.forEach(u => console.log(`${u.id} | ${u.name} | ${u.country} | ${u.city} | ${u.closingMerit ? '✅' : '❌'}`));
  await p.$disconnect();
})();
