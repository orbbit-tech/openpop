import { HardhatUserConfig, subtask } from "hardhat/config";
import { TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS } from "hardhat/builtin-tasks/task-names";
import "@nomicfoundation/hardhat-toolbox";
import path from "path";
import fs from "fs";

// Recursively collect .sol files, skipping node_modules
function getSolFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir)) {
    if (entry === "node_modules" || entry === "artifacts" || entry === "cache") {
      continue;
    }
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      results.push(...getSolFiles(full));
    } else if (entry.endsWith(".sol")) {
      results.push(full);
    }
  }
  return results;
}

subtask(TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS).setAction(
  async (_, { config }) => {
    return getSolFiles(config.paths.sources);
  }
);

const hardhatConfig: HardhatUserConfig = {
  solidity: "0.8.24",
  paths: {
    sources: ".",
    tests: "./test",
    artifacts: "./artifacts",
    cache: "./cache",
  },
};

export default hardhatConfig;
