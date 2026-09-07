'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface TopicPerf {
  topic: string;
  masteryLevel: number;
  sessionsCount: number;
  averageQuizScore: number;
  lastStudiedAt?: string;
  needsRevision: boolean;
  diagnostic: string;
}

interface SubjectPerf {
  subject: string;
  totalSessions: number;
  totalMinutes: number;
  averageRating: number;
  averageQuizScore: number;
  masteryDistribution: { level: string; count: number }[];
  trend: 'improving' | 'declining' | 'stable';
  trendPercentage: number;
  topics: TopicPerf[];
}

interface Diagnostic {
  overallScore: number;
  summary: string;
  strengths: { subject: string; detail: string }[];
  weaknesses: { subject: string; topic: string; detail: string; recommendation: string }[];
  revisionUrgency: { subject: string; topic: string; daysSinceStudied: number; recommendation: string }[];
  studyPatternInsights: string[];
  weeklyTrend: string;
}

interface PerformanceData {
  subjects: SubjectPerf[];
  diagnostic: Diagnostic;
  totalStudyMinutes: number;
  totalQuizzes: number;
  averageQuizScore: number;
  activeRevisionPlans: number;
  overdueRevisions: number;
}

interface RevisionPlan {
  id: string;
  subject: string;
  topic: string;
  masteryAtCreation: number;
  revisionCount: number;
  nextRevision?: string;
  status: string;
  notes?: string;
}

