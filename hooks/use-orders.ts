"use client"

import { useState, useEffect, useCallback } from "react"

export interface Order {
  id: number
  user_id: number
  order_type: "buy" | "sell"
  crypto_currency: string
  fiat_currency: string
  crypto_amount: number
  fiat_amount: number
  exchange_rate: number
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  payment_method?: string
  transaction_hash?: string
  wallet_address: string
  rates_status: string
  created_at: string
  completed_at?: string
}

export interface CreateOrderData {
  orderType: "buy" | "sell"
  cryptoCurrency: string
  fiatCurrency: string
  cryptoAmount: number
  fiatAmount: number
  exchangeRate: number
  paymentMethod?: string
  walletAddress: string
  ratesStatus?: string
}

export function useOrders(walletAddress?: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(
    async (limit = 50) => {
      if (!walletAddress) return

      console.log("[v0] Fetching orders for wallet:", walletAddress)
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          limit: limit.toString(),
          wallet: walletAddress,
        })

        const response = await fetch(`/api/orders?${params}`)
        const result = await response.json()
        console.log("[v0] Orders API response:", result)

        if (response.ok && Array.isArray(result)) {
          console.log("[v0] Setting orders:", result)
          setOrders(result)
        } else {
          const errorMsg = result.error || "Failed to fetch orders"
          console.error("[v0] Error in orders response:", errorMsg)
          setError(errorMsg)
        }
      } catch (err) {
        const errorMsg = "Network error while fetching orders"
        console.error("[v0] Error fetching orders:", err)
        setError(errorMsg)
      } finally {
        setIsLoading(false)
      }
    },
    [walletAddress],
  )

  const createOrder = useCallback(
    async (orderData: CreateOrderData): Promise<Order | null> => {
      setError(null)
      console.log("[v0] Creating order:", orderData)

      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        })

        const result = await response.json()
        console.log("[v0] Create order response:", result)

        if (response.ok) {
          // The API returns the created order directly, not wrapped in a success/data object
          const newOrder = result
          
          // Update local state immediately for better UX
          setOrders(prevOrders => [newOrder, ...prevOrders])
          
          // Also refresh from server to ensure consistency
          await fetchOrders()
          
          return newOrder
        } else {
          const errorMsg = result.error || "Failed to create order"
          console.error("[v0] Error creating order:", errorMsg)
          setError(errorMsg)
          return null
        }
      } catch (err) {
        setError("Network error while creating order")
        console.error("[v0] Error creating order:", err)
        return null
      }
    },
    [fetchOrders],
  )

  // Auto-fetch orders when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      fetchOrders()
    }
  }, [walletAddress, fetchOrders])

  // Set up polling for real-time updates (every 30 seconds)
  useEffect(() => {
    if (!walletAddress) return

    const interval = setInterval(() => {
      fetchOrders()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [walletAddress, fetchOrders])

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    createOrder,
    refetch: fetchOrders,
  }
}
