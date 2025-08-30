"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Link, QrCode, Copy, Check } from "lucide-react"

interface PaymentLinkFormProps {
  onClose: () => void
  onLinkCreated: (link: any) => void
}

export function PaymentLinkForm({ onClose, onLinkCreated }: PaymentLinkFormProps) {
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("USDC")
  const [description, setDescription] = useState("")
  const [expiresIn, setExpiresIn] = useState("24")
  const [isLoading, setIsLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const generateQRData = (linkId: string) => {
    return `https://bridgify.app/pay/${linkId}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }
    
    setIsLoading(true)

    try {
      // Simulate API call to create payment link
      await new Promise((resolve) => setTimeout(resolve, 500))

      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + Number.parseInt(expiresIn || '24'))
      const linkId = Math.random().toString(36).substring(2, 15)
      const linkUrl = `https://bridgify.app/pay/${linkId}`

      const newLink = {
        id: linkId,
        amount: Number.parseFloat(amount),
        currency,
        description: description || `Payment of ${amount} ${currency}`,
        url: linkUrl,
        qrData: linkUrl,
        expiresAt: expiresAt.toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
        clicks: 0,
        payments: 0
      }

      console.log("Creating payment link:", newLink)
      onLinkCreated(newLink)
      onClose()
    } catch (error) {
      console.error('Error creating payment link:', error)
      alert('Failed to create payment link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (generatedLink) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <Check className="w-5 h-5 mr-2" />
            Payment Link Created
          </CardTitle>
          <CardDescription>Your payment link is ready to share</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-white border-2 border-border rounded-lg flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-24 h-24 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">QR Code</p>
                <p className="text-xs text-muted-foreground">
                  {generatedLink.amount} {generatedLink.currency}
                </p>
              </div>
            </div>
          </div>

          {/* Link Details */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Payment Link</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input value={generatedLink.url} readOnly className="text-sm" />
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(generatedLink.url)}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                <p className="font-semibold">
                  {generatedLink.amount} {generatedLink.currency}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Expires</Label>
                <p className="font-semibold text-sm">{new Date(generatedLink.expiresAt).toLocaleDateString()}</p>
              </div>
            </div>

            {generatedLink.description && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm">{generatedLink.description}</p>
              </div>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Close
            </Button>
            <Button
              onClick={() => copyToClipboard(generatedLink.url)}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Link className="w-5 h-5 mr-2 text-primary" />
          Create Payment Link
        </CardTitle>
        <CardDescription>
          Generate a payment link to request payment from customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex space-x-2">
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="flex-1"
              />
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., Invoice #123 - Web Design Services"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Expiration */}
          <div className="space-y-2">
            <Label htmlFor="expires">Expires In</Label>
            <Select value={expiresIn} onValueChange={setExpiresIn}>
              <SelectTrigger>
                <SelectValue placeholder="Select expiration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="72">3 days</SelectItem>
                <SelectItem value="168">7 days</SelectItem>
                <SelectItem value="720">30 days</SelectItem>
                <SelectItem value="0">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!amount || isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? "Creating..." : "Create Link"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
