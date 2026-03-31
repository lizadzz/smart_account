const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  
  console.log("=================================");
  console.log("Wallet Balance Check");
  console.log("=================================");
  console.log("Network:", "Sepolia" );
  console.log("Address:", deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("=================================");
  
  if (balance > 0) {
    console.log("✅ You have ETH! Ready to deploy.");
  } else {
    console.log("⚠️  No ETH balance. Get Sepolia ETH from:");
    console.log("   https://cloudflare-eth.com/faucet");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
