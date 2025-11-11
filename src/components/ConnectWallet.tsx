import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from './ui/button';
import { Wallet, LogOut, CheckCircle } from 'lucide-react';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector });
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg border border-green-300">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => disconnect()}
          className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {connectors.map((connector) => (
          <Button
            key={connector.id}
            onClick={() => handleConnect(connector)}
            disabled={isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50"
          >
            <Wallet className="h-4 w-4 mr-2" />
            {isPending ? 'Connecting...' : `Connect ${connector.name}`}
          </Button>
        ))}
      </div>
      {error && (
        <p className="text-xs text-red-600">
          {error.message || 'Failed to connect. Please try again.'}
        </p>
      )}
    </div>
  );
}
