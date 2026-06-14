import { HTTPClientCapability } from "@chainlink/cre-sdk"
import { type Runtime } from "@chainlink/cre-sdk"
import { type Config, type DairyPriceResult } from "../types"

/**
 * Fetches the current dairy commodity spot price via the studio proxy.
 *
 * Uses HTTPClientCapability.runInNodeMode so each CRE node fetches independently;
 * price is aggregated by median across nodes and unit must be identical.
 * The proxy handles the x402 payment against the live dairy API.
 */
export function getDairyCommodityPrice(runtime: Runtime<Config>): DairyPriceResult {
  runtime.log("[Step 2] Dairy commodity price")
  const httpClient = new HTTPClientCapability()
  const result = httpClient
    .runInNodeMode(
      runtime,
      (): DairyPriceResult => {
        const response = fetch(runtime.config.dairyPriceApiUrl)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as DairyPriceResult
      },
      {
        method: "byFields",
        fields: {
          price: { method: "median" },
          unit: { method: "identical" },
        },
      },
    )()
    .result()
  return result
}
