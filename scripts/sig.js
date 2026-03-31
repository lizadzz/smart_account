const { ethers } = require("ethers");
require("dotenv").config();

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

async function main() {
  console.log("Signing message...");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const message = "wee";
  const messageHash = ethers.id(message);
  const signature = await wallet.signMessage(ethers.getBytes(messageHash));

  console.log("Signer address:", wallet.address);
  console.log("Message:", message);
  console.log("Message hash:", messageHash);
  console.log("Signature:", signature);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
