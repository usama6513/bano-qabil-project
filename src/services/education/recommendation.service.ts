import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getAIProvider, isAIConfigured } from '@/services/ai';

export interface RecommendationProfile {
  field?: string;
  country?: string;
  city?: string;
  degreeLevel?: string;
  budget?: number;
  currency?: string;
  nationality?: string;
  language?: string;
  interests?: string[];
  careerGoal?: string;
  gpa?: number;
  testScores?: { toefl?: number; ielts?: number; gre?: number; gmat?: number; sat?: number };
}

interface RecommendationResult {
  universities: Array<{
    id: string;
    name: string;
    country: string;
    city: string | null;
    type: string;
    sector: string | null;
    ranking: number | null;
    matchScore: number;
    matchReasons: string[];
    courses: Array<{ name: string; degree: string; department: string | null; tuitionFee: number | null; currency: string | null; description: string | null }>;
    departments: Array<{ name: string; totalCourses: number }>;
  }>;
  courses: Array<{
    id: string;
    name: string;
    degree: string;
    department: string | null;
    tuitionFee: number | null;
    currency: string | null;
    universityName: string;
    universityCountry: string;
    matchScore: number;
    matchReasons: string[];
  }>;
  scholarships: Array<{
    id: string;
    name: string;
    provider: string;
    country: string | null;
    amount: number | null;
    currency: string | null;
    deadline: Date | null;
    matchStrength: string;
    matchReasons: string[];
  }>;
  aiSummary?: string;
}

/**
 * Field aliases: expand a user-friendly field name into all the search terms
 * we should look for in course names, departments, and descriptions.
 * This ensures "Medicine" also finds MBBS/BDS, "CS" finds Software Engineering, etc.
 */
const FIELD_ALIASES: Record<string, string[]> = {
  'medicine': ['medicine', 'mbbs', 'bds', 'surgery', 'medical'],
  'medical': ['medicine', 'mbbs', 'bds', 'surgery', 'medical'],
  'computer science': ['computer science', 'software engineering', 'information technology', 'computing', 'artificial intelligence', 'data science', 'cyber security', 'programming', 'it '],
  'cs': ['computer science', 'software engineering', 'information technology', 'computing'],
  'engineering': ['engineering', 'electrical engineering', 'mechanical engineering', 'civil engineering', 'chemical engineering', 'metallurgical', 'biomedical engineering', 'aerospace'],
  'business': ['business', 'management', 'bba', 'mba', 'commerce', 'finance', 'marketing', 'business administration', 'human resources', 'supply chain'],
  'law': ['law', 'llb', 'legal', 'shariah law'],
  'pharmacy': ['pharmacy', 'pharm-d', 'pharm d', 'pharmaceutical'],
  'dentistry': ['dentistry', 'dental', 'bds'],
  'economics': ['economics', 'finance', 'business economics', 'econometrics'],
  'psychology': ['psychology', 'clinical psychology', 'counseling', 'behavioral'],
  'biology': ['biology', 'biological sciences', 'biotechnology', 'bioinformatics', 'life sciences', 'microbiology'],
  'chemistry': ['chemistry', 'chemical', 'biochemistry', 'pharmaceutical chemistry'],
  'physics': ['physics', 'applied physics', 'nuclear physics', 'astronomy'],
  'mathematics': ['mathematics', 'applied mathematics', 'statistics', 'actuarial'],
  'architecture': ['architecture', 'urban planning', 'design', 'landscape'],
  'agriculture': ['agriculture', 'agronomy', 'horticulture', 'animal sciences', 'food science'],
  'veterinary': ['veterinary', 'dvm', 'animal sciences'],
  'education': ['education', 'teaching', 'pedagogy', 'curriculum', 'bed', 'med'],
  'arts': ['arts', 'fine arts', 'design', 'visual arts', 'performing arts', 'music'],
  'design': ['design', 'graphic design', 'fashion design', 'interior design', 'ux design', 'product design'],
  'nursing': ['nursing', 'nurse', 'bscn', 'post-basic nursing', 'midwifery'],
  'social sciences': ['social sciences', 'sociology', 'political science', 'anthropology', 'public administration'],
  'accounting': ['accounting', 'finance', 'auditing', 'taxation', 'banking'],
  'finance': ['finance', 'banking', 'investment', 'accounting', 'fintech'],
  'marketing': ['marketing', 'advertising', 'brand management', 'digital marketing'],
  'management': ['management', 'business administration', 'bba', 'mba', 'organizational', 'leadership'],
  'data science': ['data science', 'data analytics', 'machine learning', 'artificial intelligence', 'big data'],
  'artificial intelligence': ['artificial intelligence', 'machine learning', 'deep learning', 'neural', 'data science', 'robotics'],
  'information technology': ['information technology', 'computer science', 'networking', 'cyber security', 'cloud computing'],
  'software engineering': ['software engineering', 'computer science', 'programming', 'software development', 'web development'],
  'electrical engineering': ['electrical engineering', 'electronics', 'power engineering', 'telecommunications', 'control systems'],
  'mechanical engineering': ['mechanical engineering', 'automotive', 'hvac', 'manufacturing', 'thermodynamics'],
  'civil engineering': ['civil engineering', 'structural', 'construction', 'transportation', 'water resources', 'geotechnical'],
  'chemical engineering': ['chemical engineering', 'petrochemical', 'polymer', 'process engineering'],
  'biotechnology': ['biotechnology', 'genetics', 'molecular biology', 'bioinformatics', 'genomics'],
  'environmental science': ['environmental science', 'ecology', 'conservation', 'climate', 'sustainability'],
  'political science': ['political science', 'politics', 'government', 'public policy', 'international relations'],
  'sociology': ['sociology', 'social studies', 'community development', 'social work'],
  'history': ['history', 'archaeology', 'heritage', 'pakistan studies', 'civilization'],
  'english': ['english', 'linguistics', 'literature', 'creative writing', 'communication'],
  'urdu': ['urdu', 'urdu literature', 'urdu linguistics'],
  'islamic studies': ['islamic studies', 'islamic history', 'quran', 'hadith', 'shariah', 'theology'],
  'journalism': ['journalism', 'media', 'reporting', 'news', 'broadcasting'],
  'mass communication': ['mass communication', 'media studies', 'broadcasting', 'public relations', 'advertising'],
  'international relations': ['international relations', 'diplomacy', 'foreign policy', 'global studies', 'political science'],
  'public administration': ['public administration', 'governance', 'civil service', 'policy', 'public policy'],
  'business administration': ['business administration', 'bba', 'mba', 'management', 'commerce'],
  'human resources': ['human resources', 'hr', 'organizational behavior', 'industrial relations', 'talent management'],
  'supply chain management': ['supply chain', 'logistics', 'operations management', 'procurement', 'inventory'],
  'actuarial science': ['actuarial science', 'actuarial', 'risk management', 'insurance', 'statistics'],
  'statistics': ['statistics', 'applied statistics', 'data analysis', 'biostatistics', 'demography'],
};

