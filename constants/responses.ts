export const RESPONSES = {
  greeting:
    "I'm VOICO, your AI videographer. Say 'frame me' to check your shot, or 'start studio mode' to begin.",
  compositionChecking: 'Checking your composition.',
  studioModeReady: "Studio Mode ready. Say 'record' when you're ready.",
  recordingStarted: 'Recording.',
  recordingStopped: 'Session ended.',
  mistakeMarked: 'Mistake marked.',
  focusWarning: 'Focus warning.',
  focusRestored: 'Focus restored.',
  batteryWarning: (pct: number) => `Battery at ${pct} percent.`,
  storageWarning: (mins: number) => `Storage remaining: approximately ${mins} minutes.`,
  noFace: "I can't see your face. Please position yourself in frame.",
  compositionImproved: 'Composition improved.',
  notInStudioMode: "Say 'start studio mode' first.",
  notArmed: "Say 'start studio mode' first, then 'record'.",
  hesitation: 'Possible mistake detected.',
}
