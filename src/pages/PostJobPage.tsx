import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  DollarSign, 
  Clock, 
  Target, 
  Plus, 
  X, 
  Wallet,
  Shield,
  Zap,
  AlertCircle
} from 'lucide-react';

interface Milestone {
  id: string;
  description: string;
  amount: string;
  deadline: string;
}

export function PostJobPage() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    duration: '',
    skills: [] as string[],
  });
  
  const [currentSkill, setCurrentSkill] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: '1', description: '', amount: '', deadline: '' }
  ]);

  const categories = [
    'Web Development',
    'Mobile Development',
    'Blockchain/Web3',
    'Design',
    'Content Writing',
    'Marketing',
    'Data Science',
    'DevOps',
  ];

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, currentSkill.trim()] });
      setCurrentSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      description: '',
      amount: '',
      deadline: '',
    };
    setMilestones([...milestones, newMilestone]);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter(m => m.id !== id));
    }
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: string) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    // TODO: Integrate with smart contract and Firebase
    console.log('Job Data:', {
      ...formData,
      milestones,
      client: address,
    });

    alert('Job posted successfully! (Integration pending)');
    navigate('/jobs');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-2 border-purple-200 shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Wallet className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl">Wallet Connection Required</CardTitle>
              <CardDescription className="text-lg">
                Please connect your wallet to post a job on TalentBridge
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                You need to connect your Web3 wallet to create job postings and interact with smart contracts.
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            Post a New Job
          </h1>
          <p className="text-xl text-gray-600">
            Create a decentralized work contract with milestone-based payments
          </p>
        </div>

        {/* Web3 Features Banner */}
        <div className="grid md:grid-cols-3 gap-4 mb-8 animate-fade-in-up delay-300">
          <Card className="border-0 bg-gradient-to-br from-green-100 to-emerald-100">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <CardTitle className="text-sm">Smart Contract Escrow</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Funds locked safely until work is approved
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-blue-100 to-cyan-100">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-sm">Zero Platform Fees</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Pay only gas fees, no middleman charges
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-100 to-pink-100">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-sm">Milestone-Based</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Pay incrementally as work progresses
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-xl animate-fade-in-up delay-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-purple-600" />
                <CardTitle>Job Details</CardTitle>
              </div>
              <CardDescription>Provide clear information about the work you need done</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Job Title *</label>
                <Input
                  placeholder="e.g., Build a DeFi Dashboard with React & Web3"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Category *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description *</label>
                <Textarea
                  placeholder="Describe the project requirements, deliverables, and any specific technologies or tools needed..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Budget (ETH) *
                  </label>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="0.5"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                  >
                    <option value="">Select duration</option>
                    <option value="1-7 days">1-7 days</option>
                    <option value="1-2 weeks">1-2 weeks</option>
                    <option value="2-4 weeks">2-4 weeks</option>
                    <option value="1-2 months">1-2 months</option>
                    <option value="2-3 months">2-3 months</option>
                    <option value="3+ months">3+ months</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Required Skills *</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a skill (e.g., Solidity, React, TypeScript)"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50 animate-fade-in-up delay-700">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-6 w-6 text-purple-600" />
                <CardTitle>Payment Milestones</CardTitle>
              </div>
              <CardDescription>
                Break down the project into milestones. Funds for each milestone will be held in escrow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestones.map((milestone, index) => (
                <Card key={milestone.id} className="border-2 border-purple-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Milestone {index + 1}</CardTitle>
                      {milestones.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMilestone(milestone.id)}
                          className="hover:bg-red-100 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Description *</label>
                      <Input
                        placeholder="e.g., Complete frontend design and implementation"
                        value={milestone.description}
                        onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Amount (ETH) *</label>
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="0.1"
                          value={milestone.amount}
                          onChange={(e) => updateMilestone(milestone.id, 'amount', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Deadline *</label>
                        <Input
                          type="date"
                          value={milestone.deadline}
                          onChange={(e) => updateMilestone(milestone.id, 'deadline', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addMilestone}
                className="w-full border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Milestone
              </Button>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Card className="border-0 bg-gradient-to-r from-amber-50 to-orange-50 animate-fade-in-up delay-1000">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-orange-900 mb-1">Important</p>
                  <p className="text-orange-800">
                    Once you post this job, the total budget will be locked in a smart contract escrow. 
                    Funds will be released to the freelancer as you approve each milestone. 
                    Make sure your wallet has sufficient ETH for the total budget plus gas fees.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate('/jobs')}
              className="px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all hover:scale-105 px-8"
            >
              <Shield className="mr-2 h-5 w-5" />
              Post Job & Lock Funds in Escrow
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
