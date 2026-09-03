import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Get all universities grouped by country
  const universities = await prisma.university.findMany({
    select: {
      id: true,
      name: true,
      country: true,
      city: true,
      _count: { select: { courses: true, departments: true } },
    },
    orderBy: [{ country: 'asc' }, { name: 'asc' }],
  });

  // Group by country
  const countryMap: Record<string, typeof universities> = {};
  for (const u of universities) {
    if (!countryMap[u.country]) countryMap[u.country] = [];
    countryMap[u.country].push(u);
  }

  console.log('=== COUNTRY COVERAGE ===\n');
  const sorted = Object.entries(countryMap).sort((a, b) => a[1].length - b[1].length);
  
  for (const [country, unis] of sorted) {
    const cities = new Set(unis.map(u => u.city));
    const totalCourses = unis.reduce((s, u) => s + u._count.courses, 0);
    const unisWithNoCourses = unis.filter(u => u._count.courses === 0);
    const unisWithNoDepts = unis.filter(u => u._count.departments === 0);
    
    console.log(`${country}: ${unis.length} unis, ${cities.size} cities, ${totalCourses} courses`);
    if (unisWithNoCourses.length > 0) {
      console.log(`  ⚠️  ${unisWithNoCourses.length} universities with NO courses:`);
      for (const u of unisWithNoCourses) {
        console.log(`    - ${u.name} (${u.city})`);
      }
    }
    if (unisWithNoDepts.length > 0) {
      console.log(`  ⚠️  ${unisWithNoDepts.length} universities with NO departments:`);
      for (const u of unisWithNoDepts) {
        console.log(`    - ${u.name} (${u.city})`);
      }
    }
  }

  console.log('\n=== UNIVERSITIES WITH NO COURSES (ALL) ===\n');
  const noCourses = universities.filter(u => u._count.courses === 0);
  for (const u of noCourses) {
    console.log(`  ${u.name} | ${u.city} | ${u.country}`);
  }
  console.log(`\nTotal: ${noCourses.length} universities with no courses out of ${universities.length}`);

  console.log('\n=== COUNTRIES WITH ONLY 1 UNIVERSITY ===\n');
  for (const [country, unis] of sorted) {
    if (unis.length === 1) {
      const u = unis[0];
      console.log(`  ${country}: ${u.name} (${u.city}) — ${u._count.courses} courses, ${u._count.departments} depts`);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
