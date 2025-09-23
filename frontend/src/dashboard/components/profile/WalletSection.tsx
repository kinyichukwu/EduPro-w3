// Wallet connection section for Profile page
import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWallet as useEduProWallet } from "../../../shared/hooks";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "../../../shared/components/ui/button";
import { Alert, AlertDescription } from "../../../shared/components/ui/alert";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
} from "lucide-react";

export const WalletSection: React.FC = () => {
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
    loadWallets,
  } = useEduProWallet();

  const [verifyingWallet, setVerifyingWallet] = useState<string | null>(null);
  const [disconnectingWallet, setDisconnectingWallet] = useState<string | null>(
    null
  );
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Load wallets on component mount
  useEffect(() => {
    if (connected) {
      loadWallets();
    }
  }, [connected, loadWallets]);

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

      // In a real implementation, you'd sign this message with the wallet
      // For demo purposes, we'll use a mock signature (base64 encoded)
      const signature = btoa("mock_signature");

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

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-4">
      {/* Wallet Connection Status */}
      {!connected ? (
        <div className="text-center p-4 bg-dark-accent/10 rounded-xl border border-white/5">
          <div className="mb-4">
            <div className="text-sm text-dark-muted mb-2">
              Connect your Solana wallet to access payment features
            </div>
            <WalletMultiButton className="!bg-white/10 !text-white !border !border-white/20 !rounded-lg !px-6 !py-2 !font-medium hover:!bg-white/20 transition-colors" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connected Wallet Display */}
          <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl border border-green-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-300">
                  Wallet Connected
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-green-400 font-mono">
                    {formatAddress(publicKey?.toString() || "")}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-green-500/20"
                    onClick={() => copyToClipboard(publicKey?.toString() || "")}
                  >
                    {copiedAddress === publicKey?.toString() ? (
                      <CheckCircle className="h-3 w-3 text-green-400" />
                    ) : (
                      <Copy className="h-3 w-3 text-green-400" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-green-500/20"
                    onClick={() => 
                      window.open(`https://explorer.solana.com/address/${publicKey?.toString()}`, '_blank')
                    }
                  >
                    <ExternalLink className="h-3 w-3 text-green-400" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Backend Connection Status */}
          {!wallets || wallets.length === 0 ? (
            <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-300">
                    Connect to EduPro Backend
                  </p>
                  <p className="text-xs text-yellow-400 mt-1">
                    Save your wallet to access all features
                  </p>
                </div>
                <Button
                  onClick={handleConnectToBackend}
                  disabled={isLoading}
                  size="sm"
                  className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect to EduPro"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Connected Wallets</h4>
                <div className="flex items-center gap-2 text-xs text-dark-muted">
                  <span>{wallets?.length || 0} wallet{(wallets?.length || 0) !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              {(wallets || []).map((wallet, idx) => {
                if (!wallet) {
                  // Defensive: skip undefined wallet entries
                  return (
                    <div
                      key={`undefined-wallet-${idx}`}
                      className="flex items-center justify-between p-3 bg-dark-accent/20 rounded-lg border border-white/5 opacity-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono text-dark-muted">
                            (Wallet data unavailable)
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between p-3 bg-dark-accent/20 rounded-lg border border-white/5"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono">
                          {wallet.wallet_address ? formatAddress(wallet.wallet_address) : 'Unknown address'}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => wallet.wallet_address && copyToClipboard(wallet.wallet_address)}
                          disabled={!wallet.wallet_address}
                        >
                          {copiedAddress === wallet.wallet_address ? (
                            <CheckCircle className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3 text-dark-muted" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {wallet.is_verified ? (
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-xs text-yellow-400 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Unverified
                          </span>
                        )}
                        {wallet.is_primary && (
                          <span className="text-xs text-blue-400 px-2 py-0.5 bg-blue-500/20 rounded-full">
                            Primary
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
                          className="border-white/10 hover:border-turbo-purple/50 text-xs"
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
                        className="border-red/30 text-red hover:bg-red/10 text-xs"
                      >
                        {disconnectingWallet === wallet.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Remove"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Status Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-dark-accent/10 rounded-xl border border-white/5">
            <div className="text-center">
              <div
                className={`text-lg font-bold ${
                  connected ? "text-green-400" : "text-dark-muted"
                }`}
              >
                {connected ? "✓" : "○"}
              </div>
              <p className="text-xs text-dark-muted">Wallet Connected</p>
            </div>
            <div className="text-center">
              <div
                className={`text-lg font-bold ${
                  hasVerifiedWallet ? "text-green-400" : "text-dark-muted"
                }`}
              >
                {hasVerifiedWallet ? "✓" : "○"}
              </div>
              <p className="text-xs text-dark-muted">Wallet Verified</p>
            </div>
          </div>

        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-red/30 bg-red/5">
          <XCircle className="h-4 w-4 text-red" />
          <AlertDescription className="flex items-center justify-between text-red">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={clearError}
              className="border-red/30 text-red hover:bg-red/10"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

    </div>
  );
};
