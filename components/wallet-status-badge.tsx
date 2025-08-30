import { Badge } from "@/components/ui/badge"
import { Wallet, AlertTriangle, Wifi, WifiOff } from "lucide-react"

interface WalletStatusBadgeProps {
  isConnected: boolean
  isMetaMaskInstalled: boolean
  networkError?: string
  className?: string
}

export function WalletStatusBadge({
  isConnected,
  isMetaMaskInstalled,
  networkError,
  className,
}: WalletStatusBadgeProps) {
  if (!isMetaMaskInstalled) {
    return (
      <Badge variant="outline" className={`bg-orange-500/10 text-orange-600 border-orange-500/20 ${className}`}>
        <AlertTriangle className="w-3 h-3 mr-1" />
        MetaMask Required
      </Badge>
    )
  }

  if (networkError) {
    return (
      <Badge variant="outline" className={`bg-red-500/10 text-red-600 border-red-500/20 ${className}`}>
        <WifiOff className="w-3 h-3 mr-1" />
        Connection Error
      </Badge>
    )
  }

  if (isConnected) {
    return (
      <Badge variant="outline" className={`bg-green-500/10 text-green-600 border-green-500/20 ${className}`}>
        <Wallet className="w-3 h-3 mr-1" />
        Connected
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={`bg-gray-500/10 text-gray-600 border-gray-500/20 ${className}`}>
      <Wifi className="w-3 h-3 mr-1" />
      Disconnected
    </Badge>
  )
}
