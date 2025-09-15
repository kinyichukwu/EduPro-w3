// Demo component showing how to integrate Solana payments into EduPro
import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSolanaPayment } from "../../../shared/hooks";
import { solanaAPI } from "../../../services/solana";
import { Button } from "../../../shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Badge } from "../../../shared/components/ui/badge";
import { Loader2, CreditCard, Coins } from "lucide-react";
import type {
  TokenInfo,
  PaymentState,
} from "../../../shared/types/solana";

export const PaymentDemo: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [supportedTokens, setSupportedTokens] = useState<TokenInfo[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);

  // Payment configuration
  const paymentConfig = {
    priceId: "demo_price_123",
    usdAmount: 9.99,
    supportedTokens,
    userWallet: publicKey,
    onSuccess: (result: any) => {
      console.log("Payment successful:", result);
      alert(`Payment successful! Transaction: ${result.transaction_id}`);
    },
    onError: (error: any) => {
      console.error("Payment failed:", error);
      alert(`Payment failed: ${error.message}`);
    },
    onCancel: () => {
      console.log("Payment cancelled");
      alert("Payment cancelled");
    },
  };

  const {
    paymentState,
    selectToken,
    processPayment,
    cancelPayment,
    isExpired,
    getTimeRemaining,
    canRetry,
    retryPayment,
    isWalletReady,
  } = useSolanaPayment(paymentConfig);

  // Load supported tokens
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const tokens = await solanaAPI.getSupportedTokens();
        setSupportedTokens(tokens);
      } catch (error) {
        console.error("Failed to load tokens:", error);
      }
    };
    loadTokens();
  }, []);

  // Auto-select SOL as default token
  useEffect(() => {
    if (supportedTokens.length > 0 && !selectedToken) {
      const solToken = supportedTokens.find((token) => token.symbol === "SOL");
      if (solToken) {
        setSelectedToken(solToken);
        selectToken(solToken);
      }
    }
  }, [supportedTokens, selectedToken, selectToken]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderPaymentStep = () => {
    switch (paymentState.step) {
      case "select-token":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Payment Method</h3>
            <div className="grid gap-3">
              {supportedTokens.map((token) => (
                <div
                  key={token.symbol}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedToken?.symbol === token.symbol
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    setSelectedToken(token);
                    selectToken(token);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Coins className="h-5 w-5" />
                      <div>
                        <p className="font-medium">{token.name}</p>
                        <p className="text-sm text-gray-600">{token.symbol}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      ~${paymentState.amount.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => selectToken(selectedToken!)}
              disabled={!selectedToken}
              className="w-full"
            >
              Continue with {selectedToken?.symbol}
            </Button>
          </div>
        );

      case "review-payment":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Review Payment</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span>EduPro Premium Access</span>
                <span className="font-medium">${paymentState.amount}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Token: {selectedToken?.name}</span>
                <span>
                  {paymentState.tokenAmount} {selectedToken?.symbol}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={cancelPayment}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={processPayment} className="flex-1">
                Pay Now
              </Button>
            </div>
          </div>
        );

      case "sign-transaction":
        return (
          <div className="space-y-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <h3 className="text-lg font-medium">Sign Transaction</h3>
            <p className="text-gray-600">
              Please sign the transaction in your wallet to complete the
              payment.
            </p>
            <Button onClick={cancelPayment} variant="outline">
              Cancel
            </Button>
          </div>
        );

      case "submitting":
        return (
          <div className="space-y-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <h3 className="text-lg font-medium">Submitting Payment</h3>
            <p className="text-gray-600">
              Submitting your transaction to the Solana network...
            </p>
          </div>
        );

      case "confirming":
        return (
          <div className="space-y-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <h3 className="text-lg font-medium">Confirming Payment</h3>
            <p className="text-gray-600">
              Waiting for transaction confirmation...
            </p>
            {paymentState.transactionId && (
              <p className="text-xs font-mono text-gray-500">
                TX: {paymentState.transactionId.slice(0, 8)}...
                {paymentState.transactionId.slice(-8)}
              </p>
            )}
          </div>
        );

      case "success":
        return (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-800">
              Payment Successful!
            </h3>
            <p className="text-gray-600">
              Your payment has been processed successfully.
            </p>
            {paymentState.transactionId && (
              <p className="text-xs font-mono text-gray-500">
                Transaction: {paymentState.transactionId}
              </p>
            )}
          </div>
        );

      case "error":
        return (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <CreditCard className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-red-800">Payment Failed</h3>
            <p className="text-red-600">{paymentState.error}</p>
            <div className="flex gap-3">
              <Button
                onClick={cancelPayment}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              {canRetry && (
                <Button onClick={retryPayment} className="flex-1">
                  Retry
                </Button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solana Payment Demo</CardTitle>
          <CardDescription>
            Connect your Solana wallet to try the payment demo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            Please connect your wallet first to use Solana payments.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Solana Payment Demo
        </CardTitle>
        <CardDescription>
          Experience crypto payments with SOL, USDC, or PYUSD
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Payment status and expiry */}
          {paymentState.expiresAt &&
            paymentState.step !== "success" &&
            paymentState.step !== "error" && (
              <div className="flex items-center justify-between text-sm">
                <span>Time remaining:</span>
                <Badge variant={isExpired() ? "destructive" : "secondary"}>
                  {formatTime(getTimeRemaining())}
                </Badge>
              </div>
            )}

          {/* Payment step content */}
          {renderPaymentStep()}

          {/* Debug info (remove in production) */}
          {process.env.NODE_ENV === "development" && (
            <details className="mt-6">
              <summary className="cursor-pointer text-sm text-gray-500">
                Debug Info
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(
                  {
                    step: paymentState.step,
                    selectedToken: selectedToken?.symbol,
                    amount: paymentState.amount,
                    tokenAmount: paymentState.tokenAmount,
                    isExpired: isExpired(),
                    walletReady: isWalletReady,
                    transactionId: paymentState.transactionId,
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
