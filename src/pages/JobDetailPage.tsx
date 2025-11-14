/**
 * Job Detail Page
 * View job details and apply (for freelancers) or manage (for clients)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext-supabase';
import { getJob, applyToJob, JobPosting } from '../lib/jobs-supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  DollarSign, 
  Clock, 
  MapPin, 
  Calendar,
  Users,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Send,
  FileText,
  Star,
  Award,
  Target,
  Zap,
  Share2,
  Bookmark,
  TrendingUp,
  Shield
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
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  
  // Application form state
  const [application, setApplication] = useState({
    coverLetter: '',
    proposedBudget: '',
    estimatedDuration: '',
    portfolioLinks: '',
    whyGoodFit: '',
  });

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
      setShowApplicationForm(false);
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-orange-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h2>
            <p className="text-gray-600 mb-6">This job posting may have been removed or doesn't exist.</p>
            <Button
              onClick={() => navigate('/jobs')}
              className="bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwnJob = userProfile?.uid === job.client_id;
  const isFreelancer = userProfile?.role === 'freelancer';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/jobs')}
          className="mb-6 hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className={`${
                        job.status === 'open' ? 'bg-green-500 hover:bg-green-600' :
                        job.status === 'in-progress' ? 'bg-yellow-500 hover:bg-yellow-600' :
                        job.status === 'completed' ? 'bg-blue-500 hover:bg-blue-600' :
                        'bg-gray-500'
                      } text-white border-0`}>
                        {job.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-orange-500 to-rose-500 text-white border-0">
                        {job.category}
                      </Badge>
                      {job.featured && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-3xl mb-3 bg-gradient-to-r from-orange-600 to-purple-600 text-transparent bg-clip-text">
                      {job.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span className="text-sm">{job.client_name}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span className="text-sm">
                          Posted {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span className="text-sm">{job.applicants?.length || 0} applicants</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="hover:bg-orange-50">
                      <Bookmark className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-orange-50">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 mb-1">
                      <DollarSign size={18} />
                      <span className="text-xs font-medium">Budget</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">${job.budget}</div>
                    <div className="text-xs text-green-600 capitalize mt-1">{job.job_type}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-700 mb-1">
                      <Clock size={18} />
                      <span className="text-xs font-medium">Duration</span>
                    </div>
                    <div className="text-lg font-bold text-blue-900">{job.duration || 'Flexible'}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-purple-700 mb-1">
                      <Award size={18} />
                      <span className="text-xs font-medium">Experience</span>
                    </div>
                    <div className="text-lg font-bold text-purple-900 capitalize">{job.experience_level}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-orange-700 mb-1">
                      <MapPin size={18} />
                      <span className="text-xs font-medium">Location</span>
                    </div>
                    <div className="text-sm font-bold text-orange-900">
                      {job.remote ? 'Remote' : job.location || 'Remote'}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Description */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-xl">Job Description</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </div>
              </CardContent>
            </Card>

            {/* Skills Required */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-xl">Required Skills</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 hover:from-purple-200 hover:to-pink-200"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Application Form - For Freelancers */}
            {isFreelancer && !isOwnJob && job.status === 'open' && !hasApplied && showApplicationForm && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-orange-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-xl">Submit Your Application</CardTitle>
                  </div>
                  <CardDescription>
                    Stand out by providing detailed information about your qualifications and approach.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter *
                    </label>
                    <Textarea
                      placeholder="Introduce yourself and explain why you're the perfect fit for this job..."
                      value={application.coverLetter}
                      onChange={(e) => setApplication({ ...application, coverLetter: e.target.value })}
                      rows={6}
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tip: Mention relevant experience and how you can add value to this project.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Proposed Budget ($)
                      </label>
                      <Input
                        type="number"
                        placeholder={`Max: $${job.budget}`}
                        value={application.proposedBudget}
                        onChange={(e) => setApplication({ ...application, proposedBudget: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Duration
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g., 2 weeks"
                        value={application.estimatedDuration}
                        onChange={(e) => setApplication({ ...application, estimatedDuration: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why You're a Good Fit *
                    </label>
                    <Textarea
                      placeholder="Highlight your relevant skills, experience, and what makes you uniquely qualified..."
                      value={application.whyGoodFit}
                      onChange={(e) => setApplication({ ...application, whyGoodFit: e.target.value })}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio Links (Optional)
                    </label>
                    <Textarea
                      placeholder="Share links to your portfolio, GitHub, previous work, etc. (one per line)"
                      value={application.portfolioLinks}
                      onChange={(e) => setApplication({ ...application, portfolioLinks: e.target.value })}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleApply}
                      disabled={applying || !application.coverLetter || !application.whyGoodFit}
                      className="flex-1 bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 hover:from-orange-600 hover:via-rose-600 hover:to-purple-700 text-white py-6 text-lg font-semibold"
                    >
                      {applying ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Submit Application
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowApplicationForm(false)}
                      disabled={applying}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Apply Card - For Freelancers */}
            {isFreelancer && !isOwnJob && job.status === 'open' && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600 text-white sticky top-6">
                <CardContent className="pt-6">
                  {hasApplied ? (
                    <div className="text-center py-8">
                      <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-10 w-10" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Application Submitted!</h3>
                      <p className="text-white/90 text-sm">
                        The client will review your application and get back to you soon.
                      </p>
                    </div>
                  ) : showApplicationForm ? (
                    <div className="text-center py-6">
                      <FileText className="h-12 w-12 mx-auto mb-3" />
                      <h3 className="text-lg font-bold mb-2">Fill out the form</h3>
                      <p className="text-white/90 text-sm">
                        Complete the application form below to apply for this position.
                      </p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold mb-4">Ready to Apply?</h3>
                      <p className="text-white/90 mb-6 text-sm">
                        Submit your application with a cover letter and stand out from other candidates.
                      </p>
                      <Button
                        onClick={() => setShowApplicationForm(true)}
                        className="w-full bg-white text-orange-600 hover:bg-gray-100 py-6 text-lg font-semibold"
                      >
                        <Send className="h-5 w-5 mr-2" />
                        Apply Now
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Client Actions */}
            {isOwnJob && (
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    Manage Job
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="text-orange-600" size={24} />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{job.applicants?.length || 0}</p>
                        <p className="text-sm text-gray-600">Total Applicants</p>
                      </div>
                    </div>
                  </div>
                  
                  {job.applicants && job.applicants.length > 0 && (
                    <Button
                      onClick={() => navigate(`/job/${job.id}/applications`)}
                      className="w-full bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600"
                    >
                      <Users size={18} className="mr-2" />
                      View Applications
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="w-full"
                  >
                    Back to Dashboard
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Job Insights */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Job Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Competition</span>
                  <Badge className={`${
                    (job.applicants?.length || 0) < 5 ? 'bg-green-100 text-green-700' :
                    (job.applicants?.length || 0) < 15 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {(job.applicants?.length || 0) < 5 ? 'Low' :
                     (job.applicants?.length || 0) < 15 ? 'Medium' : 'High'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Budget Range</span>
                  <Badge className="bg-green-100 text-green-700">
                    ${Math.floor(job.budget * 0.8)} - ${job.budget}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Posted</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.ceil((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            {isFreelancer && !isOwnJob && !hasApplied && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-100 to-pink-100">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Zap className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-purple-900 mb-2">Pro Tips</h4>
                      <ul className="text-sm text-purple-800 space-y-2">
                        <li>• Personalize your cover letter</li>
                        <li>• Highlight relevant experience</li>
                        <li>• Be realistic with budget/timeline</li>
                        <li>• Include portfolio samples</li>
                        <li>• Apply early for better visibility</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
