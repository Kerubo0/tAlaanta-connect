import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Sparkles, Loader2, Copy, Check, TrendingUp, Lightbulb } from 'lucide-react';
import { enhanceProposal } from '@/lib/ai';

interface ProposalAssistantProps {
  jobTitle: string;
  jobDescription: string;
  freelancerSkills: string[];
  onProposalUpdate?: (proposal: string) => void;
}

export function ProposalAssistant({
  jobTitle,
  jobDescription,
  freelancerSkills,
  onProposalUpdate
}: ProposalAssistantProps) {
  const [currentProposal, setCurrentProposal] = useState('');
  const [improvedProposal, setImprovedProposal] = useState('');
  const [tips, setTips] = useState<string[]>([]);
  const [successRate, setSuccessRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEnhance = async () => {
    if (!currentProposal.trim()) return;

    setIsLoading(true);
    try {
      const result = await enhanceProposal(
        jobTitle,
        jobDescription,
        currentProposal,
        freelancerSkills
      );

      setImprovedProposal(result.improvedProposal);
      setTips(result.tips);
      setSuccessRate(result.estimatedSuccessRate);
    } catch (error) {
      console.error('Proposal enhancement error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(improvedProposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseProposal = () => {
    if (onProposalUpdate) {
      onProposalUpdate(improvedProposal);
    }
    setCurrentProposal(improvedProposal);
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Proposal Assistant
            </CardTitle>
            <CardDescription>
              Let AI help you craft a winning proposal
            </CardDescription>
          </div>
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            Beta
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Your Draft Proposal
          </label>
          <Textarea
            value={currentProposal}
            onChange={(e) => setCurrentProposal(e.target.value)}
            placeholder="Write your initial proposal here... AI will help make it better!"
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {currentProposal.length} characters
          </p>
        </div>

        {/* Enhance Button */}
        <Button
          onClick={handleEnhance}
          disabled={!currentProposal.trim() || isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enhancing with AI...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Enhance with AI
            </>
          )}
        </Button>

        {/* Improved Proposal */}
        {improvedProposal && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">AI-Enhanced Proposal</label>
                {successRate !== null && (
                  <Badge className="bg-green-500 text-white">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {successRate}% Success Rate
                  </Badge>
                )}
              </div>
              <div className="relative">
                <Textarea
                  value={improvedProposal}
                  onChange={(e) => setImprovedProposal(e.target.value)}
                  rows={8}
                  className="resize-none bg-white"
                />
                <Button
                  onClick={handleCopy}
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {improvedProposal.length} characters • You can edit the AI suggestion
              </p>
            </div>

            {/* Tips */}
            {tips.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">AI Tips</span>
                </div>
                <ul className="space-y-1">
                  {tips.map((tip, index) => (
                    <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleUseProposal}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                Use This Proposal
              </Button>
              <Button
                onClick={() => {
                  setImprovedProposal('');
                  setTips([]);
                  setSuccessRate(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Start Over
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
