"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { AuthProvider, useAuthContext } from "@/hooks/use-auth"

interface HobbyLayoutProps {
  children: React.ReactNode
}

function HobbyAuthBoundary({ children }: HobbyLayoutProps) {
  const router = useRouter()
  const { user, isLoading, error } = useAuthContext()

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/")
    }
  }, [isLoading, router, user])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center text-destructive">
        {error.message}
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

export default function HobbyLayout({ children }: HobbyLayoutProps) {
  return (
    <AuthProvider>
      <HobbyAuthBoundary>{children}</HobbyAuthBoundary>
    </AuthProvider>
  )
}
