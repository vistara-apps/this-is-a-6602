import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase, handleSupabaseResponse, getMockData, isDevelopment } from '../config/supabase'
import toast from 'react-hot-toast'

const SubscriptionContext = createContext({})

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

export const SubscriptionProvider = ({ children }) => {
  const { user, userProfile, updateUserProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [subscriptionPlans, setSubscriptionPlans] = useState([
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: [
        'Up to 3 meeting transcripts',
        'Basic AI summaries',
        'Unlimited notes',
        'Basic search'
      ],
      limits: {
        meetings: 3,
        aiSummaryLength: 500,
        aiEnhance: false
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 10,
      features: [
        'Unlimited meeting transcripts',
        'Advanced AI summaries',
        'Unlimited notes',
        'Semantic search',
        'AI note enhancement',
        'Audio transcript processing',
        'Priority support'
      ],
      limits: {
        meetings: Infinity,
        aiSummaryLength: 2000,
        aiEnhance: true
      }
    }
  ])

  // Get the current subscription plan
  const getCurrentPlan = () => {
    const tier = userProfile?.subscription_tier || 'free'
    return subscriptionPlans.find(plan => plan.id === tier) || subscriptionPlans[0]
  }

  // Check if a feature is available in the current plan
  const hasFeature = (featureName) => {
    const currentPlan = getCurrentPlan()
    
    switch (featureName) {
      case 'aiEnhance':
        return currentPlan.limits.aiEnhance
      case 'unlimitedMeetings':
        return currentPlan.limits.meetings === Infinity
      case 'semanticSearch':
        return currentPlan.id === 'pro'
      case 'audioTranscription':
        return currentPlan.id === 'pro'
      default:
        return false
    }
  }

  // Check if user has reached their meeting limit
  const hasReachedMeetingLimit = async () => {
    if (!user) return true
    
    // Pro users have unlimited meetings
    if (userProfile?.subscription_tier === 'pro') return false
    
    try {
      // Check if we're using mock data
      if (isDevelopment() && getMockData()) {
        const mockData = getMockData()
        return mockData.meetings.length >= 3
      }

      // Count meetings in Supabase
      const { count, error } = await supabase
        .from('meetings')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error checking meeting limit:', error)
        return true
      }

      const currentPlan = getCurrentPlan()
      return count >= currentPlan.limits.meetings
    } catch (error) {
      console.error('Error in hasReachedMeetingLimit:', error)
      return true
    }
  }

  // Upgrade to Pro plan
  const upgradeToPro = async () => {
    if (!user) return { error: 'User not authenticated' }
    
    setLoading(true)
    
    try {
      // In a real app, this would integrate with a payment processor like Stripe
      // For now, we'll just update the user's subscription tier
      
      // Check if we're using mock data
      if (isDevelopment() && getMockData()) {
        const result = await updateUserProfile({ subscription_tier: 'pro' })
        setLoading(false)
        
        if (result.error) {
          toast.error('Failed to upgrade subscription')
          return { error: result.error }
        }
        
        toast.success('Successfully upgraded to Pro plan!')
        return { data: { subscription_tier: 'pro' }, error: null }
      }

      // Update subscription in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update({ subscription_tier: 'pro' })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error upgrading subscription:', error)
        toast.error('Failed to upgrade subscription')
        setLoading(false)
        return { data: null, error }
      }

      // Update user profile in context
      await updateUserProfile({ subscription_tier: 'pro' })
      
      toast.success('Successfully upgraded to Pro plan!')
      setLoading(false)
      return { data, error: null }
    } catch (error) {
      console.error('Error in upgradeToPro:', error)
      toast.error('An error occurred while upgrading')
      setLoading(false)
      return { data: null, error }
    }
  }

  // Downgrade to Free plan
  const downgradeToFree = async () => {
    if (!user) return { error: 'User not authenticated' }
    
    setLoading(true)
    
    try {
      // Check if we're using mock data
      if (isDevelopment() && getMockData()) {
        const result = await updateUserProfile({ subscription_tier: 'free' })
        setLoading(false)
        
        if (result.error) {
          toast.error('Failed to downgrade subscription')
          return { error: result.error }
        }
        
        toast.success('Successfully downgraded to Free plan')
        return { data: { subscription_tier: 'free' }, error: null }
      }

      // Update subscription in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update({ subscription_tier: 'free' })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error downgrading subscription:', error)
        toast.error('Failed to downgrade subscription')
        setLoading(false)
        return { data: null, error }
      }

      // Update user profile in context
      await updateUserProfile({ subscription_tier: 'free' })
      
      toast.success('Successfully downgraded to Free plan')
      setLoading(false)
      return { data, error: null }
    } catch (error) {
      console.error('Error in downgradeToFree:', error)
      toast.error('An error occurred while downgrading')
      setLoading(false)
      return { data: null, error }
    }
  }

  const value = {
    loading,
    subscriptionPlans,
    getCurrentPlan,
    hasFeature,
    hasReachedMeetingLimit,
    upgradeToPro,
    downgradeToFree
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

