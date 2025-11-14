const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment to Base Sepolia Testnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  const deployedContracts = {};

  try {
    // 1. Deploy JobEscrow
    console.log("📝 Deploying JobEscrow...");
    const JobEscrow = await hre.ethers.getContractFactory("JobEscrow");
    const platformFeeRate = 1000; // 10% in basis points
    const jobEscrow = await JobEscrow.deploy(platformFeeRate);
    await jobEscrow.waitForDeployment();
    const jobEscrowAddress = await jobEscrow.getAddress();
    console.log("✅ JobEscrow deployed to:", jobEscrowAddress);
    deployedContracts.JobEscrow = jobEscrowAddress;

    // 2. Deploy FreelanceEscrow
    console.log("\n📝 Deploying FreelanceEscrow...");
    const FreelanceEscrow = await hre.ethers.getContractFactory("FreelanceEscrow");
    const freelanceEscrow = await FreelanceEscrow.deploy();
    await freelanceEscrow.waitForDeployment();
    const freelanceEscrowAddress = await freelanceEscrow.getAddress();
    console.log("✅ FreelanceEscrow deployed to:", freelanceEscrowAddress);
    deployedContracts.FreelanceEscrow = freelanceEscrowAddress;

    // 3. Deploy ReviewSystem
    console.log("\n📝 Deploying ReviewSystem...");
    const ReviewSystem = await hre.ethers.getContractFactory("ReviewSystem");
    const reviewSystem = await ReviewSystem.deploy();
    await reviewSystem.waitForDeployment();
    const reviewSystemAddress = await reviewSystem.getAddress();
    console.log("✅ ReviewSystem deployed to:", reviewSystemAddress);
    deployedContracts.ReviewSystem = reviewSystemAddress;

    // Save deployment info
    const deploymentInfo = {
      network: "base-sepolia-testnet",
      chainId: 84532,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts
    };

    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }

    const filename = `base-sepolia-${Date.now()}.json`;
    fs.writeFileSync(
      path.join(deploymentsDir, filename),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log("\nDeployed Contracts:");
    console.log("-------------------");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });
    console.log("\nDeployment info saved to:", path.join("deployments", filename));
    console.log("\nView on BaseScan:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`${name}: https://sepolia.basescan.org/address/${address}`);
    });
    console.log("=".repeat(60) + "\n");

    // Test basic functionality
    console.log("🧪 Testing deployed contracts...\n");

    // Test JobEscrow
    console.log("Testing JobEscrow:");
    const owner = await jobEscrow.platformOwner();
    const feeRate = await jobEscrow.platformFeeRate();
    console.log(`  - Platform Owner: ${owner}`);
    console.log(`  - Fee Rate: ${feeRate} basis points (${feeRate/100}%)`);

    // Test FreelanceEscrow
    console.log("\nTesting FreelanceEscrow:");
    const fEscrowOwner = await freelanceEscrow.owner();
    const platformFee = await freelanceEscrow.platformFee();
    console.log(`  - Owner: ${fEscrowOwner}`);
    console.log(`  - Platform Fee: ${platformFee}%`);

    console.log("\n✅ All contracts deployed and tested successfully!\n");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
