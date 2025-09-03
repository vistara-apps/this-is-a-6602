import React, { useState } from 'react'
import { useNotes } from '../contexts/NotesContext'
import TranscriptUploader from '../components/TranscriptUploader'
import { Video, Clock, CheckCircle, Circle, User } from 'lucide-react'
import { format } from 'date-fns'

const MeetingsPage = () => {
  const { meetings } = useNotes()
  const [showUploader, setShowUploader] = useState(false)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Meetings</h1>
          <p className="text-gray-600 mt-1">Upload transcripts and get AI-powered summaries</p>
        </div>
        <button
          onClick={() => setShowUploader(true)}
          className="gradient-bg text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg card-hover"
        >
          Upload Transcript
        </button>
      </div>

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-xl p-6 w-full max-w-2xl">
            <TranscriptUploader onClose={() => setShowUploader(false)} />
          </div>
        </div>
      )}

      {/* Meetings List */}
      <div className="space-y-6">
        {meetings.length > 0 ? (
          meetings.map((meeting) => (
            <div key={meeting.meetingId} className="glass-effect rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-800">{meeting.title}</h3>
                    <span className="text-sm text-gray-500">
                      {format(new Date(meeting.meetingDate), 'MMM d, yyyy')}
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Summary</h4>
                    <p className="text-gray-600 leading-relaxed">{meeting.summary}</p>
                  </div>

                  {/* Action Items */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">
                      Action Items ({meeting.actionItems.length})
                    </h4>
                    <div className="space-y-2">
                      {meeting.actionItems.map((item) => (
                        <div key={item.actionItemId} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                          <button className="mt-0.5 text-gray-400 hover:text-purple-600 transition-colors">
                            {item.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-gray-800 ${
                              item.status === 'completed' ? 'line-through text-gray-500' : ''
                            }`}>
                              {item.description}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              {item.owner && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {item.owner}
                                </span>
                              )}
                              {item.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {item.dueDate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 glass-effect rounded-xl">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No meetings yet</h3>
            <p className="text-gray-500 mb-6">Upload your first meeting transcript to get started</p>
            <button
              onClick={() => setShowUploader(true)}
              className="gradient-bg text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
            >
              Upload Transcript
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MeetingsPage