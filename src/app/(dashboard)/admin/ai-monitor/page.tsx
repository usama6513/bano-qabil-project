"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface OverviewData {
  generatedAt: string;
  conversations: { total: number; today: number; thisWeek: number };
  messages: { total: number; today: number };
  aiUsage: { totalConversations: number; avgMessagesPerConversation: number };
}

interface PerformanceData {
  capturedAt: string;
  responseTime: { avg: number; p95: number; p99: number };
  errorRate: number;
  requestTotals: { total: number; avgDurationMs: number; errorRate: number };
  aiMetrics: { total: number; avgDurationMs: number; successRate: number };
}

const AI_MODEL = {
  id: "openai/gpt-oss-20b",
  provider: "Groq",
};

const COST = {
  tokensPerMessage: 600,
  inputShare: 0.7,
  inputRatePerMillion: 0.1,
  outputRatePerMillion: 0.5,
};

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

type Tone = "good" | "warn" | "info";

interface Recommendation {
  tone: Tone;
  title: string;
  body: string;
}

function Panel({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-sm ${className}`}
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-cyan-400">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function UsageTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-medium uppercase tracking-wider bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">{label}</p>
      <p className="mt-1 text-3xl font-bold gradient-text tabular-nums">{value}</p>
      {sub ? <p className="mt-1 text-[11px] text-cyan-400">{sub}</p> : null}
    </div>
  );
}

function MetricRow({
  label,
  value,
  accent = "gradient-text",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${accent}`}>{value}</span>
    </div>
  );
}

function SuccessGauge({ rate, total }: { rate: number; total: number }) {
  const hasData = total > 0;
  const pct = hasData ? clamp(rate * 100) : 0;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);
  const color = !hasData ? "#94a3b8" : pct >= 95 ? "#34d399" : pct >= 80 ? "#fbbf24" : "#fb7185";
  const label = !hasData ? "No data" : pct >= 95 ? "Excellent" : pct >= 80 ? "Needs attention" : "Degraded";

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums gradient-text">{hasData ? `${pct.toFixed(1)}%` : "—"}</span>
          <span className="text-xs bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{hasData ? "success" : "tracked"}</span>
        </div>
      </div>
      <div className="space-y-3">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
          {label}
        </span>
        <p className="max-w-xs text-xs leading-relaxed text-cyan-400">
          {hasData ? (
            <>Based on tracked AI request outcomes. Values above <span className="text-cyan-400">95%</span> indicate <span className="text-emerald-400">healthy</span> prompt handling and stable provider connectivity.</>
          ) : (
            <>No AI calls have been tracked yet. Start using the AI assistant to see success rate metrics here.</>
          )}
        </p>
      </div>
    </div>
  );
}

