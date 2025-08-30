"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Receipt, Download, Eye, Search, Filter, ExternalLink, FileText, Copy } from "lucide-react"

interface TransactionReceipt {
  id: string
  orderId: string
  receiptHash: string
  ipfsHash: string
  transactionType: "buy" | "sell" | "payment_link" | "mixer"
  amount: number
  currency: string
  fiatAmount?: number
  fiatCurrency?: string
  status: "completed" | "pending" | "failed"
  networkFee: number
  platformFee: number
  createdAt: string
  transactionHash?: string
  receiptData: {
    fromAddress?: string
    toAddress?: string
    exchangeRate?: number
    paymentMethod?: string
    description?: string
  }
}

export function ReceiptManager() {
  const [receipts, setReceipts] = useState<TransactionReceipt[]>([
    {
      id: "rcpt_001",
      orderId: "ord_abc123",
      receiptHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
      ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      transactionType: "buy",
      amount: 0.5,
      currency: "ETH",
      fiatAmount: 1820.0,
      fiatCurrency: "USD",
      status: "completed",
      networkFee: 2.5,
      platformFee: 0.0,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      transactionHash: "0x9876543210abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      receiptData: {
        exchangeRate: 3640.25,
        paymentMethod: "Credit Card",
        description: "ETH Purchase via Bridgify",
      },
    },
    {
      id: "rcpt_002",
      orderId: "ord_def456",
      receiptHash: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
      ipfsHash: "QmXwBPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH",
      transactionType: "payment_link",
      amount: 500,
      currency: "USDC",
      status: "completed",
      networkFee: 1.5,
      platformFee: 0.0,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      transactionHash: "0x8765432109abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      receiptData: {
        fromAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c",
        toAddress: "0x123456789abcdef1234567890abcdef1234567890",
        description: "Invoice #001 - Web Development Services",
      },
    },
    {
      id: "rcpt_003",
      orderId: "ord_ghi789",
      receiptHash: "0x3c4d5e6f7890abcdef1234567890abcdef123456",
      ipfsHash: "QmZwCPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdI",
      transactionType: "mixer",
      amount: 1.2,
      currency: "ETH",
      status: "completed",
      networkFee: 3.2,
      platformFee: 0.0,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      transactionHash: "0x7654321098abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      receiptData: {
        description: "Privacy Mix Transaction - Enhanced Anonymity",
      },
    },
  ])

  const [selectedReceipt, setSelectedReceipt] = useState<TransactionReceipt | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      searchTerm === "" ||
      receipt.receiptHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.receiptData.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || receipt.transactionType === filterType
    const matchesStatus = filterStatus === "all" || receipt.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "buy":
        return "📈"
      case "sell":
        return "📉"
      case "payment_link":
        return "🔗"
      case "mixer":
        return "🛡️"
      default:
        return "📄"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "buy":
        return "bg-green-100 text-green-800"
      case "sell":
        return "bg-red-100 text-red-800"
      case "payment_link":
        return "bg-blue-100 text-blue-800"
      case "mixer":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const downloadReceipt = (receipt: TransactionReceipt) => {
    const receiptData = {
      receiptId: receipt.id,
      orderId: receipt.orderId,
      transactionHash: receipt.transactionHash,
      type: receipt.transactionType,
      amount: `${receipt.amount} ${receipt.currency}`,
      fiatAmount: receipt.fiatAmount ? `${receipt.fiatAmount} ${receipt.fiatCurrency}` : null,
      status: receipt.status,
      fees: {
        network: receipt.networkFee,
        platform: receipt.platformFee,
      },
      ipfsHash: receipt.ipfsHash,
      timestamp: receipt.createdAt,
      details: receipt.receiptData,
    }

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bridgify-receipt-${receipt.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Transaction Receipts</h2>
          <p className="text-muted-foreground">View and manage your transaction receipts</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary">
          {receipts.length} Total Receipts
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Receipts</p>
                <p className="text-2xl font-bold text-foreground">{receipts.length}</p>
              </div>
              <Receipt className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {receipts.filter((r) => r.status === "completed").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold text-foreground">
                  ${receipts.reduce((sum, r) => sum + (r.fiatAmount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">$</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">IPFS Stored</p>
                <p className="text-2xl font-bold text-foreground">{receipts.length}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search receipts by hash, currency, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="buy">Buy Orders</SelectItem>
                  <SelectItem value="sell">Sell Orders</SelectItem>
                  <SelectItem value="payment_link">Payment Links</SelectItem>
                  <SelectItem value="mixer">Privacy Mixer</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipts List */}
      <div className="space-y-4">
        {filteredReceipts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No receipts found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== "all" || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Your transaction receipts will appear here"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReceipts.map((receipt) => (
            <Card key={receipt.id} className="hover:bg-accent/5 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={`${getTypeColor(receipt.transactionType)} border-0`}>
                        {getTypeIcon(receipt.transactionType)} {receipt.transactionType.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge
                        variant={
                          receipt.status === "completed"
                            ? "default"
                            : receipt.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {receipt.status.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground font-mono">
                        {receipt.receiptHash.slice(0, 10)}...{receipt.receiptHash.slice(-6)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-6 mb-2">
                      <div>
                        <p className="font-semibold text-foreground">
                          {receipt.amount} {receipt.currency}
                        </p>
                        {receipt.fiatAmount && (
                          <p className="text-sm text-muted-foreground">
                            ≈ ${receipt.fiatAmount.toLocaleString()} {receipt.fiatCurrency}
                          </p>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p>Network Fee: ${receipt.networkFee}</p>
                        <p>Platform Fee: FREE</p>
                      </div>
                    </div>

                    {receipt.receiptData.description && (
                      <p className="text-sm text-foreground mb-2">{receipt.receiptData.description}</p>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{new Date(receipt.createdAt).toLocaleString()}</span>
                      <span className="flex items-center">
                        <FileText className="w-3 h-3 mr-1" />
                        IPFS: {receipt.ipfsHash.slice(0, 8)}...
                      </span>
                      {receipt.transactionHash && (
                        <span className="flex items-center">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Tx: {receipt.transactionHash.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedReceipt(receipt)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => downloadReceipt(receipt)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Receipt Detail Dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Receipt Details</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Receipt className="w-5 h-5 mr-2" />
                  Transaction Receipt
                </CardTitle>
                <CardDescription>
                  Receipt ID: {selectedReceipt.id} • Order ID: {selectedReceipt.orderId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Transaction Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Transaction Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge className={`${getTypeColor(selectedReceipt.transactionType)} border-0 text-xs`}>
                          {selectedReceipt.transactionType.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium">
                          {selectedReceipt.amount} {selectedReceipt.currency}
                        </span>
                      </div>
                      {selectedReceipt.fiatAmount && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fiat Value:</span>
                          <span className="font-medium">
                            ${selectedReceipt.fiatAmount.toLocaleString()} {selectedReceipt.fiatCurrency}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge
                          variant={
                            selectedReceipt.status === "completed"
                              ? "default"
                              : selectedReceipt.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {selectedReceipt.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Fee Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Network Fee:</span>
                        <span className="font-medium">${selectedReceipt.networkFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Platform Fee:</span>
                        <span className="font-medium">FREE</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-muted-foreground font-medium">Total Fees:</span>
                        <span className="font-bold">
                          ${(selectedReceipt.networkFee + selectedReceipt.platformFee).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blockchain & IPFS Info */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Blockchain & Storage</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Receipt Hash</p>
                        <p className="text-muted-foreground font-mono text-xs">{selectedReceipt.receiptHash}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(selectedReceipt.receiptHash)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">IPFS Hash (Simulated)</p>
                        <p className="text-muted-foreground font-mono text-xs">{selectedReceipt.ipfsHash}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(selectedReceipt.ipfsHash)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>

                    {selectedReceipt.transactionHash && (
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Transaction Hash</p>
                          <p className="text-muted-foreground font-mono text-xs">{selectedReceipt.transactionHash}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(selectedReceipt.transactionHash)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Details */}
                {selectedReceipt.receiptData.description && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                      {selectedReceipt.receiptData.description}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setSelectedReceipt(null)} className="flex-1">
                    Close
                  </Button>
                  <Button
                    onClick={() => downloadReceipt(selectedReceipt)}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
