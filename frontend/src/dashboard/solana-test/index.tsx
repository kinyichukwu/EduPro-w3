import React from "react";
import { WalletConnect } from "../components/wallet/WalletConnect";
import { PaymentDemo } from "../components/wallet/PaymentDemo";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../shared/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../shared/components/ui/tabs";

export const SolanaTestPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Solana Integration Test</h1>
        <p className="text-muted-foreground">
          Test wallet connection and payment functionality
        </p>
      </div>

      <Tabs defaultValue="wallet" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wallet">Wallet Connection</TabsTrigger>
          <TabsTrigger value="payment">Payment Demo</TabsTrigger>
        </TabsList>

        <TabsContent value="wallet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Connection Test</CardTitle>
            </CardHeader>
            <CardContent>
              <WalletConnect />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Flow Test</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentDemo />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <p className="text-sm font-medium">Backend API</p>
              <p className="text-xs text-muted-foreground">
                Solana endpoints ready
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <p className="text-sm font-medium">Frontend Components</p>
              <p className="text-xs text-muted-foreground">
                Wallet adapter integrated
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">⚠</div>
              <p className="text-sm font-medium">Database Schema</p>
              <p className="text-xs text-muted-foreground">
                Run migration script
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Run the Supabase migration script to create wallet tables</li>
            <li>Set environment variables for Solana RPC endpoints</li>
            <li>Test wallet connection with Phantom or Solflare</li>
            <li>Test payment flow with devnet tokens</li>
            <li>Integrate into your existing course purchase flow</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};
