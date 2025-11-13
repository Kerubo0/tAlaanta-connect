/**
 * Client Dashboard
 * Post jobs, manage applications
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext-supabase';
import { getClientJobs, JobPosting } from '../lib/jobs-supabase';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function ClientDashboard() {
  const { userProfile } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    if (!userProfile) return;
    
    setLoading(true);
    try {
      const clientJobs = await getClientJobs(userProfile.uid);
      setJobs(clientJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="text-blue-600" size={20} />;
      case 'in-progress':
        return <Briefcase className="text-yellow-600" size={20} />;
      case 'completed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'cancelled':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return null;
    }
  };

  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    inProgress: jobs.filter(j => j.status === 'in-progress').length,
    completed: jobs.filter(j => j.status === 'completed').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userProfile?.displayName}!
        </h1>
        <p className="text-gray-600 mt-2">Manage your job postings and find the best talent</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Jobs</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Open</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{stats.open}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">In Progress</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">{stats.inProgress}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-8">
        <Link
          to="/post-job"
          className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          Post a New Job
        </Link>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Your Job Postings</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
            <p className="text-gray-600 mb-6">Start by posting your first job</p>
            <Link
              to="/post-job"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              <Plus size={20} />
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {jobs.map((job) => (
              <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(job.status)}
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <span className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full capitalize">
                        {job.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>💰 ${job.budget}</span>
                      <span>📊 {job.applicants?.length || 0} applicants</span>
                      <span>📅 {new Date(job.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link
                    to={`/job/${job.id}`}
                    className="ml-4 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
