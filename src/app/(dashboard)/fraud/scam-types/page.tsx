'use client';

import { useState, useMemo } from 'react';
import {
  SCAM_TYPES_REGISTRY,
  SCAM_CATEGORIES,
  searchScamTypes,
  getScamTypesByCategory,
  getRegistryStats,
  type ScamTypeEntry,
  type ScamCategory,
} from '@/services/fraud/scam-types-registry';

/* ── Category → accent color map (used for left border, glows, hover) ─── */
const categoryAccent: Record<string, { border: string; bg: string; text: string; glow: string; ring: string }> = {
  'Financial Fraud':    { border: 'border-l-rose-500',    bg: 'bg-rose-500/10',    text: 'text-rose-400',    glow: 'shadow-rose-500/5',    ring: 'ring-rose-500/20' },
  'Credential Theft':   { border: 'border-l-amber-500',   bg: 'bg-amber-500/10',   text: 'text-amber-400',   glow: 'shadow-amber-500/5',   ring: 'ring-amber-500/20' },
  'Social Engineering': { border: 'border-l-violet-500',  bg: 'bg-violet-500/10',  text: 'text-violet-400',  glow: 'shadow-violet-500/5',  ring: 'ring-violet-500/20' },
  'Employment Scam':    { border: 'border-l-sky-500',     bg: 'bg-sky-500/10',     text: 'text-sky-400',     glow: 'shadow-sky-500/5',     ring: 'ring-sky-500/20' },
  'Digital Threat':     { border: 'border-l-red-500',     bg: 'bg-red-500/10',     text: 'text-red-400',     glow: 'shadow-red-500/5',     ring: 'ring-red-500/20' },
  'Impersonation':      { border: 'border-l-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400', glow: 'shadow-emerald-500/5', ring: 'ring-emerald-500/20' },
  'Property Fraud':     { border: 'border-l-indigo-500',  bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  glow: 'shadow-indigo-500/5',  ring: 'ring-indigo-500/20' },
  'Identity Crime':     { border: 'border-l-fuchsia-500', bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', glow: 'shadow-fuchsia-500/5', ring: 'ring-fuchsia-500/20' },
  'Scam':               { border: 'border-l-yellow-500',  bg: 'bg-yellow-500/10',  text: 'text-yellow-400',  glow: 'shadow-yellow-500/5',  ring: 'ring-yellow-500/20' },
};
const defaultAccent = { border: 'border-l-slate-500', bg: 'bg-slate-500/10', text: 'text-slate-400', glow: 'shadow-slate-500/5', ring: 'ring-slate-500/20' };

/* ── Severity ──────────────────────────────────────────────────────────── */
const severityConfig = {
  critical: { dot: 'bg-red-500 shadow-red-500/60', badge: 'bg-red-500/15 text-red-400 border-red-500/25', label: 'CRITICAL', icon: '⬤' },
  high:     { dot: 'bg-orange-500 shadow-orange-500/50', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/25', label: 'HIGH', icon: '⬤' },
  medium:   { dot: 'bg-yellow-500 shadow-yellow-500/40', badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25', label: 'MEDIUM', icon: '⬤' },
};

/* ── Section theme map ─────────────────────────────────────────────────── */
const sectionTheme = {
  examples:  { bg: 'bg-rose-500/[0.06]',   border: 'border-rose-500/15',   heading: 'text-rose-400',    body: 'text-rose-200/70',   icon: '💬' },
  warning:   { bg: 'bg-red-500/[0.06]',     border: 'border-red-500/15',    heading: 'text-red-400',     body: 'text-red-200/70',    icon: '⚠️' },
  evidence:  { bg: 'bg-sky-500/[0.06]',     border: 'border-sky-500/15',    heading: 'text-sky-400',     body: 'text-sky-200/70',    icon: '📋' },
  steps:     { bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/15',heading: 'text-emerald-400', body: 'text-emerald-200/70',icon: '📝' },
  documents: { bg: 'bg-amber-500/[0.06]',   border: 'border-amber-500/15',  heading: 'text-amber-400',   body: 'text-amber-200/70',  icon: '📄' },
  actions:   { bg: 'bg-violet-500/[0.06]',  border: 'border-violet-500/15', heading: 'text-violet-400',  body: 'text-violet-200/70', icon: '🚨' },
  tips:      { bg: 'bg-teal-500/[0.06]',    border: 'border-teal-500/15',   heading: 'text-teal-400',    body: 'text-teal-200/70',   icon: '💡' },
  contacts:  { bg: 'bg-slate-500/[0.06]',   border: 'border-slate-500/15',  heading: 'text-gray-300',    body: 'text-gray-300',      icon: '🏛️' },
};

export default function ScamTypesPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ScamCategory | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'ur' | 'ro'>('en');

  const stats = useMemo(() => getRegistryStats(), []);

  const filteredTypes = useMemo(() => {
    let results = search ? searchScamTypes(search) : SCAM_TYPES_REGISTRY;
    if (selectedCategory !== 'all') {
      results = results.filter((s) => s.category === selectedCategory);
    }
    return results;
  }, [search, selectedCategory]);

  const toggle = (id: string) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="animate-slide-up">
        <a href="/fraud" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Fraud Center
        </a>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg shadow-lg shadow-cyan-500/20">📚</div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Scam Types & Requirements</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Complete fraud intelligence catalog — {stats.totalTypes} types across {stats.categories} categories
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up" style={{ animationDelay: '60ms' }}>
        {[
          { value: stats.totalTypes, label: 'Total Types', color: 'from-cyan-500/20 to-blue-500/20', text: 'text-cyan-300', border: 'border-cyan-500/20', labelColor: 'text-cyan-400/70' },
          { value: stats.critical, label: 'Critical', color: 'from-red-500/20 to-rose-500/20', text: 'text-red-300', border: 'border-red-500/20', labelColor: 'text-red-400/70' },
          { value: stats.high, label: 'High Risk', color: 'from-orange-500/20 to-amber-500/20', text: 'text-orange-300', border: 'border-orange-500/20', labelColor: 'text-orange-400/70' },
          { value: stats.categories, label: 'Categories', color: 'from-violet-500/20 to-purple-500/20', text: 'text-violet-300', border: 'border-violet-500/20', labelColor: 'text-violet-400/70' },
        ].map((s) => (
          <div key={s.label} className={`relative overflow-hidden rounded-xl p-3 border ${s.border} bg-gradient-to-br ${s.color} backdrop-blur-sm`}>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className={`text-[11px] ${s.labelColor} font-medium`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Controls Row ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder={lang === 'en' ? 'Search scam type...' : lang === 'ur' ? 'اسکیم کی قسم تلاش کریں...' : 'Scam type search karein...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-gray-200 text-sm focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 backdrop-blur-sm transition-all placeholder:text-gray-600"
          />
        </div>
        {/* Category Select */}
          <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as ScamCategory | 'all')}
          className="px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-gray-200 text-sm focus:outline-none focus:border-cyan-500/40 backdrop-blur-sm transition-all [&>option]:bg-slate-800 [&>option]:text-gray-200"
        >
          <option value="all">{lang === 'en' ? 'All Categories' : lang === 'ur' ? 'تمام زمرے' : 'Tamam Zumray'}</option>
          {SCAM_CATEGORIES.map((cat) => (
            <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
          ))}
        </select>
        {/* Language Toggle */}
        <div className="flex rounded-xl border border-slate-700/40 overflow-hidden">
          {(['en', 'ur', 'ro'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-2 text-xs font-medium transition-all ${
                lang === l
                  ? 'bg-cyan-600/80 text-white shadow-inner'
                  : 'bg-slate-800/60 text-gray-500 hover:text-gray-300 hover:bg-slate-700/40'
              }`}
            >
              {l === 'en' ? 'EN' : l === 'ur' ? 'اردو' : 'RO'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category Cards ──────────────────────────────────────────────── */}
      {selectedCategory === 'all' && !search && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 animate-slide-up" style={{ animationDelay: '150ms' }}>
          {SCAM_CATEGORIES.map((cat) => {
            const count = getScamTypesByCategory(cat.name).length;
            const accent = categoryAccent[cat.name] || defaultAccent;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`relative overflow-hidden rounded-xl p-3 border border-slate-700/30 hover:${accent.border} transition-all text-left group bg-slate-800/40 backdrop-blur-sm hover:shadow-lg ${accent.glow}`}
              >
                <div className={`absolute inset-0 ${accent.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className="text-xl mb-1">{cat.icon}</div>
                  <div className={`text-[11px] font-semibold text-gray-300 group-hover:${accent.text} transition-colors leading-tight`}>{cat.name}</div>
                  <div className="text-[10px] text-gray-600 mt-0.5">{count} type{count !== 1 ? 's' : ''}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Results Count ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-gray-500 animate-slide-up" style={{ animationDelay: '180ms' }}>
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/60" />
        {lang === 'en' ? `Showing ${filteredTypes.length} scam type${filteredTypes.length !== 1 ? 's' : ''}` :
         lang === 'ur' ? `${filteredTypes.length} اسکیم کی قسمیں دکھائی جا رہی ہیں` :
         `${filteredTypes.length} scam types dikhai ja rahi hain`}
        {selectedCategory !== 'all' && <span className="text-gray-600">— {selectedCategory}</span>}
      </div>

      {/* ── Scam Type Cards ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        {filteredTypes.map((scam, i) => (
          <ScamTypeCard
            key={scam.id}
            scam={scam}
            lang={lang}
            expanded={expandedId === scam.id}
            onToggle={() => toggle(scam.id)}
            index={i}
          />
        ))}
      </div>

      {filteredTypes.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/30 flex items-center justify-center text-2xl mb-4">🔍</div>
          <p className="text-gray-500 text-sm">{lang === 'en' ? 'No scam types match your search' : lang === 'ur' ? 'آپ کی تلاش سے کوئی اسکیم نہیں ملی' : 'Aap ki search se koi scam nahi mili'}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Card Component ─────────────────────────────────────────────────────────── */
function ScamTypeCard({ scam, lang, expanded, onToggle, index }: {
  scam: ScamTypeEntry;
  lang: 'en' | 'ur' | 'ro';
  expanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  const cp = scam.complaintPath;
  const accent = categoryAccent[scam.category] || defaultAccent;
  const sev = severityConfig[scam.severity];

  const title = lang === 'en' ? scam.scamType : lang === 'ur' ? scam.scamTypeUrdu : (scam.scamTypeRomanUrdu || scam.scamType);
  const desc = lang === 'en' ? scam.description : lang === 'ur' ? scam.descriptionUrdu : scam.descriptionRomanUrdu;

  return (
    <div
      className={`rounded-xl border-l-[3px] ${accent.border} border border-l-[3px] border-slate-700/20 bg-slate-800/30 backdrop-blur-sm overflow-hidden transition-all animate-slide-up hover:bg-slate-800/50 ${expanded ? `shadow-lg ${accent.glow} ring-1 ${accent.ring}` : ''}`}
      style={{ animationDelay: `${200 + index * 20}ms` }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left group">
        {/* Severity dot */}
        <div className={`w-2 h-2 rounded-full shrink-0 ${sev.dot} shadow-sm`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold text-sm text-gray-100 group-hover:text-white transition-colors ${lang === 'ur' ? 'font-urdu' : ''}`}>{title}</span>
            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold tracking-wide ${sev.badge}`}>
              {sev.label}
            </span>
            <span className={`text-[9px] px-2 py-0.5 rounded-full border ${accent.bg} ${accent.text} border-slate-700/30 font-medium`}>
              {scam.category}
            </span>
          </div>
          <p className={`text-xs text-gray-500 mt-0.5 truncate ${lang === 'ur' ? 'font-urdu' : ''}`}>{desc}</p>
        </div>

        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${expanded ? `${accent.bg} ${accent.text}` : 'text-gray-600 group-hover:text-gray-400'}`}>
          <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </button>

      {/* ── Expanded Content ────────────────────────────────────────────── */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-700/20 pt-3">

          {/* Common Examples */}
          {scam.commonExamples.length > 0 && (
            <Section theme={sectionTheme.examples}>
              <SectionTitle theme={sectionTheme.examples} lang={lang}
                en="Common Examples" ur="عام مثالیں" ro="Aam Misaalein" />
              <ul className="space-y-1.5">
                {scam.commonExamples.map((ex, i) => (
                  <li key={i} className={`text-xs ${sectionTheme.examples.body} flex gap-2 ${lang === 'ur' ? 'font-urdu text-right flex-row-reverse' : ''}`}>
                    <span className="text-rose-400/50 mt-0.5 shrink-0">❝❞</span>
                    <span>{lang === 'en' ? ex.en : lang === 'ur' ? ex.ur : ex.ro}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Warning Signs */}
          <Section theme={sectionTheme.warning}>
            <SectionTitle theme={sectionTheme.warning} lang={lang}
              en="Warning Signs" ur="انتباہ کی نشانیاں" ro="Intibah ki Nishaniyan" />
            <ul className="space-y-1">
              {scam.warningSigns.map((sign, i) => (
                <li key={i} className={`text-xs ${sectionTheme.warning.body} flex gap-2 ${lang === 'ur' ? 'font-urdu text-right flex-row-reverse' : ''}`}>
                  <span className="text-red-400/40 shrink-0">▸</span>
                  <span>{lang === 'en' ? sign.en : lang === 'ur' ? sign.ur : sign.ro}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Evidence Checklist */}
          {cp.evidenceChecklist && cp.evidenceChecklist.length > 0 && (
            <Section theme={sectionTheme.evidence}>
              <SectionTitle theme={sectionTheme.evidence} lang={lang}
                en="Evidence Required" ur="مطلوبہ ثبوت" ro="Matlooba Saboot" />
              <ul className="space-y-1">
                {(lang === 'ur' ? (cp.evidenceChecklistUrdu || []) : lang === 'ro' ? (cp.evidenceChecklistRomanUrdu || cp.evidenceChecklist || []) : (cp.evidenceChecklist || [])).map((item, i) => (
                  <li key={i} className={`text-xs ${sectionTheme.evidence.body} flex gap-2 ${lang === 'ur' ? 'font-urdu text-right flex-row-reverse' : ''}`}>
                    <span className="text-sky-400/50 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Step-by-Step Guide */}
          {cp.stepByStepGuide && cp.stepByStepGuide.length > 0 && (
            <Section theme={sectionTheme.steps}>
              <SectionTitle theme={sectionTheme.steps} lang={lang}
                en="Step-by-Step Guide" ur="مرحلہ وار گائیڈ" ro="Marhalawar Guide" />
              <ol className="space-y-1">
                {(lang === 'ur' ? (cp.stepByStepGuideUrdu || []) : lang === 'ro' ? (cp.stepByStepGuideRomanUrdu || cp.stepByStepGuide || []) : (cp.stepByStepGuide || [])).map((step, i) => (
                  <li key={i} className={`text-xs ${sectionTheme.steps.body} flex gap-2 ${lang === 'ur' ? 'font-urdu text-right flex-row-reverse' : ''}`}>
                    <span className="text-emerald-400/40 font-mono text-[10px] shrink-0 mt-px">{String(i + 1).padStart(2, '0')}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {/* Required Documents */}
          <Section theme={sectionTheme.documents}>
            <SectionTitle theme={sectionTheme.documents} lang={lang}
              en="Required Documents" ur="مطلوبہ دستاویزات" ro="Matlooba Documents" />
            <ul className="space-y-1">
              {(lang === 'ur' ? cp.requiredDocumentsUrdu : lang === 'ro' ? (cp.requiredDocumentsRomanUrdu || cp.requiredDocuments) : cp.requiredDocuments).map((doc, i) => (
                <li key={i} className={`text-xs ${sectionTheme.documents.body} flex gap-2 ${lang === 'ur' ? 'font-urdu text-right flex-row-reverse' : ''}`}>
                  <span className="text-amber-400/40 shrink-0">◦</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Immediate Actions */}
          <Section theme={sectionTheme.actions}>
            <SectionTitle theme={sectionTheme.actions} lang={lang}
              en="Immediate Actions" ur="فوری اقدامات" ro="Fori Iqdaamat" />
            <ul className="space-y-1">
              {(lang === 'ur' ? cp.immediateActionsUrdu : lang === 'ro' ? (cp.immediateActionsRomanUrdu || cp.immediateActions) : cp.immediateActions).map((action, i) => (
                <li key={i} className={`text-xs ${sectionTheme.actions.body} flex gap-2 ${lang === 'ur' ? 'font-urdu text-right flex-row-reverse' : ''}`}>
                  <span className="text-violet-400/40 shrink-0">→</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Additional Tips */}
          {cp.additionalTips && cp.additionalTips.length > 0 && (
            <Section theme={sectionTheme.tips}>
              <SectionTitle theme={sectionTheme.tips} lang={lang}
                en="Additional Tips" ur="اضافی تجاویز" ro="Izafi Tips" />
              <ul className="space-y-1">
                {(lang === 'ur' ? cp.additionalTipsUrdu : lang === 'ro' ? (cp.additionalTipsRomanUrdu || cp.additionalTips) : cp.additionalTips).map((tip, i) => (
                  <li key={i} className={`text-xs ${sectionTheme.tips.body} flex gap-2 ${lang === 'ur' ? 'font-urdu text-right flex-row-reverse' : ''}`}>
                    <span className="text-teal-400/40 shrink-0">✦</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Where to Complain */}
          <Section theme={sectionTheme.contacts}>
            <SectionTitle theme={sectionTheme.contacts} lang={lang}
              en="Where to Complain" ur="کہاں شکایت کریں" ro="Kahan Shikayat Karein" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cp.complaintContacts.map((contact, i) => (
                <div key={i} className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/30">
                  <div className={`text-xs font-semibold text-white ${lang === 'ur' ? 'font-urdu' : ''}`}>
                    {lang === 'ur' ? contact.nameUrdu : lang === 'ro' ? (contact.nameRomanUrdu || contact.name) : contact.name}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    {contact.phone && (
                      <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-1 text-cyan-400/70 hover:text-cyan-300 transition-colors underline underline-offset-2 decoration-cyan-500/20 hover:decoration-cyan-400/40">
                        📞 {contact.phone}
                      </a>
                    )}
                    {contact.website && contact.website.startsWith('http') ? (
                      <a href={contact.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cyan-400/70 hover:text-cyan-300 transition-colors underline underline-offset-2 decoration-cyan-500/20 hover:decoration-cyan-400/40">
                        🌐 {contact.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : contact.website ? (
                      <span className="inline-flex items-center gap-1 text-gray-400/70">🌐 {contact.website}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Timeframe & CTA */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <div className="flex-1 bg-slate-800/40 rounded-lg p-3 border border-slate-700/20">
              <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">
                {lang === 'en' ? '⏱ Timeframe' : lang === 'ur' ? '⏱ مدت' : '⏱ Muddat'}
              </div>
              <div className={`text-xs text-gray-400 mt-1 ${lang === 'ur' ? 'font-urdu' : ''}`}>
                {lang === 'ur' ? cp.timeframeUrdu : lang === 'ro' ? (cp.timeframeRomanUrdu || cp.timeframe) : cp.timeframe}
              </div>
            </div>
            <div className="flex items-end">
              <a
                href={cp.onlineComplaintUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-semibold transition-all shadow-lg hover:shadow-xl whitespace-nowrap bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/20`}
              >
                {lang === 'en' ? 'File Complaint Online' : lang === 'ur' ? 'آن لائن شکایت درج کریں' : 'Online Shikayat Darj Karein'} →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Reusable Section wrapper ───────────────────────────────────────────────── */
function Section({ theme, children }: { theme: typeof sectionTheme.examples; children: React.ReactNode }) {
  return (
    <div className={`${theme.bg} rounded-lg p-3 border ${theme.border}`}>
      {children}
    </div>
  );
}

/* ── Section Title ──────────────────────────────────────────────────────────── */
function SectionTitle({ theme, lang, en, ur, ro }: {
  theme: typeof sectionTheme.examples;
  lang: 'en' | 'ur' | 'ro';
  en: string; ur: string; ro: string;
}) {
  return (
    <h4 className={`text-[11px] font-bold ${theme.heading} mb-2 tracking-wide uppercase`}>
      {theme.icon} {lang === 'en' ? en : lang === 'ur' ? ur : ro}
    </h4>
  );
}
