import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const institutions = [
  // ═══════════════════════════════════════════════════════════════════
  // 1. BANO QABIL (Alkhidmat Foundation) — LARGEST FREE IT PROGRAM
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'Bano Qabil — Alkhidmat Foundation (Free IT Training Program)',
    type: 'ngo',
    description: 'Bano Qabil is Pakistan\'s largest free IT training program by Alkhidmat Foundation Pakistan. Launched in 2022 in Karachi, it has trained 75,000+ students with 117,000+ registered and 182 active campuses across all provinces. Offers 26+ high-tech courses in AI, web development, cybersecurity, digital marketing, e-commerce, and more. All courses are 4-5 months, completely free, with SBTE certification, incubation support, and a dedicated job portal (BanoQabil Jobs). Partners: Alibaba Cloud, Jazz, Nokia, Mitsubishi, UBL.',
    website: 'https://banoqabil.pk',
    location: '182 campuses across Pakistan — Karachi (32), Lahore, Islamabad, Peshawar, Quetta, Gujranwala, Sargodha, and 61 districts nationwide',
    province: 'all',
    totalCampuses: 182,
    campuses: JSON.stringify({
      summary: '182 active campuses across 61 districts in all provinces',
      byProvince: {
        'Khyber Pakhtunkhwa': '80 campuses',
        'Punjab': '49 campuses',
        'Sindh': '36 campuses',
        'Islamabad': '9 campuses',
        'Balochistan': '8 campuses',
        'Azad Kashmir': '1 campus',
        'Gilgit-Baltistan': '1 campus',
      },
      karachiCampuses: [
        'Al Huda Campus (North Karachi)', 'Al-Aqsa Campus (Gulshan-e-Iqbal)', 'Anjuman Complex (Sakhi Hasan)',
        'Askari Degree College (Bahadurabad)', 'Bahria Town Campus', 'Shah Latif Town', 'Clifton Campus',
        'Garden Campus', 'Gulberg Campus', 'Gulshan-e-Hadeed', 'Harmain Campus (PECHS-6)', 'Liaquatabad',
        'Kausar Town (Malir)', 'Landhi #6', 'Orangi Town 11½', 'PIA Society', 'Metroville (SITE)',
        'Dr. Mehmood Hussain (Shahfaisal Town)', 'Korangi Allah Wala Town', 'SKIT Keamari', 'Safoora (Jauhar)',
        'Sherwani Suites (Gulshan-e-Maymar)', 'Etwa Campus (Gulshan-e-Maymar)', 'HOL Kara Bai (Lyari)',
        'Jamia Tul Ansar (Lyari)', 'KMA Protech (Lyari)', 'Idara Noor-e-Haq', 'Pakistan Central Homeopathic (Nazimabad)',
        'Piston College (Baldia Town)', 'Escuela Schooling (Bahadurabad)', 'Jamia Millia School (Shah Faisal)',
        'Circle Social Welfare (Gulshan-e-Iqbal)',
      ],
      otherCities: [
        'Lahore (multiple campuses)', 'Islamabad (I8, H8, G12, Kahuta Road)', 'Rawalpindi',
        'Peshawar', 'Gujranwala (Aghosh Rahwali)', 'Sargodha (47 Pull)', 'Sheikhupura',
        'Sahiwal', 'Quetta', 'Muzaffargarh', 'Attock', 'Kohat', 'Timergara',
      ],
    }),
    contactEmail: 'info@banoqabil.org',
    contactPhone: '+92-32-8888-8515',
    eligibilityCriteria: 'Age 16-45 years. Minimum Matriculation (10th grade) pass. Intermediate or above preferred for advanced tracks. Basic computer and internet literacy required. Must have access to a computer/laptop. CNIC or B-Form mandatory. Students from all provinces can apply. PKR 3,000 refundable security deposit required.',
    applicationProcess: '1. Register online at banoqabil.pk or visit nearest campus\n2. Appear for aptitude test (English, logic, math, course-related)\n3. Interview (motivation and commitment assessment)\n4. Pay PKR 3,000 refundable security deposit\n5. Select preferred campus and time slot\n6. Attend 4-5 month training program\n7. Complete quizzes, assignments, and final project\n8. Receive SBTE-certified certificate at annual convocation\n9. Access BanoQabil Jobs portal for employment',
    status: 'active',
    sourceUrl: 'https://banoqabil.pk',
    sourceName: 'Bano Qabil Official',
    verificationStatus: 'verified',
    courses: [
      { name: 'Frontend Web Development', duration: '5 months', description: 'HTML, CSS, JavaScript, TypeScript, ReactJS — modern AI-assisted coding tools', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly (Spring, Summer, Fall sessions)' },
      { name: 'Backend Development with Node.js', duration: '5 months', description: 'Node.js, Express.js, MongoDB, REST APIs — production server development', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly' },
      { name: 'Mobile App Development with Flutter', duration: '5 months', description: 'Dart & Flutter — cross-platform iOS & Android apps with AI-assisted development', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly' },
      { name: 'Generative AI', duration: '5 months', description: 'Transformer architectures, RAG systems, fine-tuning, multi-agent orchestration', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly' },
      { name: 'Cyber Security Essentials', duration: '5 months', description: 'Core security principles, real-world defense, cloud security, SOC operations', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly' },
      { name: 'Digital Forensic & Ethical Hacking', duration: '5 months', description: 'Active Directory, MITRE ATT&CK framework, forensic investigation', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly' },
      { name: 'Data Analytics & Business Intelligence', duration: '5 months', description: 'Google Sheets/Excel, SQL, Python, Power BI for data analysis', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly' },
      { name: 'DevOps Foundations', duration: '5 months', description: 'CI/CD, Docker, Kubernetes, AWS, Infrastructure as Code with AI automation', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly' },
      { name: 'SQA & Test Automation', duration: '5 months', description: 'Manual testing to full automation with Selenium, Cypress, API testing', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly' },
      { name: 'UI/UX Design with Figma', duration: '5 months', description: 'Wireframing, prototyping, design systems, user-centered design', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly' },
      { name: 'CIT & Programming Foundations', duration: '5 months', description: 'Basic tech awareness to programming mastery — built for the AI era', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly' },
      { name: 'Digital Marketing', duration: '5 months', description: 'Social media marketing, SEO, Google Ads, freelancing', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly' },
      { name: 'Graphic Designing', duration: '5 months', description: 'Adobe Illustrator & Photoshop for professional branding', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly' },
      { name: 'Video Editing & Animations', duration: '5 months', description: 'Adobe Premiere Pro & After Effects for motion graphics', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly' },
      { name: 'E-Commerce Development Mastery', duration: '5 months', description: 'Shopify, WordPress, WooCommerce — build online stores', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly' },
      { name: 'E-Commerce Marketplace', duration: '5 months', description: 'Sell, market, and grow across Amazon, Daraz, and top platforms', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly' },
      { name: 'Digital Content Creation', duration: '5 months', description: 'Automation-based content business using mobile phone', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly' },
      { name: 'Freelancing & Tech Sales Mastery', duration: '5 months', description: 'Turn digital skills into global income through freelancing', fee: 'Free', certification: 'Bano Qabil / SBTE Certificate', batchStart: 'Quarterly' },
      { name: 'Social Media Management', duration: '2 months', description: 'Facebook, Instagram marketing, content strategy & analytics (Summer Camp)', fee: 'Free', certification: 'Bano Qabil Certificate', batchStart: 'Summer Camp' },
      { name: 'AI for Everyone', duration: '2 months', description: 'Complete AI course for beginners — generative AI tools (Summer Camp)', fee: 'Free', certification: 'Bano Qabil Certificate', batchStart: 'Summer Camp' },
      { name: 'Web Development with AI', duration: '2 months', description: 'HTML, CSS, JavaScript from scratch — responsive websites (Summer Camp)', fee: 'Free', certification: 'Bano Qabil Certificate', batchStart: 'Summer Camp' },
    ],
    entryTests: [
      {
        testName: 'Bano Qabil Aptitude Test',
        type: 'aptitude',
        totalMarks: 100,
        passingMarks: 50,
        passingPercentage: '50%',
        syllabus: 'Basic English, logical reasoning, mathematics, and course-related questions',
        preparationTips: 'Practice basic English comprehension and grammar. Review elementary math and logic. Familiarize yourself with basic computer concepts. Sample tests available on banoqabil.pk.',
      },
    ],
    documents: [
      { documentName: 'CNIC or B-Form', description: 'Valid national identity card (mandatory for certification)', isRequired: true },
      { documentName: 'Educational Certificates', description: 'Matriculation / Intermediate / degree certificates', isRequired: true },
      { documentName: 'Photographs', description: '2 recent passport-size photographs', isRequired: true },
      { documentName: 'Laptop/Computer Access', description: 'Must have access to a computer/laptop with internet for classes', isRequired: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 2. SAYLANI MASS IT TRAINING (SMIT)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'Saylani Mass IT Training (SMIT)',
    type: 'ngo',
    description: 'Saylani Mass IT Training (SMIT) is one of Pakistan\'s largest free IT training programs with 200,000+ students trained to date. Offers 80+ specialized courses in web/app development, AI, digital marketing, graphic design, freelancing, and more. Courses are free, project-based, and delivered by industry experts. Training centers across Karachi, Lahore, Islamabad, and other major cities.',
    website: 'https://saylaniwelfare.com/services/education/technical-education/saylani-mass-it-training',
    location: 'Karachi (HQ), Lahore, Islamabad, Peshawar, Faisalabad, Multan, Hyderabad — multiple centers in each city',
    province: 'all',
    totalCampuses: 25,
    campuses: JSON.stringify({
      majorCities: ['Karachi (multiple centers: Gulshan, North Nazimabad, Saddar, Korangi, Orangi)', 'Lahore (Iqbal Town, Model Town, Johar Town)', 'Islamabad (F-8, G-11)', 'Peshawar (University Road)', 'Faisalabad', 'Multan', 'Hyderabad'],
    }),
    contactEmail: 'training@saylaniwelfare.com',
    contactPhone: '+92-21-34980400',
    eligibilityCriteria: 'Age 18-35 years. Minimum Matriculation education. Must be unemployed or earning below PKR 25,000/month. Must be willing to attend regular classes (3-6 months). No criminal record.',
    applicationProcess: '1. Visit nearest SMIT center or apply online at smit.pk\n2. Fill registration form and select course\n3. Appear for basic IT assessment\n4. Shortlisted candidates enrolled in next batch\n5. Classes held 5 days a week for 3-6 months\n6. Complete projects and final assessment\n7. Receive SMIT certification',
    status: 'active',
    sourceUrl: 'https://saylaniwelfare.com/services/education/technical-education/saylani-mass-it-training',
    sourceName: 'Saylani Welfare Official',
    verificationStatus: 'verified',
    courses: [
      { name: 'Web & App Development', duration: '6 months', description: 'HTML, CSS, JavaScript, React, Node.js, MongoDB — full-stack web and mobile development', fee: 'Free', certification: 'SMIT Certificate', batchStart: 'Monthly enrollment' },
      { name: 'AI & Data Science', duration: '6 months', description: 'Python, machine learning, data analysis, TensorFlow, NLP basics', fee: 'Free', certification: 'SMIT Certificate', batchStart: 'Monthly enrollment' },
      { name: 'Digital Marketing', duration: '3 months', description: 'SEO, Google Ads, Facebook/Instagram marketing, content strategy, analytics', fee: 'Free', certification: 'SMIT Certificate', batchStart: 'Monthly enrollment' },
      { name: 'Graphic Design', duration: '3 months', description: 'Adobe Photoshop, Illustrator, InDesign, branding, logo design', fee: 'Free', certification: 'SMIT Certificate', batchStart: 'Monthly enrollment' },
      { name: 'Video Editing & Motion Graphics', duration: '3 months', description: 'Adobe Premiere Pro, After Effects, video production, animation', fee: 'Free', certification: 'SMIT Certificate', batchStart: 'Monthly enrollment' },
      { name: 'Freelancing & Earning Online', duration: '2 months', description: 'Upwork, Fiverr, Freelancer profiles, bidding strategies, client management', fee: 'Free', certification: 'SMIT Certificate', batchStart: 'Monthly enrollment' },
      { name: 'Data Entry & Office Management', duration: '3 months', description: 'MS Office, data entry speed training, filing systems, typing', fee: 'Free', certification: 'SMIT Certificate', batchStart: 'Monthly enrollment' },
      { name: 'Python Programming', duration: '4 months', description: 'Python fundamentals, OOP, Django, data analysis, automation scripts', fee: 'Free', certification: 'SMIT Certificate', batchStart: 'Monthly enrollment' },
    ],
    entryTests: [
      {
        testName: 'SMIT Basic IT Assessment',
        type: 'aptitude',
        totalMarks: 50,
        passingMarks: 20,
        passingPercentage: '40%',
        syllabus: 'Basic computer knowledge, typing speed, simple English comprehension, general aptitude',
        preparationTips: 'Practice typing (aim for 20 WPM). Learn basic computer operations. Study simple English grammar.',
      },
    ],
    documents: [
      { documentName: 'CNIC / B-Form', description: 'Valid identity document', isRequired: true },
      { documentName: 'Educational Certificates', description: 'Matric certificate or equivalent', isRequired: true },
      { documentName: 'Photographs', description: '4 passport-size photographs', isRequired: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 3. GIAIC (Governor Sindh Initiative for AI, Cloud & Cybersecurity)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'GIAIC — Governor Sindh Initiative for AI, Cloud Computing & Cybersecurity',
    type: 'govt',
    description: 'Governor Sindh Kamran Tessori launched GIAIC — one of Pakistan\'s largest free tech education programs. Over 500,000+ students enrolled. Offers free courses in AI, machine learning, cloud computing (AWS, Azure), cybersecurity, full-stack development, and blockchain. Courses conducted online and at physical centers across Sindh. Graduates receive internationally recognized certifications.',
    website: 'https://giaic.org',
    location: 'Karachi (HQ), with online classes nationwide',
    province: 'sindh',
    totalCampuses: 15,
    campuses: JSON.stringify({
      majorCenters: ['Karachi (main center)', 'Hyderabad', 'Sukkur', 'Larkana', 'Online classes available nationwide'],
    }),
    contactEmail: 'info@giaic.org',
    contactPhone: '+92-21-999-GIAIC',
    eligibilityCriteria: 'Age 16-45 years. Minimum Matriculation (10th grade) pass. Intermediate or above preferred for advanced tracks. Basic computer and internet literacy required. CNIC or B-Form mandatory. Students from all provinces can apply (online classes available).',
    applicationProcess: '1. Visit giaic.org and create an account\n2. Fill enrollment form with personal and educational details\n3. Select learning track (AI, Cloud, Cybersecurity, Web3, etc.)\n4. Complete online aptitude assessment\n5. Receive confirmation email with batch schedule\n6. Attend online or in-person classes\n7. Complete all modules and assignments\n8. Pass final assessment for certification',
    status: 'active',
    sourceUrl: 'https://giaic.org',
    sourceName: 'GIAIC Official',
    verificationStatus: 'verified',
    courses: [
      { name: 'Artificial Intelligence & Machine Learning', duration: '6 months', description: 'Python, TensorFlow, neural networks, NLP, computer vision', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', batchStart: 'Quarterly' },
      { name: 'Cloud Computing (AWS + Azure)', duration: '4 months', description: 'Cloud architecture, deployment, management on AWS and Azure', fee: 'Free (Govt Funded)', certification: 'GIAIC + AWS Cloud Practitioner Prep', batchStart: 'Quarterly' },
      { name: 'Cybersecurity & Ethical Hacking', duration: '5 months', description: 'Network security, penetration testing, vulnerability assessment', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', batchStart: 'Quarterly' },
      { name: 'Full Stack Web Development', duration: '6 months', description: 'MERN stack, TypeScript, DevOps basics', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', batchStart: 'Quarterly' },
      { name: 'Blockchain & Web3 Development', duration: '4 months', description: 'Smart contracts, Solidity, DApps, decentralized finance', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', batchStart: 'Quarterly' },
      { name: 'Data Science & Analytics', duration: '5 months', description: 'Data analysis, visualization, SQL, Python, business intelligence', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', batchStart: 'Quarterly' },
    ],
    entryTests: [
      {
        testName: 'GIAIC Online Aptitude Assessment',
        type: 'online',
        totalMarks: 100,
        passingMarks: 50,
        passingPercentage: '50%',
        syllabus: 'Basic mathematics, logical reasoning, English comprehension, general computer knowledge',
        preparationTips: 'Review basic math and logic. Practice English reading comprehension. Sample tests available on giaic.org.',
      },
    ],
    documents: [
      { documentName: 'CNIC or B-Form', description: 'Valid national identity card (mandatory for certification)', isRequired: true },
      { documentName: 'Educational Certificates', description: 'Matriculation/Intermediate/degree certificates', isRequired: true },
      { documentName: 'Photographs', description: '2 recent photographs', isRequired: true },
      { documentName: 'Computer & Internet Access', description: 'Laptop/desktop with stable internet for online classes', isRequired: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 4. NAVTTC (National Vocational & Technical Training Commission)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'NAVTTC (National Vocational & Technical Training Commission)',
    type: 'govt',
    description: 'Pakistan\'s apex regulatory body for technical and vocational education. Runs USTP (Ustad Tapp - Master Apprenticeship) and PM Youth Skill Loan Scheme. Offers free certification courses in IT (AI, Data Science, Java, Cybersecurity), vocational trades (electrician, plumber, welder, mechanic, beautician, tailor), solar installation, and industrial trades across Pakistan through 100+ training centers.',
    website: 'https://navttc.gov.pk',
    location: 'Islamabad (HQ), Regional centers across all provinces — 100+ affiliated training institutes',
    province: 'all',
    totalCampuses: 100,
    campuses: JSON.stringify({
      summary: '100+ affiliated training institutes across Pakistan',
      majorCenters: ['Islamabad (HQ)', 'Lahore', 'Karachi', 'Peshawar', 'Quetta', 'Faisalabad', 'Multan', 'Rawalpindi', 'Hyderabad', 'Sargodha'],
    }),
    contactEmail: 'info@navttc.gov.pk',
    contactPhone: '+92-51-9263132',
    eligibilityCriteria: 'Age 18-40 years. Minimum Matriculation for IT courses, Middle for vocational trades. Must be Pakistani citizen. Must not be currently employed in similar trade. Preference to unemployed youth.',
    applicationProcess: '1. Apply online at navttc.gov.pk or visit nearest NAVTTC center\n2. Register for preferred course/trade\n3. Appear for basic aptitude test\n4. Shortlisted candidates enrolled in 3-12 month training\n5. Training includes stipend for eligible candidates',
    status: 'active',
    sourceUrl: 'https://navttc.gov.pk',
    sourceName: 'NAVTTC Official',
    verificationStatus: 'verified',
    courses: [
      { name: 'Data Science & AI', duration: '6 months', description: 'Python, machine learning, data analysis, AI fundamentals', fee: 'Free (with stipend)', certification: 'NAVTTC Certified', batchStart: 'January, April, July, October' },
      { name: 'Advanced Web Application Development', duration: '6 months', description: 'Full-stack web development with modern frameworks', fee: 'Free (with stipend)', certification: 'NAVTTC Certified', batchStart: 'January, April, July, October' },
      { name: 'Advanced Python Programming', duration: '6 months', description: 'Python OOP, Django/Flask, APIs, automation', fee: 'Free (with stipend)', certification: 'NAVTTC Certified', batchStart: 'January, April, July, October' },
      { name: 'Java Development', duration: '6 months', description: 'Java SE/EE, Spring Boot, enterprise development', fee: 'Free (with stipend)', certification: 'NAVTTC Certified', batchStart: 'January, April, July, October' },
      { name: 'Cyber Security', duration: '6 months', description: 'Network security, ethical hacking, compliance', fee: 'Free (with stipend)', certification: 'NAVTTC Certified', batchStart: 'January, April, July, October' },
      { name: 'Cloud Computing', duration: '6 months', description: 'AWS/Azure basics, cloud deployment, management', fee: 'Free (with stipend)', certification: 'NAVTTC Certified', batchStart: 'January, April, July, October' },
      { name: 'Digital Marketing', duration: '3 months', description: 'SEO, social media marketing, Google Ads, content strategy', fee: 'Free (with stipend)', certification: 'NAVTTC Certified', batchStart: 'January, April, July, October' },
      { name: 'Video Editing', duration: '3 months', description: 'Adobe Premiere Pro, After Effects, video production', fee: 'Free (with stipend)', certification: 'NAVTTC Certified', batchStart: 'January, April, July, October' },
      { name: 'Electrician & Solar Installation', duration: '3 months', description: 'Electrical wiring, solar panel installation, inverter maintenance', fee: 'Free (with stipend)', certification: 'NAVTTC Trade Certificate', batchStart: 'January, April, July, October' },
      { name: 'Plumbing & Pipe Fitting', duration: '3 months', description: 'Residential/commercial plumbing, pipe fitting, water systems', fee: 'Free (with stipend)', certification: 'NAVTTC Trade Certificate', batchStart: 'January, April, July, October' },
      { name: 'Automobile Mechanic', duration: '6 months', description: 'Engine repair, transmission, electrical systems, diagnostics', fee: 'Free (with stipend)', certification: 'NAVTTC Trade Certificate', batchStart: 'January, April, July, October' },
      { name: 'Welding & Fabrication', duration: '3 months', description: 'Arc welding, gas welding, fabrication, metal work', fee: 'Free (with stipend)', certification: 'NAVTTC Trade Certificate', batchStart: 'January, April, July, October' },
    ],
    entryTests: [
      {
        testName: 'NAVTTC General Aptitude Test',
        type: 'aptitude',
        totalMarks: 100,
        passingMarks: 50,
        passingPercentage: '50%',
        syllabus: 'General knowledge, basic mathematics, English comprehension, analytical reasoning, trade-specific questions',
        preparationTips: 'Practice basic math (percentages, ratios). Read English comprehension passages. Study trade-specific fundamentals.',
      },
    ],
    documents: [
      { documentName: 'CNIC', description: 'Valid National Identity Card', isRequired: true },
      { documentName: 'Educational Certificates', description: 'Matric and above certificates/marksheets', isRequired: true },
      { documentName: 'Domicile Certificate', description: 'Provincial domicile', isRequired: false },
      { documentName: 'Photographs', description: '4 recent passport-size photographs', isRequired: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 5. TEVTA (Technical Education & Vocational Training Authority)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'TEVTA (Technical Education & Vocational Training Authority, Punjab)',
    type: 'govt',
    description: 'Punjab government\'s technical education authority providing free vocational training at government polytechnic institutes. Offers courses in automotive, electrical, plumbing, IT, hospitality, and industrial trades. Training at 50+ government polytechnic institutes across Punjab.',
    website: 'https://tevta.punjab.gov.pk',
    location: 'Lahore (HQ), TEVTA institutes across Punjab — 50+ government polytechnic centers',
    province: 'punjab',
    totalCampuses: 50,
    campuses: JSON.stringify({
      summary: '50+ government polytechnic institutes across Punjab',
      majorCenters: ['Lahore (Govt College of Technology)', 'Faisalabad', 'Multan', 'Rawalpindi', 'Sargodha', 'Gujranwala', 'Bahawalpur', 'Dera Ghazi Khan'],
    }),
    contactEmail: 'info@tevta.punjab.gov.pk',
    contactPhone: '+92-42-37023000',
    eligibilityCriteria: 'Age 15-45 years. Minimum Middle (8th grade) for most courses, Matric for advanced courses. Must be Punjab resident. Must be unemployed or career changer.',
    applicationProcess: '1. Visit nearest TEVTA institute\n2. Register for preferred trade course\n3. Appear for entry test (for some courses)\n4. Selected candidates enrolled in 3-18 month programs\n5. All training provided free of cost',
    status: 'active',
    sourceUrl: 'https://tevta.punjab.gov.pk',
    sourceName: 'TEVTA Official',
    verificationStatus: 'verified',
    courses: [
      { name: 'Automobile Mechanic', duration: '12 months', description: 'Engine repair, transmission, electrical systems, diagnostics', fee: 'Free', certification: 'TEVTA Trade Certificate', batchStart: 'January, July' },
      { name: 'Electrician', duration: '6 months', description: 'House wiring, motor winding, solar systems, safety', fee: 'Free', certification: 'TEVTA Trade Certificate', batchStart: 'January, July' },
      { name: 'Plumber', duration: '6 months', description: 'Residential plumbing, pipe fitting, water pumps, drainage', fee: 'Free', certification: 'TEVTA Trade Certificate', batchStart: 'January, July' },
      { name: 'Welder & Fabricator', duration: '6 months', description: 'Arc welding, gas welding, fabrication, metal work', fee: 'Free', certification: 'TEVTA Trade Certificate', batchStart: 'January, July' },
      { name: 'Tailoring & Dress Making', duration: '6 months', description: 'Cutting, stitching, embroidery, fashion design basics', fee: 'Free', certification: 'TEVTA Trade Certificate', batchStart: 'January, July' },
      { name: 'Computer Operator', duration: '6 months', description: 'MS Office, data entry, basic troubleshooting, internet', fee: 'Free', certification: 'TEVTA Trade Certificate', batchStart: 'January, July' },
    ],
    entryTests: [
      {
        testName: 'TEVTA Trade Aptitude Test',
        type: 'aptitude',
        totalMarks: 100,
        passingMarks: 40,
        passingPercentage: '40%',
        syllabus: 'General knowledge, basic mathematics, trade-specific questions, physical fitness (for some trades)',
        preparationTips: 'For IT courses: practice basic computer operations. For trade courses: basic math and mechanical aptitude.',
      },
    ],
    documents: [
      { documentName: 'CNIC / B-Form', description: 'Valid identity document', isRequired: true },
      { documentName: 'Educational Certificates', description: 'Middle/Matric certificates', isRequired: true },
      { documentName: 'Domicile', description: 'Punjab domicile', isRequired: false },
      { documentName: 'Photographs', description: '4 passport-size photographs', isRequired: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 6. PITB / DigiSkills (Punjab Freelancing Commission)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'DigiSkills (Punjab Freelancing Commission)',
    type: 'govt',
    description: 'Punjab government\'s free online digital skills training platform (formerly under PITB, now Punjab Freelancing Commission). Offers 12-week courses in freelancing, graphic design, SEO, e-commerce, WordPress, and more. Completely online — learn from anywhere. Over 2 million registered learners.',
    website: 'https://digiskills.pk',
    location: 'Online platform — accessible from anywhere in Pakistan',
    province: 'all',
    totalCampuses: 1,
    campuses: JSON.stringify({ summary: '100% online — no physical campus needed', platform: 'digiskills.pk' }),
    contactEmail: 'info@digiskills.pk',
    contactPhone: '+92-42-35813106',
    eligibilityCriteria: 'No age or education restriction. Open to all Pakistani citizens. Must have internet access and a computer/laptop. Basic English helpful for most courses.',
    applicationProcess: '1. Visit digiskills.pk\n2. Create free account\n3. Enroll in any course (no entry test)\n4. Watch video lectures at your own pace\n5. Complete assignments\n6. Download course certificate',
    status: 'active',
    sourceUrl: 'https://digiskills.pk',
    sourceName: 'DigiSkills Official',
    verificationStatus: 'verified',
    courses: [
      { name: 'Freelancing', duration: '12 weeks', description: 'Upwork, Fiverr, Freelancer — profiles, bidding, proposals, client management', fee: 'Free', certification: 'DigiSkills Certificate', batchStart: 'Rolling enrollment' },
      { name: 'Graphic Design', duration: '12 weeks', description: 'Photoshop, Illustrator, Canva, logo design, branding', fee: 'Free', certification: 'DigiSkills Certificate', batchStart: 'Rolling enrollment' },
      { name: 'SEO & Content Marketing', duration: '12 weeks', description: 'On-page SEO, keyword research, content writing, WordPress', fee: 'Free', certification: 'DigiSkills Certificate', batchStart: 'Rolling enrollment' },
      { name: 'E-Commerce', duration: '12 weeks', description: 'Daraz seller, Shopify, inventory management, customer service', fee: 'Free', certification: 'DigiSkills Certificate', batchStart: 'Rolling enrollment' },
      { name: 'WordPress Development', duration: '12 weeks', description: 'WordPress setup, theme customization, plugin development, hosting', fee: 'Free', certification: 'DigiSkills Certificate', batchStart: 'Rolling enrollment' },
      { name: 'QuickBooks & Accounting', duration: '8 weeks', description: 'Financial accounting, invoicing, tax management, reports', fee: 'Free', certification: 'DigiSkills Certificate', batchStart: 'Rolling enrollment' },
    ],
    entryTests: [
      {
        testName: 'No Entry Test',
        type: 'none',
        totalMarks: null,
        passingMarks: null,
        passingPercentage: 'N/A',
        syllabus: 'No entry test required. Open enrollment.',
        preparationTips: 'No preparation needed. Just create an account and start learning.',
      },
    ],
    documents: [
      { documentName: 'Email Address', description: 'Valid email for account creation', isRequired: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 7. PSDF (Pakistan Skills Development Fund)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'PSDF (Pakistan Skills Development Fund)',
    type: 'govt',
    description: 'Federal government skills development fund providing free technical and vocational training through partner institutes. Covers IT, construction, health, hospitality, textile, and manufacturing sectors. Focuses on market-relevant trades with job placement support.',
    website: 'https://psdf.org.pk',
    location: 'Lahore (HQ), Training centers across Pakistan through partner institutes',
    province: 'all',
    totalCampuses: 30,
    campuses: JSON.stringify({
      summary: '30+ partner training institutes across Pakistan',
      majorCenters: ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Peshawar', 'Multan'],
    }),
    contactEmail: 'info@psdf.org.pk',
    contactPhone: '+92-42-35782200',
    eligibilityCriteria: 'Age 18-45 years. Minimum education: Middle (8th grade). Must be Pakistani citizen. Must be unemployed or earning below PKR 25,000/month. Priority to women and persons with disabilities.',
    applicationProcess: '1. Apply through PSDF partner institutes or online portal\n2. Register for preferred course\n3. Appear for entrance assessment\n4. Selected candidates enrolled in training program\n5. Training provided free with stipend',
    status: 'active',
    sourceUrl: 'https://psdf.org.pk',
    sourceName: 'PSDF Official',
    verificationStatus: 'verified',
    courses: [
      { name: 'IT & Software Development', duration: '6 months', description: 'Programming fundamentals, web development, database management', fee: 'Free', certification: 'PSDF Industry Certificate', batchStart: 'January, March, June, September' },
      { name: 'Graphic Design & Video Editing', duration: '3 months', description: 'Adobe Creative Suite, motion graphics, video production', fee: 'Free', certification: 'PSDF Creative Certificate', batchStart: 'January, March, June, September' },
      { name: 'Healthcare Assistant', duration: '6 months', description: 'First aid, patient care, medical terminology, pharmacy basics', fee: 'Free', certification: 'PSDF Healthcare Certificate', batchStart: 'January, March, June, September' },
      { name: 'Construction & Masonry', duration: '3 months', description: 'Building construction, masonry, carpentry, safety protocols', fee: 'Free', certification: 'PSDF Construction Certificate', batchStart: 'January, March, June, September' },
      { name: 'Automotive Repair & Maintenance', duration: '6 months', description: 'Engine repair, electrical systems, diagnostics, maintenance', fee: 'Free', certification: 'PSDF Automotive Certificate', batchStart: 'January, March, June, September' },
      { name: 'Textile & Garment Manufacturing', duration: '3 months', description: 'Fabric cutting, stitching, quality control, industrial sewing', fee: 'Free', certification: 'PSDF Textile Certificate', batchStart: 'January, March, June, September' },
    ],
    entryTests: [
      {
        testName: 'PSDF Skills Assessment Test',
        type: 'aptitude',
        totalMarks: 100,
        passingMarks: 40,
        passingPercentage: '40%',
        syllabus: 'Basic numeracy, reading comprehension, logical reasoning, trade-specific questions',
        preparationTips: 'Focus on basic math skills. Practice reading comprehension. PSDF provides free pre-training on website.',
      },
    ],
    documents: [
      { documentName: 'CNIC', description: 'Valid National Identity Card', isRequired: true },
      { documentName: 'Educational Certificates', description: 'Middle/Matric/Intermediate certificates', isRequired: true },
      { documentName: 'Photographs', description: '4 recent passport-size photographs', isRequired: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 8. HANDS Pakistan (Health and Nutrition Development Society)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'HANDS Pakistan (Health and Nutrition Development Society)',
    type: 'ngo',
    description: 'Major Pakistani NGO providing free healthcare training, nutrition education, and community development courses. Offers courses in community health, midwifery, nutrition, and public health. Programs focused on rural and underserved communities in Sindh, Punjab, and Balochistan.',
    website: 'https://hands.org.pk',
    location: 'Karachi (HQ), Branches in Sindh, Punjab, Balochistan',
    province: 'sindh',
    totalCampuses: 20,
    campuses: JSON.stringify({
      summary: '20+ field offices and training centers',
      majorCenters: ['Karachi (HQ)', 'Hyderabad', 'Badin', 'Thatta', 'Larkana', 'Quetta', 'Lahore'],
    }),
    contactEmail: 'info@hands.org.pk',
    contactPhone: '+92-21-34542014',
    eligibilityCriteria: 'Age 18-40 years. Minimum Matriculation education. Must be Pakistani citizen. Priority to women for health/nutrition courses. Must be willing to work in rural/underserved communities.',
    applicationProcess: '1. Apply at nearest HANDS center\n2. Submit application with educational documents\n3. Appear for interview\n4. Selected candidates enrolled in training\n5. Training includes field work in rural areas',
    status: 'active',
    sourceUrl: 'https://hands.org.pk',
    sourceName: 'HANDS Pakistan',
    verificationStatus: 'verified',
    courses: [
      { name: 'Community Health Worker Training', duration: '6 months', description: 'First aid, maternal health, child care, disease prevention, nutrition', fee: 'Free', certification: 'HANDS Community Health Certificate', batchStart: 'Quarterly' },
      { name: 'Lady Health Worker (LHW) Course', duration: '6 months', description: 'Family planning, antenatal care, immunization, health education', fee: 'Free', certification: 'HANDS LHW Certificate', batchStart: 'Quarterly' },
      { name: 'Nutrition & Dietetics', duration: '3 months', description: 'Malnutrition management, food preparation, community nutrition', fee: 'Free', certification: 'HANDS Nutrition Certificate', batchStart: 'Quarterly' },
      { name: 'Basic Life Support (BLS)', duration: '1 month', description: 'CPR, first aid, emergency response, basic medical care', fee: 'Free', certification: 'HANDS BLS Certificate', batchStart: 'Monthly' },
    ],
    entryTests: [
      {
        testName: 'HANDS Basic Assessment',
        type: 'aptitude',
        totalMarks: 50,
        passingMarks: 20,
        passingPercentage: '40%',
        syllabus: 'General knowledge, basic science, English comprehension, motivation assessment',
        preparationTips: 'Review basic science concepts (biology, health). Practice English comprehension.',
      },
    ],
    documents: [
      { documentName: 'CNIC / B-Form', description: 'Valid identity document', isRequired: true },
      { documentName: 'Educational Certificates', description: 'Matric or above certificates', isRequired: true },
      { documentName: 'Photographs', description: '4 passport-size photographs', isRequired: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 9. JDC IT Centre
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'JDC IT Centre (Jafaria Disaster Management Council)',
    type: 'ngo',
    description: 'JDC IT Centre provides completely free IT and computer education to students across Pakistan, with a focus on Karachi. Founded by Zafar Abbas, JDC has trained thousands of students in web development, graphic design, video editing, and other digital skills. All courses are 100% free. JDC also provides free laptops to top-performing students.',
    website: 'https://jdcentre.org',
    location: 'Karachi, Sindh (main center) with expanding reach across Pakistan',
    province: 'sindh',
    totalCampuses: 5,
    campuses: JSON.stringify({
      majorCenters: ['Karachi (main IT center)', 'Karachi (branch centers)', 'Expanding to other cities'],
    }),
    contactEmail: 'info@jdcentre.org',
    contactPhone: '+92-21-34980400',
    eligibilityCriteria: 'Open to all Pakistani students aged 15-45. No minimum education for basic courses. Intermediate or above preferred for advanced courses. Must attend regular classes. Low-income families given priority.',
    applicationProcess: '1. Visit nearest JDC IT Centre\n2. Fill registration form\n3. Select course and batch timing\n4. Submit documents (CNIC/B-Form, certificates)\n5. Attend orientation\n6. Begin classes\n7. Maintain 80% attendance\n8. Receive certificate on completion',
    status: 'active',
    sourceUrl: 'https://jdcentre.org',
    sourceName: 'JDC IT Centre',
    verificationStatus: 'verified',
    courses: [
      { name: 'Web Development (HTML, CSS, JavaScript)', duration: '3 months', description: 'Complete frontend web development course', fee: 'Free', certification: 'JDC Certificate', batchStart: 'Rolling admissions — new batch every month' },
      { name: 'Graphic Design (Photoshop, Illustrator)', duration: '2 months', description: 'Professional graphic design using industry-standard tools', fee: 'Free', certification: 'JDC Certificate', batchStart: 'Rolling admissions' },
      { name: 'Video Editing (Premiere Pro, After Effects)', duration: '2 months', description: 'Professional video editing and motion graphics', fee: 'Free', certification: 'JDC Certificate', batchStart: 'Rolling admissions' },
      { name: 'Digital Marketing', duration: '6 weeks', description: 'SEO, social media marketing, Google Ads, content strategy', fee: 'Free', certification: 'JDC Certificate', batchStart: 'Rolling admissions' },
      { name: 'Microsoft Office & Computer Basics', duration: '1 month', description: 'Basic computer literacy and MS Office suite', fee: 'Free', certification: 'JDC Certificate', batchStart: 'Rolling admissions' },
      { name: 'Freelancing & Earning Online', duration: '4 weeks', description: 'Fiverr, Upwork — profile setup, bidding, client management', fee: 'Free', certification: 'JDC Certificate', batchStart: 'Rolling admissions' },
    ],
    entryTests: [
      {
        testName: 'JDC Entry Assessment',
        type: 'aptitude',
        totalMarks: 50,
        passingMarks: 25,
        passingPercentage: '50%',
        syllabus: 'Basic computer knowledge, general aptitude, motivation assessment',
        preparationTips: 'Review basic computer concepts. Be prepared to explain your motivation.',
      },
    ],
    documents: [
      { documentName: 'CNIC or B-Form', description: 'National identity card or birth certificate', isRequired: true },
      { documentName: 'Educational Certificates', description: 'Last qualification certificate (if available)', isRequired: false },
      { documentName: 'Photographs', description: '2 recent photographs', isRequired: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 10. Ignite (National Technology Fund)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'Ignite — National Technology Fund',
    type: 'govt',
    description: 'Federal government initiative under Ministry of IT & Telecom to promote innovation and technology. Funds DigiSkills, NTC training, startup incubation (NIC, PNIC), and technology grants. Ignite itself primarily funds programs rather than running direct courses, but supports multiple training initiatives across Pakistan.',
    website: 'https://ignite.gov.pk',
    location: 'Islamabad (HQ), funds programs nationwide through NTC, DigiSkills, and NICs',
    province: 'all',
    totalCampuses: 10,
    campuses: JSON.stringify({
      summary: 'Funds programs through partner organizations nationwide',
      programs: ['DigiSkills (online)', 'NTC Training Centers', 'NIC Islamabad', 'PNIC (Punjab)', 'SNIC (Sindh)', 'KNIC (KP)', 'BNIC (Balochistan)'],
    }),
    contactEmail: 'info@ignite.gov.pk',
    contactPhone: '+92-51-9213444',
    eligibilityCriteria: 'Varies by program. For startup incubation: must have innovative tech idea. For NTC courses: age 18-35, minimum Bachelor\'s for advanced courses. For DigiSkills: open to all.',
    applicationProcess: '1. Visit ignite.gov.pk for current programs\n2. Apply through specific program (DigiSkills, NTC, NIC)\n3. Each program has its own application process\n4. Selected candidates receive training/incubation support',
    status: 'active',
    sourceUrl: 'https://ignite.gov.pk',
    sourceName: 'Ignite Official',
    verificationStatus: 'verified',
    courses: [
      { name: 'NTC IT Courses (various)', duration: '3-6 months', description: 'Through National Training Center — web development, networking, cybersecurity, cloud computing', fee: 'Free / Subsidized', certification: 'NTC / Ignite Certificate', batchStart: 'Quarterly' },
      { name: 'Startup Incubation (NIC/PNIC)', duration: '6 months', description: 'Business mentorship, seed funding, office space, technical guidance for tech startups', fee: 'Free (equity-based)', certification: 'NIC Incubation Certificate', batchStart: 'Bi-annual intake' },
      { name: 'DigiSkills (Online Platform)', duration: '12 weeks', description: 'Freelancing, graphic design, SEO, e-commerce — see DigiSkills entry above', fee: 'Free', certification: 'DigiSkills Certificate', batchStart: 'Rolling enrollment' },
    ],
    entryTests: [
      {
        testName: 'Program-Specific Assessment',
        type: 'varies',
        totalMarks: 100,
        passingMarks: 50,
        passingPercentage: '50%',
        syllabus: 'Varies by program — technical interview for startups, aptitude for NTC courses',
        preparationTips: 'Check specific program requirements on ignite.gov.pk. For startups: prepare pitch deck and MVP demo.',
      },
    ],
    documents: [
      { documentName: 'CNIC', description: 'Valid National Identity Card', isRequired: true },
      { documentName: 'CV / Resume', description: 'Updated CV with skills highlighted', isRequired: true },
      { documentName: 'Educational Certificates', description: 'Degree certificates (for advanced programs)', isRequired: false },
    ],
  },
];

async function main() {
  console.log('Seeding free course institutions (verified data)...');

  await prisma.institutionDocument.deleteMany();
  await prisma.institutionEntryTest.deleteMany();
  await prisma.institutionCourse.deleteMany();
  await prisma.freeInstitution.deleteMany();

  let count = 0;
  for (const inst of institutions) {
    const { courses, entryTests, documents, ...instData } = inst;
    const created = await prisma.freeInstitution.create({
      data: {
        ...instData,
        courses: {
          create: courses.map((c: Record<string, unknown>) => ({
            name: c.name as string,
            duration: c.duration as string,
            description: c.description as string,
            fee: c.fee as string,
            certification: c.certification as string,
            batchStart: c.batchStart as string,
          })),
        },
        entryTests: {
          create: entryTests.map((t: Record<string, unknown>) => ({
            testName: t.testName as string,
            type: t.type as string,
            totalMarks: t.totalMarks as number,
            passingMarks: t.passingMarks as number,
            passingPercentage: t.passingPercentage as string,
            syllabus: t.syllabus as string,
            preparationTips: t.preparationTips as string,
          })),
        },
        documents: {
          create: documents.map((d: Record<string, unknown>) => ({
            documentName: d.documentName as string,
            description: d.description as string,
            isRequired: d.isRequired as boolean,
          })),
        },
      },
    });
    count++;
    console.log(`  ✅ ${count}. ${created.name} (${created.totalCampuses || '?'} campuses, ${courses.length} courses)`);
  }

  console.log(`\nTotal institutions seeded: ${count}`);
  const totalCourses = await prisma.institutionCourse.count();
  console.log(`Total courses: ${totalCourses}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
