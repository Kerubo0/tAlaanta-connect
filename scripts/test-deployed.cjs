const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🧪 Testing deployed contracts on Base Sepolia Testnet...\n");

  // Load latest deployment
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const files = fs.readdirSync(deploymentsDir).filter(f => f.startsWith("base-sepolia"));
  
  if (files.length === 0) {
    console.error("❌ No deployment files found. Please deploy contracts first.");
    process.exit(1);
  }

  const latestDeployment = files.sort().reverse()[0];
  const deploymentData = JSON.parse(
    fs.readFileSync(path.join(deploymentsDir, latestDeployment), "utf8")
  );

  console.log("Loading contracts from:", latestDeployment);
  console.log("Deployed at:", deploymentData.timestamp);
  console.log("Deployer:", deploymentData.deployer);
  console.log("\n" + "=".repeat(60) + "\n");

  const [signer] = await hre.ethers.getSigners();

  try {
    // Test JobEscrow
    console.log("Testing JobEscrow at:", deploymentData.contracts.JobEscrow);
    const JobEscrow = await hre.ethers.getContractFactory("JobEscrow");
    const jobEscrow = JobEscrow.attach(deploymentData.contracts.JobEscrow);

    const platformOwner = await jobEscrow.platformOwner();
    const feeRate = await jobEscrow.platformFeeRate();
    const disputeTimeout = await jobEscrow.disputeTimeout();

    console.log("  ✅ Platform Owner:", platformOwner);
    console.log("  ✅ Fee Rate:", feeRate.toString(), "basis points");
    console.log("  ✅ Dispute Timeout:", disputeTimeout.toString(), "seconds");

    // Test FreelanceEscrow
    console.log("\nTesting FreelanceEscrow at:", deploymentData.contracts.FreelanceEscrow);
    const FreelanceEscrow = await hre.ethers.getContractFactory("FreelanceEscrow");
    const freelanceEscrow = FreelanceEscrow.attach(deploymentData.contracts.FreelanceEscrow);

    const owner = await freelanceEscrow.owner();
    const platformFee = await freelanceEscrow.platformFee();

    console.log("  ✅ Owner:", owner);
    console.log("  ✅ Platform Fee:", platformFee.toString(), "%");

    // Test ReviewSystem
    console.log("\nTesting ReviewSystem at:", deploymentData.contracts.ReviewSystem);
    const ReviewSystem = await hre.ethers.getContractFactory("ReviewSystem");
    const reviewSystem = ReviewSystem.attach(deploymentData.contracts.ReviewSystem);

    // Check if contract is accessible
    const code = await hre.ethers.provider.getCode(deploymentData.contracts.ReviewSystem);
    console.log("  ✅ Contract deployed (bytecode length):", code.length);

    console.log("\n" + "=".repeat(60));
    console.log("✅ All contracts tested successfully!");
    console.log("=".repeat(60) + "\n");

    // Print contract addresses for easy copying
    console.log("Contract Addresses (for frontend configuration):");
    console.log("------------------------------------------------");
    console.log(`ESCROW_CONTRACT_ADDRESS="${deploymentData.contracts.JobEscrow}"`);
    console.log(`FREELANCE_ESCROW_ADDRESS="${deploymentData.contracts.FreelanceEscrow}"`);
    console.log(`REVIEW_SYSTEM_ADDRESS="${deploymentData.contracts.ReviewSystem}"`);
    console.log("\n");

  } catch (error) {
    console.error("\n❌ Testing failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
