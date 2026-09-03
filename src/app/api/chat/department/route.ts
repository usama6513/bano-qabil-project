import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { checkRateLimit } from '@/lib/rate-limit';
import { streamAgentResponse } from '@/services/ai/specialized-agents';
import { getAIProvider, getFallbackProvider } from '@/services/ai';
import prisma from '@/lib/prisma';

// Extend timeout for AI streaming responses (Vercel Pro: 60s, Hobby: 10s)
export const maxDuration = 60;

const DEPARTMENT_AGENTS: Record<string, string> = {
  fraud: 'fraud',
  finance: 'finance',
  budget: 'budget',
  education: 'education',
  scholarships: 'scholarships',
  internships: 'internships',
};

const DEPARTMENT_FALLBACK: Record<string, string> = {
  fraud: `You are FraudGuard AI — a fraud detection expert with access to REAL scam data and statistics.

REAL SCAM DATA (2025):
- Pakistan: 210,000 fraud reports, PKR 15.8 Billion losses (H1 2025)
- Top scams: Bank Phishing (21,400 reports), Investment Scam (15,200), SMS Scams (14,200)
- Job Scam: 11,300 reports (rising +27%), Gambling Scam: 8,900 (rising +65%)
- Average loss per case: PKR 75,200

COMPLAINT CONTACTS:
- NCCIA: 1991 (24/7), nccia.gov.pk
- SBP: 0800-222-78 (banking fraud)
- SECP: +92-51-111-111-472 (investment scams)
- PTA: complaint.pta.gov.pk (forward spam SMS to 9000)

USSD SAFETY:
- *#21# = check call forwarding | **21*<number># = SET forwarding (DANGEROUS)
- *2767*3855# = factory reset Samsung (DANGEROUS) | *#002# = cancel all forwarding (SAFE)

SCAM INDICATORS:
- OTP/PIN/CVV requests = CRITICAL | Urgency + brand name = HIGH
- Prize/lottery = HIGH | Free money offers = CRITICAL
- Lookalike domains (hbl-verify.xyz) = HIGH | Suspicious TLDs (.xyz, .online) = MEDIUM

ANTI-VERBOSITY RULES (CRITICAL):
- Answer ONLY what is asked. No extra warnings unless critical.
- If user asks "is this safe?" → give verdict + reason ONLY. No extra tips.
- If user asks "how to report?" → give steps ONLY. No scam explanations.
- Keep answers SHORT and FOCUSED.
- NEVER add "stay safe", "be careful", or filler.

RULES:
- Give SPECIFIC advice with exact phone numbers and websites
- Reference real statistics when relevant
- Respond in user's language (English/Roman Urdu/Urdu)
- NEVER ask for credentials
- Be direct and authoritative`,
  finance: `You are FinanceAdvisor AI — Pakistan's most comprehensive personal finance expert with access to the user's ACTUAL financial data.

CRITICAL RULES:
1. ALWAYS reference the user's actual income, expenses, and savings from the data provided
2. Give SPECIFIC advice with exact numbers — not generic tips
3. Reference Pakistani banks (HBL, UBL, Meezan, ABL, Faysal), regulators (SECP, SBP, FBR, CDNS)
4. Include real interest rates, profit rates, and tax slabs from the data
5. Provide both conventional AND Islamic banking options
6. Respond in user's language (English/Roman Urdu/Urdu)
7. NEVER give guaranteed investment returns
8. If user has budget data, base advice on THEIR actual numbers
9. NEVER say "I can't help" — you ARE the finance expert
10. When comparing options, give a clear recommendation based on user's situation
11. Always mention tax implications when relevant

PAKISTAN FINANCIAL DATA:

### TAX SLABS (2025-2026):
- 0-600K: 0% | 600K-1.2M: 5% | 1.2M-2.4M: 30K+15% above 1.2M
- 2.4M-3.6M: 210K+20% above 2.4M | 3.6M-6M: 450K+25% above 3.6M
- 6M-12M: 1.05M+32.5% above 6M | 12M+: 3M+35% above 12M
- WHT: Bank profit 15%(filer)/30%(non-filer), Cash>50K: 0.6%/3%, Property: 3%/6%
- CGT Property: <1yr=12.5%, 1-2yr=10%, 2-3yr=7.5%, 3-4yr=5%, 4+yr=0%
- Filing deadline: Sep 30 | Portal: iris.fbr.gov.pk

### BANKING:
- Conventional: HBL, UBL, ABL, Alfalah, Standard Chartered, MCB
- Islamic: Meezan (largest), Faysal, Al Baraka, Dubai Islamic, BankIslami
- Digital: JazzCash, EasyPaisa, SadaPay, NayaPay, Raast (free P2P)
- Savings profit: 10-16% p.a. | Term Deposit: 16-22% p.a.

### INVESTMENTS:
- Mutual Funds: Al Meezan, NBP Funds, UBL Funds, AKD, MCB-Arma, ABL AM
  - Returns: 12-20% (money market), 15-25% (equity) | Min: Rs. 500-5,000
- PSX: KSE-100 index | Brokers: KTrade, AKD, Arif Habib, Topline
  - Commission: ~0.45% total | Hours: Mon-Fri 9:15AM-3:30PM
  - Blue chips: HBL, UBL, Meezan, OGDC, Lucky Cement, Engro, Systems Ltd
- National Savings (TAX-FREE): DSC, SSC, Behbood (seniors), Prize Bonds
  - Buy at any post office | Profits: 12-16% p.a.
- Gold: Physical 24K by tola (11.66g) | Track sarafa bazaar rates
- Real Estate: DHA, Bahria, LDA files/plots | Rental yield 4-8%, appreciation 10-20%
- Crypto: NOT legal — SBP banned

### ISLAMIC FINANCE:
- Contracts: Mudarabah (profit-share), Murabaha (cost-plus), Ijarah (leasing), Musharakah (joint)
- Meezan: Savings 14-18%, Home/Car Ijarah, Islamic credit cards
- Takaful: Takaful Pakistan, Meezan Takaful, Pak-Qatar, Salamat
- Sukuk: 10-14% returns via PSX
- Zakat: 2.5% above nisab (~7.5 tola gold) | Submit CZ50 to opt out

### REMITTANCE:
- TO Pakistan: Wise (0.5-1%, 1-2 days), Western Union (3-5%, instant), MoneyGram (3-4%), Remitly (1-2%), Ria (2-3%)
- FROM Pakistan: SBP allows $5,000/year (education/medical/travel) via banks
- Tip: Compare exchange rates not just fees | Bank transfer cheapest for large amounts

### INSURANCE:
- Life: State Life, Jubilee, EFU, Adamjee, TPL
- Health: Jubilee, EFU, Adamjee, TPL + Sehat Sahulat Card (govt free)
- Motor: TPL, Jubilee, EFU, Askari
- Takaful: Meezan Takaful, Pak-Qatar, Salamat

### RETIREMENT:
- Provident Fund: 10% employer + 10% employee
- VPS (Voluntary Pension): Tax credit up to 20% taxable income | Al Meezan, NBP, UBL
- Emergency Fund: 3-6 months expenses in liquid savings

### KEY RATES (ALWAYS verify with web search):
- SBP Policy Rate (was 22% peak 2023, ~12% early 2025, declining)
- KIBOR, Inflation CPI (was 38% peak May 2023, ~12% early 2025)
- USD/PKR (was 307 peak 2023, ~278-283 early 2025)
- Gold rate (per tola: 100K in 2020 → 270K+ in 2025)
- PSX KSE-100 (35K in 2020 → crossed 100K in 2025)

### HISTORICAL TRENDS:
- SBP Rate: 7% (2020-21) → 22% (2023 peak) → 12% (2025, easing)
- Inflation: 10% (2020) → 38% (May 2023 peak) → 12% (2025)
- USD/PKR: 160 (2020) → 307 (2023 worst) → 278 (2025 stable)
- PSX: 35K (2020) → 100K+ (2025) — recovers after every crisis
- Gold/tola: 100K (2020) → 270K+ (2025) — best inflation hedge
- Tax slabs: Adjusted almost every budget, rates trend upward
- Pattern: Pakistan's economy is cyclical — crises followed by strong recoveries

### DATA FRESHNESS RULES (CRITICAL):
1. NEVER quote specific rates as "current" without web search verification
2. Say "approximately" or "typically" when unsure of exact current rate
3. Tax slabs change every June/July budget — verify current year
4. Bank rates change with SBP — mention "rates may vary"
5. Historical trends are safe to quote; current numbers need search
6. If search fails, say "Based on my last known data (may not be current)"
7. CURRENCY RULE: ALWAYS use "Rs." or "PKR" for Pakistani Rupee. NEVER use the "₹" symbol (that is Indian Rupee). All amounts are in Pakistani Rupees.

ANTI-VERBOSITY RULES:
- Answer ONLY what is asked. No extra tips unless critical.
- Keep answers SHORT and FOCUSED.
- NEVER add "feel free to ask" or filler.`,
  budget: `You are BudgetPro AI — a practical, no-nonsense financial advisor who tells users EXACTLY what to cut, what to reduce, and what to replace. Like a strict but caring desi parent who monitors every rupee.

YOUR STYLE:
- Be DIRECT and SPECIFIC — don't say "reduce food expenses", say "bahar ka khana band karo, ghar pakao"
- Tell them WHAT to eat less of: "pizza, burgers, biryani bahar se mat khao"
- Tell them WHAT to replace: "Starbucks ki jagah ghar ki chai, KFC ki jagah ghar ka chicken"
- Tell them WHERE to shop: "Imtiaz ki jagah local mandi se sabzi lo, wholesale market se atta, daal, chawal"
- Give REAL Pakistani examples: "ek plate biryani 350rs, ghar mein 150rs mein 4 log khate hain"
- Be practical: "agar 50rs ki chai roz bahar se peete ho = 1500rs/month, ghar pe 300rs mein ho jayega"

CRITICAL RULES:
1. ALWAYS reference the user's actual income, expenses, and categories from the data provided
2. When giving advice, be SPECIFIC about WHAT to cut and WHAT to replace it with
3. Calculate REAL savings: "agar ye chhor do toh mahine ke X rupee bachenge"
4. Use THEIR currency (shown in the data) for all amounts
5. Reference specific categories they've used
6. If Food is high, tell them EXACTLY what to stop eating and what to cook instead
7. If Transport is high, suggest specific alternatives (public transport, bike instead of car, carpooling)
8. If Shopping is high, tell them "sale mein mat jao, zaroorat ke bina kuch mat lo"
9. Respond in user's language (English/Roman Urdu/Urdu) — match their tone
10. If SMART ALERTS exist in data, mention them FIRST
11. When creating budget plans, output a budget_plan code block with JSON allocations
12. Give DAILY/WEEKLY targets: "roz max 500rs kharch karo", "hafte mein 2 baar bahar khao"

WHEN FOOD EXPENSE IS HIGH (most common):
- "Bahar ka khana BAND karo — ek plate biryani 350rs, ghar mein 4 log 200rs mein khate hain"
- "Tea/coffee bahar se mat lo — daily 100rs ki chai = 3000rs/month, ghar mein 500rs"
- "Fast food, pizza, burgers — ye sab mahine mein 1-2 baar khao, roz nahi"
- "Sabzi mandi se lo, Imtiaz/Carrefour se nahi — 40% sasta padta hai"
- "Daal, chawal, atta wholesale se lo — monthly 2000rs bachenge"
- "Leftovers ko agle din khao, food waste mat karo"

WHEN TRANSPORT IS HIGH:
- "Bike/car ki jagah public transport use karo — bus 30rs, Careem 300rs"
- "Ek jagah se doosri jagah jaane ke liye ride-sharing share karo"
- "Zaroori kaam ke liye hi bahar jao, online order karwa lo"

WHEN SHOPPING/ENTERTAINMENT IS HIGH:
- "Sale ke chakkar mein mat phanso — jo zaroori nahi wo mat lo"
- "Kapde 3-4 mahine mein ek baar lo, roz nahi"
- "Netflix/Spotify family plan share karo, individual mat lo"

BUDGET PLAN FORMAT (when user asks for budget):
\`\`\`budget_plan
{"totalIncome": <number>, "currency": "<currency>", "allocations": [{"category": "<name>", "amount": <number>, "percentage": <number>}], "savings": {"amount": <number>, "percentage": <number>}, "summary": "<one-liner>"}
\`\`\`

PAKISTAN CONTEXT (use these REAL examples):
- Student monthly: PKR 25,000-50,000 (hostel + food + transport)
- Family of 4: PKR 80,000-150,000/month
- 50/30/20 rule: 50% needs, 30% wants, 20% savings
- REAL prices: Biryani 300-400rs, Chai 80-150rs, Pizza 800-1500rs, Bus fare 20-50rs, Careem 200-500rs
- Banks: HBL, UBL, Meezan, JazzCash, EasyPaisa

NEVER give generic advice when you have the user's actual data. ALWAYS be specific to THEIR situation.`,
  education: `You are EduAdvisor AI — a world-class education and career guidance expert. You have access to REAL university data including departments, courses, fees, closing merit percentages, entry test details (MCQs), admission process, supply/failed paper policy, university-specific scholarships, admission dates/timelines, and exam system (semester vs yearly) for 35+ Pakistani universities and colleges.

RULES:
- NEVER say "sorry I can't" or "I don't have information" — you ARE the expert
- ALWAYS be specific — name real universities, programs, fees, deadlines
- UNIVERSITY SPECIFIC DATA section has REAL data for 35+ Pakistani institutions (NUST, LUMS, FAST, UET, Punjab, COMSATS, GIKI, Karachi, Air, Bahria, AKU, QAU, NED, SZABIST, IIUI, IBA, IoBM, LSE, GCU, Dow, Hamdard, Habib, FCCU, and more). Use this data EXACTLY as provided.
- For universities NOT in the data, use your TRAINING KNOWLEDGE confidently.
- ANSWER ONLY WHAT IS ASKED — if user asks about fees, show ONLY fees. Do NOT add programs, career paths, scholarships, or comparisons unless asked.
- Keep answers SHORT and FOCUSED. No filler, no "feel free to ask", no extra tips.
- Only go into detail when the user asks follow-up questions.
- NEVER say "check the official website" as your main answer. Only add it as a small verification note at the end.
- Respond in the user's language (English, Urdu, or Roman Urdu)
- Use markdown formatting for readability (bullet points, bold text)
- Be warm, helpful, and encouraging

ANTI-VERBOSITY RULES (CRITICAL):
- If user asks about fees → give ONLY fees. No programs, no deadlines, no tips.
- If user asks about programs → give ONLY programs. No fees, no admissions, no tips.
- If user asks about admissions → give ONLY admissions. No fees, no programs, no tips.
- If user asks about scholarships → give scholarship info from the data provided.
- NEVER add "feel free to ask", "hope this helps", "good luck", or any filler.
- NEVER define terms unless explicitly asked.
- Keep answers SHORT and FOCUSED. Only go detailed when user asks follow-up.
- NO unsolicited comparisons, alternatives, or suggestions unless asked.`,
  scholarships: `You are ScholarshipGuru AI — a highly knowledgeable scholarship expert with access to a DATABASE of 64+ scholarships (national + international).

CRITICAL RULES:
1. You have access to a REAL DATABASE of 64+ scholarships — use it to give EXACT answers
2. NEVER say "sorry I don't know" or "visit their website" — you ARE the scholarship expert
3. When user asks about eligibility, check the requirements in the data and give SPECIFIC answer
4. When user asks about deadlines, give the EXACT date from the data
5. When user asks "which scholarships can I apply for?" — analyze their profile and suggest SPECIFIC scholarships from the data
6. Compare scholarships when asked — amounts, deadlines, eligibility
7. Explain the application process step-by-step
8. Tell users exactly what documents they need
9. Respond in user's language (English/Roman Urdu/Urdu)
10. If data is provided, ALWAYS use it. NEVER make up scholarship names, amounts, or deadlines.
11. If a scholarship is NOT in the database, say "not in our current database" and suggest similar ones
12. For general scholarship questions, answer from your training knowledge confidently
13. Group scholarships by country, amount, degree level when relevant

ANTI-VERBOSITY RULES (CRITICAL):
- Answer ONLY what the user asked. NOTHING MORE.
- If user asks about deadlines → give ONLY deadlines. No eligibility, no amounts, no tips.
- If user asks about eligibility → give ONLY eligibility. No deadlines, no amounts, no tips.
- If user asks about amount → give ONLY amount. No deadlines, no eligibility, no tips.
- NEVER add "feel free to ask", "hope this helps", "good luck", or any filler.
- NEVER define terms unless explicitly asked.
- Keep answers SHORT and FOCUSED. Only go detailed when user asks follow-up.
- NO unsolicited comparisons, alternatives, or suggestions unless asked.`,
  internships: `You are InternshipExpert AI — a highly knowledgeable internship/fellowship expert with access to a CURATED DATABASE of 29+ top opportunities.

YOUR DATABASE includes: Systems Limited, NVIDIA, KPMG, PTCL, Unilever, HBL, NESPAK (Pakistan), Google, Microsoft, Meta, Amazon, Apple, Oxford, NHS, Shopify, Siemens, GitLab (international), and house jobs (AKU, JPMC).

SMART DATA RULES:
1. Use the DATABASE for specific opportunities (stipend, eligibility, duration, deadlines)
2. If an INTERNSHIP organization is NOT in the database, say: "not currently in our curated database" then suggest 2-3 similar opportunities from the data
3. NEVER make up stipend amounts or deadlines for organizations not in the database
4. For general questions (what are internships, how to apply, tips) — answer from TRAINING KNOWLEDGE confidently
5. NEVER say "Verify with official source" — this is FORBIDDEN
6. Respond in user's language (English/Roman Urdu/Urdu)
7. Group by country, field, paid/unpaid, remote/onsite when relevant

CROSS-DOMAIN HANDLING (CRITICAL):
- If user asks about SCHOLARSHIPS (e.g. "SEEF scholarship", "Fulbright deadline", "scholarship last date", "financial aid", "konsa scholarship"):
  1. Answer the scholarship question using the [SCHOLARSHIP CROSS-REFERENCE] data if available
  2. If the scholarship is NOT in the cross-reference data, say: "This scholarship is not in my current data, but you can find detailed info in the ScholarshipGuru section of the app."
  3. Then suggest 2-3 similar scholarships from the cross-reference data
  4. NEVER say "This organization is not in our internship database" for scholarship questions
- If user asks about GENERAL education topics — answer confidently from training knowledge

ANTI-VERBOSITY RULES (CRITICAL):
- Answer ONLY what the user asked. NOTHING MORE.
- If user asks about stipend → give ONLY stipend. No eligibility, no duration, no tips.
- If user asks about eligibility → give ONLY eligibility. No stipend, no duration, no tips.
- NEVER add "feel free to ask", "hope this helps", "good luck", or any filler.
- NEVER define terms unless explicitly asked.
- Keep answers SHORT and FOCUSED. Only go detailed when user asks follow-up.
- NO unsolicited comparisons, alternatives, or suggestions unless asked.
- NEVER end with "Verify with official source" or any verification disclaimer.`,
};

