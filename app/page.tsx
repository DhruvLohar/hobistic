import type { Metadata } from "next"
import { GetStartedButton } from "@/components/home/get-started-button"
import HeroCarousel from "@/components/home/hero-carousel"

export const metadata: Metadata = {
  title: "HobiStic - Stick to your Hobbies",
  description:
    "Explore hobbies tailored to your interests and build consistency with guided steps on HobiStic.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Discover and stick to hobbies",
    description:
      "Explore hobbies tailored to your interests and build consistency with guided steps on HobiStic.",
    url: "/",
    images: [
      {
        url: "/background.webp",
        width: 1200,
        height: 630,
        alt: "HobiStic landing page",
      },
    ],
  },
  twitter: {
    title: "Discover and stick to hobbies",
    description:
      "Explore hobbies tailored to your interests and build consistency with guided steps on HobiStic.",
    images: ["/background.webp"],
  },
}

export default function Page() {
  return (
    <div className="relative min-h-svh bg-[url('/background-mobile.webp')] bg-cover bg-center bg-no-repeat md:bg-[url('/background.webp')]">
      <div className="absolute top-10 left-0 flex w-full justify-center md:w-1/2">
        <h1 className="font-product text-3xl font-bold text-white sm:text-4xl md:text-4xl">
          HobiStic
        </h1>
      </div>

      <HeroCarousel />

      {/* mobile CTA — bottom overlay */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-10 pt-24 text-center md:hidden">
        <h2 className="font-product text-4xl font-semibold text-white sm:text-5xl">
          Stick to your <span className="text-primary">Hobbies</span>
        </h2>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/80 sm:text-base">
          Turn free time into fun skill time — pick a hobby, level up, and
          enjoy every step.
        </p>
        <div className="mt-6 w-full">
          <GetStartedButton />
        </div>
      </div>

      {/* desktop CTA — right panel */}
      <div className="absolute top-0 right-0 hidden h-full w-1/2 md:block">
        <div className="flex h-full flex-col items-start justify-center px-16 text-center">
          <h2 className="text-left font-product text-8xl font-semibold text-foreground">
            Stick to your <br /> <span className="text-primary">Hobbies</span>
          </h2>
          <span className="mt-3 max-w-md translate-x-2 text-left text-lg">
            Turn free time into fun skill time - pick a hobby, level up, and
            enjoy every step.
          </span>
          <GetStartedButton />
        </div>
      </div>
    </div>
  )
}
