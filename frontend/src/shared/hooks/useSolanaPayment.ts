// Solana payment hook for EduPro integration
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import {
  PaymentState,
  PaymentConfig,
  PaymentError,
  GeneratePaymentResponse,
  SubmitPaymentResponse,
  TokenInfo,
} from "../types/solana/solana-pay";
import { solanaAPI } from "../../services/solana";

export const useSolanaPayment = (config: PaymentConfig | null) => {
  const { publicKey, signTransaction } = useWallet();

  // Memoize stable config values to prevent unnecessary state resets
  const usdAmount = useMemo(() => config?.usdAmount || 0, [config?.usdAmount]);
  const priceId = useMemo(() => config?.priceId || "", [config?.priceId]);

  const [paymentState, setPaymentState] = useState<PaymentState>({
    step: "select-token",
    selectedToken: null,
    amount: usdAmount,
    tokenAmount: "0",
    transaction: null,
    transactionId: null,
    error: null,
    isLoading: false,
    expiresAt: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update amount when usdAmount changes
  useEffect(() => {
    setPaymentState((prev) => ({ ...prev, amount: usdAmount }));
  }, [usdAmount]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Select token and move to review step
  const selectToken = useCallback((token: TokenInfo) => {
    setPaymentState((prev) => ({
      ...prev,
      selectedToken: token,
      step: "review-payment",
      error: null,
    }));
  }, []);

  // Generate payment transaction from backend
  const generatePayment = useCallback(async () => {
    if (!publicKey || !paymentState.selectedToken) {
      throw new Error("Wallet not connected or token not selected");
    }

    setPaymentState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data: GeneratePaymentResponse = await solanaAPI.generatePayment({
        price_id: priceId,
        token: paymentState.selectedToken.symbol,
        user_wallet: publicKey.toString(),
      });

      setPaymentState((prev) => ({
        ...prev,
        transaction: data.transaction,
        tokenAmount: data.token_amount,
        expiresAt: data.expires_at,
        step: "sign-transaction",
        isLoading: false,
      }));

      return data;
    } catch (error) {
      const paymentError: PaymentError = {
        code: "GENERATE_FAILED",
        message:
          error instanceof Error ? error.message : "Failed to generate payment",
        retryable: true,
      };

      setPaymentState((prev) => ({
        ...prev,
        error: paymentError.message,
        step: "error",
        isLoading: false,
      }));

      throw paymentError;
    }
  }, [publicKey, paymentState.selectedToken, priceId]);

  // Sign transaction with user's wallet
  const signPaymentTransaction = useCallback(async () => {
    if (!signTransaction || !paymentState.transaction) {
      throw new Error(
        "Cannot sign transaction: wallet not connected or transaction not available"
      );
    }

    setPaymentState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Decode the base64 transaction
      const transactionBuffer = Buffer.from(paymentState.transaction, "base64");
      const transaction = Transaction.from(transactionBuffer);

      // Sign the transaction
      const signedTransaction = await signTransaction(transaction);

      // Serialize signed transaction back to base64
      const signedTransactionBase64 = Buffer.from(
        signedTransaction.serialize({ requireAllSignatures: false })
      ).toString("base64");

      setPaymentState((prev) => ({
        ...prev,
        step: "submitting",
        isLoading: true,
      }));

      return signedTransactionBase64;
    } catch (error) {
      const paymentError: PaymentError = {
        code: "SIGN_FAILED",
        message:
          error instanceof Error ? error.message : "Failed to sign transaction",
        retryable: true,
      };

      setPaymentState((prev) => ({
        ...prev,
        error: paymentError.message,
        step: "error",
        isLoading: false,
      }));

      throw paymentError;
    }
  }, [signTransaction, paymentState.transaction]);

  // Submit signed transaction to backend
  const submitPayment = useCallback(
    async (signedTransaction: string) => {
      setPaymentState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const data: SubmitPaymentResponse = await solanaAPI.submitPayment({
          signed_transaction: signedTransaction,
          price_id: priceId,
        });

        setPaymentState((prev) => ({
          ...prev,
          transactionId: data.transaction_id,
          step: data.status === "confirmed" ? "success" : "confirming",
          isLoading: false,
        }));

        // Call success callback
        config?.onSuccess(data);

        return data;
      } catch (error) {
        const paymentError: PaymentError = {
          code: "SUBMIT_FAILED",
          message:
            error instanceof Error ? error.message : "Failed to submit payment",
          retryable: true,
        };

        setPaymentState((prev) => ({
          ...prev,
          error: paymentError.message,
          step: "error",
          isLoading: false,
        }));

        config?.onError(paymentError);
        throw paymentError;
      }
    },
    [priceId, config]
  );

  // Complete payment flow
  const processPayment = useCallback(async () => {
    try {
      // Step 1: Generate payment transaction
      await generatePayment();

      // Step 2: Sign transaction
      const signedTransaction = await signPaymentTransaction();

      // Step 3: Submit payment
      await submitPayment(signedTransaction);
    } catch (error) {
      console.error("Payment process failed:", error);
      // Error handling is done in individual steps
    }
  }, [generatePayment, signPaymentTransaction, submitPayment]);

  // Retry payment from current step
  const retryPayment = useCallback(async () => {
    const currentStep = paymentState.step;

    try {
      switch (currentStep) {
        case "error":
          // Retry from the beginning
          setPaymentState((prev) => ({
            ...prev,
            step: "review-payment",
            error: null,
          }));
          await processPayment();
          break;

        case "sign-transaction":
          await signPaymentTransaction();
          break;

        case "submitting":
          if (paymentState.transaction) {
            const signedTransaction = await signPaymentTransaction();
            await submitPayment(signedTransaction);
          }
          break;

        default:
          await processPayment();
      }
    } catch (error) {
      console.error("Retry failed:", error);
    }
  }, [
    paymentState.step,
    paymentState.transaction,
    processPayment,
    signPaymentTransaction,
    submitPayment,
  ]);

  // Cancel payment
  const cancelPayment = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setPaymentState((prev) => ({
      ...prev,
      step: "select-token",
      selectedToken: null,
      transaction: null,
      transactionId: null,
      error: null,
      isLoading: false,
      expiresAt: null,
    }));

    config?.onCancel();
  }, [config]);

  // Reset payment state
  const resetPayment = useCallback(() => {
    setPaymentState({
      step: "select-token",
      selectedToken: null,
      amount: usdAmount,
      tokenAmount: "0",
      transaction: null,
      transactionId: null,
      error: null,
      isLoading: false,
      expiresAt: null,
    });
  }, [usdAmount]);

  // Check if payment is expired
  const isExpired = useCallback(() => {
    if (!paymentState.expiresAt) return false;
    return Date.now() / 1000 > paymentState.expiresAt;
  }, [paymentState.expiresAt]);

  // Get time remaining until expiry
  const getTimeRemaining = useCallback(() => {
    if (!paymentState.expiresAt) return 0;
    const remaining = paymentState.expiresAt - Date.now() / 1000;
    return Math.max(0, remaining);
  }, [paymentState.expiresAt]);

  return {
    paymentState,
    selectToken,
    generatePayment,
    signPaymentTransaction,
    submitPayment,
    processPayment,
    retryPayment,
    cancelPayment,
    resetPayment,
    isExpired,
    getTimeRemaining,
    canRetry: paymentState.step === "error" && paymentState.error !== null,
    isWalletReady: !!publicKey && !!signTransaction,
  };
};
