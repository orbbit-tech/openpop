import { ConfidentialHTTPClient, type Runtime } from "@chainlink/cre-sdk"
import { type Config, type ComplianceResult } from "../types"

/**
 * Runs compliance check (e.g KYC/KYB) via a third-party provider inside a Chainlink enclave.
 * Business identity data never leaves the enclave — only the verdict is returned.
 */
export function runCompliance(
  runtime: Runtime<Config>,
  input: { businessName: string; invoiceId: string },
): ComplianceResult {
  runtime.log("[Step 1] Compliance")
  const confHttp = new ConfidentialHTTPClient()

  const resp = confHttp.sendRequest(runtime, {
    vaultDonSecrets: [{ key: "COMPLIANCE_API_KEY", namespace: "workflow", owner: runtime.config.complianceApiKeyOwner }],
    request: {
      url: runtime.config.complianceApiUrl,
      method: "POST",
      multiHeaders: {
        "Content-Type": { values: ["application/json"] },
        "Authorization": { values: ["Bearer {{.COMPLIANCE_API_KEY}}"] },
      },
      bodyString: JSON.stringify(input),
      encryptOutput: false,
    },
  }).result()
  
  if (resp.statusCode !== 200) throw new Error(`Compliance API returned ${resp.statusCode}`)
  return JSON.parse(new TextDecoder().decode(resp.body)) as ComplianceResult
}
