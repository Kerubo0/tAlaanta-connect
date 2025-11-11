# 📋 Base Sepolia Deployment Checklist

## ✅ Setup Complete
- [x] Hardhat installed and configured
- [x] Deployment script created (`scripts/deploy.js`)
- [x] Hardhat config set for Base Sepolia
- [x] Wagmi config updated to support Base Sepolia
- [x] Contracts compiled successfully
- [x] Documentation created

## ⏳ Your Action Items

### 1. Get Test ETH
- [ ] Visit https://sepoliafaucet.com/ and get Sepolia ETH
- [ ] Bridge to Base Sepolia at https://bridge.base.org/
- [ ] Or use Coinbase faucet (requires account)

### 2. Export Private Key
- [ ] Open MetaMask → Account Details → Export Private Key
- [ ] Copy the private key (64 characters)
- [ ] ⚠️ NEVER share or commit this!

### 3. Configure .env
- [ ] Open `.env` file
- [ ] Add your private key:
  ```
  PRIVATE_KEY=your_key_here_no_0x_prefix
  ```
- [ ] Save the file

### 4. Deploy Contracts
- [ ] Run: `npm run deploy:base-sepolia`
- [ ] Wait for confirmation (takes 1-2 minutes)
- [ ] Copy the deployed contract addresses

### 5. Update Frontend
- [ ] Add addresses to `.env`:
  ```
  VITE_ESCROW_CONTRACT_ADDRESS=0x...
  VITE_REVIEW_CONTRACT_ADDRESS=0x...
  ```
- [ ] Restart dev server: `npm run dev`

### 6. Test in Browser
- [ ] Open http://localhost:5175
- [ ] Connect MetaMask (switch to Base Sepolia)
- [ ] Try creating a job
- [ ] Test escrow functionality

## 🚀 Quick Commands

```bash
# Compile contracts
npm run compile

# Deploy to Base Sepolia
npm run deploy:base-sepolia

# Verify contract (after deployment)
npm run verify:base-sepolia <CONTRACT_ADDRESS>

# Start frontend
npm run dev
```

## 📚 Resources

- Deployment Guide: `DEPLOY_BASE_SEPOLIA.md`
- Hardhat Config: `hardhat.config.js`
- Deploy Script: `scripts/deploy.js`
- Wagmi Config: `src/lib/wagmi.ts`

## ⚠️ Important Notes

1. **Private Key Security**
   - Never commit `.env` to git
   - Use test wallet, not main wallet
   - Store securely

2. **Network Check**
   - Make sure MetaMask is on Base Sepolia (Chain ID: 84532)
   - RPC URL: https://sepolia.base.org
   - Get test ETH before deploying

3. **Gas Costs**
   - Deployment costs ~0.01-0.02 ETH
   - Make sure you have enough balance
   - Base Sepolia is cheaper than Ethereum mainnet

## 🆘 Need Help?

**Error: insufficient funds**
→ Get more test ETH from faucet or bridge

**Error: network not found**
→ Check `BASE_SEPOLIA_RPC_URL` in `.env`

**MetaMask won't connect**
→ Add Base Sepolia network manually (see DEPLOY_BASE_SEPOLIA.md)

**Contracts won't verify**
→ Make sure you have `BASESCAN_API_KEY` in `.env`

---

## ✨ After Successful Deployment

You'll have:
- ✅ FreelanceEscrow contract on Base Sepolia
- ✅ ReviewSystem contract on Base Sepolia  
- ✅ Frontend connected to your contracts
- ✅ Viewable on https://sepolia.basescan.org

Ready to build your Web3 freelance marketplace! 🎉
