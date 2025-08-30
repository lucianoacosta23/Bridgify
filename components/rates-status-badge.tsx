"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Wifi, WifiOff } from "lucide-react"
import type { RatesStatus } from "@/hooks/use-exchange-rates"

interface RatesStatusBadgeProps {
  status: RatesStatus
  onRefresh?: () => void
  className?: string
}

export function RatesStatusBadge({ status, onRefresh, className }: RatesStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status.status) {
      case "hardcoded":
        return {
          icon: WifiOff,
          text: "Hardcoded",
          variant: "outline" as const,
          className: "text-orange-600 border-orange-600/20 bg-orange-600/10",
        }
      case "updating":
        return {
          icon: RefreshCw,
          text: "Updating...",
          variant: "outline" as const,
          className: "text-blue-600 border-blue-600/20 bg-blue-600/10",
        }
      case "live":
        return {
          icon: Wifi,
          text: `Live ${status.lastUpdated || ""}`,
          variant: "outline" as const,
          className: "text-green-600 border-green-600/20 bg-green-600/10",
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge variant={config.variant} className={config.className}>
        <Icon className={`w-3 h-3 mr-1 ${status.status === "updating" ? "animate-spin" : ""}`} />
        {config.text}
      </Badge>
      {onRefresh && status.status !== "updating" && (
        <Button variant="ghost" size="sm" onClick={onRefresh} className="h-6 w-6 p-0">
          <RefreshCw className="w-3 h-3" />
        </Button>
      )}
      {status.error && <span className="text-xs text-red-600">{status.error}</span>}
    </div>
  )
}
