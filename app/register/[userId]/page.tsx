'use client'

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useOkto, OktoContextType } from "okto-sdk-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2, Copy } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"


export default function Register({ params }: { params: { userId: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { isLoggedIn, getWallets } = useOkto() as OktoContextType
  const [aptosWallet, setAptosWallet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    communityId: "",
    name: "",
    rules: "",
    walletAddress: ""
  })

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
      setUniqueLink(generatedLink)

      localStorage.setItem('communityData', JSON.stringify({
        ...formData,
        uniqueLink: generatedLink,
        userId: session?.user?.email
      }))

      console.log("Registration data:", {
        ...formData,
        uniqueLink: generatedLink,
        userId: session?.user?.email
      })

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

            {uniqueLink && (
              <div className="mt-6 space-y-2">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Your unique community link:</p>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-md">
                      <code className="text-xs md:text-sm flex-1 break-all">
                        {uniqueLink}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyToClipboard}
                        className="shrink-0"
                      >
                        {copied ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