export default function AiMonitorPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [perf, setPerf] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [overviewRes, perfRes] = await Promise.all([
        apiClient.get<ApiResponse<OverviewData>>("/api/admin/system/overview"),
        apiClient.get<ApiResponse<PerformanceData>>("/api/admin/system/performance"),
      ]);
      setOverview(overviewRes.data);
      setPerf(perfRes.data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load AI monitor data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return (
      <div className="-m-6 min-h-screen p-6 text-gray-100 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="skeleton h-9 w-72" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl skeleton" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-2xl skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!overview || !perf) {
    return (
      <div className="-m-6 flex min-h-screen items-center justify-center p-6 text-gray-100 md:p-8">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold gradient-text">Unable to load AI monitor</h1>
          <p className="mt-1 text-sm text-red-400">{error || "No data available."}</p>
          <button
            onClick={() => {
              setLoading(true);
              loadData();
            }}
            className="btn-primary mt-6 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { aiMetrics } = perf;
  const totalTokens = overview.messages.total * COST.tokensPerMessage;
  const inputTokens = totalTokens * COST.inputShare;
  const outputTokens = totalTokens * (1 - COST.inputShare);
  const lifetimeCost =
    (inputTokens / 1_000_000) * COST.inputRatePerMillion +
    (outputTokens / 1_000_000) * COST.outputRatePerMillion;
  const projectedMonthlyTokens = overview.messages.today * 30 * COST.tokensPerMessage;
  const projectedMonthlyCost =
    ((projectedMonthlyTokens * COST.inputShare) / 1_000_000) * COST.inputRatePerMillion +
    ((projectedMonthlyTokens * (1 - COST.inputShare)) / 1_000_000) * COST.outputRatePerMillion;

  const recommendations: Recommendation[] = [];
  if (perf.errorRate > 2) {
    recommendations.push({
      tone: "warn",
      title: "Elevated error rate detected",
      body: `Overall API error rate is ${perf.errorRate.toFixed(2)}%. Check provider quotas and network stability before scaling AI traffic.`,
    });
  }
  if (aiMetrics.successRate < 0.95 && aiMetrics.total > 0) {
    recommendations.push({
      tone: "warn",
      title: "Review failing AI calls",
      body: `AI success rate is ${(aiMetrics.successRate * 100).toFixed(1)}%. Inspect rejected prompts and add retry or fallback handling.`,
    });
  }
  if (overview.aiUsage.avgMessagesPerConversation > 12) {
    recommendations.push({
      tone: "info",
      title: "Long conversation threads",
      body: `Averaging ${overview.aiUsage.avgMessagesPerConversation} messages per conversation. Summarizing older turns would reduce token spend per reply.`,
    });
  }
  if (perf.responseTime.avg > 2000) {
    recommendations.push({
      tone: "warn",
      title: "Latency above target",
      body: `Average response time is ${formatNumber(perf.responseTime.avg)}ms. Consider streaming responses or shorter system prompts.`,
    });
  }
  if (overview.conversations.total > 0 && overview.conversations.today === 0) {
    recommendations.push({
      tone: "info",
      title: "No conversations started today",
      body: "Engagement dipped today. Surface the assistant more prominently in the student dashboard.",
    });
  }
  if (recommendations.length === 0) {
    recommendations.push({
      tone: "good",
      title: "AI usage looks healthy",
      body: "Success rate, latency and error rates are all within normal bounds. Keep monitoring trends as usage grows.",
    });
  }
  if (overview.conversations.thisWeek >= 100) {
    recommendations.push({
      tone: "info",
      title: "Consider response caching",
      body: `${formatNumber(overview.conversations.thisWeek)} conversations were started this week. Caching frequent questions can cut provider costs noticeably.`,
    });
  }

  const toneStyles: Record<Tone, { border: string; badge: string }> = {
    good: { border: "border-emerald-500/30 bg-emerald-500/10", badge: "bg-emerald-500/15 text-emerald-400" },
    warn: { border: "border-amber-500/30 bg-amber-500/10", badge: "bg-amber-500/15 text-amber-400" },
    info: { border: "border-sky-500/30 bg-sky-500/10", badge: "bg-sky-500/15 text-sky-400" },
  };

  return (
    <div className="-m-6 min-h-screen p-6 text-gray-100 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight gradient-text">AI Monitor</h1>
<p className="mt-1 text-sm text-cyan-400">
              Usage, quality and cost signals for the EduGuard assistant
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Live · refreshes every 30s
            </span>
            <button onClick={loadData} className="btn-ghost text-sm">
              Refresh now
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            Last refresh failed: {error} · showing cached data
          </div>
        ) : null}

        <Panel title="AI Usage Overview" subtitle="Lifetime assistant activity across all users">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <UsageTile
              label="Total Conversations"
              value={formatNumber(overview.aiUsage.totalConversations)}
              sub={`${formatNumber(overview.conversations.thisWeek)} started this week`}
            />
            <UsageTile
              label="Avg Messages / Conversation"
              value={String(overview.aiUsage.avgMessagesPerConversation)}
              sub="across all non-deleted chats"
            />
            <UsageTile
              label="Total Messages"
              value={formatNumber(overview.messages.total)}
              sub={`${formatNumber(overview.messages.today)} sent today`}
            />
          </div>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="AI Model Info" subtitle="Static configuration served by the backend">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wider bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Model</span>
                <code className="rounded-md bg-violet-500/10 px-2.5 py-1 text-sm font-semibold text-violet-400">
                  {AI_MODEL.id}
                </code>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Provider</span>
                <span className="rounded-md bg-cyan-500/10 px-2.5 py-1 text-sm font-semibold text-cyan-400">
                  {AI_MODEL.provider}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">AI Calls Tracked</p>
                  <p className="mt-1 text-xl font-bold tabular-nums gradient-text">
                    {formatNumber(aiMetrics.total)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Avg AI Latency</p>
                  <p className="mt-1 text-xl font-bold tabular-nums gradient-text">
                    {formatNumber(Math.round(aiMetrics.avgDurationMs))}
                    <span className="text-sm font-medium text-violet-400">ms</span>
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Request Metrics" subtitle={`Snapshot taken ${new Date(perf.capturedAt).toLocaleTimeString()}`}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <UsageTile label="Total Requests" value={formatNumber(perf.requestTotals.total)} />
              <UsageTile
                label="Avg Response Time"
                value={`${formatNumber(perf.responseTime.avg)}ms`}
                sub={`P95 ${formatNumber(perf.responseTime.p95)}ms`}
              />
              <UsageTile
                label="Error Rate"
                value={`${perf.errorRate.toFixed(2)}%`}
                sub={perf.errorRate > 2 ? "above healthy threshold" : "within normal range"}
              />
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  perf.errorRate > 5 ? "bg-rose-500" : perf.errorRate > 2 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${clamp(perf.errorRate * 10)}%` }}
              />
            </div>
            <p className="mt-2 text-right text-[11px] text-cyan-400">
              Bar scaled ×10 for visibility · target &lt; 2% errors
            </p>
          </Panel>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="AI Quality Indicators" subtitle="Success rate of tracked model calls">
            <SuccessGauge rate={aiMetrics.successRate} total={aiMetrics.total} />
          </Panel>

          <Panel title="Recent AI Activity" subtitle="Today vs weekly momentum">
            <div className="space-y-3">
              <MetricRow label="Conversations started today" value={formatNumber(overview.conversations.today)} />
              <MetricRow label="Messages exchanged today" value={formatNumber(overview.messages.today)} />
              <MetricRow label="Conversations this week" value={formatNumber(overview.conversations.thisWeek)} />
              <MetricRow
                label="Avg messages / conversation"
                value={String(overview.aiUsage.avgMessagesPerConversation)}
              />
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Activity stream
              </span>
              <span className="text-xs text-cyan-400">
                Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
              </span>
            </div>
          </Panel>
        </div>

        <Panel
          title="Cost Estimate"
          subtitle="Informational projection — assumes ~600 tokens per message at Groq list rates"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <UsageTile
              label="Est. Tokens Processed"
              value={`${formatNumber(Math.round(totalTokens / 1000))}k`}
              sub={`${Math.round(COST.inputShare * 100)}% input / ${Math.round((1 - COST.inputShare) * 100)}% output`}
            />
            <UsageTile
              label="Est. Lifetime Spend"
              value={formatCurrency(lifetimeCost)}
              sub="all recorded messages"
            />
            <UsageTile
              label="Projected Monthly Spend"
              value={formatCurrency(projectedMonthlyCost)}
              sub="today's volume × 30 days"
            />
            <UsageTile
              label="Avg Cost / Conversation"
              value={
                overview.aiUsage.totalConversations > 0
                  ? formatCurrency(lifetimeCost / overview.aiUsage.totalConversations)
                  : "$0.00"
              }
              sub="lifetime spend ÷ conversations"
            />
          </div>
          <p className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs leading-relaxed text-cyan-400">
            <span className="text-amber-400">Estimates only.</span> Actual billing depends on provider pricing, prompt caching discounts and
            per-request token variance. Figures are <span className="text-emerald-400">derived locally</span> from message counts and <span className="text-cyan-400">never sent anywhere</span>.
          </p>
        </Panel>

        <Panel title="System Recommendations" subtitle="Auto-generated from current AI usage patterns">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {recommendations.map((rec) => (
              <div key={rec.title} className={`rounded-xl border p-4 ${toneStyles[rec.tone].border}`}>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                    toneStyles[rec.tone].badge
                  }`}
                >
                  {rec.tone === "good" ? "Healthy" : rec.tone === "warn" ? "Action needed" : "Optimization"}
                </span>
                <p className="mt-2 text-sm font-semibold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">{rec.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-cyan-400">{rec.body}</p>
              </div>
            ))}
          </div>
        </Panel>

        {lastUpdated ? (
          <p className="text-right text-[11px] text-cyan-400">
            Last refreshed {lastUpdated.toLocaleTimeString()} · overview generated{" "}
            {new Date(overview.generatedAt).toLocaleTimeString()}
          </p>
        ) : null}
      </div>
    </div>
  );
}
