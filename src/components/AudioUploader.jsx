import React, { useState } from 'react'
import { useSubscription } from '../contexts/SubscriptionContext'
import { Mic, Upload, FileAudio, X, Loader } from 'lucide-react'
import { transcribeAudio } from '../config/openai'
import toast from 'react-hot-toast'

const AudioUploader = ({ onTranscriptGenerated, onClose }) => {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])
  const { hasFeature } = useSubscription()
  
  const canUseAudioFeature = hasFeature('audioTranscription')

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0]
    if (uploadedFile && (uploadedFile.type === 'audio/mp3' || uploadedFile.type === 'audio/wav' || uploadedFile.type === 'audio/mpeg')) {
      setFile(uploadedFile)
    } else {
      toast.error('Please upload an audio file (MP3 or WAV)')
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        const audioFile = new File([blob], 'recording.wav', { type: 'audio/wav' })
        setFile(audioFile)
        setAudioChunks([])
      }
      
      setAudioChunks([])
      setMediaRecorder(recorder)
      recorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast.error('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      // Stop all audio tracks
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
    }
  }

  const handleProcess = async () => {
    if (!file) {
      toast.error('Please upload or record an audio file first')
      return
    }
    
    setIsProcessing(true)
    
    try {
      const transcript = await transcribeAudio(file, canUseAudioFeature)
      
      if (transcript.error) {
        toast.error(transcript.error)
        return
      }
      
      onTranscriptGenerated(transcript)
      toast.success('Audio transcribed successfully!')
      onClose()
    } catch (error) {
      console.error('Error processing audio:', error)
      toast.error('Failed to process audio. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!canUseAudioFeature) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">Audio Transcription</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-center">
          <Mic className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-amber-800 mb-2">Pro Feature</h3>
          <p className="text-amber-700 mb-4">
            Audio transcription is available exclusively for Pro users.
          </p>
          <a
            href="/subscription"
            className="inline-block gradient-bg text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
          >
            Upgrade to Pro
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Audio Transcription</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6">
        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
          <input
            type="file"
            accept="audio/mp3,audio/wav,audio/mpeg"
            onChange={handleFileUpload}
            className="hidden"
            id="audio-upload"
            disabled={isRecording || isProcessing}
          />
          <label htmlFor="audio-upload" className={`cursor-pointer ${(isRecording || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Click to upload an audio file or drag and drop
            </p>
            <p className="text-sm text-gray-500">
              Supports MP3 and WAV files up to 25MB
            </p>
          </label>
        </div>

        {/* Recording Option */}
        <div className="text-center">
          <p className="text-gray-500 mb-4">or record directly</p>
          
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="flex items-center justify-center gap-2 bg-red-100 text-red-700 px-6 py-3 rounded-lg font-medium hover:bg-red-200 transition-colors mx-auto"
            >
              <span className="animate-pulse w-3 h-3 bg-red-600 rounded-full"></span>
              Stop Recording
            </button>
          ) : (
            <button
              onClick={startRecording}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic className="w-5 h-5" />
              Start Recording
            </button>
          )}
        </div>

        {/* Selected File */}
        {file && (
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <FileAudio className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">{file.name}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="ml-auto text-green-600 hover:text-green-800"
              disabled={isProcessing}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Process Button */}
        <div className="flex justify-end">
          <button
            onClick={handleProcess}
            disabled={!file || isProcessing}
            className="flex items-center gap-2 gradient-bg text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Transcribe Audio'
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Your audio will be processed to extract the transcript</li>
          <li>• The transcript will be used to generate a meeting summary</li>
          <li>• Action items will be identified automatically</li>
          <li>• You can edit the transcript and summary before saving</li>
        </ul>
      </div>
    </div>
  )
}

export default AudioUploader

