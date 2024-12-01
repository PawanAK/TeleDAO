"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useOkto, OktoContextType } from "okto-sdk-react"
import { RulesEditModal } from "@/app/components/RulesEditModal"
import { LoginButton } from "@/app/components/LoginButton"
import { useToast } from "@/hooks/use-toast"

export default function CommunityRules({ params }: { params: { communityId: string } }) {
  console.log("Rendering CommunityRules component")
  console.log("Community ID:", params.communityId)

  const router = useRouter()
  const { data: session } = useSession()
  const { isLoggedIn, authenticate } = useOkto() as OktoContextType
  const [rules, setRules] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    console.log("Fetching community rules")
    // TODO: Fetch community rules from an API or database
    // For now, we'll use a placeholder
    setRules("These are placeholder community rules.")
    console.log("Rules set to placeholder")
  }, [params.communityId])

  const handleAuthenticate = async () => {
    console.log("Attempting authentication")
    if (session?.user?.email) {
      try {
        await authenticate(session.user.email)
        console.log("Authentication successful")
      } catch (error) {
        console.error("Authentication failed:", error)
      }
    } else {
      console.log("No user email available for authentication")
    }
  }

  const handleSaveRules = (newRules: string) => {
    console.log("Saving new rules:", newRules)
    // TODO: Save rules to an API or database
    setRules(newRules)
    
    toast({
      title: "Success",
      description: "Community rules updated successfully",
    })
    console.log("Rules updated and toast displayed")
  }

  console.log("Current session status:", !!session)
  console.log("Current login status:", isLoggedIn)

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center">Community Rules</h1>

          {!session && (
            <div className="text-center p-4">
              <p className="mb-4">Please sign in to view community rules</p>
              <LoginButton />
            </div>
          )}

          {session && !isLoggedIn && (
            <div className="text-center p-4">
              <p className="mb-4">Connect your wallet to view community rules</p>
              <button
                onClick={handleAuthenticate}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Connect Wallet
              </button>
            </div>
          )}

          {session && isLoggedIn && (
            <>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="font-semibold mb-2">Current Rules:</h2>
                <p className="whitespace-pre-wrap">{rules}</p>
              </div>

              <button
                onClick={() => {
                  console.log("Opening rules edit modal")
                  setIsModalOpen(true)
                }}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
              >
                Modify Rules
              </button>

              <RulesEditModal
                isOpen={isModalOpen}
                onClose={() => {
                  console.log("Closing rules edit modal")
                  setIsModalOpen(false)
                }}
                currentRules={rules}
                onSave={handleSaveRules}
              />
            </>
          )}
        </div>
      </div>
    </main>
  )
} 