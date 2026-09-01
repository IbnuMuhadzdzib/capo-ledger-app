import { create } from 'zustand'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  isInitialized: boolean
  setSession: (session: Session | null) => void
  initialize: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isInitialized: false,

  setSession: (session) => set({ session, user: session?.user ?? null }),

  initialize: async () => {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null, isInitialized: true })

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null })
  }
}))
