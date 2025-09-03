import React, { useState, useEffect } from 'react'
import { useNotes } from '../contexts/NotesContext'
import ActionItemList from '../components/ActionItemList'
import { CheckCircle, Clock, Filter, Search } from 'lucide-react'

const ActionItemsPage = () => {
  const { actionItems, loadActionItems } = useNotes()
  const [filteredItems, setFilteredItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'pending', 'completed'
  const [sortBy, setSortBy] = useState('dueDate') // 'dueDate', 'meeting', 'owner'

  useEffect(() => {
    // Apply filters and sorting
    let items = [...actionItems]
    
    // Apply status filter
    if (statusFilter !== 'all') {
      items = items.filter(item => {
        if (statusFilter === 'pending') {
          return item.status !== 'completed'
        } else {
          return item.status === 'completed'
        }
      })
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(item => 
        item.description.toLowerCase().includes(query) ||
        (item.owner && item.owner.toLowerCase().includes(query)) ||
        (item.meeting_title && item.meeting_title.toLowerCase().includes(query))
      )
    }
    
    // Apply sorting
    items.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          // Sort by due date (null dates at the end)
          if (!a.due_date && !b.due_date) return 0
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date) - new Date(b.due_date)
        
        case 'meeting':
          // Sort by meeting date
          if (!a.meeting_date && !b.meeting_date) return 0
          if (!a.meeting_date) return 1
          if (!b.meeting_date) return -1
          return new Date(b.meeting_date) - new Date(a.meeting_date)
        
        case 'owner':
          // Sort by owner name
          if (!a.owner && !b.owner) return 0
          if (!a.owner) return 1
          if (!b.owner) return -1
          return a.owner.localeCompare(b.owner)
        
        default:
          return 0
      }
    })
    
    setFilteredItems(items)
  }, [actionItems, searchQuery, statusFilter, sortBy])

  // Stats
  const totalItems = actionItems.length
  const completedItems = actionItems.filter(item => item.status === 'completed').length
  const pendingItems = totalItems - completedItems
  const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Action Items</h1>
        <p className="text-gray-600">Track and manage action items from all your meetings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-effect rounded-xl p-6 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{pendingItems}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{completedItems}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{completionRate}%</p>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search action items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Status:</span>
            </div>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { value: 'all', label: 'All' },
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    statusFilter === filter.value
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="dueDate">Due Date</option>
                <option value="meeting">Meeting Date</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items List */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {filteredItems.length} Action Items
        </h2>
        
        <ActionItemList 
          actionItems={filteredItems} 
          showMeetingInfo={true}
          onUpdate={loadActionItems}
        />
        
        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No action items match your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActionItemsPage

