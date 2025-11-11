# TalentBridge - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd talentbridge
npm install
```

### Step 2: Create Environment File

```bash
cp .env.example .env
```

**For quick testing**, you can leave Firebase and WalletConnect values as placeholders. The app will still run without backend functionality.

For full functionality, add:
- Firebase credentials from https://console.firebase.google.com
- WalletConnect Project ID from https://cloud.walletconnect.com

### Step 3: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` and you'll see the TalentBridge homepage!

### Step 4: Connect Your Wallet (Optional)

1. Install MetaMask browser extension
2. Switch to Sepolia test network
3. Get free testnet ETH from https://sepoliafaucet.com
4. Click "Connect MetaMask" button in the app

## 📸 What You'll See

### Home Page
- Hero section with project description
- Feature cards highlighting:
  - Zero platform fees
  - Trustless escrow
  - Instant settlement
  - On-chain reputation
- "How it works" section

### Jobs Page
- Job listing grid (empty until Firebase is configured)
- Search and filter by skills
- Job cards with budget and details

### Dashboard
- Requires wallet connection
- Shows:
  - Total earned
  - Active contracts
  - Completed jobs
  - Average rating
- Tabs for contracts and posted jobs

## 🔧 Testing Without Full Setup

The app is designed to run even without:
- Firebase configuration (data won't persist)
- Smart contracts deployed (contract interactions will fail gracefully)
- WalletConnect configured (only MetaMask will work)

You can explore the UI and see how everything is structured!

## 📚 Next Steps

1. **Set up Firebase** (see README.md) to enable data persistence
2. **Deploy Smart Contracts** (see DEPLOYMENT.md) to enable escrow and reviews
3. **Configure WalletConnect** for multi-wallet support

## 🐛 Common Issues

**Issue**: Port 5173 already in use
**Solution**: Kill the process or use a different port:
```bash
npm run dev -- --port 3000
```

**Issue**: Node version warnings
**Solution**: Upgrade to Node 20+:
```bash
nvm install 20
nvm use 20
```

**Issue**: MetaMask not connecting
**Solution**: 
- Make sure MetaMask is installed
- Switch to Sepolia network in MetaMask
- Refresh the page

## 🎯 Feature Checklist

- ✅ Modern UI with Tailwind CSS
- ✅ Wallet connection (MetaMask)
- ✅ Job browsing and filtering
- ✅ Dashboard with stats
- ✅ Responsive design
- ⏳ Smart contract deployment (manual step)
- ⏳ Firebase configuration (manual step)
- ⏳ Job posting form (coming soon)
- ⏳ Messaging system (coming soon)
- ⏳ Profile pages (coming soon)

## 💡 Tips

- Use the **Search** feature on Jobs page to filter listings
- Click **Dashboard** to see freelancer stats (requires wallet)
- Check **Header navigation** for all available routes
- Explore **responsive design** by resizing browser window

## 📞 Need Help?

- Check README.md for detailed setup
- Check DEPLOYMENT.md for contract deployment
- Check PROJECT_SUMMARY.md for architecture overview
- Open an issue on GitHub for bugs

---

**Happy building! 🎉**
