import { defineConfig, configVariable } from "hardhat/config";
import hardhatFoundry from "@nomicfoundation/hardhat-foundry";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatKeystore from "@nomicfoundation/hardhat-keystore";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load shared env from repo root — all sub-projects (contracts, apps) read .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// DEPLOYER_PRIVATE_KEY is stored encrypted in the Hardhat keystore — never in .env.local.
// Set it once with: npx hardhat keystore set DEPLOYER_PRIVATE_KEY
export default defineConfig({
  plugins: [hardhatFoundry, hardhatEthers, hardhatKeystore],
  solidity: { version: "0.8.24", settings: { evmVersion: "cancun" } },
  paths: {
    sources: "src",
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
