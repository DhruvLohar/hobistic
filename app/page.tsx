import Image from "next/image"
import { LoginDialog } from "@/components/home/login-dialog"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import HeroCarousel from "@/components/home/hero-carousel"

export default function Page() {
  return (
    <div className="relative min-h-svh bg-[url('/background-mobile.webp')] bg-cover bg-center bg-no-repeat md:bg-[url('/background.webp')]">
      <div className="absolute top-10 left-0 flex w-full justify-center md:w-1/2">
        <h1 className="font-product text-white text-3xl font-bold sm:text-4xl md:text-4xl">
          HobiStic
        </h1>
      </div>

      <HeroCarousel />

      <div className="absolute top-0 right-0 hidden h-full w-1/2 md:block">
        <div className="flex h-full flex-col items-start justify-start px-16 pt-36 text-center">
          <h2 className="text-8xl font-product font-semibold text-foreground text-left">
            Stick to your <br /> <span className="text-primary">Hobbies</span>
          </h2>
          <span className="mt-3 max-w-md text-lg text-left translate-x-2">
            Turn free time into fun skill time - pick a hobby, level up, and enjoy
            every step.
          </span>
          <LoginDialog>
            <Button className="w-64 mt-12 rounded-full self-start py-8 text-xl font-semibold">
              Get Started
              <ArrowRight data-icon="inline-end" className="ml-2 -rotate-45" />
            </Button>
          </LoginDialog>
        </div>
      </div>
    </div>
  )
}
