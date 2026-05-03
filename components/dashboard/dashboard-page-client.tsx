"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { LogOut } from "lucide-react"

import { useAuthContext } from "@/hooks/use-auth"
import { OnboardingModal } from "@/components/onboarding/onboarding-modal"
import GuideForm from "./guide-form"
import GuidesGrid from "./guides-grid"

function DashboardContent() {
  const router = useRouter()
  const { user, profile, signOut } = useAuthContext()

  const displayName = React.useMemo(
    () => profile?.display_name ?? user?.email?.split("@")[0] ?? "there",
    [profile?.display_name, user?.email]
  )

  const handleSignOut = React.useCallback(async () => {
    try {
      await signOut()
    } finally {
      router.replace("/")
    }
  }, [router, signOut])

  if (!user) return null

  const needsOnboarding = profile?.onboarding_completed === false

  return (
    <div className="relative min-h-svh overflow-x-hidden">
      {needsOnboarding && <OnboardingModal />}
      {/* decorative bg blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-1/2 -left-48 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 h-[350px] w-[350px] rounded-full bg-primary/6 blur-3xl" />
      </div>

      {/* top bar */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <motion.span
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="font-product text-2xl text-primary"
        >
          HobiStic
        </motion.span>

        <motion.button
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </motion.button>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 sm:px-10">
        {/* greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mb-10 mt-4"
        >
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            Welcome back
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold capitalize text-foreground sm:text-4xl">
            {displayName}
          </h1>
        </motion.div>

        {/* form section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mb-14"
        >
          <p className="mb-4 font-heading text-xs font-semibold uppercase tracking-widest text-primary">
            New guide
          </p>
          <GuideForm />
        </motion.div>

        {/* guides section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.35 }}
        >
          <p className="mb-4 font-heading text-xs font-semibold uppercase tracking-widest text-primary">
            Your guides
          </p>
          <GuidesGrid />
        </motion.div>
      </main>
    </div>
  )
}

export default function DashboardPageClient() {
  return <DashboardContent />
}
