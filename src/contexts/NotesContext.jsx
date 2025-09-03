import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../config/supabase'

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
          note.noteId === action.payload.noteId ? action.payload : note
        )
      }
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.noteId !== action.payload)
      }
    case 'SET_MEETINGS':
      return { ...state, meetings: action.payload }
    case 'ADD_MEETING':
      return { ...state, meetings: [action.payload, ...state.meetings] }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

export const NotesProvider = ({ children }) => {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(notesReducer, {
    notes: [],
    meetings: [],
    loading: false
  })

  useEffect(() => {
    if (user) {
      loadNotes()
      loadMeetings()
    }
  }, [user])

  const loadNotes = async () => {
    if (!user) return
    
    dispatch({ type: 'SET_LOADING', payload: true })
    
    // Mock data for demo
    const mockNotes = [
      {
        noteId: '1',
        userId: user.id,
        title: 'Project Planning Ideas',
        content: 'Initial thoughts on the new project structure and timeline.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['project', 'planning']
      },
      {
        noteId: '2',
        userId: user.id,
        title: 'Meeting Notes - Team Sync',
        content: 'Discussed quarterly goals and upcoming deadlines.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        tags: ['meeting', 'team']
      }
    ]
    
    dispatch({ type: 'SET_NOTES', payload: mockNotes })
    dispatch({ type: 'SET_LOADING', payload: false })
  }

  const loadMeetings = async () => {
    if (!user) return
    
    // Mock data for demo
    const mockMeetings = [
      {
        meetingId: '1',
        userId: user.id,
        title: 'Q1 Planning Meeting',
        transcript: 'We discussed the upcoming quarter goals...',
        summary: 'Team aligned on Q1 objectives and key milestones.',
        actionItems: [
          {
            actionItemId: '1',
            meetingId: '1',
            description: 'Prepare Q1 roadmap',
            owner: 'John Doe',
            dueDate: '2024-01-15',
            status: 'pending'
          }
        ],
        meetingDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ]
    
    dispatch({ type: 'SET_MEETINGS', payload: mockMeetings })
  }

  const createNote = async (noteData) => {
    if (!user) return { error: 'User not authenticated' }

    const newNote = {
      noteId: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      ...noteData
    }

    dispatch({ type: 'ADD_NOTE', payload: newNote })
    return { data: newNote, error: null }
  }

  const updateNote = async (noteId, updates) => {
    if (!user) return { error: 'User not authenticated' }

    const existingNote = state.notes.find(note => note.noteId === noteId)
    if (!existingNote) return { error: 'Note not found' }

    const updatedNote = {
      ...existingNote,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    dispatch({ type: 'UPDATE_NOTE', payload: updatedNote })
    return { data: updatedNote, error: null }
  }

  const deleteNote = async (noteId) => {
    if (!user) return { error: 'User not authenticated' }

    dispatch({ type: 'DELETE_NOTE', payload: noteId })
    return { error: null }
  }

  const createMeeting = async (meetingData) => {
    if (!user) return { error: 'User not authenticated' }

    const newMeeting = {
      meetingId: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      actionItems: [],
      ...meetingData
    }

    dispatch({ type: 'ADD_MEETING', payload: newMeeting })
    return { data: newMeeting, error: null }
  }

  const searchNotes = (query) => {
    if (!query.trim()) return state.notes

    return state.notes.filter(note =>
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.content.toLowerCase().includes(query.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
  }

  const value = {
    ...state,
    createNote,
    updateNote,
    deleteNote,
    createMeeting,
    searchNotes,
    loadNotes,
    loadMeetings
  }

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  )
}