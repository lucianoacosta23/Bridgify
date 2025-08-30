"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Wallet, Link, Receipt, Shield, Settings, TrendingUp, TrendingDown } from "lucide-react"
import { BuyCryptoForm } from "@/components/buy-crypto-form"
import { SellCryptoForm } from "@/components/sell-crypto-form"
import { PaymentLinksManager } from "@/components/payment-links-manager"
import { ReceiptManager } from "@/components/receipt-manager"
import { SettingsManager } from "@/components/settings-manager"
import { PrivacyMixer } from "@/components/privacy-mixer"
import { useExchangeRates } from "@/hooks/use-exchange-rates"
import { useOrders } from "@/hooks/use-orders"
import { WalletStatusBadge } from "@/components/wallet-status-badge"
import { Toaster } from "@/components/ui/toaster"

interface MetaMaskProvider {
  isMetaMask?: boolean
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on: (event: string, callback: (...args: any[]) => void) => void
  removeListener: (event: string, callback: (...args: any[]) => void) => void
}

declare global {
  interface Window {
    ethereum?: MetaMaskProvider
  }
}

export default function BridgifyDashboard() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [balance, setBalance] = useState({ eth: "0.0", usdc: "0.0", usd: "0.00" })
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [networkError, setNetworkError] = useState("")
  const [ethBalance, setEthBalance] = useState("0.0")
  const [selectedCrypto, setSelectedCrypto] = useState("ETH")
  
  // Remove duplicate availableBalance state since we're using ethBalance
  const [showBuyForm, setShowBuyForm] = useState(false)
  const [showSellForm, setShowSellForm] = useState(false)
  const [showPaymentLinks, setShowPaymentLinks] = useState(false)
  const [showReceipts, setShowReceipts] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPrivacyMixer, setShowPrivacyMixer] = useState(false)
  const router = useRouter()

  const { rates, status, fetchLiveRates, convertCryptoPrice } = useExchangeRates()
  const { orders, createOrder: createOrderApi, isLoading: ordersLoading, refetch: refetchOrders } = useOrders(walletAddress)
  
  // Define the structure of our rates object
  interface RateInfo {
    usd: number;
  }

  type CryptoRates = {
    [key: string]: RateInfo;
  };

  // Calculate total portfolio value based on crypto holdings and current prices
  const calculatePortfolioValue = useCallback((balances: typeof balance) => {
    let total = 0;
    
    // Add USD balance (remove the USD from the total as we'll calculate it from crypto)
    // total += parseFloat(balances.usd) || 0;
    
    // Get crypto rates from the rates object
    const cryptoRates = rates.crypto;
    
    // Add crypto values
    for (const [key, value] of Object.entries(balances)) {
      if (key === 'usd') continue;
      
      const amount = parseFloat(value as string) || 0;
      const rateKey = key.toUpperCase();
      
      if (cryptoRates[rateKey as keyof typeof cryptoRates]) {
        const rate = cryptoRates[rateKey as keyof typeof cryptoRates];
        total += amount * (typeof rate === 'number' ? rate : 0);
      }
    }
    
    return total.toFixed(2);
  }, [rates]);

  // Define balance type for better type safety
  type BalanceType = {
    [key: string]: string;
    eth: string;
    usdc: string;
    usd: string;
  };

  // Calculate total balance from orders
  const calculateBalanceFromOrders = useCallback((orders: any[]): BalanceType => {
    // Initialize with default values
    const newBalance: BalanceType = {
      eth: '0',
      usdc: '0',
      usd: '0'
    };

    // Process all orders to calculate current balances
    orders.forEach(order => {
      const cryptoKey = order.crypto_currency?.toLowerCase() as keyof BalanceType;
      const amount = parseFloat(order.crypto_amount || '0');
      
      if (!cryptoKey || isNaN(amount)) return;
      
      const currentBalance = parseFloat(newBalance[cryptoKey] || '0');
      
      if (order.order_type === 'buy') {
        newBalance[cryptoKey] = (currentBalance + amount).toFixed(6);
      } else if (order.order_type === 'sell') {
        newBalance[cryptoKey] = Math.max(0, currentBalance - amount).toFixed(6);
      }
    });

    // Calculate total portfolio value in USD
    const totalValue = calculatePortfolioValue(newBalance);
    newBalance.usd = totalValue;
    
    // Update ETH balance display
    if (newBalance.eth !== undefined) {
      setEthBalance(parseFloat(newBalance.eth).toFixed(4));
    }

    return newBalance;
  }, [calculatePortfolioValue]);

  // Get orders for the current wallet
  const { orders: currentOrders, isLoading: isLoadingOrders } = useOrders(walletAddress);

  // Update balance when orders change or when wallet connects
  useEffect(() => {
    if (!isWalletConnected) return;
    
    const updateBalance = () => {
      // Always calculate balance from orders first if available
      if (currentOrders && currentOrders.length > 0) {
        const newBalance = calculateBalanceFromOrders(currentOrders);
        console.log('Updating balance from orders:', newBalance);
        
        // Update the main balance state with calculated values
        setBalance(prev => ({
          eth: newBalance.eth || '0',
          usdc: newBalance.usdc || '0',
          usd: newBalance.usd || '0'
        }));
        
        // Update ETH balance display
        const ethValue = newBalance.eth || '0';
        setEthBalance(parseFloat(ethValue).toFixed(4));
        
        // Save to localStorage for persistence
        localStorage.setItem('bridgify-balance', JSON.stringify({
          eth: ethValue,
          usdc: newBalance.usdc || '0',
          usd: newBalance.usd || '0'
        }));
      } else if (isWalletConnected && (!currentOrders || currentOrders.length === 0)) {
        // If no orders, reset to zero balance
        console.log('No orders found, resetting balance to zero');
        const zeroBalance = { eth: '0', usdc: '0', usd: '0' };
        setBalance(zeroBalance);
        setEthBalance('0.0000');
        localStorage.setItem('bridgify-balance', JSON.stringify(zeroBalance));
      }
    };
    
    updateBalance();
  }, [currentOrders, isWalletConnected, calculateBalanceFromOrders]);
  
  // Function to create a new order
  const createOrder = useCallback(async (orderData: any) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          walletAddress: walletAddress,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      const newOrder = await response.json();
      
      // Refresh orders to update the balance
      if (refetchOrders) {
        await refetchOrders();
      }
      
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }, [walletAddress, refetchOrders]);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("bridgify-dark-mode")
    const isDarkMode = savedDarkMode ? JSON.parse(savedDarkMode) : true

    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Check if MetaMask is installed
    if (typeof window !== "undefined" && window.ethereum?.isMetaMask) {
      setIsMetaMaskInstalled(true)

      // Check if already connected
      checkConnection()

      // Set up event listeners
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          setWalletAddress(accounts[0])
          fetchBalance(accounts[0])
        }
      }

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [])

  const checkConnection = async () => {
    try {
      if (!window.ethereum) return

      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (accounts.length > 0) {
        setIsWalletConnected(true)
        setWalletAddress(accounts[0])
        await fetchBalance(accounts[0])

        // Check network (optional - can be expanded for specific networks)
        const chainId = await window.ethereum!.request({ method: "eth_chainId" })
        console.log("[v0] Connected to chain:", chainId)
      }
    } catch (error) {
      console.error("[v0] Error checking connection:", error)
    }
  }

  const fetchBalance = async (address: string) => {
    try {
      if (!window.ethereum) return

      const balanceHex = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })

      // Convert from wei to ETH
      const balanceWei = Number.parseInt(balanceHex, 16)
      const balanceEth = (balanceWei / Math.pow(10, 18)).toFixed(4)

      setEthBalance(balanceEth)
      setBalance((prev) => ({
        ...prev,
        eth: balanceEth,
        usd: (Number.parseFloat(balanceEth) * 3640).toFixed(2), // Approximate USD value
      }))
    } catch (error) {
      console.error("[v0] Error fetching balance:", error)
    }
  }

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      window.open("https://metamask.io/download/", "_blank")
      return
    }

    setIsConnecting(true)
    setNetworkError("")

    try {
      // Request account access
      const accounts = await window.ethereum!.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setIsWalletConnected(true)
        setWalletAddress(accounts[0])
        await fetchBalance(accounts[0])

        // Check network (optional - can be expanded for specific networks)
        const chainId = await window.ethereum!.request({ method: "eth_chainId" })
        console.log("[v0] Connected to chain:", chainId)
      }
    } catch (error: any) {
      console.error("[v0] Error connecting wallet:", error)
      if (error.code === 4001) {
        setNetworkError("Connection rejected by user")
      } else {
        setNetworkError("Failed to connect wallet")
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = useCallback(() => {
    setIsWalletConnected(false)
    setWalletAddress("")
    setEthBalance("0.0")
    setBalance({ eth: "0.0", usdc: "0.0", usd: "0.00" })
    setNetworkError("")
  }, [])

  const goToHome = useCallback(() => {
    setShowPaymentLinks(false)
    setShowReceipts(false)
    setShowSettings(false)
    setShowPrivacyMixer(false)
    setShowBuyForm(false)
    setShowSellForm(false)
    // Scroll to top of the page
    window.scrollTo(0, 0)
  }, [])

  const availableBalance = {
    ETH: ethBalance, // Use real ETH balance
    USDC: balance.usdc,
    USDT: "500.00",
    ARB: "1200.50",
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={goToHome}
            >
              <img src="/favicon.ico" alt="Bridgify Logo" className="w-10 h-10" />
              <h1 className="text-3xl font-bold text-foreground">Bridgify</h1>
            </div>

            <div className="flex items-center space-x-4">
              <WalletStatusBadge
                isConnected={isWalletConnected}
                isMetaMaskInstalled={isMetaMaskInstalled}
                networkError={networkError}
                className="hidden md:flex"
              />


              {isWalletConnected && (
                <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} className="hidden md:flex">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              )}

              {isWalletConnected ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground font-mono">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                  <span className="text-sm font-medium text-foreground">{ethBalance} ETH</span>
                  <Button variant="outline" size="sm" onClick={disconnectWallet}>
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isConnecting ? "Connecting..." : isMetaMaskInstalled ? "Connect Wallet" : "Install MetaMask"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {networkError && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-sm text-red-600">{networkError}</p>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!isWalletConnected ? (
          // Welcome Screen
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Welcome to Bridgify</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Your secure crypto on/off-ramp platform with privacy features. Connect your MetaMask wallet to get started
              with buying, selling, and managing your digital assets.
            </p>
            <Button
              onClick={connectWallet}
              size="lg"
              disabled={isConnecting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Wallet className="w-5 h-5 mr-2" />
              {isConnecting ? "Connecting..." : isMetaMaskInstalled ? "Connect MetaMask" : "Install MetaMask"}
            </Button>
            {!isMetaMaskInstalled && (
              <p className="text-sm text-muted-foreground mt-4">
                MetaMask is required to use Bridgify. Click the button above to install it.
              </p>
            )}
          </div>
        ) : showPaymentLinks ? (
          // Payment Links Manager
          <div>
            <div className="mb-6">
              <Button variant="outline" onClick={() => setShowPaymentLinks(false)} className="mb-4">
                ← Back to Dashboard
              </Button>
            </div>
            <PaymentLinksManager />
          </div>
        ) : showReceipts ? (
          <div>
            <div className="mb-6">
              <Button variant="outline" onClick={() => setShowReceipts(false)} className="mb-4">
                ← Back to Dashboard
              </Button>
            </div>
            <ReceiptManager />
          </div>
        ) : showSettings ? (
          <div>
            <div className="mb-6">
              <Button variant="outline" onClick={() => setShowSettings(false)} className="mb-4">
                ← Back to Dashboard
              </Button>
            </div>
            <SettingsManager />
          </div>
        ) : showPrivacyMixer ? (
          <div>
            <div className="mb-6">
              <Button variant="outline" onClick={() => setShowPrivacyMixer(false)} className="mb-4">
                ← Back to Dashboard
              </Button>
            </div>
            <PrivacyMixer />
          </div>
        ) : (
          // Main Dashboard
          <div className="space-y-8">
            {/* Balance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">${calculatePortfolioValue(balance)}</div>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +12.5% (24h)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ethereum</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{ethBalance} ETH</div>
                  <div className="text-sm text-muted-foreground">
                    ≈ ${(Number.parseFloat(ethBalance) * (rates.crypto?.ETH || 0)).toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">USD Coin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{balance.usdc} USDC</div>
                  <div className="text-sm text-muted-foreground">≈ $1,250.00</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => setShowBuyForm(true)}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Buy Crypto</h3>
                  <p className="text-sm text-muted-foreground">Purchase crypto with fiat</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:bg-accent/5 transition-colors"
                onClick={() => setShowSellForm(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Sell Crypto</h3>
                  <p className="text-sm text-muted-foreground">Convert crypto to fiat</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:bg-accent/5 transition-colors"
                onClick={() => setShowPaymentLinks(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Link className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Payment Links</h3>
                  <p className="text-sm text-muted-foreground">Create & manage links</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:bg-accent/5 transition-colors"
                onClick={() => setShowPrivacyMixer(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Privacy Mixer</h3>
                  <p className="text-sm text-muted-foreground">Enhanced privacy features</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Receipt className="w-5 h-5 mr-2" />
                    Recent Transactions
                  </CardTitle>
                  <CardDescription>Your latest crypto activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ordersLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : orders && orders.length > 0 ? (
                      orders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                          onClick={() => setShowReceipts(true)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center">
                              {order.order_type === 'buy' ? (
                                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground capitalize">
                                {order.order_type} {order.crypto_currency}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              order.order_type === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {order.order_type === 'buy' ? '+' : '-'}{order.crypto_amount} {order.crypto_currency}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ${order.fiat_amount.toFixed(2)} {order.fiat_currency}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No recent transactions found
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowReceipts(true)}>
                        <Receipt className="w-4 h-4 mr-2" />
                        View All Receipts
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Platform Features
                  </CardTitle>
                  <CardDescription>Explore Bridgify's capabilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div
                      className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/5 transition-colors"
                      onClick={() => setShowSettings(true)}
                    >
                      <div>
                        <p className="font-medium text-foreground">Free Community Service</p>
                        <p className="text-sm text-muted-foreground">No fees, completely free to use</p>
                      </div>
                      <Badge variant="outline" className="text-green-600 dark:text-green-400">
                        Free
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Multi-Chain Support</p>
                        <p className="text-sm text-muted-foreground">Ethereum & Arbitrum networks</p>
                      </div>
                      <Badge variant="outline" className="text-primary">
                        Active
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">QR Code Payments</p>
                        <p className="text-sm text-muted-foreground">Easy mobile transactions</p>
                      </div>
                      <Badge variant="outline" className="text-primary">
                        Available
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">IPFS Receipt Storage</p>
                        <p className="text-sm text-muted-foreground">Decentralized transaction records</p>
                      </div>
                      <Badge variant="outline" className="text-primary">
                        Simulated
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowSettings(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showBuyForm} onOpenChange={setShowBuyForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Buy Cryptocurrency</DialogTitle>
          </DialogHeader>
          <BuyCryptoForm onClose={() => setShowBuyForm(false)} walletAddress={walletAddress} />
        </DialogContent>
      </Dialog>

      <Dialog open={showSellForm} onOpenChange={(open) => {
        if (open) {
          // Refresh orders and balance when opening the sell form
          refetchOrders().then(() => {
            console.log('Refreshed orders and balance for sell form');
          });
        }
        setShowSellForm(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Sell Cryptocurrency</DialogTitle>
          </DialogHeader>
          <SellCryptoForm
            key={`sell-form-${balance.eth}-${balance.usdc}`} // Force re-render when balance changes
            onClose={() => {
              setShowSellForm(false);
              refetchOrders();
            }}
            availableBalance={{
              eth: balance.eth,
              usdc: balance.usdc,
              usd: balance.usd,
              walletAddress: walletAddress || ''
            }}
          />
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
