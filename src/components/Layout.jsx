import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { 
  Home,
  FileText,
  Video,
  Search,
  User,
  LogOut,
  Sparkles,
  CheckSquare,
  CreditCard,
  Settings
} from 'lucide-react'
import toast from 'react-hot-toast'

const Layout = ({ children }) => {
  const { user, userProfile, signOut } = useAuth()
  const { getCurrentPlan } = useSubscription()
  const location = useLocation()
  const currentPlan = getCurrentPlan()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      toast.success('Signed out successfully')
    }
  }

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/note', icon: FileText, label: 'New Note' },
    { path: '/meetings', icon: Video, label: 'Meetings' },
    { path: '/action-items', icon: CheckSquare, label: 'Action Items' },
    { path: '/search', icon: Search, label: 'Search' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 glass-effect shadow-card z-40">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Note Weaver</h1>
              <p className="text-sm text-gray-600">AI-Powered Notes</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path || 
                (item.path === '/note' && location.pathname.startsWith('/note'))
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'gradient-bg text-white shadow-md'
                      : 'text-gray-700 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Subscription Banner */}
          {currentPlan.id === 'free' && (
            <div className="mt-6 p-4 bg-purple-100 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800 mb-2">Upgrade to Pro</h3>
              <p className="text-xs text-purple-700 mb-3">
                Get unlimited meetings, advanced AI features, and more.
              </p>
              <Link
                to="/subscription"
                className="w-full text-center block text-xs gradient-bg text-white py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
              >
                Upgrade Now
              </Link>
            </div>
          )}
        </div>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                {currentPlan.id === 'pro' ? (
                  <>
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    Pro Plan
                  </>
                ) : (
                  <>
                    <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                    Free Plan
                  </>
                )}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Link
              to="/subscription"
              className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-white/50 rounded-lg transition-colors duration-200"
            >
              <CreditCard className="w-4 h-4" />
              <span className="text-sm">Subscription</span>
            </Link>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-white/50 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
