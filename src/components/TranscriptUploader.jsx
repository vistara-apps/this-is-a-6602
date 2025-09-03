import React, { useState } from 'react'
import { useNotes } from '../contexts/NotesContext'
import { Upload, FileText, X, Loader } from 'lucide-react'
import { generateSummary } from '../config/openai'
import toast from 'react-hot-toast'

const TranscriptUploader = ({ onClose }) => {
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [file, setFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const { createMeeting } = useNotes()

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0]
    if (uploadedFile && uploadedFile.type === 'text/plain') {
      setFile(uploadedFile)
      
      const reader = new FileReader()
      reader.onload = (event) => {
        setTranscript(event.target.result)
      }
      reader.readAsText(uploadedFile)
    } else {
      toast.error('Please upload a text file (.txt)')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim() || !transcript.trim()) {
      toast.error('Please provide both title and transcript')
      return
    }

    setProcessing(true)
    
    try {
      // Process with AI
      const aiAnalysis = await generateSummary(transcript)
      
      // Create meeting record
      const meetingData = {
        title,
        transcript,
        summary: aiAnalysis.summary,
        actionItems: aiAnalysis.actionItems || [],
        meetingDate: new Date().toISOString()
      }

      const { data, error } = await createMeeting(meetingData)
      
      if (error) {
        toast.error('Failed to save meeting')
      } else {
        toast.success('Meeting processed successfully!')
        onClose()
      }
    } catch (error) {
      toast.error('Failed to process transcript')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Upload Meeting Transcript</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meeting Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Q1 Planning Meeting"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transcript
          </label>
          
          <div className="space-y-4">
            {/* File Upload Zone */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Click to upload a text file or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  Supports .txt files up to 10MB
                </p>
              </label>
            </div>

            {file && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">{file.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    setTranscript('')
                  }}
                  className="ml-auto text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Manual Text Input */}
            <div className="text-center text-gray-500">
              <span>or</span>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your meeting transcript here..."
              rows={10}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-y"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={processing || !title.trim() || !transcript.trim()}
            className="flex items-center gap-2 gradient-bg text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Process Transcript'
            )}
          </button>
        </div>
      </form>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• AI will analyze your transcript</li>
          <li>• Generate a concise summary of key points</li>
          <li>• Extract action items with owners and deadlines</li>
          <li>• Identify important decisions made</li>
        </ul>
      </div>
    </div>
  )
}

export default TranscriptUploader