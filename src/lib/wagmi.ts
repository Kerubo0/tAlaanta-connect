import { http, createConfig } from 'wagmi';
import { sepolia, baseSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia, sepolia],
  connectors: [injected()],
  transports: {
    [baseSepolia.id]: http(),
    [sepolia.id]: http(),
  },
});
