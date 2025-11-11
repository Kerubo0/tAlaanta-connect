# TalentBridge - Decentralized Freelance Marketplace# React + TypeScript + Vite



A Web3-powered freelance marketplace built with React, TypeScript, Tailwind CSS, Firebase, and Solidity smart contracts on Sepolia testnet.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## 🚀 FeaturesCurrently, two official plugins are available:



- **Web3 Wallet Authentication**: Connect via MetaMask or WalletConnect- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh

- **Zero Platform Fees**: Direct payments between clients and freelancers- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- **Smart Contract Escrow**: Trustless milestone-based payments

- **On-Chain Reputation**: Verifiable reviews and ratings stored on blockchain## Expanding the ESLint configuration

- **Real-time Messaging**: Firebase Realtime Database for instant communication

- **IPFS Portfolio Storage**: Decentralized portfolio hostingIf you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- **Responsive Design**: Beautiful UI with shadcn/ui components

- Configure the top-level `parserOptions` property like this:

## 📋 Prerequisites

```js

- Node.js 18+ (Node 20+ recommended)   parserOptions: {

- MetaMask or compatible Web3 wallet    ecmaVersion: 'latest',

- Firebase account    sourceType: 'module',

- WalletConnect Project ID    project: ['./tsconfig.json', './tsconfig.node.json'],

- Sepolia testnet ETH (get from faucet)    tsconfigRootDir: __dirname,

   },

## 🛠️ Installation```



1. **Install dependencies:**- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`

   ```bash- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`

   npm install- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

   ```

2. **Configure Environment Variables:**
   
   Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

   Fill in your credentials:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com

   # WalletConnect
   VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

   # Smart Contract Addresses (update after deployment)
   VITE_ESCROW_CONTRACT_ADDRESS=0x...
   VITE_REVIEW_CONTRACT_ADDRESS=0x...
   ```

## 🔥 Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore, Realtime Database, Storage, and Authentication
3. Create collections: `users`, `jobs`, `proposals`, `contracts`, `reviews`, `conversations`, `messages`

## 📝 Smart Contract Deployment

1. **Install Hardhat:**
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   npx hardhat init
   ```

2. **Copy contracts to Hardhat:**
   ```bash
   cp contracts/*.sol <hardhat-project>/contracts/
   ```

3. **Create deployment script and deploy to Sepolia**

4. **Update .env with deployed contract addresses**

## 🎨 Development

```bash
npm run dev
```

Visit `http://localhost:5173`

## 🏗️ Build

```bash
npm run build
npm run preview
```

## 🌐 Deployment

Deploy to Vercel, Netlify, or any static hosting service.

## 📄 License

MIT License

---

Built with ❤️ for the Web3 community
# tAlaanta-connect
