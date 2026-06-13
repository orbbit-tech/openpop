export type Config = {
  complianceApiUrl: string
  underwritingApiUrl: string
  complianceApiKeyOwner: string
  underwritingApiKeyOwner: string
  dairyPriceMockUsdPerLb: number
  defaultBusinessName: string
}

export type InvoiceRequest = {
  invoiceId: string
  amount: number
  businessName: string
  dairyPriceUsdPerLb?: number
}

export type ComplianceResult = { kyc: string; kyb: string; sanctions: string }
export type DairyPriceResult = { price: number; unit: string }
export type UnderwritingResult = { score: number; approved: boolean; maxAdvanceUsdc: number }
