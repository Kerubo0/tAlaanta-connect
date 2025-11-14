/**
 * EXAMPLE: How to Integrate Payment Step into PostJobPage
 * 
 * This file shows the key changes needed to add payment/escrow to PostJobPage
 * Copy the relevant sections into your actual PostJobPage.tsx
 */

// ============================================
// 1. ADD IMPORTS
// ============================================
import PaymentMethodSelector, { PaymentMethodData } from '../components/PaymentMethodSelector';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { supabase } from '../lib/supabase';

// ============================================
// 2. ADD CONSTANTS
// ============================================
const SERVICE_FEE_RATE = 0.10; // 10% service fee
const ESCROW_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace after deployment

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

// ============================================
// 3. ADD STATE VARIABLES
// ============================================
export default function PostJobPage() {
  // ... existing state ...
  
  const [currentStep, setCurrentStep] = useState<FormStep>('details');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodData | null>(null);
  
  // Web3 hooks for crypto payments
  const { data: hash, writeContract, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  // ============================================
  // 4. CALCULATE FEES
  // ============================================
  const projectAmount = parseFloat(formData.budget) || 0;
  const serviceFee = projectAmount * SERVICE_FEE_RATE;
  const totalAmount = projectAmount + serviceFee;

  // ============================================
  // 5. MODIFY SUBMIT HANDLER
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ... existing validation ...
    
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
      // Create job first
      const newJob = await createJob({
        // ... all your existing job fields ...
        budget: projectAmount, // Use project amount, not total
      });
      
      if (!newJob?.id) throw new Error('Failed to create job');
      
      let transactionHash: string | undefined;
      
      // Process payment based on method
      if (paymentMethod.type === 'crypto') {
        // Crypto payment via smart contract
        writeContract({
          address: ESCROW_CONTRACT_ADDRESS as `0x${string}`,
          abi: ESCROW_ABI,
          functionName: 'createAndFundEscrow',
          args: [newJob.id, '0x0000000000000000000000000000000000000000'],
          value: parseEther(totalAmount.toString()),
        });
        transactionHash = hash;
      } else if (paymentMethod.type === 'mpesa') {
        // M-Pesa payment (implement Daraja API call)
        console.log('Processing M-Pesa payment...', paymentMethod);
        transactionHash = `MPESA-${Date.now()}`;
      } else if (paymentMethod.type === 'bank') {
        // Bank transfer (create pending record)
        console.log('Processing bank transfer...', paymentMethod);
        transactionHash = `BANK-${Date.now()}`;
      }
      
      // Create escrow record in database
      const { data: escrowData, error: escrowError } = await supabase
        .from('escrow')
        .insert({
          job_id: newJob.id,
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
      
      if (escrowError) throw new Error('Failed to create escrow record');
      
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
        .eq('id', newJob.id);
      
      // Create transaction record
      await supabase.from('transactions').insert({
        user_id: userProfile.uid,
        job_id: newJob.id,
        escrow_id: escrowData.id,
        type: 'escrow_fund',
        amount: totalAmount,
        payment_method: paymentMethod.type,
        transaction_hash: transactionHash,
        status: paymentMethod.type === 'crypto' ? 'completed' : 'pending',
        description: `Funds deposited to escrow for "${formData.title}"`,
      });
      
      // Navigate to dashboard
      navigate('/dashboard', { 
        state: { 
          message: 'Job posted successfully! Funds are held in escrow.',
          jobId: newJob.id 
        } 
      });
    } catch (err: any) {
      setError(err.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 6. ADD PROGRESS INDICATOR TO UI
  // ============================================
  return (
    <div>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
            currentStep === 'details' ? 'bg-purple-600 text-white' : 'bg-green-500 text-white'
          }`}>
            1
          </div>
          <span className="ml-2 font-medium">Job Details</span>
        </div>
        <div className="w-20 h-1 bg-gray-300">
          <div className={`h-full bg-purple-600 transition-all ${
            currentStep !== 'details' ? 'w-full' : 'w-0'
          }`}></div>
        </div>
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
            currentStep === 'payment' ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            2
          </div>
          <span className="ml-2 font-medium">Payment & Escrow</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Step 1: Job Details */}
        {currentStep === 'details' && (
          <div>
            {/* All your existing form fields */}
            
            {/* Budget Breakdown (add this) */}
            {projectAmount > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Budget Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Project Amount:</span>
                    <span className="font-semibold">${projectAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee (10%):</span>
                    <span className="font-semibold">${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 pt-2 flex justify-between font-bold">
                    <span>Total to Pay:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Funds will be held in escrow until job completion
                </p>
              </div>
            )}
            
            {/* Submit Button (modify to say "Continue to Payment") */}
            <button type="submit">
              Continue to Payment →
            </button>
          </div>
        )}
        
        {/* Step 2: Payment & Escrow */}
        {currentStep === 'payment' && (
          <div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Secure Escrow:</strong> Your payment will be held safely until the job is completed.
              </p>
            </div>
            
            <PaymentMethodSelector
              onMethodSelect={setPaymentMethod}
              selectedMethod={paymentMethod?.type}
              amount={projectAmount}
              serviceFee={serviceFee}
            />
            
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => setCurrentStep('details')}
              >
                ← Back to Details
              </button>
              <button
                type="submit"
                disabled={loading || !paymentMethod || isWritePending || isConfirming}
              >
                {loading ? 'Processing...' : 'Fund Escrow & Post Job'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

// ============================================
// NOTES:
// ============================================
/*
1. Before deploying:
   - Run supabase-schema-escrow.sql in Supabase
   - Deploy smart contract and update ESCROW_CONTRACT_ADDRESS
   - Add new fields to jobs table (run ALTER TABLE commands)

2. For M-Pesa:
   - Implement Daraja API STK push
   - Handle payment callbacks
   - Update escrow status when confirmed

3. For Bank Transfer:
   - Create admin verification UI
   - Manual escrow status update
   - Email notifications

4. Test with:
   - Testnet crypto (Sepolia)
   - M-Pesa sandbox
   - Dummy bank details

5. Don't forget:
   - Add error handling
   - Show loading states
   - Display transaction confirmations
   - Handle payment failures
*/
