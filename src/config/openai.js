import OpenAI from 'openai'
import { useSubscription } from '../contexts/SubscriptionContext'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
  baseURL: import.meta.env.VITE_OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
})

// Cache for API responses to reduce API calls
const apiCache = new Map()

/**
 * Generate a summary from a meeting transcript
 * @param {string} transcript - The meeting transcript
 * @param {boolean} isPro - Whether the user has a pro subscription
 * @returns {Object} - The summary, key points, decisions, and action items
 */
export const generateSummary = async (transcript, isPro = false) => {
  // Check cache first
  const cacheKey = `summary-${transcript.substring(0, 100)}`
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey)
  }

  try {
    // Determine model and max tokens based on subscription tier
    const model = isPro ? 'anthropic/claude-3-opus-20240229' : 'google/gemini-2.0-flash-001'
    const maxTokens = isPro ? 2000 : 1000

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: `You are an expert meeting assistant. Analyze the following transcript and provide:
1. A concise summary of key discussion points
2. Important decisions made
3. A list of action items with owners and deadlines (if mentioned)

Format your response as JSON:
{
  "summary": "Your summary here",
  "keyPoints": ["point 1", "point 2"],
  "decisions": ["decision 1", "decision 2"],
  "actionItems": [
    {
      "description": "Task description",
      "owner": "Person responsible",
      "dueDate": "Due date if mentioned",
      "status": "pending"
    }
  ]
}`
        },
        {
          role: 'user',
          content: transcript
        }
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
      response_format: { type: "json_object" }
    })

    const result = JSON.parse(response.choices[0].message.content)
    
    // Cache the result
    apiCache.set(cacheKey, result)
    
    return result
  } catch (error) {
    console.error('OpenAI API Error:', error)
    
    // Return mock data for demo or when API fails
    const mockData = {
      summary: "This is a demo summary of your meeting transcript. The AI service would normally process your actual content here.",
      keyPoints: [
        "Demo key point 1: Project timeline discussed",
        "Demo key point 2: Budget allocation reviewed",
        "Demo key point 3: Team assignments finalized"
      ],
      decisions: [
        "Demo decision: Approved Q1 budget increase",
        "Demo decision: Selected new project manager"
      ],
      actionItems: [
        {
          description: "Prepare quarterly report",
          owner: "John Doe",
          dueDate: "Next Friday",
          status: "pending"
        },
        {
          description: "Schedule team meeting",
          owner: "Jane Smith",
          dueDate: "This week",
          status: "pending"
        }
      ]
    }
    
    return mockData
  }
}

/**
 * Enhance a note with AI suggestions
 * @param {string} content - The note content
 * @param {boolean} isPro - Whether the user has a pro subscription
 * @returns {Object} - The enhanced note with suggestions, tags, and action items
 */
export const enhanceNote = async (content, isPro = false) => {
  // Check if user has access to this feature
  if (!isPro && !import.meta.env.DEV) {
    return {
      error: "AI enhancement is a Pro feature. Please upgrade to access this feature."
    }
  }

  // Check cache first
  const cacheKey = `enhance-${content.substring(0, 100)}`
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey)
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-3-haiku-20240307',
      messages: [
        {
          role: 'system',
          content: `You are a helpful writing assistant. Analyze the given note content and provide:
1. Suggestions for improvements
2. Potential action items that should be tracked
3. Relevant tags for categorizing the note

Format your response as JSON:
{
  "suggestions": "Your suggestions here",
  "tags": ["tag1", "tag2", "tag3"],
  "actionItems": [
    {
      "description": "Task description",
      "owner": null,
      "dueDate": null
    }
  ]
}`
        },
        {
          role: 'user',
          content: content
        }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" }
    })

    const result = JSON.parse(response.choices[0].message.content)
    
    // Cache the result
    apiCache.set(cacheKey, result)
    
    return result
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return {
      suggestions: "AI assistance temporarily unavailable. Your note has been saved successfully.",
      tags: [],
      actionItems: []
    }
  }
}

/**
 * Process audio transcript using Whisper API
 * @param {File} audioFile - The audio file to transcribe
 * @param {boolean} isPro - Whether the user has a pro subscription
 * @returns {string} - The transcribed text
 */
export const transcribeAudio = async (audioFile, isPro = false) => {
  // Check if user has access to this feature
  if (!isPro && !import.meta.env.DEV) {
    return {
      error: "Audio transcription is a Pro feature. Please upgrade to access this feature."
    }
  }

  try {
    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('model', 'whisper-1')
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: formData
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to transcribe audio')
    }
    
    return data.text
  } catch (error) {
    console.error('Whisper API Error:', error)
    return {
      error: "Failed to transcribe audio. Please try again later."
    }
  }
}

/**
 * Perform semantic search on notes
 * @param {Array} notes - The notes to search
 * @param {string} query - The search query
 * @param {boolean} isPro - Whether the user has a pro subscription
 * @returns {Array} - The search results
 */
export const semanticSearch = async (notes, query, isPro = false) => {
  // Check if user has access to this feature
  if (!isPro && !import.meta.env.DEV) {
    return {
      error: "Semantic search is a Pro feature. Please upgrade to access this feature."
    }
  }

  // For simple implementation, we'll use the OpenAI API to generate embeddings
  // In a production environment, you would use a vector database like Pinecone
  try {
    // Generate embedding for the query
    const queryEmbeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    })
    
    const queryEmbedding = queryEmbeddingResponse.data[0].embedding
    
    // Generate embeddings for each note (in a real app, these would be pre-computed)
    const noteEmbeddings = await Promise.all(
      notes.map(async (note) => {
        const content = `${note.title} ${note.content.replace(/<[^>]*>/g, ' ')}`
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: content.substring(0, 8000), // Limit to 8000 chars
        })
        return {
          note,
          embedding: embeddingResponse.data[0].embedding
        }
      })
    )
    
    // Calculate cosine similarity between query and each note
    const results = noteEmbeddings.map(({ note, embedding }) => {
      const similarity = cosineSimilarity(queryEmbedding, embedding)
      return { note, similarity }
    })
    
    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity)
    
    // Return top results
    return results.slice(0, 10).map(result => result.note)
  } catch (error) {
    console.error('Semantic Search Error:', error)
    
    // Fall back to basic text search
    return notes.filter(note => 
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.content.toLowerCase().includes(query.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} vecA - First vector
 * @param {Array} vecB - Second vector
 * @returns {number} - Cosine similarity (between -1 and 1)
 */
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

/**
 * Clear the API cache
 */
export const clearApiCache = () => {
  apiCache.clear()
}
