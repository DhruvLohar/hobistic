"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"

import { useAuthContext } from "@/hooks/use-auth"
import { OnboardingModal } from "@/components/onboarding/onboarding-modal"
import GuideForm from "./guide-form"
import GuidesGrid from "./guides-grid"

function DashboardContent() {
  const router = useRouter()
  const { user, profile, signOut } = useAuthContext()
  const { resolvedTheme, setTheme } = useTheme()

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

  const handleThemeToggle = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  if (!user) return null

  const needsOnboarding = profile?.onboarding_completed === false

  return (
    <div className="relative min-h-svh overflow-x-hidden">
      {needsOnboarding && <OnboardingModal />}
      {/* ambient gradient orbs — behind everything */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        {/* primary blob — top right, distorted */}
        <div
          className="absolute -top-40 -right-40 h-[640px] w-[640px] rounded-full blur-[100px] opacity-30 sm:opacity-60 lg:opacity-80"
          style={{
            background: "radial-gradient(ellipse at 60% 40%, oklch(0.514 0.222 16.935 / 0.28) 0%, oklch(0.586 0.253 17.585 / 0.14) 50%, transparent 75%)",
            transform: "rotate(-20deg) scaleX(0.85)",
          }}
        />
        {/* warm amber complement — mid left */}
        <div
          className="absolute top-[30%] -left-52 h-[520px] w-[520px] rounded-full blur-[90px] opacity-25 sm:opacity-55 lg:opacity-80"
          style={{
            background: "radial-gradient(ellipse at 40% 60%, oklch(0.78 0.18 55 / 0.18) 0%, oklch(0.70 0.15 40 / 0.10) 55%, transparent 78%)",
            transform: "rotate(15deg) scaleY(0.8)",
          }}
        />
        {/* secondary primary echo — bottom center */}
        <div
          className="absolute -bottom-48 left-1/3 h-[500px] w-[500px] rounded-full blur-[110px] opacity-20 sm:opacity-50 lg:opacity-80"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, oklch(0.514 0.222 16.935 / 0.16) 0%, transparent 70%)",
            transform: "scaleX(1.2)",
          }}
        />
      </div>

      {/* top bar */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/">
          <motion.span
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="font-product text-2xl text-primary"
          >
            HobiStic
          </motion.span>
        </Link>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleThemeToggle}
            aria-label="Toggle dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </motion.div>
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
