"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface AuditUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: AuditUser | null;
}

interface AuditData {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AppliedFilters {
  action: string;
  entityType: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
}

interface DetailPair {
  label: string;
  oldValue: string;
  newValue: string;
}

const PAGE_SIZE = 20;

const ACTION_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "LOGIN_SUCCESS", label: "Login Success" },
  { value: "LOGIN_FAILED", label: "Login Failed" },
  { value: "LOGOUT", label: "Logout" },
  { value: "ADMIN_ACTION", label: "Admin Action" },
  { value: "UNAUTHORIZED", label: "Unauthorized" },
];

const ENTITY_TYPE_OPTIONS = [
  { value: "", label: "All Entity Types" },
  { value: "user", label: "User" },
  { value: "university", label: "University" },
  { value: "scholarship", label: "Scholarship" },
  { value: "source", label: "Source" },
  { value: "fraud_rule", label: "Fraud Rule" },
  { value: "country", label: "Country" },
  { value: "visa_source", label: "Visa Source" },
  { value: "reporting_authority", label: "Reporting Authority" },
  { value: "database_backup", label: "Database Backup" },
];

const ACTION_BADGES: Record<string, string> = {
  CREATE: "bg-emerald-500/15 text-emerald-400",
  UPDATE: "bg-blue-500/15 text-blue-400",
  DELETE: "bg-red-500/15 text-red-400",
  LOGIN_FAILED: "bg-amber-500/15 text-amber-400",
  LOGIN_SUCCESS: "bg-emerald-500/15 text-emerald-400",
  LOGOUT: "bg-white/5 text-cyan-400",
  ADMIN_ACTION: "bg-purple-500/15 text-purple-400",
  UNAUTHORIZED: "bg-red-500/15 text-red-400 border border-red-500/20",
};

const EMPTY_FILTERS: AppliedFilters = { action: "", entityType: "", userId: "", dateFrom: "", dateTo: "" };

const inputClass =
  "rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent";

const selectClass =
  "rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 pr-8 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat";

function relativeTime(ts: string): string {
  const diffMs = Date.now() - new Date(ts).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(ts).toLocaleDateString();
}

function formatFullTime(ts: string): string {
  return new Date(ts).toLocaleString();
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value || "—";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function extractDetailPairs(details: Record<string, unknown> | null): DetailPair[] {
  if (!details) return [];
  const pairs: DetailPair[] = [];
  for (const key of Object.keys(details)) {
    if (!/^old/i.test(key)) continue;
    const newKey = key.replace(/^old/i, "new");
    if (!(newKey in details)) continue;
    const label = key.replace(/^old/i, "").trim();
    pairs.push({
      label: label ? label.charAt(0).toLowerCase() + label.slice(1) : "value",
      oldValue: stringifyValue(details[key]),
      newValue: stringifyValue(details[newKey]),
    });
  }
  return pairs;
}

function toDateParam(value: string, endOfDay: boolean): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (isNaN(date.getTime())) return undefined;
  if (endOfDay) date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join("");
}

