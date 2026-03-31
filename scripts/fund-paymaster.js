const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  const config = JSON.parse(fs.readFileSync("./deployed-config-sepolia.json", "utf8"));
  
  console.log("👤 Deployer:", deployer.address);
  console.log("📦 Paymaster:", config.paymaster);
  
  const amount = ethers.parseEther("1"); // 1 ETH
  const tx = await deployer.sendTransaction({
    to: config.paymaster,
    value: amount
  });
  
  await tx.wait();
  console.log("✅ Funded Paymaster with 1 ETH");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
