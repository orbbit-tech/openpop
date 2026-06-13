import { defineConfig, configVariable } from "hardhat/config";
import hardhatFoundry from "@nomicfoundation/hardhat-foundry";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatKeystore from "@nomicfoundation/hardhat-keystore";

// DEPLOYER_PRIVATE_KEY is stored encrypted in the Hardhat keystore — never in .env.
// Set it once with: npx hardhat keystore set DEPLOYER_PRIVATE_KEY
export default defineConfig({
  plugins: [hardhatFoundry, hardhatEthers, hardhatKeystore],
  solidity: "0.8.24",
  paths: {
    sources: "contracts",
    cache: "cache_hardhat",
  },
  networks: {
    arc: {
      type: "http",
      url: process.env.ARC_RPC_URL ?? "https://rpc.testnet.arc.network",
      chainId: 5042002,
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
    },
  },
});