function AuditCard({ log }: { log: AuditLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const pairs = extractDetailPairs(log.details);
  const reason =
    log.details && typeof log.details.reason === "string" ? log.details.reason : null;
  const hasDetails = Boolean(log.details && Object.keys(log.details).length > 0);
  const badgeClass = ACTION_BADGES[log.action] || "bg-white/5 text-cyan-400";

  return (
    <div className="card rounded-2xl border border-white/10 shadow-sm">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {log.user ? getInitials(log.user.name) : "SY"}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold gradient-text truncate">
                {log.user ? log.user.name : "System"}
                {log.user && (
                  <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-violet-400">
                    {log.user.role}
                  </span>
                )}
              </p>
              <p className="text-xs text-cyan-400 truncate">{log.user ? log.user.email : "no associated account"}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
              {log.action}
            </span>
            <span className="text-xs text-cyan-400" title={formatFullTime(log.createdAt)}>
              {relativeTime(log.createdAt)}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Entity</p>
            <p className="font-medium gradient-text">{log.entityType}</p>
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Entity ID / Name</p>
            <p className="font-mono text-xs text-cyan-400 truncate" title={log.entityId}>
              {(log.details && typeof log.details.entityName === "string"
                ? log.details.entityName
                : log.entityId) || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">IP Address</p>
            <p className="font-mono text-sm gradient-text">{log.ipAddress || "unknown"}</p>
          </div>
        </div>

        {reason && (
          <div className="mt-3 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-sm text-blue-400">
            <span className="font-semibold">Reason: </span>
            {reason}
          </div>
        )}

        {(pairs.length > 0 || hasDetails) && (
          <div className="mt-3">
            <button
              onClick={() => setExpanded(prev => !prev)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <svg
                className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              {expanded ? "Hide changes" : "View changes"}
            </button>

            {expanded && (
              <div className="mt-3 space-y-3 animate-fade-in">
                {pairs.length > 0 && (
                  <div className="overflow-hidden rounded-lg border border-white/10">
                    <table className="min-w-full divide-y divide-white/10">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent uppercase">Field</th>
                          <th className="px-4 py-2 text-left text-xs font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent uppercase">Old Value</th>
                          <th className="px-4 py-2 text-left text-xs font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent uppercase">New Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {pairs.map(pair => (
                          <tr key={pair.label}>
                            <td className="px-4 py-2 text-sm font-medium gradient-text">{pair.label}</td>
                            <td className="px-4 py-2 text-sm text-red-400 bg-red-500/10 break-all max-w-[240px]">
                              {pair.oldValue}
                            </td>
                            <td className="px-4 py-2 text-sm text-emerald-400 bg-emerald-500/10 break-all max-w-[240px]">
                              {pair.newValue}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Raw Details</p>
                  <pre className="max-h-56 overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminAuditPage() {
  const [data, setData] = useState<AuditData | null>(null);
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<AppliedFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<AppliedFilters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
      if (applied.action) params.set("action", applied.action);
      if (applied.entityType) params.set("entityType", applied.entityType);
      if (applied.userId.trim()) params.set("userId", applied.userId.trim());
      const from = toDateParam(applied.dateFrom, false);
      const to = toDateParam(applied.dateTo, true);
      if (from) params.set("dateFrom", from);
      if (to) params.set("dateTo", to);

      const res = await apiClient.get<ApiResponse<AuditData>>(`/api/admin/system/audit?${params.toString()}`);
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, applied]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const applyFilters = () => {
    setApplied(draft);
    setPage(1);
  };

  const resetFilters = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  };

  const exportLogs = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      filters: applied,
      total: data?.total ?? 0,
      logs: data?.logs ?? [],
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Audit Trail</h1>
          <p className="text-sm mt-2">Complete history of <span className="text-violet-400 font-medium">user actions</span> and <span className="text-cyan-400 font-medium">data changes</span></p>
        </div>
        <button
          onClick={exportLogs}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
        >
          Export
        </button>
      </div>

      <div className="card rounded-2xl border border-white/10 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select
            value={draft.action}
            onChange={e => setDraft(prev => ({ ...prev, action: e.target.value }))}
            className={selectClass}
          >
            {ACTION_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={draft.entityType}
            onChange={e => setDraft(prev => ({ ...prev, entityType: e.target.value }))}
            className={selectClass}
          >
            {ENTITY_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="User ID"
            value={draft.userId}
            onChange={e => setDraft(prev => ({ ...prev, userId: e.target.value }))}
            className={inputClass}
          />
          <label className="relative flex items-center">
            <span className="absolute left-3 text-xs font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent pointer-events-none">From</span>
            <input
              type="date"
              value={draft.dateFrom}
              onChange={e => setDraft(prev => ({ ...prev, dateFrom: e.target.value }))}
              className={`${inputClass} w-full pl-11`}
            />
          </label>
          <label className="relative flex items-center">
            <span className="absolute left-3 text-xs font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent pointer-events-none">To</span>
            <input
              type="date"
              value={draft.dateTo}
              onChange={e => setDraft(prev => ({ ...prev, dateTo: e.target.value }))}
              className={`${inputClass} w-full pl-8`}
            />
          </label>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={applyFilters}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="btn-secondary"
          >
            Reset
          </button>
          {data && (
            <span className="ml-auto text-sm gradient-text tabular-nums">
              {data.total.toLocaleString()} entries
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card rounded-2xl border border-white/10 shadow-sm p-6 space-y-4 skeleton">
              <div className="flex gap-3">
                <div className="h-10 w-10 skeleton rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 skeleton rounded w-1/4" />
                  <div className="h-3 skeleton rounded w-1/3" />
                </div>
              </div>
              <div className="h-3 skeleton rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : !data || data.logs.length === 0 ? (
        <div className="card rounded-2xl border border-white/10 shadow-sm p-12 text-center">
          <p className="text-violet-400">No audit log entries match the selected filters.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data.logs.map(log => (
              <AuditCard key={log.id} log={log} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="btn-secondary"
              >
                Prev
              </button>
              <span className="text-sm gradient-text tabular-nums">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
