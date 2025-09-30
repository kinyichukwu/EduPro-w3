"use client"

import { useState, useEffect } from "react"
import { Wallet, LogOut, Copy, CheckCircle } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"

interface WalletConnectionProps {
  connected: boolean
  onConnect: () => void
  onDisconnect: () => void
}

export function WalletConnection({ connected, onConnect, onDisconnect }: WalletConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const balance = "1,247.50"
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (connected && !walletAddress) {
      setWalletAddress("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHkv")
    }
  }, [connected, walletAddress])

  const handleConnect = () => {
    setIsConnecting(true)
    // Simulate wallet connection delay
    setTimeout(() => {
      onConnect()
      setIsConnecting(false)
    }, 1500)
  }

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (connected) {
    return (
      <div className="flex items-center gap-3">
        <Card className="glass border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="gradient-primary p-2 rounded-lg">
                <Wallet className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold">{balance}</span>
                  <Badge variant="secondary" className="text-xs">
                    EDU
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground font-mono">{truncateAddress(walletAddress)}</span>
                  <Button variant="ghost" size="sm" onClick={() => void copyAddress()} className="h-4 w-4 p-0 hover:bg-transparent">
                    {copied ? (
                      <CheckCircle className="h-3 w-3 text-success" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          size="sm"
          onClick={onDisconnect}
          className="glass border-border/50 hover:bg-destructive/10 bg-transparent hover:border-destructive/50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity duration-200"
    >
      <Wallet className="h-4 w-4 mr-2" />
      {isConnecting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground mr-2" />
          Connecting...
        </>
      ) : (
        "Connect Wallet"
      )}
    </Button>
  )
}
