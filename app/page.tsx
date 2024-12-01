"use client";
import React, { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useOkto, OktoContextType } from "okto-sdk-react";
import { LoginButton } from "./components/LoginButton";
import { useAppContext } from "./components/AppContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();
  const { apiKey, buildType } = useAppContext();
  const {
    isLoggedIn,
    authenticate,
    getWallets
  } = useOkto() as OktoContextType;
  const router = useRouter();
  
  const idToken = useMemo(() => (session ? session.id_token : null), [session]);
  const [wallets, setWallets] = React.useState<any[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      loadWallets();
    }
  }, [isLoggedIn]);

  async function handleAuthenticate() {
    if (!idToken) {
      console.error("Please login with Google first");
      return;
    }
    
    return new Promise((resolve) => {
      authenticate(idToken, async (result: any, error: any) => {
        if (result) {
          console.log("Okto Authentication successful");
          await loadWallets();
          router.push("/register");
          resolve({ result: true });
        } else if (error) {
          console.error("Okto Authentication error:", error);
          resolve({ result: false, error });
        }
      });
    });
  }

  async function loadWallets() {
    try {
      console.log("Fetching wallets...");
      console.log("Current login status:", isLoggedIn);
      console.log("Using idToken:", idToken);
      const response = await getWallets();
      console.log("Raw API Response:", response);
      const walletsData = response.wallets || [];
      setWallets(walletsData);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      console.error("Error details:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message
      });
    }
  }

  // Add this function to find the APTOS_TESTNET wallet
  const getAptosTestnetWallet = () => {
    return wallets.find(wallet => wallet.network_name === "APTOS_TESTNET");
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Wallet Dashboard</h1>

      {/* Authentication Status */}
      <div className="mb-8 flex items-center gap-4">
        <div className={`w-3 h-3 rounded-full ${isLoggedIn ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>Status: {isLoggedIn ? 'Connected' : 'Not Connected'}</span>
      </div>

      {/* Authentication Buttons */}
      <div className="flex gap-4 mb-8">
        <LoginButton />
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
          onClick={handleAuthenticate}
          disabled={!session || isLoggedIn}
        >
          Connect to Okto
        </button>
      </div>

      {/* APTOS_TESTNET Wallet Display */}
      {isLoggedIn && (
        <div className="w-full max-w-2xl mb-8">
          <h2 className="text-xl font-semibold mb-4">APTOS Testnet Wallet</h2>
          {getAptosTestnetWallet() ? (
            <div className="bg-white p-4 rounded-lg shadow">
              <p><strong>Network:</strong> {getAptosTestnetWallet()?.network_name}</p>
              <p className="break-all"><strong>Address:</strong> {getAptosTestnetWallet()?.address}</p>
              <p><strong>Status:</strong> {getAptosTestnetWallet()?.success ? 'Active' : 'Inactive'}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-center">No APTOS Testnet wallet found</p>
          )}
        </div>
      )}

      {/* Debug Information */}
      <div className="mb-8 text-sm text-gray-600">
        <p>Google Session: {session ? 'Yes' : 'No'}</p>
        <p>Okto Login: {isLoggedIn ? 'Yes' : 'No'}</p>
      </div>

      {/* Register Community Button */}
      <button
        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300"
        onClick={() => router.push('/register')}
        disabled={!isLoggedIn}
      >
        Register Community
      </button>
    </main>
  );
}
