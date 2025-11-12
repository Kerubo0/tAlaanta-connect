/**
 * Freelancer Dashboard
 * View available jobs, applications, and profile
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOpenJobs, getAppliedJobs, JobPosting } from '../lib/jobs';
import { Link } from 'react-router-dom';
import { Search, Briefcase, Clock, DollarSign, MapPin } from 'lucide-react';

export default function FreelancerDashboard() {
  const { userProfile } = useAuth();
  const [availableJobs, setAvailableJobs] = useState<JobPosting[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'applied'>('available');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    if (!userProfile) return;
    
    setLoading(true);
    try {
      const [available, applied] = await Promise.all([
        getOpenJobs(),
        getAppliedJobs(userProfile.uid),
      ]);
      setAvailableJobs(available);
      setAppliedJobs(applied);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const JobCard = ({ job }: { job: JobPosting }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.slice(0, 4).map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
          >
            {skill}
          </span>
        ))}
        {job.skills.length > 4 && (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            +{job.skills.length - 4} more
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <DollarSign size={16} />
          <span className="font-medium">${job.budget}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={16} />
          <span>{job.duration}</span>
        </div>
        <div className="flex items-center gap-1">
          <Briefcase size={16} />
          <span className="capitalize">{job.experienceLevel}</span>
        </div>
        {job.location && (
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>{job.location}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Posted by <span className="font-medium">{job.clientName}</span>
        </div>
        <Link
          to={`/job/${job.id}`}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );

  const stats = {
    available: availableJobs.length,
    applied: appliedJobs.length,
    matches: availableJobs.filter(job => 
      userProfile?.skills?.some(skill => job.skills.includes(skill))
    ).length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userProfile?.displayName}!
        </h1>
        <p className="text-gray-600 mt-2">Find your next opportunity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Available Jobs</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.available}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Applied</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">{stats.applied}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Matching Your Skills</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{stats.matches}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-8">
            <button
              onClick={() => setActiveTab('available')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'available'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Available Jobs ({stats.available})
            </button>
            <button
              onClick={() => setActiveTab('applied')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'applied'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Applications ({stats.applied})
            </button>
          </nav>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading jobs...</div>
      ) : activeTab === 'available' ? (
        availableJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Search className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs available</h3>
            <p className="text-gray-600">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availableJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )
      ) : (
        appliedJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600">Start applying to jobs to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {appliedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
