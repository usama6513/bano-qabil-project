'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/button';

interface TeacherProfile {
  name: string;
  subjects: string[];
  totalLessonPlans: number;
  totalAssessments: number;
}

interface LessonPlan {
  id: string;
  subject: string;
  topic: string;
  grade: string;
  createdAt: string;
}

interface Assessment {
  id: string;
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  createdAt: string;
}

export default function TeacherDashboard() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, lessonsRes, assessmentsRes] = await Promise.all([
          fetch('/api/teacher/profile'),
          fetch('/api/teacher/lessons'),
          fetch('/api/teacher/assessments'),
        ]);

        if (profileRes.ok) setProfile(await profileRes.json());
        if (lessonsRes.ok) {
          const data = await lessonsRes.json();
          setLessonPlans(data.lessonPlans || data || []);
        }
        if (assessmentsRes.ok) {
          const data = await assessmentsRes.json();
          setAssessments(data.assessments || data || []);
        }
      } catch {
        setError('Failed to load teacher data');
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
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Dashboard
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold gradient-text">Teacher Dashboard</h1>
        <p className="text-cyan-400 mt-1">Manage lesson plans, assessments, and homework</p>
      </div>

      {profile && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">Teacher Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-violet-400 uppercase tracking-wide">Name</p>
              <p className="text-sm font-medium text-cyan-400 mt-1">{profile.name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs text-violet-400 uppercase tracking-wide">Subjects</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(profile.subjects || []).map((s) => (
                  <span key={s} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-violet-400 uppercase tracking-wide">Lesson Plans</p>
              <p className="text-sm font-medium text-cyan-400 mt-1">{profile.totalLessonPlans}</p>
            </div>
            <div>
              <p className="text-xs text-violet-400 uppercase tracking-wide">Assessments</p>
              <p className="text-sm font-medium text-cyan-400 mt-1">{profile.totalAssessments}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/teacher/lessons" className="card-hover p-4 text-center">
            <div className="text-2xl mb-2">📝</div>
            <p className="text-sm font-medium text-cyan-400">Lesson Plan</p>
          </Link>
          <Link href="/teacher/assessments" className="card-hover p-4 text-center">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-sm font-medium text-cyan-400">Assessment</p>
          </Link>
          <Link href="/teacher/homework" className="card-hover p-4 text-center">
            <div className="text-2xl mb-2">📚</div>
            <p className="text-sm font-medium text-cyan-400">Homework</p>
          </Link>
          <Link href="/teacher/lessons" className="card-hover p-4 text-center">
            <div className="text-2xl mb-2">📋</div>
            <p className="text-sm font-medium text-cyan-400">Rubric</p>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-4">Recent Lesson Plans</h2>
          {lessonPlans.length === 0 ? (
            <p className="text-cyan-400 text-sm">No lesson plans yet</p>
          ) : (
            <div className="space-y-3">
              {lessonPlans.slice(0, 5).map((plan) => (
                <div key={plan.id} className="border border-white/10 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-cyan-400">{plan.topic}</p>
                      <p className="text-xs text-violet-400">{plan.subject} &middot; Grade {plan.grade}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(plan.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {lessonPlans.length > 0 && (
            <Link href="/teacher/lessons" className="block mt-3 text-sm text-blue-600 hover:text-blue-800">View all &rarr;</Link>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent mb-4">Recent Assessments</h2>
          {assessments.length === 0 ? (
            <p className="text-gray-500 text-sm">No assessments yet</p>
          ) : (
            <div className="space-y-3">
              {assessments.slice(0, 5).map((assess) => (
                <div key={assess.id} className="border border-white/10 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-100">{assess.topic}</p>
                      <p className="text-xs text-gray-500">{assess.subject} &middot; {assess.difficulty} &middot; {assess.questionCount} Qs</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(assess.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {assessments.length > 0 && (
            <Link href="/teacher/assessments" className="block mt-3 text-sm text-blue-600 hover:text-blue-800">View all &rarr;</Link>
          )}
        </div>
      </div>
    </div>
  );
}
