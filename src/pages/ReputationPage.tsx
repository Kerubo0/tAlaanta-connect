import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useParams } from 'react-router-dom';
import { ReputationDisplay } from '@/components/AquaReputation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ReputationPage() {
  const { address: addressParam } = useParams<{ address: string }>();
  const { address: connectedAddress } = useAccount();
  const [copied, setCopied] = useState(false);

  const displayAddress = addressParam || connectedAddress || '';

  const copyAddress = () => {
    navigator.clipboard.writeText(displayAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!displayAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Shield className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Connect Wallet to View Reputation
          </h1>
          <p className="text-gray-600">
            Please connect your wallet to view your reputation score
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-6 sm:py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl sm:text-3xl mb-2 flex items-center gap-2">
                    <Shield className="h-7 w-7" />
                    Aqua Protocol Reputation
                  </CardTitle>
                  <p className="text-white/90">
                    Verifiable, cryptographically-signed reviews that cannot be faked
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={copyAddress}
                  className="w-full sm:w-auto gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Address
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-white/20 rounded-lg font-mono text-xs sm:text-sm break-all">
                {displayAddress}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reputation Display */}
        <ReputationDisplay address={displayAddress} />

        {/* Info Section */}
        <Card className="mt-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              About Aqua Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              TalentBridge uses the Aqua Protocol to create unfakeable, verifiable reviews:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Cryptographic Signatures:</strong> Each review is signed with your Ethereum wallet,
                  making it impossible to forge
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Immutable Hash Chains:</strong> Reviews are linked in a chain where changing any
                  data breaks the entire verification
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Public Verification:</strong> Anyone can independently verify the authenticity of
                  reviews without trusting TalentBridge
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Fraud Detection:</strong> Automated algorithms detect suspicious patterns like duplicate
                  signatures and rapid-fire reviews
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>On-Chain Anchoring (Optional):</strong> Reviews can be anchored to Base Sepolia
                  blockchain for additional security
                </span>
              </li>
            </ul>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                Learn more about Aqua Protocol:{' '}
                <a
                  href="https://aqua-protocol.org/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  aqua-protocol.org/docs
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