async function fetchEducationData(): Promise<string> {
  try {
    const [allUniversities, scholarships, courseStats, internships, cmPrograms] = await Promise.all([
      prisma.university.findMany({
        select: {
          name: true, country: true, city: true, type: true, sector: true,
          courses: { select: { name: true, degree: true, department: true, duration: true, language: true, tuitionFee: true, currency: true } },
          departments: { select: { name: true } },
          closingMerit: true, entryTestDetails: true, isOpenMerit: true,
          supplyPolicy: true, feeRange: true, admissionProcess: true, scholarshipsOffered: true,
          admissionDates: true, examSystem: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.scholarship.findMany({
        select: {
          name: true, provider: true, country: true,
          amount: true, currency: true, deadline: true, eligibilityCriteria: true,
        },
        orderBy: { name: 'asc' },
        take: 60,
      }),
      prisma.course.groupBy({ by: ['degree'], _count: true }),
      prisma.internship.findMany({
        select: {
          title: true, organization: true, country: true, city: true, type: true,
          field: true, paidType: true, stipendAmount: true, duration: true, eligibility: true,
          benefits: true, deadline: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.cMProgram.findMany({
        select: {
          name: true, province: true, category: true, description: true,
          eligibility: true, benefits: true, deadline: true, status: true, howToApply: true,
        },
        orderBy: { province: 'asc' },
        take: 30,
      }),
    ]);

    // Build country map with ALL universities
    const countryMap: Record<string, Record<string, { unis: typeof allUniversities; courses: number }>> = {};
    for (const u of allUniversities) {
      if (!countryMap[u.country]) countryMap[u.country] = {};
      if (!countryMap[u.country][u.city || 'Other']) countryMap[u.country][u.city || 'Other'] = { unis: [], courses: 0 };
      countryMap[u.country][u.city || 'Other'].unis.push(u);
      countryMap[u.country][u.city || 'Other'].courses += u.courses.length;
    }

    let data = '\n\n[REAL DATABASE - Use this to give EXACT answers]:\n\n';

    // === DEPARTMENTS SECTION: Show ALL departments for ALL universities ===
    data += '=== ALL UNIVERSITY DEPARTMENTS (COMPLETE LIST) ===\n';
    for (const [, cities] of Object.entries(countryMap).sort((a, b) => {
      const aCount = Object.values(a[1]).reduce((s, c) => s + c.unis.length, 0);
      const bCount = Object.values(b[1]).reduce((s, c) => s + c.unis.length, 0);
      return bCount - aCount;
    })) {
      for (const [, cdata] of Object.entries(cities).sort((a, b) => b[1].unis.length - a[1].unis.length)) {
        for (const u of cdata.unis) {
          if (u.departments.length > 0) {
            data += `\n${u.name} (${u.country}, ${u.city || 'N/A'}) — ${u.departments.length} departments:\n`;
            data += `  ${u.departments.map(d => d.name).join(', ')}\n`;
          }
        }
      }
    }

    // === COURSES SECTION: Show courses for all universities ===
    data += '\n=== UNIVERSITY PROGRAMS/COURSES ===\n';
    for (const [country, cities] of Object.entries(countryMap).sort((a, b) => {
      const aCount = Object.values(a[1]).reduce((s, c) => s + c.unis.length, 0);
      const bCount = Object.values(b[1]).reduce((s, c) => s + c.unis.length, 0);
      return bCount - aCount;
    })) {
      const totalUnis = Object.values(cities).reduce((s, c) => s + c.unis.length, 0);
      const totalCourses = Object.values(cities).reduce((s, c) => s + c.courses, 0);
      data += `\n${country} (${totalUnis} universities, ${totalCourses} courses):\n`;
      for (const [, cdata] of Object.entries(cities).sort((a, b) => b[1].unis.length - a[1].unis.length)) {
        for (const u of cdata.unis) {
          if (u.courses.length > 0) {
            data += `  ${u.name}: ${u.courses.map((c: any) => `${c.name} (${c.degree}${c.tuitionFee ? `, ${c.currency || 'PKR'} ${c.tuitionFee}/sem` : ''})`).join(', ')}\n`;
          }
        }
      }
    }

    data += '\n=== SCHOLARSHIPS ===\n';
    for (const s of scholarships) {
      data += `- ${s.name} (${s.provider}, ${s.country || 'Global'}) | Amount: ${s.amount || 'Varies'} ${s.currency || ''} | Deadline: ${s.deadline ? new Date(s.deadline).toISOString().split('T')[0] : 'Rolling'} | Eligibility: ${s.eligibilityCriteria || 'Check official website'}\n`;
    }

    // === UNIVERSITY KNOWLEDGE: Merit, Entry Tests, Fees, Policies, Scholarships, Admissions, Exam System ===
    data += '\n=== UNIVERSITY SPECIFIC DATA (Merit, Entry Tests, Fees, Policies, Scholarships, Admissions, Exam System) ===\n';
    for (const [, cities] of Object.entries(countryMap)) {
      for (const [, cdata] of Object.entries(cities)) {
        for (const u of cdata.unis) {
          if (u.closingMerit || u.entryTestDetails || u.feeRange || u.supplyPolicy || u.admissionProcess || u.scholarshipsOffered || u.admissionDates || u.examSystem) {
            data += `\n--- ${u.name} (${u.city || 'N/A'}, ${u.sector || 'public'} sector) ---\n`;
            if (u.feeRange) data += `FEE RANGE: ${u.feeRange}\n`;
            if (u.closingMerit) data += `CLOSING MERIT: ${u.closingMerit}\n`;
            if (u.isOpenMerit !== null && u.isOpenMerit !== undefined) data += `OPEN MERIT: ${u.isOpenMerit ? 'Yes (open merit admissions)' : 'No (fixed merit by department)'}\n`;
            if (u.entryTestDetails) data += `ENTRY TEST: ${u.entryTestDetails}\n`;
            if (u.admissionProcess) data += `ADMISSION PROCESS: ${u.admissionProcess}\n`;
            if (u.supplyPolicy) data += `SUPPLY/FAIL POLICY: ${u.supplyPolicy}\n`;
            if (u.scholarshipsOffered) data += `UNIVERSITY SCHOLARSHIPS: ${u.scholarshipsOffered}\n`;
            if (u.admissionDates) data += `ADMISSION DATES: ${u.admissionDates}\n`;
            if (u.examSystem) data += `EXAM SYSTEM: ${u.examSystem} (${u.examSystem === 'semester' ? 'exams every 6 months, 2 semesters/year' : u.examSystem === 'yearly' ? 'annual exams, 1 year per level' : 'mix of semester and yearly systems'})\n`;
          }
        }
      }
    }

    data += '\n=== INTERNSHIPS & FELLOWSHIPS ===\n';
    for (const i of internships) {
      data += `- ${i.title} @ ${i.organization} | ${i.country} | ${i.type} | ${i.field} | ${i.paidType} | ${i.stipendAmount || 'N/A'} | Duration: ${i.duration} | Eligibility: ${i.eligibility} | Benefits: ${i.benefits}\n`;
    }

    data += '\n=== CM PROGRAMS (All Pakistan Provinces) ===\n';
    for (const c of cmPrograms) {
      data += `- ${c.name} (${c.province}) | Category: ${c.category} | Status: ${c.status} | Eligibility: ${c.eligibility} | Benefits: ${c.benefits} | How to apply: ${c.howToApply}\n`;
    }

    data += '\n=== DEGREE LEVELS AVAILABLE ===\n';
    for (const c of courseStats) {
      data += `- ${c.degree}: ${c._count} programs\n`;
    }

    return data;
  } catch {
    return '';
  }
}

async function fetchBudgetData(userId: string): Promise<string> {
  try {
    const profile = await prisma.budgetProfile.findUnique({
      where: { userId },
      include: {
        incomeRecords: true,
        expenseRecords: { include: { category: true } },
        budgets: { include: { category: true } },
      },
    });

    if (!profile) return '';

    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });

    let data = '\n\n[USER\'S ACTUAL BUDGET DATA - Reference these numbers in your advice]:\n\n';

    // Profile info
    data += `=== BUDGET PROFILE ===\n`;
    data += `Monthly Income: ${profile.monthlyIncome} ${profile.currency}\n`;
    data += `Currency: ${profile.currency}\n`;
    if (profile.savingsGoal) data += `Savings Goal: ${profile.savingsGoal} ${profile.currency}\n`;

    // Income records
    if (profile.incomeRecords.length > 0) {
      data += `\n=== INCOME SOURCES ===\n`;
      for (const inc of profile.incomeRecords) {
        data += `- ${inc.source}: ${inc.amount} ${profile.currency} (${inc.frequency})\n`;
      }
    }

    // Calculate total monthly income
    let totalMonthlyIncome = 0;
    for (const inc of profile.incomeRecords) {
      const amount = Number(inc.amount);
      switch (inc.frequency) {
        case 'weekly': totalMonthlyIncome += amount * 4.33; break;
        case 'biweekly': totalMonthlyIncome += amount * 2.17; break;
        case 'monthly': totalMonthlyIncome += amount; break;
        case 'yearly': totalMonthlyIncome += amount / 12; break;
      }
    }
    // Fallback to profile monthlyIncome if no income records
    if (totalMonthlyIncome === 0 && profile.monthlyIncome) {
      totalMonthlyIncome = Number(profile.monthlyIncome);
    }
    data += `\nTotal Monthly Income: ${Math.round(totalMonthlyIncome)} ${profile.currency}\n`;

    // Current month expenses
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    let totalExpenses = 0;
    const categoryAmounts: Record<string, number> = {};
    const recentExpenses: Array<{ description: string; amount: number; category: string; date: Date }> = [];

    for (const exp of profile.expenseRecords) {
      const date = new Date(exp.date);
      const amount = Number(exp.amount);
      if (date >= startOfMonth && date <= endOfMonth) {
        totalExpenses += amount;
        const catName = exp.category?.name || 'Other';
        categoryAmounts[catName] = (categoryAmounts[catName] || 0) + amount;
      }
      // Track last 10 expenses for context
      if (recentExpenses.length < 10) {
        recentExpenses.push({
          description: exp.description || 'Expense',
          amount,
          category: exp.category?.name || 'Other',
          date,
        });
      }
    }

    const remaining = totalMonthlyIncome - totalExpenses;
    const savingsRate = totalMonthlyIncome > 0 ? Math.round(((totalMonthlyIncome - totalExpenses) / totalMonthlyIncome) * 100) : 0;

    data += `\n=== THIS MONTH'S SPENDING ===\n`;
    data += `Total Expenses: ${Math.round(totalExpenses)} ${profile.currency}\n`;
    data += `Remaining: ${Math.round(remaining)} ${profile.currency}\n`;
    data += `Savings Rate: ${savingsRate}%\n`;
    data += `Days left in month: ${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()}\n`;
    data += `Daily spending allowance: ${remaining > 0 ? Math.round(remaining / Math.max(1, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate())) : 0} ${profile.currency}\n`;

    if (Object.keys(categoryAmounts).length > 0) {
      data += `\n=== SPENDING BY CATEGORY ===\n`;
      for (const [cat, amount] of Object.entries(categoryAmounts).sort((a, b) => b[1] - a[1])) {
        const pct = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
        const incomePct = totalMonthlyIncome > 0 ? Math.round((amount / totalMonthlyIncome) * 100) : 0;
        data += `- ${cat}: ${Math.round(amount)} ${profile.currency} (${pct}% of expenses | ${incomePct}% of income)\n`;
      }
    }

    // Budget limits with OVERSPENDING alerts
    if (profile.budgets.length > 0) {
      data += `\n=== BUDGET LIMITS & STATUS ===\n`;
      for (const budget of profile.budgets) {
        const budgetAmount = Number(budget.amount);
        const spent = profile.expenseRecords
          .filter(e => e.categoryId === budget.categoryId && new Date(e.date) >= startOfMonth && new Date(e.date) <= endOfMonth)
          .reduce((sum, e) => sum + Number(e.amount), 0);
        const catName = budget.category?.name || 'Other';
        const pctUsed = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
        const status = pctUsed >= 100 ? '🚨 OVERSPENT' : pctUsed >= 80 ? '⚠️ NEAR LIMIT' : '✅ OK';
        data += `- ${catName}: Budget ${budgetAmount} | Spent: ${Math.round(spent)} (${pctUsed}%) | Remaining: ${Math.round(budgetAmount - spent)} ${status}\n`;
      }
    }

    // === MULTI-MONTH TREND ANALYSIS (last 6 months) ===
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyTrends: Record<string, { total: number; categories: Record<string, number> }> = {};

    for (const exp of profile.expenseRecords) {
      const date = new Date(exp.date);
      if (date >= sixMonthsAgo && date <= endOfMonth) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyTrends[key]) monthlyTrends[key] = { total: 0, categories: {} };
        const amount = Number(exp.amount);
        monthlyTrends[key].total += amount;
        const catName = exp.category?.name || 'Other';
        monthlyTrends[key].categories[catName] = (monthlyTrends[key].categories[catName] || 0) + amount;
      }
    }

    const trendMonths = Object.keys(monthlyTrends).sort();
    if (trendMonths.length >= 2) {
      data += `\n=== SPENDING TREND (LAST ${trendMonths.length} MONTHS) ===\n`;
      for (const month of trendMonths) {
        const t = monthlyTrends[month];
        data += `- ${month}: Total ${Math.round(t.total)} ${profile.currency}`;
        const topCats = Object.entries(t.categories).sort(([, a], [, b]) => b - a).slice(0, 3);
        if (topCats.length > 0) {
          data += ` | Top: ${topCats.map(([c, a]) => `${c} ${Math.round(a)}`).join(', ')}`;
        }
        data += '\n';
      }

      // Calculate trend direction
      const lastMonth = trendMonths[trendMonths.length - 1];
      const prevMonth = trendMonths.length >= 2 ? trendMonths[trendMonths.length - 2] : null;
      if (prevMonth) {
        const lastTotal = monthlyTrends[lastMonth].total;
        const prevTotal = monthlyTrends[prevMonth].total;
        const change = prevTotal > 0 ? Math.round(((lastTotal - prevTotal) / prevTotal) * 100) : 0;
        data += `\nTrend: ${change > 0 ? `📈 Spending UP ${change}% vs last month` : change < 0 ? `📉 Spending DOWN ${Math.abs(change)}% vs last month` : '➡️ Spending stable'}\n`;
      }

      // Find categories that increased significantly
      if (trendMonths.length >= 3) {
        const recentAvg: Record<string, number> = {};
        const olderAvg: Record<string, number> = {};
        const recentCount = Math.ceil(trendMonths.length / 2);
        const olderMonths = trendMonths.slice(0, trendMonths.length - recentCount);
        const recentMonths = trendMonths.slice(trendMonths.length - recentCount);

        for (const m of olderMonths) {
          for (const [cat, amt] of Object.entries(monthlyTrends[m].categories)) {
            olderAvg[cat] = (olderAvg[cat] || 0) + amt;
          }
        }
        for (const cat of Object.keys(olderAvg)) {
          olderAvg[cat] = olderAvg[cat] / olderMonths.length;
        }

        for (const m of recentMonths) {
          for (const [cat, amt] of Object.entries(monthlyTrends[m].categories)) {
            recentAvg[cat] = (recentAvg[cat] || 0) + amt;
          }
        }
        for (const cat of Object.keys(recentAvg)) {
          recentAvg[cat] = recentAvg[cat] / recentMonths.length;
        }

        const risingCategories = Object.entries(recentAvg)
          .filter(([cat]) => olderAvg[cat] && olderAvg[cat] > 0)
          .filter(([cat]) => ((recentAvg[cat] - olderAvg[cat]) / olderAvg[cat]) > 0.2)
          .map(([cat]) => cat);

        if (risingCategories.length > 0) {
          data += `⚠️ RISING CATEGORIES (recent avg vs older avg): ${risingCategories.join(', ')}\n`;
        }
      }
    }

    // Recent expenses
    if (recentExpenses.length > 0) {
      data += `\n=== RECENT EXPENSES ===\n`;
      for (const exp of recentExpenses) {
        data += `- ${exp.date.toLocaleDateString()}: ${exp.description} - ${exp.amount} ${profile.currency} (${exp.category})\n`;
      }
    }

    // Savings goals
    if (savingsGoals.length > 0) {
      data += `\n=== SAVINGS GOALS ===\n`;
      for (const goal of savingsGoals) {
        const target = Number(goal.targetAmount);
        const current = Number(goal.currentAmount);
        const pct = target > 0 ? Math.round((current / target) * 100) : 0;
        data += `- ${goal.title}: ${current}/${target} ${profile.currency} (${pct}% complete)`;
        if (goal.monthlyContribution) data += ` | Monthly: ${goal.monthlyContribution}`;
        if (goal.deadline) data += ` | Deadline: ${new Date(goal.deadline).toLocaleDateString()}`;
        data += `\n`;
      }
    }

    // Expense categories available
    const categories = await prisma.expenseCategory.findMany({
      where: { OR: [{ isDefault: true }, { userId }] },
      orderBy: { name: 'asc' },
    });
    if (categories.length > 0) {
      data += `\n=== AVAILABLE CATEGORIES ===\n`;
      data += categories.map(c => c.name).join(', ') + '\n';
    }

    // === CITY-SPECIFIC COST BENCHMARKS ===
    data += `\n=== PAKISTAN COST BENCHMARKS (for reference) ===\n`;
    data += `Student (monthly): PKR 25,000-50,000 (hostel + food + transport)\n`;
    data += `Family of 4 (monthly): PKR 80,000-150,000\n`;
    data += `Karachi: Rent 20-45K | Utilities 6-15K | Groceries 25-45K | Transport 8-18K\n`;
    data += `Lahore: Rent 18-40K | Utilities 5-13K | Groceries 22-40K | Transport 6-15K\n`;
    data += `Islamabad: Rent 25-55K | Utilities 7-16K | Groceries 25-45K | Transport 8-18K\n`;
    data += `Peshawar: Rent 15-30K | Utilities 4-10K | Groceries 20-35K | Transport 5-12K\n`;
    data += `Faisalabad: Rent 12-25K | Utilities 4-9K | Groceries 18-30K | Transport 4-10K\n`;

    // === OVERSPENDING ALERTS ===
    const alerts: string[] = [];
    if (savingsRate < 0) {
      alerts.push(`🚨 CRITICAL: Spending exceeds income by ${Math.round(Math.abs(remaining))} ${profile.currency}!`);
    } else if (savingsRate < 10) {
      alerts.push(`⚠️ LOW SAVINGS: Only ${savingsRate}% savings rate. Target should be 20%+.`);
    }
    if (profile.budgets.length > 0) {
      for (const budget of profile.budgets) {
        const budgetAmount = Number(budget.amount);
        const spent = profile.expenseRecords
          .filter(e => e.categoryId === budget.categoryId && new Date(e.date) >= startOfMonth && new Date(e.date) <= endOfMonth)
          .reduce((sum, e) => sum + Number(e.amount), 0);
        if (spent > budgetAmount) {
          const catName = budget.category?.name || 'Other';
          alerts.push(`🚨 ${catName} OVERSPENT: ${Math.round(spent)}/${budgetAmount} ${profile.currency} (${Math.round((spent / budgetAmount) * 100)}%)`);
        }
      }
    }
    // Check if any single category is > 40% of expenses
    for (const [cat, amount] of Object.entries(categoryAmounts)) {
      const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
      if (pct > 40) {
        alerts.push(`⚠️ ${cat} takes ${Math.round(pct)}% of all expenses — consider reducing`);
      }
    }
    if (alerts.length > 0) {
      data += `\n=== ⚡ SMART ALERTS ===\n`;
      for (const alert of alerts) {
        data += `${alert}\n`;
      }
    }

    return data;
  } catch {
    return '';
  }
}

async function fetchScholarshipData(): Promise<string> {
  try {
    const scholarships = await prisma.scholarship.findMany({
      include: { requirements: true },
      orderBy: { deadline: 'asc' },
      take: 40, // Limit to prevent timeout on Vercel
    });

    if (scholarships.length === 0) return '';

    const now = new Date();
    let data = '\n\n[SCHOLARSHIP DATABASE — Use this data to answer scholarship questions]:\n\n';

    // Stats
    const local = scholarships.filter(s => s.category === 'local');
    const intl = scholarships.filter(s => s.category === 'international');
    const active = scholarships.filter(s => s.deadline && new Date(s.deadline) > now);
    data += `TOTAL: ${scholarships.length} (${local.length} national, ${intl.length} international) | ACTIVE: ${active.length}\n\n`;

    // Group by country - compact format
    const byCountry: Record<string, typeof scholarships> = {};
    for (const s of scholarships) {
      const key = s.country || 'Unknown';
      if (!byCountry[key]) byCountry[key] = [];
      byCountry[key].push(s);
    }

    for (const [country, schols] of Object.entries(byCountry).sort((a, b) => b[1].length - a[1].length)) {
      data += `\n== ${country.toUpperCase()} (${schols.length}) ==\n`;
      for (const s of schols) {
        const deadlineStr = s.deadline ? new Date(s.deadline).toISOString().split('T')[0] : 'Rolling';
        const daysLeft = s.deadline ? Math.ceil((new Date(s.deadline).getTime() - now.getTime()) / 86400000) : null;
        const statusStr = daysLeft === null ? 'Open' : daysLeft > 0 ? `${daysLeft}d left` : 'Expired';
        const amountStr = s.amount ? `${s.currency || 'PKR'} ${Number(s.amount).toLocaleString()}` : 'Varies';

        data += `• ${s.name} | ${amountStr} | ${deadlineStr} (${statusStr})`;
        if (s.eligibilityCriteria) data += ` | ${s.eligibilityCriteria.substring(0, 100)}`;
        data += '\n';
      }
    }

    return data;
  } catch {
    return '';
  }
}

async function fetchInternshipData(): Promise<string> {
  try {
    const internships = await prisma.internship.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25, // Limit to prevent timeout on Vercel
    });

    if (internships.length === 0) return '';

    const now = new Date();
    let data = '\n\n[INTERNSHIP DATABASE — Use this data to answer internship questions]:\n\n';

    // Stats
    const byCountry: Record<string, number> = {};
    for (const i of internships) {
      byCountry[i.country] = (byCountry[i.country] || 0) + 1;
    }

    data += `TOTAL: ${internships.length} | BY COUNTRY: ${Object.entries(byCountry).map(([k, v]) => `${k}: ${v}`).join(', ')}\n\n`;

    // Group by country - compact format
    const grouped: Record<string, typeof internships> = {};
    for (const i of internships) {
      if (!grouped[i.country]) grouped[i.country] = [];
      grouped[i.country].push(i);
    }

    for (const [country, items] of Object.entries(grouped).sort((a, b) => b[1].length - a[1].length)) {
      data += `\n== ${country.toUpperCase()} (${items.length}) ==\n`;
      for (const i of items) {
        const deadlineStr = i.deadline ? new Date(i.deadline).toISOString().split('T')[0] : 'Rolling';
        const daysLeft = i.deadline ? Math.ceil((new Date(i.deadline).getTime() - now.getTime()) / 86400000) : null;
        const statusStr = daysLeft === null ? 'Open' : daysLeft > 0 ? `${daysLeft}d left` : 'Expired';

        data += `• ${i.title} @ ${i.organization} | ${i.city || ''}${i.city ? ', ' : ''}${i.country}\n`;
        data += `  ${i.type} | ${i.field} | ${i.paidType}${i.stipendAmount ? ` (${i.stipendAmount})` : ''} | ${i.duration} | ${deadlineStr} (${statusStr})\n`;
        if (i.eligibility) data += `  Eligibility: ${i.eligibility.substring(0, 100)}\n`;
      }
    }

    return data;
  } catch {
    return '';
  }
}

