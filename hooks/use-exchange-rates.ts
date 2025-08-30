"use client"

import { useState, useEffect, useCallback } from "react"

export interface ExchangeRates {
  // Crypto rates in USD
  crypto: {
    [key: string]: number
  }
  // Fiat-to-fiat rates (base currency per USD)
  fiat: {
    [key: string]: number
  }
}

export interface RatesStatus {
  status: "hardcoded" | "updating" | "live"
  lastUpdated?: string
  error?: string
}

const HARDCODED_RATES: ExchangeRates = {
  crypto: {
    ETH: 3640.25,
    BTC: 65000.0,
    USDC: 1.0,
    USDT: 1.0,
    ARB: 2.45,
  },
  fiat: {
    // 1 USD = 0.91 EUR (aproximadamente)
    // 1 USD = 0.79 GBP (aproximadamente)
    EUR: 1.10, // 1 EUR = 1.10 USD
    GBP: 1.27, // 1 GBP = 1.27 USD
    USD: 1.0,  // Base currency
  },
}

export function useExchangeRates() {
  const [rates, setRates] = useState<ExchangeRates>(HARDCODED_RATES)
  const [status, setStatus] = useState<RatesStatus>({ status: "hardcoded" })

  const fetchLiveRates = useCallback(async () => {
    setStatus((prev) => ({ ...prev, status: "updating", error: undefined }))

    try {
      // Simulate API call - in production, this would call a real price API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock updated rates (in production, parse API response)
      const liveRates: ExchangeRates = {
        crypto: {
          ETH: 3642.5 + (Math.random() - 0.5) * 100,
          BTC: 65100.0 + (Math.random() - 0.5) * 1000,
          USDC: 1.0,
          USDT: 1.0,
          ARB: 2.47 + (Math.random() - 0.5) * 0.1,
        },
        fiat: {
          EUR: 1.10 + (Math.random() - 0.5) * 0.02, // 1 EUR = ~1.10 USD
          GBP: 1.27 + (Math.random() - 0.5) * 0.02, // 1 GBP = ~1.27 USD
          USD: 1.0
        },
      }

      setRates(liveRates)
      setStatus({
        status: "live",
        lastUpdated: new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
      })
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        status: "hardcoded",
        error: "Failed to fetch live rates",
      }))
    }
  }, [])

  // Convert crypto price from USD to target fiat
  const convertCryptoPrice = useCallback(
    (cryptoSymbol: string, targetFiat: string): number => {
      const cryptoUsdPrice = rates.crypto[cryptoSymbol]
      if (!cryptoUsdPrice) return 0

      if (targetFiat === "USD") return cryptoUsdPrice

      const fiatRate = rates.fiat[targetFiat]
      if (!fiatRate) return cryptoUsdPrice

      // Convert: divide USD price by fiat rate
      return cryptoUsdPrice / fiatRate
    },
    [rates],
  )

  // Auto-fetch live rates on mount (optional)
  useEffect(() => {
    // Uncomment to auto-fetch on mount
    // fetchLiveRates()
  }, [fetchLiveRates])

  return {
    rates,
    status,
    fetchLiveRates,
    convertCryptoPrice,
  }
}
