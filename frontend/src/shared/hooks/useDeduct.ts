// Hook for handling SOL deductions from user wallets
import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { solanaAPI } from "../../services/solana";

export interface DeductState {
  isLoading: boolean;
  error: string | null;
  transaction: string | null;
  deductionId: string | null;
  status: "idle" | "creating" | "signing" | "submitting" | "success" | "error";
}

export interface DeductRequest {
  walletAddress: string;
  amount: number; // in lamports
  tokenMint: string;
}

export interface DeductResponse {
  deduction_id: string;
  transaction: string;
  amount: number;
  token_mint: string;
  status: string;
  message: string;
}

export const useDeduct = () => {
  const { publicKey, signTransaction } = useWallet();
  
  const [state, setState] = useState<DeductState>({
    isLoading: false,
    error: null,
    transaction: null,
    deductionId: null,
    status: "idle",
  });

  // Create deduction transaction
  const createDeduction = useCallback(async (request: DeductRequest): Promise<DeductResponse> => {
    if (!publicKey) {
      throw new Error("Wallet not connected");
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      status: "creating",
    }));

    try {
      const response = await solanaAPI.deductFromWallet({
        wallet_address: request.walletAddress,
        amount: request.amount,
        token_mint: request.tokenMint,
      });

      setState(prev => ({
        ...prev,
        transaction: response.transaction,
        deductionId: response.deduction_id,
        status: "signing",
        isLoading: false,
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create deduction";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        status: "error",
        isLoading: false,
      }));
      throw error;
    }
  }, [publicKey]);

  // Sign the deduction transaction
  const signDeduction = useCallback(async (): Promise<string> => {
    if (!signTransaction || !state.transaction) {
      throw new Error("Cannot sign transaction: wallet not connected or transaction not available");
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      status: "signing",
    }));

    try {
      // Decode the base64 transaction
      const transactionBuffer = Buffer.from(state.transaction, "base64");
      const transaction = Transaction.from(transactionBuffer);

      // Sign the transaction
      const signedTransaction = await signTransaction(transaction);

      // Serialize signed transaction back to base64
      const signedTransactionBase64 = Buffer.from(
        signedTransaction.serialize({ requireAllSignatures: false })
      ).toString("base64");

      setState(prev => ({
        ...prev,
        status: "submitting",
        isLoading: true,
      }));

      return signedTransactionBase64;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to sign transaction";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        status: "error",
        isLoading: false,
      }));
      throw error;
    }
  }, [signTransaction, state.transaction]);

  // Submit signed transaction (you'll need to implement this endpoint)
  const submitDeduction = useCallback(async (signedTransaction: string): Promise<any> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      status: "submitting",
    }));

    try {
      // TODO: Implement submit endpoint in backend
      // const response = await solanaAPI.submitDeduction({
      //   deduction_id: state.deductionId,
      //   signed_transaction: signedTransaction,
      // });

      // For now, just simulate success
      setState(prev => ({
        ...prev,
        status: "success",
        isLoading: false,
      }));

      return { success: true, message: "Deduction submitted successfully" };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit deduction";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        status: "error",
        isLoading: false,
      }));
      throw error;
    }
  }, [state.deductionId]);

  // Complete deduction flow
  const processDeduction = useCallback(async (request: DeductRequest): Promise<void> => {
    try {
      // Step 1: Create deduction transaction
      await createDeduction(request);

      // Step 2: Sign transaction
      const signedTransaction = await signDeduction();

      // Step 3: Submit deduction
      await submitDeduction(signedTransaction);
    } catch (error) {
      console.error("Deduction process failed:", error);
      // Error handling is done in individual steps
    }
  }, [createDeduction, signDeduction, submitDeduction]);

  // Reset state
  const resetDeduction = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      transaction: null,
      deductionId: null,
      status: "idle",
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    state,
    createDeduction,
    signDeduction,
    submitDeduction,
    processDeduction,
    resetDeduction,
    clearError,
    isWalletReady: !!publicKey && !!signTransaction,
  };
};