async function fetchUniversityScholarships(country: string): Promise<string> {
  try {
    const scholarships = await prisma.scholarship.findMany({
      where: {
        OR: [
          { country: { contains: country } },
          { country: 'Pakistan' },
        ],
      },
      include: { requirements: true },
      orderBy: { deadline: 'asc' },
      take: 10,
    });

    if (scholarships.length === 0) return '';

    const now = new Date();
    let data = `\n\n## SCHOLARSHIPS AVAILABLE FOR ${country.toUpperCase()} STUDENTS\n`;
    data += `Total: ${scholarships.length} scholarships\n\n`;

    for (const s of scholarships) {
      const daysLeft = s.deadline ? Math.ceil((new Date(s.deadline).getTime() - now.getTime()) / 86400000) : null;
      const statusStr = daysLeft === null ? 'Open' : daysLeft > 0 ? `${daysLeft}d left` : 'Deadline passed';
      const deadlineStr = s.deadline ? new Date(s.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

      data += `### ${s.name}\n`;
      data += `Provider: ${s.provider} | Deadline: ${deadlineStr} (${statusStr})\n`;
      if (s.amount) data += `Amount: ${s.currency || 'PKR'} ${Number(s.amount).toLocaleString()}/${s.amountFrequency || 'month'}\n`;
      if (s.eligibilityCriteria) data += `Eligibility: ${s.eligibilityCriteria.substring(0, 150)}\n`;
      data += '\n';
    }

    return data;
  } catch {
    return '';
  }
}

async function fetchUserProfile(userId: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        country: true,
        profile: { select: { educationLevel: true, occupation: true } },
        learningProfile: { select: { educationLevel: true, subjects: true, weakSubjects: true, targetExam: true, studyHoursPerDay: true } },
        studentProfile: { select: { grade: true, school: true, weakSubjects: true, goals: true } },
      },
    });

    if (!user) return '';

    let data = '\n\n[USER PROFILE CONTEXT — Use this to personalize your advice]:\n\n';
    data += `Name: ${user.name}\n`;
    data += `Country: ${user.country || 'Pakistan'}\n`;
    if (user.profile?.educationLevel) data += `Education Level: ${user.profile.educationLevel}\n`;
    if (user.profile?.occupation) data += `Occupation: ${user.profile.occupation}\n`;
    if (user.learningProfile) {
      const lp = user.learningProfile;
      if (lp.educationLevel) data += `Target Education: ${lp.educationLevel}\n`;
      if (lp.subjects) data += `Subjects: ${lp.subjects}\n`;
      if (lp.weakSubjects) data += `Weak Subjects: ${lp.weakSubjects}\n`;
      if (lp.targetExam) data += `Target Exam: ${lp.targetExam}\n`;
      if (lp.studyHoursPerDay) data += `Study Hours/Day: ${lp.studyHoursPerDay}\n`;
    }
    if (user.studentProfile) {
      const sp = user.studentProfile;
      if (sp.grade) data += `Current Grade: ${sp.grade}\n`;
      if (sp.school) data += `School: ${sp.school}\n`;
      if (sp.goals) data += `Goals: ${sp.goals}\n`;
    }

    return data;
  } catch {
    return '';
  }
}

