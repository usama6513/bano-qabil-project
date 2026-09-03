const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// Top international universities Pakistani students ask about
const intlKnowledge = {
  // ===== USA =====
  'uni-us-001': { // MIT
    closingMerit: 'SAT 1500-1570, ACT 34-36. Acceptance rate: ~4%. Extremely competitive. No minimum GPA but most admitted have 3.9+.',
    entryTestDetails: 'SAT or ACT required. SAT: 1600 total (Math 800, Evidence-Based Reading 800). ACT: 36 max. SAT Subject Tests recommended but optional. TOEFL (min 90) or IELTS (min 7) for international students.',
    isOpenMerit: false,
    supplyPolicy: 'Pass/Fail grading for first semester. Failed course: must retake. Academic probation if GPA below 3.0. Dismissal if below 2.0 for 2 consecutive semesters.',
    feeRange: 'USD 57,986/year tuition. Room & board: ~USD 18,000/year. Total cost: ~USD 78,000/year. Financial aid available for international students.',
    admissionProcess: '1. Apply via MIT application portal. 2. Pay USD 75 fee. 3. Submit SAT/ACT scores. 4. Submit transcripts, recommendations, essays. 5. Interview (if available). 6. Decision: Early Action (Dec) or Regular (Mar).',
    scholarshipsOffered: 'MIT need-based financial aid (up to full tuition for families earning <$75K/year). International students eligible. No merit scholarships — only need-based.',
    admissionDates: 'Early Action: November 1. Regular Decision: January 1. Decisions: December (EA) / March (RD). Classes start: September (Fall) or February (Spring).',
    examSystem: 'semester',
  },
  'uni-us-002': { // Stanford
    closingMerit: 'SAT 1500-1570, ACT 34-36. Acceptance rate: ~4%. Most admitted have 3.9+ GPA. Holistic admissions.',
    entryTestDetails: 'SAT or ACT required. TOEFL (min 89) or IELTS (min 7) for international. SAT Subject Tests recommended. AP scores considered.',
    isOpenMerit: false,
    supplyPolicy: 'Letter grades (A-F). Failed course: must retake. Academic probation if GPA below 2.0. Dismissal if not improved. Maximum 12 quarters for BS.',
    feeRange: 'USD 56,169/year tuition. Room & board: ~USD 17,000/year. Total: ~USD 75,000/year. Financial aid available.',
    admissionProcess: '1. Apply via Common App or Coalition App. 2. Pay USD 90 fee. 3. Submit SAT/ACT. 4. Transcripts, recommendations, essays. 5. Interview (optional). 6. Decision: REA (Dec) or RD (Apr).',
    scholarshipsOffered: 'Stanford need-based aid (up to full tuition for families <$75K/year). International students eligible. No merit scholarships.',
    admissionDates: 'Restrictive Early Action: November 1. Regular Decision: January 2. Decisions: December (REA) / April (RD). Classes start: September.',
    examSystem: 'quarter',
  },
  'uni-us-003': { // Harvard
    closingMerit: 'SAT 1500-1570, ACT 34-36. Acceptance rate: ~3%. Most admitted have 3.9+ GPA. Holistic review.',
    entryTestDetails: 'SAT or ACT required. TOEFL (min 80) or IELTS (min 6.5) for international. SAT Subject Tests recommended. AP scores considered.',
    isOpenMerit: false,
    supplyPolicy: 'Letter grades (A-F). Failed course: must retake. Academic probation if GPA below 2.0. Dismissal if not improved. Maximum 8 semesters for AB.',
    feeRange: 'USD 54,269/year tuition. Room & board: ~USD 18,000/year. Total: ~USD 74,000/year. Financial aid available.',
    admissionProcess: '1. Apply via Common App or Coalition App. 2. Pay USD 85 fee. 3. Submit SAT/ACT. 4. Transcripts, recommendations, essays. 5. Interview (optional). 6. Decision: REA (Dec) or RD (Mar).',
    scholarshipsOffered: 'Harvard need-based aid (up to full tuition for families <$75K/year). International students eligible. No merit scholarships.',
    admissionDates: 'Restrictive Early Action: November 1. Regular Decision: January 1. Decisions: December (REA) / March (RD). Classes start: September.',
    examSystem: 'semester',
  },
  'uni-us-004': { // Caltech
    closingMerit: 'SAT 1530-1580, ACT 35-36. Acceptance rate: ~6%. Extremely competitive for STEM. Most admitted have 4.0 GPA.',
    entryTestDetails: 'SAT or ACT required. TOEFL (min 90) or IELTS (min 7) for international. SAT Math Level 2 and Physics Subject Tests recommended.',
    isOpenMerit: false,
    supplyPolicy: 'Letter grades (A-F). Failed course: must retake. Academic probation if GPA below 2.0. Dismissal if not improved. Maximum 8 semesters for BS.',
    feeRange: 'USD 58,680/year tuition. Room & board: ~USD 17,000/year. Total: ~USD 77,000/year. Financial aid available.',
    admissionProcess: '1. Apply via Caltech application. 2. Pay USD 75 fee. 3. Submit SAT/ACT. 4. Transcripts, recommendations, essays. 5. Interview (optional). 6. Decision: Early Action (Dec) or Regular (Mar).',
    scholarshipsOffered: 'Caltech need-based aid (up to full tuition for families <$75K/year). International students eligible. No merit scholarships.',
    admissionDates: 'Early Action: November 1. Regular Decision: January 3. Decisions: December (EA) / March (RD). Classes start: September.',
    examSystem: 'quarter',
  },
  'uni-us-005': { // Columbia
    closingMerit: 'SAT 1500-1560, ACT 34-36. Acceptance rate: ~4%. Most admitted have 3.9+ GPA. Holistic review.',
    entryTestDetails: 'SAT or ACT required. TOEFL (min 100) or IELTS (min 7.5) for international. SAT Subject Tests recommended.',
    isOpenMerit: false,
    supplyPolicy: 'Letter grades (A-F). Failed course: must retake. Academic probation if GPA below 2.0. Dismissal if not improved.',
    feeRange: 'USD 63,530/year tuition. Room & board: ~USD 16,000/year. Total: ~USD 81,000/year. Financial aid available.',
    admissionProcess: '1. Apply via Common App. 2. Pay USD 85 fee. 3. Submit SAT/ACT. 4. Transcripts, recommendations, essays. 5. Interview (optional). 6. Decision: Early Decision (Dec) or Regular (Apr).',
    scholarshipsOffered: 'Columbia need-based aid (up to full tuition for families <$75K/year). International students eligible.',
    admissionDates: 'Early Decision: November 1. Regular Decision: January 1. Decisions: December (ED) / April (RD). Classes start: September.',
    examSystem: 'semester',
  },
  'uni-us-006': { // Yale
    closingMerit: 'SAT 1500-1570, ACT 34-36. Acceptance rate: ~5%. Most admitted have 3.9+ GPA.',
    entryTestDetails: 'SAT or ACT required. TOEFL (min 100) or IELTS (min 7) for international. SAT Subject Tests recommended.',
    isOpenMerit: false,
    supplyPolicy: 'Letter grades (A-F). Failed course: must retake. Academic probation if GPA below 2.0. Dismissal if not improved.',
    feeRange: 'USD 62,250/year tuition. Room & board: ~USD 17,000/year. Total: ~USD 80,000/year. Financial aid available.',
    admissionProcess: '1. Apply via Common App or Coalition App. 2. Pay USD 80 fee. 3. Submit SAT/ACT. 4. Transcripts, recommendations, essays. 5. Interview (optional). 6. Decision: REA (Dec) or RD (Apr).',
    scholarshipsOffered: 'Yale need-based aid (up to full tuition for families <$75K/year). International students eligible.',
    admissionDates: 'Restrictive Early Action: November 1. Regular Decision: January 2. Decisions: December (REA) / April (RD). Classes start: September.',
    examSystem: 'semester',
  },
  'uni-us-007': { // Princeton
    closingMerit: 'SAT 1500-1570, ACT 34-36. Acceptance rate: ~4%. Most admitted have 3.9+ GPA.',
    entryTestDetails: 'SAT or ACT required. TOEFL (min 100) or IELTS (min 7) for international. SAT Subject Tests recommended.',
    isOpenMerit: false,
    supplyPolicy: 'Letter grades (A-F). Failed course: must retake. Academic probation if GPA below 2.0. Dismissal if not improved.',
    feeRange: 'USD 57,690/year tuition. Room & board: ~USD 17,000/year. Total: ~USD 76,000/year. Financial aid available.',
    admissionProcess: '1. Apply via Common App or Coalition App. 2. Pay USD 75 fee. 3. Submit SAT/ACT. 4. Transcripts, recommendations, essays. 5. Interview (optional). 6. Decision: REA (Dec) or RD (Mar).',
    scholarshipsOffered: 'Princeton need-based aid (up to full tuition for families <$75K/year). International students eligible. No loans — all grants.',
    admissionDates: 'Restrictive Early Action: November 1. Regular Decision: January 1. Decisions: December (REA) / March (RD). Classes start: September.',
    examSystem: 'semester',
  },
  'uni-us-008': { // UChicago
    closingMerit: 'SAT 1500-1570, ACT 34-36. Acceptance rate: ~6%. Most admitted have 3.9+ GPA.',
    entryTestDetails: 'SAT or ACT required. TOEFL (min 100) or IELTS (min 7) for international. SAT Subject Tests recommended.',
    isOpenMerit: false,
    supplyPolicy: 'Letter grades (A-F). Failed course: must retake. Academic probation if GPA below 2.0. Dismissal if not improved.',
    feeRange: 'USD 63,801/year tuition. Room & board: ~USD 17,000/year. Total: ~USD 82,000/year. Financial aid available.',
    admissionProcess: '1. Apply via Common App. 2. Pay USD 75 fee. 3. Submit SAT/ACT. 4. Transcripts, recommendations, essays. 5. Interview (optional). 6. Decision: Early Decision (Dec) or Regular (Mar).',
    scholarshipsOffered: 'UChicago need-based aid (up to full tuition for families <$75K/year). International students eligible.',
    admissionDates: 'Early Decision I: November 1. Early Decision II: January 2. Regular Decision: January 2. Classes start: September.',
    examSystem: 'quarter',
  },
  'uni-us-009': { // UPenn
    closingMerit: 'SAT 1500-1560, ACT 34-36. Acceptance rate: ~6%. Most admitted have 3.9+ GPA.',
    entryTestDetails: 'SAT or ACT required. TOEFL (min 100) or IELTS (min 7) for international. SAT Subject Tests recommended.',
    isOpenMerit: false,
    supplyPolicy: 'Letter grades (A-F). Failed course: must retake. Academic probation if GPA below 2.0. Dismissal if not improved.',
    feeRange: 'USD 63,452/year tuition. Room & board: ~USD 17,000/year. Total: ~USD 82,000/year. Financial aid available.',
    admissionProcess: '1. Apply via Common App. 2. Pay USD 75 fee. 3. Submit SAT/ACT. 4. Transcripts, recommendations, essays. 5. Interview (optional). 6. Decision: Early Decision (Dec) or Regular (Apr).',
    scholarshipsOffered: 'UPenn need-based aid (up to full tuition for families <$75K/year). International students eligible.',
    admissionDates: 'Early Decision: November 1. Regular Decision: January 5. Decisions: December (ED) / April (RD). Classes start: September.',
    examSystem: 'semester',
  },
  'uni-us-010': { // UCLA
    closingMerit: 'SAT 1390-1530, ACT 31-35. Acceptance rate: ~12%. Most admitted have 3.9+ GPA for out-of-state.',
    entryTestDetails: 'SAT or ACT required. TOEFL (min 87) or IELTS (min 7) for international. SAT Subject Tests recommended.',
    isOpenMerit: false,
    supplyPolicy: 'Letter grades (A-F). Failed course: must retake. Academic probation if GPA below 2.0. Dismissal if not improved.',
    feeRange: 'Out-of-state: USD 45,674/year tuition. Room & board: ~USD 17,000/year. Total: ~USD 64,000/year. Financial aid limited for international.',
    admissionProcess: '1. Apply via UC Application. 2. Pay USD 70 fee. 3. Submit SAT/ACT (optional for 2024). 4. Transcripts, activities, essays. 5. No interview. 6. Decision: March-April.',
    scholarshipsOffered: 'UCLA merit scholarships (limited for international). Need-based aid for California residents only.',
    admissionDates: 'Application: October 1 - November 30. Decisions: March-April. Classes start: September (Fall) or January (Winter).',
    examSystem: 'quarter',
  },
  'uni-us-011': { // UC Berkeley
    closingMerit: 'SAT 1390-1530, ACT 31-35. Acceptance rate: ~15%. Most admitted have 3.9+ GPA for out-of-state.',
    entryTestDetails: 'SAT or ACT required. TOEFL (min 80) or IELTS (min 6.5) for international. SAT Subject Tests recommended.',
    isOpenMerit: false,
    supplyPolicy: 'Letter grades (A-F). Failed course: must retake. Academic probation if GPA below 2.0. Dismissal if not improved.',
    feeRange: 'Out-of-state: USD 45,674/year tuition. Room & board: ~USD 17,000/year. Total: ~USD 64,000/year. Financial aid limited for international.',
    admissionProcess: '1. Apply via UC Application. 2. Pay USD 70 fee. 3. Submit SAT/ACT (optional for 2024). 4. Transcripts, activities, essays. 5. No interview. 6. Decision: March-April.',
    scholarshipsOffered: 'Berkeley merit scholarships (limited for international). Need-based aid for California residents only.',
    admissionDates: 'Application: October 1 - November 30. Decisions: March-April. Classes start: August (Fall) or January (Spring).',
    examSystem: 'semester',
  },
  'uni-us-012': { // Duke
    closingMerit: 'SAT 1500-1570, ACT 34-36. Acceptance rate: ~6%. Most admitted have 3.9+ GPA.',
    entryTestDetails: 'SAT or ACT required. TOEFL (min 100) or IELTS (min 7) for international. SAT Subject Tests recommended.',
    isOpenMerit: false,
    supplyPolicy: 'Letter grades (A-F). Failed course: must retake. Academic probation if GPA below 2.0. Dismissal if not improved.',
    feeRange: 'USD 63,924/year tuition. Room & board: ~USD 17,000/year. Total: ~USD 82,000/year. Financial aid available.',
    admissionProcess: '1. Apply via Common App or Coalition App. 2. Pay USD 85 fee. 3. Submit SAT/ACT. 4. Transcripts, recommendations, essays. 5. Interview (optional). 6. Decision: Early Decision (Dec) or Regular (Apr).',
    scholarshipsOffered: 'Duke need-based aid (up to full tuition for families <$75K/year). International students eligible.',
    admissionDates: 'Early Decision: November 1. Regular Decision: January 2. Decisions: December (ED) / April (RD). Classes start: August.',
    examSystem: 'semester',
  },

  // ===== UK =====
  'uni-uk-001': { // Oxford
    closingMerit: 'A-levels: A*A*A - AAA. IB: 38-40 points. Acceptance rate: ~17%. Most admitted have top grades.',
    entryTestDetails: 'Admissions tests required for most courses (MAT for Math, PAT for Physics, LNAT for Law, etc.). IELTS (min 7.0, no component below 7.0) or TOEFL (min 100). Interview required for most courses.',
    isOpenMerit: false,
    supplyPolicy: 'Failed exam: resit next year. Academic probation if failing multiple papers. Dismissal if not improved. Maximum 3 years for BA.',
    feeRange: 'International: GBP 28,950-39,010/year tuition. Room & board: ~GBP 12,000/year. Total: ~GBP 45,000-50,000/year.',
    admissionProcess: '1. Apply via UCAS by October 15. 2. Submit admissions test (if required). 3. Interview (November-December). 4. Decision: January. 5. Accept offer by June.',
    scholarshipsOffered: 'Oxford scholarships (limited for international). Clarendon Fund for graduate students. Need-based aid for UK students.',
    admissionDates: 'UCAS deadline: October 15. Interviews: November-December. Decisions: January. Classes start: October (Michaelmas term).',
    examSystem: 'yearly',
  },
  'uni-uk-002': { // Cambridge
    closingMerit: 'A-levels: A*A*A - AAA. IB: 38-41 points. Acceptance rate: ~21%. Most admitted have top grades.',
    entryTestDetails: 'Admissions tests required (TMUA for CS, ENGAA for Engineering, etc.). IELTS (min 7.5, no component below 7.0) or TOEFL (min 110). Interview required for most courses.',
    isOpenMerit: false,
    supplyPolicy: 'Failed exam: resit next year. Academic probation if failing multiple papers. Dismissal if not improved. Maximum 3 years for BA.',
    feeRange: 'International: GBP 24,507-33,825/year tuition. Room & board: ~GBP 12,000/year. Total: ~GBP 40,000-45,000/year.',
    admissionProcess: '1. Apply via UCAS by October 15. 2. Submit admissions test (if required). 3. Interview (November-December). 4. Decision: January. 5. Accept offer by June.',
    scholarshipsOffered: 'Cambridge scholarships (limited for international). Gates Cambridge for graduate students. Need-based aid for UK students.',
    admissionDates: 'UCAS deadline: October 15. Interviews: November-December. Decisions: January. Classes start: October (Michaelmas term).',
    examSystem: 'yearly',
  },
  'uni-uk-003': { // Imperial
    closingMerit: 'A-levels: A*A*A - AAA. IB: 38-40 points. Acceptance rate: ~14%. Most admitted have top grades in Math/Science.',
    entryTestDetails: 'Admissions tests for some courses (MAT for Math, PAT for Physics). IELTS (min 7.0, no component below 6.5) or TOEFL (min 92). Interview for some courses.',
    isOpenMerit: false,
    supplyPolicy: 'Failed exam: resit next year. Academic probation if failing multiple papers. Dismissal if not improved.',
    feeRange: 'International: GBP 32,000-38,000/year tuition. Room & board: ~GBP 15,000/year. Total: ~GBP 50,000-55,000/year.',
    admissionProcess: '1. Apply via UCAS by January 15 (or October 15 for Medicine). 2. Submit admissions test (if required). 3. Interview (if required). 4. Decision: March-May. 5. Accept offer by June.',
    scholarshipsOffered: 'Imperial scholarships (limited for international). President\'s Scholarships for PhD. Need-based aid for UK students.',
    admissionDates: 'UCAS deadline: January 15 (October 15 for Medicine). Decisions: March-May. Classes start: September.',
    examSystem: 'yearly',
  },
  'uni-uk-004': { // UCL
    closingMerit: 'A-levels: A*A*A - BBB. IB: 34-38 points. Acceptance rate: ~48%. Varies by program.',
    entryTestDetails: 'Admissions tests for some courses (LNAT for Law, MAT for Math). IELTS (min 7.0, no component below 6.5) or TOEFL (min 92). Interview for some courses.',
    isOpenMerit: false,
    supplyPolicy: 'Failed exam: resit next year. Academic probation if failing multiple papers. Dismissal if not improved.',
    feeRange: 'International: GBP 24,000-35,000/year tuition. Room & board: ~GBP 15,000/year. Total: ~GBP 40,000-50,000/year.',
    admissionProcess: '1. Apply via UCAS by January 15. 2. Submit admissions test (if required). 3. Interview (if required). 4. Decision: March-May. 5. Accept offer by June.',
    scholarshipsOffered: 'UCL scholarships (limited for international). Global Masters Scholarships. Need-based aid for UK students.',
    admissionDates: 'UCAS deadline: January 15. Decisions: March-May. Classes start: September.',
    examSystem: 'yearly',
  },
  'uni-uk-005': { // Edinburgh
    closingMerit: 'A-levels: AAA - ABB. IB: 36-32 points. Acceptance rate: ~50%. Varies by program.',
    entryTestDetails: 'IELTS (min 6.5, no component below 5.5) or TOEFL (min 92). No admissions tests for most programs.',
    isOpenMerit: false,
    supplyPolicy: 'Failed exam: resit next year. Academic probation if failing multiple papers. Dismissal if not improved.',
    feeRange: 'International: GBP 23,000-32,000/year tuition. Room & board: ~GBP 12,000/year. Total: ~GBP 35,000-45,000/year.',
    admissionProcess: '1. Apply via UCAS by January 15. 2. Submit transcripts, personal statement, references. 3. Interview (if required). 4. Decision: March-May. 5. Accept offer by June.',
    scholarshipsOffered: 'Edinburgh scholarships (limited for international). Global Scholarship Program. Need-based aid for UK students.',
    admissionDates: 'UCAS deadline: January 15. Decisions: March-May. Classes start: September.',
    examSystem: 'yearly',
  },
  'uni-uk-006': { // Manchester
    closingMerit: 'A-levels: AAA - BBB. IB: 36-30 points. Acceptance rate: ~55%. Varies by program.',
    entryTestDetails: 'IELTS (min 6.0, no component below 5.5) or TOEFL (min 87). No admissions tests for most programs.',
    isOpenMerit: false,
    supplyPolicy: 'Failed exam: resit next year. Academic probation if failing multiple papers. Dismissal if not improved.',
    feeRange: 'International: GBP 22,000-30,000/year tuition. Room & board: ~GBP 12,000/year. Total: ~GBP 35,000-42,000/year.',
    admissionProcess: '1. Apply via UCAS by January 15. 2. Submit transcripts, personal statement, references. 3. Interview (if required). 4. Decision: March-May. 5. Accept offer by June.',
    scholarshipsOffered: 'Manchester scholarships (limited for international). President\'s Doctoral Scholarships. Need-based aid for UK students.',
    admissionDates: 'UCAS deadline: January 15. Decisions: March-May. Classes start: September.',
    examSystem: 'yearly',
  },

  // ===== CANADA =====
  'uni-ca-001': { // Toronto
    closingMerit: 'Grade 12: 90-95%+ for competitive programs. SAT: 1350-1500. Acceptance rate: ~43%.',
    entryTestDetails: 'SAT or ACT recommended for international. TOEFL (min 89) or IELTS (min 6.5) for international. No admissions tests for most programs.',
    isOpenMerit: false,
    supplyPolicy: 'Failed course: must retake. Academic probation if GPA below 2.0. Dismissal if not improved. Maximum 6 years for 4-year degree.',
    feeRange: 'International: CAD 58,160-67,000/year tuition. Room & board: ~CAD 15,000/year. Total: ~CAD 75,000-82,000/year.',
    admissionProcess: '1. Apply via OUAC. 2. Pay CAD 156 fee. 3. Submit transcripts, SAT/ACT (optional). 4. English test (if required). 5. Decision: March-May. 6. Accept by June.',
    scholarshipsOffered: 'Toronto scholarships (merit-based for international). Lester B. Pearson Scholarship (full ride). Need-based aid for Canadian students.',
    admissionDates: 'Application: October 1 - January 13. Decisions: March-May. Classes start: September (Fall) or January (Winter).',
    examSystem: 'semester',
  },
  'uni-ca-002': { // McGill
    closingMerit: 'Grade 12: 85-95%+ for competitive programs. SAT: 1300-1500. Acceptance rate: ~46%.',
    entryTestDetails: 'SAT or ACT recommended for international. TOEFL (min 90) or IELTS (min 6.5) for international.',
    isOpenMerit: false,
    supplyPolicy: 'Failed course: must retake. Academic probation if GPA below 2.0. Dismissal if not improved.',
    feeRange: 'International: CAD 50,000-60,000/year tuition. Room & board: ~CAD 14,000/year. Total: ~CAD 65,000-75,000/year.',
    admissionProcess: '1. Apply via McGill application. 2. Pay CAD 112 fee. 3. Submit transcripts, SAT/ACT (optional). 4. English test (if required). 5. Decision: March-May.',
    scholarshipsOffered: 'McGill scholarships (merit-based for international). Entrance Scholarships (CAD 3,000-12,000). Need-based aid for Canadian students.',
    admissionDates: 'Application: October 1 - January 15. Decisions: March-May. Classes start: September (Fall) or January (Winter).',
    examSystem: 'semester',
  },
  'uni-ca-003': { // UBC
    closingMerit: 'Grade 12: 85-95%+ for competitive programs. SAT: 1300-1500. Acceptance rate: ~52%.',
    entryTestDetails: 'SAT or ACT recommended for international. TOEFL (min 90) or IELTS (min 6.5) for international.',
    isOpenMerit: false,
    supplyPolicy: 'Failed course: must retake. Academic probation if GPA below 2.0. Dismissal if not improved.',
    feeRange: 'International: CAD 50,000-60,000/year tuition. Room & board: ~CAD 15,000/year. Total: ~CAD 65,000-75,000/year.',
    admissionProcess: '1. Apply via EducationPlannerBC. 2. Pay CAD 115 fee. 3. Submit transcripts, SAT/ACT (optional). 4. English test (if required). 5. Decision: March-May.',
    scholarshipsOffered: 'UBC scholarships (merit-based for international). International Major Entrance Scholarship (CAD 40,000). Need-based aid for Canadian students.',
    admissionDates: 'Application: October 1 - January 15. Decisions: March-May. Classes start: September (Winter Session) or January (Summer Session).',
    examSystem: 'semester',
  },
  'uni-ca-006': { // Waterloo
    closingMerit: 'Grade 12: 90-95%+ for CS/Engineering. SAT: 1350-1500. Acceptance rate: ~53%.',
    entryTestDetails: 'SAT or ACT recommended for international. TOEFL (min 90) or IELTS (min 7.0) for international. Euclid Math Contest recommended for Math/CS.',
    isOpenMerit: false,
    supplyPolicy: 'Failed course: must retake. Academic probation if GPA below 2.0. Dismissal if not improved.',
    feeRange: 'International: CAD 55,000-65,000/year tuition. Room & board: ~CAD 15,000/year. Total: ~CAD 70,000-80,000/year.',
    admissionProcess: '1. Apply via OUAC. 2. Pay CAD 156 fee. 3. Submit transcripts, SAT/ACT (optional). 4. English test (if required). 5. Interview (for some programs). 6. Decision: March-May.',
    scholarshipsOffered: 'Waterloo scholarships (merit-based for international). President\'s Scholarship (CAD 10,000). Need-based aid for Canadian students.',
    admissionDates: 'Application: October 1 - January 13. Decisions: March-May. Classes start: September (Fall) or January (Winter).',
    examSystem: 'semester',
  },

  // ===== AUSTRALIA =====
  'uni-au-001': { // Sydney
    closingMerit: 'ATAR: 80-95+ for competitive programs. IB: 30-38 points. Acceptance rate: ~30%.',
    entryTestDetails: 'IELTS (min 6.5, no component below 6.0) or TOEFL (min 85). No admissions tests for most programs.',
    isOpenMerit: false,
    supplyPolicy: 'Failed unit: must retake. Academic probation if GPA below 4.0 (out of 7). Dismissal if not improved.',
    feeRange: 'International: AUD 45,000-55,000/year tuition. Room & board: ~AUD 20,000/year. Total: ~AUD 65,000-75,000/year.',
    admissionProcess: '1. Apply via Sydney application portal. 2. Pay AUD 100 fee. 3. Submit transcripts, English test. 4. Decision: March-May. 5. Accept by June.',
    scholarshipsOffered: 'Sydney scholarships (merit-based for international). Vice-Chancellor\'s Scholarship (full tuition). Need-based aid for Australian students.',
    admissionDates: 'Application: October 1 - January 31. Decisions: March-May. Classes start: February (Semester 1) or July (Semester 2).',
    examSystem: 'semester',
  },
  'uni-au-002': { // Melbourne
    closingMerit: 'ATAR: 80-95+ for competitive programs. IB: 30-38 points. Acceptance rate: ~35%.',
    entryTestDetails: 'IELTS (min 6.5, no component below 6.0) or TOEFL (min 79). No admissions tests for most programs.',
    isOpenMerit: false,
    supplyPolicy: 'Failed subject: must retake. Academic probation if GPA below 4.0 (out of 7). Dismissal if not improved.',
    feeRange: 'International: AUD 45,000-55,000/year tuition. Room & board: ~AUD 20,000/year. Total: ~AUD 65,000-75,000/year.',
    admissionProcess: '1. Apply via Melbourne application portal. 2. Pay AUD 100 fee. 3. Submit transcripts, English test. 4. Decision: March-May. 5. Accept by June.',
    scholarshipsOffered: 'Melbourne scholarships (merit-based for international). Chancellor\'s Scholarship (full tuition). Need-based aid for Australian students.',
    admissionDates: 'Application: October 1 - January 31. Decisions: March-May. Classes start: February (Semester 1) or July (Semester 2).',
    examSystem: 'semester',
  },

  // ===== UAE =====
  'uni-ae-001': { // Khalifa
    closingMerit: 'EmSAT: 1250-1400+. SAT: 1250-1400. Acceptance rate: ~20%. UAE nationals get priority.',
    entryTestDetails: 'EmSAT or SAT required. IELTS (min 6.0) or TOEFL (min 79) for international. EmSAT Achieve for UAE nationals.',
    isOpenMerit: false,
    supplyPolicy: 'Failed course: must retake. Academic probation if GPA below 2.0. Dismissal if not improved.',
    feeRange: 'International: AED 80,000-100,000/year tuition. Room & board: ~AED 25,000/year. Total: ~AED 105,000-125,000/year.',
    admissionProcess: '1. Apply via Khalifa application portal. 2. Pay AED 300 fee. 3. Submit transcripts, SAT/EmSAT. 4. English test. 5. Interview. 6. Decision: March-May.',
    scholarshipsOffered: 'Khalifa scholarships (merit-based for international). Full scholarships for UAE nationals. Need-based aid available.',
    admissionDates: 'Application: November 1 - March 31. Decisions: April-May. Classes start: September (Fall) or January (Spring).',
    examSystem: 'semester',
  },

  // ===== SINGAPORE =====
  'uni-sg-001': { // NUS
    closingMerit: 'A-levels: AAA-AAB. IB: 36-38 points. SAT: 1400-1500. Acceptance rate: ~5%.',
    entryTestDetails: 'SAT or ACT required for international. TOEFL (min 92) or IELTS (min 6.5) for international. No admissions tests for most programs.',
    isOpenMerit: false,
    supplyPolicy: 'Failed module: must retake. Academic probation if GPA below 2.0. Dismissal if not improved.',
    feeRange: 'International: SGD 35,000-45,000/year tuition. Room & board: ~SGD 10,000/year. Total: ~SGD 45,000-55,000/year.',
    admissionProcess: '1. Apply via NUS application portal. 2. Pay SGD 20 fee. 3. Submit transcripts, SAT/ACT. 4. English test. 5. Interview (for some programs). 6. Decision: March-May.',
    scholarshipsOffered: 'NUS scholarships (merit-based for international). ASEAN Scholarship. Need-based aid for Singapore citizens.',
    admissionDates: 'Application: October 1 - March 15. Decisions: March-May. Classes start: August (Semester 1) or January (Semester 2).',
    examSystem: 'semester',
  },
  'uni-sg-002': { // NTU
    closingMerit: 'A-levels: AAA-AAB. IB: 36-38 points. SAT: 1350-1450. Acceptance rate: ~10%.',
    entryTestDetails: 'SAT or ACT required for international. TOEFL (min 90) or IELTS (min 6.5) for international.',
    isOpenMerit: false,
    supplyPolicy: 'Failed module: must retake. Academic probation if GPA below 2.0. Dismissal if not improved.',
    feeRange: 'International: SGD 35,000-45,000/year tuition. Room & board: ~SGD 10,000/year. Total: ~SGD 45,000-55,000/year.',
    admissionProcess: '1. Apply via NTU application portal. 2. Pay SGD 20 fee. 3. Submit transcripts, SAT/ACT. 4. English test. 5. Interview (for some programs). 6. Decision: March-May.',
    scholarshipsOffered: 'NTU scholarships (merit-based for international). ASEAN Scholarship. Need-based aid for Singapore citizens.',
    admissionDates: 'Application: October 1 - March 15. Decisions: March-May. Classes start: August (Semester 1) or January (Semester 2).',
    examSystem: 'semester',
  },

  // ===== INDIA =====
  'uni-in-001': { // IIT Bombay
    closingMerit: 'JEE Advanced rank: Top 10,000 for CS. Top 50,000 for other branches. Acceptance rate: ~2%.',
    entryTestDetails: 'JEE Main + JEE Advanced required for B.Tech. SAT accepted for international students. TOEFL/IELTS not required for Indian students.',
    isOpenMerit: false,
    supplyPolicy: 'Failed course: must retake. Academic probation if CPI below 5.0. Dismissal if below 5.0 for 2 consecutive semesters.',
    feeRange: 'Indian: INR 200,000-250,000/year tuition. Room & board: ~INR 100,000/year. Total: ~INR 300,000-350,000/year. International: USD 10,000-15,000/year.',
    admissionProcess: '1. Appear for JEE Main (January/April). 2. Qualify for JEE Advanced (May). 3. JoSAA counseling (June-July). 4. Seat allocation. 5. Report to institute.',
    scholarshipsOffered: 'IIT scholarships (merit-cum-means for Indian students). Institute scholarships for international students. Need-based aid available.',
    admissionDates: 'JEE Main: January & April. JEE Advanced: May. JoSAA counseling: June-July. Classes start: July-August.',
    examSystem: 'semester',
  },
  'uni-in-002': { // IIT Delhi
    closingMerit: 'JEE Advanced rank: Top 10,000 for CS. Top 50,000 for other branches. Acceptance rate: ~2%.',
    entryTestDetails: 'JEE Main + JEE Advanced required for B.Tech. SAT accepted for international students.',
    isOpenMerit: false,
    supplyPolicy: 'Failed course: must retake. Academic probation if CPI below 5.0. Dismissal if below 5.0 for 2 consecutive semesters.',
    feeRange: 'Indian: INR 200,000-250,000/year tuition. Room & board: ~INR 100,000/year. Total: ~INR 300,000-350,000/year.',
    admissionProcess: '1. Appear for JEE Main (January/April). 2. Qualify for JEE Advanced (May). 3. JoSAA counseling (June-July). 4. Seat allocation. 5. Report to institute.',
    scholarshipsOffered: 'IIT scholarships (merit-cum-means for Indian students). Institute scholarships for international students.',
    admissionDates: 'JEE Main: January & April. JEE Advanced: May. JoSAA counseling: June-July. Classes start: July-August.',
    examSystem: 'semester',
  },

  // ===== GERMANY =====
  'uni-de-001': { // TUM
    closingMerit: 'Abitur: 1.0-2.0 (German grading). IB: 34-38 points. Acceptance rate: ~8%.',
    entryTestDetails: 'German language required (DSH-2 or TestDaF 4x4) for German programs. IELTS (min 6.5) or TOEFL (min 88) for English programs. GRE recommended for some Master\'s programs.',
    isOpenMerit: false,
    supplyPolicy: 'Failed exam: can retake twice. If failed 3 times: exmatriculation from that program. Academic probation not common.',
    feeRange: 'EU students: No tuition (only ~EUR 150/semester admin fee). Non-EU: EUR 6,000-12,000/year tuition. Room & board: ~EUR 10,000/year.',
    admissionProcess: '1. Apply via uni-assist or TUM portal. 2. Submit transcripts, language test. 3. Application review. 4. Interview (for some programs). 5. Decision: March-May. 6. Enroll by September.',
    scholarshipsOffered: 'TUM scholarships (limited). DAAD scholarships for international students. Deutschlandstipendium (EUR 300/month).',
    admissionDates: 'Winter semester application: March 1 - July 15. Summer semester: October 1 - January 15. Classes start: October (Winter) or April (Summer).',
    examSystem: 'semester',
  },
  'uni-de-002': { // LMU Munich
    closingMerit: 'Abitur: 1.0-2.5. IB: 32-36 points. Acceptance rate: ~10%.',
    entryTestDetails: 'German language required (DSH-2 or TestDaF 4x4) for German programs. IELTS (min 6.5) or TOEFL (min 88) for English programs.',
    isOpenMerit: false,
    supplyPolicy: 'Failed exam: can retake twice. If failed 3 times: exmatriculation from that program.',
    feeRange: 'EU students: No tuition (only ~EUR 150/semester admin fee). Non-EU: EUR 6,000-12,000/year tuition. Room & board: ~EUR 10,000/year.',
    admissionProcess: '1. Apply via uni-assist or LMU portal. 2. Submit transcripts, language test. 3. Application review. 4. Decision: March-May. 5. Enroll by September.',
    scholarshipsOffered: 'LMU scholarships (limited). DAAD scholarships for international students. Deutschlandstipendium.',
    admissionDates: 'Winter semester application: March 1 - July 15. Summer semester: October 1 - January 15. Classes start: October (Winter) or April (Summer).',
    examSystem: 'semester',
  },

  // ===== MALAYSIA =====
  'uni-my-001': { // Malaya
    closingMerit: 'STPM: 3.0-4.0 CGPA. A-levels: BBB-AAA. IB: 30-34 points. Acceptance rate: ~15%.',
    entryTestDetails: 'IELTS (min 6.0) or TOEFL (min 60) for international. MUET (Malaysian University English Test) for local students.',
    isOpenMerit: false,
    supplyPolicy: 'Failed course: must retake. Academic probation if CGPA below 2.0. Dismissal if below 2.0 for 2 consecutive semesters.',
    feeRange: 'International: MYR 25,000-40,000/year tuition. Room & board: ~MYR 8,000/year. Total: ~MYR 35,000-50,000/year.',
    admissionProcess: '1. Apply via UM application portal. 2. Pay MYR 100 fee. 3. Submit transcripts, English test. 4. Decision: March-May. 5. Accept by June.',
    scholarshipsOffered: 'UM scholarships (merit-based for international). ASEAN Scholarship. Need-based aid for Malaysian students.',
    admissionDates: 'Application: March 1 - May 31. Decisions: June-July. Classes start: September (Semester 1) or February (Semester 2).',
    examSystem: 'semester',
  },
};

async function main() {
  console.log('=== Seeding International University AI Knowledge Fields ===\n');

  let updated = 0;
  let notFound = 0;
  for (const [uniId, data] of Object.entries(intlKnowledge)) {
    const uni = await p.university.findUnique({ where: { id: uniId } });
    if (!uni) {
      console.log(`  ⚠️  NOT FOUND: ${uniId}`);
      notFound++;
      continue;
    }
    await p.university.update({
      where: { id: uniId },
      data,
    });
    console.log(`  ✅ ${uni.name}`);
    updated++;
  }

  const totalWithData = await p.university.count({ where: { closingMerit: { not: null } } });
  console.log(`\n=== DONE ===`);
  console.log(`Updated: ${updated} international universities (not found: ${notFound})`);
  console.log(`Total universities with knowledge fields: ${totalWithData}`);

  await p.$disconnect();
}

main();
