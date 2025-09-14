// Wallet management hook for EduPro integration
import { useState, useCallback, useEffect } from "react";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import type { WalletConnectionState, Wallet } from "../types/solana/wallet";
import { solanaAPI } from "../../services/solana";

export const useWallet = () => {
  const { publicKey, connected, connecting } = useSolanaWallet();

  const [connectionState, setConnectionState] = useState<WalletConnectionState>(
    {
      isConnected: false,
      isConnecting: false,
      publicKey: null,
      wallets: [],
      isLoading: false,
      error: null,
    }
  );

  // Update connection state when wallet adapter state changes
  useEffect(() => {
    setConnectionState((prev: WalletConnectionState) => ({
      ...prev,
      isConnected: connected,
      isConnecting: connecting,
      publicKey: publicKey?.toString() || null,
    }));
  }, [connected, connecting, publicKey]);

  // Load user's connected wallets
  const loadWallets = useCallback(async () => {
    try {
      setConnectionState((prev: WalletConnectionState) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));
      const response = await solanaAPI.getWallets();
      setConnectionState((prev: WalletConnectionState) => ({
        ...prev,
        wallets: response.wallets,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load wallets";
      setConnectionState((prev: WalletConnectionState) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  // Connect wallet to EduPro backend
  const connectWalletToBackend = useCallback(
    async (address: string): Promise<Wallet | null> => {
      try {
        setConnectionState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
        }));
        const response = await solanaAPI.connectWallet({ address });
        setConnectionState((prev) => ({
          ...prev,
          wallets: [...prev.wallets, response.wallet],
          isLoading: false,
        }));
        return response.wallet;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to connect wallet";
        setConnectionState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  // Verify wallet ownership
  const verifyWallet = useCallback(
    async (walletId: string, message: string, signature: string) => {
      try {
        setConnectionState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
        }));
        const response = await solanaAPI.verifyWallet({
          wallet_id: walletId,
          message,
          signature,
        });

        // Update wallet in local state
        setConnectionState((prev) => ({
          ...prev,
          wallets: prev.wallets.map((wallet) =>
            wallet.id === walletId ? response.wallet : wallet
          ),
          isLoading: false,
        }));

        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to verify wallet";
        setConnectionState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  // Disconnect wallet
  const disconnectWallet = useCallback(async (walletId: string) => {
    try {
      setConnectionState((prev) => ({ ...prev, isLoading: true, error: null }));
      await solanaAPI.disconnectWallet(walletId);

      // Remove wallet from local state
      setConnectionState((prev) => ({
        ...prev,
        wallets: prev.wallets.filter((wallet) => wallet.id !== walletId),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to disconnect wallet";
      setConnectionState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setConnectionState((prev) => ({ ...prev, error: null }));
  }, []);

  // Load wallets on component mount if user is connected
  useEffect(() => {
    if (connected && publicKey) {
      loadWallets();
    }
  }, [connected, publicKey, loadWallets]);

  return {
    ...connectionState,
    loadWallets,
    connectWalletToBackend,
    verifyWallet,
    disconnectWallet,
    clearError,
    hasVerifiedWallet: connectionState.wallets.some(
      (wallet) => wallet.is_verified
    ),
  };
};
