const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);

  const config = JSON.parse(fs.readFileSync("./deployed-config.json", "utf8"));
  
  const PAYMASTER_ADDRESS = config.paymaster;
  const ENTRY_POINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
  
  console.log("\n=== Deposit Configuration ===");
  console.log("Paymaster:", PAYMASTER_ADDRESS);
  console.log("EntryPoint:", ENTRY_POINT_ADDRESS);
  
  console.log("\n📥 Depositing ETH to Paymaster...");
  const paymasterAmount = ethers.parseEther("2");
  
  const paymasterTx = await deployer.sendTransaction({
    to: PAYMASTER_ADDRESS,
    value: paymasterAmount
  });
  
  await paymasterTx.wait();
  console.log("✅ Paymaster received:", ethers.formatEther(paymasterAmount), "ETH");
  
  const paymasterBalance = await ethers.provider.getBalance(PAYMASTER_ADDRESS);
  console.log("    Paymaster balance:", ethers.formatEther(paymasterBalance), "ETH");
  
  console.log("\n🔗 Staking on EntryPoint (required for paymasters)...");
  
  const EntryPointABI = [
    "function addStake(uint32 unstakeDelaySec) payable returns ()"
  ];
  
  const entryPoint = new ethers.Contract(ENTRY_POINT_ADDRESS, EntryPointABI, deployer);
  
  const stakeAmount = ethers.parseEther("1");
  const lockTime = 0;
  
  const stakeTx = await entryPoint.addStake(lockTime, {
    value: stakeAmount
  });
  
  await stakeTx.wait();
  console.log("✅ Staked 1 ETH on EntryPoint");
  
  console.log("\n📦 Additional deposit to EntryPoint...");
  
  const accountAmount = ethers.parseEther("0.5");
  
  const depositTx2 = await deployer.sendTransaction({
    to: ENTRY_POINT_ADDRESS,
    value: accountAmount
  });
  
  await depositTx2.wait();
  console.log("✅ Deposited 0.5 ETH to EntryPoint");
  
  const entryPointBalance = await ethers.provider.getBalance(ENTRY_POINT_ADDRESS);
  console.log("    EntryPoint contract balance:", ethers.formatEther(entryPointBalance), "ETH");
  
  console.log("\n💰 Deposit complete!");
  console.log("==========================");
  console.log("Paymaster balance:", ethers.formatEther(paymasterBalance), "ETH");
  console.log("Total staked/deposited on EntryPoint:", ethers.formatEther(stakeAmount + accountAmount), "ETH");
  console.log("==========================");
  console.log("\n⚠️  NEXT STEPS:");
  console.log("1. Create an account:");
  console.log("   npx hardhat run scripts/createAccount.js --network localhost");
  console.log("\n2. Whitelist account in Paymaster (add to contract):");
  console.log("   const Paymaster = await ethers.getContractFactory('Paymaster');");
  console.log("   const paymaster = Paymaster.attach('" + PAYMASTER_ADDRESS + "');");
  console.log("   await paymaster.addToWhitelist(YOUR_ACCOUNT_ADDRESS);");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
