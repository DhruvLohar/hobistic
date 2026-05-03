"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { AuthProvider, useAuthContext } from "@/hooks/use-auth"

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardAuthBoundary({ children }: DashboardLayoutProps) {
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
        Loading your account...
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

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <DashboardAuthBoundary>{children}</DashboardAuthBoundary>
    </AuthProvider>
  )
}
