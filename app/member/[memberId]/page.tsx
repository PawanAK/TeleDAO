"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MemberIdCapture({ params }: { params: { memberId: string } }) {
  const router = useRouter()

  useEffect(() => {
    console.log('MemberIdCapture: Starting with memberId:', params.memberId)
    
    try {
      // Save the member ID in localStorage
      localStorage.setItem('pendingMemberId', params.memberId)
      console.log('MemberIdCapture: Saved memberId to localStorage')
      
      // Redirect to home page
      console.log('MemberIdCapture: Redirecting to home page')
      router.push('/')
    } catch (error) {
      console.error('MemberIdCapture: Error occurred:', error)
    }
  }, [params.memberId, router])

  console.log('MemberIdCapture: Rendering loading spinner')
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
}