import { VOICOCommand } from '@/types/commands'

export const COMMAND_PATTERNS: Record<VOICOCommand, string[]> = {
  [VOICOCommand.COMPOSITION_CHECK]: [
    'frame me', 'check composition', 'how do i look', 'check framing', 'framing',
  ],
  [VOICOCommand.STUDIO_MODE]: [
    'start studio mode', 'studio mode', 'studio',
  ],
  [VOICOCommand.START_RECORDING]: [
    'start recording', 'record', 'action',
  ],
  [VOICOCommand.STOP_RECORDING]: [
    'stop recording', 'stop', 'cut', 'end recording', 'done recording',
  ],
  [VOICOCommand.MARK_MISTAKE]: [
    'mark mistake', 'mark that', 'oops', 'mistake',
  ],
  [VOICOCommand.SAVE_SESSION]: [
    'save video', 'save project', 'save session',
  ],
}

export const HESITATION_WORDS = [
  'um', 'uh', 'wait', 'let me', 'actually', 'sorry',
  'let me restart', 'hold on', 'hang on',
]
