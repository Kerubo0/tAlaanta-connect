/**
 * Client Dashboard - Redesigned
 * Professional dashboard with sidebar, modern stats, and job management
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext-supabase';
import { getClientJobs, JobPosting } from '../lib/jobs-supabase';
import { Link } from 'react-router-dom';
import ClientSidebar from './ClientSidebar';
import { 
  Plus, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users,
  TrendingUp,
  DollarSign,
  Search,
  Eye
} from 'lucide-react';

export default function ClientDashboard() {
  const { userProfile } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    inProgress: jobs.filter(j => j.status === 'in-progress').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    totalBudget: jobs.reduce((sum, job) => sum + (job.budget || 0), 0),
    totalApplicants: jobs.reduce((sum, job) => sum + (job.applicants?.length || 0), 0),
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const recentJobs = filteredJobs.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ClientSidebar userProfile={userProfile} />
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-72 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {userProfile?.display_name}! 👋
            </h1>
            <p className="text-gray-600">Here's what's happening with your projects today</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Jobs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Briefcase className="text-purple-600" size={24} />
                </div>
                <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                  <TrendingUp size={16} />
                  {stats.total > 0 ? '+' + ((stats.completed / stats.total) * 100).toFixed(0) + '%' : '0%'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
              <p className="text-sm text-gray-600 mt-1">Total Jobs</p>
            </div>

            {/* Open Jobs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="text-blue-600" size={24} />
                </div>
                <span className="text-xs text-gray-500">Active</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.open}</h3>
              <p className="text-sm text-gray-600 mt-1">Open Positions</p>
            </div>

            {/* In Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Briefcase className="text-yellow-600" size={24} />
                </div>
                <span className="text-xs text-gray-500">Ongoing</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.inProgress}</h3>
              <p className="text-sm text-gray-600 mt-1">In Progress</p>
            </div>

            {/* Total Applicants */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="text-green-600" size={24} />
                </div>
                <span className="text-xs text-gray-500">All jobs</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalApplicants}</h3>
              <p className="text-sm text-gray-600 mt-1">Total Applicants</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              to="/post-job"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform">
                  <Plus size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Post New Job</h3>
                  <p className="text-sm text-purple-100">Find the perfect talent</p>
                </div>
              </div>
            </Link>

            <Link
              to="/client/my-jobs"
              className="bg-white border-2 border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <Briefcase className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">View All Jobs</h3>
                  <p className="text-sm text-gray-600">Manage your postings</p>
                </div>
              </div>
            </Link>

            <Link
              to="/client/payments"
              className="bg-white border-2 border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <DollarSign className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">Payments</h3>
                  <p className="text-sm text-gray-600">Transaction history</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Jobs Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Header with Search and Filter */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Jobs</h2>
                  <p className="text-sm text-gray-600 mt-1">Track and manage your job postings</p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Jobs List */}
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4"></div>
                <p className="text-gray-500">Loading your jobs...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-12 text-center">
                <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || filterStatus !== 'all' ? 'No jobs found' : 'No jobs posted yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter' 
                    : 'Start by posting your first job to find talented freelancers'}
                </p>
                {!searchQuery && filterStatus === 'all' && (
                  <Link
                    to="/post-job"
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    <Plus size={20} />
                    Post Your First Job
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentJobs.map((job) => (
                  <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Job Icon */}
                      <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0">
                        {getStatusIcon(job.status)}
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{job.description}</p>
                          </div>
                          
                          {/* Status Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(job.status)}`}>
                            {job.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{job.skills.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <DollarSign size={16} />
                            <span className="font-semibold text-gray-900">${job.budget}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={16} />
                            <span>{job.applicants?.length || 0} applicants</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>{new Date(job.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/job/${job.id}`}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
                          >
                            <Eye size={16} />
                            View Details
                          </Link>
                          
                          {job.applicants && job.applicants.length > 0 && (
                            <Link
                              to={`/job/${job.id}/applications`}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                              <Users size={16} />
                              View Applications ({job.applicants.length})
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View All Link */}
            {filteredJobs.length > 5 && (
              <div className="p-4 border-t border-gray-200 text-center">
                <Link
                  to="/client/my-jobs"
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  View all {filteredJobs.length} jobs →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
