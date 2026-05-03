import type { Metadata } from "next"

import DashboardPageClient from "@/components/dashboard/dashboard-page-client"

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Manage your hobby journey and profile settings in your HobiStic dashboard.",
  alternates: {
    canonical: "/dashboard",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
}

export default function DashboardPage() {
  return <DashboardPageClient />
}
