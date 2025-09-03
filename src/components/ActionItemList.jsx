import React, { useState } from 'react'
import { useNotes } from '../contexts/NotesContext'
import { Circle, CheckCircle, Clock, User, Calendar, Edit, Trash2, Save, X } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const ActionItemList = ({ 
  actionItems, 
  meetingId = null, 
  editable = true, 
  showMeetingInfo = false,
  onUpdate = null
}) => {
  const { updateActionItem } = useNotes()
  const [editingItem, setEditingItem] = useState(null)
  const [editForm, setEditForm] = useState({
    description: '',
    owner: '',
    due_date: '',
    status: 'pending'
  })

  const handleStatusToggle = async (item) => {
    if (!editable) return
    
    const newStatus = item.status === 'completed' ? 'pending' : 'completed'
    
    try {
      const { error } = await updateActionItem(item.id, { status: newStatus })
      
      if (error) {
        toast.error('Failed to update status')
      } else if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('An error occurred')
    }
  }

  const startEditing = (item) => {
    setEditingItem(item.id)
    setEditForm({
      description: item.description,
      owner: item.owner || '',
      due_date: item.due_date || '',
      status: item.status || 'pending'
    })
  }

  const cancelEditing = () => {
    setEditingItem(null)
    setEditForm({
      description: '',
      owner: '',
      due_date: '',
      status: 'pending'
    })
  }

  const saveEditing = async (itemId) => {
    if (!editForm.description.trim()) {
      toast.error('Description is required')
      return
    }
    
    try {
      const { error } = await updateActionItem(itemId, {
        description: editForm.description,
        owner: editForm.owner || null,
        due_date: editForm.due_date || null,
        status: editForm.status
      })
      
      if (error) {
        toast.error('Failed to update action item')
      } else {
        toast.success('Action item updated')
        setEditingItem(null)
        
        if (onUpdate) {
          onUpdate()
        }
      }
    } catch (error) {
      console.error('Error updating action item:', error)
      toast.error('An error occurred')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No date set'
    
    try {
      return format(new Date(dateString), 'MMM d, yyyy')
    } catch (error) {
      return dateString
    }
  }

  if (!actionItems || actionItems.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No action items found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {actionItems.map((item) => (
        <div 
          key={item.id} 
          className={`p-3 bg-white rounded-lg border ${
            item.status === 'completed' ? 'border-green-200' : 'border-gray-200'
          }`}
        >
          {editingItem === item.id ? (
            // Edit Mode
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Task description"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner
                  </label>
                  <input
                    type="text"
                    value={editForm.owner}
                    onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Responsible person"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editForm.due_date ? editForm.due_date.substring(0, 10) : ''}
                    onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelEditing}
                  className="flex items-center gap-1 px-3 py-1 text-gray-600 hover:text-gray-800"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                
                <button
                  onClick={() => saveEditing(item.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="flex items-start gap-3">
              <button 
                className={`mt-0.5 ${
                  item.status === 'completed' 
                    ? 'text-green-600' 
                    : 'text-gray-400 hover:text-purple-600'
                } transition-colors`}
                onClick={() => handleStatusToggle(item)}
                disabled={!editable}
              >
                {item.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
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
                
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                  {showMeetingInfo && item.meeting_title && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      From: {item.meeting_title}
                    </span>
                  )}
                  
                  {item.owner && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.owner}
                    </span>
                  )}
                  
                  {item.due_date && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.due_date)}
                    </span>
                  )}
                  
                  {item.status === 'in_progress' && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
              
              {editable && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEditing(item)}
                    className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ActionItemList

