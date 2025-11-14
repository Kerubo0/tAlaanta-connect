/**
 * My Jobs Page
 * Comprehensive job management for clients
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext-supabase';
import { getClientJobs, JobPosting } from '../lib/jobs-supabase';
import { Link } from 'react-router-dom';
import ClientSidebar from '../components/ClientSidebar';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users,
  DollarSign,
  Search,
  Calendar,
  Eye
} from 'lucide-react';

export default function MyJobsPage() {
  const { userProfile } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'budget' | 'applicants'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
        return <Clock className="text-blue-600" size={18} />;
      case 'in-progress':
        return <Briefcase className="text-yellow-600" size={18} />;
      case 'completed':
        return <CheckCircle className="text-green-600" size={18} />;
      case 'cancelled':
        return <XCircle className="text-red-600" size={18} />;
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
  };

  // Filter and sort jobs
  let filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Sort jobs
  filteredJobs = [...filteredJobs].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        break;
      case 'budget':
        comparison = (b.budget || 0) - (a.budget || 0);
        break;
      case 'applicants':
        comparison = (b.applicants?.length || 0) - (a.applicants?.length || 0);
        break;
    }
    
    return sortOrder === 'desc' ? comparison : -comparison;
  });

  const toggleSort = (field: 'date' | 'budget' | 'applicants') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ClientSidebar userProfile={userProfile} />
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-72 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Jobs</h1>
            <p className="text-gray-600">Manage all your job postings in one place</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => setFilterStatus('all')}
              className={`p-4 rounded-xl border-2 transition-all ${
                filterStatus === 'all'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </button>

            <button
              onClick={() => setFilterStatus('open')}
              className={`p-4 rounded-xl border-2 transition-all ${
                filterStatus === 'open'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
              <div className="text-sm text-gray-600">Open</div>
            </button>

            <button
              onClick={() => setFilterStatus('in-progress')}
              className={`p-4 rounded-xl border-2 transition-all ${
                filterStatus === 'in-progress'
                  ? 'border-yellow-600 bg-yellow-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </button>

            <button
              onClick={() => setFilterStatus('completed')}
              className={`p-4 rounded-xl border-2 transition-all ${
                filterStatus === 'completed'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </button>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search jobs by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSort('date')}
                  className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                    sortBy === 'date'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Calendar size={16} />
                  Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>

                <button
                  onClick={() => toggleSort('budget')}
                  className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                    sortBy === 'budget'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign size={16} />
                  Budget {sortBy === 'budget' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>

                <button
                  onClick={() => toggleSort('applicants')}
                  className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                    sortBy === 'applicants'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users size={16} />
                  Apps {sortBy === 'applicants' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
              </div>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                    : 'Start by posting your first job'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Budget
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applicants
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posted
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0 mt-1">
                              {getStatusIcon(job.status)}
                            </div>
                            <div className="min-w-0">
                              <Link 
                                to={`/job/${job.id}`}
                                className="font-medium text-gray-900 hover:text-purple-600 line-clamp-1"
                              >
                                {job.title}
                              </Link>
                              <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                                {job.description}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {job.skills.slice(0, 2).map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                            {job.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 font-semibold text-gray-900">
                            <DollarSign size={16} className="text-gray-500" />
                            {job.budget}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Users size={16} className="text-gray-500" />
                            <span className="font-medium">{job.applicants?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(job.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/job/${job.id}`}
                              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </Link>
                            {job.applicants && job.applicants.length > 0 && (
                              <Link
                                to={`/job/${job.id}/applications`}
                                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium flex items-center gap-1"
                              >
                                <Users size={14} />
                                {job.applicants.length}
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Results Count */}
          {filteredJobs.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
