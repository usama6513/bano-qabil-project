'use client';

import { useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createWorker } from 'tesseract.js';

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
  extractedText?: string;
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
}

function CheckDocumentContent() {
  const searchParams = useSearchParams();
  const isImageMode = searchParams.get('type') === 'image';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const acceptedTypes = isImageMode
    ? 'image/png,image/jpeg,image/jpg,image/webp'
    : '.pdf,.docx,.doc,.txt,.md,text/markdown,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const acceptedExtensions = isImageMode
    ? '.png,.jpg,.jpeg,.webp'
    : '.pdf,.docx,.doc,.txt,.md';

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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

  const handleFile = (selected: File) => {
    if (isImageMode && !selected.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (!isImageMode) {
      const ext = '.' + selected.name.split('.').pop()?.toLowerCase();
      if (!acceptedExtensions.split(',').includes(ext)) {
        setError('Unsupported file type');
        return;
      }
    }
    setFile(selected);
    setError(null);
    setResult(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleScan = useCallback(async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Not authenticated. Please log in.');
        return;
      }

      if (isImageMode) {
        const worker = await createWorker('eng');
        const { data } = await worker.recognize(file);
        await worker.terminate();

        const extractedText = data.text?.trim();
        if (!extractedText) {
          setError('No readable text found in this image. Try a clearer screenshot.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/fraud/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ inputType: 'text', content: extractedText }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Scan failed');
        }

        const scanData = await res.json();
        const payload = scanData.data ?? scanData;
        const analysisObj = typeof payload.analysis === 'string' ? (() => { try { return JSON.parse(payload.analysis); } catch { return {}; } })() : (payload.analysis || {});
        const textAnalysis = analysisObj.textAnalysis || {};

        const explanationRaw = payload.explanation;
        let explanationText = '';
        if (typeof explanationRaw === 'string') {
          explanationText = explanationRaw;
        } else if (explanationRaw && typeof explanationRaw === 'object') {
          explanationText = explanationRaw.explanation || explanationRaw.recommendation || '';
        }
        if (!explanationText) {
          explanationText = textAnalysis.explanation || payload.recommendation || `Extracted text analyzed. Risk level: ${payload.riskLevel}`;
        }

        setResult({
          riskLevel: payload.riskLevel,
          riskScore: typeof payload.riskScore === 'number' ? payload.riskScore : Number(payload.riskScore) || 0,
          indicators: Array.isArray(payload.indicators)
            ? payload.indicators.map((i: { indicatorType?: string; indicator?: string; severity?: string; description?: string; evidence?: string }) => ({
                severity: i.severity || 'low',
                description: i.description || i.indicatorType || i.indicator || 'Unknown indicator',
              }))
            : [],
          actions: Array.isArray(payload.actions)
            ? payload.actions
            : (Array.isArray(textAnalysis.recommendedActions) ? textAnalysis.recommendedActions : []),
          explanation: explanationText,
          extractedText,
          realWorldContext: (explanationRaw && typeof explanationRaw === 'object' && typeof explanationRaw.realWorldContext === 'string') ? explanationRaw.realWorldContext : undefined,
          complaintPath: (explanationRaw && typeof explanationRaw === 'object' && explanationRaw.complaintPath) ? explanationRaw.complaintPath : undefined,
        });
      } else {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('inputType', 'document');

        const res = await fetch('/api/fraud/scan/document', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Scan failed');
        }

        const data = await res.json();
        const payload = data.data ?? data;
        const analysisObj = typeof payload.analysis === 'string' ? (() => { try { return JSON.parse(payload.analysis); } catch { return {}; } })() : (payload.analysis || {});
        const textAnalysis = analysisObj.textAnalysis || {};

        const docExplanationRaw = payload.explanation;
        let docExplanation = '';
        if (typeof docExplanationRaw === 'string') {
          docExplanation = docExplanationRaw;
        } else if (docExplanationRaw && typeof docExplanationRaw === 'object') {
          docExplanation = docExplanationRaw.explanation || docExplanationRaw.recommendation || '';
        }
        if (!docExplanation) {
          docExplanation = textAnalysis.explanation || payload.recommendation || '';
        }

        setResult({
          riskLevel: payload.riskLevel,
          riskScore: typeof payload.riskScore === 'number' ? payload.riskScore : 0,
          indicators: Array.isArray(payload.indicators) ? payload.indicators : [],
          actions: Array.isArray(payload.actions) ? payload.actions : [],
          explanation: docExplanation,
          extractedText: payload.text || '',
          realWorldContext: (docExplanationRaw && typeof docExplanationRaw === 'object' && typeof docExplanationRaw.realWorldContext === 'string') ? docExplanationRaw.realWorldContext : undefined,
          complaintPath: (docExplanationRaw && typeof docExplanationRaw === 'object' && docExplanationRaw.complaintPath) ? docExplanationRaw.complaintPath : undefined,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan');
    } finally {
      setLoading(false);
    }
  }, [file, isImageMode]);

  const handleClear = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <a href="/fraud" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Fraud Center
        </a>
        <h1 className="text-2xl font-bold text-gray-100">
          {isImageMode ? 'Scan Screenshot' : 'Scan Document'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isImageMode
            ? 'Upload a screenshot image for visual fraud analysis'
            : 'Upload a document to check for fraud indicators'}
        </p>
      </div>

      <div className="card space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-white/10 hover:border-gray-400 hover:bg-white/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
            className="hidden"
          />
          <div className="text-3xl mb-2">{isImageMode ? '🖼️' : '📄'}</div>
          <p className="text-sm text-gray-400">
            {isDragging
              ? 'Drop your file here'
              : 'Drag and drop a file here, or click to browse'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isImageMode ? 'PNG, JPG, JPEG, WebP' : 'PDF, DOCX, TXT, MD'}
          </p>
        </div>

        {file && (
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl">{isImageMode ? '🖼️' : '📄'}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-100 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-gray-400 hover:text-gray-400 text-sm ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {isImageMode && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
            <p className="text-sm text-emerald-300">
              OCR enabled — text will be extracted from your image in-browser and analyzed for fraud.
            </p>
          </div>
        )}

        <button
          onClick={handleScan}
          disabled={!file || loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Scanning...
            </span>
          ) : (
            'Scan'
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
              <h2 className="text-lg font-semibold text-gray-100">Scan Result</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(result.riskLevel)}`}>
                {result.riskLevel?.toUpperCase()}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
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
                <h3 className="text-sm font-semibold text-gray-100 mb-2">Indicators Found</h3>
                <div className="space-y-2">
                  {result.indicators.map((ind, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getSeverityColor(ind.severity)}`} />
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">{ind.severity}</span>
                        <p className="text-sm text-gray-300">{ind.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.actions && result.actions.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-100 mb-2">Recommended Actions</h3>
                <ol className="list-decimal list-inside space-y-1">
                  {result.actions.map((action, i) => (
                    <li key={i} className="text-sm text-gray-300">{action}</li>
                  ))}
                </ol>
              </div>
            )}

            {result.explanation && (
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-100 mb-1">AI Analysis</h3>
                <p className="text-sm text-gray-400 whitespace-pre-wrap">{result.explanation}</p>
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

            {result.extractedText && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-100 mb-2">Extracted Text</h3>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 max-h-48 overflow-y-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">{result.extractedText}</pre>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            {feedbackGiven ? (
              <p className="text-sm text-gray-500">Thank you for your feedback</p>
            ) : (
              <button
                onClick={() => setFeedbackGiven(true)}
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

export default function CheckDocumentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <CheckDocumentContent />
    </Suspense>
  );
}
