import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { ArrowLeft, Check, X, CreditCard, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const SubscriptionPage = () => {
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const { 
    subscriptionPlans, 
    getCurrentPlan, 
    upgradeToPro, 
    downgradeToFree, 
    loading 
  } = useSubscription()
  
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationAction, setConfirmationAction] = useState(null)
  
  const currentPlan = getCurrentPlan()
  const isProPlan = currentPlan.id === 'pro'

  const handleUpgrade = async () => {
    if (isProPlan) {
      toast.error('You are already on the Pro plan')
      return
    }
    
    setConfirmationAction('upgrade')
    setShowConfirmation(true)
  }

  const handleDowngrade = async () => {
    if (!isProPlan) {
      toast.error('You are already on the Free plan')
      return
    }
    
    setConfirmationAction('downgrade')
    setShowConfirmation(true)
  }

  const confirmAction = async () => {
    if (confirmationAction === 'upgrade') {
      await upgradeToPro()
    } else if (confirmationAction === 'downgrade') {
      await downgradeToFree()
    }
    
    setShowConfirmation(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
      </div>

      {/* Subscription Info */}
      <div className="glass-effect rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Subscription</h1>
        <p className="text-gray-600 mb-6">Manage your Note Weaver subscription</p>
        
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 mb-6">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800">Current Plan: {currentPlan.name}</h3>
            <p className="text-gray-600">
              {isProPlan 
                ? 'You have access to all premium features' 
                : 'Upgrade to Pro for unlimited access to all features'}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end">
          {isProPlan ? (
            <button
              onClick={handleDowngrade}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Downgrade to Free
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="flex items-center gap-2 gradient-bg text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upgrade to Pro'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {subscriptionPlans.map((plan) => (
          <div 
            key={plan.id}
            className={`glass-effect rounded-xl p-6 ${
              plan.id === currentPlan.id ? 'ring-2 ring-purple-500' : ''
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
              <div className="text-2xl font-bold text-purple-600">
                ${plan.price}<span className="text-sm text-gray-500">/month</span>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 text-green-500">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            
            {plan.id === currentPlan.id ? (
              <div className="w-full py-2 text-center bg-purple-100 text-purple-700 rounded-lg font-medium">
                Current Plan
              </div>
            ) : plan.id === 'pro' ? (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full gradient-bg text-white py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Upgrade'}
              </button>
            ) : (
              <button
                onClick={handleDowngrade}
                disabled={loading}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Downgrade
              </button>
            )}
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">What's included in the Free plan?</h3>
            <p className="text-gray-600">
              The Free plan includes up to 3 meeting transcripts, basic AI summaries, unlimited notes, and basic search functionality.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">What additional features do I get with Pro?</h3>
            <p className="text-gray-600">
              Pro users get unlimited meeting transcripts, advanced AI summaries, semantic search, AI note enhancement, audio transcript processing, and priority support.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Can I cancel my subscription anytime?</h3>
            <p className="text-gray-600">
              Yes, you can downgrade to the Free plan at any time. Your Pro features will remain active until the end of your current billing period.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Is there a team or enterprise plan?</h3>
            <p className="text-gray-600">
              Not yet, but we're working on it! Contact us at support@noteweaver.com for enterprise inquiries.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {confirmationAction === 'upgrade' 
                ? 'Upgrade to Pro Plan' 
                : 'Downgrade to Free Plan'}
            </h3>
            
            <p className="text-gray-600 mb-6">
              {confirmationAction === 'upgrade'
                ? 'You will be charged $10/month for the Pro plan. Are you sure you want to proceed?'
                : 'You will lose access to Pro features at the end of your current billing period. Are you sure you want to downgrade?'}
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={confirmAction}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  confirmationAction === 'upgrade'
                    ? 'gradient-bg text-white hover:shadow-lg'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                } disabled:opacity-50`}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : confirmationAction === 'upgrade' ? (
                  'Confirm Upgrade'
                ) : (
                  'Confirm Downgrade'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubscriptionPage

