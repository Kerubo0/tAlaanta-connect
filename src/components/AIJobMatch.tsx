import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Loader2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { matchJobToFreelancer, JobMatchScore } from '@/lib/ai';

interface AIJobMatchProps {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  freelancerSkills: string[];
  freelancerBio?: string;
  freelancerExperience?: string;
  compact?: boolean;
}

export function AIJobMatch({
  jobDescription,
  requiredSkills,
  freelancerSkills,
  freelancerBio = '',
  freelancerExperience = '',
  compact = false
}: AIJobMatchProps) {
  const [matchScore, setMatchScore] = useState<JobMatchScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Don't auto-calculate - only on user click
  const calculateMatch = async () => {
    setIsLoading(true);
    try {
      const score = await matchJobToFreelancer(
        jobDescription,
        requiredSkills,
        freelancerSkills,
        freelancerBio,
        freelancerExperience
      );
      setMatchScore(score);
    } catch (error) {
      console.error('Match calculation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="h-4 w-4" />;
    if (score >= 40) return <Target className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  // Show calculate button if not yet calculated
  if (!matchScore && !isLoading) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardContent className="p-6 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-2">AI Job Match Analysis</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Let AI analyze how well this job matches your profile
          </p>
          <Button
            onClick={calculateMatch}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Calculate My Match Score
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Analyzing your match...</p>
        </CardContent>
      </Card>
    );
  }

  if (!matchScore) return null;

  if (compact) {
    return (
      <Badge
        className={`${getScoreColor(matchScore.score)} text-white flex items-center gap-1 cursor-pointer`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <Sparkles className="h-3 w-3" />
        {matchScore.score}% Match
      </Badge>
    );
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-full ${getScoreColor(matchScore.score)} flex items-center justify-center text-white font-bold`}>
              {matchScore.score}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">AI Match Score</h3>
                <Sparkles className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">{matchScore.recommendation}</p>
            </div>
          </div>
          {getScoreIcon(matchScore.score)}
        </div>

        {/* Skills Match */}
        {matchScore.skillsMatch.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Matching Skills</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {matchScore.skillsMatch.map((skill, index) => (
                <Badge key={index} className="bg-green-100 text-green-800 border-green-300">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Skills Gap */}
        {matchScore.skillsGap.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Skills to Learn</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {matchScore.skillsGap.map((skill, index) => (
                <Badge key={index} className="bg-orange-100 text-orange-800 border-orange-300">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Reasons */}
        {matchScore.reasons.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Why this match?</p>
            <ul className="space-y-1">
              {matchScore.reasons.map((reason, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={calculateMatch}
          variant="outline"
          size="sm"
          className="w-full mt-3"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Recalculate Match
        </Button>
      </CardContent>
    </Card>
  );
}
