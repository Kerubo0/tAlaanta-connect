import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Contract, Job } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Briefcase, 
  Star, 
  TrendingUp, 
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Users,
  Target,
  Award,
  Activity,
  ArrowUpRight,
  MoreVertical,
  FileText,
  MessageSquare,
  Eye
} from 'lucide-react';

export function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    activeContracts: 0,
    completedJobs: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      loadDashboardData();
    }
  }, [isConnected, address]);

  const loadDashboardData = async () => {
    if (!address || !db) return;

    try {
      // Load contracts
      const contractsRef = collection(db, 'contracts');
      const contractsQuery = query(
        contractsRef,
        where('freelancerAddress', '==', address)
      );
      const contractsSnapshot = await getDocs(contractsQuery);
      const contractsData: Contract[] = [];
      contractsSnapshot.forEach((doc) => {
        contractsData.push({ id: doc.id, ...doc.data() } as Contract);
      });
      setContracts(contractsData);

      // Load jobs posted by user
      const jobsRef = collection(db, 'jobs');
      const jobsQuery = query(jobsRef, where('clientAddress', '==', address));
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobsData: Job[] = [];
      jobsSnapshot.forEach((doc) => {
        jobsData.push({ id: doc.id, ...doc.data() } as Job);
      });
      setJobs(jobsData);

      // Calculate stats
      const totalEarned = contractsData
        .filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + c.totalAmount, 0);

      setStats({
        totalEarned,
        activeContracts: contractsData.filter(c => c.status === 'active').length,
        completedJobs: contractsData.filter(c => c.status === 'completed').length,
        averageRating: 4.8,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Wallet className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
                Connect Your Wallet
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Please connect your wallet to view your dashboard and manage your contracts.
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <Wallet className="mr-2 h-5 w-5" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview - 4 Gradient Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white relative overflow-hidden hover:scale-105 transition-transform animate-fade-in-up">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-100">Total Earned</CardTitle>
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stats.totalEarned.toFixed(4)} ETH</div>
              <div className="flex items-center gap-1 text-green-100 text-xs">
                <ArrowUpRight className="h-3 w-3" />
                <span>+12.5% this month</span>
              </div>
            </CardContent>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10"></div>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white relative overflow-hidden hover:scale-105 transition-transform animate-fade-in-up delay-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-100">Active Contracts</CardTitle>
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Briefcase className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stats.activeContracts}</div>
              <div className="flex items-center gap-1 text-blue-100 text-xs">
                <Activity className="h-3 w-3" />
                <span>In progress</span>
              </div>
            </CardContent>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10"></div>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white relative overflow-hidden hover:scale-105 transition-transform animate-fade-in-up delay-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-100">Completed Jobs</CardTitle>
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stats.completedJobs}</div>
              <div className="flex items-center gap-1 text-purple-100 text-xs">
                <TrendingUp className="h-3 w-3" />
                <span>100% success rate</span>
              </div>
            </CardContent>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10"></div>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-500 to-orange-600 text-white relative overflow-hidden hover:scale-105 transition-transform animate-fade-in-up delay-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-yellow-100">Average Rating</CardTitle>
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Star className="h-5 w-5 fill-current" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stats.averageRating.toFixed(1)}</div>
              <div className="flex items-center gap-1 text-yellow-100 text-xs">
                <span>⭐⭐⭐⭐⭐</span>
              </div>
            </CardContent>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10"></div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="contracts" className="space-y-6">
          <TabsList className="bg-white border-0 shadow-lg p-1">
            <TabsTrigger 
              value="contracts" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              My Contracts ({contracts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="jobs"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Posted Jobs ({jobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contracts">
            {contracts.length === 0 ? (
              <Card className="border-0 shadow-xl">
                <CardContent className="py-16 text-center">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No contracts yet</h3>
                  <p className="text-gray-600 mb-6">Start applying to jobs to see your contracts here.</p>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Browse Jobs
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {contracts.map((contract, index) => (
                  <Card 
                    key={contract.id} 
                    className="border-0 shadow-lg hover:shadow-xl transition-all animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{contract.title}</CardTitle>
                            <Badge className={`${getStatusColor(contract.status)} border flex items-center gap-1`}>
                              {getStatusIcon(contract.status)}
                              <span className="capitalize">{contract.status}</span>
                            </Badge>
                          </div>
                          <CardDescription className="text-base">{contract.description}</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="font-bold text-lg">{contract.totalAmount} ETH</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Target className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Milestones</p>
                            <p className="font-bold text-lg">
                              {contract.milestones.filter(m => m.status === 'paid').length} / {contract.milestones.length}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Started</p>
                            <p className="font-bold text-lg">
                              {new Date(contract.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message Client
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="jobs">
            {jobs.length === 0 ? (
              <Card className="border-0 shadow-xl">
                <CardContent className="py-16 text-center">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No jobs posted yet</h3>
                  <p className="text-gray-600 mb-6">Create your first job posting to get started.</p>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Post a Job
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobs.map((job, index) => (
                  <Card 
                    key={job.id} 
                    className="border-0 shadow-lg hover:shadow-xl transition-all animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{job.title}</CardTitle>
                            <Badge className={`${getStatusColor(job.status)} border`}>
                              {job.status}
                            </Badge>
                          </div>
                          <CardDescription className="text-base">{job.description}</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Budget</p>
                            <p className="font-bold text-lg">{job.budget} ETH</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Proposals</p>
                            <p className="font-bold text-lg">{job.proposals || 0}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Award className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Category</p>
                            <p className="font-bold text-sm">{job.category}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View Proposals
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <FileText className="h-4 w-4 mr-2" />
                          Edit Job
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
