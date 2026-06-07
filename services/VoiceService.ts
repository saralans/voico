import * as Speech from 'expo-speech'
import { VOICOCommand } from '@/types/commands'
import { COMMAND_PATTERNS, HESITATION_WORDS } from '@/constants/commands'

type Handler<T> = (data: T) => void
type Unsubscribe = () => void

class VoiceServiceImpl {
  isSpeaking = false

  private commandHandlers: Handler<VOICOCommand>[] = []
  private hesitationHandlers: Handler<string>[] = []

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
      Speech.speak(text, {
        rate: 0.88,
        pitch: 1.0,
        onDone: () => {
          this.isSpeaking = false
          resolve()
        },
        onError: () => {
          this.isSpeaking = false
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
    if (this.isSpeaking) return

    const command = this.parseCommand(text)
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
