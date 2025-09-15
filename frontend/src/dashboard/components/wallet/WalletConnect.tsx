// Wallet connection component for EduPro
import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWallet as useEduProWallet } from "../../../shared/hooks";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "../../../shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Alert, AlertDescription } from "../../../shared/components/ui/alert";
import {
  Loader2,
  Wallet as WalletIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";

export const WalletConnect: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const {
    wallets,
    isLoading,
    error,
    connectWalletToBackend,
    verifyWallet,
    disconnectWallet,
    clearError,
    hasVerifiedWallet,
  } = useEduProWallet();

  const [verifyingWallet, setVerifyingWallet] = useState<string | null>(null);
  const [disconnectingWallet, setDisconnectingWallet] = useState<string | null>(
    null
  );

  const handleConnectToBackend = async () => {
    if (!publicKey) return;

    try {
      await connectWalletToBackend(publicKey.toString());
    } catch (error) {
      console.error("Failed to connect to backend:", error);
    }
  };

  const handleVerifyWallet = async (walletId: string) => {
    if (!publicKey) return;

    setVerifyingWallet(walletId);
    try {
      // Generate a verification message
      const message = `Verify wallet ownership for EduPro\nTimestamp: ${Date.now()}\nWallet: ${publicKey.toString()}`;

      // In a real implementation, you'd sign this message
      // For demo purposes, we'll use a mock signature
      const signature = "mock_signature";

      await verifyWallet(walletId, message, signature);
    } catch (error) {
      console.error("Failed to verify wallet:", error);
    } finally {
      setVerifyingWallet(null);
    }
  };

  const handleDisconnectWallet = async (walletId: string) => {
    setDisconnectingWallet(walletId);
    try {
      await disconnectWallet(walletId);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    } finally {
      setDisconnectingWallet(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletIcon className="h-5 w-5" />
            Solana Wallet Connection
          </CardTitle>
          <CardDescription>
            Connect your Solana wallet to start using crypto payments in EduPro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!connected ? (
            <div className="text-center">
              <WalletMultiButton className="mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">
                Choose your preferred Solana wallet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Wallet Connected
                  </p>
                  <p className="text-xs text-green-600 font-mono">
                    {publicKey?.toString().slice(0, 8)}...
                    {publicKey?.toString().slice(-8)}
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>

              {wallets.length === 0 ? (
                <Button
                  onClick={handleConnectToBackend}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect to EduPro"
                  )}
                </Button>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Connected Wallets</h4>
                  {wallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-mono">
                          {wallet.address.slice(0, 8)}...
                          {wallet.address.slice(-8)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {wallet.is_verified ? (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </span>
                          ) : (
                            <span className="text-xs text-yellow-600 flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Unverified
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!wallet.is_verified && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyWallet(wallet.id)}
                            disabled={verifyingWallet === wallet.id}
                          >
                            {verifyingWallet === wallet.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Verify"
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDisconnectWallet(wallet.id)}
                          disabled={disconnectingWallet === wallet.id}
                        >
                          {disconnectingWallet === wallet.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Disconnect"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={clearError}>
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div
                className={`text-2xl font-bold ${
                  connected ? "text-green-600" : "text-gray-400"
                }`}
              >
                {connected ? "✓" : "○"}
              </div>
              <p className="text-sm text-muted-foreground">Wallet Connected</p>
            </div>
            <div>
              <div
                className={`text-2xl font-bold ${
                  hasVerifiedWallet ? "text-green-600" : "text-gray-400"
                }`}
              >
                {hasVerifiedWallet ? "✓" : "○"}
              </div>
              <p className="text-sm text-muted-foreground">Wallet Verified</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
