import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
})

export const generateSummary = async (transcript) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
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
    })

    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error('OpenAI API Error:', error)
    // Return mock data for demo
    return {
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
  }
}

export const enhanceNote = async (content) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful writing assistant. Suggest improvements, identify potential action items, and recommend relevant tags for the given note content. Keep suggestions concise and actionable.'
        },
        {
          role: 'user',
          content: content
        }
      ],
      temperature: 0.5,
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return "AI assistance temporarily unavailable. Your note has been saved successfully."
  }
}