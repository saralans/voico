import { useEffect, useRef, useState } from 'react'
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition'
import { VoiceService } from '@/services/VoiceService'

export function useVoice() {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  // Track last interim text so we can process it if session ends without isFinal
  const lastInterimRef = useRef('')
  const gotFinalRef = useRef(false)

  async function start() {
    if (VoiceService.isSpeaking) return
    lastInterimRef.current = ''
    gotFinalRef.current = false
    try {
      await ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        continuous: false,
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
    lastInterimRef.current = text
    if (event.isFinal) {
      gotFinalRef.current = true
      VoiceService.handleFinalTranscript(text)
      setTranscript('')
    }
  })

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false)
    // If session ended without a final result, treat last interim as final
    if (!gotFinalRef.current && lastInterimRef.current && !VoiceService.isSpeaking) {
      VoiceService.handleFinalTranscript(lastInterimRef.current)
      setTranscript('')
    }
    if (!VoiceService.isSpeaking) {
      setTimeout(start, 500)
    }
  })

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false)
    if (event.error !== 'no-speech') console.warn('[VOICO] STT error:', event.error)
    // On no-speech, treat last interim as final before restarting
    if (event.error === 'no-speech' && lastInterimRef.current && !VoiceService.isSpeaking) {
      VoiceService.handleFinalTranscript(lastInterimRef.current)
      setTranscript('')
    }
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

  // Stop STT when TTS starts — prevents mic from picking up speaker output
  useEffect(() => {
    return VoiceService.onSpeakStart(() => {
      ExpoSpeechRecognitionModule.stop()
    })
  }, [])

  // Restart STT after TTS finishes — give audio hardware 800ms to settle
  useEffect(() => {
    return VoiceService.onSpeakDone(() => {
      setTimeout(start, 800)
    })
  }, [])

  return { transcript, isListening }
}
