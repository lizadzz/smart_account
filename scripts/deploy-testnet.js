const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Fix: Use provider.getNetwork() instead of deployer.getChainId()
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;
  
  console.log("👤 Deployer:", deployer.address);
  console.log("🔗 Chain ID:", chainId);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
  
  console.log("\n📦 Deploying AccountFactory...");
  const Factory = await ethers.getContractFactory("AccountFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("✅ AccountFactory deployed to:", factoryAddress);
  
  console.log("\n📦 Deploying Paymaster...");
  const Paymaster = await ethers.getContractFactory("Paymaster");
  const paymaster = await Paymaster.deploy(deployer.address);
  await paymaster.waitForDeployment();
  
  const paymasterAddress = await paymaster.getAddress();
  console.log("✅ Paymaster deployed to:", paymasterAddress);
  
  const config = {
    accountFactory: factoryAddress,
    paymaster: paymasterAddress,
    deployer: deployer.address,
    chainId: Number(chainId),
    network: chainId === 11155111 ? "sepolia" : chainId === 17000 ? "holesky" : "unknown"
  };
  
  const fileName = `deployed-config-${config.network}.json`;
  fs.writeFileSync(fileName, JSON.stringify(config, null, 2));
  console.log("\n✅ Configuration saved to:", fileName);
  
  console.log("\n============================================");
  console.log("DEPLOYMENT SUMMARY");
  console.log("============================================");
  console.log("Network:", config.network);
  console.log("AccountFactory:", factoryAddress);
  console.log("Paymaster:", paymasterAddress);
  console.log("Deployer:", deployer.address);
  console.log("============================================");
  
  console.log("\n⚠️  NEXT STEPS:");
  console.log("1. View contracts on Etherscan:");
  console.log("   Sepolia: https://sepolia.etherscan.io/address/", factoryAddress);
  console.log("   Holesky: https://holesky.etherscan.io/address/", factoryAddress);
  
  console.log("\n2. Verify contracts (optional):");
  console.log("   npx hardhat verify --network", config.network, factoryAddress);
  console.log("   npx hardhat verify --network", config.network, paymasterAddress, deployer.address);
  
  console.log("\n3. Fund Paymaster with ETH for gas sponsorship");
  console.log("4. Stake on EntryPoint (required for paymasters)");
  console.log("5. Whitelist your account addresses in Paymaster");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
