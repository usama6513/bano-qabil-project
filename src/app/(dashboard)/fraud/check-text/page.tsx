'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface Indicator {
  severity: string;
  description: string;
}

interface ScanResult {
  riskLevel: string;
  riskScore: number;
  indicators: Indicator[];
  actions: string[];
  explanation: string;
  realWorldContext?: string;
  complaintPath?: {
    scamType: string;
    scamTypeUrdu: string;
    scamTypeRomanUrdu?: string;
    immediateActions: string[];
    immediateActionsUrdu?: string[];
    immediateActionsRomanUrdu?: string[];
    complaintContacts: { name: string; nameUrdu?: string; nameRomanUrdu?: string; phone: string; website: string; address?: string; addressUrdu?: string; addressRomanUrdu?: string; hours?: string; hoursUrdu?: string; hoursRomanUrdu?: string }[];
    requiredDocuments: string[];
    requiredDocumentsUrdu?: string[];
    requiredDocumentsRomanUrdu?: string[];
    onlineComplaintUrl: string;
    timeframe: string;
    timeframeUrdu?: string;
    timeframeRomanUrdu?: string;
    additionalTips: string[];
    additionalTipsUrdu?: string[];
    additionalTipsRomanUrdu?: string[];
    evidenceChecklist?: string[];
    evidenceChecklistUrdu?: string[];
    evidenceChecklistRomanUrdu?: string[];
    stepByStepGuide?: string[];
    stepByStepGuideUrdu?: string[];
    stepByStepGuideRomanUrdu?: string[];
  };
  ussdAnalysis?: {
    code: string;
    risk: string;
    category: string;
    description: string;
    descriptionUrdu: string;
    whatItDoes: string;
    whatItDoesUrdu: string;
    riskLevel: string;
    recommendation: string;
    recommendationUrdu: string;
  }[];
}

