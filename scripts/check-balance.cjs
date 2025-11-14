const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  
  console.log("=".repeat(60));
  console.log("Wallet Information");
  console.log("=".repeat(60));
  console.log("Address:", signer.address);
  
  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("=".repeat(60));
  
  if (balance === 0n) {
    console.log("\n⚠️  ZERO BALANCE DETECTED!");
    console.log("\nTo deploy contracts, you need to:");
    console.log("1. Send ETH to the address above on Base Mainnet");
    console.log("2. Estimated gas needed: ~0.005 ETH (for all 3 contracts)");
    console.log("\nYou can bridge ETH to Base at: https://bridge.base.org");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
