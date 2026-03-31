const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);

  const config = JSON.parse(fs.readFileSync("./deployed-config.json", "utf8"));

  const Factory = await ethers.getContractFactory("AccountFactory");
  const factory = Factory.attach(config.accountFactory);

  const entryPoint = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
  const owner = deployer.address;
  const nonce = 0;

  const accountAddress = await factory.getAccountAddress(owner, entryPoint, nonce);
  console.log("📟 Computed account address:", accountAddress);

  const code = await ethers.provider.getCode(accountAddress);
  if (code === "0x") {
    console.log("⏳ Deploying account...");
    const tx = await factory.createAccount(owner, entryPoint, nonce);
    await tx.wait();
    console.log("✅ Account deployed at:", accountAddress);
  } else {
    console.log("✅ Account already exists at:", accountAddress);
  }

  const currentNonce = await factory.accountNonces(owner);
  console.log("🔢 Current nonce for owner:", currentNonce.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
