import { HTTPCapability, EVMClient, handler, Runner, prepareReportRequest, type Runtime, type HTTPPayload } from "@chainlink/cre-sdk"
import { encodeAbiParameters, parseAbiParameters, toHex } from "viem"
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
  const dairyPrice = getDairyCommodityPrice(runtime)

  // Step 3 — Score the deal using compliance verdict and live commodity price.
  const underwriting = runUnderwriting(runtime, { businessName, invoiceId, amount, dairyPriceUsdPerLb: dairyPrice.price })

  // Step 4 — Encode verdict and write proof on-chain via the Chainlink forwarder.
  const chainSelector = EVMClient.SUPPORTED_CHAIN_SELECTORS[config.chainSelectorName as keyof typeof EVMClient.SUPPORTED_CHAIN_SELECTORS]
  const evmClient = new EVMClient(chainSelector)
  const encoded = encodeAbiParameters(
    parseAbiParameters("uint256,bool"),
    [BigInt(config.dealId), underwriting.approved]
  )
  const signedReport = runtime.report(prepareReportRequest(encoded)).result()
  const txResult = evmClient
    .writeReport(runtime, {
      receiver: config.consumerAddress,
      report: signedReport,
      gasConfig: { gasLimit: "500000" },
    })
    .result()

  return JSON.stringify({
    invoiceId,
    businessName,
    compliance,
    dairyPrice,
    underwriting,
    verdict: underwriting.approved ? "approved" : "rejected",
    txHash: txResult.txHash ? toHex(txResult.txHash) : null,
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
