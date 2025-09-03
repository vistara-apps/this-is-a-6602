import React, { useState } from 'react'
import { useNotes } from '../contexts/NotesContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import TranscriptUploader from '../components/TranscriptUploader'
import AudioUploader from '../components/AudioUploader'
import ActionItemList from '../components/ActionItemList'
import { Video, Clock, Mic, FileText, Plus, ChevronDown, ChevronUp, User, Calendar } from 'lucide-react'
import { format } from 'date-fns'

const MeetingsPage = () => {
  const { meetings, loadActionItems } = useNotes()
  const { hasFeature } = useSubscription()
  const [showUploader, setShowUploader] = useState(false)
  const [uploaderType, setUploaderType] = useState('text') // 'text' or 'audio'
  const [expandedMeeting, setExpandedMeeting] = useState(null)
  
  const canUseAudioFeature = hasFeature('audioTranscription')
  const hasReachedLimit = hasFeature('unlimitedMeetings') ? false : meetings.length >= 3

  const handleOpenUploader = (type) => {
    setUploaderType(type)
    setShowUploader(true)
  }

  const handleAudioTranscript = (transcript) => {
    // This will be passed to the TranscriptUploader component
    setUploaderType('text')
    setShowUploader(true)
  }

  const toggleMeetingExpand = (meetingId) => {
    if (expandedMeeting === meetingId) {
      setExpandedMeeting(null)
    } else {
      setExpandedMeeting(meetingId)
    }
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy')
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Meetings</h1>
          <p className="text-gray-600 mt-1">Upload transcripts and get AI-powered summaries</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {canUseAudioFeature && (
            <button
              onClick={() => handleOpenUploader('audio')}
              className="flex items-center justify-center gap-2 bg-purple-100 text-purple-700 px-6 py-3 rounded-lg font-medium hover:bg-purple-200 transition-colors"
              disabled={hasReachedLimit}
            >
              <Mic className="w-5 h-5" />
              Record Audio
            </button>
          )}
          
          <button
            onClick={() => handleOpenUploader('text')}
            className="flex items-center justify-center gap-2 gradient-bg text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
            disabled={hasReachedLimit}
          >
            <FileText className="w-5 h-5" />
            Upload Transcript
          </button>
        </div>
      </div>

      {/* Meeting Limit Warning */}
      {hasReachedLimit && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Plus className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-amber-800 mb-1">Meeting Limit Reached</h3>
              <p className="text-amber-700 mb-3">
                Free accounts are limited to 3 meetings. Upgrade to Pro for unlimited meetings and advanced AI features.
              </p>
              <a
                href="/subscription"
                className="inline-block gradient-bg text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
              >
                Upgrade to Pro
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {uploaderType === 'text' ? (
              <TranscriptUploader onClose={() => setShowUploader(false)} />
            ) : (
              <AudioUploader 
                onTranscriptGenerated={handleAudioTranscript} 
                onClose={() => setShowUploader(false)} 
              />
            )}
          </div>
        </div>
      )}

      {/* Meetings List */}
      <div className="space-y-6">
        {meetings.length > 0 ? (
          meetings.map((meeting) => {
            const isExpanded = expandedMeeting === meeting.id
            
            return (
              <div key={meeting.id} className="glass-effect rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-800">{meeting.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(meeting.meeting_date)}
                        </span>
                        <button
                          onClick={() => toggleMeetingExpand(meeting.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Summary</h4>
                      <p className="text-gray-600 leading-relaxed">{meeting.summary}</p>
                    </div>

                    {/* Action Items */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">
                        Action Items ({meeting.action_items?.length || 0})
                      </h4>
                      <ActionItemList 
                        actionItems={meeting.action_items || []} 
                        meetingId={meeting.id}
                        onUpdate={loadActionItems}
                      />
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-3">Transcript</h4>
                        <div className="bg-white p-4 rounded-lg max-h-60 overflow-y-auto">
                          <p className="text-gray-600 whitespace-pre-line">{meeting.transcript}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 glass-effect rounded-xl">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No meetings yet</h3>
            <p className="text-gray-500 mb-6">Upload your first meeting transcript to get started</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {canUseAudioFeature && (
                <button
                  onClick={() => handleOpenUploader('audio')}
                  className="flex items-center justify-center gap-2 bg-purple-100 text-purple-700 px-6 py-3 rounded-lg font-medium hover:bg-purple-200 transition-colors"
                >
                  <Mic className="w-5 h-5" />
                  Record Audio
                </button>
              )}
              
              <button
                onClick={() => handleOpenUploader('text')}
                className="flex items-center justify-center gap-2 gradient-bg text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
              >
                <FileText className="w-5 h-5" />
                Upload Transcript
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MeetingsPage
