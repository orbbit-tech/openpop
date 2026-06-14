import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@dynamic-labs-wallet/node",
    "@dynamic-labs-wallet/node-evm",
    "@evervault/wasm-attestation-bindings",
  ],
  turbopack: {
    resolveAliases: {
      "@evervault/wasm-attestation-bindings": "./src/stubs/evervault-wasm.js",
    },
  },
};

export default nextConfig;
