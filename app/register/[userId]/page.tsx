'use client'

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useOkto, OktoContextType } from "okto-sdk-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, Copy } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Account, Aptos, AptosConfig, Network, InputSubmitTransactionData } from "@aptos-labs/ts-sdk";
import {
  Ed25519PrivateKey,
  Serializer,
  MoveVector,
  U64,
} from "@aptos-labs/ts-sdk";


export default function Register({ params }: { params: { userId: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { isLoggedIn, getWallets } = useOkto() as OktoContextType
  const [aptosWallet, setAptosWallet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  // Module address for your Move contract
  const MODULE_ADDRESS = "0x880873652998d2cb0c63db5d7b11d7115a626f278c6d1bc56170aead9a8b00e4"

  const privateKey = new Ed25519PrivateKey(
    "0x78c13830e66f2685bd0c61c6cce6035ea66ca3ead544d857dce2336a7d55d741"
  );
  const admin = Account.fromPrivateKey({ privateKey });
  
  const [formData, setFormData] = useState({
    communityId: "",
    name: "",
    rules: "",
    walletAddress: ""
  })

  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);

  const [uniqueLink, setUniqueLink] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push("/")
    } else {
      setFormData(prev => ({ ...prev, communityId: params.userId }))
    }
  }, [session, router, params.userId])

  useEffect(() => {
    if (isLoggedIn) {
      loadWallets()
    }
  }, [isLoggedIn])

  const loadWallets = async () => {
    try {
      const response = await getWallets()
      const walletsData = response.wallets || []
      const aptosWallet = walletsData.find(wallet => wallet.network_name === "APTOS_TESTNET")
      if (aptosWallet) {
        setAptosWallet(aptosWallet)
        setFormData(prev => ({ ...prev, walletAddress: aptosWallet.address }))
        localStorage.setItem('aptosWallet', JSON.stringify(aptosWallet))
      }
    } catch (error) {
      console.error("Error fetching wallets:", error)
      toast({
        title: "Error",
        description: "Failed to fetch wallet information. Please try again.",
        variant: "destructive",
      })
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const timestamp = Date.now()
      const generatedLink = `${window.location.origin}/community/${formData.communityId}-${timestamp}`
      
      // Prepare blockchain transaction
      const transaction = await aptos.transaction.build.simple({
        sender: admin.accountAddress,
        data: {
          function: `${MODULE_ADDRESS}::communitySaver::create_community`,
          functionArguments: [
            aptosWallet.address, // owner
            formData.communityId, // community_id
            formData.name, // community_name
            formData.rules // community_prompt
          ]
        },
      })

      console.log(transaction)


      // Sign and submit transaction
      const senderAuthenticator = await aptos.transaction.sign({ signer: admin, transaction });
      console.log('Sender Authenticator:', senderAuthenticator);
      const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });
      console.log('Pending Transaction:', pendingTxn);
      // Set unique link
      setUniqueLink(generatedLink)

      // Store data in local storage
      localStorage.setItem('communityData', JSON.stringify({
        ...formData,
        uniqueLink: generatedLink,
        userId: session?.user?.email
      }))

      toast({
        title: "Success",
        description: "Your community has been registered successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: "Failed to register your community. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uniqueLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
      variant: "default",
    })
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-lg mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl text-center">Community Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {aptosWallet && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-1">Your APTOS Wallet Address:</p>
                <p className="font-mono text-xs md:text-sm break-all bg-gray-50 p-2 rounded">
                  {aptosWallet.address}
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="communityId">Community ID</Label>
                <Input
                  id="communityId"
                  value={formData.communityId}
                  onChange={(e) => setFormData({...formData, communityId: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rules">Community Rules</Label>
                <Textarea
                  id="rules"
                  value={formData.rules}
                  onChange={(e) => setFormData({...formData, rules: e.target.value})}
                  className="h-32"
                  required      
                />
              </div>

              <input type="hidden" value={formData.walletAddress} />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Community"
                )}
              </Button>
            </form>

            
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
