import { getContextForIndicators, scamStats2025 } from './scam-knowledge-base';
import { type ComplaintPath } from './complaint-paths';
import { analyzeAllUssdCodes, type UssdAnalysis } from './ussd-analyzer';

export interface AiExplanation {
  explanation: string;
  recommendedActions: string[];
  disclaimer: string;
  realWorldContext?: string;
  complaintPath?: ComplaintPath;
  ussdAnalysis?: UssdAnalysis[];
}

function buildFallbackExplanation(
  riskScore: number,
  riskLevel: string,
  indicators: Array<{ indicator: string; severity: string; description: string; evidence: string }>,
  inputType: string
): AiExplanation {
  const criticalCount = indicators.filter((i) => i.severity === 'critical').length;
  const highCount = indicators.filter((i) => i.severity === 'high').length;
  const mediumCount = indicators.filter((i) => i.severity === 'medium').length;

  const parts: string[] = [];

  if (riskScore === 0) {
    parts.push(`No suspicious patterns detected in this ${inputType}. The content appears to be safe based on our analysis of ${indicators.length} indicators.`);
  } else if (riskLevel === 'critical') {
    parts.push(`This ${inputType} contains ${criticalCount} critical red flag(s) and ${indicators.length} total suspicious indicators. Risk score: ${riskScore}/100.`);
    parts.push('Strong indicators of fraud or phishing detected. This message exhibits multiple characteristics commonly associated with scam attempts.');
  } else if (riskLevel === 'high') {
    parts.push(`This ${inputType} shows ${highCount + criticalCount} high-priority warning sign(s) across ${indicators.length} total indicators. Risk score: ${riskScore}/100.`);
    parts.push('Several fraud indicators were identified. While not definitively malicious, this content exhibits patterns commonly seen in scam messages.');
  } else if (riskLevel === 'medium') {
    parts.push(`This ${inputType} has ${mediumCount + highCount + criticalCount} moderate concern(s) detected across ${indicators.length} indicators. Risk score: ${riskScore}/100.`);
    parts.push('Some suspicious patterns were found. Exercise caution and verify the source before taking any action.');
  } else {
    parts.push(`This ${inputType} shows minor concerns with a risk score of ${riskScore}/100. Most indicators are low severity.`);
    parts.push('The content appears mostly safe, but a few minor patterns worth noting were detected.');
  }

  if (indicators.length > 0) {
    parts.push('\nKey findings:');
    for (const ind of indicators.slice(0, 5)) {
      const sev = ind.severity === 'critical' ? '[CRITICAL]' : ind.severity === 'high' ? '[HIGH]' : ind.severity === 'medium' ? '[MEDIUM]' : '[LOW]';
      parts.push(`${sev} ${ind.description}`);
    }
  }

  const recommendedActions: string[] = [];
  if (riskScore > 60) {
    recommendedActions.push('Do NOT click any links or download attachments from this message');
    recommendedActions.push('Do NOT share any personal or financial information');
    recommendedActions.push('Verify the sender through official channels (call the bank/company directly)');
    recommendedActions.push('Report this message to the relevant authorities');
  } else if (riskScore > 30) {
    recommendedActions.push('Verify the sender before taking any action');
    recommendedActions.push('Do NOT share sensitive information (passwords, PINs, OTPs)');
    recommendedActions.push('Check links by hovering over them before clicking');
  } else if (riskScore > 0) {
    recommendedActions.push('Exercise normal caution');
    recommendedActions.push('Stay alert for follow-up messages that may escalate the request');
  } else {
    recommendedActions.push('No immediate action required');
    recommendedActions.push('Remain vigilant for future suspicious messages');
  }

  const ussdAnalysis = analyzeAllUssdCodes(indicators.map((i) => i.evidence).join(' '));
  const ussdCodes = ussdAnalysis.filter((u) => u.risk !== 'safe');
  if (ussdCodes.length > 0) {
    for (const code of ussdCodes) {
      recommendedActions.push(`USSD Code ${code.code} (${code.category}): ${code.recommendation}`);
    }
  }

  return {
    explanation: parts.join(' '),
    recommendedActions,
    disclaimer: '',
    realWorldContext: buildRealWorldContext(indicators.map((i) => i.indicator)),
    complaintPath: undefined,
    ussdAnalysis: ussdAnalysis.length > 0 ? ussdAnalysis : undefined,
  };
}

