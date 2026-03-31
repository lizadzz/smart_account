const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
  console.log("Connecting to local Hardhat node...\n");

  const [wallet] = await ethers.getSigners();
  console.log("Using wallet address:", wallet.address);

  const config = JSON.parse(fs.readFileSync("./deployed-config.json", "utf8"));

  const ACCOUNT_FACTORY_ADDRESS = config.accountFactory;
  const PAYMASTER_ADDRESS = config.paymaster;

  console.log("\n=== Contract Addresses ===");
  console.log("AccountFactory:", ACCOUNT_FACTORY_ADDRESS);
  console.log("Paymaster:", PAYMASTER_ADDRESS);

  const factoryCode = await ethers.provider.getCode(ACCOUNT_FACTORY_ADDRESS);
  const paymasterCode = await ethers.provider.getCode(PAYMASTER_ADDRESS);

  console.log("\n✅ AccountFactory deployed:", factoryCode !== "0x");
  console.log("✅ Paymaster deployed:", paymasterCode !== "0x");

  const Factory = await ethers.getContractFactory("AccountFactory");
  const factory = Factory.attach(ACCOUNT_FACTORY_ADDRESS);

  const entryPoint = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
  const nonce = await factory.accountNonces(wallet.address);
  
  const accountAddress = await factory.getAccountAddress(wallet.address, entryPoint, nonce);
  console.log("\n📟 Predicted account address:", accountAddress);

  const accountCode = await ethers.provider.getCode(accountAddress);
  console.log("Account deployed:", accountCode !== "0x");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
