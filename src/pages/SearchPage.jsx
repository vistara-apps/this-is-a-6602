import React, { useState, useMemo, useEffect } from 'react'
import { useNotes } from '../contexts/NotesContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { Link } from 'react-router-dom'
import { Search, FileText, Tag, Clock, Filter, Sparkles, Loader } from 'lucide-react'
import { format } from 'date-fns'
import { semanticSearch } from '../config/openai'
import toast from 'react-hot-toast'

const SearchPage = () => {
  const { notes, meetings, searchNotes, searchMeetings } = useNotes()
  const { hasFeature } = useSubscription()
  const [query, setQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'notes', 'meetings'
  const [sortBy, setSortBy] = useState('updated') // 'updated', 'created', 'title', 'relevance'
  const [isSearching, setIsSearching] = useState(false)
  const [semanticResults, setSemanticResults] = useState(null)
  const [useSemanticSearch, setUseSemanticSearch] = useState(false)
  
  const canUseSemanticSearch = hasFeature('semanticSearch')

  // Handle semantic search
  useEffect(() => {
    const performSemanticSearch = async () => {
      if (!query.trim() || !useSemanticSearch) {
        setSemanticResults(null)
        return
      }
      
      setIsSearching(true)
      
      try {
        // Perform semantic search on notes
        const noteResults = await semanticSearch(notes, query, canUseSemanticSearch)
        
        if (noteResults.error) {
          toast.error(noteResults.error)
          setUseSemanticSearch(false)
          setIsSearching(false)
          return
        }
        
        // For meetings, we'll use the regular search for now
        const meetingResults = searchMeetings(query)
        
        setSemanticResults({
          notes: noteResults,
          meetings: meetingResults
        })
      } catch (error) {
        console.error('Semantic search error:', error)
        toast.error('Semantic search failed. Falling back to regular search.')
        setUseSemanticSearch(false)
      } finally {
        setIsSearching(false)
      }
    }
    
    performSemanticSearch()
  }, [query, useSemanticSearch, notes, canUseSemanticSearch])

  const searchResults = useMemo(() => {
    if (useSemanticSearch && semanticResults) {
      return semanticResults
    }
    
    if (!query.trim()) {
      return { notes: [], meetings: [] }
    }

    return {
      notes: searchNotes(query),
      meetings: searchMeetings(query)
    }
  }, [query, searchNotes, searchMeetings, useSemanticSearch, semanticResults])

  const allResults = useMemo(() => {
    let results = []

    if (filterType === 'all' || filterType === 'notes') {
      results.push(...searchResults.notes.map(note => ({ ...note, type: 'note' })))
    }

    if (filterType === 'all' || filterType === 'meetings') {
      results.push(...searchResults.meetings.map(meeting => ({ ...meeting, type: 'meeting' })))
    }

    // Sort results
    results.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'created':
          return new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
        case 'relevance':
          // For semantic search, results are already sorted by relevance
          if (useSemanticSearch) {
            return 0
          }
          // Fall through to updated for regular search
        case 'updated':
        default:
          const aDate = a.type === 'note' 
            ? (a.updated_at || a.updatedAt) 
            : (a.meeting_date || a.meetingDate)
          const bDate = b.type === 'note' 
            ? (b.updated_at || b.updatedAt) 
            : (b.meeting_date || b.meetingDate)
          return new Date(bDate) - new Date(aDate)
      }
    })

    return results
  }, [searchResults, filterType, sortBy, useSemanticSearch])

  const highlightText = (text, query) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Search</h1>
        <p className="text-gray-600">Find specific information within your notes and meetings</p>
      </div>

      {/* Search Bar */}
      <div className="glass-effect rounded-xl p-6">
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, meetings, and action items..."
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg"
          />
          
          {canUseSemanticSearch && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <button
                onClick={() => setUseSemanticSearch(!useSemanticSearch)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                  useSemanticSearch
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {useSemanticSearch ? 'AI Search On' : 'AI Search'}
              </button>
            </div>
          )}
        </div>

        {/* Semantic Search Info */}
        {useSemanticSearch && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm text-purple-800 font-medium">AI-Powered Semantic Search</p>
                <p className="text-xs text-purple-700">
                  Finding results based on meaning, not just keywords. This may take a moment for complex queries.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { value: 'all', label: 'All' },
                { value: 'notes', label: 'Notes' },
                { value: 'meetings', label: 'Meetings' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterType(filter.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    filterType === filter.value
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {useSemanticSearch && <option value="relevance">Relevance</option>}
              <option value="updated">Last Updated</option>
              <option value="created">Date Created</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
        
        {/* Pro Feature Banner */}
        {!canUseSemanticSearch && query.trim().length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium">Upgrade to Pro for AI-Powered Search</p>
                <p className="text-xs text-amber-700 mb-2">
                  Find what you're looking for faster with semantic search that understands context and meaning.
                </p>
                <a
                  href="/subscription"
                  className="inline-block text-xs gradient-bg text-white px-3 py-1 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
                >
                  Upgrade to Pro
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {query.trim() ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Search Results ({allResults.length})
              </h2>
            </div>

            {allResults.length > 0 ? (
              <div className="space-y-4">
                {allResults.map((result) => (
                  <div key={`${result.type}-${result.id || result.noteId || result.meetingId}`}>
                    {result.type === 'note' ? (
                      <Link
                        to={`/note/${result.id || result.noteId}`}
                        className="block glass-effect rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-800 mb-2">
                              {highlightText(result.title, query)}
                              {useSemanticSearch && (
                                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                  AI Match
                                </span>
                              )}
                            </h3>
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {highlightText(result.content.substring(0, 200) + '...', query)}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(result.updated_at || result.updatedAt), 'MMM d, yyyy')}
                              </span>
                              {(result.tags || []).length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  <div className="flex gap-1">
                                    {(result.tags || []).slice(0, 3).map((tag, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs"
                                      >
                                        {highlightText(tag, query)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="glass-effect rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-800 mb-2">
                              {highlightText(result.title, query)}
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                Meeting
                              </span>
                            </h3>
                            <p className="text-gray-600 mb-3">
                              {highlightText(result.summary, query)}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(result.meeting_date || result.meetingDate), 'MMM d, yyyy')}
                              </span>
                              <span>{(result.action_items || result.actionItems || []).length} action items</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 glass-effect rounded-xl">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">No results found</h3>
                <p className="text-gray-500">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 glass-effect rounded-xl">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">Start searching</h3>
            <p className="text-gray-500">
              Enter keywords to search through your notes and meetings
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage
