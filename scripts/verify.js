const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const config = JSON.parse(require("fs").readFileSync("./deployed-config-sepolia.json", "utf8"));
  
  const factoryAddress = config.accountFactory;
  const paymasterAddress = config.paymaster;
  const deployerAddress = config.deployer;
  
  console.log("🔍 Verifying contracts on Sepolia...");
  console.log("AccountFactory:", factoryAddress);
  console.log("Paymaster:", paymasterAddress);
  
  console.log("\n⏳ Verifying AccountFactory...");
  try {
    await hre.run("verify:verify", {
      address: factoryAddress
    });
    console.log("✅ AccountFactory verified!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  AccountFactory already verified.");
    } else {
      console.log("⚠️  Verification failed:", error.message);
    }
  }
  
  console.log("\n⏳ Verifying Paymaster...");
  try {
    await hre.run("verify:verify", {
      address: paymasterAddress,
      constructorArguments: [deployerAddress]
    });
    console.log("✅ Paymaster verified!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  Paymaster already verified.");
    } else {
      console.log("⚠️  Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
