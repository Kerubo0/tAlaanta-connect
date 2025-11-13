/**
 * Job Detail Page
 * View job details and apply (for freelancers) or manage (for clients)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext-supabase';
import { getJob, applyToJob, JobPosting } from '../lib/jobs-supabase';
import { 
  Briefcase, 
  DollarSign, 
  Clock, 
  MapPin, 
  Calendar,
  Users,
  CheckCircle,
  Loader2 
} from 'lucide-react';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const jobData = await getJob(id);
      setJob(jobData);
      
      if (jobData && userProfile) {
        setHasApplied(jobData.applicants?.includes(userProfile.uid) || false);
      }
    } catch (error) {
      console.error('Error loading job:', error);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!id || !userProfile || !job) return;

    setApplying(true);
    setError('');

    try {
      await applyToJob(id, userProfile.uid);
      setHasApplied(true);
      setJob({
        ...job,
        applicants: [...(job.applicants || []), userProfile.uid],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to apply to job');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-purple-600 hover:text-purple-700"
          >
            Return to dashboard
          </button>
        </div>
      </div>
    );
  }

  const isOwnJob = userProfile?.uid === job.clientId;
  const isFreelancer = userProfile?.role === 'freelancer';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  job.status === 'open' ? 'bg-green-100 text-green-700' :
                  job.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                  job.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {job.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {job.category}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={18} />
                <span>Posted by {job.clientName}</span>
                <span className="text-gray-400">•</span>
                <Calendar size={18} />
                <span>
                  {new Date(job.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Key Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-t border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <DollarSign size={18} />
                <span className="text-sm">Budget</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">${job.budget}</div>
              <div className="text-xs text-gray-500 capitalize">{job.jobType}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock size={18} />
                <span className="text-sm">Duration</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">{job.duration || 'N/A'}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Briefcase size={18} />
                <span className="text-sm">Experience</span>
              </div>
              <div className="text-lg font-semibold text-gray-900 capitalize">{job.experienceLevel}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Users size={18} />
                <span className="text-sm">Applicants</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">{job.applicants?.length || 0}</div>
            </div>
          </div>

          {/* Location */}
          {(job.location || job.remote) && (
            <div className="mt-6 flex items-center gap-2 text-gray-600">
              <MapPin size={18} />
              <span>
                {job.location || 'Remote'}
                {job.remote && job.location && ' (Remote available)'}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {job.description}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isFreelancer && !isOwnJob && job.status === 'open' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {hasApplied ? (
              <div className="flex items-center justify-center gap-3 py-4 text-green-600">
                <CheckCircle size={24} />
                <span className="text-lg font-medium">You have applied to this job</span>
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying}
                className="w-full bg-purple-600 text-white py-4 rounded-lg font-medium text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? 'Applying...' : 'Apply for this Job'}
              </button>
            )}
          </div>
        )}

        {isOwnJob && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Manage Job
            </h2>
            <p className="text-gray-600 mb-4">
              You have {job.applicants?.length || 0} applicant(s) for this job.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
