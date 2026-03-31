const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  
  // Fix: use provider.getBalance() instead of deployer.getBalance()
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  const factory = await ethers.getContractFactory("AccountFactory");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const factoryAddress = await contract.getAddress();
  console.log("📦 AccountFactory deployed to:", factoryAddress);

  const paymasterFactory = await ethers.getContractFactory("Paymaster");
  const paymaster = await paymasterFactory.deploy(deployer.address);
  await paymaster.waitForDeployment();
  
  const paymasterAddress = await paymaster.getAddress();
  console.log("📦 Paymaster deployed to:", paymasterAddress);

  const config = {
    accountFactory: factoryAddress,
    paymaster: paymasterAddress,
    deployer: deployer.address,
    chainId: 31337
  };

  fs.writeFileSync(
    path.resolve("./deployed-config.json"),
    JSON.stringify(config, null, 2)
  );

  console.log("✅ Configuration saved to deployed-config.json");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
