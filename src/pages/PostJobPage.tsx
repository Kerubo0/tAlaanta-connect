/**
 * Post Job Page with Payment & Escrow
 * Create new job postings (Client only)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext-supabase';
import { createJob, JobType, ExperienceLevel } from '../lib/jobs-supabase';
import { supabase } from '../lib/supabase';
import PaymentMethodSelector, { PaymentMethodData } from '../components/PaymentMethodSelector';
import { Briefcase, DollarSign, Clock, Users, X, AlertCircle, ArrowLeft, ArrowRight, Lock, CheckCircle } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

const categories = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Data Science',
  'Content Writing',
  'Marketing',
  'Video Editing',
  'Graphics Design',
  'Blockchain',
  'AI/Machine Learning',
  'Other',
];

const SERVICE_FEE_RATE = 0.10; // 10% platform fee
const ESCROW_CONTRACT_ADDRESS = '0x71D384235f4AF6653d54A05178DD18F97FFAB799'; // JobEscrow on Base Sepolia

const ESCROW_ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'jobId', type: 'string' },
      { internalType: 'address payable', name: 'freelancerAddress', type: 'address' }
    ],
    name: 'createAndFundEscrow',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function'
  }
] as const;

type FormStep = 'details' | 'payment';

export default function PostJobPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<FormStep>('details');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodData | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills: [] as string[],
    skillInput: '',
    budget: '',
    jobType: 'fixed-price' as JobType,
    experienceLevel: 'intermediate' as ExperienceLevel,
    duration: '',
    deadline: '',
    location: '',
    remote: true,
  });

  // Web3 hooks for crypto payments
  const { data: hash, writeContract, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (hash) {
      console.log('Transaction hash:', hash);
    }
  }, [hash]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.skills.length === 0) {
      setError('Please add at least one skill');
      return;
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      setError('Please enter a valid budget');
      return;
    }

    if (!userProfile) {
      setError('You must be logged in to post a job');
      return;
    }

    // If on details step, move to payment
    if (currentStep === 'details') {
      setCurrentStep('payment');
      return;
    }

    // Validate payment method selected
    if (!paymentMethod) {
      setError('Please select and confirm a payment method');
      return;
    }

    setLoading(true);

    try {
      const projectAmount = parseFloat(formData.budget);
      const serviceFee = projectAmount * SERVICE_FEE_RATE;
      const totalAmount = projectAmount + serviceFee;

      // Create job first
      const newJobId = await createJob({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        skills: formData.skills,
        budget: projectAmount,
        job_type: formData.jobType,
        experience_level: formData.experienceLevel,
        duration: formData.duration,
        deadline: formData.deadline,
        location: formData.location,
        remote: formData.remote,
        client_id: userProfile.uid,
        client_name: userProfile.display_name,
        client_address: userProfile.wallet_address,
      });

      if (!newJobId) {
        throw new Error('Failed to create job');
      }

      let transactionHash: string | undefined;

      // Process payment based on method
      if (paymentMethod.type === 'crypto') {
        if (!paymentMethod.walletAddress) {
          throw new Error('Wallet not connected');
        }

        try {
          writeContract({
            address: ESCROW_CONTRACT_ADDRESS as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: 'createAndFundEscrow',
            args: [newJobId, '0x0000000000000000000000000000000000000000'],
            value: parseEther(totalAmount.toString()),
          });
          transactionHash = hash;
        } catch (cryptoError: any) {
          console.error('Crypto payment error:', cryptoError);
          throw new Error('Failed to process crypto payment');
        }
      } else if (paymentMethod.type === 'mpesa') {
        console.log('Processing M-Pesa payment...', paymentMethod);
        transactionHash = `MPESA-${Date.now()}`;
      } else if (paymentMethod.type === 'bank') {
        console.log('Processing bank transfer...', paymentMethod);
        transactionHash = `BANK-${Date.now()}`;
      }

      // Create escrow record
      const { data: escrowData, error: escrowError } = await supabase
        .from('escrow')
        .insert({
          job_id: newJobId,
          client_id: userProfile.uid,
          project_amount: projectAmount,
          service_fee: serviceFee,
          total_amount: totalAmount,
          payment_method: paymentMethod.type,
          transaction_hash: transactionHash,
          blockchain: paymentMethod.blockchain || null,
          status: paymentMethod.type === 'crypto' ? 'funded' : 'pending',
        })
        .select()
        .single();

      if (escrowError) {
        console.error('Escrow error:', escrowError);
        throw new Error('Failed to create escrow record');
      }

      // Update job with payment info
      await supabase
        .from('jobs')
        .update({
          service_fee: serviceFee,
          total_amount: totalAmount,
          payment_method: paymentMethod.type,
          payment_status: paymentMethod.type === 'crypto' ? 'paid' : 'pending',
          escrow_status: paymentMethod.type === 'crypto' ? 'funded' : 'pending',
          escrow_tx_hash: transactionHash,
        })
        .eq('id', newJobId);

      // Create transaction record
      await supabase.from('transactions').insert({
        user_id: userProfile.uid,
        job_id: newJobId,
        escrow_id: escrowData.id,
        type: 'escrow_fund',
        amount: totalAmount,
        payment_method: paymentMethod.type,
        transaction_hash: transactionHash,
        status: paymentMethod.type === 'crypto' ? 'completed' : 'pending',
        description: `Funds deposited to escrow for "${formData.title}"`,
      });

      navigate('/dashboard', { 
        state: { 
          message: 'Job posted successfully! Funds are held in escrow.',
          jobId: newJobId
        } 
      });
    } catch (err: any) {
      console.error('Job posting error:', err);
      setError(err.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const addSkill = () => {
    const skill = formData.skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill],
        skillInput: '',
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const projectAmount = parseFloat(formData.budget) || 0;
  const serviceFee = projectAmount * SERVICE_FEE_RATE;
  const totalAmount = projectAmount + serviceFee;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-600 text-white p-3 rounded-lg">
              <Briefcase size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
              <p className="text-gray-600 mt-1">
                {currentStep === 'details' && 'Fill in the job details below'}
                {currentStep === 'payment' && 'Select payment method and fund escrow'}
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                currentStep === 'details' ? 'bg-purple-600 text-white' : 'bg-green-500 text-white'
              }`}>
                {currentStep === 'details' ? '1' : <CheckCircle className="w-6 h-6" />}
              </div>
              <span className={`ml-2 font-medium ${
                currentStep === 'details' ? 'text-purple-600' : 'text-gray-600'
              }`}>
                Job Details
              </span>
            </div>
            <div className="w-20 h-1 bg-gray-300">
              <div className={`h-full bg-purple-600 transition-all duration-300 ${
                currentStep !== 'details' ? 'w-full' : 'w-0'
              }`}></div>
            </div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                currentStep === 'payment' ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                <Lock className="w-5 h-5" />
              </div>
              <span className={`ml-2 font-medium ${
                currentStep === 'payment' ? 'text-purple-600' : 'text-gray-400'
              }`}>
                Payment & Escrow
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {/* STEP 1: JOB DETAILS */}
          {currentStep === 'details' && (
            <div className="space-y-6">
              {/* Job Title */}
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Full-Stack Developer for E-commerce Website"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Describe the project, requirements, deliverables, and any other important details..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={formData.skillInput}
                onChange={(e) => setFormData({ ...formData, skillInput: e.target.value })}
                onKeyPress={handleSkillKeyPress}
                placeholder="e.g., React, Node.js, TypeScript"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-purple-900"
                  >
                    <X size={16} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Budget & Job Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="1000"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type <span className="text-red-500">*</span>
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              >
                <option value="fixed-price">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>
          </div>

          {/* Duration & Experience Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Duration
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 2-3 weeks"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., New York, USA (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <label className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                name="remote"
                checked={formData.remote}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
              />
              <span className="text-sm text-gray-700">Remote work allowed</span>
            </label>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Deadline
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>

          {/* Budget Breakdown */}
          {projectAmount > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-purple-600" />
                Budget Breakdown
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Project Amount:</span>
                  <span className="font-semibold">${projectAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Service Fee (10%):</span>
                  <span className="font-semibold">${serviceFee.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-purple-300 pt-2 mt-2"></div>
                <div className="flex justify-between text-lg font-bold text-purple-700">
                  <span>Total to Pay:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4 flex items-center">
                <Lock className="inline w-4 h-4 mr-1" />
                Funds will be held in escrow until job completion
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              Continue to Payment
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PAYMENT & ESCROW */}
      {currentStep === 'payment' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex items-center">
              <Lock className="w-5 h-5 text-blue-600 mr-2" />
              <p className="text-sm text-blue-800">
                <strong>Secure Escrow:</strong> Your payment will be held safely until the job is completed to your satisfaction.
              </p>
            </div>
          </div>

          <PaymentMethodSelector
            onMethodSelect={setPaymentMethod}
            selectedMethod={paymentMethod?.type}
            amount={projectAmount}
            serviceFee={serviceFee}
          />

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setCurrentStep('details')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Details
            </button>
            <button
              type="submit"
              disabled={loading || !paymentMethod || isWritePending || isConfirming}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading || isWritePending || isConfirming ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isWritePending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Posting...'}
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Fund Escrow & Post Job
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
      </div>
    </div>
  );
}
