import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'

// For demo purposes, using a mock client
export const supabase = {
  auth: {
    signUp: async (credentials) => {
      // Mock implementation
      return { data: { user: { id: '1', email: credentials.email } }, error: null }
    },
    signInWithPassword: async (credentials) => {
      // Mock implementation
      return { data: { user: { id: '1', email: credentials.email } }, error: null }
    },
    signOut: async () => {
      return { error: null }
    },
    getSession: async () => {
      return { data: { session: null }, error: null }
    },
    onAuthStateChange: (callback) => {
      // Mock implementation
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
  },
  from: (table) => ({
    select: () => ({
      eq: () => ({
        order: () => Promise.resolve({ data: [], error: null })
      })
    }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => ({
      eq: () => Promise.resolve({ data: [], error: null })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ data: [], error: null })
    })
  })
}