import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import NotePage from './pages/NotePage'
import MeetingsPage from './pages/MeetingsPage'
import SearchPage from './pages/SearchPage'
import ActionItemsPage from './pages/ActionItemsPage'
import SubscriptionPage from './pages/SubscriptionPage'
import { Toaster } from 'react-hot-toast'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <AuthPage />
        <Toaster position="top-right" />
      </>
    )
  }

  return (
    <SubscriptionProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/note/:id" element={<NotePage />} />
          <Route path="/note" element={<NotePage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/action-items" element={<ActionItemsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 14px hsla(220, 15%, 70%, 0.2)',
          },
        }}
      />
    </SubscriptionProvider>
  )
}

export default App