/**
 * Career goal aliases: map career goals to domain-specific program keywords
 * so "Doctor" matches MBBS/Medicine, not just "Doctor of Physical Therapy".
 */
const CAREER_GOAL_ALIASES: Record<string, string[]> = {
  'doctor': ['medicine', 'mbbs', 'bds', 'surgery', 'medical', 'doctor'],
  'surgeon': ['medicine', 'mbbs', 'surgery', 'medical'],
  'dentist': ['dentistry', 'dental', 'bds', 'oral'],
  'pharmacist': ['pharmacy', 'pharm-d', 'pharmaceutical'],
  'lawyer': ['law', 'llb', 'legal'],
  'advocate': ['law', 'llb', 'legal'],
  'engineer': ['engineering', 'electrical', 'mechanical', 'civil engineering'],
  'software engineer': ['computer science', 'software engineering', 'computing', 'programming'],
  'developer': ['computer science', 'software engineering', 'computing', 'programming'],
  'data scientist': ['data science', 'data analytics', 'machine learning', 'artificial intelligence'],
  'data analyst': ['data science', 'data analytics', 'statistics', 'business intelligence'],
  'architect': ['architecture', 'urban planning', 'design'],
  'teacher': ['education', 'teaching', 'pedagogy'],
  'professor': ['education', 'teaching', 'research'],
  'veterinary': ['veterinary', 'dvm', 'animal sciences'],
  'vet': ['veterinary', 'dvm', 'animal sciences'],
  'nurse': ['nursing', 'nurse', 'bscn', 'midwifery'],
  'accountant': ['accounting', 'finance', 'auditing', 'taxation'],
  'banker': ['finance', 'banking', 'investment', 'economics'],
  'journalist': ['journalism', 'media', 'reporting', 'mass communication'],
  'psychologist': ['psychology', 'clinical psychology', 'counseling'],
  'scientist': ['biology', 'chemistry', 'physics', 'biotechnology'],
  'researcher': ['research', 'biology', 'chemistry', 'physics', 'data science'],
  'entrepreneur': ['business', 'management', 'entrepreneurship', 'marketing'],
  'consultant': ['business', 'management', 'consulting', 'finance'],
  'diplomat': ['international relations', 'diplomacy', 'political science', 'foreign policy'],
  'civil servant': ['public administration', 'governance', 'political science', 'public policy'],
  'physiotherapist': ['physical therapy', 'dpt', 'rehabilitation'],
  'artist': ['arts', 'fine arts', 'design', 'visual arts'],
  'writer': ['english', 'journalism', 'literature', 'creative writing'],
  'pilot': ['aviation', 'aerospace', 'aeronautical'],
};

/**
 * Degree level mapping: professional degrees map to generic DB values
 * plus name-based search terms to find the right courses.
 */
const DEGREE_LEVEL_MAPPING: Record<string, { dbValue: string; searchTerms: string[] }> = {
  'mbbs':    { dbValue: 'bachelor', searchTerms: ['mbbs', 'medicine', 'surgery', 'medical'] },
  'bds':     { dbValue: 'bachelor', searchTerms: ['bds', 'dental', 'dentistry'] },
  'pharm-d': { dbValue: 'bachelor', searchTerms: ['pharm-d', 'pharm d', 'pharmacy', 'pharmaceutical'] },
  'llb':     { dbValue: 'bachelor', searchTerms: ['llb', 'law', 'legal'] },
  'dpt':     { dbValue: 'bachelor', searchTerms: ['dpt', 'physical therapy', 'physiotherapy'] },
  'barch':   { dbValue: 'bachelor', searchTerms: ['barch', 'architecture'] },
  'bba':     { dbValue: 'bachelor', searchTerms: ['bba', 'business administration'] },
  'llm':     { dbValue: 'masters',  searchTerms: ['llm', 'law', 'legal'] },
  'fcps':    { dbValue: 'masters',  searchTerms: ['fcps', 'mcps', 'medical specialization', 'fellowship'] },
};

/**
 * Resolve a degree level input to its DB value and optional search terms.
 */
function resolveDegreeLevel(degreeLevel: string): { dbValue: string; searchTerms?: string[] } {
  const mapped = DEGREE_LEVEL_MAPPING[degreeLevel.toLowerCase()];
  if (mapped) return mapped;
  return { dbValue: degreeLevel.toLowerCase() };
}

/**
 * Given a field string, return all search terms to use in course matching.
 */
function getFieldSearchTerms(field: string): string[] {
  const lower = field.toLowerCase().trim();
  const aliases = FIELD_ALIASES[lower];
  if (aliases) return aliases;
  // Check partial matches
  for (const [key, values] of Object.entries(FIELD_ALIASES)) {
    if (lower.includes(key) || key.includes(lower)) return values;
  }
  return [field]; // fallback: just the original field
}

/**
 * Given a career goal, return expanded keywords for matching.
 */
function getCareerSearchTerms(careerGoal: string): string[] {
  const lower = careerGoal.toLowerCase().trim();
  const aliases = CAREER_GOAL_ALIASES[lower];
  if (aliases) return aliases;
  // Check partial matches
  for (const [key, values] of Object.entries(CAREER_GOAL_ALIASES)) {
    if (lower.includes(key) || key.includes(lower)) return values;
  }
  // Fall back to splitting into words
  return lower.split(/\s+/).filter(w => w.length > 3);
}

export class RecommendationService {
  async getRecommendations(profile: RecommendationProfile): Promise<RecommendationResult> {
    const [universities, courses, scholarships] = await Promise.all([
      this.findMatchingUniversities(profile),
      this.findMatchingCourses(profile),
      this.findMatchingScholarships(profile),
    ]);

    let aiSummary: string | undefined;
    if (isAIConfigured()) {
      aiSummary = await this.generateAISummary(profile, { universities, courses, scholarships });
    }

    return { universities, courses, scholarships, aiSummary };
  }

