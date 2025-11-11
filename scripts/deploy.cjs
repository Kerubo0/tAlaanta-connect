const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying TalentBridge contracts to Base Sepolia...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy FreelanceEscrow
  console.log("📦 Deploying FreelanceEscrow...");
  const FreelanceEscrow = await hre.ethers.getContractFactory("FreelanceEscrow");
  const escrow = await FreelanceEscrow.deploy();
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("✅ FreelanceEscrow deployed to:", escrowAddress);

  // Deploy ReviewSystem
  console.log("\n📦 Deploying ReviewSystem...");
  const ReviewSystem = await hre.ethers.getContractFactory("ReviewSystem");
  const review = await ReviewSystem.deploy();
  await review.waitForDeployment();
  const reviewAddress = await review.getAddress();
  console.log("✅ ReviewSystem deployed to:", reviewAddress);

  // Display summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:          Base Sepolia (Chain ID: 84532)");
  console.log("Deployer:        ", deployer.address);
  console.log("FreelanceEscrow: ", escrowAddress);
  console.log("ReviewSystem:    ", reviewAddress);
  console.log("=".repeat(60));

  console.log("\n📋 Next Steps:");
  console.log("1. Add these addresses to your .env file:");
  console.log(`   VITE_ESCROW_CONTRACT_ADDRESS=${escrowAddress}`);
  console.log(`   VITE_REVIEW_CONTRACT_ADDRESS=${reviewAddress}`);
  
  console.log("\n2. Update your wagmi config to use Base Sepolia");
  
  console.log("\n3. Verify contracts on BaseScan:");
  console.log(`   npx hardhat verify --network baseSepolia ${escrowAddress}`);
  console.log(`   npx hardhat verify --network baseSepolia ${reviewAddress}`);
  
  console.log("\n4. View on BaseScan:");
  console.log(`   https://sepolia.basescan.org/address/${escrowAddress}`);
  console.log(`   https://sepolia.basescan.org/address/${reviewAddress}`);
  
  console.log("\n💡 Get test ETH from Base Sepolia faucet:");
  console.log("   https://www.coinbase.com/faucets/base-ethereum-goerli-faucet");
  console.log("   or bridge from Sepolia: https://bridge.base.org\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
