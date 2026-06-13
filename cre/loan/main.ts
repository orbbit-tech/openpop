import { HTTPCapability, handler, Runner, type Runtime, type HTTPPayload } from "@chainlink/cre-sdk"
import { type Config, type InvoiceRequest } from "./types"
import { runCompliance } from "./steps/compliance"
import { getDairyCommodityPrice } from "./steps/dairy-commodity-price"
import { runUnderwriting } from "./steps/underwriting"

const onInvoiceSubmitted = (runtime: Runtime<Config>, triggerEvent: HTTPPayload): string => {
  const config = runtime.config

  // The HTTP trigger delivers the body as raw bytes, not a parsed object.
  const req = JSON.parse(new TextDecoder().decode(triggerEvent.input)) as InvoiceRequest

  const invoiceId = req.invoiceId ?? "UNKNOWN"
  const amount = req.amount ?? 0
  const businessName = req.businessName ?? config.defaultBusinessName

  // Step 1 — Compliance screening must pass before financial data is assessed.
  const compliance = runCompliance(runtime, { businessName, invoiceId })

  // Step 2 — Commodity price is used in underwriting to validate invoice realism.
  const dairyPrice = getDairyCommodityPrice(runtime, req)

  // Step 3 — Score the deal using compliance verdict and live commodity price.
  const underwriting = runUnderwriting(runtime, { businessName, invoiceId, amount, dairyPriceUsdPerLb: dairyPrice.price })

  return JSON.stringify({
    invoiceId,
    businessName,
    compliance,
    dairyPrice,
    underwriting,
    verdict: underwriting.approved ? "approved" : "rejected",
    /*
     * runtime.now() is required here — Date.now() is non-deterministic across CRE nodes
     * and would cause consensus to fail.
     */
    timestamp: runtime.now().toISOString(),
  })
}

const initWorkflow = (config: Config) => {
  const http = new HTTPCapability()
  return [handler(http.trigger({}), onInvoiceSubmitted)]
}

export async function main() {
  const runner = await Runner.newRunner<Config>()
  await runner.run(initWorkflow)
}
