'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/button';
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
        <Button variant="secondary" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {!profile && (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-2xl shadow-xl p-10 text-center animate-fade-in border border-purple-500/20">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold gradient-text mb-3">Welcome to Smart Study Planner!</h3>
          <p className="text-cyan-400 text-base mb-6 max-w-md mx-auto">Plan your study sessions, track progress, and optimize your learning. Get started in just 2 minutes!</p>
          <Link href="/study-planner/plans"
            className="inline-block px-8 py-3 rounded-xl font-semibold text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/50 transform hover:scale-105">
            🚀 Create Your First Study Plan
          </Link>
        </div>
      )}

      {profile && (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-2xl shadow-xl p-8 border border-purple-500/20">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">👤</div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Your Learning Profile</h2>
            <p className="text-cyan-400 text-sm mt-1">Personalized for your study needs</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl p-4 border-2 border-violet-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎓</span>
                <p className="text-xs bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent font-semibold uppercase tracking-wide">Education Level</p>
              </div>
              <p className="text-lg font-bold gradient-text capitalize">{profile.educationLevel || 'Not set'}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border-2 border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🧠</span>
                <p className="text-xs bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-semibold uppercase tracking-wide">Learning Style</p>
              </div>
              <p className="text-lg font-bold gradient-text capitalize">{profile.learningStyle || 'Not set'}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-4 border-2 border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⏰</span>
                <p className="text-xs bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-semibold uppercase tracking-wide">Study Hours/Day</p>
              </div>
              <p className="text-lg font-bold gradient-text">{profile.studyHoursPerDay ? `${profile.studyHoursPerDay} hours` : 'Not set'}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-4 border-2 border-amber-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎯</span>
                <p className="text-xs bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent font-semibold uppercase tracking-wide">Target Exam</p>
              </div>
              <p className="text-lg font-bold gradient-text">{profile.targetExam || 'Not set'}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl p-4 border-2 border-emerald-500/30 sm:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📖</span>
                <p className="text-xs bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent font-semibold uppercase tracking-wide">Your Subjects</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(profile.subjects || []).map((s) => (
                  <span key={s} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{s}</span>
                ))}
                {(!profile.subjects || profile.subjects.length === 0) && <p className="text-sm text-gray-500">No subjects added yet</p>}
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-4 border-2 border-amber-500/30 sm:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">⚠️</span>
                <p className="text-xs bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent font-semibold uppercase tracking-wide">Weak Areas (Need Focus)</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(profile.weakSubjects || []).map((w) => (
                  <span key={w} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">{w}</span>
                ))}
                {(!profile.weakSubjects || profile.weakSubjects.length === 0) && <p className="text-sm text-gray-500">No weak areas identified</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-2xl shadow-xl p-6 border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">📋</span>
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Active Study Plans</h2>
          </div>
          {plans.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">📝</div>
              <p className="text-cyan-400 text-sm mb-4">No active study plans yet</p>
              <Link href="/study-planner/plans" className="inline-block px-6 py-2 rounded-xl font-medium text-sm bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600 transition-all">
                Create Your First Plan
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => {
                const start = new Date(plan.startDate).getTime();
                const end = new Date(plan.endDate).getTime();
                const now = Date.now();
                const progress = end > start ? Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100))) : 0;
                const daysLeft = Math.max(0, Math.ceil((end - now) / 86400000));
                return (
                <div key={plan.id} className="bg-gradient-to-br from-cyan-500/5 to-teal-500/5 border-2 border-cyan-500/20 rounded-xl p-4 hover:border-cyan-500/40 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">📚</span>
                        <p className="text-base font-bold gradient-text">{plan.title}</p>
                      </div>
                      {plan.description && <p className="text-sm text-gray-400 mb-2">{plan.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span>📅</span>
                          {new Date(plan.startDate).toLocaleDateString()}
                        </span>
                        <span>→</span>
                        <span className="flex items-center gap-1">
                          <span>🏁</span>
                          {new Date(plan.endDate).toLocaleDateString()}
                        </span>
                        {plan.status === 'active' && <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-medium">{daysLeft}d left</span>}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      plan.status === 'active' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                      plan.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-white/5 text-gray-400 border border-white/10'
                    }`}>
                      {plan.status === 'active' && '🔥'}
                      {plan.status === 'completed' && '✅'}
                      {plan.status === 'paused' && '⏸️'}
                      {' '}{plan.status}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full transition-all ${plan.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-cyan-500 to-teal-500'}`} style={{ width: `${plan.status === 'completed' ? 100 : progress}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">{plan.status === 'completed' ? '100' : progress}% complete</p>
                </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-2xl shadow-xl p-6 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">⚠️</span>
            <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Weak Subjects Analysis</h2>
          </div>
          {weakSubjects.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-cyan-400 text-sm">No weak subjects identified yet</p>
              <p className="text-xs text-gray-500 mt-1">Keep studying to get personalized insights!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {weakSubjects.map((ws) => (
                <div key={ws.subject} className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-2 border-amber-500/20 rounded-xl p-4 hover:border-amber-500/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📖</span>
                      <p className="text-base font-bold gradient-text">{ws.subject}</p>
                    </div>
                     <span className="text-lg font-bold gradient-text">{ws.score}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 mb-2">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all" style={{ width: `${ws.score}%` }} />
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <p className="text-sm text-cyan-400"><span className="font-semibold">Tip:</span> {ws.recommendations}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── AI STUDY INTELLIGENCE ── */}
      {perfData && perfData.diagnostic ? (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-2xl shadow-xl p-6 border border-violet-500/20">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-3xl">🧠</span>
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">AI Study Intelligence</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Readiness Score */}
            <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] rounded-xl p-5 border border-white/[0.08] text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Overall Readiness</p>
              <div className="relative w-28 h-28 mx-auto mb-3">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke={perfData.diagnostic.overallScore >= 75 ? '#10b981' : perfData.diagnostic.overallScore >= 50 ? '#3b82f6' : perfData.diagnostic.overallScore >= 30 ? '#f59e0b' : '#ef4444'} strokeWidth="10" strokeDasharray={`${(perfData.diagnostic.overallScore / 100) * 327} 327`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold gradient-text">{perfData.diagnostic.overallScore}</span>
                </div>
              </div>
              <p className={`text-sm font-semibold ${perfData.diagnostic.weeklyTrend === 'improving' ? 'text-emerald-400' : perfData.diagnostic.weeklyTrend === 'declining' ? 'text-red-400' : 'text-amber-400'}`}>
                {perfData.diagnostic.weeklyTrend === 'improving' ? '📈 Improving' : perfData.diagnostic.weeklyTrend === 'declining' ? '📉 Declining' : '➡️ Stable'}
              </p>
              <p className="text-xs text-gray-500 mt-1">{perfData.diagnostic.summary}</p>
            </div>

            {/* Priority Focus Areas */}
            <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] rounded-xl p-5 border border-white/[0.08]">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">🎯 Priority Focus Areas</p>
              {perfData.diagnostic.weaknesses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-emerald-400 text-sm">✅ No critical weaknesses!</p>
                  <p className="text-xs text-gray-500 mt-1">Keep up the good work</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {perfData.diagnostic.weaknesses.slice(0, 4).map((w, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        i === 0 ? 'bg-red-500/20 text-red-400' : i === 1 ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium gradient-text">{w.subject} / {w.topic}</p>
                        <p className="text-xs text-gray-500">{w.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] rounded-xl p-5 border border-white/[0.08]">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Study Metrics</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Study Time</span>
                  <span className="text-sm font-bold gradient-text">{Math.round(perfData.totalStudyMinutes / 60)}h {perfData.totalStudyMinutes % 60}m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Quizzes Taken</span>
                  <span className="text-sm font-bold gradient-text">{perfData.totalQuizzes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Avg Quiz Score</span>
                  <span className={`text-sm font-bold ${perfData.averageQuizScore >= 75 ? 'text-emerald-400' : perfData.averageQuizScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{perfData.averageQuizScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Active Revisions</span>
                  <span className="text-sm font-bold gradient-text">{perfData.activeRevisionPlans}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Overdue Revisions</span>
                  <span className={`text-sm font-bold ${perfData.overdueRevisions > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{perfData.overdueRevisions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Overdue Revisions Alert */}
          {perfData.diagnostic.revisionUrgency.length > 0 && (
            <div className="mt-4 bg-gradient-to-br from-red-500/[0.06] to-orange-500/[0.04] rounded-xl p-4 border-2 border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🚨</span>
                <h3 className="text-sm font-bold text-red-400">Urgent Revisions Needed</h3>
              </div>
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

          {/* Study Pattern Insights */}
          {perfData.diagnostic.studyPatternInsights.length > 0 && (
            <div className="mt-4 bg-gradient-to-br from-blue-500/[0.06] to-cyan-500/[0.04] rounded-xl p-4 border-2 border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💡</span>
                <h3 className="text-sm font-bold text-blue-400">Study Pattern Insights</h3>
              </div>
              <div className="space-y-1.5">
                {perfData.diagnostic.studyPatternInsights.map((insight, i) => (
                  <p key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    {insight}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-2xl shadow-xl p-6 border border-violet-500/20 opacity-60">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">🧠</span>
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">AI Study Intelligence</h2>
          </div>
          <div className="text-center py-6">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-gray-400 text-sm">Start logging study sessions and taking quizzes to unlock AI-powered insights.</p>
            <p className="text-xs text-gray-500 mt-1">Your readiness score, weak areas, and study patterns will appear here.</p>
          </div>
        </div>
      )}

      {/* ── IMPROVEMENT ROADMAP ── */}
      {perfData && perfData.subjects.length > 0 ? (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-2xl shadow-xl p-6 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">🗺️</span>
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Your Improvement Roadmap</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">Based on your study data, here&apos;s where to focus your effort for maximum improvement:</p>

          <div className="space-y-3">
            {perfData.subjects
              .sort((a, b) => a.averageQuizScore - b.averageQuizScore)
              .map((sub) => {
                const needsWork = sub.averageQuizScore < 60;
                const isDeclining = sub.trend === 'declining';
                const weakTopics = sub.topics.filter(t => t.masteryLevel < 50);
                return (
                  <div key={sub.subject} className={`rounded-xl p-4 border-2 transition-all ${
                    needsWork || isDeclining ? 'bg-gradient-to-br from-red-500/[0.06] to-orange-500/[0.04] border-red-500/20' :
                    sub.averageQuizScore < 75 ? 'bg-gradient-to-br from-amber-500/[0.06] to-yellow-500/[0.04] border-amber-500/20' :
                    'bg-gradient-to-br from-emerald-500/[0.06] to-teal-500/[0.04] border-emerald-500/20'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{needsWork ? '🔴' : sub.averageQuizScore < 75 ? '🟡' : '🟢'}</span>
                        <h3 className="font-bold gradient-text">{sub.subject}</h3>
                        {isDeclining && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">DECLINING</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>Quiz avg: <strong className={sub.averageQuizScore >= 75 ? 'text-emerald-400' : sub.averageQuizScore >= 50 ? 'text-amber-400' : 'text-red-400'}>{sub.averageQuizScore}%</strong></span>
                        <span>{sub.totalSessions} sessions</span>
                        <span>{Math.round(sub.totalMinutes / 60)}h studied</span>
                      </div>
                    </div>

                    {weakTopics.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        <p className="text-xs font-semibold text-gray-400">Topics that need work:</p>
                        {weakTopics.slice(0, 3).map(t => (
                          <div key={t.topic} className="flex items-center gap-2 text-xs">
                            <span className="text-orange-400">⚠️</span>
                            <span className="text-gray-300"><strong>{t.topic}</strong> — Mastery: {t.masteryLevel}%</span>
                            <span className="text-gray-500 italic ml-auto">{t.diagnostic}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {needsWork && (
                      <div className="mt-2 flex items-start gap-2">
                        <span className="text-emerald-400 text-xs">💡</span>
                        <p className="text-xs text-emerald-400">
                          <strong>Recommended:</strong> Focus {sub.averageQuizScore < 40 ? '70% of your study time' : '50% of your study time'} on {sub.subject}. 
                          {weakTopics.length > 0 ? ` Start with: ${weakTopics.slice(0, 2).map(t => t.topic).join(', ')}.` : ' Practice more quizzes and review fundamentals.'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {perfData.subjects.length === 0 && (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">📝</div>
              <p className="text-gray-400">No study data yet. Start logging study sessions and quizzes to see your personalized roadmap.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-2xl shadow-xl p-6 border border-emerald-500/20 opacity-60">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">🗺️</span>
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Your Improvement Roadmap</h2>
          </div>
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-gray-400 text-sm">Once you start studying, we&apos;ll identify your weak topics and create a personalized improvement plan.</p>
            <p className="text-xs text-gray-500 mt-1">Subject-wise focus areas with time allocation recommendations will appear here.</p>
          </div>
        </div>
      )}

      {weeklySummary && (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-2xl shadow-xl p-6 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">📊</span>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Weekly Study Summary</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-xl p-5 text-center border-2 border-cyan-500/30">
              <div className="text-4xl mb-2">⏱️</div>
              <p className="text-3xl font-bold gradient-text">{weeklySummary.totalMinutes}</p>
              <p className="text-xs bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent font-semibold uppercase tracking-wide mt-1">Minutes This Week</p>
              <p className="text-xs text-gray-500 mt-1">{(weeklySummary.totalMinutes / 60).toFixed(1)} hours</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 rounded-xl p-5 text-center border-2 border-purple-500/30">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-3xl font-bold gradient-text">{weeklySummary.totalSessions}</p>
              <p className="text-xs bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent font-semibold uppercase tracking-wide mt-1">Sessions Completed</p>
              <p className="text-xs text-gray-500 mt-1">Great progress!</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-5 text-center border-2 border-amber-500/30">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-sm bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent font-semibold uppercase tracking-wide mb-2">Subjects Studied</p>
              <div className="flex flex-wrap justify-center gap-2">
                {(weeklySummary.subjectBreakdown || []).map((s) => (
                   <span key={s.subject} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">{s.subject}</span>
                ))}
                {(!weeklySummary.subjectBreakdown || weeklySummary.subjectBreakdown.length === 0) && (
                  <span className="text-sm text-gray-500">No subjects yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Link href="/study-planner/plans" className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl hover:from-purple-500/20 hover:to-pink-500/20 transition-all border-2 border-purple-500/20 hover:border-purple-500/40 group">
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📋</div>
            <p className="text-base font-bold gradient-text">Create Study Plan</p>
            <p className="text-xs text-gray-500 mt-2">Plan your learning journey</p>
          </Link>
          <Link href="/study-planner/timer" className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl hover:from-cyan-500/20 hover:to-teal-500/20 transition-all border-2 border-cyan-500/20 hover:border-cyan-500/40 group">
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">⏱️</div>
            <p className="text-base font-bold gradient-text">Log Study Session</p>
            <p className="text-xs text-gray-500 mt-2">Track your study time</p>
          </Link>
          <Link href="/study-planner/topics" className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl hover:from-amber-500/20 hover:to-orange-500/20 transition-all border-2 border-amber-500/20 hover:border-amber-500/40 group">
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📅</div>
            <p className="text-base font-bold gradient-text">View Schedule</p>
            <p className="text-xs text-gray-500 mt-2">See your study calendar</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
