import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const now = new Date();
const recent = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
const futureDeadline1 = new Date(now.getFullYear() + 1, 2, 1);
const futureDeadline2 = new Date(now.getFullYear() + 1, 0, 31);
const futureDeadline3 = new Date(now.getFullYear() + 1, 5, 30);
const futureDeadline4 = new Date(now.getFullYear() + 1, 9, 15);

// ── Countries ────────────────────────────────────────────────────────────────

const countries = [
  { id: 'country-001', name: 'Pakistan', code: 'PK', continent: 'Asia', visaRequired: false, costOfLiving: 400, safetyIndex: 55, educationSystem: 'Higher Education Commission (HEC) system with HSSC and bachelor\'s degree structure', sourceUrl: 'https://www.hec.gov.pk' },
  { id: 'country-002', name: 'Germany', code: 'DE', continent: 'Europe', visaRequired: true, costOfLiving: 950, safetyIndex: 82, educationSystem: 'Bologna Process with Bachelor/Master structure; tuition-free at public universities', sourceUrl: 'https://www.daad.de' },
  { id: 'country-003', name: 'United States', code: 'US', continent: 'North America', visaRequired: true, costOfLiving: 1500, safetyIndex: 70, educationSystem: 'Credit-based system with associate, bachelor\'s, master\'s, and doctoral degrees', sourceUrl: 'https://educationusa.state.gov' },
  { id: 'country-004', name: 'United Kingdom', code: 'GB', continent: 'Europe', visaRequired: true, costOfLiving: 1300, safetyIndex: 75, educationSystem: 'England/Wales system with A-levels, bachelor\'s (3 years), master\'s (1 year)', sourceUrl: 'https://www.gov.uk/browse/visas-immigration' },
  { id: 'country-005', name: 'Canada', code: 'CA', continent: 'North America', visaRequired: true, costOfLiving: 1200, safetyIndex: 85, educationSystem: 'Provincial education system with bachelor\'s, master\'s, and doctoral degrees', sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship.html' },
  { id: 'country-006', name: 'Australia', code: 'AU', continent: 'Oceania', visaRequired: true, costOfLiving: 1400, safetyIndex: 80, educationSystem: 'Australian Qualifications Framework (AQF) with levels from certificate to doctoral', sourceUrl: 'https://www.studyaustralia.gov.au' },
  { id: 'country-007', name: 'Turkey', code: 'TR', continent: 'Asia', visaRequired: true, costOfLiving: 600, safetyIndex: 60, educationSystem: '4-year bachelor\'s, 2-year master\'s, 4-year doctoral structure regulated by YÖK', sourceUrl: 'https://www.yok.gov.tr' },
  { id: 'country-008', name: 'Malaysia', code: 'MY', continent: 'Asia', visaRequired: true, costOfLiving: 700, safetyIndex: 72, educationSystem: 'Malaysian Qualifications Framework (MQF) with diploma, bachelor\'s, master\'s, and PhD', sourceUrl: 'https://www.mohe.gov.my' },
];

// ── Universities ─────────────────────────────────────────────────────────────

const universities = [
  { id: 'uni-001', name: 'Lahore University of Management Sciences (LUMS)', country: 'Pakistan', city: 'Lahore', website: 'https://www.lums.edu.pk', foundedYear: 1984, type: 'private', sourceUrl: 'https://www.lums.edu.pk', sourceName: 'LUMS', verificationStatus: 'verified' },
  { id: 'uni-002', name: 'National University of Sciences and Technology (NUST)', country: 'Pakistan', city: 'Islamabad', website: 'https://www.nust.edu.pk', foundedYear: 1991, type: 'public', sourceUrl: 'https://www.nust.edu.pk', sourceName: 'NUST', verificationStatus: 'verified' },
  { id: 'uni-003', name: 'Pakistan Institute of Engineering and Applied Sciences (PIEAS)', country: 'Pakistan', city: 'Islamabad', website: 'https://www.pieas.edu.pk', foundedYear: 1967, type: 'public', sourceUrl: 'https://www.pieas.edu.pk', sourceName: 'PIEAS', verificationStatus: 'verified' },
  { id: 'uni-004', name: 'University of the Punjab', country: 'Pakistan', city: 'Lahore', website: 'https://www.pu.edu.pk', foundedYear: 1882, type: 'public', sourceUrl: 'https://www.pu.edu.pk', sourceName: 'University of the Punjab', verificationStatus: 'verified' },
  { id: 'uni-005', name: 'Technical University of Munich (TU Munich)', country: 'Germany', city: 'Munich', website: 'https://www.tum.de', foundedYear: 1868, type: 'public', sourceUrl: 'https://www.tum.de', sourceName: 'TU Munich', verificationStatus: 'verified' },
  { id: 'uni-006', name: 'RWTH Aachen University', country: 'Germany', city: 'Aachen', website: 'https://www.rwth-aachen.de', foundedYear: 1870, type: 'public', sourceUrl: 'https://www.rwth-aachen.de', sourceName: 'RWTH Aachen', verificationStatus: 'verified' },
  { id: 'uni-007', name: 'Massachusetts Institute of Technology (MIT)', country: 'United States', city: 'Cambridge', website: 'https://www.mit.edu', foundedYear: 1861, type: 'public', sourceUrl: 'https://www.mit.edu', sourceName: 'MIT', verificationStatus: 'verified' },
  { id: 'uni-008', name: 'Stanford University', country: 'United States', city: 'Stanford', website: 'https://www.stanford.edu', foundedYear: 1885, type: 'private', sourceUrl: 'https://www.stanford.edu', sourceName: 'Stanford University', verificationStatus: 'verified' },
  { id: 'uni-009', name: 'University of Oxford', country: 'United Kingdom', city: 'Oxford', website: 'https://www.ox.ac.uk', foundedYear: 1096, type: 'public', sourceUrl: 'https://www.ox.ac.uk', sourceName: 'University of Oxford', verificationStatus: 'verified' },
  { id: 'uni-010', name: 'University of Cambridge', country: 'United Kingdom', city: 'Cambridge', website: 'https://www.cam.ac.uk', foundedYear: 1209, type: 'public', sourceUrl: 'https://www.cam.ac.uk', sourceName: 'University of Cambridge', verificationStatus: 'verified' },
  { id: 'uni-011', name: 'University of Toronto', country: 'Canada', city: 'Toronto', website: 'https://www.utoronto.ca', foundedYear: 1827, type: 'public', sourceUrl: 'https://www.utoronto.ca', sourceName: 'University of Toronto', verificationStatus: 'verified' },
  { id: 'uni-012', name: 'University of Melbourne', country: 'Australia', city: 'Melbourne', website: 'https://www.unimelb.edu.au', foundedYear: 1853, type: 'public', sourceUrl: 'https://www.unimelb.edu.au', sourceName: 'University of Melbourne', verificationStatus: 'verified' },
];

// ── Courses ──────────────────────────────────────────────────────────────────

const courses = [
  // LUMS (Pakistan)
  { id: 'course-001', universityId: 'uni-001', name: 'BS Computer Science', degree: 'bachelor', duration: '4 years', language: 'English', tuitionFee: null, currency: null, description: 'Comprehensive computer science program covering algorithms, data structures, AI, and software engineering with a strong research focus.', sourceUrl: 'https://www.lums.edu.pk/cs' },
  { id: 'course-002', universityId: 'uni-001', name: 'MBA', degree: 'master', duration: '2 years', language: 'English', tuitionFee: 8500000, currency: 'PKR', description: 'Flagship MBA program with specializations in finance, marketing, and strategy. Strong industry connections and alumni network.', sourceUrl: 'https://www.lums.edu.pk/sbm' },
  // NUST (Pakistan)
  { id: 'course-003', universityId: 'uni-002', name: 'BS Computer Engineering', degree: 'bachelor', duration: '4 years', language: 'English', tuitionFee: 1200000, currency: 'PKR', description: 'Engineering-focused program combining computer science and electrical engineering. Emphasis on hardware-software integration.', sourceUrl: 'https://www.nust.edu.pk/ce' },
  // PIEAS (Pakistan)
  { id: 'course-004', universityId: 'uni-003', name: 'BS Electrical Engineering', degree: 'bachelor', duration: '4 years', language: 'English', tuitionFee: null, currency: null, description: 'Specialized electrical engineering program with focus on nuclear engineering, electronics, and power systems.', sourceUrl: 'https://www.pieas.edu.pk/ee' },
  // University of Punjab (Pakistan)
  { id: 'course-005', universityId: 'uni-004', name: 'LLB (Hons)', degree: 'bachelor', duration: '5 years', language: 'English', tuitionFee: null, currency: null, description: 'Five-year integrated law program covering constitutional law, criminal law, corporate law, and international law.', sourceUrl: 'https://www.pu.edu.pk/law' },
  // TU Munich (Germany)
  { id: 'course-006', universityId: 'uni-005', name: 'MSc Informatics', degree: 'master', duration: '2 years', language: 'German', tuitionFee: 150, currency: 'EUR', description: 'World-class informatics program covering algorithms, systems, AI, and computational engineering. Taught in German with some English courses.', sourceUrl: 'https://www.tum.de/informatics' },
  { id: 'course-007', universityId: 'uni-005', name: 'MSc Data Engineering and Analytics', degree: 'master', duration: '2 years', language: 'English', tuitionFee: 150, currency: 'EUR', description: 'Interdisciplinary program combining data science, machine learning, and big data engineering with practical industry projects.', sourceUrl: 'https://www.tum.de/data' },
  // RWTH Aachen (Germany)
  { id: 'course-008', universityId: 'uni-006', name: 'MSc Mechanical Engineering', degree: 'master', duration: '2 years', language: 'German', tuitionFee: 280, currency: 'EUR', description: 'Research-oriented mechanical engineering program with specializations in automotive, aerospace, and energy systems.', sourceUrl: 'https://www.rwth-aachen.de/me' },
  // MIT (USA)
  { id: 'course-009', universityId: 'uni-007', name: 'SB Computer Science', degree: 'bachelor', duration: '4 years', language: 'English', tuitionFee: 57986, currency: 'USD', description: 'Renowned computer science program with 6-14 concentration options. Emphasis on theory, systems, and AI.', sourceUrl: 'https://www.eecs.mit.edu' },
  { id: 'course-010', universityId: 'uni-007', name: 'MEng Electrical Engineering and Computer Science', degree: 'master', duration: '1 year', language: 'English', tuitionFee: 59750, currency: 'USD', description: 'Accelerated master\'s program combining advanced coursework with a capstone project. Highly competitive admission.', sourceUrl: 'https://www.eecs.mit.edu/meng' },
  // Stanford (USA)
  { id: 'course-011', universityId: 'uni-008', name: 'MS Computer Science', degree: 'master', duration: '2 years', language: 'English', tuitionFee: 58300, currency: 'USD', description: 'Premier CS master\'s program with world-class faculty. Strong ties to Silicon Valley and cutting-edge research labs.', sourceUrl: 'https://cs.stanford.edu' },
  { id: 'course-012', universityId: 'uni-008', name: 'MS Data Science', degree: 'master', duration: '2 years', language: 'English', tuitionFee: 58300, currency: 'USD', description: 'Interdisciplinary data science program covering statistics, machine learning, and domain applications.', sourceUrl: 'https://datascience.stanford.edu' },
  // Oxford (UK)
  { id: 'course-013', universityId: 'uni-009', name: 'BA Computer Science', degree: 'bachelor', duration: '3 years', language: 'English', tuitionFee: 38010, currency: 'GBP', description: 'Rigorous computer science program covering functional programming, algorithms, logic, and concurrency. Tutorial-based learning.', sourceUrl: 'https://www.cs.ox.ac.uk' },
  { id: 'course-014', universityId: 'uni-009', name: 'MSc Law', degree: 'master', duration: '1 year', language: 'English', tuitionFee: 34000, currency: 'GBP', description: 'One-year graduate law program for non-law graduates. Covers legal theory, jurisprudence, and comparative law.', sourceUrl: 'https://www.law.ox.ac.uk' },
  // Cambridge (UK)
  { id: 'course-015', universityId: 'uni-010', name: 'BA Engineering', degree: 'bachelor', duration: '4 years', language: 'English', tuitionFee: 39168, currency: 'GBP', description: 'Comprehensive engineering tripos covering mechanical, electrical, and information engineering with hands-on projects.', sourceUrl: 'https://www.eng.cam.ac.uk' },
  // University of Toronto (Canada)
  { id: 'course-016', universityId: 'uni-011', name: 'BSc Computer Science', degree: 'bachelor', duration: '4 years', language: 'English', tuitionFee: 58680, currency: 'CAD', description: 'Top-ranked Canadian CS program with strong research groups in AI, systems, and theory. Co-op available.', sourceUrl: 'https://web.cs.toronto.edu' },
  { id: 'course-017', universityId: 'uni-011', name: 'MBA (Rotman)', degree: 'master', duration: '2 years', language: 'English', tuitionFee: 68530, currency: 'CAD', description: 'Innovative MBA program emphasizing integrative thinking. Strong finance and entrepreneurship tracks.', sourceUrl: 'https://www.rotman.utoronto.ca' },
  // University of Melbourne (Australia)
  { id: 'course-018', universityId: 'uni-012', name: 'Master of Data Science', degree: 'master', duration: '2 years', language: 'English', tuitionFee: 48000, currency: 'AUD', description: 'Professional data science program covering statistical modeling, machine learning, and data engineering.', sourceUrl: 'https://study.unimelb.edu.au' },
  { id: 'course-019', universityId: 'uni-012', name: 'Bachelor of Medicine', degree: 'bachelor', duration: '5 years', language: 'English', tuitionFee: 55000, currency: 'AUD', description: 'Clinical medicine program with early patient contact and rural placements. Accredited by the Australian Medical Council.', sourceUrl: 'https://medicine.unimelb.edu.au' },
  // LUMS additional
  { id: 'course-020', universityId: 'uni-001', name: 'BS Economics', degree: 'bachelor', duration: '4 years', language: 'English', tuitionFee: null, currency: null, description: 'Rigorous economics program combining theoretical foundations with empirical methods and policy analysis.', sourceUrl: 'https://www.lums.edu.pk/economics' },
];

// ── Scholarships ─────────────────────────────────────────────────────────────

const scholarships = [
  {
    id: 'scholarship-001',
    name: 'HEC Need-Based Scholarship',
    provider: 'Higher Education Commission (HEC)',
    country: 'Pakistan',
    amount: null,
    currency: null,
    deadline: futureDeadline1,
    description: 'Pakistan\'s largest need-based scholarship program providing full tuition, living stipend, and book allowance to financially deserving students at HEC-recognized institutions across Pakistan.',
    eligibilityCriteria: 'Pakistani nationals with household income below PKR 45,000/month; admission to an HEC-recognized university; minimum 60% in HSSC or equivalent.',
    sourceUrl: 'https://www.hec.gov.pk/Scholarships/Pages/Need-Based.aspx',
    sourceName: 'HEC Pakistan',
    verificationStatus: 'verified',
  },
  {
    id: 'scholarship-002',
    name: 'HEC Overseas Scholarship for MS/MPhil leading to PhD',
    provider: 'Higher Education Commission (HEC)',
    country: 'Pakistan',
    amount: null,
    currency: null,
    deadline: futureDeadline3,
    description: 'Fully funded scholarship for Pakistani students to pursue MS/MPhil leading to PhD at top-ranked international universities. Covers tuition, living, and travel expenses.',
    eligibilityCriteria: 'Pakistani/AJK nationals; minimum CGPA 3.0/4.0 in MS/MPhil; GRE/GMAT scores as required; maximum age 40 years; HEC attested degree.',
    sourceUrl: 'https://www.hec.gov.pk/Scholarships/Pages/Overseas.aspx',
    sourceName: 'HEC Pakistan',
    verificationStatus: 'verified',
  },
  {
    id: 'scholarship-003',
    name: 'DAAD Scholarship for Study in Germany',
    provider: 'German Academic Exchange Service (DAAD)',
    country: 'Germany',
    amount: 934,
    currency: 'EUR',
    deadline: futureDeadline4,
    description: 'Germany\'s largest academic exchange program offering monthly stipends, tuition waivers, and travel allowances for international students at German universities.',
    eligibilityCriteria: 'Bachelor\'s degree (completed within last 6 years); proficiency in German (TestDaF) or English (IELTS/TOEFL); strong academic record.',
    sourceUrl: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/',
    sourceName: 'DAAD',
    verificationStatus: 'verified',
  },
  {
    id: 'scholarship-004',
    name: 'Fulbright Foreign Student Program',
    provider: 'U.S. Department of State',
    country: 'United States',
    amount: null,
    currency: 'USD',
    deadline: futureDeadline2,
    description: 'Premier U.S. government-funded scholarship for international graduate students. Covers full tuition, living stipend, airfare, and health insurance for study at American universities.',
    eligibilityCriteria: 'Bachelor\'s degree; minimum 3 years of work experience (preferred); strong English proficiency (TOEFL/IELTS); demonstrated leadership and community engagement.',
    sourceUrl: 'https://foreign.fulbrightonline.org',
    sourceName: 'Fulbright Program',
    verificationStatus: 'verified',
  },
  {
    id: 'scholarship-005',
    name: 'Chevening Scholarship',
    provider: 'UK Government (FCDO)',
    country: 'United Kingdom',
    amount: null,
    currency: 'GBP',
    deadline: futureDeadline2,
    description: 'UK government\'s global scholarship programme offering fully funded one-year master\'s degrees at any UK university. Includes tuition, monthly living allowance, and travel costs.',
    eligibilityCriteria: 'Citizen of a Chevening-eligible country; minimum 2 years of work experience; unconditional UK university offer; IELTS score of 6.5 or above.',
    sourceUrl: 'https://www.chevening.org',
    sourceName: 'Chevening',
    verificationStatus: 'verified',
  },
  {
    id: 'scholarship-006',
    name: 'Australia Awards Scholarships',
    provider: 'Australian Government (DFAT)',
    country: 'Australia',
    amount: null,
    currency: 'AUD',
    deadline: futureDeadline4,
    description: 'Long-term development-focused scholarships for students from developing countries to study at Australian universities. Covers full tuition, living allowance, and airfare.',
    eligibilityCriteria: 'Citizen of an eligible developing country; minimum 2 years of work experience; meet English language requirements; not a current employee of the Australian Government.',
    sourceUrl: 'https://www.dfat.gov.au/people-to-people/australia-awards',
    sourceName: 'Australia Awards',
    verificationStatus: 'verified',
  },
  {
    id: 'scholarship-007',
    name: 'Türkiye Bursları (Turkey Scholarships)',
    provider: 'Republic of Turkey',
    country: 'Turkey',
    amount: null,
    currency: 'TRY',
    deadline: futureDeadline3,
    description: 'Comprehensive government scholarship program for international students at all degree levels in Turkey. Includes tuition, accommodation, stipend, and Turkish language training.',
    eligibilityCriteria: 'Under 21 for bachelor\'s, under 30 for master\'s, under 35 for PhD; minimum 75% academic average; not a Turkish citizen; healthy.',
    sourceUrl: 'https://www.turkiyeburslari.gov.tr',
    sourceName: 'Türkiye Bursları',
    verificationStatus: 'verified',
  },
  {
    id: 'scholarship-008',
    name: 'Malaysian Technical Cooperation Programme (MTCP) Scholarship',
    provider: 'Government of Malaysia',
    country: 'Malaysia',
    amount: null,
    currency: 'MYR',
    deadline: futureDeadline1,
    description: 'Partially funded scholarship for postgraduate studies in Malaysia. Covers tuition fees and provides a monthly living allowance.',
    eligibilityCriteria: 'Maximum age 45; bachelor\'s degree with minimum CGPA 3.0; proficient in English (IELTS 6.0 or TOEFL 550); letter of acceptance from a Malaysian university.',
    sourceUrl: 'https://www.motec.gov.my',
    sourceName: 'MTCP',
    verificationStatus: 'verified',
  },
  {
    id: 'scholarship-009',
    name: 'Erasmus Mundus Joint Master Degree',
    provider: 'European Union (Erasmus+)',
    country: 'Germany',
    amount: 1400,
    currency: 'EUR',
    deadline: futureDeadline4,
    description: 'EU-funded scholarships for international students to pursue joint master\'s programs at consortiums of European universities. Includes tuition, monthly allowance, and travel costs.',
    eligibilityCriteria: 'Bachelor\'s degree; English proficiency (IELTS 6.5 or TOEFL 90); meet specific program requirements; not have previously received an Erasmus Mundus scholarship.',
    sourceUrl: 'https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/studying-abroad',
    sourceName: 'European Commission',
    verificationStatus: 'verified',
  },
  {
    id: 'scholarship-010',
    name: 'Commonwealth Scholarship',
    provider: 'Commonwealth Scholarship Commission (CSC)',
    country: 'United Kingdom',
    amount: null,
    currency: 'GBP',
    deadline: futureDeadline3,
    description: 'UK-funded scholarship for students from Commonwealth countries to pursue master\'s and PhD degrees at UK universities. Covers tuition, living, and travel expenses.',
    eligibilityCriteria: 'Citizen of a Commonwealth country; minimum 2 years of work experience (for master\'s); meet English language requirements; demonstrate development impact potential.',
    sourceUrl: 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-phd-scholarships',
    sourceName: 'Commonwealth Scholarship Commission',
    verificationStatus: 'verified',
  },
];

// ── Scholarship Requirements ─────────────────────────────────────────────────

const scholarshipRequirements = [
  // HEC Need-Based
  { id: 'sr-001', scholarshipId: 'scholarship-001', requirementType: 'nationality', requirementValue: 'Pakistan', isRequired: true },
  { id: 'sr-002', scholarshipId: 'scholarship-001', requirementType: 'degree_level', requirementValue: 'bachelor', isRequired: true },
  { id: 'sr-003', scholarshipId: 'scholarship-001', requirementType: 'minimum_grade', requirementValue: '60% in HSSC or equivalent', isRequired: true },
  // HEC Overseas
  { id: 'sr-004', scholarshipId: 'scholarship-002', requirementType: 'nationality', requirementValue: 'Pakistan', isRequired: true },
  { id: 'sr-005', scholarshipId: 'scholarship-002', requirementType: 'degree_level', requirementValue: 'master', isRequired: true },
  { id: 'sr-006', scholarshipId: 'scholarship-002', requirementType: 'minimum_grade', requirementValue: 'CGPA 3.0/4.0 in MS/MPhil', isRequired: true },
  { id: 'sr-007', scholarshipId: 'scholarship-002', requirementType: 'language_requirement', requirementValue: 'GRE General (quantitative: 155+)', isRequired: true },
  // DAAD
  { id: 'sr-008', scholarshipId: 'scholarship-003', requirementType: 'degree_level', requirementValue: 'master', isRequired: true },
  { id: 'sr-009', scholarshipId: 'scholarship-003', requirementType: 'language_requirement', requirementValue: 'TestDaF 4 or IELTS 6.0+', isRequired: true },
  { id: 'sr-010', scholarshipId: 'scholarship-003', requirementType: 'field', requirementValue: 'Engineering, Natural Sciences, Humanities, Social Sciences', isRequired: false },
  // Fulbright
  { id: 'sr-011', scholarshipId: 'scholarship-004', requirementType: 'degree_level', requirementValue: 'master', isRequired: true },
  { id: 'sr-012', scholarshipId: 'scholarship-004', requirementType: 'language_requirement', requirementValue: 'TOEFL 80+ or IELTS 6.5+', isRequired: true },
  // Chevening
  { id: 'sr-013', scholarshipId: 'scholarship-005', requirementType: 'degree_level', requirementValue: 'master', isRequired: true },
  { id: 'sr-014', scholarshipId: 'scholarship-005', requirementType: 'language_requirement', requirementValue: 'IELTS 6.5 overall (minimum 6.0 per component)', isRequired: true },
  { id: 'sr-015', scholarshipId: 'scholarship-005', requirementType: 'minimum_grade', requirementValue: 'Unconditional UK university offer letter', isRequired: true },
  // Australia Awards
  { id: 'sr-016', scholarshipId: 'scholarship-006', requirementType: 'nationality', requirementValue: 'Eligible developing country', isRequired: true },
  { id: 'sr-017', scholarshipId: 'scholarship-006', requirementType: 'degree_level', requirementValue: 'master', isRequired: true },
  { id: 'sr-018', scholarshipId: 'scholarship-006', requirementType: 'language_requirement', requirementValue: 'IELTS 6.5 or TOEFL 79+', isRequired: true },
  // Türkiye Bursları
  { id: 'sr-019', scholarshipId: 'scholarship-007', requirementType: 'degree_level', requirementValue: 'bachelor, master, or PhD', isRequired: true },
  { id: 'sr-020', scholarshipId: 'scholarship-007', requirementType: 'minimum_grade', requirementValue: '75% academic average', isRequired: true },
  // MTCP
  { id: 'sr-021', scholarshipId: 'scholarship-008', requirementType: 'nationality', requirementValue: 'MTCP participating country', isRequired: true },
  { id: 'sr-022', scholarshipId: 'scholarship-008', requirementType: 'degree_level', requirementValue: 'master', isRequired: true },
  { id: 'sr-023', scholarshipId: 'scholarship-008', requirementType: 'minimum_grade', requirementValue: 'CGPA 3.0/4.0', isRequired: true },
  // Erasmus Mundus
  { id: 'sr-024', scholarshipId: 'scholarship-009', requirementType: 'degree_level', requirementValue: 'master', isRequired: true },
  { id: 'sr-025', scholarshipId: 'scholarship-009', requirementType: 'language_requirement', requirementValue: 'IELTS 6.5 or TOEFL 90+', isRequired: true },
  // Commonwealth
  { id: 'sr-026', scholarshipId: 'scholarship-010', requirementType: 'nationality', requirementValue: 'Commonwealth country', isRequired: true },
  { id: 'sr-027', scholarshipId: 'scholarship-010', requirementType: 'degree_level', requirementValue: 'master or PhD', isRequired: true },
  { id: 'sr-028', scholarshipId: 'scholarship-010', requirementType: 'minimum_grade', requirementValue: 'Upper second-class honors or equivalent', isRequired: true },
];

// ── Career Paths ─────────────────────────────────────────────────────────────

const careerPaths = [
  {
    id: 'career-001',
    title: 'Software Engineer',
    slug: 'software-engineer',
    field: 'Computer Science',
    description: 'Design, develop, and maintain software systems. Work across the full stack from frontend interfaces to backend services and databases. Collaborate with cross-functional teams to deliver scalable, high-quality software products.',
    skills: '["JavaScript", "TypeScript", "Python", "Java", "React", "Node.js", "SQL", "Git", "System Design", "Problem Solving"]',
    entryRoles: '["Junior Software Engineer", "Software Development Engineer (SDE I)", "Frontend Developer", "Backend Developer"]',
    furtherStudy: '["MS Computer Science", "MS Software Engineering", "Cloud Architecture Certification", "System Design Mastery"]',
    certifications: 'AWS Certified Solutions Architect, Google Cloud Professional, Certified Kubernetes Administrator',
    sourceUrl: 'https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm',
    verificationStatus: 'verified',
  },
  {
    id: 'career-002',
    title: 'Data Scientist',
    slug: 'data-scientist',
    field: 'Data Science',
    description: 'Extract actionable insights from complex datasets using statistical analysis, machine learning, and data visualization. Partner with business stakeholders to solve problems and drive data-informed decision-making.',
    skills: '["Python", "R", "SQL", "Machine Learning", "Statistics", "Pandas", "TensorFlow", "Data Visualization", "NLP", "Big Data"]',
    entryRoles: '["Junior Data Scientist", "Data Analyst", "Machine Learning Engineer (Junior)", "Business Intelligence Analyst"]',
    furtherStudy: '["MS Data Science", "MS Statistics", "PhD in Machine Learning", "Specialization in NLP or Computer Vision"]',
    certifications: 'Google Data Analytics, IBM Data Science Professional, AWS Machine Learning Specialty',
    sourceUrl: 'https://www.bls.gov/ooh/math/data-scientists.htm',
    verificationStatus: 'verified',
  },
  {
    id: 'career-003',
    title: 'AI/ML Engineer',
    slug: 'ai-ml-engineer',
    field: 'Computer Science',
    description: 'Build and deploy artificial intelligence and machine learning models at scale. Design ML pipelines, optimize model performance, and bridge the gap between research and production systems.',
    skills: '["Python", "TensorFlow", "PyTorch", "Deep Learning", "Computer Vision", "NLP", "MLOps", "Docker", "Kubernetes", "Mathematics"]',
    entryRoles: '["Junior ML Engineer", "AI Research Assistant", "ML Ops Engineer", "Data Engineer (ML focus)"]',
    furtherStudy: '["MS/PhD in AI or Machine Learning", "Specialization in LLMs", "Robotics Engineering", "MLOps Certification"]',
    certifications: 'Google Professional ML Engineer, AWS ML Specialty, NVIDIA Deep Learning Institute',
    sourceUrl: 'https://www.bls.gov/ooh/computer-and-information-technology/',
    verificationStatus: 'verified',
  },
  {
    id: 'career-004',
    title: 'Cybersecurity Analyst',
    slug: 'cybersecurity-analyst',
    field: 'Computer Science',
    description: 'Protect organizational systems and networks from cyber threats. Monitor security events, investigate incidents, implement security controls, and conduct vulnerability assessments to safeguard digital assets.',
    skills: '["Network Security", "Penetration Testing", "SIEM", "Linux", "Python", "Incident Response", "Cryptography", "Firewalls", "Risk Assessment", "Compliance"]',
    entryRoles: '["Security Analyst (Junior)", "SOC Analyst (Tier 1)", "IT Security Specialist", "Vulnerability Analyst"]',
    furtherStudy: '["MS Cybersecurity", "CISSP Certification", "Ethical Hacking Specialization", "Digital Forensics"]',
    certifications: 'CompTIA Security+, CEH, CISSP, OSCP, GIAC',
    sourceUrl: 'https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm',
    verificationStatus: 'verified',
  },
  {
    id: 'career-005',
    title: 'Web Developer',
    slug: 'web-developer',
    field: 'Computer Science',
    description: 'Build and maintain websites and web applications. Create responsive, accessible, and performant user interfaces using modern frontend frameworks and backend technologies.',
    skills: '["HTML", "CSS", "JavaScript", "React", "Vue.js", "Node.js", "REST APIs", "GraphQL", "Responsive Design", "Web Accessibility"]',
    entryRoles: '["Junior Web Developer", "Frontend Developer", "Full-Stack Developer (Junior)", "UI Developer"]',
    furtherStudy: '["MS Computer Science", "UX/UI Design Certification", "Progressive Web Apps Specialization", "Cloud Deployment"]',
    certifications: 'Meta Frontend Developer, freeCodeCamp Responsive Web Design, Google Mobile Web Specialist',
    sourceUrl: 'https://www.bls.gov/ooh/computer-and-information-technology/web-developers.htm',
    verificationStatus: 'verified',
  },
  {
    id: 'career-006',
    title: 'Civil Engineer',
    slug: 'civil-engineer',
    field: 'Civil Engineering',
    description: 'Design, construct, and maintain infrastructure projects including buildings, bridges, roads, and water systems. Ensure projects meet safety standards, environmental regulations, and budget requirements.',
    skills: '["AutoCAD", "Structural Analysis", "Project Management", "MATLAB", "Geotechnical Engineering", "Surveying", "Building Codes", "Cost Estimation", "BIM", "Sustainability"]',
    entryRoles: '["Junior Civil Engineer", "Site Engineer", "Graduate Engineer", "Construction Engineer"]',
    furtherStudy: '["MS Structural Engineering", "MS Transportation Engineering", "PE License", "Project Management Professional (PMP)"]',
    certifications: 'Professional Engineer (PE), LEED Accredited, PMP, Chartered Engineer (CEng)',
    sourceUrl: 'https://www.bls.gov/ooh/architecture-and-engineering/civil-engineers.htm',
    verificationStatus: 'verified',
  },
  {
    id: 'career-007',
    title: 'Mechanical Engineer',
    slug: 'mechanical-engineer',
    field: 'Mechanical Engineering',
    description: 'Design, analyze, and manufacture mechanical systems from automotive components to aerospace structures. Apply principles of thermodynamics, fluid mechanics, and materials science to solve engineering challenges.',
    skills: '["CAD (SolidWorks, CATIA)", "FEA Analysis", "Thermodynamics", "Fluid Mechanics", "Manufacturing Processes", "MATLAB", "GD&T", "Project Management", "Robotics", "Materials Science"]',
    entryRoles: '["Junior Mechanical Engineer", "Design Engineer", "Manufacturing Engineer", "Quality Engineer"]',
    furtherStudy: '["MS Mechanical Engineering", "MS Aerospace Engineering", "PE License", "Specialization in Robotics or Energy"]',
    certifications: 'Professional Engineer (PE), Six Sigma Green Belt, SolidWorks Certified Professional (CSWP)',
    sourceUrl: 'https://www.bls.gov/ooh/architecture-and-engineering/mechanical-engineers.htm',
    verificationStatus: 'verified',
  },
  {
    id: 'career-008',
    title: 'Electrical Engineer',
    slug: 'electrical-engineer',
    field: 'Electrical Engineering',
    description: 'Design, develop, and test electrical equipment and systems from microchips to power grids. Work on circuits, control systems, signal processing, and telecommunications infrastructure.',
    skills: '["Circuit Design", "Embedded Systems", "PCB Layout", "MATLAB/Simulink", "Power Systems", "Signal Processing", "C/C++", "VHDL/Verilog", "Control Systems", "Telecommunications"]',
    entryRoles: '["Junior Electrical Engineer", "Electronics Engineer", "Hardware Engineer", "Embedded Systems Engineer"]',
    furtherStudy: '["MS Electrical Engineering", "MS VLSI Design", "PE License", "Specialization in Power Electronics or RF"]',
    certifications: 'Professional Engineer (PE), Certified LabVIEW Developer, IPC Certification',
    sourceUrl: 'https://www.bls.gov/ooh/architecture-and-engineering/electrical-and-electronics-engineers.htm',
    verificationStatus: 'verified',
  },
  {
    id: 'career-009',
    title: 'Business Analyst',
    slug: 'business-analyst',
    field: 'Business',
    description: 'Bridge the gap between business stakeholders and technology teams. Analyze business processes, gather requirements, and design solutions that improve efficiency and drive organizational growth.',
    skills: '["Requirements Gathering", "SQL", "Data Analysis", "Process Modeling", "Stakeholder Management", "Agile/Scrum", "Wireframing", "Business Process Modeling", "ERP Systems", "Financial Analysis"]',
    entryRoles: '["Junior Business Analyst", "Requirements Analyst", "Process Analyst", "Associate Consultant"]',
    furtherStudy: '["MBA", "MS Business Analytics", "PMP Certification", "Six Sigma Black Belt"]',
    certifications: 'CBAP, PMI-PBA, Certified Scrum Master (CSM), Tableau Desktop Specialist',
    sourceUrl: 'https://www.bls.gov/ooh/business-and-financial/management-analysts.htm',
    verificationStatus: 'verified',
  },
  {
    id: 'career-010',
    title: 'Financial Analyst',
    slug: 'financial-analyst',
    field: 'Business/Economics',
    description: 'Evaluate financial data and market trends to guide investment decisions and business strategy. Create financial models, forecasts, and reports for corporate finance, banking, or investment firms.',
    skills: '["Financial Modeling", "Excel Advanced", "Python/R", "SQL", "Accounting", "Valuation", "Bloomberg Terminal", "Statistics", "Risk Analysis", "Presentation Skills"]',
    entryRoles: '["Junior Financial Analyst", "Investment Banking Analyst", "Equity Research Analyst", "Corporate Finance Analyst"]',
    furtherStudy: '["MBA (Finance)", "CFA Charter", "FRM Certification", "MS Financial Engineering"]',
    certifications: 'CFA Level I-III, FRM, Bloomberg Financial Markets, Financial Modeling & Valuation Analyst (FMVA)',
    sourceUrl: 'https://www.bls.gov/ooh/business-and-financial/financial-analysts.htm',
    verificationStatus: 'verified',
  },
  {
    id: 'career-011',
    title: 'Doctor / Physician',
    slug: 'doctor-physician',
    field: 'Medicine',
    description: 'Diagnose and treat illnesses, injuries, and diseases. Provide preventive care, prescribe medications, and work with medical teams to deliver comprehensive patient care across various specialties.',
    skills: '["Clinical Diagnosis", "Patient Communication", "Medical Knowledge", "Emergency Medicine", "Surgical Skills", "Medical Imaging Interpretation", "Pharmacology", "Medical Ethics", "Leadership", "Research"]',
    entryRoles: '["Medical Intern (House Officer)", "Resident Doctor", "General Practitioner", "Clinical Officer"]',
    furtherStudy: '["Medical Specialization (Residency)", "Fellowship in Subspecialty", "MPH (Public Health)", "MD/PhD Research Track"]',
    certifications: 'Medical License (USMLE/PLAB/AMC), Board Certification (varies by specialty), ACLS, BLS',
    sourceUrl: 'https://www.bls.gov/ooh/healthcare/physicians-and-surgeons.htm',
    verificationStatus: 'verified',
  },
  {
    id: 'career-012',
    title: 'Lawyer',
    slug: 'lawyer',
    field: 'Law',
    description: 'Advise and represent clients in legal matters. Research laws, prepare legal documents, argue cases in court, and ensure compliance with local, national, and international regulations.',
    skills: '["Legal Research", "Writing & Drafting", "Oral Advocacy", "Negotiation", "Critical Thinking", "Client Counseling", "Litigation", "Contract Law", "Constitutional Law", "Ethics"]',
    entryRoles: '["Junior Associate", "Trainee Solicitor", "Legal Intern", "Public Defender"]',
    furtherStudy: '["LLM Specialization", "Judicial Clerkship", "Bar Admission (varies by jurisdiction)", "PhD in Law"]',
    certifications: 'Bar Examination (varies by jurisdiction), Certified Legal Professional, Mediation Certification',
    sourceUrl: 'https://www.bls.gov/ooh/legal/lawyers.htm',
    verificationStatus: 'verified',
  },
  {
    id: 'career-013',
    title: 'Psychologist',
    slug: 'psychologist',
    field: 'Psychology',
    description: 'Assess, diagnose, and treat mental health disorders. Use therapeutic techniques to help individuals manage emotional, behavioral, and psychological challenges. Conduct research on human behavior.',
    skills: '["Clinical Assessment", "CBT", "Psychotherapy", "Research Methods", "Statistics", "Empathy", "Active Listening", "Cultural Sensitivity", "Ethics", "Psychometrics"]',
    entryRoles: '["Junior Psychologist", "Counseling Psychologist (Junior)", "Research Assistant", "School Psychologist"]',
    furtherStudy: '["Doctoral Degree in Psychology (PsyD/PhD)", "Specialization in Clinical/Counseling/Forensic", "Board Certification", "Postdoctoral Fellowship"]',
    certifications: 'Licensed Psychologist (varies by state), Board Certified in Clinical Psychology, Certified Clinical Trauma Professional',
    sourceUrl: 'https://www.bls.gov/ooh/life-physical-and-social-science/psychologists.htm',
    verificationStatus: 'verified',
  },
  {
    id: 'career-014',
    title: 'Research Scientist',
    slug: 'research-scientist',
    field: 'General',
    description: 'Conduct original research to advance knowledge in a scientific discipline. Design experiments, analyze data, publish findings, and collaborate with multidisciplinary teams on cutting-edge problems.',
    skills: '["Research Methodology", "Statistical Analysis", "Python/R/MATLAB", "Scientific Writing", "Experiment Design", "Data Analysis", "Peer Review", "Grant Writing", "Critical Thinking", "Domain Expertise"]',
    entryRoles: '["Research Assistant", "Junior Research Scientist", "Lab Technician", "Postdoctoral Researcher"]',
    furtherStudy: '["PhD in Specialized Field", "Postdoctoral Fellowship", "Tenure-Track Faculty Position", "Research Director"]',
    certifications: 'Depends on field; CITI Research Ethics, GLP/GMP Certification, Domain-specific certifications',
    sourceUrl: 'https://www.bls.gov/ooh/life-physical-and-social-science/',
    verificationStatus: 'verified',
  },
  {
    id: 'career-015',
    title: 'University Professor',
    slug: 'university-professor',
    field: 'General',
    description: 'Teach undergraduate and graduate students while conducting research in a specialized field. Mentor students, secure research funding, publish scholarly work, and contribute to academic governance.',
    skills: '["Teaching", "Research", "Mentoring", "Grant Writing", "Academic Writing", "Public Speaking", "Curriculum Design", "Peer Review", "Student Assessment", "Leadership"]',
    entryRoles: '["Lecturer", "Assistant Professor", "Adjunct Professor", "Teaching Fellow"]',
    furtherStudy: '["Tenure-Track Promotion", "Distinguished Professorship", "Department Chair", "University Administration"]',
    certifications: 'PhD (required), Postdoctoral experience (preferred), Higher Education Teaching Certificate',
    sourceUrl: 'https://www.bls.gov/ooh/education-training-and-library/postsecondary-teachers.htm',
    verificationStatus: 'verified',
  },
];

// ── University Rankings ──────────────────────────────────────────────────────

const universityRankings = [
  { id: 'ranking-001', universityId: 'uni-001', provider: 'QS Asia', year: 2024, category: 'Asia', position: 112, sourceUrl: 'https://www.topuniversities.com/university-rankings', lastVerifiedAt: recent },
  { id: 'ranking-002', universityId: 'uni-002', provider: 'QS Asia', year: 2024, category: 'Asia', position: 108, sourceUrl: 'https://www.topuniversities.com/university-rankings', lastVerifiedAt: recent },
  { id: 'ranking-003', universityId: 'uni-007', provider: 'QS World', year: 2024, category: 'World', position: 1, sourceUrl: 'https://www.topuniversities.com/university-rankings', lastVerifiedAt: recent },
  { id: 'ranking-004', universityId: 'uni-008', provider: 'QS World', year: 2024, category: 'World', position: 2, sourceUrl: 'https://www.topuniversities.com/university-rankings', lastVerifiedAt: recent },
  { id: 'ranking-005', universityId: 'uni-009', provider: 'QS World', year: 2024, category: 'World', position: 3, sourceUrl: 'https://www.topuniversities.com/university-rankings', lastVerifiedAt: recent },
  { id: 'ranking-006', universityId: 'uni-010', provider: 'QS World', year: 2024, category: 'World', position: 2, sourceUrl: 'https://www.topuniversities.com/university-rankings', lastVerifiedAt: recent },
];

// ── Visa Information ─────────────────────────────────────────────────────────

const visaInformation = [
  {
    id: 'visa-001',
    countryId: 'country-002',
    visaType: 'Student Visa (National Visa Type D)',
    requirements: 'Valid passport (min 6 months validity); university admission letter; proof of financial means (blocked account with EUR 11,904/year); health insurance; language certificate (TestDaF or DSH for German-taught programs, IELTS 6.0+ for English-taught); completed visa application form; biometric photos; motivation letter.',
    processingTime: '4-8 weeks',
    fee: 75,
    sourceUrl: 'https://www.germany.info/us-en/service/visa',
  },
  {
    id: 'visa-002',
    countryId: 'country-003',
    visaType: 'F-1 Student Visa',
    requirements: 'Valid passport; Form I-20 from SEVP-certified school; SEVIS fee receipt (I-901); DS-160 confirmation; proof of financial support (bank statements, affidavits); academic transcripts; standardized test scores (GRE/GMAT if applicable); English proficiency proof (TOEFL/IELTS); visa interview at US Embassy/Consulate.',
    processingTime: '2-4 weeks (interview wait times vary)',
    fee: 185,
    sourceUrl: 'https://travel.state.gov/content/travel/en/us-visas/study/exchange.html',
  },
  {
    id: 'visa-003',
    countryId: 'country-004',
    visaType: 'Student Visa (Tier 4 / Student Route)',
    requirements: 'Valid passport; Confirmation of Acceptance for Studies (CAS) from licensed sponsor; proof of English language (IELTS for UKVI score 5.5-7.5 depending on course); financial evidence (tuition + GBP 1,334/month for London or GBP 1,023/month outside London); TB test certificate (for certain countries); ATAS certificate (for sensitive subjects); completed online application.',
    processingTime: '3-6 weeks',
    fee: 490,
    sourceUrl: 'https://www.gov.uk/student-visa',
  },
];

// ── Admission Requirements ───────────────────────────────────────────────────

const admissionRequirements = [
  {
    id: 'adm-001',
    universityId: 'uni-007',
    courseId: 'course-009',
    countryId: 'country-003',
    requirementType: 'academic_transcript',
    requirementValue: 'High school transcript with strong performance in mathematics and science courses; SAT/ACT scores (MIT 25th-75th percentile: SAT 1510-1580, ACT 34-36).',
    deadline: null,
    notes: 'MIT practices holistic admissions. SAT Subject Tests optional but recommended.',
  },
  {
    id: 'adm-002',
    universityId: 'uni-007',
    courseId: 'course-009',
    countryId: 'country-003',
    requirementType: 'standardized_test_scores',
    requirementValue: 'SAT or ACT required; SAT Subject Tests in Math Level 2 and Science recommended; no minimum score but competitive applicants score 1500+ SAT.',
    deadline: null,
    notes: 'MIT superscores the SAT/ACT. Can submit AP/IB scores for placement.',
  },
  {
    id: 'adm-003',
    universityId: 'uni-001',
    courseId: null,
    countryId: 'country-001',
    requirementType: 'academic_transcript',
    requirementValue: 'Intermediate/A-Levels/HSSC with minimum 80% aggregate or equivalent; strong performance in Mathematics and English.',
    deadline: null,
    notes: 'LUMS considers academic record holistically along with SAT scores.',
  },
  {
    id: 'adm-004',
    universityId: 'uni-001',
    courseId: null,
    countryId: 'country-001',
    requirementType: 'admission_test',
    requirementValue: 'LUMS National Admissions Test (NAT) or SAT (minimum 1100 Evidence-Based Reading & Writing + Math). NAT covers English, Mathematics, and Analytical reasoning.',
    deadline: null,
    notes: 'SAT can be used as an alternative to NAT. Test dates are announced on the LUMS website each year.',
  },
  {
    id: 'adm-005',
    universityId: 'uni-005',
    courseId: 'course-006',
    countryId: 'country-002',
    requirementType: 'academic_transcript',
    requirementValue: 'Recognized bachelor\'s degree in Computer Science or related field with minimum CGPA of 2.5/4.0 (or equivalent). Specific module requirements may apply for certain specializations.',
    deadline: null,
    notes: 'TU Munich uses a point-based admission system (local grade point average). Check the specific program page for detailed requirements.',
  },
  {
    id: 'adm-006',
    universityId: 'uni-005',
    courseId: 'course-006',
    countryId: 'country-002',
    requirementType: 'language_certificate',
    requirementValue: 'German: TestDaF 4 ( TDN 4 in all sections) or DSH-2 for German-taught programs. English: IELTS 6.5 or TOEFL iBT 88 for English-taught programs.',
    deadline: null,
    notes: 'Some programs offer a mix of German and English courses. Check individual program language requirements.',
  },
  {
    id: 'adm-007',
    universityId: 'uni-009',
    courseId: null,
    countryId: 'country-004',
    requirementType: 'academic_transcript',
    requirementValue: 'A-Levels or equivalent with grades A*A*A to AAA depending on the course. International qualifications assessed individually. Strong GCSE/O-Level performance also considered.',
    deadline: null,
    notes: 'Oxford uses a contextual admissions approach. Offers may vary based on individual circumstances.',
  },
  {
    id: 'adm-008',
    universityId: 'uni-009',
    courseId: null,
    countryId: 'country-004',
    requirementType: 'interview',
    requirementValue: 'All applicants are shortlisted for interview based on submitted written work and academic record. Interviews are conducted by college tutors and may be in-person or online. Typically 2-3 interviews lasting 20-45 minutes each.',
    deadline: null,
    notes: 'Interviews usually take place in December. Written work submission required for most courses by mid-November.',
  },
];

// ── Seed Execution ───────────────────────────────────────────────────────────

async function main() {
  console.log('Starting seed...\n');

  // 1. Countries
  console.log('Seeding countries...');
  for (const c of countries) {
    await prisma.country.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        code: c.code,
        continent: c.continent,
        visaRequired: c.visaRequired,
        costOfLiving: c.costOfLiving,
        safetyIndex: c.safetyIndex,
        educationSystem: c.educationSystem,
        sourceUrl: c.sourceUrl,
      },
      create: {
        id: c.id,
        name: c.name,
        code: c.code,
        continent: c.continent,
        visaRequired: c.visaRequired,
        costOfLiving: c.costOfLiving,
        safetyIndex: c.safetyIndex,
        educationSystem: c.educationSystem,
        sourceUrl: c.sourceUrl,
      },
    });
  }
  console.log(`  ✓ ${countries.length} countries seeded`);

  // 2. Universities
  console.log('Seeding universities...');
  for (const u of universities) {
    await prisma.university.upsert({
      where: { id: u.id },
      update: {
        name: u.name,
        country: u.country,
        city: u.city,
        website: u.website,
        foundedYear: u.foundedYear,
        type: u.type,
        sourceUrl: u.sourceUrl,
        sourceName: u.sourceName,
        verificationStatus: u.verificationStatus,
      },
      create: {
        id: u.id,
        name: u.name,
        country: u.country,
        city: u.city,
        website: u.website,
        foundedYear: u.foundedYear,
        type: u.type,
        sourceUrl: u.sourceUrl,
        sourceName: u.sourceName,
        verificationStatus: u.verificationStatus,
      },
    });
  }
  console.log(`  ✓ ${universities.length} universities seeded`);

  // 3. Courses
  console.log('Seeding courses...');
  for (const c of courses) {
    await prisma.course.upsert({
      where: { id: c.id },
      update: {
        universityId: c.universityId,
        name: c.name,
        degree: c.degree,
        duration: c.duration,
        language: c.language,
        tuitionFee: c.tuitionFee,
        currency: c.currency,
        description: c.description,
        sourceUrl: c.sourceUrl,
      },
      create: {
        id: c.id,
        universityId: c.universityId,
        name: c.name,
        degree: c.degree,
        duration: c.duration,
        language: c.language,
        tuitionFee: c.tuitionFee,
        currency: c.currency,
        description: c.description,
        sourceUrl: c.sourceUrl,
      },
    });
  }
  console.log(`  ✓ ${courses.length} courses seeded`);

  // 4. Scholarships
  console.log('Seeding scholarships...');
  for (const s of scholarships) {
    await prisma.scholarship.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        provider: s.provider,
        country: s.country,
        amount: s.amount,
        currency: s.currency,
        deadline: s.deadline,
        description: s.description,
        eligibilityCriteria: s.eligibilityCriteria,
        sourceUrl: s.sourceUrl,
        sourceName: s.sourceName,
        verificationStatus: s.verificationStatus,
      },
      create: {
        id: s.id,
        name: s.name,
        provider: s.provider,
        country: s.country,
        amount: s.amount,
        currency: s.currency,
        deadline: s.deadline,
        description: s.description,
        eligibilityCriteria: s.eligibilityCriteria,
        sourceUrl: s.sourceUrl,
        sourceName: s.sourceName,
        verificationStatus: s.verificationStatus,
      },
    });
  }
  console.log(`  ✓ ${scholarships.length} scholarships seeded`);

  // 5. Scholarship Requirements
  console.log('Seeding scholarship requirements...');
  for (const sr of scholarshipRequirements) {
    await prisma.scholarshipRequirement.upsert({
      where: { id: sr.id },
      update: {
        scholarshipId: sr.scholarshipId,
        requirementType: sr.requirementType,
        requirementValue: sr.requirementValue,
        isRequired: sr.isRequired,
      },
      create: {
        id: sr.id,
        scholarshipId: sr.scholarshipId,
        requirementType: sr.requirementType,
        requirementValue: sr.requirementValue,
        isRequired: sr.isRequired,
      },
    });
  }
  console.log(`  ✓ ${scholarshipRequirements.length} scholarship requirements seeded`);

  // 6. Career Paths
  console.log('Seeding career paths...');
  for (const cp of careerPaths) {
    await prisma.careerPath.upsert({
      where: { id: cp.id },
      update: {
        title: cp.title,
        slug: cp.slug,
        field: cp.field,
        description: cp.description,
        skills: cp.skills,
        entryRoles: cp.entryRoles,
        furtherStudy: cp.furtherStudy,
        certifications: cp.certifications,
        sourceUrl: cp.sourceUrl,
        verificationStatus: cp.verificationStatus,
      },
      create: {
        id: cp.id,
        title: cp.title,
        slug: cp.slug,
        field: cp.field,
        description: cp.description,
        skills: cp.skills,
        entryRoles: cp.entryRoles,
        furtherStudy: cp.furtherStudy,
        certifications: cp.certifications,
        sourceUrl: cp.sourceUrl,
        verificationStatus: cp.verificationStatus,
      },
    });
  }
  console.log(`  ✓ ${careerPaths.length} career paths seeded`);

  // 7. University Rankings
  console.log('Seeding university rankings...');
  for (const r of universityRankings) {
    await prisma.universityRanking.upsert({
      where: { id: r.id },
      update: {
        universityId: r.universityId,
        provider: r.provider,
        year: r.year,
        category: r.category,
        position: r.position,
        sourceUrl: r.sourceUrl,
        lastVerifiedAt: r.lastVerifiedAt,
      },
      create: {
        id: r.id,
        universityId: r.universityId,
        provider: r.provider,
        year: r.year,
        category: r.category,
        position: r.position,
        sourceUrl: r.sourceUrl,
        lastVerifiedAt: r.lastVerifiedAt,
      },
    });
  }
  console.log(`  ✓ ${universityRankings.length} university rankings seeded`);

  // 8. Visa Information
  console.log('Seeding visa information...');
  for (const v of visaInformation) {
    await prisma.visaInformation.upsert({
      where: { id: v.id },
      update: {
        countryId: v.countryId,
        visaType: v.visaType,
        requirements: v.requirements,
        processingTime: v.processingTime,
        fee: v.fee,
        sourceUrl: v.sourceUrl,
      },
      create: {
        id: v.id,
        countryId: v.countryId,
        visaType: v.visaType,
        requirements: v.requirements,
        processingTime: v.processingTime,
        fee: v.fee,
        sourceUrl: v.sourceUrl,
      },
    });
  }
  console.log(`  ✓ ${visaInformation.length} visa information records seeded`);

  // 9. Admission Requirements
  console.log('Seeding admission requirements...');
  for (const a of admissionRequirements) {
    await prisma.admissionRequirement.upsert({
      where: { id: a.id },
      update: {
        universityId: a.universityId,
        courseId: a.courseId,
        countryId: a.countryId,
        requirementType: a.requirementType,
        requirementValue: a.requirementValue,
        deadline: a.deadline,
        notes: a.notes,
      },
      create: {
        id: a.id,
        universityId: a.universityId,
        courseId: a.courseId,
        countryId: a.countryId,
        requirementType: a.requirementType,
        requirementValue: a.requirementValue,
        deadline: a.deadline,
        notes: a.notes,
      },
    });
  }
  console.log(`  ✓ ${admissionRequirements.length} admission requirements seeded`);

  // ── Country Profiles (for Country Intelligence page) ──────────────────────
  console.log('\nSeeding country profiles...');
  const countryProfiles = [
    { name: 'Pakistan', code: 'PK', region: 'South Asia', capital: 'Islamabad', currency: 'PKR', language: 'Urdu/English', educationSystem: 'British-influenced system with HSSC and bachelor degrees', timezone: 'Asia/Karachi', costOfLivingIndex: 25, safetyIndex: 50, qualityOfLifeIndex: 40, popularForStudents: true, overview: 'Pakistan has a large higher education sector with HEC regulating quality.' },
    { name: 'Germany', code: 'DE', region: 'Europe', capital: 'Berlin', currency: 'EUR', language: 'German/English', educationSystem: 'Bologna Process with bachelor/master. Most public universities are tuition-free.', timezone: 'Europe/Berlin', costOfLivingIndex: 65, safetyIndex: 75, qualityOfLifeIndex: 80, popularForStudents: true, overview: 'Germany is a top destination for international students due to tuition-free education.' },
    { name: 'United Kingdom', code: 'GB', region: 'Europe', capital: 'London', currency: 'GBP', language: 'English', educationSystem: 'Russell Group universities with 3-year bachelor and 1-year master degrees', timezone: 'Europe/London', costOfLivingIndex: 75, safetyIndex: 70, qualityOfLifeIndex: 78, popularForStudents: true, overview: 'The UK has world-renowned universities including Oxford, Cambridge, and the Russell Group.' },
    { name: 'United States', code: 'US', region: 'North America', capital: 'Washington D.C.', currency: 'USD', language: 'English', educationSystem: 'Credit-based system with liberal arts education, 4-year bachelor degrees', timezone: 'America/New_York', costOfLivingIndex: 80, safetyIndex: 60, qualityOfLifeIndex: 75, popularForStudents: true, overview: 'The US has the largest number of top-ranked universities globally.' },
    { name: 'Canada', code: 'CA', region: 'North America', capital: 'Ottawa', currency: 'CAD', language: 'English/French', educationSystem: 'Provincial regulation with 4-year bachelor and research-based master/PhD', timezone: 'America/Toronto', costOfLivingIndex: 70, safetyIndex: 80, qualityOfLifeIndex: 85, popularForStudents: true, overview: 'Canada is known for high-quality education, multicultural society, and post-graduation work permits.' },
    { name: 'Australia', code: 'AU', region: 'Oceania', capital: 'Canberra', currency: 'AUD', language: 'English', educationSystem: 'AQF framework with Group of Eight research universities', timezone: 'Australia/Sydney', costOfLivingIndex: 78, safetyIndex: 75, qualityOfLifeIndex: 82, popularForStudents: true, overview: 'Australia offers high-quality education with strong research output.' },
    { name: 'India', code: 'IN', region: 'Asia', capital: 'New Delhi', currency: 'INR', language: 'Hindi/English', educationSystem: 'UGC regulated with 3-4 year bachelor and 2 year master degrees', timezone: 'Asia/Kolkata', costOfLivingIndex: 30, safetyIndex: 55, qualityOfLifeIndex: 50, popularForStudents: true, overview: 'India has IITs, IIMs and many top-ranked institutions.' },
    { name: 'Turkey', code: 'TR', region: 'Middle East', capital: 'Ankara', currency: 'TRY', language: 'Turkish/English', educationSystem: '4-year bachelor, 2-year master, 4-year doctoral structure regulated by YOK', timezone: 'Europe/Istanbul', costOfLivingIndex: 35, safetyIndex: 60, qualityOfLifeIndex: 55, popularForStudents: false, overview: 'Turkey offers affordable education with growing international programs.' },
    { name: 'Malaysia', code: 'MY', region: 'Asia', capital: 'Kuala Lumpur', currency: 'MYR', language: 'Malay/English', educationSystem: 'Malaysian Qualifications Framework with diploma, bachelor, master, and PhD', timezone: 'Asia/Kuala_Lumpur', costOfLivingIndex: 40, safetyIndex: 72, qualityOfLifeIndex: 60, popularForStudents: true, overview: 'Malaysia is an emerging education hub with affordable costs.' },
    { name: 'UAE', code: 'AE', region: 'Middle East', capital: 'Abu Dhabi', currency: 'AED', language: 'Arabic/English', educationSystem: 'KHDA regulated with international branch campuses', timezone: 'Asia/Dubai', costOfLivingIndex: 70, safetyIndex: 85, qualityOfLifeIndex: 75, popularForStudents: true, overview: 'UAE hosts branch campuses of top global universities.' },
    { name: 'Ireland', code: 'IE', region: 'Europe', capital: 'Dublin', currency: 'EUR', language: 'English', educationSystem: 'NFQ framework with 3-4 year bachelor and 1-2 year master', timezone: 'Europe/Dublin', costOfLivingIndex: 72, safetyIndex: 78, qualityOfLifeIndex: 80, popularForStudents: true, overview: 'Ireland is a top English-speaking destination in Europe with strong tech industry.' },
    { name: 'Netherlands', code: 'NL', region: 'Europe', capital: 'Amsterdam', currency: 'EUR', language: 'Dutch/English', educationSystem: 'Research universities and universities of applied sciences', timezone: 'Europe/Amsterdam', costOfLivingIndex: 70, safetyIndex: 80, qualityOfLifeIndex: 85, popularForStudents: true, overview: 'Netherlands offers many English-taught programs at affordable costs.' },
    { name: 'New Zealand', code: 'NZ', region: 'Oceania', capital: 'Wellington', currency: 'NZD', language: 'English', educationSystem: 'NZQF framework with 3-year bachelor and 1-2 year master', timezone: 'Pacific/Auckland', costOfLivingIndex: 72, safetyIndex: 82, qualityOfLifeIndex: 85, popularForStudents: false, overview: 'New Zealand offers high-quality education in a safe environment.' },
    { name: 'Sweden', code: 'SE', region: 'Europe', capital: 'Stockholm', currency: 'SEK', language: 'Swedish/English', educationSystem: 'Bologna Process with 3-year bachelor and 2-year master', timezone: 'Europe/Stockholm', costOfLivingIndex: 75, safetyIndex: 82, qualityOfLifeIndex: 88, popularForStudents: false, overview: 'Sweden is known for innovation and English-taught programs.' },
    { name: 'Switzerland', code: 'CH', region: 'Europe', capital: 'Bern', currency: 'CHF', language: 'German/French/English', educationSystem: 'ETH domain universities with strong research focus', timezone: 'Europe/Zurich', costOfLivingIndex: 95, safetyIndex: 88, qualityOfLifeIndex: 95, popularForStudents: true, overview: 'Switzerland has ETH Zurich and EPFL among the world\'s top technical universities.' },
    { name: 'France', code: 'FR', region: 'Europe', capital: 'Paris', currency: 'EUR', language: 'French/English', educationSystem: 'Grandes Ecoles and university system with Licence/Master/Doctorat', timezone: 'Europe/Paris', costOfLivingIndex: 72, safetyIndex: 65, qualityOfLifeIndex: 78, popularForStudents: true, overview: 'France has Sorbonne and Paris-Saclay among top global institutions.' },
    { name: 'South Africa', code: 'ZA', region: 'Africa', capital: 'Pretoria', currency: 'ZAR', language: 'English/Afrikaans', educationSystem: 'NQF framework with 3-4 year bachelor and 1-2 year master', timezone: 'Africa/Johannesburg', costOfLivingIndex: 42, safetyIndex: 40, qualityOfLifeIndex: 50, popularForStudents: false, overview: 'South Africa has the top-ranked universities in Africa.' },
    { name: 'Philippines', code: 'PH', region: 'Asia', capital: 'Manila', currency: 'PHP', language: 'English/Filipino', educationSystem: 'CHED regulated with 4-year bachelor and 2-year master', timezone: 'Asia/Manila', costOfLivingIndex: 32, safetyIndex: 50, qualityOfLifeIndex: 48, popularForStudents: false, overview: 'Philippines offers affordable English-medium education.' },
    { name: 'Thailand', code: 'TH', region: 'Asia', capital: 'Bangkok', currency: 'THB', language: 'Thai/English', educationSystem: 'MHESI regulated with 4-year bachelor and 2-year master', timezone: 'Asia/Bangkok', costOfLivingIndex: 38, safetyIndex: 60, qualityOfLifeIndex: 55, popularForStudents: false, overview: 'Thailand is an emerging education destination in Southeast Asia.' },
    { name: 'Hungary', code: 'HU', region: 'Europe', capital: 'Budapest', currency: 'HUF', language: 'Hungarian/English', educationSystem: 'Bologna Process with 3-year bachelor and 2-year master', timezone: 'Europe/Budapest', costOfLivingIndex: 45, safetyIndex: 72, qualityOfLifeIndex: 65, popularForStudents: false, overview: 'Hungary offers affordable EU education with English programs.' },
    { name: 'Poland', code: 'PL', region: 'Europe', capital: 'Warsaw', currency: 'PLN', language: 'Polish/English', educationSystem: 'Bologna Process with 3-year bachelor and 2-year master', timezone: 'Europe/Warsaw', costOfLivingIndex: 42, safetyIndex: 70, qualityOfLifeIndex: 65, popularForStudents: false, overview: 'Poland has growing number of English-taught programs at low costs.' },
    { name: 'Russia', code: 'RU', region: 'Europe', capital: 'Moscow', currency: 'RUB', language: 'Russian/English', educationSystem: 'Specialist and Bologna system with 4-year bachelor and 2-year master', timezone: 'Europe/Moscow', costOfLivingIndex: 38, safetyIndex: 55, qualityOfLifeIndex: 55, popularForStudents: false, overview: 'Russia has Lomonosov Moscow State University among top global institutions.' },
    { name: 'Brazil', code: 'BR', region: 'South America', capital: 'Brasilia', currency: 'BRL', language: 'Portuguese', educationSystem: 'MEC regulated with 4-year bachelor and 2-year master', timezone: 'America/Sao_Paulo', costOfLivingIndex: 38, safetyIndex: 45, qualityOfLifeIndex: 55, popularForStudents: false, overview: 'Brazil has USP among the top universities in Latin America.' },
    { name: 'Egypt', code: 'EG', region: 'Africa', capital: 'Cairo', currency: 'EGP', language: 'Arabic/English', educationSystem: 'Supreme Council of Universities regulated system', timezone: 'Africa/Cairo', costOfLivingIndex: 28, safetyIndex: 50, qualityOfLifeIndex: 45, popularForStudents: false, overview: 'Egypt has Cairo University and AUC among top institutions in Africa.' },
    { name: 'Saudi Arabia', code: 'SA', region: 'Middle East', capital: 'Riyadh', currency: 'SAR', language: 'Arabic/English', educationSystem: 'Ministry of Education regulated with growing international programs', timezone: 'Asia/Riyadh', costOfLivingIndex: 50, safetyIndex: 75, qualityOfLifeIndex: 65, popularForStudents: false, overview: 'Saudi Arabia is investing heavily in higher education with generous scholarships.' },
  ];

  for (const cp of countryProfiles) {
    await prisma.countryProfile.upsert({
      where: { code: cp.code },
      update: cp,
      create: cp,
    });
  }
  console.log(`  ✓ ${countryProfiles.length} country profiles seeded`);

  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