function buildRealWorldContext(indicatorIds: string[]): string {
  const trends = getContextForIndicators(indicatorIds);
  if (trends.length === 0) return '';

  const stat = scamStats2025.find((s) => s.country === 'Pakistan');
  const parts: string[] = [];

  if (stat) {
    parts.push(`In Pakistan, ${stat.totalReports.toLocaleString()} fraud reports were filed in the first half of 2025 with total losses of ${stat.totalLosses}.`);
  }

  for (const trend of trends.slice(0, 2)) {
    const changePercent = trend.reportedCount2024 > 0
      ? Math.round(((trend.reportedCount2025 - trend.reportedCount2024) / trend.reportedCount2024) * 100)
      : 0;
    const trendDir = trend.trend === 'rising' ? 'increasing' : trend.trend === 'declining' ? 'decreasing' : 'stable';
    parts.push(`${trend.name}: ${trend.reportedCount2025.toLocaleString()} reports in 2025 (${changePercent > 0 ? '+' : ''}${changePercent}% vs 2024, ${trendDir} trend).`);
  }

  return parts.join(' ');
}

export class AiExplainer {
  async generateExplanation(
    riskScore: number,
    riskLevel: string,
    indicators: Array<{ indicator: string; severity: string; description: string; evidence: string }>,
    inputType: string,
    textSnippet: string
  ): Promise<AiExplanation> {
    const realWorldContext = buildRealWorldContext(indicators.map((i) => i.indicator));

    try {
      const { getAIProvider } = await import('@/services/ai');
      const ai = getAIProvider();

      const indicatorList = indicators
        .map(
          (ind, i) =>
            `${i + 1}. [${ind.severity.toUpperCase()}] ${ind.description} (Evidence: ${ind.evidence})`
        )
        .join('\n');

      const contextBlock = realWorldContext
        ? `\n\nReal-World Context:\n${realWorldContext}\nUse this context to provide more specific and actionable advice.`
        : '';

      const prompt = `You are a cybersecurity expert protecting Pakistani citizens from online scams. Analyze this fraud scan result and write a STRONG, CONVINCING explanation of why this URL is dangerous (or safe).\n\nRisk Score: ${riskScore}/100 (${riskLevel})\nInput Type: ${inputType}\nURL: ${textSnippet}\n\nDetected Indicators:\n${indicatorList}${contextBlock}\n\nCRITICAL FORMATTING RULES:\n- Write as natural paragraphs, NOT numbered lists, NOT tables, NOT markdown\n- Explain SPECIFICALLY why each indicator is dangerous with real-world examples\n- Reference Pakistan scam statistics when relevant\n- Explain what would happen if the user clicked this link (identity theft, financial loss, etc.)\n- Give a clear final verdict\n- Maximum 200 words\n- Use bold headings (**Heading**) for sections\n- Use bullet points (- text) for key facts\n- Be direct, authoritative, and convincing — the user must understand this is REAL danger\n\nWrite the explanation now.`;

      const response = await ai.complete({ messages: [{ role: 'user', content: prompt }] });

      const responseText = response.content;
      const lines = responseText.split('\n').filter((l) => l.trim().length > 0);

      let explanation = '';
      const recommendedActions: string[] = [];
      let inActions = false;

      for (const line of lines) {
        const trimmed = line.trim();
        const actionMatch = trimmed.match(/^[\d\-\*]+\s+(.+)/);
        const isActionHeader = /^(2\.|3\.|actions|recommendations|what you should do)/i.test(trimmed);

        if (isActionHeader) {
          inActions = true;
          continue;
        }

        if (inActions && actionMatch) {
          recommendedActions.push(actionMatch[1]);
        } else if (!inActions && actionMatch) {
          explanation += trimmed + ' ';
        } else if (trimmed.startsWith('1.') || trimmed.startsWith('**')) {
          explanation += trimmed.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '') + ' ';
        } else if (!inActions) {
          explanation += trimmed + ' ';
        }
      }

      explanation = explanation.trim();
      if (explanation.length === 0) {
        explanation = responseText.substring(0, 500);
      }

      if (recommendedActions.length === 0) {
        recommendedActions.push('Review the detected indicators carefully');
        recommendedActions.push('Do not share personal or financial information');
        recommendedActions.push('Verify through official channels');
      }

      const ussdAnalysis = analyzeAllUssdCodes(textSnippet);
      return {
        explanation: explanation || `This ${inputType} has a risk score of ${riskScore}/100.`,
        recommendedActions: recommendedActions.slice(0, 5),
        disclaimer: '',
        realWorldContext,
        complaintPath: undefined,
        ussdAnalysis: ussdAnalysis.length > 0 ? ussdAnalysis : undefined,
      };
    } catch {
      return buildFallbackExplanation(riskScore, riskLevel, indicators, inputType);
    }
  }
}

export const aiExplainer = new AiExplainer();
