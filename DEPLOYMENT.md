# TalentBridge Deployment Guide

## Smart Contract Deployment with Hardhat

### Step 1: Set up Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
npx hardhat init
```

Choose "Create a JavaScript project" when prompted.

### Step 2: Configure Hardhat

Create `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

### Step 3: Add Environment Variables

Add to `.env`:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_wallet_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Step 4: Copy Smart Contracts

```bash
cp contracts/FreelanceEscrow.sol <hardhat-folder>/contracts/
cp contracts/ReviewSystem.sol <hardhat-folder>/contracts/
```

### Step 5: Create Deployment Script

Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to Sepolia...");

  // Deploy FreelanceEscrow
  const FreelanceEscrow = await hre.ethers.getContractFactory("FreelanceEscrow");
  const escrow = await FreelanceEscrow.deploy();
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("FreelanceEscrow deployed to:", escrowAddress);

  // Deploy ReviewSystem
  const ReviewSystem = await hre.ethers.getContractFactory("ReviewSystem");
  const review = await ReviewSystem.deploy();
  await review.waitForDeployment();
  const reviewAddress = await review.getAddress();
  console.log("ReviewSystem deployed to:", reviewAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("FreelanceEscrow:", escrowAddress);
  console.log("ReviewSystem:", reviewAddress);
  console.log("\nAdd these addresses to your .env file:");
  console.log(`VITE_ESCROW_CONTRACT_ADDRESS=${escrowAddress}`);
  console.log(`VITE_REVIEW_CONTRACT_ADDRESS=${reviewAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Step 6: Compile and Deploy

```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

### Step 7: Verify on Etherscan (Optional)

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### Step 8: Update Frontend .env

Copy the deployed contract addresses to your frontend `.env`:

```env
VITE_ESCROW_CONTRACT_ADDRESS=0x...
VITE_REVIEW_CONTRACT_ADDRESS=0x...
```

## Frontend Deployment

### Option 1: Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Option 2: Netlify

```bash
npm run build
# Upload dist folder to Netlify
```

### Option 3: GitHub Pages

```bash
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy": "gh-pages -d dist"

npm run build
npm run deploy
```

## Testing the Application

1. Get Sepolia ETH from faucet: https://sepoliafaucet.com
2. Connect MetaMask to Sepolia network
3. Connect wallet on the site
4. Test creating jobs, contracts, and reviews

## Troubleshooting

- **MetaMask not connecting**: Switch to Sepolia network
- **Transaction failing**: Check you have enough Sepolia ETH
- **Firebase errors**: Verify all environment variables are set
- **Contract errors**: Check contract addresses in .env

## Production Checklist

- [ ] Smart contracts deployed and verified
- [ ] Firebase project configured with proper security rules
- [ ] Environment variables set in deployment platform
- [ ] WalletConnect Project ID configured
- [ ] Test all core features on testnet
- [ ] Documentation updated
