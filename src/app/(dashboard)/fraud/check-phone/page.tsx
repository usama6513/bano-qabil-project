'use client';

import { useState, useCallback } from 'react';

interface PhoneAnalysis {
  number: string;
  normalized: string;
  isValid: boolean;
  country: string;
  countryCode: string;
  countryEmoji: string;
  network: {
    name: string;
    mcc: string;
    mnc: string;
    type: string;
  };
  region: {
    province: string;
    city: string;
    areaCode: string;
  };
  riskScore: number;
  riskLevel: string;
  indicators: Array<{
    type: string;
    label: string;
    value: string;
  }>;
  spamReports: {
    reported: boolean;
    reportCount: number;
    categories: string[];
  };
  socialPresence: {
    possible: boolean;
    platforms: string[];
  };
  recommendation: string;
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
  liveData?: {
    source: string;
    lineType: string;
    carrier: string;
    location: string;
    isWhatsApp: boolean;
    isVoIP: boolean;
    isRegistered: boolean;
    isRoaming: boolean;
    truecallerName?: string;
    truecallerSpamScore?: number;
    truecallerType?: string;
    truecallerVerified?: boolean;
  };
  analysisConfidence?: {
    level: 'high' | 'medium' | 'low';
    percentage: number;
    factors: string[];
  };
  detailedAnalysis?: {
    numberValidity: string;
    networkReliability: string;
    locationInfo: string;
    riskAssessment: string;
    recommendation: string;
  };
}

const COUNTRIES = [
  { code: 'PK', name: 'Pakistan', emoji: '🇵🇰', dial: '+92', placeholder: '03001234567' },
  { code: 'IN', name: 'India', emoji: '🇮🇳', dial: '+91', placeholder: '9876543210' },
  { code: 'US', name: 'United States', emoji: '🇺🇸', dial: '+1', placeholder: '2025551234' },
  { code: 'GB', name: 'United Kingdom', emoji: '🇬🇧', dial: '+44', placeholder: '7911123456' },
  { code: 'AE', name: 'UAE', emoji: '🇦🇪', dial: '+971', placeholder: '501234567' },
  { code: 'SA', name: 'Saudi Arabia', emoji: '🇸🇦', dial: '+966', placeholder: '501234567' },
  { code: 'CN', name: 'China', emoji: '🇨🇳', dial: '+86', placeholder: '13812345678' },
  { code: 'TR', name: 'Turkey', emoji: '🇹🇷', dial: '+90', placeholder: '5321234567' },
  { code: 'DE', name: 'Germany', emoji: '🇩🇪', dial: '+49', placeholder: '15112345678' },
  { code: 'FR', name: 'France', emoji: '🇫🇷', dial: '+33', placeholder: '612345678' },
  { code: 'JP', name: 'Japan', emoji: '🇯🇵', dial: '+81', placeholder: '7012345678' },
];

