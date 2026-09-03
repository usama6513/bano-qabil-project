'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { apiClient } from '@/lib/api-client';

interface RoadmapStep {
  step: number;
  title: string;
  description: string;
  timeframe: string;
  tasks: string[];
  milestone: string;
}

const phaseColors = [
  { bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500', ring: 'ring-blue-500/20', text: 'text-blue-400', badge: 'bg-blue-500/10 text-blue-400', treeBg: '#0b1628', treeBorder: '#1e3a5f' },
  { bg: 'bg-purple-500/10', border: 'border-purple-500/20', dot: 'bg-purple-500', ring: 'ring-purple-500/20', text: 'text-purple-400', badge: 'bg-purple-500/10 text-purple-400', treeBg: '#0f0b28', treeBorder: '#2e1a5f' },
  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500', ring: 'ring-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400', treeBg: '#0b2818', treeBorder: '#1a5f3a' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-500', ring: 'ring-amber-500/20', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400', treeBg: '#28200b', treeBorder: '#5f4a1a' },
  { bg: 'bg-rose-500/10', border: 'border-rose-500/20', dot: 'bg-rose-500', ring: 'ring-rose-500/20', text: 'text-rose-400', badge: 'bg-rose-500/10 text-rose-400', treeBg: '#280b12', treeBorder: '#5f1a2e' },
  { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', dot: 'bg-cyan-500', ring: 'ring-cyan-500/20', text: 'text-cyan-400', badge: 'bg-cyan-500/10 text-cyan-400', treeBg: '#0b2028', treeBorder: '#1a4a5f' },
  { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', dot: 'bg-indigo-500', ring: 'ring-indigo-500/20', text: 'text-indigo-400', badge: 'bg-indigo-500/10 text-indigo-400', treeBg: '#0b0f28', treeBorder: '#1a2e5f' },
  { bg: 'bg-pink-500/10', border: 'border-pink-500/20', dot: 'bg-pink-500', ring: 'ring-pink-500/20', text: 'text-pink-400', badge: 'bg-pink-500/10 text-pink-400', treeBg: '#280b1e', treeBorder: '#5f1a4a' },
];

export default function RoadmapPage() {
  const { user } = useAuth();
  const [currentEducation, setCurrentEducation] = useState('');
  const [targetDegree, setTargetDegree] = useState('');
  const [field, setField] = useState('');
  const [country, setCountry] = useState('');
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'tree'>('tree');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('currentEducation', currentEducation);
      params.set('targetDegree', targetDegree);
      if (field) params.set('field', field);
      if (country) params.set('country', country);
      const res = await apiClient.get<{ data: { roadmap: RoadmapStep[] } }>(`/api/education/roadmap?${params}`);
      setRoadmap(res.data.roadmap);
      setChecked({});
      setExpandedTasks({});
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate roadmap';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChecklist = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await apiClient.post('/api/education/checklist', {
        title: `${targetDegree} in ${field || 'General'} — Roadmap`,
      });
      alert('Checklist saved!');
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = (stepNum: number, taskIdx: number) => {
    setChecked((prev) => {
      const key = stepNum * 100 + taskIdx;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const toggleExpand = (stepNum: number) => {
    setExpandedTasks((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  const getCompletedTasks = (step: RoadmapStep) => {
    return step.tasks.filter((_, i) => checked[step.step * 100 + i]).length;
  };

  const totalTasks = roadmap.reduce((acc, s) => acc + s.tasks.length, 0);
  const completedTasks = Object.values(checked).filter(Boolean).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <a href="/education" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Education Center
        </a>
        <h1 className="text-3xl font-bold text-gray-100">Build My Roadmap</h1>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">
          From where you are to where you want to be — a strategic plan with tree visualization, tasks, and milestones.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleGenerate} className="card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Current Education</label>
            <select value={currentEducation} onChange={(e) => setCurrentEducation(e.target.value)} required className="input-field">
              <option value="">Select your level</option>
              <optgroup label="School">
                <option value="Matric">Matric (SSC / Class 10)</option>
              </optgroup>
              <optgroup label="Intermediate / College">
                <option value="FSc Pre-Medical">FSc Pre-Medical (HSSC / Class 12)</option>
                <option value="FSc Pre-Engineering">FSc Pre-Engineering (HSSC / Class 12)</option>
                <option value="ICS">ICS - Intermediate in Computer Science</option>
                <option value="ICom">I.Com - Intermediate in Commerce</option>
                <option value="FA">FA - Faculty of Arts</option>
                <option value="DAE">DAE - Diploma of Associate Engineering</option>
              </optgroup>
              <optgroup label="Bachelor / Undergraduate">
                <option value="BS / Bachelor">BS / Bachelor (16 years)</option>
                <option value="BBA">BBA - Bachelor of Business Administration</option>
                <option value="MBBS">MBBS - Bachelor of Medicine &amp; Surgery</option>
                <option value="BDS">BDS - Bachelor of Dental Surgery</option>
                <option value="Pharm-D">Pharm-D - Doctor of Pharmacy</option>
                <option value="LLB">LLB - Bachelor of Laws</option>
                <option value="BSc Engineering">BSc Engineering (4 years)</option>
                <option value="BArch">BArch - Bachelor of Architecture</option>
                <option value="BPl">BPl - Bachelor of Planning</option>
                <option value="BA / BSc">BA / BSc (2 years / old system)</option>
                <option value="BCom">BCom - Bachelor of Commerce</option>
                <option value="ADP">ADP - Associate Degree Program (2 years)</option>
                <option value="DPT">DPT - Doctor of Physical Therapy</option>
              </optgroup>
              <optgroup label="Postgraduate">
                <option value="MS / Master">MS / Master (18 years)</option>
                <option value="MBA">MBA - Master of Business Administration</option>
                <option value="MPhil">MPhil - Master of Philosophy</option>
                <option value="MA / MSc">MA / MSc (2 years)</option>
                <option value="LLM">LLM - Master of Laws</option>
                <option value="MCom">MCom - Master of Commerce</option>
                <option value="MD">MD - Doctor of Medicine (Residency)</option>
                <option value="MCPS / FCPS">MCPS / FCPS (Medical Specialization)</option>
              </optgroup>
              <optgroup label="Doctoral">
                <option value="PhD">PhD / Doctorate</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Target Degree</label>
            <select value={targetDegree} onChange={(e) => setTargetDegree(e.target.value)} required className="input-field">
              <option value="">Select target</option>
              <optgroup label="Intermediate">
                <option value="FSc Pre-Medical">FSc Pre-Medical</option>
                <option value="FSc Pre-Engineering">FSc Pre-Engineering</option>
                <option value="ICS">ICS - Computer Science</option>
                <option value="ICom">I.Com - Commerce</option>
                <option value="FA">FA - Arts</option>
                <option value="DAE">DAE - Diploma of Associate Engineering</option>
              </optgroup>
              <optgroup label="Bachelor">
                <option value="BS / Bachelor">BS / Bachelor (General)</option>
                <option value="BBA">BBA - Business Administration</option>
                <option value="MBBS">MBBS - Medicine &amp; Surgery</option>
                <option value="BDS">BDS - Dental Surgery</option>
                <option value="Pharm-D">Pharm-D - Pharmacy</option>
                <option value="LLB">LLB - Law</option>
                <option value="BSc Engineering">BSc Engineering</option>
                <option value="BArch">BArch - Architecture</option>
                <option value="BA / BSc">BA / BSc (2 years)</option>
                <option value="BCom">BCom - Commerce</option>
                <option value="ADP">ADP - Associate Degree</option>
                <option value="DPT">DPT - Physical Therapy</option>
                <option value="BEd">BEd - Bachelor of Education</option>
                <option value="BDes">BDes - Design</option>
              </optgroup>
              <optgroup label="Postgraduate">
                <option value="MS / Master">MS / Master (General)</option>
                <option value="MBA">MBA</option>
                <option value="MPhil">MPhil</option>
                <option value="MA / MSc">MA / MSc</option>
                <option value="LLM">LLM - Master of Laws</option>
                <option value="MCom">MCom</option>
                <option value="MD">MD - Doctor of Medicine</option>
                <option value="FCPS">FCPS - Medical Specialization</option>
                <option value="MEd">MEd - Master of Education</option>
                <option value="MDes">MDes - Master of Design</option>
              </optgroup>
              <optgroup label="Doctoral &amp; Beyond">
                <option value="PhD">PhD / Doctorate</option>
                <option value="Postdoc">Postdoctoral Fellowship</option>
              </optgroup>
              <optgroup label="Professional">
                <option value="Diploma">Professional Diploma</option>
                <option value="Certificate">Professional Certificate</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Field of Interest</label>
            <input
              type="text"
              placeholder="e.g. Computer Science, Medicine, Business"
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Country Preference</label>
            <input
              type="text"
              placeholder="e.g. Pakistan, USA, UK, Germany"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
              Crafting your roadmap...
            </span>
          ) : (
            'Generate My Roadmap'
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="card border-red-200 bg-red-500/10">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Roadmap Results */}
      {roadmap.length > 0 && (
        <>
          {/* Progress Bar */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-gray-100">Your Roadmap</h2>
                <p className="text-sm text-gray-500">{roadmap.length} phases &middot; {totalTasks} tasks</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400">{progressPercent}% complete</span>
                {user && (
                  <button onClick={handleSaveChecklist} disabled={saving} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    {saving ? 'Saving...' : 'Save as Checklist'}
                  </button>
                )}
              </div>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {completedTasks > 0 && (
              <p className="text-xs text-gray-500 mt-2">{completedTasks} of {totalTasks} tasks completed</p>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'tree' ? 'bg-primary-600 text-white shadow-md' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              Tree Diagram
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'timeline' ? 'bg-primary-600 text-white shadow-md' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              Timeline
            </button>
          </div>

          {/* TREE DIAGRAM VIEW */}
          {viewMode === 'tree' && (
            <div className="card overflow-x-auto">
              <div className="flex flex-col items-center gap-0 py-4 min-w-[320px] md:min-w-[600px]">
                {/* Root node */}
                <div className="relative flex flex-col items-center">
                  <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold text-sm shadow-lg">
                    {currentEducation} → {targetDegree}
                  </div>
                  <div className="w-0.5 h-6 bg-[#475569]" />
                </div>

                {/* Phases */}
                {roadmap.map((step, idx) => {
                  const color = phaseColors[idx % phaseColors.length];
                  const doneCount = getCompletedTasks(step);
                  const allDone = step.tasks.length > 0 && doneCount === step.tasks.length;
                  const isExpanded = expandedTasks[step.step] !== false;
                  const visibleTasks = isExpanded ? step.tasks : step.tasks.slice(0, 3);

                  return (
                    <div key={step.step} className="flex flex-col items-center w-full">
                      {/* Connector line with branch */}
                      <div className="flex flex-col items-center w-full">
                        {/* Vertical line down from parent */}
                        <div className="w-0.5 h-4 bg-[#475569]" />
                        {/* Horizontal connector (only if not last) */}
                        {idx < roadmap.length - 1 && (
                          <div className="w-full h-0.5 bg-white/5 absolute top-0" style={{ display: 'none' }} />
                        )}
                      </div>

                      {/* Tree Node */}
                      <div
                        className="w-full max-w-lg rounded-xl border-2 shadow-sm hover:shadow-md transition-all"
                        style={{ backgroundColor: color.treeBg, borderColor: allDone ? '#86efac' : color.treeBorder }}
                      >
                        {/* Node Header */}
                        <div
                          className="flex items-center justify-between px-4 py-3 cursor-pointer"
                          onClick={() => toggleExpand(step.step)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow ${allDone ? 'bg-green-500' : color.dot}`}
                            >
                              {allDone ? '✓' : step.step}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-100 text-sm">{step.title}</h3>
                              {step.timeframe && (
                                <span className={`text-xs font-semibold ${color.text}`}>{step.timeframe}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {step.tasks.length > 0 && (
                              <span className="text-xs text-gray-500 font-medium">{doneCount}/{step.tasks.length}</span>
                            )}
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="px-4 pb-2">
                          <p className="text-xs text-gray-400 leading-relaxed">{step.description}</p>
                        </div>

                        {/* Tasks (expandable) */}
                        {step.tasks.length > 0 && (
                          <div className="px-4 pb-3 border-t border-white/10">
                            <div className="mt-2 space-y-1">
                              {visibleTasks.map((task, tIdx) => {
                                const isChecked = checked[step.step * 100 + tIdx];
                                return (
                                  <button
                                    key={tIdx}
                                    type="button"
                                    onClick={() => toggleTask(step.step, tIdx)}
                                    className="w-full flex items-start gap-2 text-left group"
                                  >
                                    <div className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-green-500 border-green-500' : 'border-white/10 group-hover:border-primary-400'}`}>
                                      {isChecked && (
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>
                                    <span className={`text-xs leading-snug ${isChecked ? 'line-through text-gray-400' : 'text-gray-300'}`}>
                                      {task}
                                    </span>
                                  </button>
                                );
                              })}
                              {step.tasks.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(step.step)}
                                  className="text-xs text-primary-600 hover:text-primary-700 font-medium ml-6"
                                >
                                  {isExpanded ? 'Show less' : `+${step.tasks.length - 3} more tasks`}
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Milestone */}
                        {step.milestone && (
                          <div className={`mx-4 mb-3 px-3 py-2 rounded-lg text-xs font-semibold ${allDone ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {allDone ? '🎯' : '🏁'} {step.milestone}
                          </div>
                        )}
                      </div>

                      {/* Connector to next (if not last) */}
                      {idx < roadmap.length - 1 && (
                        <div className="w-0.5 h-4 bg-[#475569]" />
                      )}
                    </div>
                  );
                })}

                {/* End node */}
                <div className="w-0.5 h-4 bg-[#475569]" />
                <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm shadow-lg">
                  🎓 {targetDegree} Complete!
                </div>
              </div>
            </div>
          )}

          {/* TIMELINE VIEW */}
          {viewMode === 'timeline' && (
            <div className="relative">
              {/* Vertical line - desktop only */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10 hidden sm:block" />
              <div className="space-y-6">
                {roadmap.map((step, idx) => {
                  const color = phaseColors[idx % phaseColors.length];
                  const doneCount = getCompletedTasks(step);
                  const allDone = step.tasks.length > 0 && doneCount === step.tasks.length;
                  const isExpanded = expandedTasks[step.step] !== false;
                  const visibleTasks = isExpanded ? step.tasks : step.tasks.slice(0, 2);

                  return (
                    <div key={step.step} className="relative flex gap-4 sm:gap-6">
                      <div className="flex-shrink-0 relative z-10 hidden sm:block">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md transition-all ${allDone ? 'bg-green-500 ring-4 ring-green-900/50' : color.dot}`}>
                          {allDone ? '✓' : step.step}
                        </div>
                      </div>
                      <div className="flex-shrink-0 sm:hidden">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${allDone ? 'bg-green-500' : color.dot}`}>
                          {allDone ? '✓' : step.step}
                        </div>
                      </div>
                      <div className={`flex-1 rounded-xl border-2 transition-all hover:shadow-md ${allDone ? 'border-green-500/30 bg-emerald-500/10' : `${color.border} ${color.bg}`} p-3 sm:p-5`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-bold text-gray-100 text-base sm:text-lg">{step.title}</h3>
                              {allDone && <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-medium">Completed</span>}
                            </div>
                            {step.timeframe && (
                              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${color.badge} mb-2`}>{step.timeframe}</span>
                            )}
                          </div>
                          {step.tasks.length > 0 && (
                            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{doneCount}/{step.tasks.length}</span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3">{step.description}</p>
                        {step.tasks.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Action Items</p>
                            {visibleTasks.map((task, tIdx) => {
                              const isChecked = checked[step.step * 100 + tIdx];
                              return (
                                <button key={tIdx} type="button" onClick={() => toggleTask(step.step, tIdx)} className="w-full flex items-start gap-2.5 text-left group">
                                  <div className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-green-500 border-green-500' : 'border-white/10 group-hover:border-primary-400'}`}>
                                    {isChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                  </div>
                                  <span className={`text-xs sm:text-sm leading-snug ${isChecked ? 'line-through text-gray-400' : 'text-gray-300 group-hover:text-gray-100'}`}>{task}</span>
                                </button>
                              );
                            })}
                            {step.tasks.length > 2 && (
                              <button type="button" onClick={() => toggleExpand(step.step)} className="text-xs text-primary-600 hover:text-primary-700 font-medium ml-7">
                                {isExpanded ? 'Show less' : `Show all ${step.tasks.length} tasks`}
                              </button>
                            )}
                          </div>
                        )}
                        {step.milestone && (
                          <div className={`mt-3 p-2 sm:p-3 rounded-lg border ${allDone ? 'bg-green-500/10 border-green-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{allDone ? '🎯' : '🏁'}</span>
                              <p className={`text-xs font-semibold ${allDone ? 'text-green-400' : 'text-amber-400'}`}>Milestone: {step.milestone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary card */}
          <div className="card bg-gradient-to-r from-primary-900/30 to-secondary-900/30 border-primary-500/20">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚀</span>
              <div>
                <h3 className="font-bold text-gray-100">You&apos;re {progressPercent}% through your roadmap</h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  {progressPercent === 0 && "Start with Phase 1 — every journey begins with a single step."}
                  {progressPercent > 0 && progressPercent < 50 && "Great start! Keep momentum — consistency beats intensity."}
                  {progressPercent >= 50 && progressPercent < 100 && "Halfway there! Don't slow down now — the finish line is in sight."}
                  {progressPercent === 100 && "Incredible — you've completed every task! Time to execute."}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && roadmap.length === 0 && !error && (
        <div className="card text-center py-16">
          <span className="text-5xl block mb-4">🗺️</span>
          <h3 className="text-lg font-semibold text-gray-100 mb-1">Your Roadmap Awaits</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Fill in your current and target education above. We&apos;ll generate a visual tree roadmap with real tasks, timeframes, and milestones.
          </p>
        </div>
      )}
    </div>
  );
}
