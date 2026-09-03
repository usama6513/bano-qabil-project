'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { VerificationBadge } from '@/components/ui/verification-badge';

interface InstitutionCourse {
  name: string;
  duration: string;
  fee: string;
}

interface InstitutionEntryTest {
  testName: string;
  type: string;
  totalMarks: number;
  passingMarks: number;
  passingPercentage: string;
}

interface Institution {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  province: string;
  totalCampuses: number | null;
  verificationStatus: string;
  courses: InstitutionCourse[];
  entryTests: InstitutionEntryTest[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const typeLabels: Record<string, string> = {
  govt: 'Government',
  ngo: 'NGO',
  private: 'Private',
  international: 'International',
};

const typeColors: Record<string, string> = {
  govt: 'bg-blue-500/10 text-blue-400',
  ngo: 'bg-purple-500/10 text-purple-400',
  private: 'bg-orange-500/10 text-orange-400',
  international: 'bg-cyan-500/10 text-cyan-400',
};

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('');
  const [province, setProvince] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const requestIdRef = useRef(0);

  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    setError('');
    const reqId = ++requestIdRef.current;
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (type) params.set('type', type);
      if (province) params.set('province', province);
      params.set('page', String(page));
      params.set('limit', '20');
      const res = await apiClient.get<{ data: { institutions: Institution[]; pagination: Pagination } }>(`/api/education/institutions?${params}`);
      if (reqId !== requestIdRef.current) return;
      setInstitutions(res.data.institutions);
      setPagination(res.data.pagination);
    } catch (err) {
      if (reqId !== requestIdRef.current) return;
      setInstitutions([]);
      setError(err instanceof Error ? err.message : 'Failed to load institutions');
    } finally {
      if (reqId === requestIdRef.current) setLoading(false);
    }
  }, [keyword, type, province, page]);

  useEffect(() => { fetchInstitutions(); }, [fetchInstitutions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href="/education" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Education Center
        </Link>
        <h1 className="text-2xl font-bold gradient-text">Free Course Institutions</h1>
        <p className="text-cyan-400 mt-1">Find government and NGO institutions offering free courses across Pakistan</p>
      </div>

      <form onSubmit={handleSearch} className="card space-y-4">
        <input
          type="text"
          placeholder="Search institutions (e.g. NAVTTC, Saylani, IT training...)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="input-field"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Types</option>
            <option value="govt">Government</option>
            <option value="ngo">NGO</option>
            <option value="private">Private</option>
            <option value="international">International</option>
          </select>
          <select value={province} onChange={(e) => { setProvince(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Provinces</option>
            <option value="all">All Pakistan</option>
            <option value="punjab">Punjab</option>
            <option value="sindh">Sindh</option>
            <option value="kpk">KPK</option>
            <option value="balochistan">Balochistan</option>
          </select>
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {error && (
        <div className="card bg-red-500/10 border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="h-5 skeleton rounded w-3/4" />
              <div className="h-4 skeleton rounded w-1/2" />
              <div className="h-4 skeleton rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : institutions.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-cyan-400">No institutions found. Try adjusting your search filters.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-violet-400">{pagination.total} institutions found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {institutions.map((inst) => (
              <Link key={inst.id} href={`/education/institutions/${inst.id}`} className="card-hover">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{inst.name}</h3>
                  <VerificationBadge status={inst.verificationStatus === 'verified' ? 'verified' : 'unverified'} compact />
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[inst.type] || 'bg-white/5 text-cyan-400'}`}>
                    {typeLabels[inst.type] || inst.type}
                  </span>
                  {inst.province && inst.province !== 'all' && (
                    <span className="text-xs bg-white/5 text-cyan-400 px-2 py-0.5 rounded-full capitalize">{inst.province}</span>
                  )}
                  {inst.province === 'all' && (
                    <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">All Pakistan</span>
                  )}
                  {inst.totalCampuses && inst.totalCampuses > 1 && (
                    <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">📍 {inst.totalCampuses} campuses</span>
                  )}
                </div>
                {inst.courses.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-violet-400">{inst.courses.length} courses available</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {inst.courses.slice(0, 3).map((c, i) => (
                        <span key={i} className="text-xs bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-full">{c.name}</span>
                      ))}
                      {inst.courses.length > 3 && (
                        <span className="text-xs text-violet-400">+{inst.courses.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
                {inst.entryTests.length > 0 && inst.entryTests[0].type !== 'none' && (
                  <div className="mt-2">
                    <span className="text-xs bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-full">
                      Entry Test: {inst.entryTests[0].passingPercentage} passing
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary text-sm disabled:opacity-40">Prev</button>
              <span className="text-sm text-cyan-400">Page {page} of {pagination.totalPages}</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
