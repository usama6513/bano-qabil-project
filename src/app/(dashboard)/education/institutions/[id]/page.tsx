'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { VerificationBadge } from '@/components/ui/verification-badge';

interface InstitutionCourse {
  name: string;
  duration: string;
  description: string;
  fee: string;
  certification: string;
  batchStart: string;
}

interface InstitutionEntryTest {
  testName: string;
  type: string;
  totalMarks: number;
  passingMarks: number;
  passingPercentage: string;
  syllabus: string;
  preparationTips: string;
}

interface InstitutionDocument {
  documentName: string;
  description: string;
  isRequired: boolean;
}

interface Institution {
  id: string;
  name: string;
  type: string;
  description: string;
  website: string;
  location: string;
  province: string;
  campuses: string | null;
  totalCampuses: number | null;
  contactEmail: string;
  contactPhone: string;
  eligibilityCriteria: string;
  applicationProcess: string;
  verificationStatus: string;
  courses: InstitutionCourse[];
  entryTests: InstitutionEntryTest[];
  documents: InstitutionDocument[];
}

const typeLabels: Record<string, string> = {
  govt: 'Government',
  ngo: 'NGO',
  private: 'Private',
  international: 'International',
};

export default function InstitutionDetailPage() {
  const params = useParams();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchInstitution() {
      try {
        const res = await apiClient.get<{ data: Institution }>(`/api/education/institutions/${params.id}`);
        setInstitution(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load institution');
      } finally {
        setLoading(false);
      }
    }
    fetchInstitution();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="card animate-pulse space-y-3">
          <div className="h-6 skeleton rounded w-3/4" />
          <div className="h-4 skeleton rounded w-1/2" />
          <div className="h-4 skeleton rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="card bg-red-500/10 border-red-200">
        <p className="text-sm text-red-700">{error || 'Institution not found'}</p>
        <Link href="/education/institutions" className="text-sm text-primary-600 hover:underline mt-2 inline-block">Back to Institutions</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/education/institutions" className="text-sm text-primary-600 hover:underline">&larr; Back to Institutions</Link>

      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">{institution.name}</h1>
            {institution.location && <p className="text-gray-400 mt-1">{institution.location}</p>}
          </div>
          <VerificationBadge status={institution.verificationStatus === 'verified' ? 'verified' : 'unverified'} />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full">
            {typeLabels[institution.type] || institution.type}
          </span>
          {institution.province && institution.province !== 'all' && (
            <span className="text-xs bg-white/5 text-gray-400 px-3 py-1 rounded-full capitalize">{institution.province}</span>
          )}
          {institution.province === 'all' && (
            <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full">All Pakistan</span>
          )}
          {institution.totalCampuses && institution.totalCampuses > 1 && (
            <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full">📍 {institution.totalCampuses} campuses</span>
          )}
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-gray-100 mb-2">About This Institution</h2>
          <p className="text-gray-300 leading-relaxed">{institution.description}</p>
        </div>

        {institution.campuses && (() => {
          try {
            const campusData = JSON.parse(institution.campuses);
            return (
              <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                <h3 className="text-sm font-semibold text-amber-400 mb-2">📍 Campus Network</h3>
                {campusData.summary && <p className="text-xs text-gray-400 mb-2">{campusData.summary}</p>}
                {campusData.byProvince && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Object.entries(campusData.byProvince).map(([prov, count]) => (
                      <span key={prov} className="text-xs bg-white/5 text-gray-300 px-2 py-0.5 rounded-full">{prov}: {String(count)}</span>
                    ))}
                  </div>
                )}
                {campusData.majorCities && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {campusData.majorCities.slice(0, 10).map((city: string, i: number) => (
                      <span key={i} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">{city}</span>
                    ))}
                    {campusData.majorCities.length > 10 && (
                      <span className="text-xs text-gray-500">+{campusData.majorCities.length - 10} more</span>
                    )}
                  </div>
                )}
                {campusData.karachiCampuses && (
                  <details className="mt-2">
                    <summary className="text-xs text-cyan-400 cursor-pointer hover:text-cyan-300">View {campusData.karachiCampuses.length} Karachi campuses</summary>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {campusData.karachiCampuses.map((c: string, i: number) => (
                        <span key={i} className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  </details>
                )}
                {campusData.majorCenters && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {campusData.majorCenters.slice(0, 12).map((c: string, i: number) => (
                      <span key={i} className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                )}
                {campusData.programs && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {campusData.programs.map((p: string, i: number) => (
                      <span key={i} className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                  </div>
                )}
                {campusData.platform && (
                  <p className="text-xs text-cyan-400 mt-2">Platform: {campusData.platform}</p>
                )}
              </div>
            );
          } catch {
            return null;
          }
        })()}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {institution.contactEmail && (
            <div>
              <span className="text-xs text-gray-500">Email</span>
              <p className="text-sm text-gray-100">{institution.contactEmail}</p>
            </div>
          )}
          {institution.contactPhone && (
            <div>
              <span className="text-xs text-gray-500">Phone</span>
              <p className="text-sm text-gray-100">{institution.contactPhone}</p>
            </div>
          )}
        </div>
      </div>

      {institution.eligibilityCriteria && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">Eligibility Criteria</h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-line">{institution.eligibilityCriteria}</div>
        </div>
      )}

      {institution.courses.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Courses Available ({institution.courses.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {institution.courses.map((course, i) => (
              <div key={i} className="border border-white/10 rounded-lg p-4">
                <h3 className="font-semibold text-gray-100">{course.name}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-blue-500/10 text-blue-700 px-2 py-0.5 rounded-full">{course.duration}</span>
                  <span className="text-xs bg-emerald-500/10 text-green-700 px-2 py-0.5 rounded-full">{course.fee}</span>
                  {course.batchStart && (
                    <span className="text-xs bg-purple-500/10 text-purple-700 px-2 py-0.5 rounded-full">Starts: {course.batchStart}</span>
                  )}
                </div>
                {course.description && (
                  <p className="text-sm text-gray-400 mt-2">{course.description}</p>
                )}
                {course.certification && (
                  <p className="text-xs text-gray-500 mt-1">Certification: {course.certification}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {institution.entryTests.length > 0 && institution.entryTests[0].type !== 'none' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Entry Test Details</h2>
          {institution.entryTests.map((test, i) => (
            <div key={i} className="space-y-3">
              <h3 className="font-medium text-gray-100">{test.testName}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-gray-500">Type</span>
                  <p className="text-sm font-medium text-gray-100 capitalize">{test.type}</p>
                </div>
                {test.totalMarks && (
                  <div>
                    <span className="text-xs text-gray-500">Total Marks</span>
                    <p className="text-sm font-medium text-gray-100">{test.totalMarks}</p>
                  </div>
                )}
                {test.passingMarks && (
                  <div>
                    <span className="text-xs text-gray-500">Passing Marks</span>
                    <p className="text-sm font-medium text-green-700">{test.passingMarks}</p>
                  </div>
                )}
                {test.passingPercentage && (
                  <div>
                    <span className="text-xs text-gray-500">Passing %</span>
                    <p className="text-sm font-medium text-green-700">{test.passingPercentage}</p>
                  </div>
                )}
              </div>
              {test.syllabus && (
                <div>
                  <span className="text-xs text-gray-500">Syllabus</span>
                  <p className="text-sm text-gray-300 mt-1">{test.syllabus}</p>
                </div>
              )}
              {test.preparationTips && (
                <div className="bg-amber-500/10 border border-amber-200 rounded-lg p-3">
                  <span className="text-xs font-medium text-amber-700">Preparation Tips</span>
                  <p className="text-sm text-amber-800 mt-1">{test.preparationTips}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {institution.documents.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">Required Documents</h2>
          <div className="space-y-2">
            {institution.documents.map((d, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${d.isRequired ? 'bg-red-500' : 'bg-[#475569]'}`} />
                <div>
                  <span className="font-medium text-gray-100">{d.documentName}</span>
                  {d.description && <span className="text-gray-400 ml-1">— {d.description}</span>}
                  {!d.isRequired && <span className="text-xs text-gray-500 ml-1">(Optional)</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {institution.applicationProcess && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">How to Apply</h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-line">{institution.applicationProcess}</div>
        </div>
      )}

      {institution.website && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-100 mb-2">Official Website</h2>
          <a href={institution.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
            {institution.website}
          </a>
        </div>
      )}
    </div>
  );
}
