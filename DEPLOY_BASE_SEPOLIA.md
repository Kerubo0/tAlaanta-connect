# 🚀 Deploy to Base Sepolia - Quick Guide

## Prerequisites

1. **MetaMask Wallet** with Base Sepolia network added
2. **Test ETH** on Base Sepolia network
3. **Private Key** from your MetaMask wallet

## Step 1: Get Test ETH for Base Sepolia

### Option A: Bridge from Sepolia (Recommended)
1. Get Sepolia ETH from faucet: https://sepoliafaucet.com/
2. Bridge to Base Sepolia: https://bridge.base.org/deposit
3. Select "Sepolia" → "Base Sepolia"
4. Bridge small amount (0.05 ETH is enough)

### Option B: Base Sepolia Faucet
- Coinbase Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- (Requires Coinbase account)

## Step 2: Export Your Private Key

⚠️ **WARNING**: Never share or commit your private key!

1. Open MetaMask
2. Click account menu (3 dots)
3. Account Details → Export Private Key
4. Enter MetaMask password
5. Copy the private key

## Step 3: Configure Environment

Add your private key to `.env`:

```bash
# IMPORTANT: Never commit this file to git!
PRIVATE_KEY=your_private_key_here_without_0x
```

Your `.env` should now have:
```
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=optional_for_verification
```

## Step 4: Deploy Contracts

Run the deployment script:

```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

You should see:
```
🚀 Deploying TalentBridge contracts to Base Sepolia...

📝 Deploying contracts with account: 0x...
💰 Account balance: 0.05 ETH

📦 Deploying FreelanceEscrow...
✅ FreelanceEscrow deployed to: 0x...

📦 Deploying ReviewSystem...
✅ ReviewSystem deployed to: 0x...

============================================================
🎉 DEPLOYMENT SUMMARY
============================================================
Network:          Base Sepolia (Chain ID: 84532)
Deployer:         0x...
FreelanceEscrow:  0x...
ReviewSystem:     0x...
============================================================
```

## Step 5: Update Frontend Configuration

Copy the deployed addresses to your `.env`:

```bash
VITE_ESCROW_CONTRACT_ADDRESS=0x...  # From deployment output
VITE_REVIEW_CONTRACT_ADDRESS=0x...  # From deployment output
```

## Step 6: Verify Contracts (Optional)

Get BaseScan API key: https://basescan.org/myapikey

Add to `.env`:
```bash
BASESCAN_API_KEY=your_api_key
```

Verify contracts:
```bash
npx hardhat verify --network baseSepolia <ESCROW_ADDRESS>
npx hardhat verify --network baseSepolia <REVIEW_ADDRESS>
```

## Step 7: Test in Frontend

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5175

3. Connect MetaMask (make sure you're on Base Sepolia)

4. Try creating a job or contract!

## Troubleshooting

### Error: "insufficient funds"
- You need Base Sepolia ETH in your deployer wallet
- Bridge from Sepolia or use faucet

### Error: "invalid private key"
- Make sure private key has no `0x` prefix in `.env`
- Private key should be 64 characters (hex)

### Error: "network not found"
- Check `BASE_SEPOLIA_RPC_URL` in `.env`
- Default: `https://sepolia.base.org`

### MetaMask doesn't show Base Sepolia
Add network manually:
- Network Name: Base Sepolia
- RPC URL: https://sepolia.base.org  
- Chain ID: 84532
- Currency: ETH
- Block Explorer: https://sepolia.basescan.org

## Useful Links

- 🌉 Base Bridge: https://bridge.base.org
- 💧 Sepolia Faucet: https://sepoliafaucet.com
- 🔍 BaseScan Sepolia: https://sepolia.basescan.org
- 📚 Base Docs: https://docs.base.org
- 💬 Base Discord: https://discord.gg/buildonbase

## Network Details

- **Network**: Base Sepolia Testnet
- **Chain ID**: 84532
- **Currency**: ETH (test)
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org

## What's Next?

After successful deployment:

1. ✅ Contracts deployed to Base Sepolia
2. ✅ Frontend configured with contract addresses
3. ✅ MetaMask connected to Base Sepolia
4. 🎉 Ready to test your dApp!

Try:
- Post a job
- Create escrow contract
- Submit milestones
- Leave reviews
- Check transactions on BaseScan

---

**Need help?** Check the Hardhat docs or Base documentation.

Good luck with your deployment! 🚀