export default function CheckPhonePage() {
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhoneAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'safe': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'low': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'medium': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-white/5 text-gray-200 border-white/10';
    }
  };

  const getScoreBarColor = (score: number) => {
    if (score <= 25) return 'bg-green-500';
    if (score <= 50) return 'bg-yellow-500';
    if (score <= 75) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getIndicatorColor = (type: string) => {
    switch (type) {
      case 'danger': return 'bg-red-500/10 border-red-500/30 text-red-300';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
      default: return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
    }
  };

  const handleScan = useCallback(async () => {
    if (!phone.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/fraud/scan/phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Scan failed');
        return;
      }

      setResult(data.data);
    } catch {
      setError('Failed to scan phone number. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [phone]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <a href="/fraud" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Fraud Center
        </a>
        <h1 className="text-2xl font-bold text-gray-100">Phone Number Scanner</h1>
        <p className="text-gray-500 mt-1">Analyze any phone number worldwide for network, region, and fraud indicators</p>
      </div>

      <div className="card p-6">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setShowCountryPicker(!showCountryPicker)}
                className="flex items-center gap-2 px-3 py-3 rounded-xl border border-white/10 hover:border-gray-400 transition-colors text-sm min-w-[120px] bg-white/[0.03]"
              >
                <span className="text-lg">{selectedCountry.emoji}</span>
                <span className="font-medium">{selectedCountry.dial}</span>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showCountryPicker && (
                <div className="absolute top-full left-0 mt-1 card border border-white/10 rounded-xl shadow-lg z-50 w-64 max-h-64 overflow-y-auto">
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        setSelectedCountry(country);
                        setShowCountryPicker(false);
                        setPhone('');
                        setResult(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm"
                    >
                      <span className="text-lg">{country.emoji}</span>
                      <span className="font-medium">{country.name}</span>
                      <span className="text-gray-400 ml-auto">{country.dial}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                placeholder={selectedCountry.placeholder}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <button
              onClick={handleScan}
              disabled={loading || !phone.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Scanning...
                </>
              ) : (
                '🔍 Scan'
              )}
            </button>
          </div>

          <p className="text-xs text-gray-400">
            Supports numbers from {COUNTRIES.length}+ countries — Pakistan, India, US, UK, UAE, Saudi, China, Turkey, Germany, France, Japan
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className={`rounded-xl p-4 border ${getRiskColor(result.riskLevel)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {result.countryEmoji}{' '}
                  {result.riskLevel === 'safe' && '✅ SAFE'}
                  {result.riskLevel === 'low' && '🟢 LOW RISK'}
                  {result.riskLevel === 'medium' && '🟡 MEDIUM RISK'}
                  {result.riskLevel === 'high' && '🔴 HIGH RISK'}
                  {result.riskLevel === 'critical' && '⛔ CRITICAL'}
                </h3>
                <p className="text-sm mt-1">{result.recommendation}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{result.riskScore}</div>
                <div className="text-xs opacity-75">/100</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-white/5 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${getScoreBarColor(result.riskScore)}`}
                style={{ width: `${result.riskScore}%` }}
              />
            </div>
          </div>

          {/* Analysis Confidence */}
          {result.analysisConfidence && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-100">Analysis Confidence</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  result.analysisConfidence.level === 'high' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  result.analysisConfidence.level === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {result.analysisConfidence.percentage}% {result.analysisConfidence.level.toUpperCase()}
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all ${
                    result.analysisConfidence.percentage >= 80 ? 'bg-green-500' :
                    result.analysisConfidence.percentage >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${result.analysisConfidence.percentage}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {result.analysisConfidence.factors.map((factor, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-500/10 text-blue-300 rounded text-xs border border-blue-500/20">
                    ✓ {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Analysis */}
          {result.detailedAnalysis && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">🔍 Detailed Analysis</h3>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-sm text-gray-300">{result.detailedAnalysis.numberValidity}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-sm text-gray-300">{result.detailedAnalysis.networkReliability}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-sm text-gray-300">{result.detailedAnalysis.locationInfo}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-sm text-gray-300">{result.detailedAnalysis.riskAssessment}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg p-4 border border-blue-500/30">
                  <p className="text-sm text-gray-200 font-medium">💡 {result.detailedAnalysis.recommendation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Registered Owner Name - Prominent Display */}
          {result.liveData?.truecallerName && (
            <div className="card p-5 border border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">
                  👤
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Registered Owner</p>
                  <p className="text-xl font-bold text-gray-100">
                    {result.liveData.truecallerName}
                    {result.liveData.truecallerVerified && (
                      <span className="ml-2 text-sm text-green-400">✓ Verified</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Identified via {result.liveData.source || 'Truecaller'}</p>
                </div>
                {result.liveData.truecallerSpamScore !== undefined && result.liveData.truecallerSpamScore > 0 && (
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    result.liveData.truecallerSpamScore >= 50 ? 'bg-red-500/20 text-red-400' :
                    result.liveData.truecallerSpamScore >= 20 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    Spam: {result.liveData.truecallerSpamScore}/100
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="card text-center">
              <p className="text-xs text-gray-500 mb-1">Country</p>
              <p className="font-bold text-gray-100">{result.countryEmoji} {result.country}</p>
              <p className="text-xs text-gray-400 mt-1">{result.countryCode}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-gray-500 mb-1">Network</p>
              <p className="font-bold text-gray-100">{result.network.name}</p>
              <p className="text-xs text-gray-400 mt-1">{result.network.type}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-gray-500 mb-1">Region</p>
              <p className="font-bold text-gray-100">{result.region.city}</p>
              <p className="text-xs text-gray-400 mt-1">{result.region.province}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-gray-500 mb-1">Spam Reports</p>
              <p className="font-bold text-gray-100">
                {result.spamReports.reported ? `${result.spamReports.reportCount} reports` : 'Not in database'}
              </p>
              {result.spamReports.reported ? (
                <p className="text-xs text-red-500 mt-1">{result.spamReports.categories.join(', ')}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">No known reports</p>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Analysis Details</h3>
            <div className="space-y-2">
              {result.indicators.map((indicator, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg p-3 border text-sm ${getIndicatorColor(indicator.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-medium">{indicator.label}</span>
                      <p className="text-xs mt-0.5 opacity-75">{indicator.value}</p>
                    </div>
                    <span className="text-xs uppercase font-bold opacity-50">
                      {indicator.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                    {result.complaintPath.stepByStepGuideUrdu && result.complaintPath.stepByStepGuideUrdu.length > 0 && (
                      <div className="mt-2 bg-green-500/5 border border-green-500/20 rounded-lg p-2" dir="rtl">
                        <p className="text-xs font-semibold text-green-300 mb-1">اردو:</p>
                        <ol className="list-decimal list-inside space-y-0.5 text-right">
                          {result.complaintPath.stepByStepGuideUrdu.map((step, i) => (
                            <li key={i} className="text-xs text-gray-200">{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {/* Immediate Actions */}
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

                {/* Where to Complain */}
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-amber-300 mb-1">🏛️ Where to Complain / شکایت کہاں کریں:</h4>
                  <div className="space-y-2">
                    {result.complaintPath.complaintContacts.map((contact, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3 border border-amber-500/20">
                        <p className="text-xs font-semibold text-gray-100">{contact.name}</p>
                        {contact.nameUrdu && <p className="text-xs text-gray-300" dir="rtl">{contact.nameUrdu}</p>}
                        {contact.nameRomanUrdu && <p className="text-xs text-gray-300 italic">{contact.nameRomanUrdu}</p>}
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
                    <h4 className="text-xs font-semibold text-cyan-300 mb-2">🔐 Evidence Checklist for Complaint / شکایت کے لیے ثبوت:</h4>
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
                    {result.complaintPath.evidenceChecklistUrdu && result.complaintPath.evidenceChecklistUrdu.length > 0 && (
                      <div className="mt-2 bg-cyan-500/5 border border-cyan-500/10 rounded-lg p-2" dir="rtl">
                        <p className="text-xs font-semibold text-cyan-300 mb-1 text-right">اردو:</p>
                        <ul className="space-y-0.5 text-right">
                          {result.complaintPath.evidenceChecklistUrdu.map((item, i) => (
                            <li key={i} className="text-xs text-gray-200 flex items-start gap-1 flex-row-reverse">
                              <span className="mt-0.5 text-cyan-300">☐</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Required Documents */}
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

                {/* Timeframe */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mb-3">
                  <p className="text-xs font-semibold text-amber-300">⏱ Timeframe: {result.complaintPath.timeframe}</p>
                  {result.complaintPath.timeframeRomanUrdu && (
                    <p className="text-xs text-amber-300/80 mt-1 italic">Roman Urdu: {result.complaintPath.timeframeRomanUrdu}</p>
                  )}
                  {result.complaintPath.timeframeUrdu && (
                    <p className="text-xs text-amber-300/80 mt-1" dir="rtl">{result.complaintPath.timeframeUrdu}</p>
                  )}
                </div>

                {/* Tips */}
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-amber-300 mb-1">💡 Tips / مشورے:</h4>
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

                {/* Online Complaint Button */}
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

          {result.socialPresence.possible && (
            <div className="card">
              <h4 className="font-semibold text-gray-100 mb-2">Verify This Number</h4>
              <p className="text-sm text-gray-400 mb-2">Use these platforms to verify the sender:</p>
              <div className="flex gap-2 flex-wrap">
                {result.socialPresence.platforms.map((platform) => (
                  <span key={platform} className="px-3 py-1 bg-blue-500/10 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30">
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.liveData ? (
            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <h4 className="font-semibold text-green-300">Live Data Verified</h4>
              </div>
              <p className="text-sm text-gray-300">
                Data sourced in real-time from {result.liveData.source}.
                Carrier: {result.liveData.carrier} | Type: {result.liveData.lineType}
                {result.liveData.isVoIP && ' | ⚠ VoIP number'}
                {result.liveData.isRoaming && ' | ⚠ Roaming'}
              </p>
              {result.liveData.truecallerName && (
                <p className="text-sm text-blue-300 mt-1">
                  👤 Registered to: <strong>{result.liveData.truecallerName}</strong>
                  {result.liveData.truecallerVerified && ' ✓ Verified'}
                </p>
              )}
              {!result.liveData.truecallerName && (
                <p className="text-xs text-gray-400 mt-1">
                  ℹ️ Owner name not found. Configure <code className="bg-white/10 px-1 rounded">TRUECALLER_API_KEY</code> in environment to enable name lookup.
                </p>
              )}
            </div>
          ) : (
            <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                <h4 className="font-semibold text-yellow-300">Static Analysis Only</h4>
              </div>
              <p className="text-sm text-gray-300">
                Live verification unavailable. Results are based on number format and prefix analysis only.
                Network detection is prefix-based and may not reflect number portability.
              </p>
              <p className="text-xs text-yellow-400/70 mt-2">
                💡 Owner name lookup requires Truecaller API. Configure <code className="bg-white/10 px-1 rounded">TRUECALLER_API_KEY</code> to see registered name.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
