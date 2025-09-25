import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { solanaAPI } from "../../services/solana";
import type {
  SwapRequest,
  SwapExecuteResponse,
  SubmitSwapTransactionRequest,
  SwapStatus,
} from "../types/solana/swap";

export interface SwapState {
  isLoading: boolean;
  error: string | null;
  swapData: SwapExecuteResponse | null;
  swapStatus: SwapStatus | null;
  step: "idle" | "executing" | "signing" | "submitting" | "completed" | "error";
  currentTransaction: "sol" | "edupo" | null;
}

export const useSwap = () => {
  const { publicKey, signTransaction: walletSignTransaction } = useWallet();
  
  const [state, setState] = useState<SwapState>({
    isLoading: false,
    error: null,
    swapData: null,
    swapStatus: null,
    step: "idle",
    currentTransaction: null,
  });

  // Execute swap to get transactions
  const executeSwap = useCallback(async (request: SwapRequest): Promise<SwapExecuteResponse> => {
    if (!publicKey) {
      throw new Error("Wallet not connected");
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      step: "executing",
    }));

    try {
      const response = await solanaAPI.executeSwap({
        ...request,
        userWallet: publicKey.toString(),
      });

      setState(prev => ({
        ...prev,
        swapData: response,
        step: "signing",
        isLoading: false,
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to execute swap";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        step: "error",
        isLoading: false,
      }));
      throw error;
    }
  }, [publicKey]);

  // Sign a transaction (SOL or EduPro)
  const signSwapTransaction = useCallback(async (transactionType: "sol" | "edupo"): Promise<string> => {
    if (!walletSignTransaction || !state.swapData) {
      throw new Error("Cannot sign transaction: wallet not connected or swap data not available");
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      currentTransaction: transactionType,
    }));

    try {
      const transactionBase64 = transactionType === "sol" 
        ? state.swapData.solTransaction 
        : state.swapData.edupoTransaction;

      // Parse real Solana transaction from backend
      const transactionBuffer = Uint8Array.from(atob(transactionBase64), c => c.charCodeAt(0));
      const transaction = Transaction.from(transactionBuffer);

      // Sign the transaction with user's wallet
      const signedTransaction = await walletSignTransaction(transaction);

      // Serialize signed transaction back to base64
      const signedTransactionBase64 = btoa(String.fromCharCode(...signedTransaction.serialize({ requireAllSignatures: false })));
      
      return signedTransactionBase64;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to sign transaction";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        step: "error",
        isLoading: false,
        currentTransaction: null,
      }));
      throw error;
    }
  }, [walletSignTransaction, state.swapData]);

  // Sign and submit SOL transaction (now handles complete swap)
  const signAndSubmitSOL = useCallback(async (): Promise<void> => {
    if (!publicKey || !state.swapData) {
      throw new Error("Wallet not connected or swap data not available");
    }

    try {
      setState(prev => ({
        ...prev,
        currentTransaction: "sol",
        step: "signing",
        isLoading: true,
      }));

      // Sign the SOL transaction
      const signature = await signSwapTransaction("sol");

      setState(prev => ({
        ...prev,
        currentTransaction: null,
        step: "submitting",
      }));

      // Submit the signed transaction - backend now handles the complete swap
      const submitRequest: SubmitSwapTransactionRequest = {
        swapId: state.swapData.swapId,
        transaction: state.swapData.solTransaction,
        signature,
        userWallet: publicKey.toString(),
        inputMint: state.swapData.inputMint,
        outputMint: state.swapData.outputMint,
        inputAmount: Number(state.swapData.inAmount),
      };

      const result = await solanaAPI.submitSwapTransaction(submitRequest);

      // Check if the swap was completed successfully
      if (result.status === "completed") {
        setState(prev => ({
          ...prev,
          step: "completed",
          isLoading: false,
          currentTransaction: null,
        }));
      } else {
        throw new Error("Swap not completed successfully");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to complete swap";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        step: "error",
        currentTransaction: null,
        isLoading: false,
      }));
      throw error;
    }
  }, [publicKey, state.swapData, signSwapTransaction]);

  // Sign and submit EduPro transaction
  const signAndSubmitEduPro = useCallback(async (): Promise<void> => {
    if (!publicKey || !state.swapData) {
      throw new Error("Wallet not connected or swap data not available");
    }

    try {
      // Sign the EduPro transaction
      const signature = await signSwapTransaction("edupo");

      // Submit the signed transaction
      const submitRequest: SubmitSwapTransactionRequest = {
        swapId: state.swapData.swapId,
        transaction: state.swapData.edupoTransaction,
        signature,
        userWallet: publicKey.toString(),
        inputMint: state.swapData.inputMint,
        outputMint: state.swapData.outputMint,
        inputAmount: Number(state.swapData.inAmount),
      };

      await solanaAPI.submitSwapTransaction(submitRequest);

      setState(prev => ({
        ...prev,
        currentTransaction: null,
        step: "completed",
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to sign and submit EduPro transaction";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        step: "error",
        currentTransaction: null,
        isLoading: false,
      }));
      throw error;
    }
  }, [publicKey, state.swapData, signSwapTransaction]);

  // Sign and submit SOL transaction with provided data (now handles complete swap)
  const signAndSubmitSOLWithData = useCallback(async (swapData: SwapExecuteResponse): Promise<void> => {
    if (!publicKey || !walletSignTransaction) {
      throw new Error("Wallet not connected");
    }

    try {
      setState(prev => ({
        ...prev,
        currentTransaction: "sol",
        step: "signing",
      }));

      // Parse and sign the SOL transaction
      const transactionBuffer = Uint8Array.from(atob(swapData.solTransaction), c => c.charCodeAt(0));
      const transaction = Transaction.from(transactionBuffer);
      const signedTransaction = await walletSignTransaction(transaction);
      const signedTransactionBase64 = btoa(String.fromCharCode(...signedTransaction.serialize({ requireAllSignatures: false })));

      setState(prev => ({
        ...prev,
        currentTransaction: null,
        step: "submitting",
      }));

      // Submit the signed transaction - backend now handles the complete swap
      const submitRequest: SubmitSwapTransactionRequest = {
        swapId: swapData.swapId,
        transaction: swapData.solTransaction,
        signature: signedTransactionBase64,
        userWallet: publicKey.toString(),
        inputMint: swapData.inputMint,
        outputMint: swapData.outputMint,
        inputAmount: Number(swapData.inAmount),
      };

      const result = await solanaAPI.submitSwapTransaction(submitRequest);

      // Check if the swap was completed successfully
      if (result.status === "completed") {
        setState(prev => ({
          ...prev,
          step: "completed",
          isLoading: false,
          currentTransaction: null,
        }));
      } else {
        throw new Error("Swap not completed successfully");
      }
    } catch (error) {
      let errorMessage = "Failed to complete swap";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Provide more specific error messages
        if (error.message.includes("User rejected")) {
          errorMessage = "Transaction was rejected by user";
        } else if (error.message.includes("Insufficient funds")) {
          errorMessage = "Insufficient SOL balance for transaction";
        } else if (error.message.includes("Invalid transaction")) {
          errorMessage = "Invalid transaction data";
        }
      }
      setState(prev => ({
        ...prev,
        error: errorMessage,
        step: "error",
        currentTransaction: null,
        isLoading: false,
      }));
      throw error;
    }
  }, [publicKey, walletSignTransaction]);

  // Sign and submit EduPro transaction with provided data
  const signAndSubmitEduProWithData = useCallback(async (swapData: SwapExecuteResponse): Promise<void> => {
    if (!publicKey || !walletSignTransaction) {
      throw new Error("Wallet not connected");
    }

    try {
      // Parse and sign the EduPro transaction
      const transactionBuffer = Uint8Array.from(atob(swapData.edupoTransaction), c => c.charCodeAt(0));
      const transaction = Transaction.from(transactionBuffer);
      const signedTransaction = await walletSignTransaction(transaction);
      const signedTransactionBase64 = btoa(String.fromCharCode(...signedTransaction.serialize({ requireAllSignatures: false })));

      // Submit the signed transaction
      const submitRequest: SubmitSwapTransactionRequest = {
        swapId: swapData.swapId,
        transaction: swapData.edupoTransaction,
        signature: signedTransactionBase64,
        userWallet: publicKey.toString(),
        inputMint: swapData.inputMint,
        outputMint: swapData.outputMint,
        inputAmount: Number(swapData.inAmount),
      };

      await solanaAPI.submitSwapTransaction(submitRequest);

      setState(prev => ({
        ...prev,
        currentTransaction: null,
        step: "completed",
        isLoading: false,
      }));
    } catch (error) {
      let errorMessage = "Failed to sign and submit EduPro transaction";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Provide more specific error messages
        if (error.message.includes("User rejected")) {
          errorMessage = "EduPro transaction was rejected by user";
        } else if (error.message.includes("Insufficient funds")) {
          errorMessage = "Organization has insufficient EduPro tokens";
        } else if (error.message.includes("Invalid transaction")) {
          errorMessage = "Invalid EduPro transaction data";
        } else if (error.message.includes("Token account")) {
          errorMessage = "Token account not found or not initialized";
        }
      }
      setState(prev => ({
        ...prev,
        error: errorMessage,
        step: "error",
        currentTransaction: null,
        isLoading: false,
      }));
      throw error;
    }
  }, [publicKey, walletSignTransaction]);

  // Complete the entire swap process
  const completeSwap = useCallback(async (request: SwapRequest): Promise<void> => {
    if (!publicKey) {
      throw new Error("Wallet not connected");
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      step: "executing",
    }));

    try {
      // 1. Execute swap to get transactions
      const swapData = await executeSwap(request);

      // 2. Sign and submit the correct leg based on direction
      const SOL_MINT = "So11111111111111111111111111111111111111112";
      const EDUPRO_MINT = "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV";

      if (swapData.inputMint === SOL_MINT && swapData.outputMint === EDUPRO_MINT) {
        // SOL → EDU: user signs SOL
        await signAndSubmitSOLWithData(swapData);
      } else if (swapData.inputMint === EDUPRO_MINT && swapData.outputMint === SOL_MINT) {
        // EDU → SOL: user signs EDU
        await signAndSubmitEduProWithData(swapData);
      } else {
        throw new Error("Unsupported swap direction");
      }

      // 3. Swap completed (backend handled the counter-transfer)
      setState(prev => ({
        ...prev,
        step: "completed",
        isLoading: false,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to complete swap";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        step: "error",
        isLoading: false,
      }));
      throw error;
    }
  }, [publicKey, executeSwap, signAndSubmitSOLWithData]);

  // Get swap status
  const getSwapStatus = useCallback(async (swapId: string): Promise<SwapStatus> => {
    try {
      const status = await solanaAPI.getSwapStatus(swapId);
      setState(prev => ({
        ...prev,
        swapStatus: status,
      }));
      return status;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get swap status";
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      swapData: null,
      swapStatus: null,
      step: "idle",
      currentTransaction: null,
    });
  }, []);

  return {
    ...state,
    executeSwap,
    signSwapTransaction,
    signAndSubmitSOL,
    signAndSubmitEduPro,
    completeSwap,
    getSwapStatus,
    reset,
  };
};
