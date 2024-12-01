"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useOkto, OktoContextType } from "okto-sdk-react";

export default function Register() {
  const { data: session } = useSession();
  const router = useRouter();
  const { isLoggedIn, getWallets } = useOkto() as OktoContextType;
  const [aptosWallet, setAptosWallet] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    communityId: "",
    name: "",
    rules: "",
    walletAddress: ""
  });
  const [uniqueLink, setUniqueLink] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

  useEffect(() => {
    if (isLoggedIn) {
      loadWallets();
    }
  }, [isLoggedIn]);

  const loadWallets = async () => {
    try {
      const response = await getWallets();
      const walletsData = response.wallets || [];
      const aptosWallet = walletsData.find(wallet => wallet.network_name === "APTOS_TESTNET");
      if (aptosWallet) {
        setAptosWallet(aptosWallet);
        setFormData(prev => ({ ...prev, walletAddress: aptosWallet.address }));
        // Save to localStorage
        localStorage.setItem('aptosWallet', JSON.stringify(aptosWallet));
      }
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const timestamp = Date.now();
    const generatedLink = `${window.location.origin}/community/${formData.communityId}-${timestamp}`;
    setUniqueLink(generatedLink);

    // Save all form data including wallet address to localStorage
    localStorage.setItem('communityData', JSON.stringify({
      ...formData,
      uniqueLink: generatedLink,
      userId: session?.user?.email
    }));

    console.log("Registration data:", {
      ...formData,
      uniqueLink: generatedLink,
      userId: session?.user?.email
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Community Registration</h1>
        
        {/* Display Aptos Wallet Info */}
        {aptosWallet && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Your APTOS Wallet:</h2>
            <p className="break-all text-sm"><strong>Address:</strong> {aptosWallet.address}</p>
            <p className="text-sm"><strong>Network:</strong> {aptosWallet.network_name}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Community ID
            </label>
            <input
              type="text"
              value={formData.communityId}
              onChange={(e) => setFormData({...formData, communityId: e.target.value})}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Community Rules
            </label>
            <textarea
              value={formData.rules}
              onChange={(e) => setFormData({...formData, rules: e.target.value})}
              className="w-full p-2 border rounded-md h-32"
              required
            />
          </div>

          {/* Hidden input for wallet address */}
          <input
            type="hidden"
            value={formData.walletAddress}
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Submit
          </button>
        </form>

        {uniqueLink && (
          <div className="mt-6 p-4 bg-green-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Your Unique Community Link:</h2>
            <p className="break-all text-blue-500">{uniqueLink}</p>
          </div>
        )}
      </div>
    </main>
  );
} 