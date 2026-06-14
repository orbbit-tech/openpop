import { type Runtime } from "@chainlink/cre-sdk"
import { type Config, type DairyPriceResult } from "../types"

export function getDairyCommodityPrice(runtime: Runtime<Config>, priceUsdPerLb: number): DairyPriceResult {
  runtime.log("[Step 2] Dairy commodity price")
  return { price: priceUsdPerLb, unit: "USD/lb" }
}
