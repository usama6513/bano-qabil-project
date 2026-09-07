import { classifyWithAI, type AIFraudVerdict } from './ai-fraud-classifier';
import { analyzeAllUssdCodes } from './ussd-analyzer';

export interface TextIndicator {
  indicator: string;
  severity: string;
  description: string;
  evidence: string;
  score?: number;
}

export interface TextAnalysisResult {
  inputType: string;
  indicators: TextIndicator[];
  patterns: string[];
  riskScore: number;
  riskLevel: string;
  /** AI verdict with scam type, explanation, and recommended actions */
  aiVerdict?: AIFraudVerdict;
}

/**
 * AI-powered text analyzer.
 * No regex-based classification — AI is the sole judge.
 * USSD code analysis is kept as factual data (dangerous codes are objectively dangerous).
 */
export class TextAnalyzer {
  async analyze(text: string, type: 'sms' | 'text' | 'email'): Promise<TextAnalysisResult> {
    // Collect factual (non-classification) data to pass as evidence to AI
    const factualEvidence: Record<string, unknown> = { contentType: type };

    // Extract URLs (factual parsing, not classification)
    const urlRegex = /https?:\/\/[^\s<>"']+/gi;
    const bareUrlRegex = /\b[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.(?:[a-z]{2,}|online|xyz|top|buzz|click|club|work|tk|ml|ga|cf|gq)(?:\/[^\s<>"']*)?/gi;
    const fullUrls = text.match(urlRegex) || [];
    const bareUrls = text.match(bareUrlRegex) || [];
    const extractedUrls = [...new Set([...fullUrls, ...bareUrls])];
    if (extractedUrls.length > 0) {
      factualEvidence.urlsFound = extractedUrls;
    }

    // Extract phone numbers (factual)
    const phonePatterns = text.match(/\+?\d{10,15}/g);
    if (phonePatterns) {
      factualEvidence.phoneNumbers = phonePatterns;
    }

    // USSD code analysis — factual data about what each code does
    const ussdAnalyses = analyzeAllUssdCodes(text);
    if (ussdAnalyses.length > 0) {
      factualEvidence.ussdCodes = ussdAnalyses.map(u => ({
        code: u.code,
        risk: u.risk,
        category: u.category,
        description: u.description,
        whatItDoes: u.whatItDoes,
      }));
    }

    // Email header analysis — factual data
    if (type === 'email') {
      const emailFacts = this.extractEmailFacts(text);
      if (emailFacts) {
        factualEvidence.emailHeaders = emailFacts;
      }
    }

    // Call AI classifier — AI is the SOLE judge for scam determination
    const verdict = await classifyWithAI({
      contentType: type,
      content: text,
      evidence: factualEvidence,
    });

    // Map AI verdict indicators to TextIndicator format
    const indicators: TextIndicator[] = verdict.indicators.map((ind) => ({
      indicator: ind.type,
      severity: ind.severity,
      description: ind.description,
      evidence: ind.evidence,
    }));

    // Add USSD factual indicators (not classification, just information)
    for (const ussd of ussdAnalyses) {
      indicators.push({
        indicator: `USSD_${ussd.risk.toUpperCase()}`,
        severity: ussd.risk === 'critical' ? 'critical' : ussd.risk === 'dangerous' ? 'high' : ussd.risk === 'caution' ? 'medium' : 'low',
        description: `[${ussd.category}] ${ussd.description}`,
        evidence: `Code: ${ussd.code} — ${ussd.whatItDoes}`,
      });
    }

    return {
      inputType: type,
      indicators,
      patterns: extractedUrls,
      riskScore: verdict.riskScore,
      riskLevel: verdict.riskLevel,
      aiVerdict: verdict,
    };
  }

  /** Extract factual email header data — no classification, just data */
  private extractEmailFacts(text: string): Record<string, string> | null {
    const facts: Record<string, string> = {};

    const fromMatch = text.match(/from:\s*(.+)/i);
    const replyToMatch = text.match(/reply-to:\s*(.+)/i);
    const xMailerMatch = text.match(/x-mailer:\s*(.+)/i);

    if (fromMatch) facts.from = fromMatch[1].trim();
    if (replyToMatch) facts.replyTo = replyToMatch[1].trim();
    if (xMailerMatch) facts.xMailer = xMailerMatch[1].trim();

    // Check if From and Reply-To differ (factual observation, not classification)
    if (fromMatch && replyToMatch) {
      const fromEmail = fromMatch[1].match(/[\w.+-]+@[\w.-]+\.\w+/);
      const replyEmail = replyToMatch[1].match(/[\w.+-]+@[\w.-]+\.\w+/);
      if (fromEmail && replyEmail && fromEmail[0].toLowerCase() !== replyEmail[0].toLowerCase()) {
        facts.fromReplyToMismatch = 'true';
      }
    }

    return Object.keys(facts).length > 0 ? facts : null;
  }
}

export const textAnalyzer = new TextAnalyzer();
