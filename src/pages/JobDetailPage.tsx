import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { AIJobMatch } from '@/components/AIJobMatch';
import { ProposalAssistant } from '@/components/ProposalAssistant';
import { 
  Briefcase,
  DollarSign,
  Clock,
  MapPin,
  Calendar,
  Users,
  ArrowLeft,
  Send,
  Heart,
  Share2,
  Award,
  Wallet,
  CheckCircle2,
  Star
} from 'lucide-react';

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');
  const [proposedTimeline, setProposedTimeline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Mock user profile data - in production, fetch from database
  const userSkills = address ? ['React', 'TypeScript', 'Solidity', 'Node.js', 'Web3', 'Smart Contracts'] : [];
  const userBio = "Experienced Web3 developer with 5+ years building decentralized applications.";
  const userExperience = "5 years";

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    if (!db || !jobId) {
      setLoading(false);
      return;
    }

    try {
      const jobRef = doc(db, 'jobs', jobId);
      const jobDoc = await getDoc(jobRef);
      
      if (jobDoc.exists()) {
        setJob({ id: jobDoc.id, ...jobDoc.data() } as Job);
      }
    } catch (error) {
      console.error('Error loading job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async () => {
    if (!isConnected || !proposal.trim()) return;

    setSubmitting(true);
    try {
      // In production, save to Firestore
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting proposal:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/jobs')} className="bg-gradient-to-r from-purple-600 to-blue-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm text-center">
            <CardContent className="py-16">
              <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
                Proposal Submitted!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Your proposal has been sent to the client. They'll review it and get back to you soon.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/jobs')} variant="outline">
                  Browse More Jobs
                </Button>
                <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-purple-600 to-blue-600">
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/jobs')}
          className="mb-6 animate-fade-in-up"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm animate-fade-in-up">
              <CardHeader>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                          <MapPin className="h-3 w-3 mr-1" />
                          Remote
                        </Badge>
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          <Clock className="h-3 w-3 mr-1" />
                          Posted 2 days ago
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                          <Users className="h-3 w-3 mr-1" />
                          {job.proposals || 0} Proposals
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Budget</p>
                      <div className="flex items-center gap-2 text-3xl font-bold text-green-600">
                        <DollarSign className="h-8 w-8" />
                        {job.budget} ETH
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Duration</p>
                      <div className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                        <Calendar className="h-5 w-5" />
                        {job.duration || '2-4 weeks'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm animate-fade-in-up delay-100">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line mb-6">{job.description}</p>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills?.map((skill, index) => (
                      <Badge key={index} className="bg-purple-100 text-purple-700 border-purple-300">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Proposal Assistant */}
            {isConnected && (
              <div className="animate-fade-in-up delay-200">
                <ProposalAssistant
                  jobTitle={job.title}
                  jobDescription={job.description}
                  freelancerSkills={userSkills}
                  onProposalUpdate={setProposal}
                />
              </div>
            )}

            {/* Application Form */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm animate-fade-in-up delay-300">
              <CardHeader>
                <CardTitle>Submit Your Proposal</CardTitle>
                <CardDescription>
                  Tell the client why you're the perfect fit for this project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isConnected ? (
                  <div className="text-center py-8">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                      <Wallet className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                    <p className="text-gray-600 mb-6">
                      You need to connect your wallet to apply for this job
                    </p>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                      Connect Wallet
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Your Proposal *
                      </label>
                      <Textarea
                        value={proposal}
                        onChange={(e) => setProposal(e.target.value)}
                        placeholder="Describe your approach to this project, relevant experience, and why you're the best choice..."
                        rows={8}
                        className="resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {proposal.length} / 2000 characters
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Your Bid (ETH) *
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={proposedBudget}
                          onChange={(e) => setProposedBudget(e.target.value)}
                          placeholder="0.5"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Delivery Time *
                        </label>
                        <Input
                          value={proposedTimeline}
                          onChange={(e) => setProposedTimeline(e.target.value)}
                          placeholder="e.g., 2 weeks"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmitProposal}
                      disabled={!proposal.trim() || !proposedBudget || !proposedTimeline || submitting}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Submit Proposal
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Match Score */}
            {isConnected && job.skills && job.skills.length > 0 && (
              <div className="animate-fade-in-up">
                <AIJobMatch
                  jobTitle={job.title}
                  jobDescription={job.description}
                  requiredSkills={job.skills}
                  freelancerSkills={userSkills}
                  freelancerBio={userBio}
                  freelancerExperience={userExperience}
                />
              </div>
            )}

            {/* Client Info */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm animate-fade-in-up delay-100">
              <CardHeader>
                <CardTitle className="text-lg">About the Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    {job.clientName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <p className="font-semibold">{job.clientName || 'Client'}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>5.0 (12 reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jobs Posted</span>
                    <span className="font-semibold">18</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hire Rate</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="font-semibold">12.5 ETH</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 animate-fade-in-up delay-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Use the AI Proposal Assistant above to improve your chances</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Highlight your relevant experience and portfolio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Be realistic with timeline and budget</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Ask clarifying questions if needed</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
