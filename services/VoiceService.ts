import * as Speech from 'expo-speech'
import { VOICOCommand } from '@/types/commands'
import { COMMAND_PATTERNS, HESITATION_WORDS } from '@/constants/commands'

type Handler<T> = (data: T) => void
type Unsubscribe = () => void

class VoiceServiceImpl {
  isSpeaking = false

  private commandHandlers: Handler<VOICOCommand>[] = []
  private hesitationHandlers: Handler<string>[] = []
  private speakDoneHandlers: (() => void)[] = []
  private speakStartHandlers: (() => void)[] = []

  onSpeakStart(handler: () => void): Unsubscribe {
    this.speakStartHandlers.push(handler)
    return () => {
      this.speakStartHandlers = this.speakStartHandlers.filter((h) => h !== handler)
    }
  }

  onSpeakDone(handler: () => void): Unsubscribe {
    this.speakDoneHandlers.push(handler)
    return () => {
      this.speakDoneHandlers = this.speakDoneHandlers.filter((h) => h !== handler)
    }
  }

  onCommand(handler: Handler<VOICOCommand>): Unsubscribe {
    this.commandHandlers.push(handler)
    return () => {
      this.commandHandlers = this.commandHandlers.filter((h) => h !== handler)
    }
  }

  onHesitation(handler: Handler<string>): Unsubscribe {
    this.hesitationHandlers.push(handler)
    return () => {
      this.hesitationHandlers = this.hesitationHandlers.filter((h) => h !== handler)
    }
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.isSpeaking = true
      this.speakStartHandlers.forEach((h) => h())
      Speech.speak(text, {
        rate: 0.88,
        pitch: 1.0,
        onDone: () => {
          this.isSpeaking = false
          this.speakDoneHandlers.forEach((h) => h())
          resolve()
        },
        onError: () => {
          this.isSpeaking = false
          this.speakDoneHandlers.forEach((h) => h())
          resolve()
        },
      })
    })
  }

  stopSpeaking() {
    Speech.stop()
    this.isSpeaking = false
  }

  parseCommand(transcript: string): VOICOCommand | null {
    const lower = transcript.toLowerCase().trim()
    for (const [command, patterns] of Object.entries(COMMAND_PATTERNS)) {
      if (patterns.some((p) => lower.includes(p))) {
        return command as VOICOCommand
      }
    }
    return null
  }

  checkHesitation(transcript: string): string | null {
    const lower = transcript.toLowerCase()
    return HESITATION_WORDS.find((w) => lower.includes(w)) ?? null
  }

  // Called by useVoice when STT produces a final result
  handleFinalTranscript(text: string) {
    console.log('[VOICO] final transcript:', text, '| isSpeaking:', this.isSpeaking, '| handlers:', this.commandHandlers.length)
    if (this.isSpeaking) return

    const command = this.parseCommand(text)
    console.log('[VOICO] parsed command:', command)
    if (command) {
      this.commandHandlers.forEach((h) => h(command))
      return
    }

    const hesitation = this.checkHesitation(text)
    if (hesitation) {
      this.hesitationHandlers.forEach((h) => h(hesitation))
    }
  }
}

// Singleton — one instance for the app lifetime
export const VoiceService = new VoiceServiceImpl()
