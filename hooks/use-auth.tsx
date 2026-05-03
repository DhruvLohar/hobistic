"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { User } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/client"

const AUTH_QUERY_KEY = ["auth", "user-profile"] as const
const PROFILE_COLUMNS =
  "display_name,hobbies,lifestyle,purpose,onboarding_completed"

export interface UserProfile {
  display_name: string | null
  hobbies: string[] | null
  lifestyle: string | null
  purpose: string | null
  onboarding_completed: boolean | null
}

interface AuthQueryResult {
  user: User | null
  profile: UserProfile | null
}

export interface UseAuthValue {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  error: Error | null
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<UseAuthValue | undefined>(undefined)

export function useAuth(): UseAuthValue {
  const supabase = React.useMemo(() => {
    if (typeof window === "undefined") {
      return null
    }

    return createClient()
  }, [])
  const queryClient = useQueryClient()

  const authQuery = useQuery<AuthQueryResult, Error>({
    queryKey: AUTH_QUERY_KEY,
    enabled: !!supabase,
    queryFn: async () => {
      if (!supabase) {
        throw new Error("Supabase client is not available")
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw new Error(userError.message)
      }

      if (!user) {
        return { user: null, profile: null }
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .eq("id", user.id)
        .maybeSingle<UserProfile>()

      if (profileError) {
        throw new Error(profileError.message)
      }

      return {
        user,
        profile,
      }
    },
  })

  const signOutMutation = useMutation<void, Error>({
    mutationFn: async () => {
      if (!supabase) {
        throw new Error("Supabase client is not available")
      }

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth"] })
    },
  })

  const signOut = React.useCallback(async () => {
    await signOutMutation.mutateAsync()
  }, [signOutMutation])

  const error = React.useMemo(() => {
    if (authQuery.error) {
      return authQuery.error
    }

    if (signOutMutation.error) {
      return signOutMutation.error
    }

    return null
  }, [authQuery.error, signOutMutation.error])

  return {
    user: authQuery.data?.user ?? null,
    profile: authQuery.data?.profile ?? null,
    isLoading: authQuery.isLoading || signOutMutation.isPending,
    error,
    signOut,
  }
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = React.useContext(AuthContext)

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider")
  }

  return context
}
