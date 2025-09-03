import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase, handleSupabaseResponse, getMockData, isDevelopment } from '../config/supabase'
import toast from 'react-hot-toast'

const NotesContext = createContext({})

export const useNotes = () => {
  const context = useContext(NotesContext)
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider')
  }
  return context
}

const notesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTES':
      return { ...state, notes: action.payload }
    case 'ADD_NOTE':
      return { ...state, notes: [action.payload, ...state.notes] }
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note =>
          note.id === action.payload.id ? action.payload : note
        )
      }
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload)
      }
    case 'SET_MEETINGS':
      return { ...state, meetings: action.payload }
    case 'ADD_MEETING':
      return { ...state, meetings: [action.payload, ...state.meetings] }
    case 'UPDATE_MEETING':
      return {
        ...state,
        meetings: state.meetings.map(meeting =>
          meeting.id === action.payload.id ? action.payload : meeting
        )
      }
    case 'DELETE_MEETING':
      return {
        ...state,
        meetings: state.meetings.filter(meeting => meeting.id !== action.payload)
      }
    case 'SET_ACTION_ITEMS':
      return { ...state, actionItems: action.payload }
    case 'UPDATE_ACTION_ITEM':
      return {
        ...state,
        actionItems: state.actionItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

export const NotesProvider = ({ children }) => {
  const { user, userProfile, isSubscribed } = useAuth()
  const [state, dispatch] = useReducer(notesReducer, {
    notes: [],
    meetings: [],
    actionItems: [],
    loading: false
  })

  useEffect(() => {
    if (user) {
      loadNotes()
      loadMeetings()
      loadActionItems()
    } else {
      // Clear data when user logs out
      dispatch({ type: 'SET_NOTES', payload: [] })
      dispatch({ type: 'SET_MEETINGS', payload: [] })
      dispatch({ type: 'SET_ACTION_ITEMS', payload: [] })
    }
  }, [user])

  const loadNotes = async () => {
    if (!user) return
    
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // Check if we're using mock data
      const mockData = getMockData()
      if (mockData) {
        dispatch({ type: 'SET_NOTES', payload: mockData.notes })
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      // Get notes from Supabase
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error loading notes:', error)
        toast.error('Failed to load notes')
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      // Transform data to match our application structure
      const formattedNotes = data.map(note => ({
        id: note.id,
        user_id: note.user_id,
        title: note.title,
        content: note.content,
        created_at: note.created_at,
        updated_at: note.updated_at,
        tags: note.tags || []
      }))

      dispatch({ type: 'SET_NOTES', payload: formattedNotes })
    } catch (error) {
      console.error('Error in loadNotes:', error)
      toast.error('An error occurred while loading notes')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const loadMeetings = async () => {
    if (!user) return
    
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // Check if we're using mock data
      const mockData = getMockData()
      if (mockData) {
        dispatch({ type: 'SET_MEETINGS', payload: mockData.meetings })
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      // Get meetings from Supabase
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          action_items:action_items(*)
        `)
        .eq('user_id', user.id)
        .order('meeting_date', { ascending: false })

      if (error) {
        console.error('Error loading meetings:', error)
        toast.error('Failed to load meetings')
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      // Transform data to match our application structure
      const formattedMeetings = data.map(meeting => ({
        id: meeting.id,
        user_id: meeting.user_id,
        title: meeting.title,
        transcript: meeting.transcript,
        summary: meeting.summary,
        meeting_date: meeting.meeting_date,
        created_at: meeting.created_at,
        action_items: meeting.action_items || []
      }))

      dispatch({ type: 'SET_MEETINGS', payload: formattedMeetings })
    } catch (error) {
      console.error('Error in loadMeetings:', error)
      toast.error('An error occurred while loading meetings')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const loadActionItems = async () => {
    if (!user) return
    
    try {
      // Check if we're using mock data
      const mockData = getMockData()
      if (mockData) {
        const allActionItems = mockData.meetings.flatMap(meeting => 
          meeting.action_items.map(item => ({
            ...item,
            meeting_title: meeting.title,
            meeting_date: meeting.meeting_date
          }))
        )
        dispatch({ type: 'SET_ACTION_ITEMS', payload: allActionItems })
        return
      }

      // Get all action items from Supabase
      const { data, error } = await supabase
        .from('action_items')
        .select(`
          *,
          meetings:meetings(id, title, meeting_date)
        `)
        .order('due_date', { ascending: true })

      if (error) {
        console.error('Error loading action items:', error)
        return
      }

      // Transform data to include meeting information
      const formattedActionItems = data.map(item => ({
        id: item.id,
        meeting_id: item.meeting_id,
        description: item.description,
        owner: item.owner,
        due_date: item.due_date,
        status: item.status,
        meeting_title: item.meetings?.title,
        meeting_date: item.meetings?.meeting_date
      }))

      dispatch({ type: 'SET_ACTION_ITEMS', payload: formattedActionItems })
    } catch (error) {
      console.error('Error in loadActionItems:', error)
    }
  }

  const createNote = async (noteData) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      // Check if we're using mock data
      if (isDevelopment() && getMockData()) {
        const newNote = {
          id: Date.now().toString(),
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: [],
          ...noteData
        }
        dispatch({ type: 'ADD_NOTE', payload: newNote })
        return { data: newNote, error: null }
      }

      // Create note in Supabase
      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            user_id: user.id,
            title: noteData.title,
            content: noteData.content,
            tags: noteData.tags || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating note:', error)
        toast.error('Failed to create note')
        return { data: null, error }
      }

      dispatch({ type: 'ADD_NOTE', payload: data })
      return { data, error: null }
    } catch (error) {
      console.error('Error in createNote:', error)
      toast.error('An error occurred while creating the note')
      return { data: null, error }
    }
  }

  const updateNote = async (noteId, updates) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      // Check if we're using mock data
      if (isDevelopment() && getMockData()) {
        const existingNote = state.notes.find(note => note.id === noteId)
        if (!existingNote) return { error: 'Note not found' }

        const updatedNote = {
          ...existingNote,
          ...updates,
          updated_at: new Date().toISOString()
        }
        dispatch({ type: 'UPDATE_NOTE', payload: updatedNote })
        return { data: updatedNote, error: null }
      }

      // Update note in Supabase
      const { data, error } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .eq('user_id', user.id) // Security check
        .select()
        .single()

      if (error) {
        console.error('Error updating note:', error)
        toast.error('Failed to update note')
        return { data: null, error }
      }

      dispatch({ type: 'UPDATE_NOTE', payload: data })
      return { data, error: null }
    } catch (error) {
      console.error('Error in updateNote:', error)
      toast.error('An error occurred while updating the note')
      return { data: null, error }
    }
  }

  const deleteNote = async (noteId) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      // Check if we're using mock data
      if (isDevelopment() && getMockData()) {
        dispatch({ type: 'DELETE_NOTE', payload: noteId })
        return { error: null }
      }

      // Delete note from Supabase
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id) // Security check

      if (error) {
        console.error('Error deleting note:', error)
        toast.error('Failed to delete note')
        return { error }
      }

      dispatch({ type: 'DELETE_NOTE', payload: noteId })
      return { error: null }
    } catch (error) {
      console.error('Error in deleteNote:', error)
      toast.error('An error occurred while deleting the note')
      return { error }
    }
  }

  const createMeeting = async (meetingData) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      // Check if we're using mock data
      if (isDevelopment() && getMockData()) {
        const newMeeting = {
          id: Date.now().toString(),
          user_id: user.id,
          created_at: new Date().toISOString(),
          action_items: meetingData.actionItems || [],
          ...meetingData
        }
        dispatch({ type: 'ADD_MEETING', payload: newMeeting })
        return { data: newMeeting, error: null }
      }

      // Check if user is on free plan and has reached meeting limit
      if (!isSubscribed()) {
        const { count, error: countError } = await supabase
          .from('meetings')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)

        if (!countError && count >= 3) {
          toast.error('Free plan limited to 3 meetings. Please upgrade to Pro.')
          return { data: null, error: { message: 'Meeting limit reached' } }
        }
      }

      // Create meeting in Supabase
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert([
          {
            user_id: user.id,
            title: meetingData.title,
            transcript: meetingData.transcript,
            summary: meetingData.summary,
            meeting_date: meetingData.meetingDate || new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (meetingError) {
        console.error('Error creating meeting:', meetingError)
        toast.error('Failed to create meeting')
        return { data: null, error: meetingError }
      }

      // Create action items if any
      if (meetingData.actionItems && meetingData.actionItems.length > 0) {
        const actionItemsToInsert = meetingData.actionItems.map(item => ({
          meeting_id: meeting.id,
          description: item.description,
          owner: item.owner,
          due_date: item.dueDate,
          status: item.status || 'pending'
        }))

        const { data: actionItems, error: actionItemsError } = await supabase
          .from('action_items')
          .insert(actionItemsToInsert)
          .select()

        if (actionItemsError) {
          console.error('Error creating action items:', actionItemsError)
          // Continue anyway, we have the meeting
        }

        // Add action items to the meeting object
        meeting.action_items = actionItems || []
      } else {
        meeting.action_items = []
      }

      dispatch({ type: 'ADD_MEETING', payload: meeting })
      
      // Refresh action items
      loadActionItems()
      
      return { data: meeting, error: null }
    } catch (error) {
      console.error('Error in createMeeting:', error)
      toast.error('An error occurred while creating the meeting')
      return { data: null, error }
    }
  }

  const updateActionItem = async (actionItemId, updates) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      // Check if we're using mock data
      if (isDevelopment() && getMockData()) {
        const actionItem = state.actionItems.find(item => item.id === actionItemId)
        if (!actionItem) return { error: 'Action item not found' }

        const updatedItem = { ...actionItem, ...updates }
        dispatch({ type: 'UPDATE_ACTION_ITEM', payload: updatedItem })
        return { data: updatedItem, error: null }
      }

      // Update action item in Supabase
      const { data, error } = await supabase
        .from('action_items')
        .update(updates)
        .eq('id', actionItemId)
        .select()
        .single()

      if (error) {
        console.error('Error updating action item:', error)
        toast.error('Failed to update action item')
        return { data: null, error }
      }

      // Add meeting information to the action item
      const meeting = state.meetings.find(m => m.id === data.meeting_id)
      if (meeting) {
        data.meeting_title = meeting.title
        data.meeting_date = meeting.meeting_date
      }

      dispatch({ type: 'UPDATE_ACTION_ITEM', payload: data })
      
      // Also update the action item in the meetings state
      const updatedMeetings = state.meetings.map(meeting => {
        if (meeting.id === data.meeting_id) {
          return {
            ...meeting,
            action_items: meeting.action_items.map(item => 
              item.id === actionItemId ? data : item
            )
          }
        }
        return meeting
      })
      
      dispatch({ type: 'SET_MEETINGS', payload: updatedMeetings })
      
      return { data, error: null }
    } catch (error) {
      console.error('Error in updateActionItem:', error)
      toast.error('An error occurred while updating the action item')
      return { data: null, error }
    }
  }

  const searchNotes = (query) => {
    if (!query.trim()) return state.notes

    return state.notes.filter(note =>
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.content.toLowerCase().includes(query.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
  }

  const searchMeetings = (query) => {
    if (!query.trim()) return state.meetings

    return state.meetings.filter(meeting =>
      meeting.title.toLowerCase().includes(query.toLowerCase()) ||
      meeting.summary.toLowerCase().includes(query.toLowerCase()) ||
      meeting.transcript.toLowerCase().includes(query.toLowerCase()) ||
      meeting.action_items.some(item => 
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        (item.owner && item.owner.toLowerCase().includes(query.toLowerCase()))
      )
    )
  }

  const value = {
    ...state,
    createNote,
    updateNote,
    deleteNote,
    createMeeting,
    updateActionItem,
    searchNotes,
    searchMeetings,
    loadNotes,
    loadMeetings,
    loadActionItems
  }

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  )
}
