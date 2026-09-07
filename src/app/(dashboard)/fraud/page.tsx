'use client';

import Link from 'next/link';
import { useState } from 'react';
import DepartmentChat from '@/components/department-chat/DepartmentChat';

const tools = [
  { title: 'Check SMS/Text', description: <>Analyze <span className="text-red-400">suspicious text messages</span> for scam patterns and phishing attempts</>, href: '/fraud/check-text', icon: '💬', query: '' },
  { title: 'Check Phone Number', description: <><span className="text-cyan-400">Scan a phone number</span> for network, region, and fraud indicators</>, href: '/fraud/check-phone', icon: '📱', query: '' },
  { title: 'Check URL', description: <><span className="text-emerald-400">Scan a URL</span> to determine if it is a phishing or malicious link</>, href: '/fraud/check-url', icon: '🔗', query: '' },
  { title: 'Scan Document', description: <>Upload a PDF, DOCX, or <span className="text-amber-400">text file</span> to check for fraud indicators</>, href: '/fraud/check-document', icon: '📄', query: '' },
  { title: 'Scan Screenshot', description: <>Upload a <span className="text-violet-400">screenshot image</span> for visual fraud analysis</>, href: '/fraud/check-document', icon: '🖼️', query: '?type=image' },
  { title: 'Check Email', description: <>Paste a <span className="text-indigo-400">suspicious email</span> to detect phishing and social engineering</>, href: '/fraud/check-text', icon: '📧', query: '?type=email' },
  { title: 'Previous Checks', description: <>View your <span className="text-teal-400">scan history</span> and past fraud detection results</>, href: '/fraud/history', icon: '📋', query: '' },
  { title: 'Report & Authorities', description: <>Find <span className="text-rose-400">cybercrime authorities</span> and guidance on reporting fraud</>, href: '/fraud/reporting', icon: '🏛️', query: '' },
  { title: 'Scam Trends', description: <>View current <span className="text-yellow-400">scam trends</span>, statistics, and prevention tips</>, href: '/fraud/trends', icon: '📊', query: '' },
  { title: 'All Scam Types', description: <>Browse <span className="text-cyan-400">all 44 scam types</span> — check what evidence & documents are needed</>, href: '/fraud/scam-types', icon: '📚', query: '' },
];

const cardColors = [
  { gradient: 'from-red-500 via-rose-500 to-pink-500', glow: 'rgba(239,68,68,0.15)' },
  { gradient: 'from-blue-500 via-cyan-500 to-teal-500', glow: 'rgba(59,130,246,0.15)' },
  { gradient: 'from-emerald-500 via-green-500 to-lime-500', glow: 'rgba(16,185,129,0.15)' },
  { gradient: 'from-amber-500 via-orange-500 to-red-500', glow: 'rgba(245,158,11,0.15)' },
  { gradient: 'from-violet-500 via-purple-500 to-fuchsia-500', glow: 'rgba(139,92,246,0.15)' },
  { gradient: 'from-indigo-500 via-blue-500 to-cyan-500', glow: 'rgba(99,102,241,0.15)' },
  { gradient: 'from-teal-500 via-emerald-500 to-green-500', glow: 'rgba(20,184,166,0.15)' },
  { gradient: 'from-rose-500 via-pink-500 to-fuchsia-500', glow: 'rgba(244,63,94,0.15)' },
  { gradient: 'from-yellow-500 via-amber-500 to-orange-500', glow: 'rgba(234,179,8,0.15)' },
];

export default function FraudPage() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
        <h1 className="text-3xl font-bold gradient-text">Fraud Detection & Cyber Safety</h1>
        <p className="text-sm mt-2">Protect yourself from <span className="text-red-400 font-medium">scams</span>, <span className="text-amber-400 font-medium">phishing</span>, and <span className="text-orange-400 font-medium">online fraud</span></p>
        </div>
        <button onClick={() => setShowChat(!showChat)}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${showChat ? 'btn-danger' : 'btn-rainbow'}`}>
          {showChat ? 'Close Chat' : '💬 Ask FraudGuard AI'}
        </button>
      </div>

      {showChat ? (
        <DepartmentChat
          department="fraud"
          title="FraudGuard AI"
          subtitle="Fraud detection & cyber safety expert"
          avatar="🛡️"
          avatarColor="bg-gradient-to-br from-red-500 to-orange-500 text-white"
          freshStart
          suggestions={[
            'Mujhe ek SMS aya hai, check karwana hai',
            'Ye link safe hai? https://example.com',
            'JazzCash scam kya hai?',
            'NCCIA me complaint kaise karoon?',
            '*#21# code kya karta hai?',
            'Job scam se kaise bachen?',
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, i) => {
            const c = cardColors[i % cardColors.length];
            return (
              <Link key={tool.title} href={`${tool.href}${tool.query}`}
                className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl animate-slide-up"
                style={{ animationDelay: `${i * 60}ms`, background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${c.glow}, transparent)` }} />
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  {tool.icon}
                </div>
                <h2 className={`text-lg font-semibold mt-3 transition-all duration-500 bg-gradient-to-r ${c.gradient} bg-clip-text text-transparent group-hover:scale-[1.02] origin-left`}>{tool.title}</h2>
                <p className="text-sm mt-1 transition-colors">{tool.description}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
