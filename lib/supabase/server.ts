import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { getRequiredSupabaseConfig } from "@/lib/supabase/config"

export async function createClient() {
  const cookieStore = await cookies()
  const config = getRequiredSupabaseConfig()

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
        })
      },
    },
  })
}
