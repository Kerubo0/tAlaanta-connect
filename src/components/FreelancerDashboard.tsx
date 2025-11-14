/**
 * Freelancer Dashboard - Enhanced Version
 * Complete dashboard with earnings, jobs, payments, and actions
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext-supabase';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  TrendingUp, 
  Briefcase, 
  Clock, 
  DollarSign,
  AlertCircle,
  Download,
  Eye,
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  FileText,
  CreditCard,
  Calendar,
  Star
} from 'lucide-react';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  budget: number;
  skills: string[];
  status: string;
  created_at: string;
  client_name: string;
  payment_status?: string;
  escrow_status?: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  job_title: string;
  type: string;
}

interface Earnings {
  total: number;
  thisMonth: number;
  pending: number;
  available: number;
}

export default function FreelancerDashboard() {
  const { userProfile } = useAuth();
  const [activeJobs, setActiveJobs] = useState<JobPosting[]>([]);
  const [completedJobs, setCompletedJobs] = useState<JobPosting[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [earnings, setEarnings] = useState<Earnings>({
    total: 0,
    thisMonth: 0,
    pending: 0,
    available: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'payments'>('overview');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [userProfile]);

  const loadDashboardData = async () => {
    if (!userProfile) return;
    
    setLoading(true);
    try {
      // Load active jobs (where freelancer is assigned)
      const { data: activeJobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('freelancer_id', userProfile.uid)
        .in('status', ['in_progress', 'assigned'])
        .order('created_at', { ascending: false });

      // Load completed jobs
      const { data: completedJobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('freelancer_id', userProfile.uid)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      // Load payment history
      const { data: paymentsData } = await supabase
        .from('transactions')
        .select('*, jobs(title)')
        .eq('recipient_id', userProfile.uid)
        .order('created_at', { ascending: false })
        .limit(20);

      // Calculate earnings
      const { data: earningsData } = await supabase
        .from('transactions')
        .select('amount, status, created_at')
        .eq('recipient_id', userProfile.uid);

      if (earningsData) {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const calculated = {
          total: earningsData
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0),
          thisMonth: earningsData
            .filter(t => {
              const date = new Date(t.created_at);
              return t.status === 'completed' && 
                     date.getMonth() === thisMonth && 
                     date.getFullYear() === thisYear;
            })
            .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0),
          pending: earningsData
            .filter(t => t.status === 'pending')
            .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0),
          available: earningsData
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)
        };
        setEarnings(calculated);
      }

      setActiveJobs(activeJobsData || []);
      setCompletedJobs(completedJobsData || []);
      setPayments(paymentsData?.map(p => ({
        id: p.id,
        amount: parseFloat(p.amount || '0'),
        status: p.status,
        created_at: p.created_at,
        job_title: p.jobs?.title || 'Unknown Job',
        type: p.transaction_type
      })) || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const WithdrawModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Withdraw Funds</h3>
          <button 
            onClick={() => setShowWithdrawModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle size={24} />
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
          <div className="text-sm text-gray-600 mb-2">Available Balance</div>
          <div className="text-4xl font-bold text-gray-900">${earnings.available.toFixed(2)}</div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                max={earnings.available}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>Bank Transfer</option>
              <option>Cryptocurrency</option>
              <option>M-Pesa</option>
            </select>
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium">
            Withdraw Funds
          </button>
        </div>
      </div>
    </div>
  );

  const ComplaintModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">File a Complaint</h3>
          <button 
            onClick={() => setShowComplaintModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Job
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">Select a job</option>
              {activeJobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complaint Type
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>Payment Issue</option>
              <option>Scope Change</option>
              <option>Communication Problem</option>
              <option>Contract Violation</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={6}
              placeholder="Please describe your complaint in detail..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
              <Download className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-600">Click to upload files or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG up to 10MB</p>
            </div>
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all font-medium">
            Submit Complaint
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Welcome back, {userProfile?.display_name}! 👋
              </h1>
              <p className="text-gray-600 mt-2">Here's your freelance journey overview</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Wallet size={20} />
                Withdraw
              </button>
              <button
                onClick={() => setShowComplaintModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
              >
                <AlertCircle size={20} />
                File Complaint
              </button>
            </div>
          </div>
        </div>

        {/* Earnings Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                <ArrowUpRight size={14} />
                +12.5%
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Earnings</div>
            <div className="text-3xl font-bold text-gray-900">${earnings.total.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-2">All time</div>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                <ArrowUpRight size={14} />
                +8.3%
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-1">This Month</div>
            <div className="text-3xl font-bold text-gray-900">${earnings.thisMonth.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-2">November 2025</div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Pending Release</div>
            <div className="text-3xl font-bold text-gray-900">${earnings.pending.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-2">In escrow</div>
          </div>

          {/* Available */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                <Wallet className="text-green-600" size={24} />
              </div>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="text-xs font-semibold text-green-600 hover:text-green-700"
              >
                Withdraw →
              </button>
            </div>
            <div className="text-sm text-gray-600 mb-1">Available Balance</div>
            <div className="text-3xl font-bold text-green-600">${earnings.available.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-2">Ready to withdraw</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-2 inline-flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'jobs'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Jobs ({activeJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'payments'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Payment History
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Jobs */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="text-purple-600" size={24} />
                  Active Jobs
                </h2>
                <Link to="/jobs" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  View All →
                </Link>
              </div>

              <div className="space-y-4">
                {activeJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">No active jobs yet</p>
                    <Link to="/jobs" className="text-purple-600 hover:text-purple-700 font-medium mt-2 inline-block">
                      Browse Available Jobs →
                    </Link>
                  </div>
                ) : (
                  activeJobs.slice(0, 5).map(job => (
                    <div key={job.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-1">{job.description}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          {job.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <DollarSign size={16} />
                            ${job.budget}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {new Date(job.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <Link 
                          to={`/job/${job.id}`}
                          className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats & Actions */}
            <div className="space-y-6">
              {/* Performance */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="text-yellow-500" size={20} />
                  Performance
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-sm font-bold text-gray-900">98%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Jobs Completed</span>
                      <span className="text-sm font-bold text-gray-900">{completedJobs.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Client Rating</span>
                      <span className="text-sm font-bold text-gray-900">4.9/5.0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all text-left">
                    <Search className="text-purple-600" size={20} />
                    <span className="font-medium text-gray-900">Browse Jobs</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all text-left">
                    <FileText className="text-blue-600" size={20} />
                    <span className="font-medium text-gray-900">View Contracts</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-all text-left">
                    <CreditCard className="text-green-600" size={20} />
                    <span className="font-medium text-gray-900">Payment Methods</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Jobs</h2>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter size={18} />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Search size={18} />
                  Search
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...activeJobs, ...completedJobs].map(job => (
                <div key={job.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : job.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills?.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1 font-medium">
                        <DollarSign size={16} />
                        ${job.budget}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <Link 
                      to={`/job/${job.id}`}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={18} />
                Export
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900">Date</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900">Job</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900">Type</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900">Amount</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500">
                        <CreditCard className="mx-auto text-gray-300 mb-3" size={48} />
                        <p>No payment history yet</p>
                      </td>
                    </tr>
                  ) : (
                    payments.map(payment => (
                      <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">
                          {payment.job_title}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {payment.type}
                        </td>
                        <td className="py-4 px-4 text-sm font-bold text-gray-900">
                          ${payment.amount.toFixed(2)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {payment.status === 'completed' && <CheckCircle size={14} />}
                            {payment.status === 'pending' && <Clock size={14} />}
                            {payment.status === 'failed' && <XCircle size={14} />}
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1">
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showWithdrawModal && <WithdrawModal />}
      {showComplaintModal && <ComplaintModal />}
    </div>
  );
}
