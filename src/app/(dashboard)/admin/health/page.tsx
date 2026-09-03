"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PerformanceData {
  capturedAt: string;
  responseTime: { avg: number; p95: number; p99: number };
  errorRate: number;
  requestTotals: { total: number; avgDurationMs: number; errorRate: number; byStatus: Record<string, number> };
  aiMetrics: { total: number; avgDurationMs: number; successRate: number };
  uptimeMs: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
  dbConnections: number;
}

interface OverviewData {
  generatedAt: string;
  system: {
    uptimeMs: number;
    nodeEnv: string;
    dbEngine: { name: string; description: string };
    dbSize: string;
    memoryUsageMB: number;
  };
}

type HealthStatus = "healthy" | "degraded" | "critical";

const STATUS_STYLES: Record<HealthStatus, { badge: string; dot: string; label: string }> = {
  healthy: { badge: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", dot: "bg-emerald-400", label: "Healthy" },
  degraded: { badge: "bg-amber-500/20 text-amber-400 border border-amber-500/30", dot: "bg-amber-400", label: "Degraded" },
  critical: { badge: "bg-red-500/20 text-red-400 border border-red-500/30", dot: "bg-red-400", label: "Critical" },
};

function formatUptime(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  return `${days}d ${hours}h ${minutes}m`;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function getHealthStatus(errorRate: number, memPercent: number): HealthStatus {
  if (errorRate > 5 || memPercent > 90) return "critical";
  if (errorRate > 2 || memPercent > 75) return "degraded";
  return "healthy";
}

function ProgressBar({ percent, barColor, height = "h-3" }: { percent: number; barColor: string; height?: string }) {
  return (
    <div className={`w-full rounded-full overflow-hidden ${height}`} style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
      <div className={`${height} rounded-full transition-all duration-700 ease-out ${barColor}`} style={{ width: `${clampPercent(percent)}%` }} />
    </div>
  );
}

export default function AdminHealthPage() {
  const [perf, setPerf] = useState<PerformanceData | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    setError("");
    try {
      const [perfRes, overviewRes] = await Promise.all([
        apiClient.get<ApiResponse<PerformanceData>>("/api/admin/system/performance"),
        apiClient.get<ApiResponse<OverviewData>>("/api/admin/system/overview"),
      ]);
      setPerf(perfRes.data);
      setOverview(overviewRes.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load system health");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-10 w-72 skeleton rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl border border-white/10 shadow-sm p-6 space-y-4 animate-pulse" style={{ background: 'rgba(15, 23, 42, 0.9)' }}>
              <div className="h-4 skeleton rounded w-1/2" />
              <div className="h-10 skeleton rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !perf || !overview) {
    return (
      <div className="animate-fade-in">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4">{error || "No data available."}</div>
        <button onClick={fetchHealth} className="mt-4 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-blue-600 transition-all">
          Retry
        </button>
      </div>
    );
  }

  const mem = perf.memoryUsage;
  // On serverless (Vercel), heap is misleading — use RSS for real memory pressure
  const SERVERLESS_MEM_LIMIT_MB = 1024;
  const memPercent = mem.rssMB > 0 ? Math.min((mem.rssMB / SERVERLESS_MEM_LIMIT_MB) * 100, 100) : 0;
  const status = getHealthStatus(perf.errorRate, memPercent);
  const statusStyle = STATUS_STYLES[status];
  const nodeEnv = overview.system.nodeEnv.toLowerCase();
  const isProduction = nodeEnv === "production";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold gradient-text">System Health</h1>
          <p className="text-sm mt-2">Live <span className="text-emerald-400 font-medium">runtime</span>, <span className="text-cyan-400 font-medium">memory</span> and <span className="text-violet-400 font-medium">API performance</span> monitoring</p>
        </div>
        <div className="text-right">
          <button onClick={fetchHealth} className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
            Refresh now
          </button>
          <p className="mt-1.5 text-xs text-cyan-400">Auto-refreshes every 10s{lastUpdated ? ` · updated ${lastUpdated.toLocaleTimeString()}` : ""}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm">
          Last refresh failed: {error}
        </div>
      )}

      {/* System Status + Memory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl overflow-hidden animate-slide-up" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)', animationDelay: '50ms' }}>
          <div className="px-6 py-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${statusStyle.dot}`} />
            <p className="text-xs font-medium uppercase tracking-widest bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">System Status</p>
            <span className={`ml-auto inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle.badge}`}>
              {statusStyle.label}
            </span>
          </div>
          <div className="p-6">
            <p className="text-xs uppercase tracking-widest bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Uptime</p>
            <p className="mt-2 text-5xl font-bold gradient-text tabular-nums">{formatUptime(perf.uptimeMs)}</p>
            <p className="mt-4 text-xs text-cyan-400">Snapshot taken {new Date(perf.capturedAt).toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden animate-slide-up" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)', animationDelay: '100ms' }}>
          <div className="px-6 py-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
            <h2 className="text-base font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Memory Usage</h2>
            <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${memPercent > 90 ? "bg-red-500/20 text-red-400 border border-red-500/30" : memPercent > 75 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}>
              {clampPercent(memPercent).toFixed(1)}%
            </span>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Heap (V8)</span>
                <span className="text-sm font-semibold gradient-text tabular-nums">{mem.heapUsedMB.toFixed(1)} MB / {mem.heapTotalMB.toFixed(1)} MB</span>
              </div>
              <ProgressBar percent={mem.heapTotalMB > 0 ? (mem.heapUsedMB / mem.heapTotalMB) * 100 : 0} barColor="bg-gradient-to-r from-blue-500 to-indigo-500" height="h-2" />
              <p className="mt-1 text-xs text-cyan-400">V8 managed heap — auto-reclaimed by garbage collector</p>
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">RSS (total process)</span>
                <span className={`text-sm font-semibold tabular-nums ${memPercent > 90 ? 'text-red-400' : memPercent > 75 ? 'text-amber-400' : 'gradient-text'}`}>{mem.rssMB.toFixed(1)} MB / {SERVERLESS_MEM_LIMIT_MB} MB</span>
              </div>
              <ProgressBar percent={memPercent} barColor={memPercent > 90 ? "bg-gradient-to-r from-red-500 to-pink-500" : memPercent > 75 ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-emerald-500 to-teal-500"} height="h-3.5" />
              <p className="mt-1 text-xs text-cyan-400">Actual memory usage ({memPercent.toFixed(1)}% of {SERVERLESS_MEM_LIMIT_MB} MB serverless limit)</p>
            </div>
          </div>
        </div>
      </div>

      {/* API Performance + DB/Env */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl overflow-hidden animate-slide-up" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)', animationDelay: '150ms' }}>
          <div className="px-6 py-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
            <h2 className="text-base font-semibold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">API Performance</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Avg', value: perf.responseTime.avg, unit: 'ms', gradient: 'from-blue-500 to-cyan-500' },
                { label: 'P95', value: perf.responseTime.p95, unit: 'ms', gradient: 'from-indigo-500 to-blue-500' },
                { label: 'P99', value: perf.responseTime.p99, unit: 'ms', gradient: 'from-violet-500 to-purple-500' },
                { label: 'Error Rate', value: perf.errorRate, unit: '%', gradient: perf.errorRate > 5 ? 'from-red-500 to-pink-500' : perf.errorRate > 2 ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-teal-500', colored: true },
              ].map((m) => (
                <div key={m.label} className="rounded-xl p-4 relative overflow-hidden" style={{ background: 'rgba(11, 17, 32, 0.5)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${m.gradient}`} />
                  <p className="text-xs bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wide">{m.label}</p>
                  <p className={`mt-1 text-2xl font-bold tabular-nums ${m.colored ? (perf.errorRate > 5 ? 'text-red-400' : perf.errorRate > 2 ? 'text-amber-400' : 'text-emerald-400') : 'gradient-text'}`}>
                    {typeof m.value === 'number' ? m.value.toFixed(2) : m.value}<span className="text-sm font-medium text-violet-400">{m.unit}</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-cyan-400">
              <span>{perf.requestTotals.total.toLocaleString()} requests tracked</span>
              {perf.requestTotals.byStatus && (
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(perf.requestTotals.byStatus).slice(0, 5).map(([code, count]) => (
                    <span key={code} className={`rounded-full px-2 py-0.5 text-xs font-medium ${code.startsWith("2") ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : code.startsWith("4") ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" : "bg-red-500/15 text-red-400 border border-red-500/20"}`}>
                      {code}: {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 border-t border-white/10 pt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'rgba(11, 17, 32, 0.5)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <span className="text-xs font-semibold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">AI Calls</span>
                <span className="font-semibold gradient-text tabular-nums">{perf.aiMetrics.total.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl px-4 py-3 relative overflow-hidden" style={{ background: 'rgba(11, 17, 32, 0.5)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <span className="text-xs font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">AI Success</span>
                <span className="font-semibold text-emerald-400 tabular-nums">{(perf.aiMetrics.successRate * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl overflow-hidden animate-slide-up" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)', animationDelay: '200ms' }}>
            <div className="px-6 py-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
              <h2 className="text-base font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Database</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: 'rgba(11, 17, 32, 0.5)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <p className="text-xs bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent uppercase tracking-wide">Engine</p>
                <p className="mt-1 text-lg font-semibold gradient-text">{overview.system.dbEngine?.name || 'PostgreSQL'}</p>
                <p className="text-xs text-cyan-400">{overview.system.dbEngine?.description || 'relational database'}</p>
              </div>
              <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: 'rgba(11, 17, 32, 0.5)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500" />
                <p className="text-xs bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent uppercase tracking-wide">File Size</p>
                <p className="mt-1 text-lg font-semibold gradient-text tabular-nums">{overview.system.dbSize}</p>
              </div>
              <div className="rounded-xl p-4 sm:col-span-2 flex items-center justify-between relative overflow-hidden" style={{ background: 'rgba(11, 17, 32, 0.5)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <div>
                  <p className="text-xs bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent uppercase tracking-wide">Connection Status</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-400 inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected
                  </p>
                </div>
                <span className="rounded-full px-3 py-1 text-xs font-medium text-cyan-400 tabular-nums border border-white/10">
                  ~{perf.dbConnections} active handle{perf.dbConnections === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden animate-slide-up" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)', animationDelay: '250ms' }}>
            <div className="px-6 py-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
              <h2 className="text-base font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Node Environment</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${isProduction ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}>
                  <span className={`h-2 w-2 rounded-full ${isProduction ? "bg-emerald-400" : "bg-amber-400"}`} />
                  {nodeEnv}
                </span>
                <span className={`text-xs font-medium ${isProduction ? "text-emerald-400" : "text-amber-400"}`}>
                  {isProduction ? "Production build" : "Development mode — expect verbose logging"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
