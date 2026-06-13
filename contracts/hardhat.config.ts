import { defineConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-keystore";
import "@nomicfoundation/hardhat-foundry";

// DEPLOYER_PRIVATE_KEY lives in the encrypted keystore — never in .env.
// Set it once with: npx hardhat keystore set DEPLOYER_PRIVATE_KEY
const deployerKey = vars.has("DEPLOYER_PRIVATE_KEY")
  ? [vars.get("DEPLOYER_PRIVATE_KEY")]
  : [];

export default defineConfig({
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
});
