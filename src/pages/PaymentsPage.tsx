/**
 * Payments Page
 * View transaction history and total amount paid
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext-supabase';
import { getClientJobs, JobPosting } from '../lib/jobs-supabase';
import ClientSidebar from '../components/ClientSidebar';
import { 
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  Briefcase,
  CheckCircle,
  Clock,
  Search
} from 'lucide-react';

interface Transaction {
  id: string;
  job_id: string;
  job_title: string;
  amount: number;
  service_fee: number;
  total_amount: number;
  status: 'pending' | 'completed' | 'refunded';
  date: string;
  freelancer_name?: string;
}

export default function PaymentsPage() {
  const { userProfile } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!userProfile) return;
    
    setLoading(true);
    try {
      const clientJobs = await getClientJobs(userProfile.uid);
      setJobs(clientJobs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate transactions from jobs
  const transactions: Transaction[] = jobs
    .filter(job => job.status === 'completed' || job.status === 'in-progress')
    .map(job => {
      const serviceFee = (job.budget || 0) * 0.1; // 10% service fee
      const totalAmount = (job.budget || 0) + serviceFee;
      
      return {
        id: job.id || '',
        job_id: job.id || '',
        job_title: job.title,
        amount: job.budget || 0,
        service_fee: serviceFee,
        total_amount: totalAmount,
        status: (job.status === 'completed' ? 'completed' : 'pending') as 'pending' | 'completed' | 'refunded',
        date: job.created_at,
        freelancer_name: job.selected_freelancer ? 'Freelancer' : undefined,
      };
    });

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.job_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalPaid: transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.total_amount, 0),
    pending: transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.total_amount, 0),
    projectAmount: transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    serviceFees: transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.service_fee, 0),
    transactionCount: transactions.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ClientSidebar userProfile={userProfile} />
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-72 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments</h1>
            <p className="text-gray-600">Track your spending and transaction history</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Paid */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <DollarSign size={24} />
                </div>
                <TrendingUp size={20} />
              </div>
              <h3 className="text-3xl font-bold mb-1">
                ${stats.totalPaid.toLocaleString()}
              </h3>
              <p className="text-purple-100 text-sm">Total Amount Paid</p>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                ${stats.pending.toLocaleString()}
              </h3>
              <p className="text-gray-600 text-sm">Pending Payments</p>
            </div>

            {/* Project Amount */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Briefcase className="text-blue-600" size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                ${stats.projectAmount.toLocaleString()}
              </h3>
              <p className="text-gray-600 text-sm">Project Amounts</p>
            </div>

            {/* Service Fees */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                ${stats.serviceFees.toLocaleString()}
              </h3>
              <p className="text-gray-600 text-sm">Service Fees (10%)</p>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center md:text-left">
                <div className="text-sm text-gray-600 mb-1">Total Transactions</div>
                <div className="text-2xl font-bold text-gray-900">{stats.transactionCount}</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-sm text-gray-600 mb-1">Average per Project</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${stats.transactionCount > 0 ? (stats.totalPaid / stats.transactionCount).toFixed(0) : 0}
                </div>
              </div>
              <div className="text-center md:text-left md:text-right">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto md:ml-auto">
                  <Download size={18} />
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4"></div>
                <p className="text-gray-500">Loading transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter' 
                    : 'Start posting jobs and hiring freelancers'}
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
                        Project Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Fee
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Paid
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{transaction.job_title}</div>
                          {transaction.freelancer_name && (
                            <div className="text-sm text-gray-600">Paid to: {transaction.freelancer_name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-gray-900">
                            <DollarSign size={16} className="text-gray-500" />
                            <span className="font-medium">{transaction.amount.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <DollarSign size={16} className="text-gray-400" />
                            <span>{transaction.service_fee.toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-gray-500">10% fee</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 font-semibold text-gray-900">
                            <DollarSign size={16} className="text-purple-600" />
                            <span>{transaction.total_amount.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {transaction.status === 'completed' && <CheckCircle size={14} />}
                            {transaction.status === 'pending' && <Clock size={14} />}
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(transaction.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
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
          {filteredTransactions.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
