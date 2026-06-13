import { type Runtime } from "@chainlink/cre-sdk"
import { type Config, type DairyPriceResult, type InvoiceRequest } from "../types"

/**
 * Returns the current dairy commodity spot price.
 *
 * Uses dairyPriceUsdPerLb from the trigger payload when present — the Dynamic server
 * wallet (02-C) fetches the live price via x402 and injects it before firing the trigger.
 * Falls back to the mock config value when running in simulation.
 */
export function getDairyCommodityPrice(runtime: Runtime<Config>, req: InvoiceRequest): DairyPriceResult {
  runtime.log("[Step 2] Dairy commodity price")
  const price = req.dairyPriceUsdPerLb ?? runtime.config.dairyPriceMockUsdPerLb
  return { price, unit: "USD/lb" }
}
