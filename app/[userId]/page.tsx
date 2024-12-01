"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function UserIdCapture({ params }: { params: { userId: string } }) {
  const router = useRouter()

  useEffect(() => {
    localStorage.setItem('pendingUserId', params.userId)
    router.push('/')
  }, [params.userId, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
}