import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, handleSupabaseResponse, getMockData, isDevelopment } from '../config/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile data from the profiles table
  const fetchUserProfile = async (userId) => {
    if (!userId) return null

    try {
      // Check if we're using mock data
      const mockData = getMockData()
      if (mockData) {
        return mockData.user
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
      return null
    }
  }

  // Create a user profile if it doesn't exist
  const createUserProfile = async (userId, email) => {
    if (!userId) return null

    try {
      // Check if we're using mock data
      if (isDevelopment() && getMockData()) {
        return getMockData().user
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (existingProfile) return existingProfile

      // Create new profile
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: userId,
            email: email,
            subscription_tier: 'free',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createUserProfile:', error)
      return null
    }
  }

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        // Check if we're using mock data
        const mockData = getMockData()
        if (mockData) {
          setUser(mockData.user)
          setUserProfile(mockData.user)
          setLoading(false)
          return
        }

        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        const session = data?.session
        if (session) {
          setUser(session.user)
          
          // Fetch user profile
          const profile = await fetchUserProfile(session.user.id)
          if (profile) {
            setUserProfile(profile)
          } else {
            // Create profile if it doesn't exist
            const newProfile = await createUserProfile(session.user.id, session.user.email)
            setUserProfile(newProfile)
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error in initializeAuth:', error)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user)
          
          // Fetch or create user profile
          const profile = await fetchUserProfile(session.user.id)
          if (profile) {
            setUserProfile(profile)
          } else {
            const newProfile = await createUserProfile(session.user.id, session.user.email)
            setUserProfile(newProfile)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setUserProfile(null)
        } else if (event === 'USER_UPDATED' && session) {
          setUser(session.user)
          
          // Refresh profile
          const profile = await fetchUserProfile(session.user.id)
          if (profile) {
            setUserProfile(profile)
          }
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password) => {
    try {
      // Check if we're using mock data
      if (isDevelopment() && getMockData()) {
        const mockUser = getMockData().user
        setUser(mockUser)
        setUserProfile(mockUser)
        return { data: { user: mockUser }, error: null }
      }

      const response = await supabase.auth.signUp({
        email,
        password,
      })

      const { data, error } = handleSupabaseResponse(response)
      
      if (error) {
        toast.error(error.message || 'Failed to sign up')
        return { data: null, error }
      }

      // Create user profile
      if (data?.user) {
        await createUserProfile(data.user.id, data.user.email)
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in signUp:', error)
      toast.error('An unexpected error occurred during sign up')
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      // Check if we're using mock data
      if (isDevelopment() && getMockData()) {
        const mockUser = getMockData().user
        setUser(mockUser)
        setUserProfile(mockUser)
        return { data: { user: mockUser }, error: null }
      }

      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      const { data, error } = handleSupabaseResponse(response)
      
      if (error) {
        toast.error(error.message || 'Failed to sign in')
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in signIn:', error)
      toast.error('An unexpected error occurred during sign in')
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      // Check if we're using mock data
      if (isDevelopment() && getMockData()) {
        setUser(null)
        setUserProfile(null)
        return { error: null }
      }

      const response = await supabase.auth.signOut()
      const { error } = handleSupabaseResponse(response)
      
      if (error) {
        toast.error(error.message || 'Failed to sign out')
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Error in signOut:', error)
      toast.error('An unexpected error occurred during sign out')
      return { error }
    }
  }

  const updateUserProfile = async (updates) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      // Check if we're using mock data
      if (isDevelopment() && getMockData()) {
        const updatedProfile = { ...userProfile, ...updates }
        setUserProfile(updatedProfile)
        return { data: updatedProfile, error: null }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        toast.error('Failed to update profile')
        return { data: null, error }
      }

      setUserProfile(data)
      return { data, error: null }
    } catch (error) {
      console.error('Error in updateUserProfile:', error)
      toast.error('An unexpected error occurred')
      return { data: null, error }
    }
  }

  const isSubscribed = () => {
    return userProfile?.subscription_tier === 'pro'
  }

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    isSubscribed,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