function CheckTextContent() {
  const searchParams = useSearchParams();
  const defaultType = searchParams.get('type') === 'email' ? 'email' : 'sms';

  const [content, setContent] = useState('');
  const [inputType, setInputType] = useState(defaultType);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'safe': return 'bg-green-500/10 text-green-400';
      case 'low': return 'bg-yellow-500/10 text-yellow-400';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400';
      case 'high': return 'bg-orange-500/10 text-orange-400';
      case 'critical': return 'bg-red-500/10 text-red-400';
      default: return 'bg-white/5 text-gray-200';
    }
  };

  const getScoreBarColor = (score: number) => {
    if (score <= 25) return 'bg-green-500';
    if (score <= 50) return 'bg-yellow-500';
    if (score <= 75) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'bg-yellow-400';
      case 'medium': return 'bg-orange-400';
      case 'high': return 'bg-red-500';
      case 'critical': return 'bg-red-700';
      default: return 'bg-gray-400';
    }
  };

  const handleScan = useCallback(async () => {
    if (!content.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Not authenticated. Please log in.');
        return;
      }

      const res = await fetch('/api/fraud/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inputType, content: content.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Scan failed');
      }

      const data = await res.json();
      const payload = data.data ?? data;
      const aiExplanation =
        typeof payload.explanation === 'string' ? { explanation: payload.explanation } : payload.explanation || {};
      setResult({
        riskLevel: payload.riskLevel,
        riskScore: typeof payload.riskScore === 'number' ? payload.riskScore : 0,
        indicators: Array.isArray(payload.indicators) ? payload.indicators : [],
        actions: Array.isArray(payload.actions)
          ? payload.actions
          : Array.isArray(aiExplanation.recommendedActions)
            ? aiExplanation.recommendedActions
            : [],
        explanation: typeof aiExplanation.explanation === 'string' ? aiExplanation.explanation : '',
        realWorldContext: typeof aiExplanation.realWorldContext === 'string' ? aiExplanation.realWorldContext : undefined,
        complaintPath: aiExplanation.complaintPath || undefined,
        ussdAnalysis: Array.isArray(aiExplanation.ussdAnalysis) ? aiExplanation.ussdAnalysis : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan content');
    } finally {
      setLoading(false);
    }
  }, [content, inputType]);

  const handleFeedback = async () => {
    setFeedbackGiven(true);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <a href="/fraud" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Fraud Center
        </a>
        <h1 className="text-2xl font-bold gradient-text">Check SMS / Text / Email</h1>
        <p className="text-violet-400 mt-1">Paste a suspicious message to analyze it for fraud indicators</p>
      </div>

      <div className="card space-y-4">
        <div>
          <label htmlFor="inputType" className="block text-sm font-medium text-cyan-400 mb-1">
            Message Type
          </label>
          <select
            id="inputType"
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
            className="input-field"
          >
            <option value="sms">SMS</option>
            <option value="text">Text Message</option>
            <option value="email">Email</option>
          </select>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-cyan-400 mb-1">
            Paste suspicious message here
          </label>
          <textarea
            id="content"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste the full message content here..."
            className="input-field resize-none"
          />
        </div>

        <button
          onClick={handleScan}
          disabled={!content.trim() || loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Scanning...
            </span>
          ) : (
            'Check'
          )}
        </button>
      </div>

      {error && (
        <div className="card bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-slide-up">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Scan Result</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(result.riskLevel)}`}>
                {result.riskLevel?.toUpperCase()}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-cyan-400 mb-1">
                <span>Risk Score</span>
                <span className="font-medium">{result.riskScore}/100</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getScoreBarColor(result.riskScore)}`}
                  style={{ width: `${result.riskScore}%` }}
                />
              </div>
            </div>

            {result.indicators && result.indicators.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">Indicators Found</h3>
                <div className="space-y-2">
                  {result.indicators.map((ind, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getSeverityColor(ind.severity)}`} />
                      <div>
                        <span className="text-xs font-medium text-violet-400 uppercase">{ind.severity}</span>
                        <p className="text-sm text-cyan-400">{ind.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.actions && result.actions.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">Recommended Actions</h3>
                <ol className="list-decimal list-inside space-y-1">
                  {result.actions.map((action, i) => (
                    <li key={i} className="text-sm text-cyan-400">{action}</li>
                  ))}
                </ol>
              </div>
            )}

            {result.explanation && (
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">AI Analysis</h3>
                <p className="text-sm text-cyan-400 whitespace-pre-wrap">{result.explanation}</p>
              </div>
            )}

            {result.realWorldContext && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-3">
                <h3 className="text-sm font-semibold text-blue-300 mb-1">Real-World Context</h3>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{result.realWorldContext}</p>
              </div>
            )}

            {result.complaintPath && result.riskScore > 30 && (
              <div className="mt-4 space-y-4">
                <div className="bg-amber-500/15 border border-amber-500/30 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-amber-300 mb-1">
                    📋 Complaint Guide: {result.complaintPath.scamType}
                  </h3>
                  <p className="text-xs text-amber-300 mb-1">اردو: {result.complaintPath.scamTypeUrdu}</p>
                  {result.complaintPath.scamTypeRomanUrdu && (
                    <p className="text-xs text-amber-300/80 mb-3 italic">Roman Urdu: {result.complaintPath.scamTypeRomanUrdu}</p>
                  )}

                  {/* Step-by-Step Guide */}
                  {result.complaintPath.stepByStepGuide && result.complaintPath.stepByStepGuide.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-green-300 mb-2">📝 Step-by-Step Complaint Guide:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        {result.complaintPath.stepByStepGuide.map((step, i) => (
                          <li key={i} className="text-xs text-gray-300">{step}</li>
                        ))}
                      </ol>
                      {result.complaintPath.stepByStepGuideRomanUrdu && result.complaintPath.stepByStepGuideRomanUrdu.length > 0 && (
                        <div className="mt-2 bg-green-500/5 border border-green-500/20 rounded-lg p-2">
                          <p className="text-xs font-semibold text-green-300 mb-1">Roman Urdu:</p>
                          <ol className="list-decimal list-inside space-y-0.5">
                            {result.complaintPath.stepByStepGuideRomanUrdu.map((step, i) => (
                              <li key={i} className="text-xs text-gray-200">{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-amber-300 mb-1">⚡ Immediate Actions:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      {result.complaintPath.immediateActions.map((action, i) => (
                        <li key={i} className="text-xs text-gray-300">{action}</li>
                      ))}
                    </ol>
                    {result.complaintPath.immediateActionsRomanUrdu && result.complaintPath.immediateActionsRomanUrdu.length > 0 && (
                      <div className="mt-2 bg-amber-500/5 border border-amber-500/10 rounded-lg p-2">
                        <p className="text-xs font-semibold text-amber-300 mb-1">Roman Urdu:</p>
                        <ol className="list-decimal list-inside space-y-0.5">
                          {result.complaintPath.immediateActionsRomanUrdu.map((action, i) => (
                            <li key={i} className="text-xs text-gray-200">{action}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-amber-300 mb-1">🏛️ Where to Complain / شکایت کہاں کریں:</h4>
                    <div className="space-y-2">
                      {result.complaintPath.complaintContacts.map((contact, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-3 border border-amber-500/20">
                          <p className="text-xs font-semibold text-gray-100">{contact.name}</p>
                          {contact.nameUrdu && <p className="text-xs text-gray-300" dir="rtl">{contact.nameUrdu}</p>}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <p className="text-xs text-gray-400">📞 <span className="text-white font-medium">{contact.phone}</span></p>
                            {contact.website && contact.website.startsWith('http') ? (
                              <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline">
                                🌐 {contact.website.replace('https://', '').replace(/\/$/, '')} ↗
                              </a>
                            ) : contact.website ? (
                              <span className="text-xs text-gray-400">🌐 {contact.website}</span>
                            ) : null}
                          </div>
                          {contact.address && <p className="text-xs text-gray-500 mt-1">📍 {contact.address}</p>}
                          {contact.hours && <p className="text-xs text-gray-500 mt-0.5">⏰ {contact.hours}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evidence Checklist */}
                  {result.complaintPath.evidenceChecklist && result.complaintPath.evidenceChecklist.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-cyan-300 mb-2">🔐 Evidence Checklist / ثبوت کی فہرست:</h4>
                      <ul className="space-y-1">
                        {result.complaintPath.evidenceChecklist.map((item, i) => (
                          <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                            <span className="mt-0.5 text-cyan-400">☐</span> {item}
                          </li>
                        ))}
                      </ul>
                      {result.complaintPath.evidenceChecklistRomanUrdu && result.complaintPath.evidenceChecklistRomanUrdu.length > 0 && (
                        <div className="mt-2 bg-cyan-500/5 border border-cyan-500/10 rounded-lg p-2">
                          <p className="text-xs font-semibold text-cyan-300 mb-1">Roman Urdu:</p>
                          <ul className="space-y-0.5">
                            {result.complaintPath.evidenceChecklistRomanUrdu.map((item, i) => (
                              <li key={i} className="text-xs text-gray-200 flex items-start gap-1">
                                <span className="mt-0.5 text-cyan-300">☐</span> {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-amber-300 mb-1">📄 Required Documents / ضروری دستاویزات:</h4>
                    <ul className="space-y-1">
                      {result.complaintPath.requiredDocuments.map((doc, i) => (
                        <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                          <span className="mt-0.5">•</span> {doc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mb-3">
                    <p className="text-xs font-semibold text-amber-300">⏱ Timeframe: {result.complaintPath.timeframe}</p>
                    {result.complaintPath.timeframeRomanUrdu && (
                      <p className="text-xs text-amber-300/80 mt-1 italic">Roman Urdu: {result.complaintPath.timeframeRomanUrdu}</p>
                    )}
                  </div>

                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-amber-300 mb-1">💡 Tips:</h4>
                    <ul className="space-y-1">
                      {result.complaintPath.additionalTips.map((tip, i) => (
                        <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                          <span className="text-green-400 mt-0.5">✓</span> {tip}
                        </li>
                      ))}
                    </ul>
                    {result.complaintPath.additionalTipsRomanUrdu && result.complaintPath.additionalTipsRomanUrdu.length > 0 && (
                      <div className="mt-2 bg-amber-500/5 border border-amber-500/10 rounded-lg p-2">
                        <p className="text-xs font-semibold text-amber-300 mb-1">Roman Urdu:</p>
                        <ul className="space-y-0.5">
                          {result.complaintPath.additionalTipsRomanUrdu.map((tip, i) => (
                            <li key={i} className="text-xs text-gray-200 flex items-start gap-1">
                              <span className="text-green-300 mt-0.5">✓</span> {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <a
                    href={result.complaintPath.onlineComplaintUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full text-center bg-amber-500 text-black text-xs font-semibold py-2.5 px-4 rounded-lg hover:bg-amber-400 transition-colors"
                  >
                    File Complaint Online / آن لائن شکایت درج کریں →
                  </a>
                </div>
              </div>
            )}

            {result.ussdAnalysis && result.ussdAnalysis.length > 0 && result.ussdAnalysis.some((u) => u.risk !== 'safe') && (
              <div className="mt-4 space-y-3">
                <h3 className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">USSD Code Analysis</h3>
                {result.ussdAnalysis.filter((u) => u.risk !== 'safe').map((ussd, i) => {
                  const colorMap: Record<string, { bg: string; border: string; badge: string; badgeText: string; label: string }> = {
                    critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', badge: 'bg-red-500/20', badgeText: 'text-red-300', label: 'text-red-400' },
                    dangerous: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', badge: 'bg-orange-500/20', badgeText: 'text-orange-300', label: 'text-orange-400' },
                    warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', badge: 'bg-yellow-500/20', badgeText: 'text-yellow-300', label: 'text-yellow-400' },
                  };
                  const c = colorMap[ussd.risk] || colorMap.warning;
                  return (
                    <div key={i} className={`${c.bg} border ${c.border} rounded-lg p-3`}>
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-bold gradient-text bg-white/5 px-2 py-0.5 rounded">{ussd.code}</code>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge} ${c.badgeText} uppercase`}>
                          {ussd.risk}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-200 mb-1">{ussd.category}: {ussd.description}</p>
                      <p className="text-xs text-gray-300 mb-2">{ussd.whatItDoes}</p>
                      <div className={`${c.badge} rounded px-2 py-1 mb-1`}>
                        <p className="text-xs font-semibold text-gray-100">{ussd.riskLevel}</p>
                      </div>
                      <p className="text-xs text-gray-300"><span className="font-semibold">Action:</span> {ussd.recommendation}</p>
                      <p className="text-xs text-gray-500 mt-1" dir="rtl">{ussd.descriptionUrdu}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            {feedbackGiven ? (
              <p className="text-sm text-cyan-400">Thank you for your feedback</p>
            ) : (
              <button
                onClick={handleFeedback}
                className="btn-secondary text-sm"
              >
                Report this as incorrect
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckTextPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <CheckTextContent />
    </Suspense>
  );
}
