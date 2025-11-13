import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
// TODO: Migrate to Supabase
// import { collection, query, where, getDocs } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
import { Job } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { matchJobToFreelancer } from '@/lib/ai';
import { JobCardSkeleton } from '@/components/SkeletonLoader';
import { 
  Search, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Briefcase,
  MapPin,
  Users,
  Calendar,
  Filter,
  Star,
  Award,
  Zap,
  Eye,
  Heart,
  Share2,
  Sparkles,
  Target
} from 'lucide-react';

// AI Match Badge Component
function AIMatchBadge({ job, userSkills }: { job: Job; userSkills: string[] }) {
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Don't auto-calculate - wait for user interaction
  const calculateMatch = async () => {
    if (isCalculating || hasCalculated) return;
    setIsCalculating(true);
    setHasCalculated(true);
    
    try {
      const result = await matchJobToFreelancer(
        job.description,
        job.skills || [],
        userSkills,
        '', // Bio can be added later
        '' // Experience can be added later
      );
      setMatchScore(result.score);
    } catch (error) {
      console.error('Match calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  if (!hasCalculated) {
    return (
      <Badge 
        className="bg-purple-100 text-purple-700 border-purple-300 cursor-pointer hover:bg-purple-200 transition-colors"
        onClick={calculateMatch}
      >
        <Sparkles className="h-3 w-3 mr-1" />
        Calculate AI Match
      </Badge>
    );
  }

  if (isCalculating) {
    return (
      <Badge className="bg-purple-100 text-purple-700 border-purple-300 animate-pulse">
        <Sparkles className="h-3 w-3 mr-1 animate-spin" />
        Calculating...
      </Badge>
    );
  }

  if (matchScore === null) return null;

  const getScoreColor = () => {
    if (matchScore >= 70) return 'bg-green-500 text-white border-0';
    if (matchScore >= 40) return 'bg-yellow-500 text-white border-0';
    return 'bg-orange-500 text-white border-0';
  };

  const getScoreIcon = () => {
    if (matchScore >= 70) return <Zap className="h-3 w-3 mr-1 fill-current" />;
    if (matchScore >= 40) return <Target className="h-3 w-3 mr-1" />;
    return <Sparkles className="h-3 w-3 mr-1" />;
  };

  return (
    <Badge className={`${getScoreColor()} font-semibold cursor-pointer`} onClick={calculateMatch}>
      {getScoreIcon()}
      {matchScore}% AI Match
    </Badge>
  );
}

export function JobsPage() {
  const { address } = useAccount();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Mock user skills - in production, fetch from user profile
  const userSkills = address ? ['React', 'TypeScript', 'Solidity', 'Node.js', 'Web3'] : [];

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, where('status', '==', 'open'));
      const querySnapshot = await getDocs(q);
      
      const jobsData: Job[] = [];
      querySnapshot.forEach((doc) => {
        jobsData.push({ id: doc.id, ...doc.data() } as Job);
      });
      
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = !selectedSkill || job.skills?.includes(selectedSkill);
    const matchesCategory = !selectedCategory || job.category === selectedCategory;
    return matchesSearch && matchesSkill && matchesCategory;
  });

  const allSkills = Array.from(new Set(jobs.flatMap(job => job.skills || [])));
  const allCategories = Array.from(new Set(jobs.map(job => job.category).filter(Boolean))) as string[];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-6 sm:py-8 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 sm:mb-10 text-center animate-pulse">
            <div className="h-10 sm:h-12 bg-gray-200 rounded w-2/3 sm:w-1/3 mx-auto mb-4"></div>
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 sm:w-1/2 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-6 sm:py-8 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 sm:mb-10 animate-fade-in-up">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text px-4">
              Find Your Next Gig
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover exciting Web3 opportunities from verified clients worldwide
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105 transition-transform">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                    <p className="text-sm text-gray-600">Active Jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105 transition-transform">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${jobs.reduce((sum, job) => sum + (job.budget || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Budget</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105 transition-transform">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">2.5K+</p>
                    <p className="text-sm text-gray-600">Freelancers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105 transition-transform">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">98%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row">
                <div className="flex-1 min-w-0 relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-lg border-2 focus:border-purple-500"
                  />
                </div>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base"
                >
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Category Filter */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm animate-fade-in-up">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  <CardTitle className="text-base sm:text-lg">Categories</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory('')}
                  className={`w-full justify-start text-sm ${selectedCategory === '' ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}`}
                >
                  All Categories
                </Button>
                {allCategories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory(category ?? '')}
                    className={`w-full justify-start text-sm ${selectedCategory === category ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}`}
                  >
                    {category}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Skills Filter */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm animate-fade-in-up delay-300">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  <CardTitle className="text-base sm:text-lg">Skills</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedSkill === '' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedSkill('')}
                  className={`w-full justify-start text-sm ${selectedSkill === '' ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}`}
                >
                  All Skills
                </Button>
                {allSkills.slice(0, 10).map(skill => (
                  <Button
                    key={skill}
                    variant={selectedSkill === skill ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedSkill(skill)}
                    className={`w-full justify-start text-sm ${selectedSkill === skill ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}`}
                  >
                    {skill}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Tip */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-100 to-blue-100 animate-fade-in-up delay-500">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Zap className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-purple-900 mb-1">Pro Tip</p>
                    <p className="text-purple-800">
                      Apply early to increase your chances of being noticed by clients!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
              <p className="text-sm sm:text-base text-gray-600">
                <span className="font-semibold text-gray-900">{filteredJobs.length}</span> jobs found
              </p>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Featured
                </Button>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Latest
                </Button>
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <Card className="border-0 shadow-xl">
                <CardContent className="py-12 sm:py-16 text-center px-4">
                  <div className="mx-auto mb-4 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">No jobs found</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-6">
                    Try adjusting your filters or search criteria
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSkill('');
                      setSelectedCategory('');
                    }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredJobs.map((job, index) => (
                <Card 
                  key={job.id} 
                  className="border-0 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 bg-white/90 backdrop-blur-sm animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-2xl mb-2 hover:text-purple-600 transition-colors">
                              {job.title}
                            </CardTitle>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {address && userSkills.length > 0 && (
                                <AIMatchBadge job={job} userSkills={userSkills} />
                              )}
                              <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                                <MapPin className="h-3 w-3 mr-1" />
                                Remote
                              </Badge>
                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                {job.category || 'General'}
                              </Badge>
                              {job.featured && (
                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                                  <Star className="h-3 w-3 mr-1 fill-current" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <CardDescription className="text-base line-clamp-2 mb-3">
                          {job.description}
                        </CardDescription>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-transparent bg-clip-text mb-1">
                          <DollarSign className="h-6 w-6 text-green-600" />
                          {job.budget} ETH
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.proposals || 0} proposals
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills?.slice(0, 6).map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-purple-100 text-purple-700">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills && job.skills.length > 6 && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                          +{job.skills.length - 6} more
                        </Badge>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {job.duration || 'Flexible'}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          asChild 
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          <Link to={`/jobs/${job.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
