import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNotes } from '../contexts/NotesContext'
import RichTextEditor from '../components/RichTextEditor'
import { Save, ArrowLeft, Trash2, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { enhanceNote } from '../config/openai'

const NotePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notes, createNote, updateNote, deleteNote } = useNotes()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState([])
  const [saving, setSaving] = useState(false)
  const [enhancing, setEnhancing] = useState(false)
  const [isNewNote, setIsNewNote] = useState(!id)

  const existingNote = id ? notes.find(note => note.noteId === id) : null

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title)
      setContent(existingNote.content)
      setTags(existingNote.tags || [])
      setIsNewNote(false)
    }
  }, [existingNote])

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      toast.error('Please add a title or content')
      return
    }

    setSaving(true)
    try {
      const noteData = { title: title || 'Untitled', content, tags }
      
      if (isNewNote) {
        const { data, error } = await createNote(noteData)
        if (error) {
          toast.error('Failed to create note')
        } else {
          toast.success('Note created successfully')
          navigate(`/note/${data.noteId}`)
          setIsNewNote(false)
        }
      } else {
        const { error } = await updateNote(id, noteData)
        if (error) {
          toast.error('Failed to update note')
        } else {
          toast.success('Note saved successfully')
        }
      }
    } catch (error) {
      toast.error('An error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return
    }

    try {
      const { error } = await deleteNote(id)
      if (error) {
        toast.error('Failed to delete note')
      } else {
        toast.success('Note deleted successfully')
        navigate('/')
      }
    } catch (error) {
      toast.error('An error occurred while deleting')
    }
  }

  const handleEnhance = async () => {
    if (!content.trim()) {
      toast.error('Please add some content first')
      return
    }

    setEnhancing(true)
    try {
      const enhancement = await enhanceNote(content)
      toast.success('AI suggestions generated!')
      // You could display the enhancement in a modal or sidebar
      console.log('AI Enhancement:', enhancement)
    } catch (error) {
      toast.error('Failed to generate AI suggestions')
    } finally {
      setEnhancing(false)
    }
  }

  const addTag = (tag) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleEnhance}
            disabled={enhancing || !content.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            {enhancing ? 'Enhancing...' : 'AI Enhance'}
          </button>

          {!isNewNote && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 gradient-bg text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Note Editor */}
      <div className="glass-effect rounded-xl p-6 space-y-6">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder-gray-400 text-gray-800"
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-purple-500 hover:text-purple-700"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Add tag..."
            className="px-3 py-1 bg-gray-100 rounded-full text-sm outline-none border-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addTag(e.target.value)
                e.target.value = ''
              }
            }}
          />
        </div>

        {/* Content Editor */}
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing your note..."
        />
      </div>
    </div>
  )
}

export default NotePage