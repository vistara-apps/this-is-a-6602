# Note Weaver

Weave your scattered notes into a coherent knowledge tapestry with AI.

![Note Weaver Screenshot](docs/images/screenshot.png)

## Overview

Note Weaver is a web application that helps users capture, organize, and synthesize their thoughts and meeting notes using AI, with a focus on meeting summaries and action item extraction.

### Core Features

- **AI Meeting Summarization**: Upload audio or text transcripts of meetings to receive concise, AI-generated summaries highlighting key discussion points and decisions.
- **Action Item Extraction**: Automatically identifies and lists action items, owners, and deadlines mentioned during meetings, extracting them from transcripts or summaries.
- **Intelligent Note Capture**: A rich text editor that allows for flexible note-taking, with AI assistance for auto-formatting, suggesting tags, and identifying potential action items as they are typed.
- **Search and Retrieval**: Robust search functionality that allows users to find specific information within their notes and summaries using keywords, dates, or AI-powered semantic search.

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI API (GPT-4, Whisper)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/note-weaver.git
   cd note-weaver
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_OPENAI_BASE_URL=https://api.openai.com/v1
   ```

4. Set up the database:
   - Create a new Supabase project
   - Run the SQL scripts in `docs/database/schema.sql` to set up the database schema

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
note-weaver/
├── docs/                  # Documentation
│   ├── api/               # API documentation
│   ├── database/          # Database schema and migrations
│   └── images/            # Images for documentation
├── public/                # Static assets
├── src/                   # Source code
│   ├── components/        # React components
│   ├── config/            # Configuration files
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   ├── styles/            # CSS styles
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main App component
│   └── main.jsx           # Entry point
├── .env                   # Environment variables
├── .gitignore             # Git ignore file
├── index.html             # HTML template
├── package.json           # Package configuration
├── README.md              # Project documentation
└── vite.config.js         # Vite configuration
```

## Features

### AI Meeting Summarization

Upload audio or text transcripts of meetings to receive concise, AI-generated summaries highlighting key discussion points and decisions.

- **Text Transcripts**: Upload text files containing meeting transcripts
- **Audio Transcription**: Record or upload audio files for automatic transcription (Pro feature)
- **AI Summary**: Get an AI-generated summary of the meeting
- **Key Points**: Extract key discussion points from the meeting
- **Decisions**: Identify decisions made during the meeting

### Action Item Extraction

Automatically identifies and lists action items, owners, and deadlines mentioned during meetings, extracting them from transcripts or summaries.

- **Action Item Detection**: Automatically detect action items in meeting transcripts
- **Owner Assignment**: Identify who is responsible for each action item
- **Due Date Tracking**: Track when action items are due
- **Status Updates**: Update the status of action items (pending, in progress, completed)

### Intelligent Note Capture

A rich text editor that allows for flexible note-taking, with AI assistance for auto-formatting, suggesting tags, and identifying potential action items as they are typed.

- **Rich Text Editing**: Format your notes with rich text features
- **AI Suggestions**: Get AI-powered suggestions for improving your notes (Pro feature)
- **Tag Recommendations**: Automatically suggest tags for your notes
- **Action Item Identification**: Identify potential action items in your notes

### Search and Retrieval

Robust search functionality that allows users to find specific information within their notes and summaries using keywords, dates, or AI-powered semantic search.

- **Keyword Search**: Search for specific keywords in your notes and meetings
- **Date Filtering**: Filter results by date
- **Tag Filtering**: Filter results by tags
- **Semantic Search**: Find results based on meaning, not just keywords (Pro feature)

## Subscription Plans

### Free Tier

- Up to 3 meeting transcripts
- Basic AI summaries
- Unlimited notes
- Basic search

### Pro Tier ($10/month)

- Unlimited meeting transcripts
- Advanced AI summaries
- Unlimited notes
- Semantic search
- AI note enhancement
- Audio transcript processing
- Priority support

## API Documentation

See the [API documentation](docs/api/README.md) for details on the API endpoints, data models, and authentication.

## Database Schema

See the [database schema](docs/database/schema.sql) for details on the database structure.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenAI](https://openai.com/) for providing the AI models
- [Supabase](https://supabase.io/) for the backend infrastructure
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for the styling
- [Vite](https://vitejs.dev/) for the build tool

