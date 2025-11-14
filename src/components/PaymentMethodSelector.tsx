import { useState, useEffect } from 'react';
import { Wallet, Building2, Smartphone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export type PaymentMethodType = 'crypto' | 'bank' | 'mpesa';

export interface PaymentMethodData {
  type: PaymentMethodType;
  // Crypto
  walletAddress?: string;
  blockchain?: string;
  // Bank
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  // M-Pesa
  phoneNumber?: string;
  mpesaName?: string;
}

interface PaymentMethodSelectorProps {
  onMethodSelect: (method: PaymentMethodData) => void;
  selectedMethod?: PaymentMethodType;
  amount: number;
  serviceFee: number;
}

export default function PaymentMethodSelector({
  onMethodSelect,
  selectedMethod,
  amount,
  serviceFee
}: PaymentMethodSelectorProps) {
  const [selectedType, setSelectedType] = useState<PaymentMethodType | null>(
    selectedMethod || null
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Crypto wallet state
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Bank details state
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountName: ''
  });

  // M-Pesa details state
  const [mpesaDetails, setMpesaDetails] = useState({
    phoneNumber: '',
    mpesaName: ''
  });

  // Auto-connect wallet when crypto is selected
  useEffect(() => {
    if (selectedType === 'crypto' && !isConnected && !isConnecting) {
      handleCryptoConnect();
    }
  }, [selectedType]);

  // Update parent when wallet connects
  useEffect(() => {
    if (selectedType === 'crypto' && isConnected && address) {
      onMethodSelect({
        type: 'crypto',
        walletAddress: address,
        blockchain: 'ethereum' // You can detect this based on the connected chain
      });
      setError(null);
    }
  }, [isConnected, address, selectedType]);

  const handleCryptoConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Use the first available connector (MetaMask, WalletConnect, etc.)
      const connector = connectors[0];
      if (connector) {
        connect({ connector });
      } else {
        setError('No wallet connector found. Please install MetaMask or use WalletConnect.');
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTypeSelect = (type: PaymentMethodType) => {
    setSelectedType(type);
    setError(null);
    
    // Reset other forms when switching
    if (type !== 'bank') {
      setBankDetails({ bankName: '', accountNumber: '', accountName: '' });
    }
    if (type !== 'mpesa') {
      setMpesaDetails({ phoneNumber: '', mpesaName: '' });
    }
    if (type !== 'crypto' && isConnected) {
      disconnect();
    }
  };

  const handleBankSubmit = () => {
    if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountName) {
      setError('Please fill in all bank details');
      return;
    }
    
    onMethodSelect({
      type: 'bank',
      bankName: bankDetails.bankName,
      accountNumber: bankDetails.accountNumber,
      accountName: bankDetails.accountName
    });
    setError(null);
  };

  const handleMpesaSubmit = () => {
    const phoneRegex = /^(\+254|0)?[17]\d{8}$/;
    
    if (!mpesaDetails.phoneNumber || !mpesaDetails.mpesaName) {
      setError('Please fill in all M-Pesa details');
      return;
    }
    
    if (!phoneRegex.test(mpesaDetails.phoneNumber)) {
      setError('Invalid M-Pesa phone number. Use format: 0712345678 or +254712345678');
      return;
    }
    
    onMethodSelect({
      type: 'mpesa',
      phoneNumber: mpesaDetails.phoneNumber,
      mpesaName: mpesaDetails.mpesaName
    });
    setError(null);
  };

  const totalAmount = amount + serviceFee;

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-700">
            <span>Project Amount:</span>
            <span className="font-semibold">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Service Fee (10%):</span>
            <span className="font-semibold">${serviceFee.toFixed(2)}</span>
          </div>
          <div className="border-t-2 border-purple-300 pt-2 mt-2"></div>
          <div className="flex justify-between text-lg font-bold text-purple-700">
            <span>Total to Escrow:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Crypto Option */}
          <button
            type="button"
            onClick={() => handleTypeSelect('crypto')}
            className={`relative p-6 rounded-xl border-2 transition-all ${
              selectedType === 'crypto'
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className={`p-3 rounded-full ${
                selectedType === 'crypto' ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                <Wallet className={`w-6 h-6 ${
                  selectedType === 'crypto' ? 'text-purple-600' : 'text-gray-600'
                }`} />
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">Cryptocurrency</div>
                <div className="text-sm text-gray-500">ETH, USDT, USDC</div>
              </div>
            </div>
            {selectedType === 'crypto' && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
              </div>
            )}
          </button>

          {/* Bank Option */}
          <button
            type="button"
            onClick={() => handleTypeSelect('bank')}
            className={`relative p-6 rounded-xl border-2 transition-all ${
              selectedType === 'bank'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className={`p-3 rounded-full ${
                selectedType === 'bank' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Building2 className={`w-6 h-6 ${
                  selectedType === 'bank' ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">Bank Transfer</div>
                <div className="text-sm text-gray-500">Direct deposit</div>
              </div>
            </div>
            {selectedType === 'bank' && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
            )}
          </button>

          {/* M-Pesa Option */}
          <button
            type="button"
            onClick={() => handleTypeSelect('mpesa')}
            className={`relative p-6 rounded-xl border-2 transition-all ${
              selectedType === 'mpesa'
                ? 'border-green-500 bg-green-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-green-300'
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className={`p-3 rounded-full ${
                selectedType === 'mpesa' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Smartphone className={`w-6 h-6 ${
                  selectedType === 'mpesa' ? 'text-green-600' : 'text-gray-600'
                }`} />
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">M-Pesa</div>
                <div className="text-sm text-gray-500">Mobile payment</div>
              </div>
            </div>
            {selectedType === 'mpesa' && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Crypto Wallet Details */}
        {selectedType === 'crypto' && (
          <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Wallet className="w-5 h-5 mr-2 text-purple-600" />
              Crypto Wallet
            </h4>
            
            {isConnecting ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                <span className="ml-3 text-gray-600">Connecting to wallet...</span>
              </div>
            ) : isConnected && address ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Connected Wallet</div>
                    <div className="font-mono text-sm text-gray-900">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Funds will be held in a smart contract escrow until the job is completed.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => disconnect()}
                  className="text-sm text-red-600 hover:text-red-700 underline"
                >
                  Disconnect wallet
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Connect your Web3 wallet to pay with cryptocurrency
                </p>
                <button
                  type="button"
                  onClick={handleCryptoConnect}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bank Details Form */}
        {selectedType === 'bank' && (
          <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Bank Account Details
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Kenya Commercial Bank"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter account number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full name on account"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Processing Time:</strong> Bank transfers typically take 1-3 business days to process.
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleBankSubmit}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Confirm Bank Details
              </button>
            </div>
          </div>
        )}

        {/* M-Pesa Details Form */}
        {selectedType === 'mpesa' && (
          <div className="bg-white border-2 border-green-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Smartphone className="w-5 h-5 mr-2 text-green-600" />
              M-Pesa Payment Details
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  value={mpesaDetails.phoneNumber}
                  onChange={(e) => setMpesaDetails({ ...mpesaDetails, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0712345678 or +254712345678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={mpesaDetails.mpesaName}
                  onChange={(e) => setMpesaDetails({ ...mpesaDetails, mpesaName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 mb-2">
                  <strong>How it works:</strong>
                </p>
                <ol className="text-sm text-green-800 list-decimal list-inside space-y-1">
                  <li>You'll receive an STK push to your phone</li>
                  <li>Enter your M-Pesa PIN to authorize</li>
                  <li>Funds will be held in escrow until job completion</li>
                </ol>
              </div>
              
              <button
                type="button"
                onClick={handleMpesaSubmit}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Confirm M-Pesa Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
