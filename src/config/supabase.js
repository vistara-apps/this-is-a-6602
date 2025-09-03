import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Database schema:
// users: managed by Supabase Auth
// profiles: id, user_id, subscription_tier, created_at
// notes: id, user_id, title, content, created_at, updated_at, tags
// meetings: id, user_id, title, transcript, summary, meeting_date, created_at
// action_items: id, meeting_id, description, owner, due_date, status

/**
 * Helper function to handle Supabase errors consistently
 * @param {Object} response - Supabase response object with data and error properties
 * @returns {Object} - Normalized response with data and error properties
 */
export const handleSupabaseResponse = (response) => {
  if (response.error) {
    console.error('Supabase error:', response.error)
    return { data: null, error: response.error }
  }
  return { data: response.data, error: null }
}

/**
 * Check if the current environment is in development mode
 * @returns {boolean} - True if in development mode
 */
export const isDevelopment = () => {
  return import.meta.env.DEV || !supabaseUrl.includes('your-project')
}

/**
 * Get mock data for development when Supabase is not configured
 * @returns {Object} - Mock data for development
 */
export const getMockData = () => {
  // Only use mock data in development when Supabase is not configured
  if (isDevelopment() && supabaseUrl === 'https://your-project.supabase.co') {
    console.warn('Using mock data - Supabase not configured')
    return {
      notes: [
        {
          id: '1',
          user_id: '1',
          title: 'Project Planning Ideas',
          content: 'Initial thoughts on the new project structure and timeline.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: ['project', 'planning']
        },
        {
          id: '2',
          user_id: '1',
          title: 'Meeting Notes - Team Sync',
          content: 'Discussed quarterly goals and upcoming deadlines.',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          tags: ['meeting', 'team']
        }
      ],
      meetings: [
        {
          id: '1',
          user_id: '1',
          title: 'Q1 Planning Meeting',
          transcript: 'We discussed the upcoming quarter goals...',
          summary: 'Team aligned on Q1 objectives and key milestones.',
          action_items: [
            {
              id: '1',
              meeting_id: '1',
              description: 'Prepare Q1 roadmap',
              owner: 'John Doe',
              due_date: '2024-01-15',
              status: 'pending'
            }
          ],
          meeting_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ],
      user: {
        id: '1',
        email: 'demo@example.com',
        subscription_tier: 'free'
      }
    }
  }
  return null
}
