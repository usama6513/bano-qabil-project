import { NextRequest } from 'next/server';
import { getAIProvider, getFallbackProvider, getSecondFallbackProvider } from '@/services/ai';

export interface DocumentAnalysisResponse {
  id: string;
  userId: string;
  documentType: string;
  detectedType?: string;
  documentTitle?: string;
  personName?: string;
  overallScore: number;
  structureScore: number;
  clarityScore: number;
  grammarScore: number;
  relevanceScore: number;
  executiveSummary: string;
  strengths: string[];
  areasForImprovement: string[];
  suggestions: Suggestion[];
  integrityCheck: IntegrityCheck;
  originalContent: string;
  targetInstitution?: string;
  targetProgram?: string;
  createdAt: string;
}

export interface Suggestion {
  category: string;
  severity: 'low' | 'medium' | 'high';
  originalText: string;
  suggestedText: string;
  explanation: string;
}

export interface IntegrityCheck {
  flaggedClaims: string[];
  fakeIndicators: string[];
  integrityScore: number;
  warnings: string[];
}

export interface AnalysisHistoryOptions {
  documentType?: string;
  page?: number;
  limit?: number;
}

const documentTypeGuidelines: Record<string, { title: string; description: string; tips: string[] }> = {
  sop: {
    title: 'Statement of Purpose (SOP)',
    description: 'A well-crafted SOP clearly articulates your academic goals, research interests, and why you are a strong fit for the program.',
    tips: [
      'Start with a compelling opening that hooks the reader',
      'Clearly state your academic and career goals',
      'Explain why you chose this specific program and institution',
      'Highlight relevant research experience and achievements',
      'Show alignment between your goals and the program offerings',
      'End with a strong conclusion that reinforces your commitment',
      'Keep it concise — typically 500-1000 words',
    ],
  },
  personal_statement: {
    title: 'Personal Statement',
    description: 'A personal statement tells your unique story, demonstrating motivation, character, and suitability for the program.',
    tips: [
      'Share your personal journey and what led you to this field',
      'Use specific anecdotes and examples',
      'Show genuine passion and enthusiasm',
      'Connect personal experiences to academic/professional goals',
      'Be authentic — avoid generic statements',
      'Demonstrate growth and self-awareness',
    ],
  },
  recommendation_letter: {
    title: 'Recommendation Letter',
    description: 'A strong recommendation letter provides specific examples of the candidate abilities and character from a credible referee.',
    tips: [
      'Include specific examples and anecdotes',
      'Quantify achievements where possible',
      'Address the candidate key qualities relevant to the program',
      'Compare the candidate to peers when appropriate',
      'Use official letterhead and include referee credentials',
      'Keep it to one page',
    ],
  },
  cv_resume: {
    title: 'CV / Resume',
    description: 'An effective CV or resume presents your qualifications in a clear, organized format tailored to the target role or program.',
    tips: [
      'Tailor your CV to the specific program or position',
      'Use reverse chronological order',
      'Quantify achievements with numbers and metrics',
      'Include relevant keywords from the job/program description',
      'Keep formatting consistent and professional',
      'Limit to 1-2 pages for industry, 2-3 for academic CVs',
    ],
  },
  cover_letter: {
    title: 'Cover Letter',
    description: 'A cover letter introduces you to the employer and explains why you are the best candidate for the role.',
    tips: [
      'Address the hiring manager by name if possible',
      'Reference the specific position and company',
      'Highlight 2-3 key qualifications that match the role',
      'Show knowledge of the company and its mission',
      'Include a call to action and express enthusiasm',
      'Keep it to one page',
    ],
  },
  essay: {
    title: 'Essay',
    description: 'A strong essay demonstrates critical thinking, clear argumentation, and effective communication skills.',
    tips: [
      'Develop a clear thesis statement',
      'Support arguments with evidence and examples',
      'Use logical structure with introduction, body, and conclusion',
      'Maintain a consistent tone and voice',
      'Edit and proofread carefully',
      'Stay within the word limit',
    ],
  },
  other: {
    title: 'General Document',
    description: 'General tips for any academic or professional document.',
    tips: [
      'Maintain a clear and professional tone',
      'Use proper grammar and spelling',
      'Organize content logically',
      'Proofread multiple times',
      'Get feedback from others',
      'Ensure the document serves its intended purpose',
    ],
  },
};

class DocumentIntelligenceService {
  private analyses: Map<string, DocumentAnalysisResponse> = new Map();
  private userAnalyses: Map<string, string[]> = new Map();

