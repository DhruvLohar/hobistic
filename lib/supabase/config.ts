interface SupabaseConfig {
  url: string
  anonKey: string
}

const MISSING_ENV_ERROR =
  "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local."

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return null
  }

  return { url, anonKey }
}

export function getRequiredSupabaseConfig(): SupabaseConfig {
  const config = getSupabaseConfig()

  if (!config) {
    throw new Error(MISSING_ENV_ERROR)
  }

  return config
}
