"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Shield, AlertTriangle, Clock, CheckCircle, Eye, EyeOff, Info } from "lucide-react"

interface MixingSession {
  id: string
  amount: string
  currency: string
  status: "pending" | "mixing" | "complete" | "failed"
  progress: number
  estimatedTime: string
  mixingPool: string
  anonymitySet: number
}

export function PrivacyMixer() {
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("ETH")
  const [mixingDelay, setMixingDelay] = useState("1")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentSession, setCurrentSession] = useState<MixingSession | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [mixingSessions] = useState<MixingSession[]>([
    {
      id: "mix_001",
      amount: "1.2",
      currency: "ETH",
      status: "complete",
      progress: 100,
      estimatedTime: "0 min",
      mixingPool: "Pool Alpha",
      anonymitySet: 47,
    },
    {
      id: "mix_002",
      amount: "500",
      currency: "USDC",
      status: "mixing",
      progress: 65,
      estimatedTime: "8 min",
      mixingPool: "Pool Standard", // Renamed from "Pool Beta"
      anonymitySet: 23,
    },
  ])

  const availableBalance = {
    ETH: "2.45",
    USDC: "1250.00",
    USDT: "500.00",
    ARB: "1200.50",
  }

  const startMixing = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) return

    setIsProcessing(true)

    // Simulate mixing process
    const newSession: MixingSession = {
      id: `mix_${Date.now()}`,
      amount,
      currency,
      status: "mixing",
      progress: 0,
      estimatedTime: `${Number.parseInt(mixingDelay) * 10} min`,
      mixingPool: "Pool Gamma",
      anonymitySet: Math.floor(Math.random() * 50) + 20,
    }

    setCurrentSession(newSession)

    // Simulate progress updates
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5
      if (progress >= 100) {
        progress = 100
        setCurrentSession((prev) =>
          prev ? { ...prev, status: "complete", progress: 100, estimatedTime: "0 min" } : null,
        )
        clearInterval(interval)
        setIsProcessing(false)
      } else {
        setCurrentSession((prev) => (prev ? { ...prev, progress: Math.floor(progress) } : null))
      }
    }, 1000)

    // Reset form
    setAmount("")
    setTimeout(() => setIsProcessing(false), 2000)
  }

  const getStatusIcon = (status: MixingSession["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "mixing":
        return <Shield className="w-4 h-4 text-blue-600 animate-pulse" />
      case "complete":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "failed":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
    }
  }

  const getStatusColor = (status: MixingSession["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "mixing":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "complete":
        return "bg-green-50 text-green-700 border-green-200"
      case "failed":
        return "bg-red-50 text-red-700 border-red-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center">
            <Shield className="w-6 h-6 mr-2 text-purple-600" />
            Privacy Mixer
          </h2>
          <p className="text-muted-foreground">Enhanced privacy for your crypto transactions (Testnet Only)</p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          Simulated
        </Badge>
      </div>

      {/* Warning Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Testnet Only - Compliance Notice</p>
              <p>
                This privacy mixer is for educational and testing purposes only. It operates exclusively on testnets and
                simulates privacy mixing functionality. Not available on mainnet for regulatory compliance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mixing Form */}
        <Card>
          <CardHeader>
            <CardTitle>Start Privacy Mix</CardTitle>
            <CardDescription>Mix your crypto for enhanced privacy and anonymity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Mix</Label>
              <div className="flex space-x-2">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1"
                />
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="ARB">ARB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Available: {availableBalance[currency as keyof typeof availableBalance]} {currency}
              </p>
            </div>

            {/* Mixing Delay */}
            <div className="space-y-2">
              <Label htmlFor="delay">Mixing Delay (Hours)</Label>
              <Select value={mixingDelay} onValueChange={setMixingDelay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hour (Lower Privacy)</SelectItem>
                  <SelectItem value="6">6 Hours (Medium Privacy)</SelectItem>
                  <SelectItem value="24">24 Hours (High Privacy)</SelectItem>
                  <SelectItem value="72">72 Hours (Maximum Privacy)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Longer delays provide better anonymity but take more time</p>
            </div>

            {/* Advanced Options */}
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="p-0 h-auto text-primary hover:text-primary/80"
              >
                {showAdvanced ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showAdvanced ? "Hide" : "Show"} Advanced Options
              </Button>

              {showAdvanced && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Mixing Pool Selection</Label>
                    <Select defaultValue="auto">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-Select (Recommended)</SelectItem>
                        <SelectItem value="alpha">Pool Alpha (High Volume)</SelectItem>
                        <SelectItem value="beta">Pool Standard (Medium Volume)</SelectItem>
                        <SelectItem value="gamma">Pool Gamma (Low Volume)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Anonymity Set Target</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (10-20 participants)</SelectItem>
                        <SelectItem value="medium">Medium (20-50 participants)</SelectItem>
                        <SelectItem value="high">High (50+ participants)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Fee Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mixing Fee:</span>
                <span className="text-foreground">0.1% (Free for Community)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network Fee:</span>
                <span className="text-foreground">~$2.50</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Total Cost:</span>
                <span>~$2.50</span>
              </div>
            </div>

            <Button
              onClick={startMixing}
              disabled={!amount || Number.parseFloat(amount) <= 0 || isProcessing}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Shield className="w-4 h-4 mr-2 animate-pulse" />
                  Starting Mix...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Start Privacy Mix
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Mixing Status & History */}
        <Card>
          <CardHeader>
            <CardTitle>Mixing Sessions</CardTitle>
            <CardDescription>Track your privacy mixing progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Session */}
            {currentSession && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Current Session</h4>
                  <Badge className={getStatusColor(currentSession.status)}>
                    {getStatusIcon(currentSession.status)}
                    <span className="ml-1 capitalize">{currentSession.status}</span>
                  </Badge>
                </div>

                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">
                      {currentSession.amount} {currentSession.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pool:</span>
                    <span>{currentSession.mixingPool}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Anonymity Set:</span>
                    <span>{currentSession.anonymitySet} participants</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Time:</span>
                    <span>{currentSession.estimatedTime}</span>
                  </div>

                  {currentSession.status === "mixing" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress:</span>
                        <span>{currentSession.progress}%</span>
                      </div>
                      <Progress value={currentSession.progress} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Previous Sessions */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Recent Sessions</h4>
              {mixingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(session.status)}
                    <div>
                      <p className="font-medium text-foreground">
                        {session.amount} {session.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.mixingPool} • {session.anonymitySet} participants
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(session.status)}>
                    {session.status === "mixing" ? `${session.progress}%` : session.status}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">How Privacy Mixing Works</p>
                  <p>
                    Your funds are pooled with other users' funds, then redistributed after a delay. This breaks the
                    transaction link between your input and output addresses, enhancing privacy.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