  private detectDocumentType(content: string): string {
    const lower = content.toLowerCase();
    if (lower.includes('statement of purpose') || lower.includes('sop') || (lower.includes('research interest') && lower.includes('program'))) return 'sop';
    if (lower.includes('personal statement') || lower.includes('my journey') || lower.includes('i was born')) return 'personal_statement';
    if (lower.includes('recommendation letter') || lower.includes('i am pleased to recommend') || lower.includes('i strongly recommend')) return 'recommendation_letter';
    if (lower.includes('cover letter') || lower.includes('dear hiring manager') || lower.includes('i am writing to express')) return 'cover_letter';
    if (lower.includes('resume') || lower.includes('curriculum vitae') || lower.includes('work experience') || lower.includes('education') && lower.includes('skills')) return 'cv_resume';
    if (lower.includes('essay') || lower.includes('thesis') || lower.includes('in this essay')) return 'essay';
    return 'other';
  }

  private extractDocumentTitle(content: string): string | undefined {
    const lines = content.split('\n').filter(l => l.trim());
    for (const line of lines.slice(0, 8)) {
      const trimmed = line.trim();
      if (trimmed.length < 3 || trimmed.length > 120) continue;
      if (trimmed.includes('@') || trimmed.includes('http') || trimmed.includes('.com')) continue;
      if (/^\d+$/.test(trimmed)) continue;
      if (/^(phone|email|tel|cell|address|linkedin|github|portfolio)/i.test(trimmed)) continue;
      const lower = trimmed.toLowerCase();
      if (/^(curriculum vitae|resume|cv|cover letter|statement of purpose|personal statement|recommendation letter|letter of recommendation)/i.test(lower)) return trimmed;
      if (/^(education|experience|skills|projects|summary|objective|references|certifications|contact|about)/i.test(lower)) continue;
      if (/^[A-Z]/.test(trimmed) && trimmed.split(' ').length >= 2 && trimmed.split(' ').length <= 6 && !/\d{4}/.test(trimmed)) {
        return trimmed;
      }
    }
    return undefined;
  }

