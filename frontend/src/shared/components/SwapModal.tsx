import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSwap } from "../hooks/useSwap";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import {
  Loader2,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Wallet,
  Coins,
} from "lucide-react";
import type { SwapRequest } from "../types/solana/swap";

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SwapModal: React.FC<SwapModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { publicKey, connected } = useWallet();
  const {
    isLoading,
    error,
    swapData,
    step,
    currentTransaction,
    executeSwap,
    signAndSubmitSOL,
    signAndSubmitEduPro,
    completeSwap,
    reset,
  } = useSwap();

  const [solAmount, setSolAmount] = useState<string>("0.001");
  const [isAutoMode, setIsAutoMode] = useState<boolean>(true);

  // Constants for the swap
  const SOL_MINT = "So11111111111111111111111111111111111111112";
  const EDUPRO_MINT = "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV";
  const FIXED_RATE = 1000; // 1 SOL = 1000 EduPro tokens

  // Calculate EduPro amount
  const edupoAmount = parseFloat(solAmount) * FIXED_RATE;
  const solAmountLamports = Math.floor(parseFloat(solAmount) * 1e9);

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleSwap = async () => {
    if (!publicKey || !connected) {
      return;
    }

    try {
      if (isAutoMode) {
        // Complete the entire swap automatically
        const request: SwapRequest = {
          inputMint: SOL_MINT,
          outputMint: EDUPRO_MINT,
          amount: solAmountLamports,
          slippageBps: 100,
          userWallet: publicKey.toString(),
        };

        await completeSwap(request);
        onSuccess?.();
      } else {
        // Manual step-by-step process
        const request: SwapRequest = {
          inputMint: SOL_MINT,
          outputMint: EDUPRO_MINT,
          amount: solAmountLamports,
          slippageBps: 100,
          userWallet: publicKey.toString(),
        };

        await executeSwap(request);
      }
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };

  const handleSignSOL = async () => {
    try {
      await signAndSubmitSOL();
    } catch (error) {
      console.error("Failed to sign SOL transaction:", error);
    }
  };

  const handleSignEduPro = async () => {
    try {
      await signAndSubmitEduPro();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to sign EduPro transaction:", error);
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "executing":
        return "Creating swap transactions...";
      case "signing":
        if (currentTransaction === "sol") {
          return "Please sign the SOL transaction in your wallet";
        } else if (currentTransaction === "edupo") {
          return "Please sign the EduPro transaction in your wallet";
        }
        return "Ready to sign transactions";
      case "submitting":
        return "Submitting transactions to blockchain...";
      case "completed":
        return "Swap completed successfully!";
      case "error":
        return "Swap failed";
      default:
        return "Ready to swap";
    }
  };

  const getProgressValue = () => {
    switch (step) {
      case "executing":
        return 25;
      case "signing":
        return currentTransaction === "sol" ? 50 : 75;
      case "submitting":
        return 90;
      case "completed":
        return 100;
      default:
        return 0;
    }
  };

  const isStepCompleted = (targetStep: string) => {
    const stepOrder = ["idle", "executing", "signing", "submitting", "completed"];
    const currentIndex = stepOrder.indexOf(step);
    const targetIndex = stepOrder.indexOf(targetStep);
    return currentIndex > targetIndex;
  };

  if (!connected) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Connect Wallet
            </DialogTitle>
            <DialogDescription>
              Please connect your wallet to perform a swap.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Swap SOL to EduPro Tokens
          </DialogTitle>
          <DialogDescription>
            Exchange SOL for EduPro tokens at a fixed rate of 1:1000
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Swap Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                <span className="text-sm font-medium">You pay</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{solAmount} SOL</div>
                <div className="text-xs text-muted-foreground">
                  {solAmountLamports.toLocaleString()} lamports
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                <span className="text-sm font-medium">You receive</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{edupoAmount.toLocaleString()} EduPro</div>
                <div className="text-xs text-muted-foreground">
                  Fixed rate: 1 SOL = {FIXED_RATE} EduPro
                </div>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="sol-amount">SOL Amount</Label>
            <Input
              id="sol-amount"
              type="number"
              step="0.001"
              min="0.001"
              value={solAmount}
              onChange={(e) => setSolAmount(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Mode Selection */}
          <div className="space-y-2">
            <Label>Swap Mode</Label>
            <div className="flex gap-2">
              <Button
                variant={isAutoMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAutoMode(true)}
                disabled={isLoading}
              >
                Auto (Recommended)
              </Button>
              <Button
                variant={!isAutoMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAutoMode(false)}
                disabled={isLoading}
              >
                Manual
              </Button>
            </div>
          </div>

          {/* Progress */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{getStepDescription()}</span>
                <span>{getProgressValue()}%</span>
              </div>
              <Progress value={getProgressValue()} className="w-full" />
            </div>
          )}

          {/* Manual Steps */}
          {!isAutoMode && swapData && (
            <div className="space-y-3">
              <div className="text-sm font-medium">Transaction Steps:</div>
              
              {/* SOL Transaction */}
              <div className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  {isStepCompleted("signing") ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                  )}
                  <span className="text-sm">Sign SOL Transaction</span>
                </div>
                {step === "signing" && currentTransaction === "sol" && (
                  <Button size="sm" onClick={handleSignSOL} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign"}
                  </Button>
                )}
              </div>

              {/* EduPro Transaction */}
              <div className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  {isStepCompleted("completed") ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                  )}
                  <span className="text-sm">Sign EduPro Transaction</span>
                </div>
                {step === "submitting" && (
                  <Button size="sm" onClick={handleSignEduPro} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {step === "completed" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Swap completed successfully! You received {edupoAmount.toLocaleString()} EduPro tokens.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSwap}
              disabled={isLoading || !solAmount || parseFloat(solAmount) < 0.001}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isAutoMode ? "Processing..." : "Execute Swap"}
                </>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  {isAutoMode ? "Complete Swap" : "Execute Swap"}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