  private async findMatchingUniversities(profile: RecommendationProfile) {
    const where: Prisma.UniversityWhereInput = {};

    if (profile.country) {
      where.country = profile.country;
    }

    if (profile.city) {
      // More flexible city matching - case insensitive
      where.city = { contains: profile.city, mode: 'insensitive' };
    }

    const courseFilters: Prisma.CourseWhereInput[] = [];

    if (profile.field) {
      const searchTerms = getFieldSearchTerms(profile.field);
      courseFilters.push({
        OR: [
          ...searchTerms.map(term => ({ name: { contains: term, mode: 'insensitive' as const } })),
          ...searchTerms.map(term => ({ department: { contains: term, mode: 'insensitive' as const } })),
        ],
      });
    }

    if (profile.degreeLevel) {
      const resolved = resolveDegreeLevel(profile.degreeLevel);
      // More flexible degree matching - include variations
      const degreeVariations = ['bachelor', 'bs', 'ba', 'bsc', 'bcom'];
      if (resolved.dbValue === 'bachelor') {
        courseFilters.push({
          OR: degreeVariations.map(dv => ({ degree: { equals: dv, mode: 'insensitive' } }))
        });
      } else {
        courseFilters.push({ degree: { equals: resolved.dbValue } });
      }
      // For professional degrees, also filter by course name/department
      if (resolved.searchTerms) {
        courseFilters.push({
          OR: [
            ...resolved.searchTerms.map(term => ({ name: { contains: term, mode: 'insensitive' as const } })),
            ...resolved.searchTerms.map(term => ({ department: { contains: term, mode: 'insensitive' as const } })),
          ],
        });
      }
    }

    if (courseFilters.length > 0) {
      where.courses = { some: { AND: courseFilters } };
    }

    let results = await prisma.university.findMany({
      where,
      include: {
        courses: {
          select: {
            name: true,
            degree: true,
            department: true,
            tuitionFee: true,
            currency: true,
            description: true,
          },
          take: 20,
        },
        departments: {
          select: {
            name: true,
            totalCourses: true,
          },
          take: 15,
        },
      },
      take: 20,
      orderBy: [{ ranking: 'asc' }, { name: 'asc' }],
    });

    // Fallback: If no results found, try with relaxed filters
    if (results.length === 0 && (profile.city || profile.budget)) {
      const relaxedWhere: Prisma.UniversityWhereInput = {};
      if (profile.country) relaxedWhere.country = profile.country;
      // Remove city filter for fallback
      if (courseFilters.length > 0) {
        relaxedWhere.courses = { some: { AND: courseFilters } };
      }
      results = await prisma.university.findMany({
        where: relaxedWhere,
        include: {
          courses: {
            select: {
              name: true,
              degree: true,
              department: true,
              tuitionFee: true,
              currency: true,
              description: true,
            },
            take: 20,
          },
          departments: {
            select: {
              name: true,
              totalCourses: true,
            },
            take: 15,
          },
        },
        take: 20,
        orderBy: [{ ranking: 'asc' }, { name: 'asc' }],
      });
    }

    return results.map((uni) => {
      const matchScore = this.scoreUniversity(uni, profile);
      const matchReasons = this.getUniversityMatchReasons(uni, profile);
      return {
        id: uni.id,
        name: uni.name,
        country: uni.country,
        city: uni.city,
        type: uni.type,
        sector: uni.sector,
        ranking: uni.ranking,
        matchScore,
        matchReasons,
        courses: uni.courses.map((c) => ({
          name: c.name,
          degree: c.degree,
          department: c.department,
          tuitionFee: c.tuitionFee ? Number(c.tuitionFee) : null,
          currency: c.currency,
          description: c.description,
        })),
        departments: uni.departments.map((d) => ({
          name: d.name,
          totalCourses: d.totalCourses,
        })),
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  private scoreUniversity(
    uni: { city: string | null; country: string; sector: string | null; ranking: number | null; courses: { tuitionFee: unknown; currency: unknown; department: string | null; degree: string; name: string }[] },
    profile: RecommendationProfile
  ): number {
    let score = 10; // Base score - must earn the rest through real matches

    // Country match (25 points)
    if (profile.country && uni.country.toLowerCase().includes(profile.country.toLowerCase())) {
      score += 25;
    }

    // City match (20 points) — actual city check
    if (profile.city && uni.city && uni.city.toLowerCase().includes(profile.city.toLowerCase())) {
      score += 20;
    }

    // Ranking bonus (15 points max) - tiered for better differentiation
    if (uni.ranking && uni.ranking <= 10) score += 15;
    else if (uni.ranking && uni.ranking <= 50) score += 12;
    else if (uni.ranking && uni.ranking <= 100) score += 10;
    else if (uni.ranking && uni.ranking <= 300) score += 7;
    else if (uni.ranking && uni.ranking <= 500) score += 5;
    else if (uni.ranking && uni.ranking <= 1000) score += 3;

    // Budget match (20 points) - with penalty for over budget
    if (profile.budget && uni.courses.length > 0) {
      const avgFee = uni.courses.reduce((sum, c) => sum + (Number(c.tuitionFee) || 0), 0) / uni.courses.length;
      if (avgFee > 0 && avgFee <= profile.budget) score += 20;
      else if (avgFee === 0) score += 15; // Free/unknown is good for budget-conscious
      else if (avgFee <= profile.budget * 1.2) score += 10; // Slightly over but close
      else score -= 10; // Penalty for way over budget
    }

    // Field/department match (up to 30 points) - enhanced with alias-based matching
    if (profile.field && uni.courses.length > 0) {
      const searchTerms = getFieldSearchTerms(profile.field);
      const hasDeptMatch = uni.courses.some(c => 
        c.department && searchTerms.some(term => c.department!.toLowerCase().includes(term))
      );
      const hasNameMatch = uni.courses.some(c => 
        c.name && searchTerms.some(term => c.name.toLowerCase().includes(term))
      );
      
      // If career goal is specified, check for SPECIFIC program match using aliases
      let hasSpecificProgramMatch = false;
      if (profile.careerGoal) {
        const careerTerms = getCareerSearchTerms(profile.careerGoal);
        hasSpecificProgramMatch = uni.courses.some(c => {
          const courseText = `${c.name} ${c.department || ''}`.toLowerCase();
          return careerTerms.some(term => courseText.includes(term));
        });
      }
      
      if (hasSpecificProgramMatch && hasNameMatch) {
        score += 30; // Strongest: career goal AND course name match
      } else if (hasSpecificProgramMatch) {
        score += 25; // Strong: career goal matches programs
      } else if (hasNameMatch && hasDeptMatch) {
        score += 25; // Strong: both name and department match
      } else if (hasNameMatch) {
        score += 20; // Good: course name directly matches field
      } else if (hasDeptMatch) {
        score += 10; // Weaker: only department matches
      } else {
        score -= 15; // Penalty for NOT having the specific program
      }
    }

    // Degree level match (15 points)
    if (profile.degreeLevel && uni.courses.length > 0) {
      const resolved = resolveDegreeLevel(profile.degreeLevel);
      const hasMatchingDegree = uni.courses.some(c => {
        const degreeMatch = c.degree.toLowerCase() === resolved.dbValue;
        if (!degreeMatch) return false;
        // For professional degrees, also check name match
        if (resolved.searchTerms) {
          return resolved.searchTerms.some(term => 
            c.name.toLowerCase().includes(term) || 
            (c.department && c.department.toLowerCase().includes(term))
          );
        }
        return true;
      });
      if (hasMatchingDegree) score += 15;
    }

    // Sector preference (10 points) - low budget prefers public institutions
    if (profile.budget && profile.budget < 50000) {
      if (uni.sector === 'public' || uni.sector === 'government' || uni.sector === 'federal') {
        score += 10;
      }
    }

    // Career goal alignment (10 points) - uses career aliases to avoid false positives
    if (profile.careerGoal && uni.courses.length > 0) {
      const careerTerms = getCareerSearchTerms(profile.careerGoal);
          
      // Check if any course matches career terms
      const hasCareerMatch = uni.courses.some(c => {
        const courseText = `${c.name} ${c.department || ''}`.toLowerCase();
        return careerTerms.some(term => courseText.includes(term));
      });
          
      if (hasCareerMatch) score += 10;
    }

    // Language match bonus (5 points) - if profile language matches country
    if (profile.language) {
      const langMap: Record<string, string[]> = {
        'english': ['united states', 'united kingdom', 'canada', 'australia', 'ireland', 'new zealand'],
        'german': ['germany', 'austria', 'switzerland'],
        'french': ['france', 'canada', 'switzerland', 'belgium'],
        'turkish': ['türkiye', 'turkey'],
        'japanese': ['japan'],
        'korean': ['south korea'],
        'chinese': ['china'],
        'italian': ['italy'],
        'malay': ['malaysia'],
      };
      const lang = profile.language.toLowerCase();
      const countries = langMap[lang] || [];
      if (countries.some(c => uni.country.toLowerCase().includes(c))) {
        score += 5;
      }
    }

    return Math.min(Math.max(score, 0), 100);
  }

  private getUniversityMatchReasons(
    uni: { name: string; country: string; city: string | null; sector: string | null; ranking: number | null; courses: { department: string | null; degree: string; tuitionFee: unknown; currency: string | null; name: string; description: string | null }[] },
    profile: RecommendationProfile
  ): string[] {
    const reasons: string[] = [];

    // City + Country match — specific and personal
    if (profile.city && uni.city && uni.city.toLowerCase().includes(profile.city.toLowerCase())) {
      reasons.push(`Located in ${uni.city} — your preferred city`);
    } else if (profile.country && uni.country.toLowerCase().includes(profile.country.toLowerCase())) {
      reasons.push(`Located in ${uni.city ? uni.city + ', ' : ''}${uni.country}`);
    }

    // Ranking — make it compelling with context
    if (uni.ranking && uni.ranking <= 10) reasons.push(`World Top ${uni.ranking} — elite global institution`);
    else if (uni.ranking && uni.ranking <= 50) reasons.push(`Top ${uni.ranking} worldwide — highly respected`);
    else if (uni.ranking && uni.ranking <= 100) reasons.push(`Top 100 globally (#${uni.ranking}) — excellent reputation`);
    else if (uni.ranking && uni.ranking <= 300) reasons.push(`Ranked #${uni.ranking} globally — strong academic standing`);
    else if (uni.ranking && uni.ranking <= 500) reasons.push(`Ranked #${uni.ranking} — recognized institution`);
    else if (uni.ranking) reasons.push(`Ranked #${uni.ranking}`);

    // Sector advantage — explain WHY it matters
    if (uni.sector === 'government' || uni.sector === 'federal') {
      reasons.push('Government institution — lower fees, high credibility');
    } else if (uni.sector === 'public') {
      reasons.push('Public university — affordable and recognized');
    }

    // Field/department match — list SPECIFIC programs
    if (profile.field && uni.courses.length > 0) {
      const searchTerms = getFieldSearchTerms(profile.field);
      const matchingCourses = uni.courses.filter(c => {
        const nameLower = c.name.toLowerCase();
        const deptLower = (c.department || '').toLowerCase();
        return searchTerms.some(term => nameLower.includes(term) || deptLower.includes(term));
      });
      if (matchingCourses.length > 0) {
        const matchedDept = matchingCourses[0].department;
        const programNames = matchingCourses.slice(0, 4).map(c => c.name);
        const programStr = programNames.join(', ');
        const extra = matchingCourses.length > 4 ? ` +${matchingCourses.length - 4} more` : '';
        reasons.push(`${matchingCourses.length} program${matchingCourses.length > 1 ? 's' : ''} in ${matchedDept || profile.field}: ${programStr}${extra}`);
      }
    }

    // Degree level match — mention specific degree
    if (profile.degreeLevel && uni.courses.length > 0) {
      const resolved = resolveDegreeLevel(profile.degreeLevel);
      const matchingDegrees = [...new Set(uni.courses.filter(c => {
        const degreeMatch = c.degree.toLowerCase() === resolved.dbValue;
        if (!degreeMatch) return false;
        if (resolved.searchTerms) {
          return resolved.searchTerms.some(term => 
            c.name.toLowerCase().includes(term) || 
            (c.department && c.department.toLowerCase().includes(term))
          );
        }
        return true;
      }).map(c => c.degree))];
      if (matchingDegrees.length > 0) {
        reasons.push(`Offers ${matchingDegrees.join('/')} level programs`);
      }
    }

    // Budget match — show SPECIFIC comparison with detailed reasoning
    if (profile.budget) {
      const fees = uni.courses.map(c => Number(c.tuitionFee) || 0).filter(f => f > 0);
      const cur = uni.courses.find(c => Number(c.tuitionFee) > 0)?.currency || profile.currency || 'PKR';
      if (fees.length > 0) {
        const avgFee = fees.reduce((a, b) => a + b, 0) / fees.length;
        const minFee = Math.min(...fees);
        const maxFee = Math.max(...fees);
        const budgetNum = Number(profile.budget);
        
        if (avgFee <= budgetNum) {
          const remaining = budgetNum - avgFee;
          const pctUnder = Math.round(((budgetNum - avgFee) / budgetNum) * 100);
          reasons.push(`Avg fee ${cur} ${Math.round(avgFee).toLocaleString()}/yr — ${pctUnder}% under your ${cur} ${budgetNum.toLocaleString()} budget`);
          if (remaining > 0) {
            reasons.push(`After tuition, you'll have ~${cur} ${Math.round(remaining).toLocaleString()}/yr left for living expenses`);
          }
          if (pctUnder > 30) {
            reasons.push('Excellent value — well within your budget with room to spare');
          }
        } else if (minFee <= budgetNum) {
          const affordablePrograms = fees.filter(f => f <= budgetNum).length;
          reasons.push(`${affordablePrograms} program${affordablePrograms > 1 ? 's' : ''} from ${cur} ${minFee.toLocaleString()}/yr — within your budget`);
          if (maxFee > budgetNum) {
            reasons.push(`Note: Some programs (${cur} ${maxFee.toLocaleString()}/yr) exceed your budget`);
          }
        } else {
          // Over budget but still showing - explain why it might be worth it
          const overPct = Math.round(((minFee - budgetNum) / budgetNum) * 100);
          reasons.push(`Programs start at ${cur} ${minFee.toLocaleString()}/yr — ${overPct}% over your budget, but strong academic reputation may justify the investment`);
        }
      } else {
        reasons.push('Low or no tuition fees — great for budget-conscious students');
        reasons.push('Fee data not available — contact university directly for exact costs');
      }
    }

    // Career goal alignment — use career aliases for accurate matching
    if (profile.careerGoal && uni.courses.length > 0) {
      const careerTerms = getCareerSearchTerms(profile.careerGoal);
      
      const matchingPrograms = uni.courses.filter(c => {
        const courseText = `${c.name} ${c.department || ''} ${c.description || ''}`.toLowerCase();
        return careerTerms.some(term => courseText.includes(term));
      });
      
      if (matchingPrograms.length > 0) {
        const topPrograms = matchingPrograms.slice(0, 3).map(c => c.name);
        const extra = matchingPrograms.length > 3 ? ` +${matchingPrograms.length - 3} more` : '';
        reasons.push(`${matchingPrograms.length} program${matchingPrograms.length > 1 ? 's' : ''} for "${profile.careerGoal}": ${topPrograms.join(', ')}${extra}`);
      }
    }

    // Course count — show breadth of options
    if (uni.courses.length >= 5) {
      reasons.push(`${uni.courses.length}+ programs available — wide selection`);
    }

    return reasons;
  }

  private async findMatchingCourses(profile: RecommendationProfile) {
    const where: Prisma.CourseWhereInput = {};
    const andConditions: Prisma.CourseWhereInput[] = [];

    if (profile.degreeLevel) {
      const resolved = resolveDegreeLevel(profile.degreeLevel);
      andConditions.push({ degree: { equals: resolved.dbValue } });
      // For professional degrees, also filter by course name
      if (resolved.searchTerms) {
        andConditions.push({
          OR: [
            ...resolved.searchTerms.map(term => ({ name: { contains: term, mode: 'insensitive' as const } })),
            ...resolved.searchTerms.map(term => ({ department: { contains: term, mode: 'insensitive' as const } })),
          ],
        });
      }
    }

    if (profile.field) {
      const searchTerms = getFieldSearchTerms(profile.field);
      andConditions.push({
        OR: [
          ...searchTerms.map(term => ({ name: { contains: term, mode: 'insensitive' as const } })),
          ...searchTerms.map(term => ({ department: { contains: term, mode: 'insensitive' as const } })),
        ],
      });
    }

    if (profile.country) {
      andConditions.push({ university: { country: profile.country } });
    }

    if (profile.city) {
      andConditions.push({ university: { city: profile.city } });
    }

    if (profile.budget && profile.currency) {
      // Only filter by budget if the course currency matches the user's currency
      // or if the fee is null (unknown)
      andConditions.push({
        OR: [
          { tuitionFee: null },
          { AND: [{ currency: profile.currency }, { tuitionFee: { lte: profile.budget } }] },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const results = await prisma.course.findMany({
      where,
      include: {
        university: {
          select: { name: true, country: true },
        },
      },
      take: 20,
      orderBy: { name: 'asc' },
    });

    return results.map((course) => {
      const matchScore = this.scoreCourse(course, profile);
      const matchReasons = this.getCourseMatchReasons(course, profile);
      return {
        id: course.id,
        name: course.name,
        degree: course.degree,
        department: course.department,
        tuitionFee: course.tuitionFee ? Number(course.tuitionFee) : null,
        currency: course.currency,
        universityName: course.university.name,
        universityCountry: course.university.country,
        matchScore,
        matchReasons,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  private scoreCourse(
    course: { degree: string; tuitionFee: unknown; department: string | null; name: string },
    profile: RecommendationProfile
  ): number {
    let score = 10; // Base score - must earn the rest through real matches

    // Degree level match (30 points)
    if (profile.degreeLevel) {
      const resolved = resolveDegreeLevel(profile.degreeLevel);
      const degreeMatch = course.degree.toLowerCase() === resolved.dbValue;
      if (degreeMatch) {
        if (resolved.searchTerms) {
          const nameMatch = resolved.searchTerms.some(term => 
            course.name.toLowerCase().includes(term) || 
            (course.department && course.department.toLowerCase().includes(term))
          );
          if (nameMatch) score += 30; // Full points for professional degree match
          else score += 10; // Partial: right level but wrong field
        } else {
          score += 30;
        }
      }
    }
    
    // Department/field match (up to 30 points) - uses field aliases
    // Name match is stronger than department match because it means the course ITSELF is in the field
    if (profile.field) {
      const searchTerms = getFieldSearchTerms(profile.field);
      const hasDeptMatch = course.department && searchTerms.some(term => course.department!.toLowerCase().includes(term));
      const hasNameMatch = searchTerms.some(term => course.name.toLowerCase().includes(term));
      if (hasNameMatch && hasDeptMatch) {
        score += 30; // Strongest: both course name and department match
      } else if (hasNameMatch) {
        score += 25; // Strong: course name directly matches the field
      } else if (hasDeptMatch) {
        score += 15; // Weaker: only department matches (could be unrelated course in a related dept)
      }
    }
    
    // Budget match (20 points)
    if (profile.budget) {
      const fee = Number(course.tuitionFee) || 0;
      if (fee === 0) score += 20; // Free or unknown is good for low budget
      else if (fee <= profile.budget) score += 15;
      else score -= 15; // Penalty for over budget
    }

    // Interest match (15 points)
    if (profile.interests && profile.interests.length > 0) {
      const hasInterestMatch = profile.interests.some(interest => 
        course.name.toLowerCase().includes(interest.toLowerCase()) ||
        (course.department && course.department.toLowerCase().includes(interest.toLowerCase()))
      );
      if (hasInterestMatch) score += 15;
    }

    // Career goal match (10 points) — uses career aliases to avoid false positives
    if (profile.careerGoal) {
      const careerTerms = getCareerSearchTerms(profile.careerGoal);
      const courseText = `${course.name} ${course.department || ''}`.toLowerCase();
      const hasCareerMatch = careerTerms.some(term => courseText.includes(term));
      if (hasCareerMatch) score += 10;
    }

    return Math.min(Math.max(score, 0), 100);
  }

  private getCourseMatchReasons(
    course: { name: string; degree: string; department: string | null; tuitionFee: unknown; currency: string | null },
    profile: RecommendationProfile
  ): string[] {
    const reasons: string[] = [];
    if (profile.degreeLevel) {
      const resolved = resolveDegreeLevel(profile.degreeLevel);
      const degreeMatch = course.degree.toLowerCase() === resolved.dbValue;
      if (degreeMatch) {
        if (resolved.searchTerms) {
          const nameMatch = resolved.searchTerms.some(term => 
            course.name.toLowerCase().includes(term)
          );
          if (nameMatch) reasons.push(`${profile.degreeLevel.toUpperCase()} level program — ${course.name}`);
          else reasons.push(`${course.degree} level program`);
        } else {
          reasons.push(`${course.degree} level program`);
        }
      }
    }
    if (profile.field) {
      const searchTerms = getFieldSearchTerms(profile.field);
      const hasDeptMatch = course.department && searchTerms.some(term => course.department!.toLowerCase().includes(term));
      const hasNameMatch = searchTerms.some(term => course.name.toLowerCase().includes(term));
      if (hasNameMatch && hasDeptMatch) {
        reasons.push(`Strong match: ${course.name} in ${course.department} department — directly aligns with ${profile.field}`);
      } else if (hasDeptMatch) {
        reasons.push(`In ${course.department} department — relevant to ${profile.field}`);
      } else if (hasNameMatch) {
        const matchedTerm = searchTerms.find(term => course.name.toLowerCase().includes(term));
        reasons.push(`Directly matches ${profile.field} field (program name contains "${matchedTerm || profile.field}")`);
      }
    }
    // Budget match — show detailed fee breakdown and value assessment
    if (profile.budget && course.tuitionFee) {
      const fee = Number(course.tuitionFee);
      const cur = course.currency || profile.currency || 'PKR';
      const budgetNum = Number(profile.budget);
      
      if (fee > 0 && fee <= budgetNum) {
        const remaining = budgetNum - fee;
        const pctUsed = Math.round((fee / budgetNum) * 100);
        reasons.push(`Within budget: ${cur} ${fee.toLocaleString()}/yr (${pctUsed}% of your ${cur} ${budgetNum.toLocaleString()} budget)`);
        if (remaining > budgetNum * 0.3) {
          reasons.push('Leaves plenty of room for living expenses and books');
        }
      } else if (fee === 0) {
        reasons.push('Free or very low-cost program — excellent for budget-conscious students');
      } else if (fee > budgetNum) {
        const overAmount = fee - budgetNum;
        const overPct = Math.round((overAmount / budgetNum) * 100);
        reasons.push(`${overPct}% over budget (${cur} ${fee.toLocaleString()} vs your ${cur} ${budgetNum.toLocaleString()}) — consider scholarships or education loans`);
      }
    } else if (!course.tuitionFee || Number(course.tuitionFee) === 0) {
      reasons.push('Tuition fee not listed — contact university for exact costs');
    }
    if (profile.interests && profile.interests.length > 0) {
      const matchedInterests = profile.interests.filter(i => course.name.toLowerCase().includes(i.toLowerCase()) || (course.department && course.department.toLowerCase().includes(i.toLowerCase())));
      if (matchedInterests.length > 0) {
        reasons.push(`Matches your interest${matchedInterests.length > 1 ? 's' : ''}: ${matchedInterests.join(', ')}`);
      }
    }
    if (profile.careerGoal) {
      const careerTerms = getCareerSearchTerms(profile.careerGoal);
      const courseText = `${course.name} ${course.department || ''}`.toLowerCase();
      const matchedTerm = careerTerms.find(term => courseText.includes(term));
      if (matchedTerm) {
        reasons.push(`Pathway to "${profile.careerGoal}" — program covers ${matchedTerm}`);
      }
    }
    return reasons;
  }

  private async findMatchingScholarships(profile: RecommendationProfile) {
    const andConditions: Prisma.ScholarshipWhereInput[] = [
      { OR: [{ deadline: null }, { deadline: { gte: new Date() } }] },
    ];

    // For local scholarships, match by country
    if (profile.country) {
      andConditions.push({
        OR: [
          { country: { contains: profile.country } },
          { category: 'international' }, // Always show international scholarships
        ],
      });
    }

    // Filter by degree level if provided
    if (profile.degreeLevel) {
      const resolved = resolveDegreeLevel(profile.degreeLevel);
      const searchValues = [profile.degreeLevel, resolved.dbValue];
      // Add professional degree search terms too
      if (resolved.searchTerms) {
        searchValues.push(...resolved.searchTerms);
      }
      andConditions.push({
        requirements: {
          some: {
            OR: [
              ...searchValues.map(v => ({ requirementType: 'degree_level', requirementValue: { contains: v } })),
              ...searchValues.map(v => ({ requirementType: 'program_type', requirementValue: { contains: v } })),
            ],
          },
        },
      });
    }

    const where: Prisma.ScholarshipWhereInput = { AND: andConditions };

    const results = await prisma.scholarship.findMany({
      where,
      include: { requirements: true },
      take: 20,
      orderBy: { deadline: 'asc' },
    });

    return results.map((scholarship) => {
      const matchResult = this.evaluateScholarshipMatch(scholarship, profile);
      return {
        id: scholarship.id,
        name: scholarship.name,
        provider: scholarship.provider,
        country: scholarship.country,
        amount: scholarship.amount ? Number(scholarship.amount) : null,
        currency: scholarship.currency,
        deadline: scholarship.deadline,
        matchStrength: matchResult.strength,
        matchReasons: matchResult.reasons,
      };
    }).sort((a, b) => {
      const order = { strong: 0, possible: 1, needs_verification: 2 };
      return (order[a.matchStrength as keyof typeof order] ?? 3) - (order[b.matchStrength as keyof typeof order] ?? 3);
    });
  }

  private evaluateScholarshipMatch(
    scholarship: Prisma.ScholarshipGetPayload<{ include: { requirements: true } }>,
    profile: RecommendationProfile
  ): { strength: string; reasons: string[] } {
    const reasons: string[] = [];
    let matchCount = 0;
    let totalChecks = 0;

    // Country match
    if (profile.country && scholarship.country) {
      totalChecks++;
      if (scholarship.country.toLowerCase().includes(profile.country.toLowerCase())) {
        matchCount++;
        reasons.push(`Available in ${scholarship.country}`);
      }
    }

    // Nationality match - check requirements for nationality eligibility
    if (profile.nationality) {
      const natReq = scholarship.requirements.find((r) => r.requirementType === 'nationality');
      if (natReq) {
        totalChecks++;
        const reqLower = natReq.requirementValue.toLowerCase();
        const natLower = profile.nationality.toLowerCase();
        const isOpenToAll = reqLower.includes('all nationalit') || reqLower.includes('international') || reqLower.includes('open to all') || reqLower.includes('any nationalit') || reqLower.includes('worldwide');
        const isDirectMatch = reqLower.includes(natLower);
        const isGroupMatch = reqLower.includes('commonwealth') || reqLower.includes('developing countr') || reqLower.includes('oic') || reqLower.includes('muslim') || reqLower.includes('south asian') || reqLower.includes('asia');
        if (isOpenToAll || isDirectMatch || isGroupMatch) {
          matchCount++;
          reasons.push(`Eligible by nationality — ${natReq.requirementValue.slice(0, 80)}`);
        } else {
          reasons.push(`Verify nationality eligibility — may be restricted`);
        }
      }
    }

    // Degree level match
    if (profile.degreeLevel) {
      const resolved = resolveDegreeLevel(profile.degreeLevel);
      const searchValues = [profile.degreeLevel.toLowerCase(), resolved.dbValue];
      if (resolved.searchTerms) searchValues.push(...resolved.searchTerms);
      
      const degReq = scholarship.requirements.find((r) => r.requirementType === 'degree_level');
      const progReq = scholarship.requirements.find((r) => r.requirementType === 'program_type');
      if (degReq || progReq) {
        totalChecks++;
        const degMatch = degReq && searchValues.some(v => degReq.requirementValue.toLowerCase().includes(v));
        const progMatch = progReq && searchValues.some(v => progReq.requirementValue.toLowerCase().includes(v));
        if (degMatch || progMatch) {
          matchCount++;
          reasons.push(`Matches ${profile.degreeLevel.toUpperCase()} level`);
        }
      }
    }

    // Field match — use field aliases for broader matching
    if (profile.field) {
      const fieldReq = scholarship.requirements.find((r) => r.requirementType === 'field');
      if (fieldReq) {
        totalChecks++;
        const reqLower = fieldReq.requirementValue.toLowerCase();
        const fieldSearchTerms = getFieldSearchTerms(profile.field);
        const hasFieldMatch = reqLower.includes(profile.field.toLowerCase()) || fieldSearchTerms.some(term => reqLower.includes(term));
        if (hasFieldMatch) {
          matchCount++;
          reasons.push(`Covers ${profile.field} field`);
        }
      }
    }

    // Marks/percentage match
    if (profile.gpa) {
      const marksReq = scholarship.requirements.find((r) => r.requirementType === 'marks_percentage');
      if (marksReq) {
        totalChecks++;
        // Extract minimum percentage from requirement text
        const minMatch = marksReq.requirementValue.match(/(\d+)%/);
        if (minMatch) {
          const minPercent = parseInt(minMatch[1]);
          const gpaPercent = profile.gpa * 25; // Convert 4.0 GPA to percentage
          if (gpaPercent >= minPercent) {
            matchCount++;
            reasons.push(`Your GPA meets minimum requirement (${minPercent}%)`);
          } else {
            reasons.push(`Minimum ${minPercent}% required (your GPA: ${profile.gpa}/4.0)`);
          }
        }
      }
    }

    // Test score matching for international scholarships
    if (profile.testScores) {
      const entryReq = scholarship.requirements.find((r) => r.requirementType === 'entry_test');
      if (entryReq) {
        const reqText = entryReq.requirementValue.toLowerCase();
        if (reqText.includes('gre') && profile.testScores.gre) {
          const greMinMatch = entryReq.requirementValue.match(/min.*?(\d+)/);
          if (greMinMatch && profile.testScores.gre >= parseInt(greMinMatch[1])) {
            reasons.push(`Your GRE (${profile.testScores.gre}) meets requirement`);
          }
        }
        if (reqText.includes('gmat') && profile.testScores.gmat) {
          const gmatMinMatch = entryReq.requirementValue.match(/min.*?(\d+)/);
          if (gmatMinMatch && profile.testScores.gmat >= parseInt(gmatMinMatch[1])) {
            reasons.push(`Your GMAT (${profile.testScores.gmat}) meets requirement`);
          }
        }
      }
      const engReq = scholarship.requirements.find((r) => r.requirementType === 'english_proficiency');
      if (engReq) {
        const engText = engReq.requirementValue.toLowerCase();
        if (engText.includes('ielts') && profile.testScores.ielts) {
          const ieltsMinMatch = engReq.requirementValue.match(/(\d+\.?\d*)\+?/);
          if (ieltsMinMatch && profile.testScores.ielts >= parseFloat(ieltsMinMatch[1])) {
            reasons.push(`Your IELTS (${profile.testScores.ielts}) meets requirement`);
          }
        }
        if (engText.includes('toefl') && profile.testScores.toefl) {
          const toeflMinMatch = engReq.requirementValue.match(/(\d+)\+?/);
          if (toeflMinMatch && profile.testScores.toefl >= parseInt(toeflMinMatch[1])) {
            reasons.push(`Your TOEFL (${profile.testScores.toefl}) meets requirement`);
          }
        }
      }
    }

    // Always show amount and deadline info
    if (scholarship.amount) {
      reasons.push(`Amount: ${scholarship.currency || 'USD'} ${scholarship.amount.toLocaleString()}`);
    }
    if (scholarship.deadline) {
      const deadlineDate = new Date(scholarship.deadline);
      const monthsUntil = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
      if (monthsUntil <= 2) {
        reasons.push(`Deadline: ${deadlineDate.toLocaleDateString()} (${monthsUntil} month${monthsUntil !== 1 ? 's' : ''} left — apply soon!)`);
      } else {
        reasons.push(`Deadline: ${deadlineDate.toLocaleDateString()}`);
      }
    }

    // Show benefits info from requirements
    const benefitsReq = scholarship.requirements.find((r) => r.requirementType === 'benefits');
    if (benefitsReq) {
      reasons.push(`Benefits: ${benefitsReq.requirementValue.slice(0, 100)}${benefitsReq.requirementValue.length > 100 ? '...' : ''}`);
    }

    if (totalChecks === 0) return { strength: 'needs_verification', reasons };
    if (matchCount === totalChecks && totalChecks >= 2) return { strength: 'strong', reasons };
    if (matchCount >= 1) return { strength: 'possible', reasons };
    return { strength: 'not_eligible', reasons: ['Does not match your profile'] };
  }

  private async generateAISummary(
    profile: RecommendationProfile,
    data: { universities: Array<{ name: string; country: string; city: string | null; sector: string | null; ranking: number | null; matchScore: number; courses: Array<{ name: string; degree: string; department: string | null; tuitionFee: number | null; currency: string | null }> }>; courses: Array<{ name: string; degree: string; universityName: string; universityCountry: string; tuitionFee: number | null; currency: string | null }>; scholarships: Array<{ name: string; provider: string; country: string | null; amount: number | null; currency: string | null; deadline: Date | null; matchStrength: string }> }
  ): Promise<string> {
    try {
      const provider = getAIProvider();

      const profileDesc = [
        profile.field && `Field: ${profile.field}`,
        profile.country && `Country: ${profile.country}`,
        profile.degreeLevel && `Degree: ${profile.degreeLevel}`,
        profile.budget && `Budget: ${profile.currency || 'USD'} ${profile.budget.toLocaleString()}/year`,
        profile.careerGoal && `Career Goal: ${profile.careerGoal}`,
        profile.city && `Preferred City: ${profile.city}`,
      ].filter(Boolean).join('; ');

      const uniList = data.universities.slice(0, 10).map((u) => {
        const avgFee = u.courses.length > 0 ? u.courses.reduce((sum, c) => sum + (c.tuitionFee || 0), 0) / u.courses.length : 0;
        const courseNames = u.courses.slice(0, 15).map((c) => `${c.name} (${c.degree}${c.department ? `, ${c.department}` : ''})`).join(', ');
        const totalPrograms = u.courses.length;
        return `${u.name}|${u.country}${u.city ? ', ' + u.city : ''}|${u.sector || 'unknown'} sector|QS ranking: ${u.ranking || 'unranked'}|match: ${u.matchScore}%|avg fee: ${avgFee > 0 ? `${profile.currency || 'PKR'} ${avgFee.toLocaleString()}/year` : 'free/low'}|total programs: ${totalPrograms}|programs: ${courseNames || 'see university page'}`;
      }).join('\n');

      const courseList = data.courses.slice(0, 10).map((c) => `${c.name}|${c.degree}|${c.universityName} (${c.universityCountry})|fee: ${c.tuitionFee ? `${c.currency || 'USD'} ${c.tuitionFee.toLocaleString()}` : 'free/unknown'}`).join('\n');

      const scholarshipList = data.scholarships.slice(0, 10).map((s) => `${s.name}|${s.provider}|${s.country || 'global'}|amount: ${s.amount ? `${s.currency || 'USD'} ${s.amount.toLocaleString()}` : 'varies'}|deadline: ${s.deadline ? new Date(s.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'rolling'}|match: ${s.matchStrength}`).join('\n');

      const response = await provider.complete({
        messages: [
          {
            role: 'system',
            content: `You are an expert education advisor AI. Write a HIGHLY PERSONALIZED, ACTIONABLE recommendation summary for a student.

GROUNDING RULES (MOST IMPORTANT):
- You MUST ONLY reference universities, courses, and scholarships explicitly listed in the DATA section below.
- Do NOT invent, fabricate, or recommend any institution, program, or scholarship not in the data.
- Do NOT make up tuition fees, deadlines, or amounts. Only use the exact numbers provided.
- If the data shows limited options, acknowledge that honestly and suggest the student broaden their search.
- Budget in the data is PER YEAR (annual), not per semester.

ANALYSIS RULES:
- Compare match scores to identify the STRONGEST matches, not just the highest ranked.
- If budget is provided, prioritize affordable options and scholarships that fit.
- If career goal is provided, connect specific programs to career outcomes.
- Mention specific deadlines that are approaching soon.
- Highlight scholarship amounts and what they cover.
- For EACH university recommendation, give a STRONG, SPECIFIC reason WHY it's perfect for this student (mention ranking, fee, sector, specific programs, department quality, location advantage, etc.)

FORMATTING RULES (CRITICAL - MUST FOLLOW):
1. **ABSOLUTELY NO TABLES** - Do NOT use any table format. Do NOT use pipe characters (|). Do NOT use dashes with spaces to create table rows. NO "|" symbols anywhere in your response.
2. Use ONLY plain text with **Bold headings** and bullet points (- text).
3. Maximum 300 words.
4. Professional, warm, actionable tone.
5. If budget is tight, suggest scholarships from the data, financial aid, or free alternatives.
6. Always include at least one specific next step with a deadline.
7. For each university, explain WHY it's a great match (not just "100% match" — give concrete reasons).
8. **NEVER use markdown table syntax** like |---|---| or | column | column |. Use bullet points instead.

OUTPUT FORMAT:

**Your Best Matches**
- Top university/program from data with SPECIFIC, STRONG reasons (mention QS ranking, exact fee, sector advantage, specific programs/departments, why it fits the student's goals)
- Second option with detailed reasoning tied to student's profile
- Third option with detailed reasoning

**Funding Opportunities**
- Specific scholarships from data with amounts, deadlines, and what they cover
- Mention any "apply soon" deadlines within 2 months

**Action Plan**
- One concrete action with deadline (e.g., "Apply to X scholarship by Y date")
- One backup plan if primary doesn't work out

No tables. No columns. No HTML. No pipe symbols. Only bold headings and bullet points.`,
          },
          {
            role: 'user',
            content: `STUDENT: ${profileDesc}

DATABASE RESULTS (use ONLY these):

UNIVERSITIES:
${uniList || 'No matches found'}

COURSES:
${courseList || 'No matches found'}

SCHOLARSHIPS:
${scholarshipList || 'No matches found'}

Write the recommendation. Reference ONLY the institutions and programs listed above. If budget is low, prioritize scholarships and free/low-cost options from the data. Remember: Budget is PER YEAR (annual). For each university, give STRONG, SPECIFIC reasons WHY it's perfect for this student.`,
          },
        ],
        temperature: 0.4,
        maxTokens: 800,
      });

      // Post-process to remove any tables that AI might have generated
      return this.removeTablesFromResponse(response.content);
    } catch {
      return '';
    }
  }

  /**
   * Post-process AI response to remove any tables
   */
  private removeTablesFromResponse(response: string): string {
    // Remove any table rows (lines with | characters)
    const lines = response.split('\n');
    const filteredLines = lines.filter(line => {
      // Remove lines that look like table rows
      if (line.includes('|') && (line.trim().startsWith('|') || line.trim().endsWith('|'))) {
        return false;
      }
      // Remove table separator lines (|---|---|)
      if (line.match(/^\|[\s\-|]+\|$/)) {
        return false;
      }
      return true;
    });
    return filteredLines.join('\n');
  }
}

export const recommendationService = new RecommendationService();