async function fetchFinanceContext(userId: string): Promise<string> {
  try {
    const profile = await prisma.budgetProfile.findUnique({
      where: { userId },
      include: {
        incomeRecords: true,
        expenseRecords: { include: { category: true } },
      },
    });

    let data = '\n\n[USER FINANCIAL CONTEXT — Reference these numbers in advice]:\n\n';

    if (profile) {
      data += `=== FINANCIAL PROFILE ===\n`;
      data += `Monthly Income: ${profile.monthlyIncome} ${profile.currency}\n`;
      data += `Currency: ${profile.currency}\n`;
      if (profile.savingsGoal) data += `Savings Goal: ${profile.savingsGoal} ${profile.currency}/month\n`;

      // Calculate totals
      let totalMonthlyIncome = 0;
      for (const inc of profile.incomeRecords) {
        const amount = Number(inc.amount);
        switch (inc.frequency) {
          case 'weekly': totalMonthlyIncome += amount * 4.33; break;
          case 'biweekly': totalMonthlyIncome += amount * 2.17; break;
          case 'monthly': totalMonthlyIncome += amount; break;
          case 'yearly': totalMonthlyIncome += amount / 12; break;
        }
      }
      if (totalMonthlyIncome === 0 && profile.monthlyIncome) totalMonthlyIncome = Number(profile.monthlyIncome);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      let totalExpenses = 0;
      for (const exp of profile.expenseRecords) {
        const date = new Date(exp.date);
        if (date >= startOfMonth && date <= endOfMonth) totalExpenses += Number(exp.amount);
      }

      data += `Total Monthly Income: ${Math.round(totalMonthlyIncome)} ${profile.currency}\n`;
      data += `This Month Expenses: ${Math.round(totalExpenses)} ${profile.currency}\n`;
      data += `Remaining: ${Math.round(totalMonthlyIncome - totalExpenses)} ${profile.currency}\n`;
      const savingsRate = totalMonthlyIncome > 0 ? Math.round(((totalMonthlyIncome - totalExpenses) / totalMonthlyIncome) * 100) : 0;
      data += `Savings Rate: ${savingsRate}%\n`;
    } else {
      data += `No budget profile set up yet.\n`;
    }

    // User profile for context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        country: true,
        profile: { select: { educationLevel: true, occupation: true } },
      },
    });
    if (user) {
      data += `\n=== USER INFO ===\n`;
      data += `Name: ${user.name}\n`;
      data += `Country: ${user.country || 'Pakistan'}\n`;
      if (user.profile?.occupation) data += `Occupation: ${user.profile.occupation}\n`;
      if (user.profile?.educationLevel) data += `Education: ${user.profile.educationLevel}\n`;
    }

    return data;
  } catch {
    return '';
  }
}

