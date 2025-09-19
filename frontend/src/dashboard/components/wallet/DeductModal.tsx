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
  
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("0.5"); // Default to 0.5 SOL
  const [tokenMint, setTokenMint] = useState("So11111111111111111111111111111111111111112"); // SOL token mint

  // Update wallet address when modal opens or publicKey changes
  React.useEffect(() => {
    if (isOpen && publicKey) {
      setWalletAddress(publicKey.toString());
    }
  }, [isOpen, publicKey]);

  // Convert SOL to lamports (1 SOL = 1,000,000,000 lamports)
  const convertToLamports = (solAmount: string): number => {
    return Math.floor(parseFloat(solAmount) * 1_000_000_000);
  };

  const handleDeduct = async () => {
    if (!walletAddress || !amount || parseFloat(amount) <= 0) {
      console.error("Invalid wallet address or amount:", { walletAddress, amount });
      return;
    }

    const lamportsAmount = convertToLamports(amount);
    console.log("Processing deduction with:", { 
      walletAddress, 
      amount: parseFloat(amount), 
      lamportsAmount, 
      tokenMint 
    });

    try {
      await processDeduction({
        walletAddress: walletAddress.trim(),
        amount: lamportsAmount,
        tokenMint: tokenMint.trim(),
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 border-white/10 bg-dark-card/90 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Transfer SOL to EduPro</CardTitle>
          <CardDescription className="text-muted-foreground">
            Send SOL from your wallet to your EduPro account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="wallet-address" className="text-sm font-medium text-white">Wallet Address</Label>
            <Input
              id="wallet-address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter wallet address"
              disabled={state.isLoading}
              className="bg-dark-accent/20 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-white">Amount (SOL)</Label>
            <Input
              id="amount"
              type="number"
              step="0.1"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.5"
              disabled={state.isLoading}
              className="bg-dark-accent/20 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="token-mint" className="text-sm font-medium text-white">Token Mint</Label>
            <Input
              id="token-mint"
              value={tokenMint}
              onChange={(e) => setTokenMint(e.target.value)}
              placeholder="Token mint address"
              disabled={state.isLoading}
              className="bg-dark-accent/20 border-white/10 text-white"
            />
            <p className="text-sm text-muted-foreground">
              Default: SOL token mint address
            </p>
          </div>

          {/* Status Display */}
          {state.status !== "idle" && (
            <div className="p-3 bg-dark-accent/20 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">Status:</span>
                <span className="capitalize text-white">{state.status}</span>
              </div>
              {state.deductionId && (
                <div className="text-sm text-muted-foreground mt-1">
                  Transfer ID: {state.deductionId}
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={handleDeduct}
              disabled={!isWalletReady || state.isLoading || !walletAddress || !amount}
              className="flex-1 bg-white/10 text-white border border-white/20 hover:bg-white/20"
            >
              {state.isLoading ? "Processing..." : "Transfer SOL"}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={state.isLoading}
              className="border-white/10 text-muted-foreground hover:bg-dark-accent/20"
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
