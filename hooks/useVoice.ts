import { useEffect, useState } from 'react'
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition'
import { VoiceService } from '@/services/VoiceService'

export function useVoice() {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)

  async function start() {
    if (VoiceService.isSpeaking) return
    try {
      await ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        continuous: true,
        interimResults: true,
      })
    } catch (e) {
      console.warn('[VOICO] STT start failed:', e)
    }
  }

  useSpeechRecognitionEvent('start', () => setIsListening(true))

  useSpeechRecognitionEvent('result', (event) => {
    if (VoiceService.isSpeaking) return
    const text = event.results[0]?.transcript ?? ''
    setTranscript(text)
    if (event.isFinal) {
      VoiceService.handleFinalTranscript(text)
      setTranscript('')
    }
  })

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false)
    // Auto-restart for continuous listening, unless VOICO is mid-sentence
    if (!VoiceService.isSpeaking) {
      setTimeout(start, 500)
    }
  })

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false)
    console.warn('[VOICO] STT error:', event.error)
    // Restart on recoverable errors; not-allowed means permission denied
    if (event.error !== 'not-allowed') {
      setTimeout(start, 1000)
    }
  })

  useEffect(() => {
    start()
    return () => {
      ExpoSpeechRecognitionModule.stop()
    }
  }, [])

  return { transcript, isListening }
}