  private extractPersonName(content: string): string | undefined {
    const lines = content.split('\n').filter(l => l.trim());
    for (const line of lines.slice(0, 10)) {
      const trimmed = line.trim();
      if (trimmed.length < 3 || trimmed.length > 60) continue;
      if (trimmed.includes('@') || trimmed.includes('http')) continue;
      const nameMatch = trimmed.match(/^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3})$/);
      if (nameMatch) return nameMatch[1];
      const upperMatch = trimmed.match(/^([A-Z]{2,}(?:\s+[A-Z]{2,}){1,3})$/);
      if (upperMatch) return upperMatch[1].toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      const multiWord = trimmed.match(/^([A-Z][a-z]+(?:\s+[a-z]+)*\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)$/);
      if (multiWord && multiWord[1].split(' ').length >= 2 && multiWord[1].split(' ').length <= 5) {
        if (!/\b(street|road|avenue|boulevard|drive|lane|ave|st|rd|blvd|dr|ln)\b/i.test(multiWord[1]) &&
            !/\b(university|institute|college|school|academy|hospital|company|inc|ltd|llc)\b/i.test(multiWord[1])) {
          return multiWord[1];
        }
      }
    }
    const emailMatch = content.match(/([A-Z][a-z]+)\s+([A-Z][a-z]+)\s*[<\n]/);
    if (emailMatch) return `${emailMatch[1]} ${emailMatch[2]}`;
    return undefined;
  }

  private async aiAnalyze(content: string, documentType: string, targetInstitution?: string, targetProgram?: string): Promise<{
    scores: { overall: number; structure: number; clarity: number; grammar: number; relevance: number };
    summary: string;
    strengths: string[];
    improvements: string[];
    suggestions: Suggestion[];
    detectedType: string;
    personName: string;
  } | null> {
    try {
      const provider = getAIProvider();
      const fallbackProvider = getFallbackProvider();
      const secondFallbackProvider = getSecondFallbackProvider();
      const truncated = content.slice(0, 3000);
      const typeLabel = documentType.replace(/_/g, ' ');

      const requestPayload = {
        messages: [
          { role: 'system' as const, content: `You are a world-class document analysis expert. You analyze academic and professional documents with extreme precision. You give SPECIFIC, ACTIONABLE feedback — not generic advice. You reference actual text from the document. You are strict but fair.

SCORING GUIDELINES:
- 90-100: Exceptional — ready to submit as-is
- 75-89: Strong — minor improvements only
- 60-74: Good foundation — needs targeted work
- 40-59: Below average — significant gaps
- 0-39: Poor — major rewrite needed
- AVERAGE documents score 55-70. Only truly exceptional work scores 85+.
- Do NOT inflate scores. Most student documents should score 45-70.` },
          { role: 'user' as const, content: `Analyze this ${typeLabel} document. Be EXTREMELY specific and detailed.

DOCUMENT CONTENT:
${truncated}

${targetInstitution ? `Target Institution: ${targetInstitution}` : ''}
${targetProgram ? `Target Program: ${targetProgram}` : ''}

Respond in EXACTLY this JSON format (no markdown, no code fences):
{
  "detectedType": "what this document actually is (cv_resume, sop, personal_statement, cover_letter, recommendation_letter, essay, other)",
  "personName": "the person's name if found in the document, or empty string",
  "overallScore": number 0-100,
  "structureScore": number 0-100,
  "clarityScore": number 0-100,
  "grammarScore": number 0-100,
  "relevanceScore": number 0-100,
  "summary": "2-3 sentence specific summary of this EXACT document — reference the person's name, what they studied, what they want. Not generic.",
  "strengths": ["specific strength 1 with example from doc", "specific strength 2", "specific strength 3"],
  "improvements": ["specific improvement 1 with what's missing", "specific improvement 2", "specific improvement 3"],
  "suggestions": [{"category": "category", "severity": "high|medium|low", "originalText": "exact text from doc", "suggestedText": "improved version", "explanation": "why this change matters"}]
}

RULES:
- Scores must reflect ACTUAL quality using the scoring guidelines above — be strict, not generous
- strengths must reference SPECIFIC parts of the document — quote actual phrases
- improvements must tell EXACTLY what to add/change — be specific
- suggestions must quote REAL text from the document and provide concrete rewrites
- Limit suggestions to max 5 most impactful ones
- If document is a CV: check for quantified achievements, action verbs, relevant skills, proper formatting
- If document is an SOP: check for clear goals, specific examples, why this program, research fit
- If document is a cover letter: check for company knowledge, specific role fit, enthusiasm
- If document is a recommendation letter: check for specific examples, comparison to peers, credibility
- personName: extract the name of the person this document is ABOUT
- Be harsh but fair. A 50/100 means genuinely needs work. Most documents score 55-70.` }
        ],
        model: process.env.AI_MODEL || 'openai/gpt-oss-20b',
        temperature: 0.3,
        maxTokens: 1500,
      };

      let response;
      try {
        response = await provider.complete(requestPayload);
      } catch {
        if (fallbackProvider) {
          try {
            response = await fallbackProvider.complete(requestPayload);
          } catch {
            if (secondFallbackProvider) {
              response = await secondFallbackProvider.complete(requestPayload);
            } else {
              return null;
            }
          }
        } else {
          return null;
        }
      }

      const text = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(text);

      return {
        scores: {
          overall: Math.min(100, Math.max(0, parsed.overallScore || 50)),
          structure: Math.min(100, Math.max(0, parsed.structureScore || 50)),
          clarity: Math.min(100, Math.max(0, parsed.clarityScore || 50)),
          grammar: Math.min(100, Math.max(0, parsed.grammarScore || 50)),
          relevance: Math.min(100, Math.max(0, parsed.relevanceScore || 50)),
        },
        summary: parsed.summary || '',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map((s: Record<string, string>) => ({
          category: s.category || 'general',
          severity: (['high', 'medium', 'low'].includes(s.severity) ? s.severity : 'medium') as 'high' | 'medium' | 'low',
          originalText: s.originalText || '',
          suggestedText: s.suggestedText || '',
          explanation: s.explanation || '',
        })) : [],
        detectedType: parsed.detectedType || documentType,
        personName: parsed.personName || '',
      };
    } catch {
      return null;
    }
  }

  async analyzeDocument(
    userId: string,
    content: string,
    _request?: NextRequest,
    options?: { documentType?: string; targetInstitution?: string; targetProgram?: string; additionalContext?: string }
  ): Promise<DocumentAnalysisResponse> {
    let documentType = options?.documentType || 'other';
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const sentenceCount = content.split(/[.!?]+/).filter(Boolean).length;
    const paragraphCount = content.split(/\n\n+/).filter(Boolean).length;

    const detectedType = this.detectDocumentType(content);
    if (documentType === 'other' && detectedType !== 'other') documentType = detectedType;

    const documentTitle = this.extractDocumentTitle(content);
    const personName = this.extractPersonName(content);

    const aiResult = await this.aiAnalyze(content, documentType, options?.targetInstitution, options?.targetProgram);

    let structureScore: number, clarityScore: number, grammarScore: number, relevanceScore: number, overallScore: number;
    let strengths: string[], areasForImprovement: string[], suggestions: Suggestion[], executiveSummary: string;

    if (aiResult) {
      structureScore = aiResult.scores.structure;
      clarityScore = aiResult.scores.clarity;
      grammarScore = aiResult.scores.grammar;
      relevanceScore = aiResult.scores.relevance;
      overallScore = aiResult.scores.overall;
      strengths = aiResult.strengths.length > 0 ? aiResult.strengths : this.generateStrengths(content, structureScore, clarityScore, grammarScore, relevanceScore);
      areasForImprovement = aiResult.improvements.length > 0 ? aiResult.improvements : this.generateAreasForImprovement(content, structureScore, clarityScore, grammarScore, relevanceScore);
      suggestions = aiResult.suggestions.length > 0 ? aiResult.suggestions : this.generateSuggestions(content, documentType);
      executiveSummary = aiResult.summary || this.generateExecutiveSummary(overallScore, structureScore, clarityScore, grammarScore, relevanceScore, documentType);
      if (aiResult.detectedType && aiResult.detectedType !== documentType) documentType = aiResult.detectedType;
    } else {
      structureScore = this.calculateStructureScore(wordCount, sentenceCount, paragraphCount);
      clarityScore = this.calculateClarityScore(content);
      grammarScore = this.calculateGrammarScore(content);
      relevanceScore = this.calculateRelevanceScore(content, documentType, options?.targetInstitution, options?.targetProgram);
      overallScore = Math.round((structureScore + clarityScore + grammarScore + relevanceScore) / 4);
      strengths = this.generateStrengths(content, structureScore, clarityScore, grammarScore, relevanceScore);
      areasForImprovement = this.generateAreasForImprovement(content, structureScore, clarityScore, grammarScore, relevanceScore);
      suggestions = this.generateSuggestions(content, documentType);
      executiveSummary = this.generateExecutiveSummary(overallScore, structureScore, clarityScore, grammarScore, relevanceScore, documentType);
    }

    const integrityCheck = this.analyzeIntegrity(content);

    const id = crypto.randomUUID();
    const result: DocumentAnalysisResponse = {
      id,
      userId,
      documentType,
      detectedType,
      documentTitle,
      personName: personName || aiResult?.personName || undefined,
      overallScore,
      structureScore,
      clarityScore,
      grammarScore,
      relevanceScore,
      executiveSummary,
      strengths,
      areasForImprovement,
      suggestions,
      integrityCheck,
      originalContent: content,
      targetInstitution: options?.targetInstitution,
      targetProgram: options?.targetProgram,
      createdAt: new Date().toISOString(),
    };

    this.analyses.set(id, result);
    const userAnalysesList = this.userAnalyses.get(userId) || [];
    userAnalysesList.unshift(id);
    this.userAnalyses.set(userId, userAnalysesList);

    return result;
  }

  async getAnalysisHistory(
    userId: string,
    options: AnalysisHistoryOptions = {}
  ): Promise<{ analyses: DocumentAnalysisResponse[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const userAnalysisIds = this.userAnalyses.get(userId) || [];

    let analyses = userAnalysisIds
      .map((id) => this.analyses.get(id))
      .filter((a): a is DocumentAnalysisResponse => a !== undefined);

    if (options.documentType) {
      analyses = analyses.filter((a) => a.documentType === options.documentType);
    }

    const total = analyses.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedAnalyses = analyses.slice(start, start + limit);

    return { analyses: paginatedAnalyses, total, page, limit, totalPages };
  }

  async getAnalysisById(id: string, userId: string): Promise<DocumentAnalysisResponse | null> {
    const analysis = this.analyses.get(id);
    if (!analysis || analysis.userId !== userId) return null;
    return analysis;
  }

  async deleteAnalysis(id: string, userId: string): Promise<boolean> {
    const analysis = this.analyses.get(id);
    if (!analysis || analysis.userId !== userId) return false;

    this.analyses.delete(id);
    const userAnalysisIds = this.userAnalyses.get(userId) || [];
    this.userAnalyses.set(
      userId,
      userAnalysisIds.filter((aId) => aId !== id)
    );
    return true;
  }

  getDocumentTypeGuidelines(documentType: string): { title: string; description: string; tips: string[] } | null {
    return documentTypeGuidelines[documentType] || null;
  }

  getAllDocumentTypeGuidelines(): Record<string, { title: string; description: string; tips: string[] }> {
    return documentTypeGuidelines;
  }

  private calculateStructureScore(wordCount: number, sentenceCount: number, paragraphCount: number): number {
    let score = 40;
    if (wordCount >= 200 && wordCount <= 2000) score += 15;
    else if (wordCount > 2000) score += 5;
    else if (wordCount < 50) score -= 15;
    else if (wordCount < 100) score -= 5;

    if (sentenceCount >= 5) score += 10;
    if (paragraphCount >= 3) score += 10;
    if (paragraphCount >= 5) score += 5;

    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) score += 10;
    else if (avgWordsPerSentence > 30) score -= 5;

    return Math.min(100, Math.max(0, score));
  }

  private calculateClarityScore(content: string): number {
    let score = 55;
    const sentences = content.split(/[.!?]+/).filter(Boolean);
    const avgWordsPerSentence = sentences.length > 0 ? content.split(/\s+/).length / sentences.length : 0;

    if (avgWordsPerSentence <= 20) score += 10;
    else if (avgWordsPerSentence > 30) score -= 15;
    else if (avgWordsPerSentence > 25) score -= 5;

    const complexWords = ['utilize', 'commence', 'terminate', 'facilitate', 'subsequently', 'aforementioned', 'furthermore', 'nevertheless'];
    const foundComplex = complexWords.filter((w) => content.toLowerCase().includes(w)).length;
    score -= foundComplex * 3;

    const fillerWords = ['very', 'really', 'quite', 'just', 'basically', 'actually', 'literally'];
    const foundFiller = fillerWords.filter((w) => {
      const regex = new RegExp(`\\b${w}\\b`, 'gi');
      return regex.test(content);
    }).length;
    score -= foundFiller * 2;

    return Math.min(100, Math.max(0, score));
  }

  private calculateGrammarScore(content: string): number {
    let score = 60;

    const doubleSpaceRegex = /  +/g;
    if (doubleSpaceRegex.test(content)) score -= 5;

    const sentences = content.split(/[.!?]+/).filter(Boolean);
    const capitalizedSentences = sentences.filter((s) => {
      const trimmed = s.trim();
      return trimmed.length > 0 && trimmed[0] === trimmed[0].toUpperCase();
    }).length;
    if (sentences.length > 0) {
      const capitalRatio = capitalizedSentences / sentences.length;
      if (capitalRatio >= 0.9) score += 10;
      else if (capitalRatio < 0.5) score -= 15;
    }

    const commaSplices = content.split(/[,.]/).filter((s) => s.trim().length > 40);
    if (commaSplices.length > 3) score -= 10;

    const allCapsWords = content.match(/\b[A-Z]{3,}\b/g);
    if (allCapsWords && allCapsWords.length > 2) score -= 5;

    return Math.min(100, Math.max(0, score));
  }

  private calculateRelevanceScore(content: string, documentType: string, targetInstitution?: string, targetProgram?: string): number {
    let score = 40;
    const lowerContent = content.toLowerCase();

    const typeKeywords: Record<string, string[]> = {
      sop: ['research', 'academic', 'program', 'study', 'goal', 'university', 'degree', 'career'],
      personal_statement: ['passion', 'journey', 'experience', 'growth', 'motivation', 'inspiration'],
      recommendation_letter: ['recommend', 'pleasure', 'quality', 'performance', 'achievement', 'character'],
      cv_resume: ['experience', 'education', 'skills', 'achievement', 'project', 'certification'],
      cover_letter: ['position', 'company', 'role', 'qualification', 'experience', 'team'],
      essay: ['argument', 'thesis', 'evidence', 'analysis', 'perspective', 'conclusion'],
    };

    const keywords = typeKeywords[documentType] || typeKeywords.sop;
    const foundKeywords = keywords.filter((k) => lowerContent.includes(k));
    score += (foundKeywords.length / keywords.length) * 20;

    if (targetInstitution && lowerContent.includes(targetInstitution.toLowerCase())) score += 10;
    if (targetProgram && lowerContent.includes(targetProgram.toLowerCase())) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  private generateStrengths(content: string, structure: number, clarity: number, grammar: number, relevance: number): string[] {
    const strengths: string[] = [];
    const lower = content.toLowerCase();
    const wordCount = content.split(/\s+/).filter(Boolean).length;

    if (structure >= 70) strengths.push('Well-organized document with clear logical flow and paragraph structure');
    if (clarity >= 70) strengths.push('Clear and concise language — easy to understand without unnecessary jargon');
    if (grammar >= 70) strengths.push('Good grammar and punctuation — proper sentence capitalization throughout');
    if (relevance >= 70) strengths.push('Content is well-aligned with the expected document type and purpose');

    // Document-type-specific strengths
    if (lower.includes('curriculum vitae') || lower.includes('resume') || lower.includes('cv')) {
      const hasNumbers = /\d+%|\d+\+|\$\d+|\d+ (?:projects|clients|users|team|people)/.test(content);
      if (hasNumbers) strengths.push('Includes quantified achievements — demonstrates measurable impact');
      const actionVerbs = ['developed', 'managed', 'led', 'created', 'implemented', 'designed', 'built', 'achieved', 'increased', 'reduced'];
      const foundVerbs = actionVerbs.filter(v => lower.includes(v));
      if (foundVerbs.length >= 3) strengths.push(`Strong action verbs used: ${foundVerbs.slice(0, 4).join(', ')}`);
    }
    if (lower.includes('statement of purpose') || lower.includes('sop')) {
      if (lower.includes('research') || lower.includes('goal')) strengths.push('Clearly articulates academic goals and research interests');
      if (lower.includes('program') || lower.includes('university')) strengths.push('Shows awareness of the target program and institution');
    }
    if (lower.includes('cover letter') || lower.includes('dear hiring manager')) {
      if (lower.includes('company') || lower.includes('team')) strengths.push('Demonstrates knowledge of the target company/team');
    }

    if (wordCount >= 300 && wordCount <= 1500) strengths.push(`Good document length (${wordCount} words) — comprehensive yet focused`);
    if (strengths.length === 0) strengths.push('Content addresses the intended topic and provides a starting point for improvement');

    return strengths;
  }

  private generateAreasForImprovement(content: string, structure: number, clarity: number, grammar: number, relevance: number): string[] {
    const areas: string[] = [];
    const lower = content.toLowerCase();
    const wordCount = content.split(/\s+/).filter(Boolean).length;

    if (structure < 60) areas.push('Document structure needs improvement — add clear sections with headings (e.g., Education, Experience, Skills for CV; Introduction, Body, Conclusion for SOP)');
    if (clarity < 60) areas.push('Language could be simplified — replace complex words (utilize→use, commence→start) and break long sentences into shorter ones');
    if (grammar < 60) areas.push('Grammar and punctuation need review — check sentence capitalization, remove double spaces, and fix run-on sentences');
    if (relevance < 60) areas.push('Content is not well-targeted — align your document with the specific requirements of the document type');
    if (wordCount < 200) areas.push(`Document is too short (${wordCount} words) — add more detail, specific examples, and supporting evidence`);

    // Document-type-specific improvements
    if (lower.includes('curriculum vitae') || lower.includes('resume') || lower.includes('cv')) {
      const hasNumbers = /\d+%|\d+\+|\$\d+/.test(content);
      if (!hasNumbers) areas.push('CV lacks quantified achievements — add metrics like "increased sales by 30%" or "managed team of 5"');
      if (!lower.includes('education')) areas.push('Missing Education section — add your degrees, institutions, and graduation dates');
      if (!lower.includes('experience')) areas.push('Missing Experience section — add work history with specific accomplishments');
      if (!lower.includes('skills')) areas.push('Missing Skills section — list technical and soft skills relevant to your target role');
    }
    if (lower.includes('statement of purpose') || lower.includes('sop')) {
      if (!lower.includes('goal') && !lower.includes('career')) areas.push('SOP lacks clear academic/career goals — explicitly state what you want to achieve');
      if (!lower.includes('research')) areas.push('No mention of research interests — add specific research areas you want to explore');
      if (!lower.includes('why') && !lower.includes('chose')) areas.push('Missing "why this program" — explain why you chose this specific program and institution');
    }
    if (lower.includes('cover letter') || lower.includes('dear hiring manager')) {
      if (!lower.includes('company')) areas.push('Cover letter doesn\'t mention the target company — show you\'ve researched them');
      if (!lower.includes('role') && !lower.includes('position')) areas.push('No specific role mentioned — state the exact position you\'re applying for');
    }

    if (areas.length === 0) areas.push('Continue refining for even stronger impact — consider getting feedback from a mentor or peer');

    return areas;
  }

  private generateSuggestions(content: string, documentType: string): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const sentences = content.split(/[.!?]+/).filter(Boolean);
    const lower = content.toLowerCase();
    let fillerSuggestionAdded = false;

    // Check for passive voice in first few sentences
    sentences.forEach((sentence, i) => {
      const trimmed = sentence.trim();
      if (trimmed.length > 40) {
        const hasPassive = /\b(is|are|was|were|been|being|be)\b/.test(trimmed) && /\b(by|from|with)\b/.test(trimmed);
        if (hasPassive && i < 3) {
          suggestions.push({
            category: 'clarity',
            severity: 'low',
            originalText: trimmed.slice(0, 80) + (trimmed.length > 80 ? '...' : ''),
            suggestedText: 'Rewrite in active voice for more impact',
            explanation: 'Active voice makes your writing more direct and engaging — "I developed" instead of "was developed by me"',
          });
        }
      }
    });

    // Single consolidated filler word suggestion (not per-sentence)
    const fillerCount = (content.match(/\b(very|really|quite|just|basically|actually|literally)\b/gi) || []).length;
    if (fillerCount >= 2 && !fillerSuggestionAdded) {
      fillerSuggestionAdded = true;
      suggestions.push({
        category: 'conciseness',
        severity: 'medium',
        originalText: `${fillerCount} filler words found (very, really, quite, just, basically, actually, literally)`,
        suggestedText: 'Remove filler words to strengthen your message',
        explanation: `Found ${fillerCount} filler words. Each one weakens your writing. "I am very passionate" → "I am passionate". Remove them for more impact.`,
      });
    }

    // Document-type-specific suggestions
    if (documentType === 'sop') {
      if (!lower.includes('goal')) {
        suggestions.push({
          category: 'content',
          severity: 'high',
          originalText: '',
          suggestedText: 'Add a clear statement of your academic and career goals',
          explanation: 'SOPs MUST clearly articulate your goals — what do you want to achieve? How will this program help?',
        });
      }
      if (!lower.includes('research')) {
        suggestions.push({
          category: 'content',
          severity: 'medium',
          originalText: '',
          suggestedText: 'Mention specific research interests or areas you want to explore',
          explanation: 'Graduate programs look for students with clear research direction — name specific topics or professors',
        });
      }
      if (!lower.includes('why')) {
        suggestions.push({
          category: 'fit',
          severity: 'high',
          originalText: '',
          suggestedText: 'Explain WHY you chose this specific program — mention unique features, faculty, or resources',
          explanation: 'Generic SOPs get rejected. Show you\'ve researched the program and explain why it\'s the right fit for YOU',
        });
      }
    }

    if (documentType === 'cv_resume') {
      const hasNumbers = /\d+%|\d+\+|\$\d+/.test(content);
      if (!hasNumbers) {
        suggestions.push({
          category: 'impact',
          severity: 'high',
          originalText: '',
          suggestedText: 'Add quantified achievements: "Increased X by Y%", "Managed team of N", "Reduced costs by $M"',
          explanation: 'Recruiters spend 6 seconds on a CV. Numbers stand out and prove your impact is real and measurable',
        });
      }
      const actionVerbs = ['developed', 'managed', 'led', 'created', 'implemented', 'designed', 'built', 'achieved'];
      const foundVerbs = actionVerbs.filter(v => lower.includes(v));
      if (foundVerbs.length < 2) {
        suggestions.push({
          category: 'language',
          severity: 'medium',
          originalText: '',
          suggestedText: 'Start bullet points with strong action verbs: Developed, Led, Implemented, Designed, Achieved',
          explanation: 'Action verbs make your accomplishments sound impactful. "Responsible for managing" → "Managed"',
        });
      }
    }

    if (documentType === 'cover_letter') {
      if (!lower.includes('company') && !lower.includes('organization')) {
        suggestions.push({
          category: 'customization',
          severity: 'high',
          originalText: '',
          suggestedText: 'Mention the specific company name and show you\'ve researched their mission/values',
          explanation: 'Generic cover letters get ignored. Show WHY you want to work at THIS specific company',
        });
      }
      if (!lower.includes('position') && !lower.includes('role')) {
        suggestions.push({
          category: 'clarity',
          severity: 'high',
          originalText: '',
          suggestedText: 'Clearly state which position you\'re applying for in the opening paragraph',
          explanation: 'Hiring managers need to know immediately which role you\'re targeting',
        });
      }
    }

    if (documentType === 'personal_statement' && !lower.includes('experience')) {
      suggestions.push({
        category: 'content',
        severity: 'medium',
        originalText: '',
        suggestedText: 'Include specific experiences that shaped your journey — use concrete anecdotes',
        explanation: 'Personal statements are strengthened by real stories. "I learned leadership" → "When I led my team of 5 through a crisis..."',
      });
    }

    return suggestions;
  }

  private analyzeIntegrity(content: string): IntegrityCheck {
    const flaggedClaims: string[] = [];
    const fakeIndicators: string[] = [];
    const warnings: string[] = [];
    let integrityScore = 100;

    // 1. Exaggeration patterns (only genuinely suspicious superlatives — not common intensifiers)
    const exaggerationPatterns = [
      /\b(world[- ]?class|best[- ]?in[- ]?the[- ]?world|number[- ]?one|top[- ]?1%|unparalleled|unrivaled|peerless)\b/gi,
    ];

    exaggerationPatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          flaggedClaims.push(`Potentially exaggerated claim: "${match}" — consider toning down or providing evidence`);
          integrityScore -= 3;
        });
      }
    });

    // 2. Template placeholders — strong indicator of unfilled templates
    const templatePatterns = /\[.*?(name|date|address|phone|email|company|university|position|title|insert|here).*?\]/gi;
    const templateMatches = content.match(templatePatterns);
    if (templateMatches) {
      templateMatches.forEach((match) => {
        fakeIndicators.push(`Template placeholder found: "${match}" — document appears incomplete or copied from template`);
        integrityScore -= 12;
      });
    }

    // 3. Suspicious terms (only genuinely fraudulent — not normal professional words)
    const suspiciousPatterns = [
      /\b(fake|fabricated|plagiarized|counterfeit|forged)\b/gi,
    ];

    suspiciousPatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          fakeIndicators.push(`Suspicious term detected: "${match}"`);
          integrityScore -= 10;
        });
      }
    });

    // 4. Fake degree / education patterns
    const fakeDegreePatterns = [
      /\b(drop[- ]?out|dropped out)\b.*\b(harvard|mit|stanford|oxford|cambridge|ivy league|top[- ]?tier)\b/gi,
      /\b(harvard|mit|stanford|oxford|cambridge)\b.*\b(drop[- ]?out|dropped out)\b/gi,
      /\b(ph\.?d|doctorate)\b.*\b(undergraduate|bachelor|freshman|sophomore)\b/gi,
      /\b(self[- ]?taught)\b.*\b(expert|specialist|authority|guru)\b/gi,
    ];
    fakeDegreePatterns.forEach((pattern) => {
      if (pattern.test(content)) {
        const match = content.match(pattern);
        if (match) {
          fakeIndicators.push(`Suspicious education claim: "${match[0]}" — verify this claim`);
          integrityScore -= 15;
        }
      }
    });

    // 5. Inconsistency: "recent graduate" + many years of experience
    const recentGrad = /\b(recent graduate|fresh graduate|new graduate|just graduated|class of 202[4-6])\b/gi;
    const expMatch = content.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi);
    if (recentGrad.test(content) && expMatch) {
      const yearMatch = expMatch[0].match(/(\d+)/);
      if (yearMatch && parseInt(yearMatch[1]) > 3) {
        fakeIndicators.push(`Contradiction: Claims to be a "recent graduate" but also claims ${yearMatch[1]}+ years of experience`);
        integrityScore -= 20;
      }
    }

    // 6. Missing critical sections per document type
    const lower = content.toLowerCase();
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    if (wordCount > 100) {
      if (lower.includes('curriculum vitae') || lower.includes('resume') || lower.includes('cv')) {
        const cvSections = ['education', 'experience', 'skills'];
        const missing = cvSections.filter(s => !lower.includes(s));
        if (missing.length > 1) {
          warnings.push(`CV appears incomplete — missing sections: ${missing.join(', ')}`);
          integrityScore -= 10;
        }
      }
      if (lower.includes('statement of purpose') || lower.includes('sop')) {
        if (!lower.includes('goal') && !lower.includes('career') && !lower.includes('future')) {
          warnings.push('SOP lacks clear goals or career direction');
          integrityScore -= 5;
        }
      }
    }

    // 7. Year references consistency
    const inconsistencyPatterns = [/\b(20\d{2})\b/g];
    const years = new Set<string>();
    inconsistencyPatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => years.add(match));
      }
    });

    if (years.size > 3) {
      warnings.push('Multiple year references detected — ensure consistency in dates');
      integrityScore -= 5;
    }

    // 8. Very short document
    if (content.length < 100) {
      warnings.push('Document is very short — may lack substance for proper evaluation');
      integrityScore -= 5;
    }

    // 9. Sentence structure uniformity (AI-generated text indicator)
    const sentences = content.split(/[.!?]+/).filter(Boolean);
    const sentenceLengths = sentences.map((s) => s.trim().split(/\s+/).length);
    const avgLength = sentenceLengths.length > 0 ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length : 0;
    const variance = sentenceLengths.length > 0 ? sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length : 0;

    if (variance < 10 && sentences.length > 5) {
      warnings.push('Sentence structure appears unusually uniform — vary sentence lengths for natural flow');
      integrityScore -= 5;
    }

    // 10. All-caps abuse (not common acronyms)
    const commonAcronyms = new Set(['CEO', 'CTO', 'CFO', 'GPA', 'GRE', 'GMAT', 'IELTS', 'TOEFL', 'USA', 'UK', 'UAE', 'MIT', 'API', 'SQL', 'HTML', 'CSS', 'JS', 'AI', 'ML', 'NLP', 'UI', 'UX']);
    const allCapsWords = content.match(/\b[A-Z]{3,}\b/g);
    if (allCapsWords) {
      const unusualCaps = allCapsWords.filter(w => !commonAcronyms.has(w));
      if (unusualCaps.length > 3) {
        warnings.push(`Excessive all-caps words: ${unusualCaps.slice(0, 5).join(', ')} — use proper capitalization`);
        integrityScore -= 3;
      }
    }

    integrityScore = Math.max(0, integrityScore);

    return { flaggedClaims, fakeIndicators, integrityScore, warnings };
  }

  private generateExecutiveSummary(
    overallScore: number,
    structure: number,
    clarity: number,
    grammar: number,
    relevance: number,
    documentType: string
  ): string {
    const grade = overallScore >= 80 ? 'strong' : overallScore >= 60 ? 'solid' : 'developing';
    const typeLabel = documentType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    return `This ${typeLabel} is a ${grade} draft scoring ${overallScore}/100 overall. ` +
      `Structure scored ${structure}/100, clarity ${clarity}/100, grammar ${grammar}/100, and relevance ${relevance}/100. ` +
      (overallScore >= 80
        ? 'The document demonstrates strong qualities and is nearly ready for submission.'
        : overallScore >= 60
          ? 'The document has good foundations but would benefit from targeted improvements in the suggested areas.'
          : 'The document needs significant improvements across multiple areas before submission.');
  }
}

export const documentIntelligenceService = new DocumentIntelligenceService();
