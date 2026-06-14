'use client'

import { DynamicContextProvider, mergeNetworks } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

const arcTestnet = {
  blockExplorerUrls: ['https://testnet.arcscan.app'],
  chainId: 5042002,
  chainName: 'Arc Testnet',
  iconUrls: ['https://app.dynamic.xyz/assets/networks/eth.svg'],
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USDC',
    symbol: 'USDC',
    iconUrl: 'https://app.dynamic.xyz/assets/networks/eth.svg',
  },
  networkId: 5042002,
  rpcUrls: [process.env.NEXT_PUBLIC_ARC_RPC_URL ?? 'https://rpc.testnet.arc.network'],
}

export function DynamicProvider({ children }: Props) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks: (defaultNetworks) => mergeNetworks([arcTestnet], defaultNetworks),
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  )
}
