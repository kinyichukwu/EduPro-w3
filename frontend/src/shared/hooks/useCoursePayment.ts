// Course payment hook for EduPro NFT course functionality
import { useState, useCallback, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { 
  Connection, 
  PublicKey, 
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError
} from "@solana/spl-token";
import { toast } from "react-hot-toast";

export interface CoursePaymentState {
  isLoading: boolean;
  error: string | null;
  transactionSignature: string | null;
  status: 'idle' | 'creating' | 'signing' | 'confirming' | 'confirmed' | 'error';
}

export interface CourseCreationPayment {
  amountEDU: number;
  platformWallet: string;
}

export interface CoursePurchasePayment {
  coursePrice: number; // in token units
  platformFeeBPS: number;
  sellerWallet: string;
  platformWallet: string;
}

export const useCoursePayment = () => {
  const { publicKey, signTransaction } = useWallet();

  const [paymentState, setPaymentState] = useState<CoursePaymentState>({
    isLoading: false,
    error: null,
    transactionSignature: null,
    status: 'idle',
  });

  // Configuration
  const config = useMemo(() => ({
    rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    eduTokenMint: '8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV',
    platformWallet: import.meta.env.VITE_PLATFORM_WALLET || '5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME',
  }), []);

  const connection = useMemo(() => new Connection(config.rpcUrl, 'confirmed'), [config.rpcUrl]);

  // Helper function to ensure Associated Token Account exists
  const ensureTokenAccount = async (
    owner: PublicKey, 
    mint: PublicKey
  ): Promise<{ address: PublicKey; instruction?: any }> => {
    const associatedTokenAccount = await getAssociatedTokenAddress(mint, owner);
    
    try {
      await getAccount(connection, associatedTokenAccount);
      return { address: associatedTokenAccount };
    } catch (error) {
      if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
        // Create ATA instruction
        const createATAInstruction = createAssociatedTokenAccountInstruction(
          owner, // payer
          associatedTokenAccount,
          owner, // owner
          mint
        );
        return { address: associatedTokenAccount, instruction: createATAInstruction };
      }
      throw error;
    }
  };

  // Pay course creation fee (10 EDU tokens to platform)
  const payCourseCreationFee = useCallback(async (
    amountEDU: number = 10
  ): Promise<string> => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    setPaymentState({ isLoading: true, error: null, transactionSignature: null, status: 'creating' });

    try {
      const eduMint = new PublicKey(config.eduTokenMint);
      const platformWallet = new PublicKey(config.platformWallet);
      
      // Get token accounts
      const fromTokenAccount = await ensureTokenAccount(publicKey, eduMint);
      const toTokenAccount = await ensureTokenAccount(platformWallet, eduMint);
      
      const amount = BigInt(amountEDU * 1e9); // Convert to token units

      const transaction = new Transaction();
      
      // Add create ATA instructions if needed
      if (fromTokenAccount.instruction) {
        transaction.add(fromTokenAccount.instruction);
      }
      if (toTokenAccount.instruction) {
        transaction.add(toTokenAccount.instruction);
      }

      // Add transfer instruction
      const transferInstruction = createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        publicKey,
        amount
      );
      transaction.add(transferInstruction);

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      setPaymentState(prev => ({ ...prev, status: 'signing' }));

      // Sign transaction
      const signedTx = await signTransaction(transaction);
      
      setPaymentState(prev => ({ ...prev, status: 'confirming' }));

      // Send transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, 'finalized');

      setPaymentState({
        isLoading: false,
        error: null,
        transactionSignature: signature,
        status: 'confirmed'
      });

      toast.success('Course creation payment confirmed!');
      return signature;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setPaymentState({
        isLoading: false,
        error: errorMessage,
        transactionSignature: null,
        status: 'error'
      });
      
      toast.error(`Payment failed: ${errorMessage}`);
      throw error;
    }
  }, [publicKey, signTransaction, connection, config]);

  // Purchase course with split payment (platform + seller)
  const purchaseCourse = useCallback(async (
    coursePrice: number, // in token units
    platformFeeBPS: number,
    sellerWallet: string
  ): Promise<string> => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    setPaymentState({ isLoading: true, error: null, transactionSignature: null, status: 'creating' });

    try {
      const eduMint = new PublicKey(config.eduTokenMint);
      const platformWallet = new PublicKey(config.platformWallet);
      const sellerWalletPK = new PublicKey(sellerWallet);
      
      // Get token accounts
      const buyerTokenAccount = await ensureTokenAccount(publicKey, eduMint);
      const platformTokenAccount = await ensureTokenAccount(platformWallet, eduMint);
      const sellerTokenAccount = await ensureTokenAccount(sellerWalletPK, eduMint);
      
      // Calculate split amounts
      const totalAmount = BigInt(coursePrice);
      const platformAmount = (totalAmount * BigInt(platformFeeBPS)) / BigInt(10000);
      const sellerAmount = totalAmount - platformAmount;

      const transaction = new Transaction();
      
      // Add create ATA instructions if needed
      if (buyerTokenAccount.instruction) {
        transaction.add(buyerTokenAccount.instruction);
      }
      if (platformTokenAccount.instruction) {
        transaction.add(platformTokenAccount.instruction);
      }
      if (sellerTokenAccount.instruction) {
        transaction.add(sellerTokenAccount.instruction);
      }

      // Add platform payment instruction
      if (platformAmount > 0n) {
        transaction.add(createTransferInstruction(
          buyerTokenAccount.address,
          platformTokenAccount.address,
          publicKey,
          platformAmount
        ));
      }
      
      // Add seller payment instruction
      if (sellerAmount > 0n) {
        transaction.add(createTransferInstruction(
          buyerTokenAccount.address,
          sellerTokenAccount.address,
          publicKey,
          sellerAmount
        ));
      }

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      setPaymentState(prev => ({ ...prev, status: 'signing' }));

      // Sign transaction
      const signedTx = await signTransaction(transaction);
      
      setPaymentState(prev => ({ ...prev, status: 'confirming' }));

      // Send transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, 'finalized');

      setPaymentState({
        isLoading: false,
        error: null,
        transactionSignature: signature,
        status: 'confirmed'
      });

      toast.success('Course purchase payment confirmed!');
      return signature;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Purchase failed';
      setPaymentState({
        isLoading: false,
        error: errorMessage,
        transactionSignature: null,
        status: 'error'
      });
      
      toast.error(`Purchase failed: ${errorMessage}`);
      throw error;
    }
  }, [publicKey, signTransaction, connection, config]);

  // Check EDU token balance
  const getEDUBalance = useCallback(async (): Promise<number> => {
    if (!publicKey) {
      return 0;
    }

    try {
      const eduMint = new PublicKey(config.eduTokenMint);
      const tokenAccount = await getAssociatedTokenAddress(eduMint, publicKey);
      
      try {
        const account = await getAccount(connection, tokenAccount);
        return Number(account.amount) / 1e9; // Convert from token units to EDU
      } catch (error) {
        if (error instanceof TokenAccountNotFoundError) {
          return 0;
        }
        throw error;
      }
    } catch (error) {
      console.error('Failed to get EDU balance:', error);
      return 0;
    }
  }, [publicKey, connection, config.eduTokenMint]);

  // Reset payment state
  const resetPayment = useCallback(() => {
    setPaymentState({
      isLoading: false,
      error: null,
      transactionSignature: null,
      status: 'idle'
    });
  }, []);

  return {
    paymentState,
    payCourseCreationFee,
    purchaseCourse,
    getEDUBalance,
    resetPayment,
    isWalletConnected: !!publicKey,
    walletAddress: publicKey?.toString(),
  };
};
