/**
 * Job Applications Page
 * View and manage applications for a specific job (Client only)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext-supabase';
import { getJob, JobPosting } from '../lib/jobs-supabase';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ArrowLeft,
  Mail,
  Award,
  DollarSign,
  Calendar
} from 'lucide-react';

interface ApplicantProfile {
  uid: string;
  display_name: string;
  email: string;
  bio?: string;
  skills?: string[];
  hourly_rate?: number;
  portfolio?: string;
  created_at: string;
}

interface ApplicationWithProfile extends ApplicantProfile {
  status: 'pending' | 'approved' | 'rejected';
}

export default function JobApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [applications, setApplications] = useState<ApplicationWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadJobAndApplications();
  }, [id]);

  const loadJobAndApplications = async () => {
    if (!id || !userProfile) return;

    setLoading(true);
    setError('');

    try {
      // Get job details
      const jobData = await getJob(id);
      
      if (!jobData) {
        setError('Job not found');
        return;
      }

      // Check if current user is the job owner
      if (jobData.client_id !== userProfile.uid) {
        setError('You do not have permission to view these applications');
        return;
      }

      setJob(jobData);

      // Get applicant profiles
      if (jobData.applicants && jobData.applicants.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from('users')
          .select('*')
          .in('uid', jobData.applicants);

        if (profileError) throw profileError;

        // Add status to each profile
        const applicationsWithStatus: ApplicationWithProfile[] = (profiles || []).map(profile => ({
          ...profile,
          status: jobData.selected_freelancer === profile.uid ? 'approved' : 'pending'
        }));

        setApplications(applicationsWithStatus);
      }
    } catch (err: any) {
      console.error('Error loading applications:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicantId: string) => {
    if (!id || !job) return;

    setProcessing(applicantId);
    setError('');

    try {
      // Update job to set selected_freelancer and change status
      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          selected_freelancer: applicantId,
          status: 'in-progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update local state
      setApplications(prev => prev.map(app => ({
        ...app,
        status: app.uid === applicantId ? 'approved' : app.status
      })));

      setJob(prev => prev ? {
        ...prev,
        selected_freelancer: applicantId,
        status: 'in-progress'
      } : null);

      // TODO: Send notification to approved freelancer
      alert('Freelancer approved! They have been notified.');
    } catch (err: any) {
      setError(err.message || 'Failed to approve application');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (applicantId: string) => {
    if (!id || !job) return;

    setProcessing(applicantId);
    setError('');

    try {
      // Remove from applicants array
      const updatedApplicants = job.applicants?.filter(uid => uid !== applicantId) || [];

      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          applicants: updatedApplicants,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update local state
      setApplications(prev => prev.filter(app => app.uid !== applicantId));
      setJob(prev => prev ? {
        ...prev,
        applicants: updatedApplicants
      } : null);

      // TODO: Send notification to rejected freelancer
    } catch (err: any) {
      setError(err.message || 'Failed to reject application');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="mx-auto text-red-600 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <p className="text-gray-600">Manage applications for this job</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                <Users size={20} />
                <span className="font-medium">{applications.length} Applicants</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <DollarSign size={16} />
                <span className="font-medium">${job.budget}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{new Date(job.created_at).toLocaleDateString()}</span>
              </div>
              <div className="px-3 py-1 bg-gray-100 rounded-full capitalize">
                {job.status}
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600">
              When freelancers apply to your job, they will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.uid}
                className={`bg-white rounded-lg shadow-lg p-6 ${
                  application.status === 'approved' ? 'border-2 border-green-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {application.display_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {application.display_name}
                        </h3>
                        {application.status === 'approved' && (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle size={16} />
                            <span className="font-medium">Approved</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Mail size={16} />
                        <a href={`mailto:${application.email}`} className="hover:text-purple-600">
                          {application.email}
                        </a>
                      </div>
                      {application.hourly_rate && (
                        <div className="flex items-center gap-1">
                          <DollarSign size={16} />
                          <span>${application.hourly_rate}/hr</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>Joined {new Date(application.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {application.bio && (
                      <p className="text-gray-700 mb-3">{application.bio}</p>
                    )}

                    {application.skills && application.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {application.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {application.portfolio && (
                      <a
                        href={application.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm"
                      >
                        <Award size={16} />
                        View Portfolio
                      </a>
                    )}
                  </div>

                  {application.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(application.uid)}
                        disabled={processing === application.uid}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === application.uid ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          <CheckCircle size={20} />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(application.uid)}
                        disabled={processing === application.uid}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle size={20} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
