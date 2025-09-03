import React from 'react'
import { Link } from 'react-router-dom'
import { useNotes } from '../contexts/NotesContext'
import { Plus, FileText, Clock, Tag, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

const Dashboard = () => {
  const { notes, meetings, loading } = useNotes()

  const recentNotes = notes.slice(0, 5)
  const recentMeetings = meetings.slice(0, 3)

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-white/50 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome back!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your notes today.</p>
        </div>
        <Link
          to="/note"
          className="flex items-center gap-2 gradient-bg text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg card-hover"
        >
          <Plus className="w-5 h-5" />
          New Note
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-effect rounded-xl p-6 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{notes.length}</p>
              <p className="text-sm text-gray-600">Total Notes</p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{meetings.length}</p>
              <p className="text-sm text-gray-600">Meetings</p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {notes.reduce((acc, note) => acc + note.tags.length, 0)}
              </p>
              <p className="text-sm text-gray-600">Tags Used</p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {meetings.reduce((acc, meeting) => acc + meeting.actionItems.length, 0)}
              </p>
              <p className="text-sm text-gray-600">Action Items</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Notes */}
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Recent Notes</h2>
            <Link
              to="/search"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentNotes.length > 0 ? (
              recentNotes.map((note) => (
                <Link
                  key={note.noteId}
                  to={`/note/${note.noteId}`}
                  className="block p-4 bg-white rounded-lg hover:shadow-md transition-all duration-200 border border-gray-100"
                >
                  <h3 className="font-medium text-gray-800 mb-1">{note.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {note.content.substring(0, 100)}...
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{format(new Date(note.updatedAt), 'MMM d, yyyy')}</span>
                    {note.tags.length > 0 && (
                      <div className="flex gap-1">
                        {note.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No notes yet. Create your first note!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Meetings */}
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Recent Meetings</h2>
            <Link
              to="/meetings"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentMeetings.length > 0 ? (
              recentMeetings.map((meeting) => (
                <div
                  key={meeting.meetingId}
                  className="p-4 bg-white rounded-lg border border-gray-100"
                >
                  <h3 className="font-medium text-gray-800 mb-1">{meeting.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {meeting.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{format(new Date(meeting.meetingDate), 'MMM d, yyyy')}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                      {meeting.actionItems.length} action items
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No meetings yet. Upload your first transcript!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard