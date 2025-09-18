import React, { useState } from "react";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Alert, AlertDescription } from "../../../shared/components/ui/alert";
import { useDeduct } from "../../../shared/hooks/useDeduct";
import { useWallet } from "@solana/wallet-adapter-react";

interface DeductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeductModal: React.FC<DeductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { publicKey } = useWallet();
  const { state, processDeduction, resetDeduction, clearError, isWalletReady } = useDeduct();
  
  const [walletAddress, setWalletAddress] = useState(publicKey?.toString() || "");
  const [amount, setAmount] = useState("0.5"); // Default to 0.5 SOL
  const [tokenMint, setTokenMint] = useState("So11111111111111111111111111111111111111112"); // SOL token mint

  // Convert SOL to lamports (1 SOL = 1,000,000,000 lamports)
  const convertToLamports = (solAmount: string): number => {
    return Math.floor(parseFloat(solAmount) * 1_000_000_000);
  };

  const handleDeduct = async () => {
    if (!walletAddress || !amount) {
      return;
    }

    try {
      await processDeduction({
        walletAddress,
        amount: convertToLamports(amount),
        tokenMint,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Deduction failed:", error);
    }
  };

  const handleClose = () => {
    resetDeduction();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Deduct SOL from Wallet</CardTitle>
          <CardDescription>
            Transfer SOL from your wallet to EduPro
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="wallet-address">Wallet Address</Label>
            <Input
              id="wallet-address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter wallet address"
              disabled={state.isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (SOL)</Label>
            <Input
              id="amount"
              type="number"
              step="0.1"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.5"
              disabled={state.isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="token-mint">Token Mint</Label>
            <Input
              id="token-mint"
              value={tokenMint}
              onChange={(e) => setTokenMint(e.target.value)}
              placeholder="Token mint address"
              disabled={state.isLoading}
            />
            <p className="text-sm text-gray-500">
              Default: SOL token mint address
            </p>
          </div>

          {/* Status Display */}
          {state.status !== "idle" && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <span className="capitalize">{state.status}</span>
              </div>
              {state.deductionId && (
                <div className="text-sm text-gray-600 mt-1">
                  Deduction ID: {state.deductionId}
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={handleDeduct}
              disabled={!isWalletReady || state.isLoading || !walletAddress || !amount}
              className="flex-1"
            >
              {state.isLoading ? "Processing..." : "Deduct SOL"}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={state.isLoading}
            >
              Cancel
            </Button>
          </div>

          {state.status === "success" && (
            <Alert>
              <AlertDescription>
                ✅ Deduction completed successfully!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
