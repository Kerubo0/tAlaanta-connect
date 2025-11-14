/**
 * Smart Contract Addresses - Base Sepolia Testnet
 * Deployed on: November 14, 2025
 */

export const CONTRACT_ADDRESSES = {
  // Job Escrow Contract - Handles cryptocurrency escrow for jobs
  JOB_ESCROW: '0x71D384235f4AF6653d54A05178DD18F97FFAB799',
  
  // Freelance Escrow Contract - Handles milestone-based payments
  FREELANCE_ESCROW: '0x0Fb22c9f51d7C990ab6EE10a955E51FC9a4adb9B',
  
  // Review System Contract - On-chain reviews and reputation
  REVIEW_SYSTEM: '0x087D6d697FbcF96714aBB2Bcf89773e640095aD4',
} as const;

export const NETWORK_CONFIG = {
  chainId: 84532, // Base Sepolia
  chainName: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
} as const;

// Contract explorer links
export const CONTRACT_LINKS = {
  JOB_ESCROW: `${NETWORK_CONFIG.blockExplorer}/address/${CONTRACT_ADDRESSES.JOB_ESCROW}`,
  FREELANCE_ESCROW: `${NETWORK_CONFIG.blockExplorer}/address/${CONTRACT_ADDRESSES.FREELANCE_ESCROW}`,
  REVIEW_SYSTEM: `${NETWORK_CONFIG.blockExplorer}/address/${CONTRACT_ADDRESSES.REVIEW_SYSTEM}`,
} as const;

export const PLATFORM_FEE_RATE = 0.10; // 10% platform fee
