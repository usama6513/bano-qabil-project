'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface Country {
  code: string;
  name: string;
  region: string;
  currency: string;
  language: string;
  scholarshipCount: number;
  universityCount: number;
  costOfLivingIndex: number;
  isPopular?: boolean;
}

const REGIONS = ['All', 'Asia', 'Europe', 'North America', 'Oceania', 'Middle East', 'Africa'];

function getFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return '\uD83C\uDF0D';
  const base = 0x1f1e6;
  const chars = code.toUpperCase().split('');
  return String.fromCodePoint(base + chars[0].charCodeAt(0) - 65, base + chars[1].charCodeAt(0) - 65);
}

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('All');
  const [popularOnly, setPopularOnly] = useState(false);

  const fetchCountries = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    const maxRetries = 2;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const res = q
          ? await apiClient.get<{ data: { countries: Country[] } }>(`/api/countries/search?q=${encodeURIComponent(q)}`)
          : await apiClient.get<{ data: Country[] }>('/api/countries');
        const countries = res.data && 'countries' in res.data ? res.data.countries : (Array.isArray(res.data) ? res.data : []);
        setCountries(countries || []);
        setLoading(false);
        return;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
        } else {
          setError(msg.includes('Authentication') ? 'Session expired. Please log in again.' : 'Failed to load countries. Please try again.');
          setCountries([]);
          setLoading(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCountries(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query, fetchCountries]);

  const visible = countries.filter(
    (c) =>
      (region === 'All' || c.region === region) &&
      (!popularOnly || c.isPopular)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <a href="/education" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Education Center
        </a>
        <h1 className="text-2xl font-bold text-gray-100">Country Intelligence</h1>
        <p className="text-gray-500 mt-1">Explore destinations for studying abroad</p>
      </div>

      <div className="card space-y-4">
        <input
          type="text"
          placeholder="Search countries..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field"
        />
        <div className="flex flex-wrap items-center gap-2">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                region === r ? 'bg-primary-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {r}
            </button>
          ))}
          <button
            onClick={() => setPopularOnly((p) => !p)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              popularOnly ? 'bg-accent-500 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            ★ Popular
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="h-6 skeleton rounded w-3/4" />
              <div className="h-4 skeleton rounded w-1/2" />
              <div className="h-4 skeleton rounded w-2/3" />
              <div className="h-4 skeleton rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="card text-center py-12">
          <span className="text-4xl">️</span>
          <p className="text-gray-400 mt-3">{error}</p>
          <button
            onClick={() => fetchCountries(query.trim())}
            className="mt-4 px-6 py-2 rounded-xl font-medium text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all"
          >
            Retry
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl">🌍</span>
          <p className="text-gray-500 mt-3">No countries found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">{visible.length} countries found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((c) => (
              <Link key={c.code} href={`/countries/${c.code}`} className="card-hover block">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden>{getFlagEmoji(c.code)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-100">{c.name}</h3>
                      <p className="text-xs text-gray-500">{c.region}</p>
                    </div>
                  </div>
                  {c.isPopular && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">Popular</span>
                  )}
                </div>
                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Currency</dt>
                    <dd className="text-gray-300 font-medium">{c.currency}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Language</dt>
                    <dd className="text-gray-300 font-medium">{c.language}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Universities</dt>
                    <dd className="text-blue-400 font-semibold">{c.universityCount ?? 0}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Scholarships</dt>
                    <dd className="text-primary-600 font-semibold">{c.scholarshipCount ?? 0}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Cost of Living</dt>
                    <dd className="text-gray-300 font-medium">{c.costOfLivingIndex != null ? `${c.costOfLivingIndex}/100` : 'N/A'}</dd>
                  </div>
                </dl>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
