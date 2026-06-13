import "@nomicfoundation/hardhat-foundry";
import { HardhatUserConfig, vars } from "hardhat/config";

// DEPLOYER_PRIVATE_KEY is stored in Hardhat's encrypted vars store — never in .env.
// Set it once with: npx hardhat vars set DEPLOYER_PRIVATE_KEY
const deployerKey = vars.has("DEPLOYER_PRIVATE_KEY")
  ? [vars.get("DEPLOYER_PRIVATE_KEY")]
  : [];

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  paths: {
    sources: "contracts",
    cache: "cache_hardhat",
  },
  networks: {
    arc: {
      url: process.env.ARC_RPC_URL ?? "https://rpc.testnet.arc.network",
      chainId: 5042002,
      accounts: deployerKey,
    },
  },
};

export default config;
