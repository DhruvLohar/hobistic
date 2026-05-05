"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoginDialog } from "@/components/home/login-dialog"
import { useAuth } from "@/hooks/use-auth"

export function GetStartedButton() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return (
      <LoginDialog>
        <Button className="mt-8 w-full self-start rounded-full py-8 text-xl font-semibold sm:mt-12 sm:w-64">
          Get Started
          <ArrowRight data-icon="inline-end" className="ml-2 -rotate-45" />
        </Button>
      </LoginDialog>
    )
  }

  if (isLoading) {
    return (
      <Button
        disabled
        className="mt-8 w-full self-start rounded-full py-8 text-xl font-semibold sm:mt-12 sm:w-64 opacity-70"
      >
        <Loader2 className="mr-2 animate-spin" />
        Just a Sec
      </Button>
    )
  }

  if (user) {
    return (
      <Button
        className="mt-8 w-full self-start rounded-full py-8 text-xl font-semibold sm:mt-12 sm:w-64"
        onClick={() => router.push("/dashboard")}
      >
        Go to Dashboard
        <ArrowRight data-icon="inline-end" className="ml-2 -rotate-45" />
      </Button>
    )
  }

  return (
    <LoginDialog>
      <Button className="mt-8 w-full self-start rounded-full py-8 text-xl font-semibold sm:mt-12 sm:w-64">
        Get Started
        <ArrowRight data-icon="inline-end" className="ml-2 -rotate-45" />
      </Button>
    </LoginDialog>
  )
}