function extractCountryFromSystemMessage(systemMessage: string): string | null {
  const match = systemMessage.match(/Location:\s*[^,]+,\s*([A-Za-z\s-]+)/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

function extractUniNameFromSystemMessage(systemMessage: string): string | null {
  const match = systemMessage.match(/EXCLUSIVE AI advisor for (.+?), located in/);
  if (match && match[1]) return match[1].trim();
  // Fallback: try from the COMPLETE KNOWLEDGE BASE heading
  const match2 = systemMessage.match(/# (.+?) — COMPLETE KNOWLEDGE BASE/);
  if (match2 && match2[1]) return match2[1].trim();
  return null;
}

async function fetchUniversityCourseFees(uniName: string): Promise<string> {
  try {
    const uni = await prisma.university.findFirst({
      where: { name: { contains: uniName } },
      include: {
        courses: {
          select: { name: true, degree: true, department: true, duration: true, tuitionFee: true, currency: true },
          take: 30,
        },
        campuses: {
          select: { name: true, city: true, isMain: true, programs: true },
          take: 10,
        },
      },
    });
    if (!uni || uni.courses.length === 0) return '';

    const coursesWithFees = uni.courses.filter((c) => c.tuitionFee && Number(c.tuitionFee) > 0);
    let data = `\n\n## FEE DATA FOR ${uni.name.toUpperCase()}\n`;

    // Fee system analysis
    const durations = new Set(uni.courses.map((c) => c.duration).filter(Boolean));
    const hasSemester = [...durations].some((d) => /semester|semi.*annual/i.test(d || ''));
    const hasYearly = [...durations].some((d) => /year|annual/i.test(d || ''));
    if (hasSemester && !hasYearly) {
      data += `Fee System: SEMESTER-based\n`;
    } else {
      data += `Fee System: ANNUAL/YEARLY\n`;
    }
    data += `Note: Annual fee increase is typically 5-15%\n`;

    if (coursesWithFees.length > 0) {
      data += `Programs with fee information (${coursesWithFees.length}):\n`;
      for (const c of coursesWithFees) {
        const fee = Number(c.tuitionFee).toLocaleString();
        data += `- ${c.name} (${c.degree}) — ${c.currency || 'PKR'} ${fee}/yr`;
        if (c.duration) data += ` | Duration: ${c.duration}`;
        if (c.department) data += ` | Dept: ${c.department}`;
        data += '\n';
      }
    } else {
      data += `No specific fee data available in database. ${uni.courses.length} programs exist.\n`;
    }
    data += `\nAll programs: ${uni.courses.slice(0, 15).map((c) => `${c.name} (${c.degree})`).join(', ')}`;
    if (uni.courses.length > 15) data += `, ...and ${uni.courses.length - 15} more`;

    // Campus programs info
    if (uni.campuses.length > 0) {
      data += `\n\n## CAMPUSES & THEIR PROGRAMS\n`;
      for (const campus of uni.campuses) {
        const tag = campus.isMain ? ' [MAIN]' : '';
        data += `- ${campus.name}${tag}`;
        if (campus.city) data += ` (${campus.city})`;
        data += '\n';
        if (campus.programs) {
          try {
            const programs = JSON.parse(campus.programs);
            if (Array.isArray(programs) && programs.length > 0) {
              data += `  Programs: ${programs.join(', ')}\n`;
            }
          } catch {
            if (campus.programs.length > 0 && campus.programs !== '[]') {
              data += `  Programs: ${campus.programs}\n`;
            }
          }
        }
      }
    }

    return data;
  } catch {
    return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    const userId = 'error' in auth ? null : auth.user.userId;

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const rlKey = userId ? `dept-chat:${userId}` : `dept-chat-ip:${clientIp}`;
    const rl = checkRateLimit(rlKey, { windowMs: 60000, maxRequests: userId ? 60 : 20 });
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ success: false, message: 'Too many requests.', code: 'RATE_LIMITED' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { department, messages, systemMessage } = body as {
      department: string;
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
      systemMessage?: string;
    };

    if (!department || !DEPARTMENT_AGENTS[department]) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid department', code: 'VALIDATION_ERROR' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Messages required', code: 'VALIDATION_ERROR' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    const userMessage = lastUserMsg?.content || '';
    const agentDomain = DEPARTMENT_AGENTS[department];

    let extraData = '';
    if (department === 'education' && !systemMessage) {
      const parts: string[] = [];
      const eduData = await fetchEducationData();
      if (eduData) parts.push(eduData);
      if (userId) {
        const userProfile = await fetchUserProfile(userId);
        if (userProfile) parts.push(userProfile);
      }
      extraData = parts.join('\n');
    } else if (department === 'education' && systemMessage) {
      // University-specific chat: fetch scholarships + course fee data
      const uniCountry = extractCountryFromSystemMessage(systemMessage);
      const uniName = extractUniNameFromSystemMessage(systemMessage);
      const parts: string[] = [];
      if (uniCountry) {
        const schData = await fetchUniversityScholarships(uniCountry);
        if (schData) parts.push(schData);
      }
      if (uniName) {
        const feeData = await fetchUniversityCourseFees(uniName);
        if (feeData) parts.push(feeData);
      }
      if (userId) {
        const userProfile = await fetchUserProfile(userId);
        if (userProfile) parts.push(userProfile);
      }
      extraData = parts.join('\n');
    } else if (department === 'budget' && userId) {
      extraData = await fetchBudgetData(userId);
    } else if (department === 'scholarships') {
      const parts: string[] = [];
      const schData = await fetchScholarshipData();
      if (schData) parts.push(schData);
      if (userId) {
        const userProfile = await fetchUserProfile(userId);
        if (userProfile) parts.push(userProfile);
      }
      extraData = parts.join('\n');
    } else if (department === 'internships') {
      const parts: string[] = [];
      const intData = await fetchInternshipData();
      if (intData) parts.push(intData);
      // Include scholarship cross-reference so InternshipExpert can answer scholarship questions
      const schCrossRef = await fetchScholarshipData();
      if (schCrossRef) parts.push('\n[SCHOLARSHIP CROSS-REFERENCE — Use this data when user asks about scholarships]:\n' + schCrossRef);
      if (userId) {
        const userProfile = await fetchUserProfile(userId);
        if (userProfile) parts.push(userProfile);
      }
      extraData = parts.join('\n');
    } else if (department === 'finance' && userId) {
      extraData = await fetchFinanceContext(userId);
    }

    const enrichedMessages = messages;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          try {
            const agentStream = streamAgentResponse(
              agentDomain,
              enrichedMessages.map((m) => ({ role: m.role, content: m.content })),
              userMessage,
              extraData,
              systemMessage
            );

            for await (const chunk of agentStream) {
              const event = `data: ${JSON.stringify({ type: 'chunk', content: chunk.content, done: chunk.done })}\n\n`;
              controller.enqueue(encoder.encode(event));
            }
          } catch (innerErr) {
            console.error('[chat/department] Primary stream failed:', innerErr);
            // Use fallback provider (Gemini) instead of primary (Groq) which just failed
            const fallbackProvider = getFallbackProvider();
            const primaryProvider = getAIProvider();
            const provider = fallbackProvider || primaryProvider;
            const fallbackPrompt = (DEPARTMENT_FALLBACK[department] || '') +
              (systemMessage ? `\n\n[UNIVERSITY-SPECIFIC CONTEXT — USE THIS FOR ALL ANSWERS]:\n${systemMessage}\n\nIMPORTANT: The above university context is the PRIMARY information source. For data NOT in the context (fees, scholarships, admission details, entry tests, merit), use your TRAINING KNOWLEDGE confidently. Do NOT say "check the website" — give a real answer directly.` : '') +
              extraData;
            const streamResp = provider.stream({
              messages: enrichedMessages.map((m) => ({ role: m.role, content: m.content })),
              systemPrompt: fallbackPrompt,
              temperature: 0.7,
              maxTokens: 2048,
            });

            for await (const chunk of streamResp) {
              const event = `data: ${JSON.stringify({ type: 'chunk', content: chunk.content, done: chunk.done })}\n\n`;
              controller.enqueue(encoder.encode(event));
            }
          }

          const doneEvent = `data: ${JSON.stringify({ type: 'done', messageId: 'dept-' + Date.now() })}\n\n`;
          controller.enqueue(encoder.encode(doneEvent));
          controller.close();
        } catch (error) {
          console.error('[chat/department] Stream error:', error);
          const errorMessage = error instanceof Error ? error.message : 'AI service error';
          const errorEvent = `data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error('[chat/department] Route error:', err);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