export default function PerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [revisions, setRevisions] = useState<RevisionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizForm, setQuizForm] = useState({ subject: '', topic: '', title: '', totalMarks: '', scoredMarks: '', timeTakenMin: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const [perfRes, revRes] = await Promise.all([
        fetch('/api/study/performance', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/study/revision', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (perfRes.ok) {
        const perfData = await perfRes.json();
        setData(perfData.data);
      }
      if (revRes.ok) {
        const revData = await revRes.json();
        setRevisions(revData.data || []);
      }
    } catch {
      setError('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogQuiz = async () => {
    if (!quizForm.subject || !quizForm.topic || !quizForm.title || !quizForm.totalMarks || !quizForm.scoredMarks) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/study/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subject: quizForm.subject,
          topic: quizForm.topic,
          title: quizForm.title,
          totalMarks: parseInt(quizForm.totalMarks),
          scoredMarks: parseInt(quizForm.scoredMarks),
          timeTakenMin: quizForm.timeTakenMin ? parseInt(quizForm.timeTakenMin) : undefined,
          notes: quizForm.notes || undefined,
        }),
      });
      if (res.ok) {
        setSuccessMsg('Quiz logged successfully!');
        setShowQuizForm(false);
        setQuizForm({ subject: '', topic: '', title: '', totalMarks: '', scoredMarks: '', timeTakenMin: '', notes: '' });
        fetchData();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch { /* empty */ }
    setSubmitting(false);
  };

  const handleRevisionAction = async (id: string, action: 'completed' | 'in_progress' | 'delete') => {
    const token = localStorage.getItem('accessToken');
    if (action === 'delete') {
      await fetch(`/api/study/revision/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    } else {
      await fetch(`/api/study/revision/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: action }),
      });
    }
    fetchData();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading performance data...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <Link href="/study-planner" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Study Planner
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Student Performance Intelligence</h1>
          <p className="text-amber-600 text-sm mt-1 bg-amber-500/10 inline-block px-2 py-1 rounded">Academic diagnostic guidance — not medical or psychological diagnosis</p>
        </div>
        <button onClick={() => setShowQuizForm(!showQuizForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          {showQuizForm ? 'Cancel' : 'Log Quiz'}
        </button>
      </div>

      {successMsg && <div className="bg-emerald-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-sm">{successMsg}</div>}

      {showQuizForm && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Log Practice Quiz</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Subject *</label>
              <input value={quizForm.subject} onChange={e => setQuizForm(p => ({ ...p, subject: e.target.value }))}
                className="input-field" placeholder="e.g. Mathematics" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Topic *</label>
              <input value={quizForm.topic} onChange={e => setQuizForm(p => ({ ...p, topic: e.target.value }))}
                className="input-field" placeholder="e.g. Quadratic Equations" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Quiz Title *</label>
              <input value={quizForm.title} onChange={e => setQuizForm(p => ({ ...p, title: e.target.value }))}
                className="input-field" placeholder="e.g. Chapter 5 Test" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Total Marks *</label>
                <input type="number" value={quizForm.totalMarks} onChange={e => setQuizForm(p => ({ ...p, totalMarks: e.target.value }))}
                  className="input-field" placeholder="100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Scored Marks *</label>
                <input type="number" value={quizForm.scoredMarks} onChange={e => setQuizForm(p => ({ ...p, scoredMarks: e.target.value }))}
                  className="input-field" placeholder="75" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Time Taken (min)</label>
              <input type="number" value={quizForm.timeTakenMin} onChange={e => setQuizForm(p => ({ ...p, timeTakenMin: e.target.value }))}
                className="input-field" placeholder="60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
              <input value={quizForm.notes} onChange={e => setQuizForm(p => ({ ...p, notes: e.target.value }))}
                className="input-field" placeholder="Optional notes..." />
            </div>
          </div>
          <button onClick={handleLogQuiz} disabled={submitting}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium">
            {submitting ? 'Saving...' : 'Save Quiz'}
          </button>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: 'Study Minutes', value: data.totalStudyMinutes, color: 'blue' },
              { label: 'Quizzes Taken', value: data.totalQuizzes, color: 'purple' },
              { label: 'Avg Quiz Score', value: `${data.averageQuizScore}%`, color: 'green' },
              { label: 'Active Revisions', value: data.activeRevisionPlans, color: 'yellow' },
              { label: 'Overdue Revisions', value: data.overdueRevisions, color: 'red' },
            ].map(s => (
              <div key={s.label} className={`stat-card text-center`}>
                <div className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {data.diagnostic && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-3">AI Diagnostic Summary</h2>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl font-bold">{data.diagnostic.overallScore}/100</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  data.diagnostic.weeklyTrend === 'improving' ? 'bg-green-500/10 text-green-400' :
                  data.diagnostic.weeklyTrend === 'declining' ? 'bg-red-500/10 text-red-400' :
                  'bg-white/5 text-gray-300'
                }`}>{data.diagnostic.weeklyTrend}</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">{data.diagnostic.summary}</p>

              {data.diagnostic.strengths.length > 0 && (
                <div className="mb-3">
                  <h3 className="font-medium text-green-400 mb-1">Strengths</h3>
                  <ul className="space-y-1">
                    {data.diagnostic.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500">&#10003;</span>
                        <span><strong>{s.subject}:</strong> {s.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.diagnostic.weaknesses.length > 0 && (
                <div className="mb-3">
                  <h3 className="font-medium text-red-400 mb-1">Areas to Improve</h3>
                  <ul className="space-y-1">
                    {data.diagnostic.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-red-500">&#9888;</span>
                        <span><strong>{w.subject} / {w.topic}:</strong> {w.detail}. <em>{w.recommendation}</em></span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.diagnostic.revisionUrgency.length > 0 && (
                <div className="mb-3">
                  <h3 className="font-medium text-orange-400 mb-1">Revision Urgency</h3>
                  <ul className="space-y-1">
                    {data.diagnostic.revisionUrgency.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-orange-500">&#9200;</span>
                        <span><strong>{r.subject} / {r.topic}:</strong> {r.recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.diagnostic.studyPatternInsights.length > 0 && (
                <div>
                  <h3 className="font-medium text-blue-400 mb-1">Study Pattern Insights</h3>
                  <ul className="space-y-1">
                    {data.diagnostic.studyPatternInsights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500">&#128161;</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Subject Performance</h2>
            {data.subjects.length === 0 ? (
              <div className="card p-8 text-center text-gray-400">No subjects tracked yet. Log study sessions and quizzes to see performance data.</div>
            ) : data.subjects.map(sub => (
              <div key={sub.subject} className="card overflow-hidden">
                <button onClick={() => setExpandedSubject(expandedSubject === sub.subject ? null : sub.subject)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold">{sub.subject}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      sub.trend === 'improving' ? 'bg-green-500/10 text-green-400' :
                      sub.trend === 'declining' ? 'bg-red-500/10 text-red-400' :
                      'bg-white/5 text-gray-400'
                    }`}>{sub.trend} {sub.trendPercentage !== 0 ? `(${sub.trendPercentage > 0 ? '+' : ''}${sub.trendPercentage}%)` : ''}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>{sub.totalSessions} sessions</span>
                    <span>{sub.totalMinutes} min</span>
                    <span>Avg quiz: {sub.averageQuizScore}%</span>
                    <span className="text-lg">{expandedSubject === sub.subject ? '-' : '+'}</span>
                  </div>
                </button>

                {expandedSubject === sub.subject && (
                  <div className="border-t border-white/10 p-4">
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {sub.masteryDistribution.map(d => (
                        <div key={d.level} className="text-center bg-white/5 rounded p-2">
                          <div className="text-lg font-bold">{d.count}</div>
                          <div className="text-xs text-gray-500">{d.level}</div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      {sub.topics.map(t => (
                        <div key={t.topic} className={`p-3 rounded-lg border ${t.needsRevision ? 'border-orange-500/20 bg-orange-500/5' : 'border-white/10 bg-white/5'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{t.topic}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Mastery: {t.masteryLevel}%</span>
                              {t.needsRevision && <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded text-xs">Needs Revision</span>}
                            </div>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2 mb-2">
                            <div className={`h-2 rounded-full ${t.masteryLevel >= 80 ? 'bg-green-500' : t.masteryLevel >= 60 ? 'bg-blue-500' : t.masteryLevel >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${t.masteryLevel}%` }} />
                          </div>
                          <p className="text-xs text-gray-400">{t.diagnostic}</p>
                          {t.averageQuizScore > 0 && <p className="text-xs text-gray-500 mt-1">Quiz avg: {t.averageQuizScore}% | Sessions: {t.sessionsCount}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {revisions.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-3">Revision Plans</h2>
              <div className="space-y-2">
                {revisions.map(r => (
                  <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                    r.status === 'completed' ? 'bg-emerald-500/10 border-green-500/20' :
                    r.status === 'in_progress' ? 'bg-blue-500/10 border-blue-500/20' :
                    r.nextRevision && new Date(r.nextRevision) < new Date() ? 'bg-red-500/10 border-red-500/20' :
                    'bg-yellow-500/10 border-yellow-500/20'
                  }`}>
                    <div>
                      <span className="font-medium text-sm">{r.subject} / {r.topic}</span>
                      <span className="text-xs text-gray-500 ml-2">Revisions: {r.revisionCount}</span>
                      {r.nextRevision && <span className="text-xs text-gray-500 ml-2">Next: {new Date(r.nextRevision).toLocaleDateString()}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        r.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                        r.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>{r.status}</span>
                      {r.status !== 'completed' && (
                        <>
                          <button onClick={() => handleRevisionAction(r.id, 'completed')}
                            className="text-xs text-green-600 hover:text-green-800">Done</button>
                          <button onClick={() => handleRevisionAction(r.id, 'delete')}
                            className="text-xs text-red-600 hover:text-red-800">Remove</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
