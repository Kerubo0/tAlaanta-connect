import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Shield,
  Award,
  Star,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  Lock,
  Verified,
  XCircle,
} from 'lucide-react';
import {
  createVerifiableReview,
  getReputationScore,
  verifyReviewChain,
  detectFraudPatterns,
  type ReputationScore,
  type VerifiableReview,
} from '@/lib/aqua-reputation';

interface ReputationDisplayProps {
  address: string;
}

export function ReputationDisplay({ address }: ReputationDisplayProps) {
  const [reputation, setReputation] = useState<ReputationScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [fraudCheck, setFraudCheck] = useState<{ suspicious: boolean; reasons: string[] } | null>(null);

  useEffect(() => {
    loadReputation();
  }, [address]);

  const loadReputation = async () => {
    try {
      setLoading(true);
      const score = await getReputationScore(address);
      setReputation(score);

      // Run fraud detection
      const fraud = detectFraudPatterns(score.recentReviews);
      setFraudCheck(fraud);
    } catch (error) {
      console.error('Failed to load reputation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-purple-200">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reputation) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Trust Score Card */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-purple-600" />
              <CardTitle className="text-xl sm:text-2xl">Verified Reputation</CardTitle>
            </div>
            {reputation.onChainProof && (
              <Badge className="bg-green-600 text-white gap-1">
                <Lock className="h-3 w-3" />
                On-Chain
              </Badge>
            )}
          </div>
          <CardDescription>Cryptographically verified using Aqua Protocol</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trust Score */}
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl sm:text-5xl font-bold text-purple-600 mb-2">
              {reputation.trustScore}%
            </div>
            <p className="text-gray-600">Trust Score</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              {reputation.verifiedReviews} of {reputation.totalReviews} reviews verified
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-white rounded-lg">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {reputation.averageRating.toFixed(1)}
              </div>
              <p className="text-xs text-gray-600">Rating</p>
            </div>

            <div className="text-center p-3 sm:p-4 bg-white rounded-lg">
              <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mx-auto mb-2" />
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {reputation.verifiedReviews}
              </div>
              <p className="text-xs text-gray-600">Verified</p>
            </div>

            <div className="text-center p-3 sm:p-4 bg-white rounded-lg">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {reputation.totalReviews}
              </div>
              <p className="text-xs text-gray-600">Total</p>
            </div>

            <div className="text-center p-3 sm:p-4 bg-white rounded-lg">
              <Award className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {Object.keys(reputation.skillsEndorsed).length}
              </div>
              <p className="text-xs text-gray-600">Skills</p>
            </div>
          </div>

          {/* Fraud Detection Alert */}
          {fraudCheck && fraudCheck.suspicious && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900">Suspicious Activity Detected</p>
                  <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                    {fraudCheck.reasons.map((reason, i) => (
                      <li key={i}>• {reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Skills Endorsed */}
          {Object.keys(reputation.skillsEndorsed).length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Verified className="h-5 w-5 text-blue-600" />
                Verified Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(reputation.skillsEndorsed)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([skill, count]) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="border-purple-300 text-purple-700 gap-1"
                    >
                      {skill}
                      <span className="text-purple-500 font-bold">×{count}</span>
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      {reputation.recentReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Verified Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reputation.recentReviews.map((review, index) => (
              <ReviewCard key={review.id || index} review={review} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: VerifiableReview }) {
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    verifyReviewChain(review).then(setVerified);
  }, [review]);

  return (
    <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            {verified !== null && (
              <Badge variant={verified ? 'default' : 'destructive'} className="gap-1 text-xs">
                {verified ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    Invalid
                  </>
                )}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-700 break-words">{review.comment}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {review.skillsVerified.map((skill) => (
          <Badge key={skill} variant="secondary" className="text-xs">
            {skill}
          </Badge>
        ))}
      </div>

      <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2 sm:gap-4">
        <span className="truncate max-w-[200px]">From: {review.reviewerAddress}</span>
        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

interface ReviewFormProps {
  jobId: string;
  revieweeAddress: string;
  onSuccess?: () => void;
}

export function CreateReviewForm({ jobId, revieweeAddress, onSuccess }: ReviewFormProps) {
  const { address } = useAccount();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !window.ethereum) return;

    try {
      setSubmitting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);

      const review = await createVerifiableReview(provider, {
        jobId,
        revieweeAddress,
        rating,
        comment,
        skillsVerified: skills,
        completionDate: new Date().toISOString(),
      });

      console.log('Review created with Aqua verification:', review);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create review:', error);
      alert('Failed to create review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const addSkill = () => {
    if (skillInput && !skills.includes(skillInput)) {
      setSkills([...skills, skillInput]);
      setSkillInput('');
    }
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600" />
          Leave Verified Review
        </CardTitle>
        <CardDescription>
          Your review will be cryptographically signed and cannot be faked
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <Label>Rating</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment">Review Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe your experience working with this person..."
              required
              className="mt-1"
              rows={4}
            />
          </div>

          {/* Skills */}
          <div>
            <Label htmlFor="skills">Verified Skills</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                id="skills"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="e.g., React, Solidity"
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <Button type="button" onClick={addSkill} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setSkills(skills.filter((s) => s !== skill))}
                >
                  {skill} ×
                </Badge>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-blue-900">
                <p className="font-semibold mb-1">Aqua Protocol Security</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Cryptographically signed with your wallet</li>
                  <li>• Cannot be edited or deleted once submitted</li>
                  <li>• Publicly verifiable by anyone</li>
                  <li>• Fraud detection automatically applied</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting || !comment || skills.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {submitting ? (
              <>Signing & Submitting...</>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Submit Verified Review
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
