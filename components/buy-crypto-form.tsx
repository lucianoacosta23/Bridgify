"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, CreditCard, DollarSign, TrendingUp } from "lucide-react"
import { useExchangeRates } from "@/hooks/use-exchange-rates"
import { useOrders } from "@/hooks/use-orders"

interface BuyCryptoFormProps {
  onClose: () => void
  walletAddress?: string
}

export function BuyCryptoForm({ onClose, walletAddress }: BuyCryptoFormProps) {
  const [fiatAmount, setFiatAmount] = useState("")
  const [cryptoAmount, setCryptoAmount] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState("ETH")
  const [selectedFiat, setSelectedFiat] = useState("USD")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { rates, status, fetchLiveRates, convertCryptoPrice } = useExchangeRates()
  const { createOrder, refetch: refetchOrders } = useOrders(walletAddress)

  const handleFiatAmountChange = (value: string) => {
    setFiatAmount(value)
    if (value && !isNaN(Number(value))) {
      const rate = convertCryptoPrice(selectedCrypto, selectedFiat)
      const crypto = (Number(value) / rate).toFixed(6)
      setCryptoAmount(crypto)
    } else {
      setCryptoAmount("")
    }
  }

  const handleCryptoAmountChange = (value: string) => {
    setCryptoAmount(value)
    if (value && !isNaN(Number(value))) {
      const rate = convertCryptoPrice(selectedCrypto, selectedFiat)
      const fiat = (Number(value) * rate).toFixed(2)
      setFiatAmount(fiat)
    } else {
      setFiatAmount("")
    }
  }

  useEffect(() => {
    if (fiatAmount) {
      handleFiatAmountChange(fiatAmount)
    }
  }, [selectedCrypto, selectedFiat])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletAddress) {
      console.error("[v0] No wallet address provided")
      return
    }

    setIsLoading(true)

    try {
      const orderData = {
        orderType: "buy" as const,
        cryptoCurrency: selectedCrypto,
        fiatCurrency: selectedFiat,
        cryptoAmount: Number.parseFloat(cryptoAmount),
        fiatAmount: Number.parseFloat(fiatAmount),
        exchangeRate: convertCryptoPrice(selectedCrypto, selectedFiat),
        paymentMethod,
        walletAddress,
        ratesStatus: status.status,
      }

      const newOrder = await createOrder(orderData)

      if (newOrder) {
        console.log("[v0] Buy order created successfully:", newOrder)
        // Let the parent component handle the UI updates
        onClose()
      } else {
        console.error("[v0] Failed to create buy order")
        throw new Error("Failed to create order")
      }
    } catch (error) {
      console.error("[v0] Error creating buy order:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentRate = convertCryptoPrice(selectedCrypto, selectedFiat)

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Buy Cryptocurrency
        </CardTitle>
        <CardDescription>Purchase crypto with your preferred payment method</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fiat Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="fiat-amount">You Pay</Label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  id="fiat-amount"
                  type="number"
                  placeholder="0.00"
                  value={fiatAmount}
                  onChange={(e) => handleFiatAmountChange(e.target.value)}
                  className="text-lg no-spinner"
                  step="0.01"
                  min="0"
                />
              </div>
              <Select value={selectedFiat} onValueChange={setSelectedFiat}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Exchange Arrow */}
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Crypto Amount Output */}
          <div className="space-y-2">
            <Label htmlFor="crypto-amount">You Receive</Label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  id="crypto-amount"
                  type="number"
                  placeholder="0.000000"
                  value={cryptoAmount}
                  onChange={(e) => handleCryptoAmountChange(e.target.value)}
                  className="text-lg no-spinner"
                  step="0.000001"
                  min="0"
                />
              </div>
              <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="ARB">ARB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Exchange Rate Display */}
          {selectedCrypto && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span className="font-medium">
                  1 {selectedCrypto} ={" "}
                  {currentRate.toLocaleString(undefined, {
                    style: "currency",
                    currency: selectedFiat,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: selectedFiat === "USD" ? 2 : 4,
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Credit/Debit Card
                  </div>
                </SelectItem>
                <SelectItem value="bank">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Bank Transfer
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fees Display */}
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network Fee</span>
              <span>~$2.50</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!fiatAmount || !paymentMethod || isLoading || !walletAddress}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? "Processing..." : "Buy Now"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
