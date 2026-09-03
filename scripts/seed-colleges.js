const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const colleges = [
  // ===== PUNJAB =====
  {
    name: 'Punjab College Lahore',
    country: 'Pakistan', city: 'Lahore', type: 'college', sector: 'private',
    description: 'Largest chain of colleges in Pakistan. Known for excellent FSc Pre-Medical and Pre-Engineering results. Multiple campuses across Lahore.',
    feeRange: 'PKR 25,000-45,000 per year. FSc Pre-Medical: ~PKR 40,000/yr. FSc Pre-Engineering: ~PKR 38,000/yr. ICS: ~PKR 35,000/yr. ICOM: ~PKR 30,000/yr.',
    closingMerit: 'Open admission — no merit cutoff for intermediate. Students with Matric marks can enroll. For scholarship: 85%+ marks in Matric get 50% fee waiver. 90%+ get 75% waiver. 95%+ get free education.',
    entryTestDetails: 'No entry test for regular admission. Merit scholarship based on Matric marks only. Some campuses have a placement test for English.',
    isOpenMerit: true,
    supplyPolicy: 'Annual exam system (BISE Lahore). Failed subjects: supplementary exam within 6 months. If failed again: repeat year. Maximum 3 chances per subject. Punjab College also offers internal retests for practice.',
    admissionProcess: '1. Visit nearest campus. 2. Submit Matric result card + CNIC/B-Form. 3. Pay admission fee PKR 5,000. 4. Choose program (FSc Pre-Med/Pre-Eng/ICS/ICOM/FA). 5. Attend orientation. Admissions open June-October.',
    scholarshipsOffered: 'Merit Scholarship: 85%+ Matric = 50% fee waiver, 90%+ = 75% waiver, 95%+ = 100% free. Need-based aid available for deserving students. Special discount for siblings.',
    admissionDates: 'Admissions open: June-October every year. Multiple campuses across Lahore. Walk-in admissions available.',
    examSystem: 'yearly',
  },
  {
    name: 'Government College Lahore',
    country: 'Pakistan', city: 'Lahore', type: 'college', sector: 'public',
    description: 'Historic government college (est. 1864). Offers intermediate (FSc/FA/ICS/ICOM) and BS programs. One of the most prestigious colleges in Punjab.',
    feeRange: 'PKR 5,000-15,000 per year (government subsidized). FSc: ~PKR 10,000/yr. FA: ~PKR 8,000/yr. ICS: ~PKR 10,000/yr. ICOM: ~PKR 8,000/yr. Extremely affordable.',
    closingMerit: 'FSc Pre-Medical: 85%+ Matric needed. FSc Pre-Engineering: 80%+ Matric. ICS: 75%+. ICOM: 70%+. FA: 65%+. Merit based on Matric marks.',
    entryTestDetails: 'No entry test. Admission purely on Matric marks. Merit list announced based on percentage. Walk-in admission during admission window.',
    isOpenMerit: false,
    supplyPolicy: 'Annual exam system (BISE Lahore). Failed subjects: supplementary within 6 months. If failed again: repeat year. Maximum 3 chances. Government college — strict attendance required (75% minimum).',
    admissionProcess: '1. Apply online at gc.edu.pk or visit campus. 2. Submit Matric result + CNIC. 3. Pay PKR 1,000 application fee. 4. Merit list announced. 5. If selected, pay fee and submit documents.',
    scholarshipsOffered: 'Government Merit Scholarship (free education for top 5%), Need-Based Financial Aid (full fee waiver for low-income), HEC Need-Based applicable, Punjab Honhaar Scholarship, Bait-ul-Maal.',
    admissionDates: 'Admissions open: June-August every year. Merit lists announced July-September. Walk-in during admission window.',
    examSystem: 'yearly',
  },
  {
    name: 'Forman Christian College (A Chartered University)',
    country: 'Pakistan', city: 'Lahore', type: 'college', sector: 'private',
    description: 'Historic Christian institution (est. 1864). Offers intermediate + BS programs. Known for liberal arts education and strong science programs.',
    feeRange: 'PKR 80,000-150,000 per year. FSc Pre-Medical: ~PKR 120,000/yr. FSc Pre-Engineering: ~PKR 110,000/yr. ICS: ~PKR 100,000/yr. ICOM: ~PKR 90,000/yr.',
    closingMerit: 'FSc Pre-Medical: 80%+ Matric. FSc Pre-Engineering: 75%+. ICS: 70%+. ICOM: 65%+. Also considers entrance test for competitive programs.',
    entryTestDetails: 'FC Entrance Test: 50 MCQs — English 20, Mathematics 15, General Knowledge 15. Duration: 1 hour. For competitive programs. Also accepts Matric marks for non-competitive programs.',
    isOpenMerit: false,
    supplyPolicy: 'Annual exam system (BISE Lahore). Failed subjects: supplementary within 6 months. If failed again: repeat year. Maximum 3 chances. Attendance 75% required.',
    admissionProcess: '1. Apply at fccollege.edu.pk/admissions. 2. Pay PKR 2,000 fee. 3. Submit Matric result + CNIC. 4. Appear for entrance test (if applicable). 5. Merit list. 6. Interview for some programs.',
    scholarshipsOffered: 'FC Merit Scholarship (50-100% for CGPA 3.5+ at intermediate), Need-Based Financial Aid, Minority community scholarships, HEC Need-Based, Punjab provincial scholarships.',
    admissionDates: 'Admissions open: May-August every year. Entry test (if applicable) in June. Fall starts September.',
    examSystem: 'yearly',
  },
  {
    name: 'KIPS College Lahore',
    country: 'Pakistan', city: 'Lahore', type: 'college', sector: 'private',
    description: 'Known for MDCAT/ECAT preparation alongside FSc. One of the best for medical and engineering entry test preparation. Multiple campuses.',
    feeRange: 'PKR 35,000-55,000 per year. FSc Pre-Medical (with MDCAT prep): ~PKR 50,000/yr. FSc Pre-Engineering (with ECAT prep): ~PKR 48,000/yr. ICS: ~PKR 40,000/yr.',
    closingMerit: 'Open admission for intermediate. For KIPS scholarship program: 90%+ in Matric required. Special batch for 95%+ students.',
    entryTestDetails: 'No entry test for regular admission. KIPS has its own scholarship test held separately — 100 MCQs (Math 30, Physics 25, Chemistry 25, English 20). Top performers get fee waivers.',
    isOpenMerit: true,
    supplyPolicy: 'Annual exam system (BISE Lahore). Failed subjects: supplementary within 6 months. KIPS also offers extra classes and retests for practice. Maximum 3 board attempts.',
    admissionProcess: '1. Visit nearest KIPS campus. 2. Submit Matric result + CNIC. 3. Pay admission fee. 4. Choose program. 5. Attend orientation. Admissions open May-September.',
    scholarshipsOffered: 'KIPS Merit Scholarship: 90%+ Matric = 50% waiver, 95%+ = 100% free. Need-based aid for deserving students. Sibling discount 10%.',
    admissionDates: 'Admissions open: May-September every year. Scholarship test held separately in June. Multiple campuses in Lahore.',
    examSystem: 'yearly',
  },
  // ===== SINDH =====
  {
    name: 'DJ Science College Karachi',
    country: 'Pakistan', city: 'Karachi', type: 'college', sector: 'public',
    description: 'Premier government science college in Sindh (est. 1854). Known for excellent FSc Pre-Medical and Pre-Engineering results. Historic institution.',
    feeRange: 'PKR 5,000-12,000 per year (government subsidized). FSc Pre-Medical: ~PKR 10,000/yr. FSc Pre-Engineering: ~PKR 10,000/yr. BSc programs: ~PKR 12,000/yr.',
    closingMerit: 'FSc Pre-Medical: 88%+ Matric (Sindh Board). FSc Pre-Engineering: 82%+. ICS: 75%+. ICOM: 70%+. Very competitive for Pre-Medical.',
    entryTestDetails: 'No entry test. Admission purely on Matric marks (Sindh Textbook Board / FBISE). Merit list based on percentage. Extremely competitive — limited seats.',
    isOpenMerit: false,
    supplyPolicy: 'Annual exam system (BISE Karachi). Failed subjects: supplementary within 6 months. If failed again: repeat year. Maximum 3 chances. Strict attendance 75% required.',
    admissionProcess: '1. Apply online at djs.edu.pk or visit campus. 2. Submit Matric result + domicile (Sindh required) + CNIC. 3. Pay PKR 1,000 fee. 4. Merit list announced. 5. Submit documents if selected.',
    scholarshipsOffered: 'Government Merit Scholarship (free for top 5%), Sindh CM Scholarship, Sindh Government Merit Scholarship, HEC Need-Based, Bait-ul-Maal.',
    admissionDates: 'Admissions open: June-August every year. Merit list announced July-September. Sindh domicile required.',
    examSystem: 'yearly',
  },
  {
    name: 'St. Joseph College Karachi',
    country: 'Pakistan', city: 'Karachi', type: 'college', sector: 'private',
    description: 'Historic Christian minority college (est. 1858). Known for discipline and quality education. Offers FSc, FA, ICS, ICOM programs.',
    feeRange: 'PKR 30,000-50,000 per year. FSc Pre-Medical: ~PKR 45,000/yr. FSc Pre-Engineering: ~PKR 42,000/yr. ICOM: ~PKR 35,000/yr.',
    closingMerit: 'FSc Pre-Medical: 80%+ Matric. FSc Pre-Engineering: 75%+. ICS: 70%+. ICOM/FA: 65%+. Minority students get relaxation of 5%.',
    entryTestDetails: 'No entry test. Admission on Matric marks. Interview may be conducted for some programs. Minority students welcome with relaxed criteria.',
    isOpenMerit: false,
    supplyPolicy: 'Annual exam system (BISE Karachi). Failed subjects: supplementary within 6 months. Maximum 3 chances. Strict discipline and attendance required.',
    admissionProcess: '1. Visit campus or apply online. 2. Submit Matric result + CNIC/B-Form. 3. Pay admission fee. 4. Merit list. 5. Interview (if required).',
    scholarshipsOffered: 'Minority community scholarships, Church-based financial aid, Merit Scholarship for 90%+ students, Need-Based Aid for deserving students.',
    admissionDates: 'Admissions open: June-August every year. Merit list announced July-September. Karachi.',
    examSystem: 'yearly',
  },
  // ===== KPK =====
  {
    name: 'Edwardes College Peshawar',
    country: 'Pakistan', city: 'Peshawar', type: 'college', sector: 'public',
    description: 'Historic government college in KPK (est. 1900). Offers intermediate and BS programs. Known for strong science and arts departments.',
    feeRange: 'PKR 5,000-10,000 per year (government subsidized). FSc: ~PKR 8,000/yr. FA: ~PKR 6,000/yr. ICS: ~PKR 8,000/yr. ICOM: ~PKR 6,000/yr.',
    closingMerit: 'FSc Pre-Medical: 82%+ Matric (KPK Board). FSc Pre-Engineering: 78%+. ICS: 72%+. ICOM/FA: 65%+. KPK domicile required for government seats.',
    entryTestDetails: 'No entry test for intermediate. Admission on Matric marks. KPK domicile required. Merit list based on percentage.',
    isOpenMerit: false,
    supplyPolicy: 'Annual exam system (BISE Peshawar). Failed subjects: supplementary within 6 months. Maximum 3 chances. Attendance 75% required.',
    admissionProcess: '1. Apply at edwardes.edu.pk or visit campus. 2. Submit Matric result + domicile (KPK) + CNIC. 3. Pay PKR 500 fee. 4. Merit list announced.',
    scholarshipsOffered: 'Government Merit Scholarship, KPK Education Scholarship, HEC Need-Based, Bait-ul-Maal, Provincial need-based aid.',
    admissionDates: 'Admissions open: June-August every year. KPK domicile required. Peshawar.',
    examSystem: 'yearly',
  },
  // ===== ISLAMABAD =====
  {
    name: 'Government Gordon College Rawalpindi',
    country: 'Pakistan', city: 'Rawalpindi', type: 'college', sector: 'public',
    description: 'Historic government college (est. 1869). Offers intermediate + BS programs. One of the oldest colleges in Punjab/Rawalpindi.',
    feeRange: 'PKR 5,000-12,000 per year (government). FSc Pre-Medical: ~PKR 10,000/yr. FSc Pre-Engineering: ~PKR 10,000/yr. FA/ICS/ICOM: ~PKR 8,000/yr.',
    closingMerit: 'FSc Pre-Medical: 85%+ Matric. FSc Pre-Engineering: 80%+. ICS: 75%+. ICOM/FA: 70%. Punjab domicile required.',
    entryTestDetails: 'No entry test. Admission purely on Matric marks. Merit list based on percentage. Walk-in during admission window.',
    isOpenMerit: false,
    supplyPolicy: 'Annual exam system (BISE Rawalpindi). Failed subjects: supplementary within 6 months. Maximum 3 chances. Attendance 75% required.',
    admissionProcess: '1. Visit campus. 2. Submit Matric result + domicile + CNIC. 3. Pay PKR 1,000 fee. 4. Merit list. 5. Submit documents.',
    scholarshipsOffered: 'Government Merit Scholarship (free for top 5%), Need-Based Financial Aid, HEC Need-Based, PEEF for Punjab students, Bait-ul-Maal.',
    admissionDates: 'Admissions open: June-August every year. Merit lists July-September. Rawalpindi.',
    examSystem: 'yearly',
  },
  {
    name: 'F.G. Sir Syed College Islamabad',
    country: 'Pakistan', city: 'Islamabad', type: 'college', sector: 'public',
    description: 'Federal government college in Islamabad. Offers FSc, FA, ICS, ICOM. Popular among federal government employees children.',
    feeRange: 'PKR 5,000-10,000 per year (federal government). FSc: ~PKR 8,000/yr. FA/ICOM: ~PKR 6,000/yr. Very affordable.',
    closingMerit: 'FSc Pre-Medical: 85%+ Matric. FSc Pre-Engineering: 80%+. ICS: 75%+. ICOM/FA: 70%. Federal government employees children get priority.',
    entryTestDetails: 'No entry test. Admission on Matric marks. Priority for federal government employees children. Merit list based on percentage.',
    isOpenMerit: false,
    supplyPolicy: 'Annual exam system (FBISE). Failed subjects: supplementary within 6 months. Maximum 3 chances. Attendance 75% required.',
    admissionProcess: '1. Apply online at fgcr.edu.pk or visit campus. 2. Submit Matric result + CNIC. 3. Pay PKR 500 fee. 4. Merit list. 5. Submit documents.',
    scholarshipsOffered: 'Federal Government Merit Scholarship, Need-Based Aid, HEC Need-Based, Bait-ul-Maal, Federal employee children discount.',
    admissionDates: 'Admissions open: June-August every year. Priority for federal government employees children. Islamabad.',
    examSystem: 'yearly',
  },
  {
    name: 'Beaconhouse College Program (BCP)',
    country: 'Pakistan', city: 'Lahore', type: 'college', sector: 'private',
    description: 'Premium private college by Beaconhouse Group. Offers Cambridge A-Levels and FSc. Known for modern facilities and international standard education.',
    feeRange: 'PKR 150,000-250,000 per year. A-Levels: ~PKR 220,000/yr. FSc Pre-Medical: ~PKR 180,000/yr. FSc Pre-Engineering: ~PKR 170,000/yr. Most expensive college option.',
    closingMerit: 'A-Levels: O-Level minimum 5 A*s-A grades. FSc: 80%+ Matric. Entry test required for A-Levels. Interview mandatory.',
    entryTestDetails: 'BCP Entry Test: 60 MCQs — English 20, Mathematics 20, Analytical 20. Duration: 1.5 hours. For A-Levels. Interview with parents also required.',
    isOpenMerit: false,
    supplyPolicy: 'A-Levels: Cambridge system — retake individual papers. FSc: Annual system (BISE) — supplementary within 6 months. Maximum 3 chances.',
    admissionProcess: '1. Apply at bcp.edu.pk. 2. Pay PKR 5,000 application fee. 3. Appear for entry test. 4. Interview with student + parents. 5. Offer letter. 6. Pay admission fee.',
    scholarshipsOffered: 'BCP Merit Scholarship (25-50% for exceptional O-Level/Matric results), Beaconhouse staff children discount (50%), Need-Based Aid (limited).',
    admissionDates: 'A-Levels admissions: March-June. FSc admissions: May-August. Entry test and interview required. Lahore.',
    examSystem: 'mixed',
  },
];

