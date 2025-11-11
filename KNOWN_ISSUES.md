# Known Issues & Fixes

## Import Assertion Error

**Error**: `Expected ";" but found "with"` in node_modules/@base-org/account

**Cause**: Some dependencies use newer JavaScript syntax (import assertions) that Vite 4 doesn't fully support.

**Impact**: This error appears in console but doesn't prevent the app from running. The app loads successfully at http://localhost:5173

**Fixes**:

### Option 1: Ignore (Recommended for Testing)
The app works fine despite this warning. You can proceed with testing.

### Option 2: Upgrade Vite (If Node 20+ is available)
```bash
npm install vite@latest
```

### Option 3: Add to vite.config.ts
Add this configuration to suppress the warning:
```typescript
export default defineConfig({
  // ... existing config
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
})
```

## Other Known Issues

### Node Version Warnings
Many packages recommend Node 20+. The app will work on Node 18.19.1 but upgrading is recommended for production.

**Fix**:
```bash
nvm install 20
nvm use 20
npm install
```

### MetaMask Connection
If MetaMask doesn't connect:
1. Ensure MetaMask extension is installed
2. Switch to Sepolia network
3. Refresh the page
4. Try clicking "Connect MetaMask" again

### Firebase Not Configured
If you see empty data or errors related to Firebase:
- This is expected if .env is not configured
- The UI will still work, but data won't persist
- See README.md for Firebase setup instructions

## Build Warnings

When running `npm install`, you may see:
- Engine version warnings (safe to ignore with Node 18)
- Deprecated package warnings (don't affect functionality)
- Audit vulnerabilities (mostly dev dependencies, safe for testing)

## Runtime Errors

### "Cannot find module '@/lib/utils'"
- Fixed by configuring path alias in tsconfig.json and vite.config.ts
- Already configured in this project

### Firebase initialization errors
- Expected if .env is not configured
- Add Firebase credentials to .env file

### Contract address errors
- Expected until contracts are deployed to Sepolia
- Deploy contracts and update .env with addresses

---

**Note**: All core functionality of the app works despite these warnings. The app successfully demonstrates the TalentBridge concept!
