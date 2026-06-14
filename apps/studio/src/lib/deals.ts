export type DealConfig = {
  id: string
  businessName: string
  invoiceAmount: string
  amount: number
}

export const DEAL_CONFIGS: DealConfig[] = [
  { id: 'gallivant-001', businessName: 'Gallivant Ice Cream',  invoiceAmount: '$50,000 · Walmart Net-30',     amount: 50_000 },
  { id: 'alpine-002',    businessName: 'Alpine Creamery Co.',  invoiceAmount: '$38,000 · Whole Foods Net-45', amount: 38_000 },
  { id: 'meadow-003',    businessName: 'Meadow Fresh Dairy',   invoiceAmount: '$72,500 · Kroger Net-30',      amount: 72_500 },
  { id: 'summit-004',    businessName: 'Summit Valley Farms',  invoiceAmount: '$25,000 · Costco Net-60',      amount: 25_000 },
  { id: 'creston-005',   businessName: 'Creston Milk Co.',     invoiceAmount: '$61,000 · Target Net-30',      amount: 61_000 },
]

export function getDealConfig(id: string): DealConfig | undefined {
  return DEAL_CONFIGS.find(d => d.id === id)
}