async function main() {
  console.log('=== Seeding Colleges with AI Knowledge ===\n');

  let created = 0;
  for (const c of colleges) {
    // Check if college already exists
    const existing = await p.university.findFirst({
      where: { name: c.name, country: c.country },
    });

    if (existing) {
      // Update existing
      await p.university.update({
        where: { id: existing.id },
        data: {
          type: 'college',
          sector: c.sector,
          description: c.description,
          feeRange: c.feeRange,
          closingMerit: c.closingMerit,
          entryTestDetails: c.entryTestDetails,
          isOpenMerit: c.isOpenMerit,
          supplyPolicy: c.supplyPolicy,
          admissionProcess: c.admissionProcess,
          scholarshipsOffered: c.scholarshipsOffered,
          admissionDates: c.admissionDates,
          examSystem: c.examSystem,
        },
      });
      console.log(`  🔄 Updated: ${c.name}`);
    } else {
      // Create new
      await p.university.create({
        data: {
          name: c.name,
          country: c.country,
          city: c.city,
          type: 'college',
          sector: c.sector,
          description: c.description,
          feeRange: c.feeRange,
          closingMerit: c.closingMerit,
          entryTestDetails: c.entryTestDetails,
          isOpenMerit: c.isOpenMerit,
          supplyPolicy: c.supplyPolicy,
          admissionProcess: c.admissionProcess,
          scholarshipsOffered: c.scholarshipsOffered,
          admissionDates: c.admissionDates,
          examSystem: c.examSystem,
        },
      });
      console.log(`  ✅ Created: ${c.name}`);
    }
    created++;
  }

  const totalColleges = await p.university.count({ where: { type: 'college' } });
  const withKnowledge = await p.university.count({
    where: { type: 'college', closingMerit: { not: null } },
  });
  console.log(`\n=== DONE: ${created} colleges processed ===`);
  console.log(`Total colleges in DB: ${totalColleges}`);
  console.log(`Colleges with knowledge fields: ${withKnowledge}`);

  await p.$disconnect();
}

main();
