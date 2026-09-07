'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface LearningProfile {
  educationLevel?: string;
  subjects?: string[];
  weakSubjects?: string[];
  learningStyle?: string;
  studyHoursPerDay?: number;
  targetExam?: string;
}

interface StudyPlan {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  schedule?: unknown;
}

interface WeakSubject {
  subject: string;
  score: number;
  recommendations: string;
}

interface WeeklySummary {
  totalMinutes: number;
  totalSessions: number;
  subjectBreakdown: { subject: string; minutes: number; sessions: number }[];
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
  subjects: {
    subject: string;
    totalSessions: number;
    totalMinutes: number;
    averageQuizScore: number;
    trend: string;
    trendPercentage: number;
    topics: { topic: string; masteryLevel: number; needsRevision: boolean; diagnostic: string; averageQuizScore: number }[];
  }[];
  diagnostic: Diagnostic;
  totalStudyMinutes: number;
  totalQuizzes: number;
  averageQuizScore: number;
  activeRevisionPlans: number;
  overdueRevisions: number;
}

export default function StudyPlannerPage() {
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [weakSubjects, setWeakSubjects] = useState<WeakSubject[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [perfData, setPerfData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, plansRes, weakRes, summaryRes, perfRes] = await Promise.allSettled([
          apiClient.get<{ data: LearningProfile | null }>('/api/study'),
          apiClient.get<{ data: StudyPlan[] }>('/api/study/plans'),
          apiClient.get<{ data: WeakSubject[] }>('/api/study/weak-subjects'),
          apiClient.get<{ data: WeeklySummary }>('/api/study/weekly-summary'),
          apiClient.get<{ data: PerformanceData }>('/api/study/performance'),
        ]);

        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
        if (plansRes.status === 'fulfilled') setPlans(plansRes.value.data || []);
        if (weakRes.status === 'fulfilled') setWeakSubjects(weakRes.value.data || []);
        if (summaryRes.status === 'fulfilled') setWeeklySummary(summaryRes.value.data);
        if (perfRes.status === 'fulfilled') setPerfData(perfRes.value.data);
      } catch {
        setError('Failed to load study planner data');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button className="mt-4 px-4 py-2 rounded-lg text-sm bg-white/5 text-gray-300 hover:bg-white/10" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  const activePlans = plans.filter(p => p.status === 'active');
  const readinessScore = perfData?.diagnostic?.overallScore ?? 0;
  const hasData = perfData && perfData.totalStudyMinutes > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold gradient-text">Study Planner</h1>
          <p className="text-sm mt-1 text-cyan-400">Plan, track & improve your study progress</p>
        </div>
        <div className="flex gap-2">
          <Link href="/study-planner/timer" className="px-4 py-2 rounded-xl font-medium text-sm bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600 transition-all">
            ⏱️ Log Session
          </Link>
          <Link href="/study-planner/plans" className="px-4 py-2 rounded-xl font-medium text-sm bg-white/5 text-gray-300 hover:bg-white/10 transition-all border border-white/10">
            📋 My Plans
          </Link>
        </div>
      </div>

      {/* No profile yet - simple welcome */}
      {!profile && (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-2xl shadow-xl p-10 text-center border border-purple-500/20">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-bold gradient-text mb-2">Welcome to Smart Study Planner</h3>
          <p className="text-cyan-400 text-sm mb-6 max-w-md mx-auto">Create a study plan, log your sessions, and track your progress over time.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/study-planner/plans" className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg">
              📋 Create Study Plan
            </Link>
            <Link href="/study-planner/timer" className="px-6 py-3 rounded-xl font-semibold bg-white/5 text-gray-300 hover:bg-white/10 transition-all border border-white/10">
              ⏱️ Start Study Timer
            </Link>
          </div>
        </div>
      )}

      {/* Profile summary bar (compact) */}
      {profile && (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-xl p-4 border border-purple-500/15">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-gray-500">Profile:</span>
            {profile.educationLevel && <span className="px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">🎓 {profile.educationLevel}</span>}
            {profile.targetExam && <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">🎯 {profile.targetExam}</span>}
            {profile.studyHoursPerDay && <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">⏰ {profile.studyHoursPerDay}h/day</span>}
            {profile.subjects && profile.subjects.length > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">📖 {profile.subjects.join(', ')}</span>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats Row */}
      {hasData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-cyan-500/[0.06] to-teal-500/[0.04] rounded-xl p-4 border border-cyan-500/15 text-center">
            <p className="text-2xl font-bold gradient-text">{Math.round(perfData!.totalStudyMinutes / 60)}h</p>
            <p className="text-xs text-gray-500 mt-1">Total Study Time</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/[0.06] to-pink-500/[0.04] rounded-xl p-4 border border-purple-500/15 text-center">
            <p className="text-2xl font-bold gradient-text">{perfData!.totalQuizzes}</p>
            <p className="text-xs text-gray-500 mt-1">Quizzes Taken</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/[0.06] to-green-500/[0.04] rounded-xl p-4 border border-emerald-500/15 text-center">
            <p className={`text-2xl font-bold ${perfData!.averageQuizScore >= 75 ? 'text-emerald-400' : perfData!.averageQuizScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{perfData!.averageQuizScore}%</p>
            <p className="text-xs text-gray-500 mt-1">Avg Quiz Score</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/[0.06] to-orange-500/[0.04] rounded-xl p-4 border border-amber-500/15 text-center">
            <div className="flex items-center justify-center gap-1">
              <p className={`text-2xl font-bold ${readinessScore >= 75 ? 'text-emerald-400' : readinessScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{readinessScore}</p>
              <span className={`text-xs ${perfData!.diagnostic?.weeklyTrend === 'improving' ? 'text-emerald-400' : perfData!.diagnostic?.weeklyTrend === 'declining' ? 'text-red-400' : 'text-amber-400'}`}>
                {perfData!.diagnostic?.weeklyTrend === 'improving' ? '📈' : perfData!.diagnostic?.weeklyTrend === 'declining' ? '📉' : '➡️'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Readiness Score</p>
          </div>
        </div>
      )}

      {/* Main Content: Plans + Focus Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Study Plans */}
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-2xl shadow-xl p-5 border border-cyan-500/15">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-2">
              📋 Active Plans
            </h2>
            <Link href="/study-planner/plans" className="text-xs text-cyan-400 hover:text-cyan-300">View all →</Link>
          </div>
          {activePlans.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-gray-400 text-sm mb-3">No active study plans</p>
              <Link href="/study-planner/plans" className="inline-block px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600 transition-all">
                Create Your First Plan
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activePlans.slice(0, 3).map((plan) => {
                const start = new Date(plan.startDate).getTime();
                const end = new Date(plan.endDate).getTime();
                const now = Date.now();
                const progress = end > start ? Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100))) : 0;
                const daysLeft = Math.max(0, Math.ceil((end - now) / 86400000));
                return (
                  <div key={plan.id} className="bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.06] hover:border-cyan-500/20 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold gradient-text truncate">{plan.title}</p>
                      <span className="text-xs text-cyan-400 flex-shrink-0 ml-2">{daysLeft}d left</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-cyan-500 to-teal-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 text-right">{progress}%</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Focus Areas (Weak Subjects + Priority) */}
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-2xl shadow-xl p-5 border border-amber-500/15">
          <h2 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2 mb-4">
            🎯 Focus Areas
          </h2>
          {weakSubjects.length === 0 && (!perfData?.diagnostic?.weaknesses || perfData.diagnostic.weaknesses.length === 0) ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-gray-400 text-sm">No weak areas identified yet</p>
              <p className="text-xs text-gray-500 mt-1">Keep studying to get personalized insights</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* From weak subjects */}
              {weakSubjects.slice(0, 3).map((ws) => (
                <div key={ws.subject} className="flex items-center justify-between bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400">⚠️</span>
                    <span className="text-sm font-medium gradient-text">{ws.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-white/5 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full" style={{ width: `${ws.score}%` }} />
                    </div>
                    <span className="text-xs text-amber-400 w-8 text-right">{ws.score}%</span>
                  </div>
                </div>
              ))}
              {/* From diagnostic weaknesses */}
              {perfData?.diagnostic?.weaknesses?.slice(0, 3).map((w, i) => (
                <div key={`w-${i}`} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${i === 0 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{i + 1}</span>
                    <span className="text-sm font-medium gradient-text">{w.subject} / {w.topic}</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">{w.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subject-wise Performance (only if data exists) */}
      {hasData && perfData!.subjects.length > 0 && (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-2xl shadow-xl p-5 border border-emerald-500/15">
          <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-2 mb-4">
            📊 Subject Performance
          </h2>
          <div className="space-y-2.5">
            {perfData!.subjects
              .sort((a, b) => a.averageQuizScore - b.averageQuizScore)
              .map((sub) => {
                const isWeak = sub.averageQuizScore < 60;
                const isDeclining = sub.trend === 'declining';
                return (
                  <div key={sub.subject} className={`flex items-center gap-4 rounded-xl p-3 border transition-all ${
                    isWeak ? 'bg-red-500/[0.04] border-red-500/15' : sub.averageQuizScore < 75 ? 'bg-amber-500/[0.04] border-amber-500/15' : 'bg-emerald-500/[0.04] border-emerald-500/15'
                  }`}>
                    <span className="text-lg flex-shrink-0">{isWeak ? '🔴' : sub.averageQuizScore < 75 ? '🟡' : '🟢'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold gradient-text truncate">{sub.subject}</p>
                        {isDeclining && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400">↓</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-white/5 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${isWeak ? 'bg-gradient-to-r from-red-500 to-orange-500' : sub.averageQuizScore < 75 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-gradient-to-r from-emerald-500 to-green-500'}`} style={{ width: `${sub.averageQuizScore}%` }} />
                        </div>
                        <span className={`text-xs font-bold w-8 text-right ${isWeak ? 'text-red-400' : sub.averageQuizScore < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>{sub.averageQuizScore}%</span>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-gray-500 flex-shrink-0">
                      <p>{sub.totalSessions} sessions</p>
                      <p>{Math.round(sub.totalMinutes / 60)}h studied</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Overdue Revisions Alert */}
      {perfData?.diagnostic?.revisionUrgency && perfData.diagnostic.revisionUrgency.length > 0 && (
        <div className="bg-gradient-to-br from-red-500/[0.06] to-orange-500/[0.04] rounded-xl p-4 border border-red-500/20">
          <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-2">🚨 Urgent Revisions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {perfData.diagnostic.revisionUrgency.slice(0, 4).map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-orange-400">⏰</span>
                <span className="text-gray-300"><strong>{r.subject}/{r.topic}</strong> — {r.recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Summary (compact) */}
      {weeklySummary && weeklySummary.totalMinutes > 0 && (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-xl p-4 border border-purple-500/15">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">This Week</p>
              <p className="text-lg font-bold gradient-text">{weeklySummary.totalMinutes} min <span className="text-xs text-gray-500 font-normal">({(weeklySummary.totalMinutes / 60).toFixed(1)}h)</span></p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Sessions</p>
              <p className="text-lg font-bold gradient-text">{weeklySummary.totalSessions}</p>
            </div>
            {weeklySummary.subjectBreakdown.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Subjects</p>
                <div className="flex flex-wrap gap-1.5">
                  {weeklySummary.subjectBreakdown.map((s) => (
                    <span key={s.subject} className="px-2 py-0.5 rounded-full text-xs bg-purple-500/15 text-purple-400 border border-purple-500/20">{s.subject}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/study-planner/plans" className="bg-gradient-to-br from-purple-500/[0.06] to-pink-500/[0.04] rounded-xl p-4 text-center hover:border-purple-500/30 border border-purple-500/15 transition-all group">
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</div>
          <p className="text-sm font-semibold gradient-text">Study Plans</p>
          <p className="text-[11px] text-gray-500 mt-1">Create & manage</p>
        </Link>
        <Link href="/study-planner/timer" className="bg-gradient-to-br from-cyan-500/[0.06] to-teal-500/[0.04] rounded-xl p-4 text-center hover:border-cyan-500/30 border border-cyan-500/15 transition-all group">
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">⏱️</div>
          <p className="text-sm font-semibold gradient-text">Timer</p>
          <p className="text-[11px] text-gray-500 mt-1">Log study time</p>
        </Link>
        <Link href="/study-planner/topics" className="bg-gradient-to-br from-amber-500/[0.06] to-orange-500/[0.04] rounded-xl p-4 text-center hover:border-amber-500/30 border border-amber-500/15 transition-all group">
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📅</div>
          <p className="text-sm font-semibold gradient-text">Topics</p>
          <p className="text-[11px] text-gray-500 mt-1">Track mastery</p>
        </Link>
        <Link href="/study-planner/performance" className="bg-gradient-to-br from-emerald-500/[0.06] to-green-500/[0.04] rounded-xl p-4 text-center hover:border-emerald-500/30 border border-emerald-500/15 transition-all group">
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📊</div>
          <p className="text-sm font-semibold gradient-text">Performance</p>
          <p className="text-[11px] text-gray-500 mt-1">Detailed stats</p>
        </Link>
      </div>
    </div>
  );
}
