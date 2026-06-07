import { create } from 'zustand'
import { SessionEvent, SessionSummary } from '@/types/session'

export type StudioState =
  | 'idle'
  | 'checklist'
  | 'armed'
  | 'countdown'
  | 'recording'
  | 'stopped'

interface SessionState {
  studioState: StudioState
  recordingStartTime: number | null
  events: SessionEvent[]
  summary: SessionSummary | null
  setStudioState: (s: StudioState) => void
  setRecordingStartTime: (t: number | null) => void
  addEvent: (e: SessionEvent) => void
  setSummary: (s: SessionSummary) => void
  resetSession: () => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  studioState: 'idle',
  recordingStartTime: null,
  events: [],
  summary: null,
  setStudioState: (s) => set({ studioState: s }),
  setRecordingStartTime: (t) => set({ recordingStartTime: t }),
  addEvent: (e) => set((prev) => ({ events: [...prev.events, e] })),
  setSummary: (s) => set({ summary: s }),
  resetSession: () =>
    set({ studioState: 'idle', recordingStartTime: null, events: [], summary: null }),
}))
