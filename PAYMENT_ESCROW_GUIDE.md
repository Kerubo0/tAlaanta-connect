# Payment & Escrow Integration - Implementation Guide

## Overview
This document outlines the payment and escrow system implementation for the Taalanta TalentBridge platform.

## Features Implemented

### 1. Database Schema (supabase-schema-escrow.sql)
- **payment_methods** table: Stores user payment methods (crypto wallets, bank accounts, M-Pesa)
- **escrow** table: Manages escrow payments with status tracking
- **transactions** table: Records all financial transactions
- PostgreSQL functions for escrow management:
  - `fund_escrow()`: Deposits funds into escrow
  - `release_escrow()`: Releases funds to freelancer
  - `refund_escrow()`: Refunds client

### 2. Smart Contract (contracts/JobEscrow.sol)
- Solidity escrow contract for cryptocurrency payments
- Functions:
  - `createAndFundEscrow()`: Lock crypto in smart contract
  - `releasePayment()`: Pay freelancer when job done
  - `refundPayment()`: Return funds if cancelled
  - `raiseDispute()`: Initiate dispute resolution
  - `resolveDispute()`: Platform admin resolves disputes

### 3. Payment Method Selector Component (PaymentMethodSelector.tsx)
- Three payment options:
  - **Cryptocurrency**: Auto-connects Web3 wallet (MetaMask, WalletConnect)
  - **Bank Transfer**: Bank account form
  - **M-Pesa**: Kenyan mobile payment
- Real-time payment summary with service fee breakdown
- Auto wallet connection when crypto is selected

### 4. Updated Post Job Flow
- **Step 1: Job Details** - Fill in job information
- **Step 2: Payment & Escrow** - Select payment method and fund escrow
- Progress indicator shows current step
- Payment required before job posting
- Funds locked in escrow until completion

## Payment Flow

### Crypto Payment
1. Client selects "Cryptocurrency"
2. Wallet auto-connects (Web3)
3. Client reviews payment amount (project + 10% fee)
4. Transaction sent to smart contract
5. Funds locked in escrow
6. Job posted with `escrow_status: 'funded'`

### Bank Transfer
1. Client enters bank details
2. Creates pending escrow record
3. Manual verification required
4. Job posted with `payment_status: 'pending'`

### M-Pesa
1. Client enters M-Pesa phone number
2. STK push initiated (Daraja API integration needed)
3. Client confirms on phone
4. Escrow funded
5. Job posted

## Database Setup

Run the SQL schema in your Supabase SQL Editor:
```bash
# Execute: talentbridge/supabase-schema-escrow.sql
```

This will create:
- All tables with proper indexes
- Row Level Security policies
- PostgreSQL functions for escrow management

## Smart Contract Deployment

### Prerequisites
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### Deployment Steps
1. Compile contract:
   ```bash
   npx hardhat compile
   ```

2. Deploy to testnet (Sepolia):
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

3. Update `ESCROW_CONTRACT_ADDRESS` in PostJobPage.tsx

### Contract Configuration
- Platform fee rate: 1000 (10%)
- Dispute timeout: 30 days
- Supports: ETH, USDT, USDC

## Integration Checklist

### ✅ Completed
- [x] Database schema with escrow tables
- [x] Smart contract for crypto escrow
- [x] Payment method selector component
- [x] Wallet auto-connect functionality
- [x] Two-step job posting flow
- [x] Service fee calculation (10%)

### ⏳ Pending Implementation
- [ ] M-Pesa Daraja API integration
- [ ] Bank transfer verification system
- [ ] Smart contract deployment to mainnet
- [ ] Escrow release UI for job completion
- [ ] Dispute resolution admin panel
- [ ] Multi-currency support
- [ ] Exchange rate conversion

## Configuration

### Environment Variables
Add to your `.env`:
```env
VITE_ESCROW_CONTRACT_ADDRESS=0x... # After deployment
VITE_BLOCKCHAIN_NETWORK=sepolia # or mainnet
VITE_MPESA_CONSUMER_KEY=your_key
VITE_MPESA_CONSUMER_SECRET=your_secret
```

### Supabase Configuration
Ensure these fields are added to the `jobs` table:
- `service_fee` (NUMERIC)
- `total_amount` (NUMERIC)
- `payment_status` (TEXT)
- `escrow_status` (TEXT)
- `escrow_tx_hash` (TEXT)
- `payment_method` (TEXT)

## Usage

### For Clients
1. Navigate to "Post a Job"
2. Fill in job details
3. Click "Continue to Payment"
4. Select payment method:
   - **Crypto**: Wallet connects automatically
   - **Bank**: Enter account details
   - **M-Pesa**: Enter phone number
5. Confirm payment details
6. Click "Fund Escrow & Post Job"
7. Funds locked until job completion

### For Freelancers
- Apply to jobs normally
- Client assigns job
- Complete work
- Client approves
- Escrow automatically releases payment

## Security Features

1. **Smart Contract Escrow**: Funds held on blockchain (crypto payments)
2. **Row Level Security**: Database policies enforce user permissions
3. **Transaction Logging**: All payments tracked in transactions table
4. **Dispute Resolution**: Platform admin can resolve conflicts
5. **Timeout Protection**: Emergency withdraw after 30 days

## Testing

### Test Crypto Payment (Testnet)
1. Get test ETH from Sepolia faucet
2. Connect MetaMask to Sepolia network
3. Post test job with small amount
4. Verify transaction on Etherscan

### Test Bank Transfer
1. Enter dummy bank details
2. Check escrow table for pending status
3. Manually mark as verified in database

### Test M-Pesa (Sandbox)
1. Use Safaricom Daraja sandbox credentials
2. Use test phone number: 254708374149
3. Verify STK push received

## Troubleshooting

### Wallet Won't Connect
- Ensure MetaMask is installed
- Check correct network selected
- Clear browser cache

### Transaction Fails
- Check wallet has sufficient funds
- Verify gas fees available
- Check contract address is correct

### Escrow Not Creating
- Verify database schema is applied
- Check RLS policies allow inserts
- Review browser console for errors

## API Endpoints Needed

### Backend (To Be Implemented)
1. **POST /api/mpesa/stk-push**
   - Initiates M-Pesa payment
   - Returns transaction reference

2. **POST /api/bank/verify**
   - Verifies bank transfer received
   - Updates escrow status

3. **POST /api/escrow/release**
   - Releases escrow to freelancer
   - Called when job marked complete

4. **POST /api/dispute/create**
   - Creates dispute record
   - Notifies admin

## Next Steps

1. **Deploy Smart Contract**
   - Test on Sepolia testnet
   - Audit contract security
   - Deploy to Ethereum mainnet

2. **Implement M-Pesa API**
   - Register Daraja API account
   - Implement STK push
   - Handle callbacks

3. **Build Escrow Release Flow**
   - Job completion workflow
   - Client approval UI
   - Automatic payment release

4. **Admin Dashboard**
   - View all escrow transactions
   - Resolve disputes
   - Manual payment releases

## Support

For issues or questions:
- Check Supabase logs for database errors
- Review browser console for frontend errors
- Check blockchain explorer for transaction status
- Contact platform admin for payment disputes

---

**Version**: 1.0.0  
**Last Updated**: 2024-11-14  
**Author**: Taalanta Development Team
