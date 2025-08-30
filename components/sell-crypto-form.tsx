"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Wallet, DollarSign, TrendingDown } from "lucide-react"
import { useExchangeRates } from "@/hooks/use-exchange-rates"

interface SellCryptoFormProps {
  onClose: () => void
  availableBalance: { [key: string]: string }
}

export function SellCryptoForm({ onClose, availableBalance }: SellCryptoFormProps) {
  const [cryptoAmount, setCryptoAmount] = useState("")
  const [fiatAmount, setFiatAmount] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState("ETH")
  const [selectedFiat, setSelectedFiat] = useState("USD")
  const [withdrawalMethod, setWithdrawalMethod] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { rates, status, fetchLiveRates, convertCryptoPrice } = useExchangeRates()

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

  const handleMaxClick = () => {
    const maxAmount = availableBalance[selectedCrypto] || "0"
    setCryptoAmount(maxAmount)
    const rate = convertCryptoPrice(selectedCrypto, selectedFiat)
    const fiat = (Number(maxAmount) * rate).toFixed(2)
    setFiatAmount(fiat)
  }

  useEffect(() => {
    if (cryptoAmount) {
      handleCryptoAmountChange(cryptoAmount)
    }
  }, [selectedCrypto, selectedFiat])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real app, this would create a sell order in the database
    console.log("[v0] Sell order created:", {
      cryptoAmount,
      fiatAmount,
      selectedCrypto,
      selectedFiat,
      withdrawalMethod,
      exchangeRate: convertCryptoPrice(selectedCrypto, selectedFiat),
      ratesStatus: status.status,
    })

    setIsLoading(false)
    onClose()
  }

  const isAmountValid = cryptoAmount && Number(cryptoAmount) <= Number(availableBalance[selectedCrypto] || "0")

  const currentRate = convertCryptoPrice(selectedCrypto, selectedFiat)

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
          Sell Cryptocurrency
        </CardTitle>
        <CardDescription>Convert your crypto to fiat currency</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Crypto Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="crypto-sell-amount">You Sell</Label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  id="crypto-sell-amount"
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

            {/* Balance Display */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center">
                <Wallet className="w-3 h-3 mr-1" />
                Available: {availableBalance[selectedCrypto] || "0"} {selectedCrypto}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleMaxClick}
                className="h-auto p-0 text-primary hover:text-primary/80"
              >
                Max
              </Button>
            </div>

            {cryptoAmount && !isAmountValid && <p className="text-sm text-destructive">Insufficient balance</p>}
          </div>

          {/* Exchange Arrow */}
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Fiat Amount Output */}
          <div className="space-y-2">
            <Label htmlFor="fiat-receive-amount">You Receive</Label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  id="fiat-receive-amount"
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

          {/* Withdrawal Method */}
          <div className="space-y-2">
            <Label>Withdrawal Method</Label>
            <Select value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select withdrawal method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Bank Transfer
                  </div>
                </SelectItem>
                <SelectItem value="paypal">
                  <div className="flex items-center">
                    <Wallet className="w-4 h-4 mr-2" />
                    PayPal
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fees Display */}
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network Fee</span>
              <span>~$1.50</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>You'll Receive</span>
              <span>${fiatAmount ? (Number(fiatAmount) - 1.5).toFixed(2) : "0.00"}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!cryptoAmount || !withdrawalMethod || !isAmountValid || isLoading}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isLoading ? "Processing..." : "Sell Now"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
