import { ConfidentialHTTPClient, type Runtime } from "@chainlink/cre-sdk"
import { type Config, type UnderwritingResult } from "../types"

/**
 * Scores the deal using Orbbit's proprietary ML model inside a Chainlink enclave.
 * Both the financial inputs and the model logic are protected — only the score
 * and approval verdict exit the enclave.
 */
export function runUnderwriting(
  runtime: Runtime<Config>,
  input: { businessName: string; invoiceId: string; amount: number; dairyPriceUsdPerLb: number },
): UnderwritingResult {
  runtime.log("[Step 3] Underwriting")
  const confHttp = new ConfidentialHTTPClient()

  const resp = confHttp.sendRequest(runtime, {
    vaultDonSecrets: [{ key: "UNDERWRITING_API_KEY", namespace: "workflow", owner: runtime.config.underwritingApiKeyOwner }],
    request: {
      url: runtime.config.underwritingApiUrl,
      method: "POST",
      multiHeaders: {
        "Content-Type": { values: ["application/json"] },
        "Authorization": { values: ["Bearer {{.UNDERWRITING_API_KEY}}"] },
      },
      bodyString: JSON.stringify(input),
      encryptOutput: false,
    },
  }).result()
  
  if (resp.statusCode !== 200) throw new Error(`Underwriting API returned ${resp.statusCode}`)
  return JSON.parse(new TextDecoder().decode(resp.body)) as UnderwritingResult
}
